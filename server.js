const WebSocket = require("ws");

const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port });

const users = {};

wss.on("connection", (ws) => {
  let username = null;

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.username === "ping") {
        console.log("ping"); 
        return;
      }

      username = data.username;
      users[username] = ws;

      console.log(`User ${username} connected. Users:`, Object.keys(users));

      // Notify all users
      broadcast({
        type: "user_update",
        users: Object.keys(users),
      });

    } catch (err) {
      console.error("Message error:", err);
    }
  });

  ws.on("close", () => {
    if (username) {
      delete users[username];
      console.log(`User ${username} disconnected.`);

      broadcast({
        type: "user_update",
        users: Object.keys(users),
      });
    }
  });

  ws.on("error", console.error);
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const user in users) {
    try {
      users[user].send(msg);
    } catch {
      // ignore send failures
    }
  }
}

console.log("WebSocket server started on port", port);
