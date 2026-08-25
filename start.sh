#!/bin/bash
# SpotIt Mobile - Start Script
# Run this in Terminal 2

cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   SpotIt Mobile (Expo)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if backend is running
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Backend is running on port 8000${NC}"
else
    echo -e "  ${RED}✗ Backend not detected on port 8000${NC}"
    echo -e "  ${YELLOW}Start it first: cd ../SpotIt && ./start.sh${NC}"
fi

echo ""
echo -e "  API Base:  ${YELLOW}http://${LOCAL_IP}:8000/api${NC}"
echo ""
echo -e "  ${GREEN}USB Cable (Android):${NC}"
echo -e "    1. Enable Developer Options + USB Debugging on phone"
echo -e "    2. Connect phone via USB"
echo -e "    3. Press ${YELLOW}a${NC} in the menu below to run on device"
echo ""
echo -e "  ${GREEN}WiFi (Expo Go):${NC}"
echo -e "    Scan the QR code below with Expo Go app"
echo -e "    Phone and laptop must be on same WiFi"
echo ""
echo -e "  ${YELLOW}Commands:${NC}"
echo -e "    ${YELLOW}a${NC} = Run on Android device (USB)"
echo -e "    ${YELLOW}i${NC} = Run on iOS simulator"
echo -e "    ${YELLOW}s${NC} = Switch to Expo Go (WiFi)"
echo ""

npx expo start
