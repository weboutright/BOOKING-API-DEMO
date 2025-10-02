/**
 * Service Management Backend for Google Apps Script
 *
 * This script serves the main public Service Page (index.html) and the private
 * Admin Page (admin.html). It uses a Google Sheet as the database for services.
 *
 * SETUP:
 * 1. Create a new Google Sheet named "Service Database".
 * 2. In the first row (A1, B1, C1, D1), enter the headers: Name, Description, Price, Duration.
 * 3. Deploy this script as a Web App (instructions in README.md).
 */

const SHEET_NAME = 'Services';
const HEADERS = ['Name', 'Description', 'Price', 'Duration', 'CustomFields', 'ImageURL', 'Category', 'Features'];
const SPREADSHEET_ID = '1S5YIgld1h5FJTH5wwkSo6wze0mKhFh7A1wJk8868eRE';

/**
 * Main function to handle HTTP GET requests for API calls.
 * @param {object} e - The event object passed by the request.
 * @return {GoogleAppsScript.Content.TextOutput|GoogleAppsScript.HTML.HtmlOutput} The response.
 */
function doGet(e) {
  try {
    console.log('doGet called with parameters:', e.parameter);
    
    // Handle API requests for getting services
    if (e.parameter.action === 'getServices') {
      console.log('Handling getServices request');
      const services = getServices();
      return ContentService.createTextOutput(JSON.stringify(services))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle individual service page requests
    if (e.parameter.service) {
      console.log('Handling service page request for:', e.parameter.service);
      const serviceId = parseInt(e.parameter.service);
      console.log('Parsed service ID:', serviceId, 'Type:', typeof serviceId);
      
      if (isNaN(serviceId)) {
        console.log('Service ID is NaN, serving main page instead');
        return createMainServicePage();
      }
      
      return createServicePage(serviceId);
    }
    
    // Handle test requests
    if (e.parameter.test === 'service') {
      console.log('Test mode: creating service page for first available service');
      const services = getServices();
      if (services.length > 0) {
        return createServicePage(services[0].rowId);
      } else {
        return HtmlService.createHtmlOutput('No services available for testing');
      }
    }
    
    // If no specific action, serve the main service listing page
    console.log('No specific parameters, serving main service page');
    return createMainServicePage();
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>Error</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-red-600 mb-4">Error</h1>
            <p class="text-gray-600 mb-8">${error.message}</p>
            <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-150">
              Try Again
            </a>
          </div>
        </body>
      </html>
    `);
  }
}

/**
 * Handle HTTP POST requests for service operations.
 * @param {object} e - The event object passed by the request.
 * @return {GoogleAppsScript.Content.TextOutput} The response text.
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    let result;
    
    switch (action) {
      case 'addService':
        result = addService({
          name: e.parameter.name,
          description: e.parameter.description,
          price: e.parameter.price,
          duration: e.parameter.duration,
          customFields: e.parameter.customFields || '[]',
          imageURL: e.parameter.imageURL || '',
          category: e.parameter.category || 'General',
          features: e.parameter.features || '[]'
        });
        break;
        
      case 'updateService':
        result = updateService({
          rowId: parseInt(e.parameter.rowId),
          name: e.parameter.name,
          description: e.parameter.description,
          price: e.parameter.price,
          duration: e.parameter.duration,
          customFields: e.parameter.customFields || '[]',
          imageURL: e.parameter.imageURL || '',
          category: e.parameter.category || 'General',
          features: e.parameter.features || '[]'
        });
        break;
        
      case 'deleteService':
        result = deleteService(parseInt(e.parameter.rowId));
        break;
        
      default:
        throw new Error('Unknown action: ' + action);
    }
    
    return ContentService.createTextOutput(result);
    
  } catch (error) {
    return ContentService.createTextOutput('Error: ' + error.message);
  }
}

/**
 * Utility function to get the sheet, creating it if it doesn't exist.
 * It also ensures the header row is present.
 * @return {GoogleAppsScript.Spreadsheet.Sheet} The Service Sheet object.
 */
function getServiceSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Ensure headers are present
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  if (!range.getValues()[0].join('')) {
    range.setValues([HEADERS]);
  }

  return sheet;
}

/**
 * Fetches all services from the Google Sheet.
 * @return {Array<object>} An array of service objects.
 */
function getServices() {
  const sheet = getServiceSheet();
  const rows = sheet.getDataRange().getValues();

  // If there are only headers, return empty array
  if (rows.length <= 1) return [];

  const data = [];
  const headers = rows[0]; // ['Name', 'Description', 'Price', 'Duration']

  // Iterate over data rows (starting from row 2, index 1)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const service = {};
    // Row index + 1 is the 1-based index needed for setRow/deleteRow
    service.rowId = i + 1;
    service.name = row[0];
    service.description = row[1];
    service.price = row[2];
    service.duration = row[3];
    service.customFields = row[4] || '[]'; // Default to empty array if not set
    service.imageURL = row[5] || ''; // Service image
    service.category = row[6] || 'General'; // Service category
    service.features = row[7] || '[]'; // Service features as JSON array
    data.push(service);
  }
  return data;
}

/**
 * Fetches a single service by its row ID.
 * @param {number} serviceId - The row ID of the service.
 * @return {object|null} The service object or null if not found.
 */
function getServiceById(serviceId) {
  try {
    console.log('Fetching service with ID:', serviceId, 'Type:', typeof serviceId);
    
    const services = getServices();
    console.log('Total services found:', services.length);
    console.log('Available service IDs:', services.map(s => s.rowId));
    
    const service = services.find(service => service.rowId === serviceId) || null;
    
    if (!service) {
      console.log('Service not found for ID:', serviceId);
      console.log('Available services:', services.map(s => ({id: s.rowId, name: s.name})));
    } else {
      console.log('Service found:', {id: service.rowId, name: service.name});
    }
    
    return service;
  } catch (error) {
    console.error('Error in getServiceById:', error);
    return null;
  }
}

/**
 * Creates the main service listing page when accessed directly.
 * @return {GoogleAppsScript.HTML.HtmlOutput} The HTML page.
 */
function createMainServicePage() {
  console.log('Creating main service page');
  const services = getServices();
  console.log('Services for main page:', services.length);
  
  let servicesHtml = '';
  if (services.length === 0) {
    servicesHtml = `
      <div class="text-center py-16">
        <h2 class="text-2xl font-bold text-gray-600 mb-4">No Services Available</h2>
        <p class="text-gray-500">Please check back later for available services.</p>
      </div>
    `;
  } else {
    servicesHtml = services.map(service => `
      <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">${service.name}</h3>
          <p class="text-gray-600 mb-4 line-clamp-3">${service.description}</p>
          <div class="flex justify-between items-center mb-4">
            <span class="text-2xl font-bold text-blue-600">${service.price}</span>
            <span class="text-sm text-gray-500">${service.duration}</span>
          </div>
          <div class="flex gap-2">
            <a href="?service=${service.rowId}" class="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150">
              View Details (ID: ${service.rowId})
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Our Services - Main Page</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                background-color: #f8fafc; 
            }
            .line-clamp-3 {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        </style>
    </head>
    <body class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 class="text-3xl font-bold text-gray-900">Our Services</h1>
                <p class="text-gray-600 mt-2">Discover our range of professional services</p>
                <p class="text-sm text-gray-500 mt-1">DEBUG: This is the main service listing page. Total services: ${services.length}</p>
            </div>
        </header>

        <!-- Services Grid -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${servicesHtml}
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8 mt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p>&copy; 2025 Our Services. All rights reserved.</p>
            </div>
        </footer>
    </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(htmlContent)
    .setTitle('Our Services - Main Page')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Creates an HTML page for an individual service.
 * @param {number} serviceId - The row ID of the service.
 * @return {GoogleAppsScript.HTML.HtmlOutput} The HTML page.
 */
function createServicePage(serviceId) {
  console.log('Creating service page for ID:', serviceId);
  
  if (!serviceId || isNaN(serviceId)) {
    console.log('Invalid service ID provided:', serviceId);
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>Invalid Service</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">Invalid Service</h1>
            <p class="text-gray-600 mb-8">The service ID provided is not valid.</p>
            <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-150">
              Back to Services
            </a>
          </div>
        </body>
      </html>
    `);
  }

  const service = getServiceById(serviceId);
  
  if (!service) {
    console.log('Service not found for ID:', serviceId);
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>Service Not Found</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">Service Not Found</h1>
            <p class="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
            <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-150">
              Back to Services
            </a>
          </div>
        </body>
      </html>
    `);
  }

  console.log('Service found:', service.name);

  // Ensure all required fields exist with defaults
  const safeService = {
    name: service.name || 'Unknown Service',
    description: service.description || 'No description available',
    price: service.price || 'Contact for pricing',
    duration: service.duration || 'Duration varies',
    customFields: service.customFields || '[]'
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${safeService.name} - Service Details</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                background-color: #f8fafc; 
            }
            
            .hero-gradient {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .service-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                overflow: hidden;
                transform: translateY(0);
                transition: all 0.3s ease;
            }
            
            .service-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.3);
            }
            
            .price-badge {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                font-weight: 700;
                font-size: 1.25rem;
                display: inline-block;
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            }
            
            .duration-badge {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 25px;
                font-weight: 600;
                font-size: 0.875rem;
                display: inline-block;
            }
            
            .book-button {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 16px 32px;
                border-radius: 50px;
                font-weight: 700;
                font-size: 1.125rem;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
                text-decoration: none;
                display: inline-block;
            }
            
            .book-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
                background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            }
            
            .feature-icon {
                width: 24px;
                height: 24px;
                color: #3b82f6;
            }
            
            /* Booking Modal Styles */
            .booking-modal {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.75);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 50;
                padding: 1rem;
            }
            
            .booking-modal.hidden {
                display: none;
            }
            
            .booking-modal-content {
                background: white;
                border-radius: 20px;
                max-width: 6xl;
                width: 100%;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            
            .booking-container-modal {
                display: grid;
                grid-template-columns: 400px 1fr;
                height: 600px;
            }
            
            .sidebar-modal {
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                padding: 2rem;
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .main-content-modal {
                padding: 2rem;
                background: #f8fafc;
                overflow-y: auto;
            }
            
            @media (max-width: 1024px) {
                .booking-container-modal {
                    grid-template-columns: 1fr;
                    height: auto;
                }
                
                .sidebar-modal {
                    padding: 1.5rem;
                }
                
                .main-content-modal {
                    padding: 1.5rem;
                }
            }
        </style>
    </head>
    <body class="min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-lg sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-gray-900">Our Services</h1>
                    </div>
                    <a href="/" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150">
                        ← Back to All Services
                    </a>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div class="hero-gradient py-20">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-5xl font-extrabold text-white mb-6 leading-tight">
                    ${safeService.name}
                </h1>
                <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Professional service designed to meet your needs with excellence and care.
                </p>
                <div class="flex flex-wrap justify-center gap-4 mb-8">
                    <span class="duration-badge">${safeService.duration}</span>
                    <span class="price-badge">${safeService.price}</span>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <!-- Service Details -->
                <div class="lg:col-span-2">
                    <div class="service-card p-8">
                        <h2 class="text-3xl font-bold text-gray-900 mb-6">Service Description</h2>
                        <div class="prose prose-lg text-gray-700 leading-relaxed">
                            ${safeService.description.split('\n').map(paragraph => 
                                paragraph.trim() ? `<p class="mb-4">${paragraph}</p>` : ''
                            ).join('')}
                        </div>
                        
                        <div class="mt-8 pt-8 border-t border-gray-200">
                            <h3 class="text-2xl font-bold text-gray-900 mb-6">What You Get</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="flex items-start space-x-3">
                                    <svg class="feature-icon mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <div>
                                        <h4 class="font-semibold text-gray-900">Professional Quality</h4>
                                        <p class="text-gray-600">Expert service delivery with attention to detail</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-3">
                                    <svg class="feature-icon mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div>
                                        <h4 class="font-semibold text-gray-900">Scheduled Duration</h4>
                                        <p class="text-gray-600">Approximately ${safeService.duration} of dedicated time</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-3">
                                    <svg class="feature-icon mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div>
                                        <h4 class="font-semibold text-gray-900">Satisfaction Guaranteed</h4>
                                        <p class="text-gray-600">We ensure you're completely satisfied with our service</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start space-x-3">
                                    <svg class="feature-icon mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                    <div>
                                        <h4 class="font-semibold text-gray-900">Support Available</h4>
                                        <p class="text-gray-600">Contact us anytime for questions or support</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Booking Sidebar -->
                <div class="lg:col-span-1">
                    <div class="service-card p-8 sticky top-24">
                        <div class="text-center">
                            <h3 class="text-2xl font-bold text-gray-900 mb-4">Ready to Book?</h3>
                            <p class="text-gray-600 mb-6">Schedule your appointment today and experience our professional service.</p>
                            
                            <div class="mb-6">
                                <div class="price-badge text-2xl">${safeService.price}</div>
                            </div>
                            
                            <button onclick="openBookingPopup('${safeService.name}', '${safeService.price}', '${safeService.duration}', \`${safeService.description.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${(safeService.customFields || '[]').replace(/'/g, "\\'")}'); return false;" 
                                    class="book-button w-full">
                                Book Now
                            </button>
                            
                            <p class="text-sm text-gray-500 mt-4">
                                Secure booking • Instant confirmation • Easy rescheduling
                            </p>
                        </div>
                        
                        <div class="mt-8 pt-8 border-t border-gray-200">
                            <h4 class="font-semibold text-gray-900 mb-4 text-center">Quick Info</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Duration:</span>
                                    <span class="font-medium text-gray-900">${safeService.duration}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Price:</span>
                                    <span class="font-medium text-gray-900">${safeService.price}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Booking:</span>
                                    <span class="font-medium text-green-600">Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Booking Modal -->
        <div id="booking-modal" class="booking-modal hidden">
            <div class="booking-modal-content">
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold text-gray-900">Book ${safeService.name}</h2>
                    <button onclick="closeBookingPopup()" class="text-gray-400 hover:text-gray-600 text-2xl">
                        ×
                    </button>
                </div>
                <div id="booking-content">
                    <!-- Booking form will be loaded here -->
                </div>
            </div>
        </div>

        <script>
            // Booking popup functionality (same as in your index.html)
            function openBookingPopup(serviceName, servicePrice, serviceDuration, serviceDescription, customFields) {
                const modal = document.getElementById('booking-modal');
                const content = document.getElementById('booking-content');
                
                content.innerHTML = createBookingForm(serviceName, servicePrice, serviceDuration, serviceDescription, customFields);
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                
                setTimeout(() => {
                    initializeBookingForm();
                }, 100);
            }

            function closeBookingPopup() {
                const modal = document.getElementById('booking-modal');
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }

            // Include the same booking form creation and initialization functions from index.html
            ${getBookingFormScript()}

            // Close modal when clicking outside
            document.getElementById('booking-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeBookingPopup();
                }
            });
        </script>
    </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(htmlContent)
    .setTitle(safeService.name + ' - Service Details')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Returns the booking form JavaScript code as a string.
 * @return {string} The JavaScript code for booking functionality.
 */
