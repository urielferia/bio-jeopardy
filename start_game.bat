@echo off
echo Cleaning up old processes so ports 8000 and 5173 are always available...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :8000') DO (
    TaskKill /PID %%T /F 2>nul
)
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5173') DO (
    TaskKill /PID %%T /F 2>nul
)

echo Starting Bio Jeopardy Backend...
start cmd /k ".\venv\Scripts\python.exe src/server.py"

echo Starting Bio Jeopardy Frontend...
cd frontend
start cmd /k "npm run dev"

echo Both servers are starting up!
echo Your Game Master screen will be at http://localhost:5173
