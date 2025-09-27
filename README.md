# 🗓️ Booking System Setup Guide

This comprehensive booking system includes a polished frontend and a powerful CMS for managing your appointments.

## 📁 Files Overview

- `booking.html` - Modern, Calendly-style booking form for customers
- `admin.html` - Comprehensive CMS dashboard for managing bookings
- `appscript_clean.js` - Enhanced Google Apps Script backend
- `index.html` - Original booking form (you can keep or replace with booking.html)

## 🚀 Quick Setup Steps

### 1. Deploy the Apps Script Backend

1. **Open Google Apps Script**: Go to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Replace Code**: Delete the default code and paste the entire content from `appscript_clean.js`
4. **Save**: Click the save icon and name your project (e.g., "Booking System")
5. **Deploy as Web App**:
   - Click "Deploy" → "New Deployment"
   - Choose "Web app" as the type
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the Web App URL (you'll need this for step 2)

### 2. Configure the Frontend Files

1. **Update API URLs**: In both `booking.html` and `admin.html`, find this line:
   ```javascript
   API_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',
   ```
   Replace with your actual Web App URL from step 1.

2. **Upload Files**: Upload both HTML files to your web hosting or serve them locally.

### 3. Customize Settings (Optional)

In the Apps Script editor, you can modify:

- **Calendar ID**: In the `getCalendarId()` function, change `'primary'` to your specific calendar ID if needed
- **Business Hours**: The default available times are 9 AM to 4 PM
- **Appointment Duration**: Default is 60 minutes

## 🎨 Features

### Customer Booking Interface (booking.html)
- ✅ Beautiful, responsive design inspired by Calendly
- ✅ Multi-step booking process with progress indicator
- ✅ Interactive calendar with date selection
- ✅ Real-time availability checking
- ✅ Form validation and error handling
- ✅ Success confirmation with booking details
- ✅ Mobile-friendly design

### Admin CMS Dashboard (admin.html)
- 📊 **Dashboard**: View booking statistics and recent activity
- 📅 **Calendar Management**: Block dates/times, view blocked slots
- ⚙️ **Settings**: Configure business hours, working days, appointment duration
- 📋 **Bookings**: View, filter, and manage all appointments
- 🔧 **Calendar Integration**: Test connection and manage calendar settings

### Backend Features (appscript_clean.js)
- 🔒 Enhanced security with input validation
- 🚫 Time slot blocking system for admin
- 💾 Settings storage using Google Apps Script Properties
- 📧 Automatic email invitations
- 🔍 Availability checking (both calendar events and blocked slots)
- 📝 Comprehensive logging for debugging
- 🧪 Built-in test functions

## 🛠️ Advanced Configuration

### Custom Business Rules

You can customize the booking rules in the Apps Script:

```javascript
// In the processBooking function, modify these checks:

// Prevent bookings too far in advance
const maxAdvanceDays = 30; // Allow bookings up to 30 days ahead

// Minimum notice required
const minNoticeHours = 2; // Require at least 2 hours notice

// Working days (modify in CMS settings or here)
const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
```

### Adding Custom Time Slots

In the `loadAvailableTimes()` function in your HTML files, customize the available times:

```javascript
// Example: 30-minute intervals from 9 AM to 5 PM
this.availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
];
```

## 🎨 Customization Options

### Styling
- Colors: Modify the CSS custom properties in the `<style>` sections
- Fonts: Change the Google Fonts import to use your preferred font
- Layout: Adjust the Tailwind classes for different layouts

### Branding
- Update page titles and headers
- Replace placeholder text with your business information
- Add your logo by modifying the header sections

## 🧪 Testing

### Test the Backend
In the Apps Script editor, run these functions to test:

```javascript
testBooking()     // Test booking logic
testDoPost()      // Test complete request flow
debugCalendar()   // Test calendar access
testCMSFunctions() // Test admin functions
```

### Test the Frontend
1. Open the booking form in a browser
2. Try booking an appointment
3. Access the admin dashboard
4. Test blocking time slots

## 📱 Mobile Optimization

Both interfaces are fully responsive and work great on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones

## 🔒 Security Features

- Input validation on both client and server
- CORS handling for cross-origin requests
- Sanitized error messages
- Protected admin functions

## 🆘 Troubleshooting

### Common Issues:

1. **"API URL not found"**: Make sure you've updated the API_URL in your HTML files
2. **"Calendar not found"**: Check your calendar ID in the `getCalendarId()` function
3. **No available times**: Ensure your calendar is accessible and not fully booked
4. **Permission errors**: Make sure the Apps Script has calendar access permissions

### Debug Mode:
Check the Apps Script logs (View → Logs) for detailed error information.

## 🚀 Go Live!

Once everything is configured and tested:

1. Upload your HTML files to your web hosting
2. Share the booking link with your customers
3. Use the admin dashboard to manage your appointments
4. Monitor the Apps Script logs for any issues

## 🎉 You're All Set!

Your professional booking system is now ready to use. Customers can book appointments through the beautiful interface, and you can manage everything through the powerful admin dashboard.

Need help? Check the Apps Script logs or test the individual functions to diagnose any issues.
