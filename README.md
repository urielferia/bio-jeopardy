<div align="center">

# 🚀 Bio Jeopardy

**Real-time interactive Jeopardy trivia platform with host controls, mobile player controllers, and strategic power-ups.**

![Python](https://img.shields.io/badge/Python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socket.io&logoColor=white)

</div>

---

## 📖 Overview

**Bio Jeopardy** is a real-time, WebSocket-powered trivia game engine designed for hosting interactive Jeopardy-style quiz games. It features a dual-interface system: a central **Game Master / Host dashboard** for displaying questions and managing scores, alongside responsive **Mobile Player Controllers** that allow participating teams to select questions, use special items, and attempt steals.

The platform introduces active strategy elements into trivia with interactive wildcards and traps, turn-based question choices, and rapid buzzer steals when a active team's timer expires.

## ✨ Features

- 🖥️ **Host & Game Master View**: Fullscreen interactive Jeopardy board with configurable question sets, score overrides, and automated turn rotation.
- 📱 **Mobile Team Controller**: Responsive mobile web UI for teams to join games, pick board items during their turn, and trigger steals.
- ⚡ **WebSocket Synchronization**: Real-time bi-directional messaging between the FastAPI server, host dashboard, and all mobile team devices.
- 🃏 **Power-Ups & Traps System**:
  - **Wildcards**: Double Points, Double Chance, Steal, Shield, and Clue.
  - **Traps**: Half Time, Half Points, and Minesweeper.
- 🚨 **Buzzer & Steal Window**: Built-in steal phase allowing competing teams to buzz in when a team fails or time expires.
- 🔄 **Reconnection Handling**: Server-backed session state retention to restore team scores and progress upon accidental disconnects.

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Backend Framework** | FastAPI |
| **Real-Time Protocol** | WebSockets (`websockets`, FastAPI WebSockets) |
| **ASGI Server** | Uvicorn |
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite |
| **Iconography** | Lucide React |
| **Automation** | Windows Batch Script (`start_game.bat`) |

## ⚡ Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd bio-jeopardy
   ```

2. **Set up the Python Backend**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   # source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Set up the Frontend**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Usage

#### Option A: One-Click Startup (Windows)

Run the included batch script to automatically clean port collisions and start both servers:

```cmd
start_game.bat
```

#### Option B: Manual Execution

1. **Start the FastAPI Backend**:
   ```bash
   python src/server.py
   ```
   *The backend server will run at `http://localhost:8000`.*

2. **Start the React Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser to access the Host view or join as a player.*

## 📁 Project Structure

```
bio-jeopardy/
├── .gitignore
├── README.md
├── data/
│   └── __int__.py
├── docs/
│   └── __int__.py
├── frontend/
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── HostApp.jsx
│   │   ├── MobileApp.jsx
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
├── requirements.txt
├── setup.py
├── src/
│   ├── __int__.py
│   └── server.py
├── start_game.bat
└── tests/
    └── __int__.py
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request with new features, questions, or bug fixes.

## 📄 License

See LICENSE file.