function getBookingFormScript() {
  return `
    function createBookingForm(serviceName, servicePrice, serviceDuration, serviceDescription, customFields) {
        let customFieldsArray = [];
        try {
            customFieldsArray = JSON.parse(customFields || '[]');
        } catch (e) {
            console.error('Error parsing custom fields:', e);
        }
        
        let customFieldsHtml = '';
        if (customFieldsArray.length > 0) {
            customFieldsHtml = '<div class="mb-6"><h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3><div class="grid grid-cols-1 gap-4">';
            
            customFieldsArray.forEach((field, index) => {
                const fieldId = 'custom-field-' + index;
                if (field.type === 'dropdown') {
                    customFieldsHtml += '<div>' +
                        '<label for="' + fieldId + '" class="block text-sm font-medium text-gray-700 mb-2">' + field.label + (field.required ? ' *' : '') + '</label>' +
                        '<select id="' + fieldId + '" name="' + field.name + '" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"' + (field.required ? ' required' : '') + '>' +
                        '<option value="">Select an option</option>' +
                        field.options.map(option => '<option value="' + option + '">' + option + '</option>').join('') +
                        '</select>' +
                        '</div>';
                } else {
                    customFieldsHtml += '<div>' +
                        '<label for="' + fieldId + '" class="block text-sm font-medium text-gray-700 mb-2">' + field.label + (field.required ? ' *' : '') + '</label>' +
                        '<input type="text" id="' + fieldId + '" name="' + field.name + '" placeholder="' + (field.placeholder || '') + '" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"' + (field.required ? ' required' : '') + '>' +
                        '</div>';
                }
            });
            
            customFieldsHtml += '</div></div>';
        }
        
        return '<div class="booking-container-modal">' +
            '<div class="sidebar-modal">' +
                '<div>' +
                    '<h3 class="text-white text-xl font-bold mb-2">' + serviceName + '</h3>' +
                    '<p class="text-blue-100 text-sm mb-6">Professional Service</p>' +
                    '<div class="space-y-3">' +
                        '<div class="flex items-center gap-3 text-white">' +
                            '<svg class="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>' +
                            '</svg>' +
                            '<span>' + serviceDuration + '</span>' +
                        '</div>' +
                        '<div class="flex items-center gap-3 text-white">' +
                            '<svg class="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>' +
                            '</svg>' +
                            '<span>' + servicePrice + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<p class="text-blue-100 text-sm leading-relaxed">' + serviceDescription.substring(0, 200) + '...</p>' +
                '</div>' +
            '</div>' +
            '<div class="main-content-modal">' +
                '<div class="mb-6">' +
                    '<h3 class="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h3>' +
                    '<div class="grid grid-cols-2 gap-4 mb-6">' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700 mb-2">Date</label>' +
                            '<input type="date" id="booking-date-modal" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700 mb-2">Time</label>' +
                            '<select id="booking-time-modal" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">' +
                                '<option value="">Select time</option>' +
                                '<option value="9:00 AM">9:00 AM</option>' +
                                '<option value="10:00 AM">10:00 AM</option>' +
                                '<option value="11:00 AM">11:00 AM</option>' +
                                '<option value="2:00 PM">2:00 PM</option>' +
                                '<option value="3:00 PM">3:00 PM</option>' +
                                '<option value="4:00 PM">4:00 PM</option>' +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<form id="booking-form-modal">' +
                    '<div class="grid grid-cols-2 gap-4 mb-6">' +
                        '<div>' +
                            '<label for="name-modal" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>' +
                            '<input type="text" id="name-modal" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>' +
                        '</div>' +
                        '<div>' +
                            '<label for="email-modal" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>' +
                            '<input type="email" id="email-modal" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>' +
                        '</div>' +
                    '</div>' +
                    customFieldsHtml +
                    '<input type="hidden" id="service-name-modal" value="' + serviceName + '">' +
                    '<input type="hidden" id="service-price-modal" value="' + servicePrice + '">' +
                    '<div id="message-box-modal" class="hidden mb-4"></div>' +
                    '<button type="submit" id="submit-button-modal" class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200">' +
                        'Book Now - ' + servicePrice +
                    '</button>' +
                '</form>' +
            '</div>' +
        '</div>';
    }

    function initializeBookingForm() {
        const form = document.getElementById('booking-form-modal');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                handleBookingSubmission();
            });
        }
    }

    function handleBookingSubmission() {
        const name = document.getElementById('name-modal').value;
        const email = document.getElementById('email-modal').value;
        const date = document.getElementById('booking-date-modal').value;
        const time = document.getElementById('booking-time-modal').value;
        const serviceName = document.getElementById('service-name-modal').value;
        const servicePrice = document.getElementById('service-price-modal').value;
        
        const messageBox = document.getElementById('message-box-modal');
        const submitBtn = document.getElementById('submit-button-modal');
        
        if (!name || !email || !date || !time) {
            showMessage('Please fill in all fields and select a date and time.', true);
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        setTimeout(() => {
            showMessage('Booking confirmed! You will receive a confirmation email at ' + email + '.', false);
            setTimeout(() => {
                closeBookingPopup();
            }, 2000);
        }, 1500);
        
        function showMessage(text, isError) {
            if (messageBox) {
                messageBox.textContent = text;
                messageBox.classList.remove('hidden');
                messageBox.className = 'mb-4 p-3 rounded-lg ' + (isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300');
            }
        }
    }
  `;
}

