#!/bin/bash
echo "🚀 Starting Booking System Server..."
echo ""
echo "📁 Project Location: $(pwd)"
echo "🌐 Server URL: http://localhost:8080"
echo ""
echo "📋 Available Pages:"
echo "   • Main Calendar: http://localhost:8080/index.html"
echo "   • Admin Panel:   http://localhost:8080/simple-admin.html"
echo "   • Book Appt:     http://localhost:8080/simple-booking.html"
echo ""
echo "🔧 To stop server: Press Ctrl+C"
echo "==============================================="
echo ""

cd /home/harrison/Documents/GitHub/BOOKING-API-DEMO
python3 -m http.server 8080
