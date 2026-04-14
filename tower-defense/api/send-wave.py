from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid
from .pusher_config import get_pusher_client

app = FastAPI()
pusher_client = get_pusher_client()

class SendWaveRequest(BaseModel):
    roomId: str
    playerId: str # the player sending the wave
    enemyType: str
    count: int

@app.post("/api/send-wave")
async def send_wave(req: SendWaveRequest):
    enemies = []
    # Generate unique IDs for the enemies
    for _ in range(req.count):
        enemies.append({
            "id": str(uuid.uuid4()),
            "type": req.enemyType,
            "ownerId": req.playerId
        })
        
    pusher_client.trigger(
        f"presence-room-{req.roomId}",
        "wave-sent",
        {
            "playerId": req.playerId,
            "enemies": enemies
        }
    )
    return JSONResponse(content={"success": True})

handler = app
