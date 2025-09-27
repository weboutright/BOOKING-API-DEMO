// Configuration file - DO NOT commit the production version to GitHub
const CONFIG = {
    // Development configuration (safe to commit)
    development: {
        API_URL: 'https://script.google.com/macros/s/AKfycbzeQduoEzWXTH7yKUs3FUhTCzQwGFu8X27ksMQGh7YM9ZDBN94eGWi0AwinSEU-Lzm9/exec',
        DEBUG: true
    },
    
    // Production configuration (same URL for now)
    production: {
        API_URL: 'https://script.google.com/macros/s/AKfycbzeQduoEzWXTH7yKUs3FUhTCzQwGFu8X27ksMQGh7YM9ZDBN94eGWi0AwinSEU-Lzm9/exec',
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
