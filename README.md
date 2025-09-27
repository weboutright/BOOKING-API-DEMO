# 📅 Simple Booking System

A clean, minimal appointment booking system using Google Apps Script and Google Calendar with Google authentication for admin access.

## ✨ Features

- **Professional Calendar View**: Full month calendar showing availability at a glance
- **One-Click Booking**: Click available dates to book instantly
- **Real-time Availability**: See booked, available, and blocked time slots
- **Admin Dashboard**: Manage bookings and block time slots (Google auth required)
- **Google Calendar Integration**: All bookings go directly to your Google Calendar
- **Email Notifications**: Automatic calendar invitations sent to customers
- **Secure Admin Access**: Only calendar owners can access admin functions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 📁 Project Structure

```
├── index.html             # Professional landing page with full calendar view
├── simple-booking.html    # Customer booking form
├── simple-admin.html      # Admin dashboard (requires Google auth)
├── simple-appscript.js    # Google Apps Script backend code
├── config.js             # Configuration file for API URL
└── README.md             # This file
```

## 🚀 Quick Setup Guide

### Step 1: Set up Google Apps Script

1. **Go to Google Apps Script**
   - Visit [script.google.com](https://script.google.com)
   - Sign in with your Google account

2. **Create a New Project**
   - Click "New Project"
   - Give it a name like "Simple Booking System"

3. **Add the Backend Code**
   - Delete the default `myFunction()` code
   - Copy all code from `simple-appscript.js`
   - Paste it into the Apps Script editor
   - Save the project (Ctrl+S or Cmd+S)

4. **Deploy as Web App**
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as the type
   - Set these options:
     - **Execute as**: Me (your Google account)
     - **Who has access**: Anyone
   - Click "Deploy"
   - **Important**: Copy the web app URL (it looks like `https://script.google.com/macros/s/ABC123.../exec`)

### Step 2: Configure Your Website

1. **Update the API URL**
   - Open `config.js`
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your web app URL from Step 1
   
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_URL_HERE/exec';
   ```

2. **Test Your Setup**
   - Open `index.html` in your web browser
   - View the professional calendar interface with availability
   - Click on available dates to book appointments
   - Click "Admin Dashboard" to test admin access (requires Google login)

### Step 3: Deploy Your Website

Choose one of these options:

#### Option A: GitHub Pages (Free)
1. Push your code to a GitHub repository
2. Go to Repository Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://yourusername.github.io/repository-name`

#### Option B: Local Testing
1. Use Python's built-in server:
   ```bash
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in your browser

#### Option C: Other Hosting
Upload all files to any web hosting service (Netlify, Vercel, etc.)

## 🔧 How It Works

### For Customers:
1. Visit your booking page (`simple-booking.html`)
2. Fill out the booking form (name, email, date, time, notes)
3. Submit to create a calendar appointment
4. Receive automatic email invitation

### For Admins:
1. Visit the admin page (`simple-admin.html`)
2. System checks if you're logged into Google and have calendar access
3. If authorized, you can:
   - View all upcoming bookings
   - Delete bookings if needed
   - Block time slots to prevent bookings
   - See who has calendar access

## 🛡️ Security

- **Google OAuth**: Admin access requires being logged into the Google account that owns the calendar
- **No Passwords**: Uses Google's built-in authentication
- **Calendar Permissions**: Only users with calendar access can perform admin actions
- **Public Booking**: Anyone can book appointments, but they can't see existing bookings

## 📞 Support & Troubleshooting

### Common Issues:

**"Connection Failed" Error:**
- Check that your Apps Script is deployed as a web app
- Verify the API URL in `config.js` is correct
- Make sure "Who has access" is set to "Anyone"

**"Admin Access Required" Error:**
- You must be logged into the Google account that owns the calendar
- Check that you have access to the calendar being used

**Bookings Not Appearing:**
- Check your Google Calendar for new events
- Verify the calendar ID in the Apps Script (default is 'primary')
- Check the Apps Script logs for errors

### Getting Help:

1. **Check Apps Script Logs**: Go to your Apps Script project → Executions tab to see error logs
2. **Test Functions**: In Apps Script, try running `testBooking()` or `debugCalendar()` functions
3. **Browser Console**: Open browser developer tools to see any JavaScript errors

## 📝 Customization

### Change Appointment Duration:
In `simple-appscript.js`, find this line and change the value:
```javascript
const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour = 60 minutes
```

### Change Available Time Slots:
In `simple-booking.html`, edit the time options:
```html
<option value="09:00">9:00 AM</option>
<option value="10:00">10:00 AM</option>
<!-- Add or remove time slots here -->
```

### Use Different Calendar:
In `simple-appscript.js`, change the calendar ID:
```javascript
function getCalendarId() {
  return 'your-email@gmail.com'; // or specific calendar ID
}
```

## 🎯 What Makes This Simple

- **No Database Required**: Uses Google Calendar as the data store
- **No Server Setup**: Google Apps Script handles all backend logic
- **No Complex Authentication**: Leverages Google's built-in auth system
- **No Framework Dependencies**: Pure HTML, CSS, and JavaScript
- **Mobile Friendly**: Responsive design works on all devices

## 📋 Files You Need

After setup, you'll only use these files:
- `simple-index.html` - Landing page
- `simple-booking.html` - Customer booking form  
- `simple-admin.html` - Admin dashboard
- `simple-appscript.js` - Backend code (goes in Google Apps Script)
- `config.js` - Configuration file

## 🔄 Updates & Maintenance

To update your system:
1. Make changes to your local files
2. For backend changes: Copy updated code to Google Apps Script and redeploy
3. For frontend changes: Upload updated HTML files to your hosting

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

---

**Made with ❤️ for simple appointment booking**
