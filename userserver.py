from flask import Flask
from flask_sock import Sock
import json

app = Flask(__name__)
sock = Sock(app)

users = {}

@sock.route('/ws')
def websocket(ws):
    global users
    username = None
    
    try:
        data = json.loads(ws.receive())
        username = data.get("username")

        if not username:
            return
        
        if username.lower() == "ping":
            return print("Ping received, ignoring.")
        

        users[username] = ws
        print(f"User {username} connected. Current users: {list(users.keys())}")

        for user, conn in users.items():
            try:
                conn.send(json.dumps({"type": "user_update", "users": list(users.keys())}))
            except:
                pass

        while True:
            ws.receive()

    except Exception as e:
        print(f"WebSocket error: {e}")

    finally:
        if username:
            users.pop(username, None)
            print(f"User {username} disconnected. Current users: {list(users.keys())}")

            for user, conn in users.items():
                try:
                    conn.send(json.dumps({"type": "user_update", "users": list(users.keys())}))
                except:
                    pass


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
