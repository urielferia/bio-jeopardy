@echo off
echo Starting Bio Jeopardy Backend...
start cmd /k ".\venv\Scripts\python.exe src/server.py"

echo Starting Bio Jeopardy Frontend...
cd frontend
start cmd /k "npm run dev"

echo Both servers are starting up!
echo Your Game Master screen will be at http://localhost:5173
