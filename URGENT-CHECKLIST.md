# 🚨 URGENT: Apps Script Setup Checklist

## You need to check these items in Google Apps Script RIGHT NOW:

### 1. 🔑 Enable Calendar API
- Go to your Apps Script project: https://script.google.com
- Click "Services" (+ icon) in the left sidebar
- Search for "Google Calendar API" 
- Click "Add"
- **This is the #1 reason calendars don't load**

### 2. 🔐 Authorize the Script
- In Apps Script, select any function from the dropdown (like "checkAdminAuth")
- Click "Run"
- You'll get a permission dialog
- Click "Review permissions" → "Advanced" → "Go to [Your Project Name]" → "Allow"
- **Without this, nothing will work**

### 3. ✅ Verify Calendar ID
Look at the top of your Apps Script code - you should see:
```javascript
const CALENDAR_ID = 'd3988770ac40c0a9abd53580d8c6771b324f5cc8a14d888a935a7ea21f7bf0a2@group.calendar.google.com';
```

### 4. 🚀 Check Deployment Settings
- Click "Deploy" → "Manage deployments"
- Click the pencil icon to edit
- Verify:
  - Type: "Web app"
  - Execute as: "Me ([your email])"
  - Who has access: "Anyone"

### 5. 📋 Test in Apps Script
- Select "checkAdminAuth" function
- Click "Run"
- Check the "Execution log" - should show success, not errors

## What to look for in the logs:

✅ **Good**: "Execution completed"
❌ **Bad**: "Calendar not found" or "Permission denied"
❌ **Bad**: "CalendarApp is not defined"

## Most Common Issues:

1. **Calendar API not added** → Calendar won't load
2. **Not authorized** → Admin access blocked  
3. **Wrong calendar ID** → Empty calendar
4. **Old deployment** → Changes not applied

## Quick Test:
Open this file in your browser: `complete-test.html`
It will show you exactly what's failing.

## If still stuck:
1. Delete your current deployment
2. Add Calendar API service
3. Run a function to authorize
4. Create a brand new deployment
5. Update config.js with the new URL
