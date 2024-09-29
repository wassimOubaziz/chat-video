const { Server } = require("ws");

let wss;

module.exports = (req, res) => {
  if (!wss) {
    wss = new Server({ noServer: true });

    wss.on("connection", (ws) => {
      ws.on("message", (message) => {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(message);
          }
        });
      });

      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });

    res.socket.server.on("upgrade", (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
  }

  res.end();
};