/**
 * Adds a new service to the Google Sheet.
 * @param {object} serviceData - Contains name, description, price, duration, etc.
 */
function addService(serviceData) {
  const sheet = getServiceSheet();
  // Get values in the order defined by HEADERS: Name, Description, Price, Duration, CustomFields, ImageURL, Category, Features
  const newRow = [
    serviceData.name,
    serviceData.description,
    serviceData.price,
    serviceData.duration,
    serviceData.customFields,
    serviceData.imageURL,
    serviceData.category,
    serviceData.features
  ];
  sheet.appendRow(newRow);
  return 'Service added successfully!';
}

/**
 * Updates an existing service in the Google Sheet.
 * @param {object} serviceData - Contains rowId, name, description, price, duration, etc.
 */
function updateService(serviceData) {
  const sheet = getServiceSheet();
  const rowId = serviceData.rowId;

  // The range starts from column 1 (A) and spans all columns defined in HEADERS
  const range = sheet.getRange(rowId, 1, 1, HEADERS.length);
  const updatedRow = [
    serviceData.name,
    serviceData.description,
    serviceData.price,
    serviceData.duration,
    serviceData.customFields,
    serviceData.imageURL,
    serviceData.category,
    serviceData.features
  ];

  range.setValues([updatedRow]);
  return 'Service updated successfully!';
}

/**
 * Deletes a service row from the Google Sheet.
 * @param {number} rowId - The 1-based row index to delete.
 */
function deleteService(rowId) {
  const sheet = getServiceSheet();
  sheet.deleteRow(rowId);
  return 'Service deleted successfully!';
}

/**
 * Test function to verify service page creation works.
 * Run this in the Apps Script editor to test.
 */
function testServicePage() {
  const services = getServices();
  console.log('Available services:', services);
  
  if (services.length > 0) {
    const firstService = services[0];
    console.log('Testing with first service:', firstService);
    
    const result = createServicePage(firstService.rowId);
    console.log('Service page creation result:', result ? 'Success' : 'Failed');
    
    return result;
  } else {
    console.log('No services available to test with');
    return null;
  }
}

/**
 * Debug function to check service data structure
 */
function debugServices() {
  const services = getServices();
  console.log('=== DEBUG SERVICES ===');
  console.log('Total services:', services.length);
  
  services.forEach((service, index) => {
    console.log(`Service ${index + 1}:`, {
      rowId: service.rowId,
      name: service.name,
      description: service.description?.substring(0, 50) + '...',
      price: service.price,
      duration: service.duration,
      customFields: service.customFields
    });
  });
  
  return services;
}
