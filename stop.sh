#!/bin/bash

# SpotIt - Stop Script

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo ""
echo -e "${RED}Stopping SpotIt services...${NC}"

# Stop Backend
if [ -f /tmp/spotit-backend.pid ]; then
    PID=$(cat /tmp/spotit-backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo -e "  ${GREEN}✓ Backend stopped${NC}"
    else
        echo -e "  Backend was not running"
    fi
    rm -f /tmp/spotit-backend.pid
fi

# Stop Mobile
if [ -f /tmp/spotit-mobile.pid ]; then
    PID=$(cat /tmp/spotit-mobile.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo -e "  ${GREEN}✓ Mobile stopped${NC}"
    else
        echo -e "  Mobile was not running"
    fi
    rm -f /tmp/spotit-mobile.pid
fi

# Kill any remaining processes
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "expo start" 2>/dev/null

echo -e "  ${GREEN}All services stopped${NC}"
echo ""
