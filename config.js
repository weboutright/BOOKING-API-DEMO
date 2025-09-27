// Configuration file - DO NOT commit the production version to GitHub
const CONFIG = {
    // Development configuration (safe to commit)
    development: {
        API_URL: 'YOUR_DEVELOPMENT_APPS_SCRIPT_URL_HERE',
        DEBUG: true
    },
    
    // Production configuration (DO NOT commit real URL)
    production: {
        API_URL: 'YOUR_PRODUCTION_APPS_SCRIPT_URL_HERE',
        DEBUG: false
    }
};

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
