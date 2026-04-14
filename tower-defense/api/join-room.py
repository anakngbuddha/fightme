from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from .pusher_config import get_pusher_client

app = FastAPI()
pusher_client = get_pusher_client()

class JoinRoomRequest(BaseModel):
    roomId: str
    playerId: str

@app.post("/api/join-room")
async def join_room(req: JoinRoomRequest):
    # Notify channel that player joined
    pusher_client.trigger(
        f"presence-room-{req.roomId}",
        "player-joined",
        {"playerId": req.playerId}
    )
    return JSONResponse(content={"success": True})

handler = app
