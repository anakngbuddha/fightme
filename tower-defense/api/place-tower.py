from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from .pusher_config import get_pusher_client

app = FastAPI()
pusher_client = get_pusher_client()

class PlaceTowerRequest(BaseModel):
    roomId: str
    playerId: str
    towerId: str
    x: int
    y: int

@app.post("/api/place-tower")
async def place_tower(req: PlaceTowerRequest):
    pusher_client.trigger(
        f"presence-room-{req.roomId}",
        "tower-placed",
        {
            "playerId": req.playerId,
            "towerId": req.towerId,
            "x": req.x,
            "y": req.y
        }
    )
    return JSONResponse(content={"success": True})

handler = app
