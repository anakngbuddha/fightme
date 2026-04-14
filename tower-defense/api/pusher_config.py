import os
import pusher

def get_pusher_client():
    return pusher.Pusher(
        app_id=os.environ.get("PUSHER_APP_ID", "YOUR_PUSHER_APP_ID"),
        key=os.environ.get("NEXT_PUBLIC_PUSHER_KEY", "YOUR_PUSHER_KEY"),
        secret=os.environ.get("PUSHER_SECRET", "YOUR_PUSHER_SECRET"),
        cluster=os.environ.get("NEXT_PUBLIC_PUSHER_CLUSTER", "YOUR_PUSHER_CLUSTER"),
        ssl=True
    )
