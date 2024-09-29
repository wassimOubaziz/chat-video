const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io"); // Correct import for Socket.IO
const { ExpressPeerServer } = require("peer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const httpServer = createServer(app); // Create HTTP server
const io = new Server(httpServer, {
  // Initialize Socket.IO with HTTP server
  cors: {
    origin: "*", // Allow all origins; adjust for security
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

// Listen on the appropriate port
const PORT = process.env.PORT || 3030;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
