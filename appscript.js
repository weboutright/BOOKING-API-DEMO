/**
 * SIMPLE BOOKING SYSTEM - Clean Google Apps Script Backend
 * Handles bookings, admin auth, and calendar management
 */

// CONFIGURATION
const CALENDAR_ID = 'd3988770ac40c0a9abd53580d8c6771b324f5cc8a14d888a935a7ea21f7bf0a2@group.calendar.google.com';

// Get calendar
function getCalendar() {
  return CalendarApp.getCalendarById(CALENDAR_ID);
}

// Handle POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'book':
        return bookAppointment(data);
      case 'admin_check':
        return checkAdminAccess();
      case 'get_events':
        return getCalendarEvents(data);
      case 'block_slot':
        return blockTimeSlot(data);
      case 'unblock_slot':
        return unblockTimeSlot(data);
      default:
        return jsonResponse('error', 'Unknown action');
    }
  } catch (error) {
    return jsonResponse('error', error.toString());
  }
}

// Handle GET requests
function doGet(e) {
  return jsonResponse('success', 'Booking API is running');
}

// Book appointment
function bookAppointment(data) {
  const { name, email, date, time, notes } = data;

  if (!name || !email || !date || !time) {
    return jsonResponse('error', 'All fields required');
  }

  try {
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

    if (startTime <= new Date()) {
      return jsonResponse('error', 'Please select a future time');
    }

    const calendar = getCalendar();
    const conflicts = calendar.getEvents(startTime, endTime);

    if (conflicts.length > 0) {
      return jsonResponse('error', 'Time slot not available');
    }

    // Create event
    const eventTitle = `Appointment: ${name}`;
    const description = `Client: ${name}\nEmail: ${email}\n${notes || ''}`;

    const event = calendar.createEvent(eventTitle, startTime, endTime, {
      description: description,
      guests: email,
      sendInvites: true
    });

    return jsonResponse('success', 'Appointment booked! Check your email for confirmation.');

  } catch (error) {
    return jsonResponse('error', 'Booking failed: ' + error.toString());
  }
}

// Check admin access
function checkAdminAccess() {
  try {
    const calendar = getCalendar();
    const userEmail = Session.getActiveUser().getEmail();

    if (!calendar) {
      return jsonResponse('error', 'No calendar access');
    }

    return jsonResponse('success', 'Admin access granted', {
      email: userEmail,
      calendarName: calendar.getName()
    });

  } catch (error) {
    return jsonResponse('error', 'Authentication failed');
  }
}

// Get calendar events
function getCalendarEvents(data) {
  try {
    const calendar = getCalendar();
    const startDate = new Date(data.startDate || new Date());
    const endDate = new Date(data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    const events = calendar.getEvents(startDate, endDate);

    const eventList = events.map(event => ({
      id: event.getId(),
      title: event.getTitle(),
      start: event.getStartTime().toISOString(),
      end: event.getEndTime().toISOString(),
      description: event.getDescription(),
      isBlocked: event.getTitle().startsWith('BLOCKED:')
    }));

    return jsonResponse('success', 'Events retrieved', { events: eventList });

  } catch (error) {
    return jsonResponse('error', 'Failed to get events');
  }
}

// Block time slot (permanent)
function blockTimeSlot(data) {
  const { date, startTime, endTime, reason } = data;

  try {
    const calendar = getCalendar();
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    const title = `BLOCKED: ${reason || 'Unavailable'}`;
    const description = `Blocked by admin: ${reason || 'No reason given'}`;

    calendar.createEvent(title, start, end, { description });

    return jsonResponse('success', 'Time slot blocked');

  } catch (error) {
    return jsonResponse('error', 'Failed to block slot');
  }
}

// Unblock time slot
function unblockTimeSlot(data) {
  const { eventId } = data;

  try {
    const calendar = getCalendar();
    const event = calendar.getEventById(eventId);

    if (event && event.getTitle().startsWith('BLOCKED:')) {
      event.deleteEvent();
      return jsonResponse('success', 'Slot unblocked');
    } else {
      return jsonResponse('error', 'Event not found or not blocked');
    }

  } catch (error) {
    return jsonResponse('error', 'Failed to unblock slot');
  }
}

// Utility function
function jsonResponse(status, message, data = {}) {
  const response = {
    status,
    message,
    timestamp: new Date().toISOString(),
    ...data
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
