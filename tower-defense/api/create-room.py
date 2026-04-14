from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import uuid
from .pusher_config import get_pusher_client

app = FastAPI()
pusher_client = get_pusher_client()

@app.post("/api/create-room")
async def create_room():
    room_id = str(uuid.uuid4())[:8]
    # In a database-free setup, we just return the room ID
    # The client will connect to the presence channel presence-room-{room_id}
    return JSONResponse(content={"roomId": room_id})

# For vercel
handler = app
