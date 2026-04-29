from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import uuid
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameState:
    def __init__(self):
        self.host_ws = None
        self.mobile_clients = {} # ws -> team_id
        self.teams = {} # team_id -> {id, name, color, score}
        self.phase = "setup" # setup, playing
        self.stealable = False
        self.config = None
        self.active_question_team_id = None
        self.team_order = []
        self.current_turn_index = 0
        self.has_stolen = False

state = GameState()

async def broadcast(message: dict):
    if state.host_ws:
        try:
            await state.host_ws.send_json(message)
        except:
            pass
    for ws in list(state.mobile_clients.keys()):
        try:
            await ws.send_json(message)
        except:
            pass

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # We don't know who this is yet
    client_type = None
    team_id = None

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            type = msg.get("type")

            if type == "REGISTER_HOST":
                client_type = "host"
                state.host_ws = websocket
                state.phase = "setup"
                await websocket.send_json({"type": "HOST_REGISTERED"})
                await broadcast({"type": "PHASE_CHANGED", "phase": "setup"})
                # Send current teams to host
                await websocket.send_json({"type": "SYNC_TEAMS", "teams": list(state.teams.values())})

            elif type == "REGISTER_TEAM":
                if state.phase == "playing":
                    await websocket.send_json({"type": "ERROR", "message": "Game already started. Cannot join."})
                    continue
                client_type = "team"
                team_id = str(uuid.uuid4())
                state.mobile_clients[websocket] = team_id
                state.teams[team_id] = {
                    "id": team_id,
                    "name": msg.get("name"),
                    "color": msg.get("color"),
                    "score": 0
                }
                await websocket.send_json({
                    "type": "TEAM_REGISTERED", 
                    "team_id": team_id,
                    "phase": state.phase,
                    "config": state.config
                })
                # Broadcast new team list to host
                await broadcast({"type": "SYNC_TEAMS", "teams": list(state.teams.values())})

            elif type == "START_GAME":
                # Host starts the game
                state.phase = "playing"
                state.config = msg.get("config")
                state.team_order = list(state.teams.keys())
                random.shuffle(state.team_order)
                state.current_turn_index = 0
                await broadcast({
                    "type": "GAME_STARTED", 
                    "config": state.config,
                    "teamOrder": state.team_order,
                    "currentTurnIndex": state.current_turn_index
                })

            elif type == "UPDATE_SCORE":
                # Host updates a team's score
                t_id = msg.get("teamId")
                if t_id in state.teams:
                    state.teams[t_id]["score"] = msg.get("score")
                    await broadcast({"type": "SYNC_TEAMS", "teams": list(state.teams.values())})

            elif type == "REMOVE_TEAM":
                t_id = msg.get("teamId")
                if t_id in state.teams:
                    del state.teams[t_id]
                    await broadcast({"type": "SYNC_TEAMS", "teams": list(state.teams.values())})
                    await broadcast({"type": "TEAM_KICKED", "teamId": t_id})

            elif type == "SELECT_QUESTION":
                # A team selects a question
                if state.phase == "playing":
                    t_id = msg.get("teamId")
                    if t_id is not None and len(state.team_order) > 0:
                        if t_id != state.team_order[state.current_turn_index]:
                            continue # Ignore, not their turn
                    
                    state.active_question_team_id = t_id
                    # Tell the host to open this question
                    if state.host_ws:
                        await state.host_ws.send_json({
                            "type": "OPEN_QUESTION",
                            "catIndex": msg.get("catIndex"),
                            "qIndex": msg.get("qIndex")
                        })
                    # Tell everyone it's opened so mobiles can hide the board
                    state.stealable = False
                    await broadcast({
                        "type": "QUESTION_OPENED",
                        "catIndex": msg.get("catIndex"),
                        "qIndex": msg.get("qIndex")
                    })

            elif type == "ENABLE_STEAL":
                # Host's timer ran out, steal is available
                if not state.has_stolen:
                    state.stealable = True
                    await broadcast({"type": "STEAL_AVAILABLE", "excludeTeamId": state.active_question_team_id})

            elif type == "STEAL_PRESS":
                # A team hit the steal button
                pressing_team_id = state.mobile_clients.get(websocket)
                if state.stealable and pressing_team_id != state.active_question_team_id:
                    state.stealable = False # First one gets it, lock it
                    state.has_stolen = True
                    await broadcast({"type": "STEAL_SUCCESS", "teamId": pressing_team_id})

            elif type == "CLOSE_QUESTION":
                # Host closed the question
                state.stealable = False
                state.has_stolen = False
                state.active_question_team_id = None
                
                cat_idx = msg.get("catIndex")
                q_idx = msg.get("qIndex")
                if state.config and cat_idx is not None and q_idx is not None:
                    state.config["categories"][cat_idx]["questions"][q_idx]["isAnswered"] = True

                if len(state.team_order) > 0:
                    state.current_turn_index = (state.current_turn_index + 1) % len(state.team_order)

                await broadcast({
                    "type": "QUESTION_CLOSED",
                    "catIndex": cat_idx,
                    "qIndex": q_idx,
                    "currentTurnIndex": state.current_turn_index
                })

    except WebSocketDisconnect:
        if client_type == "host":
            state.host_ws = None
        elif client_type == "team":
            if websocket in state.mobile_clients:
                del state.mobile_clients[websocket]
            # We keep the team in state.teams so their score isn't lost if they disconnect briefly

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
