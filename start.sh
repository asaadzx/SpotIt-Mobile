#!/bin/bash
# SpotIt Mobile - Start Script
# Run this in Terminal 2

cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   SpotIt Mobile (Expo)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Update ${YELLOW}constants/config.js${NC} with IP: ${YELLOW}${LOCAL_IP}${NC}"
echo ""

npx expo start
