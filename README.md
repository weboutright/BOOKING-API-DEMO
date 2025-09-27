## Setup

### ✅ Already Done:
- **Google Apps Script deployed** with URL: `AKfycbxLetqaF39eZPNEhbVOTIMY34goGNknj5G-1b15LSXHRLrOiRR6InFr0fA0R-_gWZu5Nw`
- **HTML files updated** with your deployed URL
- **Calendar ID configured** for `weboutright@gmail.com`

### 🧪 Test Your System:

1. **Start local server:**
   ```bash
   ./run.sh
   ```

2. **Test booking:**
   - Open: `http://localhost:8080/book.html`
   - Fill out the form and submit
   - Check your Google Calendar for the new event
   - Check your email for the calendar invitation

3. **Test admin access:**
   - Open: `http://localhost:8080/admin.html`
   - Must be logged into `weboutright@gmail.com`
   - View events, block/unblock time slots

### 📧 What Happens:
- **Customer books** → Event created in Google Calendar
- **Email invitation sent** automatically to customer
- **Admin can manage** all bookings and blocked slots
- **Only calendar owner** can access admin functions