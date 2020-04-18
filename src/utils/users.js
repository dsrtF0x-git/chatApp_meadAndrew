const users = [];

// addUser, removeUser, getUser, getUsersInRoom

function addUser({ id, username, room }) {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required"
    }
  }

  // Check for existing user
  const existingUser = users.find(
    user => user.room === room && user.username === username
  );

  if (existingUser) {
    return {
      error: "Username is in use!"
    }
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
}

function removeUser(id) {
  const index = users.findIndex(user => user.id === id);
  if (index > -1) {
    return users.splice(index, 1)[0];
  }

  return {
    error: "No such user!"
  }
}

function getUser(id) {
  return users.find(user => user.id === id);
}

function getUsersInRoom(roomName) {
  const usersInRoom = users.filter(item => item.room === roomName);
  if (usersInRoom) {
    return usersInRoom;
  }

  return {
    error: "No such room!",
  }
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}