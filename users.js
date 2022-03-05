const users = [];

const addUser = ({ id, name, room }) => {
  const numberOfUsersInRoom = users.filter((user) => user.room === room).length;
  if (numberOfUsersInRoom === 2) return { error: "Room full" };
  if (numberOfUsersInRoom === 1 && users[0].name === "Player 2") {
    name = "Player 1";
  }
  const newUser = { id, name, room };
  users.push(newUser);
  return { newUser };
};

const removeUser = (id) => {
  const removeIndex = users.findIndex((user) => user.id === id);
  if (removeIndex !== -1) return users.splice(removeIndex, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
