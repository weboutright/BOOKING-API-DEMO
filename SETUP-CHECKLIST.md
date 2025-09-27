# ✅ Setup Checklist

Follow this checklist to get your booking system running:

## 📋 Before You Start
- [ ] You have a Google account
- [ ] You have access to Google Calendar
- [ ] You have basic text editing skills

## 🚀 Setup Steps

### 1. Google Apps Script Setup
- [ ] Go to [script.google.com](https://script.google.com)
- [ ] Create a new project
- [ ] Copy code from `simple-appscript.js` into the editor
- [ ] Save the project
- [ ] Deploy as Web App:
  - [ ] Execute as: "Me"
  - [ ] Who has access: "Anyone"
- [ ] Copy the web app URL

### 2. Configuration
- [ ] Open `config.js` in a text editor
- [ ] Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your actual URL
- [ ] Save the file

### 3. Testing
- [ ] Open `simple-index.html` in a web browser
- [ ] Test customer booking (should work for anyone)
- [ ] Test admin access (should only work if you're logged into Google)

### 4. Deployment (Choose One)
- [ ] **GitHub Pages**: Push to GitHub, enable Pages in settings
- [ ] **Local Testing**: Run `python3 -m http.server 8080`
- [ ] **Other Hosting**: Upload files to your web host

## 🎯 Success Indicators

You'll know it's working when:
- [ ] Customers can book appointments via the booking form
- [ ] Bookings appear in your Google Calendar
- [ ] Customers receive email invitations
- [ ] You can access the admin dashboard when logged into Google
- [ ] You can view and delete bookings in the admin panel
- [ ] You can block time slots to prevent bookings

## 🆘 If Something Goes Wrong

1. **Check the browser console** for JavaScript errors
2. **Check Apps Script logs** for backend errors
3. **Verify your API URL** is correct in config.js
4. **Make sure you're logged into Google** for admin access
5. **Check that your Apps Script deployment** has "Anyone" access

## 📞 Need Help?

- Check the main README.md for detailed troubleshooting
- Look at the Apps Script execution logs
- Test the individual functions in Apps Script editor

---

**Estimated setup time: 10-15 minutes**
