const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

const peerServer = ExpressPeerServer(server, { debug: true });
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

// Use Vercel's serverless function approach
module.exports = (req, res) => {
  server(req, res);
};
