#!/bin/bash

# Colors
BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
RESET='\033[0m'

echo ""
echo -e "  ${MAGENTA}${BOLD}MauMau${RESET} — Shutting down"
echo ""

# --- Frontend ---
FRONTEND_PID=$(lsof -ti :5173 -sTCP:LISTEN 2>/dev/null)
if [ -n "$FRONTEND_PID" ]; then
  kill $FRONTEND_PID 2>/dev/null
  echo -e "  ${GREEN}${BOLD}✔${RESET} Frontend             ${DIM}stopped${RESET}"
else
  echo -e "  ${DIM}  ─ Frontend             not running${RESET}"
fi

# --- Backend ---
BACKEND_PID=$(lsof -ti :3000 -sTCP:LISTEN 2>/dev/null)
if [ -n "$BACKEND_PID" ]; then
  kill $BACKEND_PID 2>/dev/null
  echo -e "  ${GREEN}${BOLD}✔${RESET} Backend              ${DIM}stopped${RESET}"
else
  echo -e "  ${DIM}  ─ Backend              not running${RESET}"
fi

# --- MongoDB ---
if brew services list 2>/dev/null | grep mongodb-community | grep -q started; then
  brew services stop mongodb/brew/mongodb-community &>/dev/null
  echo -e "  ${GREEN}${BOLD}✔${RESET} MongoDB              ${DIM}stopped${RESET}"
else
  echo -e "  ${DIM}  ─ MongoDB              not running${RESET}"
fi

echo ""
echo -e "  ${GREEN}${BOLD}All stopped.${RESET} See you next time!"
echo ""
