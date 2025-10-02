#!/usr/bin/env node

/**
 * Service Page Generator
 * This script fetches services from the Google Apps Script API and generates 
 * individual HTML pages for each service to be hosted on GitHub.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzRYZ07fenMc94SYSDalTXfFhnWsOPywUXlFD6UOo82OVTf08cU5WCoLigqWF3Ku8V/exec';
const SERVICES_DIR = './services';
const TEMPLATE_FILE = path.join(SERVICES_DIR, 'service-template.html');

/**
 * Fetch services from the Google Apps Script API
 */
function fetchServices() {
    return new Promise((resolve, reject) => {
        const url = `${SCRIPT_URL}?action=getServices&timestamp=${Date.now()}`;
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const services = JSON.parse(data);
                    resolve(services);
                } catch (error) {
                    reject(new Error('Failed to parse services JSON: ' + error.message));
                }
            });
        }).on('error', (error) => {
            reject(new Error('Failed to fetch services: ' + error.message));
        });
    });
}

/**
 * Read the service template HTML
 */
function readTemplate() {
    try {
        return fs.readFileSync(TEMPLATE_FILE, 'utf8');
    } catch (error) {
        throw new Error('Failed to read template file: ' + error.message);
    }
}

/**
 * Generate HTML content for a specific service
 */
function generateServiceHTML(service, template) {
    let html = template;
    
    // Replace placeholder content with actual service data
    // Note: The template uses JavaScript to load data dynamically,
    // so we just need to ensure the service ID is available in the URL
    
    return html;
}

/**
 * Generate individual service pages
 */
async function generateServicePages() {
    try {
        console.log('🚀 Starting service page generation...');
        
        // Ensure services directory exists
        if (!fs.existsSync(SERVICES_DIR)) {
            fs.mkdirSync(SERVICES_DIR, { recursive: true });
            console.log('📁 Created services directory');
        }
        
        // Fetch services from API
        console.log('📡 Fetching services from API...');
        const services = await fetchServices();
        console.log(`✅ Found ${services.length} services`);
        
        // Read template
        console.log('📄 Reading template file...');
        const template = readTemplate();
        console.log('✅ Template loaded successfully');
        
        // Generate pages for each service
        console.log('🔨 Generating service pages...');
        const generatedFiles = [];
        
        for (const service of services) {
            const fileName = `service-${service.rowId}.html`;
            const filePath = path.join(SERVICES_DIR, fileName);
            const html = generateServiceHTML(service, template);
            
            fs.writeFileSync(filePath, html, 'utf8');
            generatedFiles.push(fileName);
            
            console.log(`  ✅ Generated: ${fileName} (${service.name})`);
        }
        
        // Generate index file for services directory
        const indexContent = generateServicesIndex(services);
        fs.writeFileSync(path.join(SERVICES_DIR, 'index.html'), indexContent, 'utf8');
        console.log('  ✅ Generated: index.html (services directory index)');
        
        console.log(`\n🎉 Successfully generated ${generatedFiles.length} service pages!`);
        console.log('\nGenerated files:');
        generatedFiles.forEach(file => console.log(`  - services/${file}`));
        console.log(`  - services/index.html`);
        
        console.log('\n📝 Next steps:');
        console.log('1. Commit and push these files to your GitHub repository');
        console.log('2. Each service will be accessible at: https://weboutright.github.io/BOOKING-API-DEMO/services/service-[ID].html');
        console.log('3. The main index.html already links to these pages');
        
    } catch (error) {
        console.error('❌ Error generating service pages:', error.message);
        process.exit(1);
    }
}

/**
 * Generate an index page for the services directory
 */
function generateServicesIndex(services) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Services Directory - WagingSillydog</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #0a0a0a; color: #ffffff; font-family: 'Inter', sans-serif; }
        .service-link { 
            display: block; 
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border: 1px solid #333333;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            text-decoration: none;
            color: #ffffff;
            transition: all 0.3s ease;
        }
        .service-link:hover {
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
        }
    </style>
</head>
<body class="min-h-screen">
    <div class="max-w-4xl mx-auto p-8">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold mb-4">Services Directory</h1>
            <p class="text-gray-400 text-lg">Individual service pages hosted on GitHub</p>
            <a href="../index.html" class="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200">
                ← Back to Main Site
            </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${services.map(service => `
                <a href="service-${service.rowId}.html" class="service-link">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold">${service.name}</h3>
                        <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">${service.price}</span>
                    </div>
                    <p class="text-gray-400 text-sm mb-2">${service.category || 'General'} • ${service.duration}</p>
                    <p class="text-gray-300 text-sm line-clamp-2">${service.description.substring(0, 100)}${service.description.length > 100 ? '...' : ''}</p>
                </a>
            `).join('')}
        </div>
        
        <div class="text-center mt-12 text-gray-500">
            <p>Generated on ${new Date().toLocaleDateString()} • ${services.length} services</p>
        </div>
    </div>
</body>
</html>`;
}

// Run the generator
if (require.main === module) {
    generateServicePages();
}

module.exports = { generateServicePages, fetchServices };
