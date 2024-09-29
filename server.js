const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io"); // Ensure this import is correct
const { ExpressPeerServer } = require("peer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const httpServer = createServer(app); // Create HTTP server
const io = new Server(httpServer, {
  // Pass the HTTP server to Socket.IO
  cors: {
    origin: "*",
  },
});

app.set("view engine", "ejs");
app.use(express.static("public"));

const peerServer = ExpressPeerServer(httpServer, { debug: true });
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    setTimeout(() => {
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000);

    socket.on("disconnect", () => {
      console.log("User Disconnected");
      io.emit("user-disconnected", userId);
    });
  });
});

// Listen on the correct port
const PORT = process.env.PORT || 3030;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
