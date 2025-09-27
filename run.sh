#!/bin/bash
# Simple server for testing booking system
cd "$(dirname "$0")"
python3 -m http.server 8080
