# 🚨 TROUBLESHOOTING CHECKLIST

## Quick Diagnostic Steps

### 1. Check Your Apps Script Setup

**In Google Apps Script (script.google.com):**

✅ **Calendar ID Updated:**
- Open your Apps Script project
- Look at the top of the code for: `const CALENDAR_ID = 'd3988770ac4...'`
- Make sure it matches your calendar ID exactly

✅ **Calendar API Enabled:**
- In Apps Script, click "Services" (+ icon) on the left
- You should see "Google Calendar API" listed
- If not, add it by searching "Google Calendar API" and clicking "Add"

✅ **Authorization Completed:**
- In Apps Script, click any function dropdown and select "checkAdminAuth"
- Click "Run" - you should be prompted to authorize
- Click "Review permissions" → "Advanced" → "Go to [Your Project]" → "Allow"

✅ **Deployed as Web App:**
- Click "Deploy" → "New deployment" (not "Manage deployments")
- Type: "Web app"
- Execute as: "Me"
- Who has access: "Anyone"
- Click "Deploy" and copy the new URL

### 2. Check Your Frontend Setup

✅ **Config.js URL:**
- Open `config.js`
- Make sure the URL matches your Apps Script deployment URL exactly
- Should end with `/exec`

✅ **File Structure:**
```
├── index.html
├── simple-booking.html  
├── simple-admin.html
├── simple-appscript.js
├── config.js
└── debug-connection.html (for testing)
```

### 3. Test Connection

✅ **Open debug-connection.html:**
- Should show your API URL
- Should show connection test results
- Green ✅ = working, Red ❌ = problem

### 4. Common Error Solutions

**"Calendar not accessible" or "Calendar Access Denied":**
- Your calendar ID is wrong OR
- Calendar API not enabled OR  
- Not authorized in Apps Script

**"Connection Failed" or CORS errors:**
- Apps Script not deployed as web app OR
- Wrong URL in config.js OR
- "Who has access" not set to "Anyone"

**Admin page stuck on "checking your calendar access":**
- Apps Script missing 'checkAuth' action OR
- Not logged into the right Google account OR
- Calendar permissions not granted

**Page loads but calendar is empty:**
- Backend working but calendar ID is wrong OR
- No events in the date range being requested

### 5. Step-by-Step Fix

If nothing works, try this in order:

1. **Delete your current Apps Script deployment**
2. **Copy the LATEST simple-appscript.js code** (with your calendar ID)
3. **Enable Calendar API service**  
4. **Run a function to authorize**
5. **Create a NEW deployment** (don't reuse old ones)
6. **Update config.js** with the new URL
7. **Test with debug-connection.html**

### 6. Get More Help

**Check Apps Script Logs:**
- In Apps Script → "Executions" tab
- Look for error messages in red

**Check Browser Console:**
- Press F12 → "Console" tab
- Look for JavaScript errors

**Test Individual Components:**
- `debug-connection.html` - Tests backend connection
- `test-auth.html` - Tests admin authentication
- `index.html` - Main calendar page

## Most Common Issue: Calendar ID

The #1 problem is usually the calendar ID. Make sure:
- It's the EXACT ID from Google Calendar settings
- It's in the CALENDAR_ID constant at the top of simple-appscript.js
- You created a NEW deployment after updating the code

## Contact Info

If you're still stuck, please share:
1. What error messages you see
2. What happens when you open debug-connection.html
3. Whether you can see your calendar ID in simple-appscript.js
