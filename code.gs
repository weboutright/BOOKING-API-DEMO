// Google Apps Script for Custom Booking System
// This script handles calendar operations and serves as the backend API

const CALENDAR_ID = '6fbd3ad40e7d197c289a9e89ef0267953b5f87ea6bb27ded920168f359299098@group.calendar.google.com'; // Custom booking calendar
const ADMIN_EMAIL = 'weboutright@gmail.com'; // Admin email for authentication
const BOOKING_DURATION = 60; // Duration in minutes for each booking slot

/**
 * Web app entry point - handles GET and POST requests
 */
function doGet(e) {
  // Log all parameters for debugging
  Logger.log('doGet called with parameters: ' + JSON.stringify(e.parameter));
  
  const action = e.parameter.action;
  Logger.log('Action received: ' + action);
  
  switch(action) {
    case 'getAvailability':
      return getAvailableSlots(e.parameter.date);
    case 'getAllBookings':
      return getAllBookings();
    case 'test':
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Google Apps Script is working!',
        timestamp: new Date().toISOString(),
        calendarId: CALENDAR_ID
      })).setMimeType(ContentService.MimeType.JSON);
    default:
      Logger.log('Invalid action received. Available actions: getAvailability, getAllBookings');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action: ' + action,
        availableActions: ['getAvailability', 'getAllBookings'],
        receivedParams: e.parameter
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'createBooking':
        return createBooking(data);
      case 'createAdminBlock':
        return createAdminBlock(data);
      case 'deleteBooking':
        return deleteBooking(data);
      default:
        return createErrorResponse('Invalid action');
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createErrorResponse('Server error: ' + error.toString());
  }
}

/**
 * Get available time slots for a specific date
 */
