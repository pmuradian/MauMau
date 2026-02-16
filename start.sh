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

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

clear

echo ""
echo -e "${MAGENTA}${BOLD}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║                                      ║"
echo "  ║          🃏  M A U M A U  🃏          ║"
echo "  ║                                      ║"
echo "  ║      Photobook Design Studio         ║"
echo "  ║                                      ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${RESET}"

spinner() {
  local pid=$1
  local msg=$2
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  ${CYAN}${frames[$i]}${RESET} ${msg}"
    i=$(( (i + 1) % ${#frames[@]} ))
    sleep 0.08
  done
}

# --- MongoDB ---
printf "  ${CYAN}⠋${RESET} Starting MongoDB..."
brew services start mongodb/brew/mongodb-community &>/dev/null &
BREW_PID=$!
spinner $BREW_PID "Starting MongoDB..."
wait $BREW_PID
printf "\r  ${GREEN}${BOLD}✔${RESET} MongoDB              ${DIM}ready${RESET}\n"

# --- Backend ---
printf "  ${CYAN}⠋${RESET} Starting backend..."
cd "$ROOT_DIR/backend"
npx ts-node main.ts &>/dev/null &
BACKEND_PID=$!

# Wait for backend to be ready
for i in $(seq 1 60); do
  if curl -s http://localhost:3000 &>/dev/null; then
    break
  fi
  frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  printf "\r  ${CYAN}${frames[$((i % 10))]}${RESET} Starting backend..."
  sleep 0.5
done
printf "\r  ${GREEN}${BOLD}✔${RESET} Backend              ${DIM}http://localhost:3000${RESET}\n"

# --- Frontend ---
printf "  ${CYAN}⠋${RESET} Starting frontend..."
cd "$ROOT_DIR/frontend"
npm run dev &>/dev/null &
FRONTEND_PID=$!

# Wait for frontend to be ready
for i in $(seq 1 60); do
  if curl -s http://localhost:5173 &>/dev/null || curl -s http://localhost:5174 &>/dev/null; then
    break
  fi
  frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  printf "\r  ${CYAN}${frames[$((i % 10))]}${RESET} Starting frontend..."
  sleep 0.5
done

# Detect which port frontend landed on
if curl -s http://localhost:5173 &>/dev/null; then
  FRONTEND_URL="http://localhost:5173"
else
  FRONTEND_URL="http://localhost:5174"
fi
printf "\r  ${GREEN}${BOLD}✔${RESET} Frontend             ${DIM}${FRONTEND_URL}${RESET}\n"

# --- Ready ---
echo ""
echo -e "  ${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${GREEN}${BOLD}  All systems go!${RESET}"
echo -e "  ${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${BOLD}Open:${RESET}  ${CYAN}${FRONTEND_URL}${RESET}"
echo -e "  ${BOLD}Stop:${RESET}  ${DIM}Ctrl+C${RESET}"
echo ""

# Handle shutdown
cleanup() {
  echo ""
  echo -e "  ${YELLOW}${BOLD}Shutting down...${RESET}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo -e "  ${GREEN}${BOLD}✔${RESET} Stopped. See you next time!"
  echo ""
  exit 0
}

trap cleanup SIGINT SIGTERM

wait
