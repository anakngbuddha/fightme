from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .pusher_config import get_pusher_client

app = FastAPI()
pusher_client = get_pusher_client()

@app.post("/api/pusher-auth")
async def pusher_auth(request: Request):
    form_data = await request.form()
    socket_id = form_data.get("socket_id")
    channel_name = form_data.get("channel_name")
    
    # We can use the socket_id as a user_id for simplicity
    user_data = {
        "user_id": socket_id,
        "user_info": {}
    }
    
    auth = pusher_client.authenticate(
        channel=channel_name,
        socket_id=socket_id,
        custom_data=user_data
    )
    return JSONResponse(content=auth)

handler = app
