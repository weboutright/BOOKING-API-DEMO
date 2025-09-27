# 🔒 Security Guide for GitHub Hosting

## Security Challenges with GitHub Pages

When hosting on GitHub Pages, your frontend code is **publicly visible**. This creates several security concerns:

### ❌ Problems:
- Apps Script Web App URL is visible in source code
- Anyone can potentially abuse your booking API
- Admin functions could be accessed by unauthorized users
- No server-side authentication for static hosting

### ✅ Solutions Implemented:

## 1. **Multi-Layer Security Architecture**

### Frontend Security (GitHub Pages)
```
📁 Your Repository (Public)
├── 📄 booking.html          // Customer booking (public)
├── 🔒 admin-login.html      // Admin login page
├── 🔒 admin.html           // Admin dashboard (protected)
├── ⚙️ config.js            // Environment configuration
└── 📚 README-SECURITY.md   // This guide
```

### Backend Security (Apps Script)
```
🏛️ Google Apps Script (Private)
├── 🛡️ Origin validation
├── ⏰ Rate limiting
├── 🔐 Admin authentication
├── 📝 Request logging
└── 🎛️ Admin mode toggle
```

## 2. **Setup Instructions**

### Step 1: Configure Your Apps Script Security

1. Open your Apps Script project
2. Update the `SECURITY_CONFIG` at the top of the file:

```javascript
const SECURITY_CONFIG = {
  allowedOrigins: [
    'https://yourusername.github.io',     // Your GitHub Pages URL
    'https://your-custom-domain.com',     // Your custom domain
    'http://localhost:3000'               // Local development
  ],
  rateLimitPerMinute: 10,                 // Max 10 requests per minute
  adminActionsEnabled: false,             // Keep disabled by default
  adminPassword: 'your-secure-password-2025' // Change this!
};
```

### Step 2: Configure Frontend Environment

1. Edit `config.js` and add your URLs:

```javascript
const CONFIG = {
    production: {
        API_URL: 'YOUR_REAL_APPS_SCRIPT_URL',
        DEBUG: false
    },
    development: {
        API_URL: 'YOUR_TEST_APPS_SCRIPT_URL', 
        DEBUG: true
    }
};
```

### Step 3: Create .gitignore for Sensitive Files

```gitignore
# Production configuration (create this file)
config.production.js

# Environment files
.env
.env.local
.env.production

# Admin credentials
admin-credentials.txt
```

## 3. **Security Features Implemented**

### 🛡️ Origin Validation
- Requests from unauthorized domains are blocked
- Configure allowed domains in `SECURITY_CONFIG.allowedOrigins`

### ⏰ Rate Limiting
- Prevents API abuse with request limits
- Global rate limiting: 10 requests per minute (configurable)
- Uses Apps Script Properties Service for storage

### 🔐 Admin Authentication
- Admin functions require password authentication
- Password sent with each admin request (over HTTPS)
- Admin mode can be toggled on/off

### 📝 Comprehensive Logging
- All requests are logged (without sensitive data)
- Security events are tracked
- Failed authentication attempts logged

### 🎛️ Admin Mode Toggle
- Admin functions can be completely disabled when not needed
- Enable only when you need to manage bookings
- Automatic disable recommended

## 4. **Best Practices for Production**

### 🔒 Secure Your Admin Password
```javascript
// ❌ Bad: Weak password
adminPassword: 'admin123'

// ✅ Good: Strong password
adminPassword: 'SecureBooking2025!@#$%^&*'
```

### 🌐 Use Environment-Specific URLs
```javascript
// ❌ Bad: Same URL for dev and prod
API_URL: 'https://script.google.com/macros/s/ABC123/exec'

// ✅ Good: Different URLs for different environments
development: { API_URL: 'https://script.google.com/.../dev' },
production: { API_URL: 'https://script.google.com/.../prod' }
```

### 🔐 Enable Admin Mode Only When Needed
```javascript
// In Apps Script console, run when you need admin access:
setAdminMode(true);   // Enable admin functions

// After you're done managing:
setAdminMode(false);  // Disable admin functions
```

## 5. **Advanced Security Options**

### Option A: Server-Side Proxy (Recommended for High Security)

If you need maximum security, consider using a server-side proxy:

```
🌐 Customer → 🖥️ Your Server → 🏛️ Apps Script
                    ↑
               (Hides real API URL)
```

### Option B: Subdomain for Admin

Host admin interface on a separate subdomain:
- `booking.yourdomain.com` - Customer booking
- `admin.yourdomain.com` - Admin interface (password protected)

### Option C: IP Whitelisting

Configure Apps Script to only accept requests from specific IPs:

```javascript
const ALLOWED_IPS = ['123.456.789.012']; // Your office IP
```

## 6. **Monitoring & Maintenance**

### Regular Security Checks:
1. **Monitor Apps Script Logs** - Check for suspicious activity
2. **Update Passwords Regularly** - Change admin password monthly
3. **Review Access Logs** - Look for unauthorized access attempts
4. **Keep Allowed Origins Updated** - Remove unused domains

### Security Alerts to Watch For:
- Multiple failed authentication attempts
- Requests from unknown origins
- High request volumes from single source
- Error spikes in logs

## 7. **Emergency Procedures**

### If You Suspect a Security Breach:

1. **Immediately disable admin functions:**
   ```javascript
   setAdminMode(false);
   ```

2. **Change admin password in Apps Script**

3. **Check Apps Script logs for suspicious activity**

4. **Review recent bookings for anything unusual**

5. **Consider temporarily disabling the booking system**

### Recovery Steps:
1. Update security configuration
2. Deploy new version of Apps Script
3. Update frontend configuration
4. Test all security measures
5. Re-enable admin functions when needed

## 8. **Security Checklist**

Before going live, ensure:

- [ ] Strong admin password set
- [ ] Allowed origins configured correctly
- [ ] Rate limiting enabled
- [ ] Admin mode disabled by default
- [ ] All sensitive URLs in config files
- [ ] Apps Script deployed with latest security code
- [ ] Frontend tested from actual GitHub Pages URL
- [ ] Admin login tested and working
- [ ] Monitoring and logging verified

## 9. **Additional Recommendations**

### For Production Use:
1. **Custom Domain** - Use your own domain instead of github.io
2. **HTTPS Everywhere** - Ensure all connections are encrypted
3. **Regular Backups** - Export booking data regularly
4. **Access Logs** - Monitor who's accessing your system
5. **Security Updates** - Keep dependencies updated

### For High-Volume Sites:
1. **CDN Protection** - Use Cloudflare or similar
2. **DDoS Protection** - Implement additional rate limiting
3. **Professional Hosting** - Consider dedicated hosting for admin
4. **Database Security** - Use proper database instead of Properties Service

This security model provides robust protection while maintaining usability for GitHub Pages hosting.