function getAvailableSlots(dateString) {
  try {
    if (!dateString) {
      return createErrorResponse('Date parameter is required');
    }
    
    Logger.log('Getting availability for date: ' + dateString);
    const targetDate = new Date(dateString);
    Logger.log('Parsed target date: ' + targetDate);
    
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    Logger.log('Calendar found: ' + calendar.getName());
    
    // Get events for the entire day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const events = calendar.getEvents(startOfDay, endOfDay);
    Logger.log('Found ' + events.length + ' events for the day');
    
    // Log existing events for debugging
    events.forEach((event, index) => {
      Logger.log(`Event ${index + 1}: ${event.getTitle()} from ${event.getStartTime()} to ${event.getEndTime()}`);
    });
    
    // Generate business hours (9 AM to 5 PM in 1-hour slots)
    const availableSlots = [];
    const unavailableSlots = [];
    
    for (let hour = 9; hour < 17; hour++) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(targetDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      const isAvailable = !events.some(event => {
        const eventStart = event.getStartTime();
        const eventEnd = event.getEndTime();
        const overlap = (slotStart < eventEnd && slotEnd > eventStart);
        if (overlap) {
          Logger.log(`Slot ${hour}:00 blocked by event: ${event.getTitle()}`);
        }
        return overlap;
      });
      
      const slotInfo = {
        time: formatTime(slotStart),
        value: slotStart.toISOString(),
        available: isAvailable
      };
      
      if (isAvailable) {
        availableSlots.push(slotInfo);
      } else {
        unavailableSlots.push(slotInfo);
      }
    }
    
    Logger.log(`Result: ${availableSlots.length} available, ${unavailableSlots.length} unavailable slots`);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        availableSlots: availableSlots,
        unavailableSlots: unavailableSlots,
        debug: {
          date: dateString,
          parsedDate: targetDate.toString(),
          totalEvents: events.length,
          calendarName: calendar.getName()
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error getting available slots: ' + error.toString());
    return createErrorResponse('Failed to get availability: ' + error.toString());
  }
}

/**
 * Create a new booking
 */
function createBooking(data) {
  try {
    const { datetime, clientName, clientEmail, clientPhone, notes } = data;
    
    if (!datetime || !clientName || !clientEmail) {
      return createErrorResponse('Missing required fields');
    }
    
    const startTime = new Date(datetime);
    const endTime = new Date(startTime.getTime() + (BOOKING_DURATION * 60000));
    
    // Anti-double-booking check
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const existingEvents = calendar.getEvents(startTime, endTime);
    
    if (existingEvents.length > 0) {
      return createErrorResponse('This time slot is no longer available');
    }
    
    // Create the event
    const eventTitle = `Booking: ${clientName}`;
    const eventDescription = `
Client: ${clientName}
Email: ${clientEmail}
Phone: ${clientPhone || 'Not provided'}
Notes: ${notes || 'None'}
    `.trim();
    
    const event = calendar.createEvent(eventTitle, startTime, endTime, {
      description: eventDescription,
      guests: clientEmail,
      sendInvites: true
    });
    
    Logger.log('Booking created: ' + event.getId());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Booking created successfully',
        eventId: event.getId()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error creating booking: ' + error.toString());
    return createErrorResponse('Failed to create booking: ' + error.toString());
  }
}

/**
 * Create admin block (for admin use only)
 */
function createAdminBlock(data) {
  try {
    // Verify admin access
    if (!isAdminUser()) {
      return createErrorResponse('Access denied');
    }
    
    const { datetime, duration, title, description } = data;
    
    if (!datetime) {
      return createErrorResponse('Date and time are required');
    }
    
    const startTime = new Date(datetime);
    const blockDuration = duration || BOOKING_DURATION;
    const endTime = new Date(startTime.getTime() + (blockDuration * 60000));
    
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const eventTitle = title || 'Admin Block';
    const eventDescription = description || 'Time blocked by admin';
    
    const event = calendar.createEvent(eventTitle, startTime, endTime, {
      description: eventDescription
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Time block created successfully',
        eventId: event.getId()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error creating admin block: ' + error.toString());
    return createErrorResponse('Failed to create time block: ' + error.toString());
  }
}

/**
 * Get all bookings (admin only)
 */
function getAllBookings() {
  try {
    if (!isAdminUser()) {
      return createErrorResponse('Access denied');
    }
    
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const now = new Date();
    const futureDate = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days from now
    
    const events = calendar.getEvents(now, futureDate);
    
    const bookings = events.map(event => ({
      id: event.getId(),
      title: event.getTitle(),
      start: event.getStartTime().toISOString(),
      end: event.getEndTime().toISOString(),
      description: event.getDescription(),
      location: event.getLocation()
    }));
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        bookings: bookings
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error getting bookings: ' + error.toString());
    return createErrorResponse('Failed to get bookings: ' + error.toString());
  }
}

/**
 * Delete a booking (admin only)
 */
function deleteBooking(data) {
  try {
    if (!isAdminUser()) {
      return createErrorResponse('Access denied');
    }
    
    const { eventId } = data;
    if (!eventId) {
      return createErrorResponse('Event ID is required');
    }
    
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const event = calendar.getEventById(eventId);
    
    if (!event) {
      return createErrorResponse('Event not found');
    }
    
    event.deleteEvent();
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Booking deleted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error deleting booking: ' + error.toString());
    return createErrorResponse('Failed to delete booking: ' + error.toString());
  }
}

/**
 * Check if current user is admin
 */
function isAdminUser() {
  const userEmail = Session.getActiveUser().getEmail();
  return userEmail === ADMIN_EMAIL;
}

/**
 * Helper function to format time
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Helper function to create error responses
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: message
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Add CORS headers for modern browser compatibility
 */
function addCorsHeaders(output) {
  // For Google Apps Script, we don't need to manually set CORS headers
  // They are handled automatically when deployed as a web app
  return output;
}

/**
 * Test function to verify calendar access
 */
function testCalendarAccess() {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    Logger.log('Calendar name: ' + calendar.getName());
    Logger.log('Calendar ID: ' + calendar.getId());
    return 'Calendar access successful';
  } catch (error) {
    Logger.log('Calendar access error: ' + error.toString());
    return 'Calendar access failed: ' + error.toString();
  }
}

/**
 * Test function to get tomorrow's availability
 */
function testTomorrowAvailability() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split('T')[0];
  Logger.log('Testing availability for tomorrow: ' + dateString);
  
  return getAvailableSlots(dateString);
}

/**
 * Test function to create a simple event (this will help authorize calendar access)
 */
function testCreateEvent() {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    Logger.log('Calendar found: ' + calendar.getName());
    
    // Create a test event for tomorrow at 2 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM
    
    const endTime = new Date(tomorrow.getTime() + (60 * 60 * 1000)); // 1 hour later
    
    const event = calendar.createEvent('Test Event - Safe to Delete', tomorrow, endTime, {
      description: 'This is a test event created by the booking system. You can delete this.'
    });
    
    Logger.log('Test event created successfully: ' + event.getId());
    return 'Test event created successfully';
  } catch (error) {
    Logger.log('Error creating test event: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}