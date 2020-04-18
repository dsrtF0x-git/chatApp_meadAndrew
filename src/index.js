const express = require("express");
const http = require("http");
const path = require("path");
const soketIO = require("socket.io");
const Filter = require("bad-words");
const { 
  addUser,
  getUser,
  removeUser,
  getUsersInRoom
 } = require("./utils/users.js");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages.js");

const app = express();
const server = http.createServer(app);
const io = soketIO(server);

const port = process.env.PORT || 4444;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options});

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast.to(user.room).emit(
      "message",
      generateMessage("Admin", `${user.username} has joined!`)
    );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback()
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("Listening porn 4444");
});
