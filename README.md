<div align="center">

# 🚀 Bio-Jeopardy

**An interactive, multi-component Jeopardy-style game featuring a Streamlit host dashboard, FastAPI WebSocket backend, and React mobile clients.**

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg?style=flat-square&logo=python) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?style=flat-square&logo=javascript) ![Status](https://img.shields.io/badge/Status-Under%20Development-orange.svg?style=flat-square)

</div>

---

## 📖 Overview

Bio-Jeopardy is a dynamic game application designed to host and play a Jeopardy-style quiz. It comprises a Python backend built with Streamlit for the host dashboard and FastAPI for real-time WebSocket communication, complemented by a React frontend for mobile team clients. This project aims to provide an engaging and interactive experience for quiz masters and participants alike, handling game state, scoring, special items (wildcards/traps), and team interactions.

## ✨ Features

-   **Interactive Host Dashboard** — Manage the game board, configure questions, update scores, and control game flow via a Streamlit interface.
-   **Real-time Mobile Client** — Teams can connect using a React-based mobile client to buzz in, use wildcards, and view game progress.
-   **FastAPI WebSocket Server** — Powers seamless, real-time communication between the host and all connected team clients.
-   **Game State Management** — Tracks game phases (setup, playing), scores, active questions, and special effects.
-   **Wildcards & Traps** — Teams can utilize strategic wildcards and traps to influence gameplay.

## 🛠️ Tech Stack

| Layer | Technology |
| :---- | :--------- |
| Language (Backend) | Python (3.9+) |
| Framework (Host UI) | Streamlit |
| Framework (API/Websockets) | FastAPI, Uvicorn |
| Language (Frontend) | JavaScript (React, Vite) |
| Package Manager (Python) | pip |
| Package Manager (JS) | npm |
| Database | SQLite (via `state_manager.py`) |

## ⚡ Quick Start

### Prerequisites
-   Python 3.9+
-   Node.js and npm
-   `streamlit` (install separately if not in your Python environment)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/purpl/bio-jeopardy.git # Replace with actual repo URL if known
    cd bio-jeopardy
    ```

2.  **Install Python Backend Dependencies:**
    ```bash
    pip install streamlit
    pip install -r requirements.txt
    ```

3.  **Install JavaScript Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

### Usage

1.  **Start the FastAPI WebSocket Server:**
    ```bash
    uvicorn src.server:app --host 0.0.0.0 --port 8000
    ```
    This will start the WebSocket server, typically on `http://localhost:8000`.

2.  **Start the Streamlit Host Dashboard/Game Interface:**
    Open a new terminal in the project root and run:
    ```bash
    streamlit run app.py
    ```
    This will open the Streamlit application in your web browser, serving as the main interface for the host.

3.  **Start the React Mobile Frontend (for team clients):**
    Open another terminal, navigate to the `frontend` directory, and run:
    ```bash
    cd frontend
    npm run dev
    ```
    This will start the React development server, typically on `http://localhost:5173`. Teams can access this URL to join the game as mobile clients.

## 📁 Project Structure

```
bio-jeopardy/
├── .gitignore
├── README.md
├── app.py
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
├── game_state.db
├── pages/
│   ├── 1_Host_Dashboard.py
│   └── 2_Team_Buzzer.py
├── requirements.txt
├── setup.py
├── src/
│   ├── __int__.py
│   └── server.py
├── start_game.bat
├── state_manager.py
└── tests/
    └── __int__.py
```

## 🔧 Configuration

The application uses an SQLite database (`game_state.db`) managed by `state_manager.py` to persist game state. The FastAPI server runs on port 8000 by default. Adjustments to ports or other settings would typically be made in `src/server.py` or `uvicorn` command line arguments for the backend, and `vite.config.js` or `.env` files for the frontend.

## 🧪 Testing

The project includes a `tests/` directory for unit and integration tests.
<!-- TODO: Add specific instructions on how to run tests if available in the project. -->

## 🤝 Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## 📄 License

See LICENSE file