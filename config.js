// Simple Booking System Configuration
// Replace this URL with your own Google Apps Script Web App URL
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// Auto-detect environment based on hostname
function getConfig() {
    const hostname = window.location.hostname;
    
    // If running on GitHub Pages or your domain
    if (hostname.includes('github.io') || hostname.includes('yourdomain.com')) {
        return CONFIG.production;
    }
    
    // Default to development for localhost
    return CONFIG.development;
}

// Export the active configuration
const ACTIVE_CONFIG = getConfig();
