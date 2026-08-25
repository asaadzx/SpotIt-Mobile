#!/bin/bash

# SpotIt - Startup Script
# Starts both Backend (FastAPI) and Mobile (Expo)

BASEDIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$BASEDIR/../SpotIt"
MOBILE_DIR="$BASEDIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   SpotIt - Starting All Services${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get local IP
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

# Start Backend
echo -e "${YELLOW}[1/2] Starting Backend (FastAPI)...${NC}"
if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
    fi
    source .venv/bin/activate 2>/dev/null
    pip install -q -r requirements.txt 2>/dev/null || uv sync -q 2>/dev/null
    nohup python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > /tmp/spotit-backend.log 2>&1 &
    BACKEND_PID=$!
    echo "$BACKEND_PID" > /tmp/spotit-backend.pid
    sleep 2
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "   ${GREEN}✓ Backend running on http://${LOCAL_IP}:8000${NC}"
    else
        echo -e "   ${RED}✗ Backend failed to start. Check: cat /tmp/spotit-backend.log${NC}"
    fi
else
    echo -e "   ${RED}✗ Backend directory not found at $BACKEND_DIR${NC}"
fi

# Start Mobile
echo -e "${YELLOW}[2/2] Starting Mobile (Expo)...${NC}"
if [ -d "$MOBILE_DIR" ]; then
    cd "$MOBILE_DIR"
    nohup npx expo start --tunnel > /tmp/spotit-mobile.log 2>&1 &
    MOBILE_PID=$!
    echo "$MOBILE_PID" > /tmp/spotit-mobile.pid
    sleep 3
    if kill -0 $MOBILE_PID 2>/dev/null; then
        echo -e "   ${GREEN}✓ Expo running — scan QR code from terminal output${NC}"
    else
        echo -e "   ${RED}✗ Expo failed to start. Check: cat /tmp/spotit-mobile.log${NC}"
    fi
else
    echo -e "   ${RED}✗ Mobile directory not found at $MOBILE_DIR${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   All Services Started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Backend API:  ${YELLOW}http://${LOCAL_IP}:8000/api${NC}"
echo -e "  Admin Panel:  ${YELLOW}http://localhost:5000${NC}"
echo -e "  Mobile App:   ${YELLOW}Scan QR code in Expo Go${NC}"
echo ""
echo -e "  Update config: ${YELLOW}Mobile → constants/config.js${NC}"
echo -e "  Update config: ${YELLOW}Admin  → .env (API_BASE_URL)${NC}"
echo ""
echo -e "  Logs:"
echo -e "    Backend: ${YELLOW}tail -f /tmp/spotit-backend.log${NC}"
echo -e "    Mobile:  ${YELLOW}tail -f /tmp/spotit-mobile.log${NC}"
echo ""
echo -e "  Stop all: ${YELLOW}./stop.sh${NC}"
echo ""
