#!/bin/sh
# Sobe a API (server/, porta 3001) e o Vite (front, porta 5173) juntos.
# Usado pelo preview do Freebuff (freebuff-preview set) e por uso local:
#   sh scripts/dev-with-api.sh
# O proxy do Freebuff roteia ambas as portas publicamente.

cd "$(dirname "$0")/.." || exit 1

# Vite primeiro: o preview do Freebuff identifica a porta principal (5173) pelo
# primeiro servidor que escuta. A API (3001) só sobe depois que o Vite responde.
bun run dev &
WEB_PID=$!

cleanup() {
  kill "$WEB_PID" 2>/dev/null
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null
}
trap cleanup EXIT INT TERM

for _ in $(seq 1 60); do
  if curl -sf -o /dev/null http://127.0.0.1:5173/; then
    break
  fi
  sleep 0.5
done

node server/index.js &
API_PID=$!

wait "$WEB_PID"
