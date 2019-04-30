const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId;
const userOne = {
  _id: userOneId,
  name: "Test User",
  email: "test@test.com",
  password: "56what!!",
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.TOKEN_SECRET)
  }]
};

const userTwoId = new mongoose.Types.ObjectId;
const userTwo = {
  _id: userTwoId,
  name: "Test User2",
  email: "test2@test.com",
  password: "56what2!!",
  tokens: [{
    token: jwt.sign({ _id: userTwoId }, process.env.TOKEN_SECRET)
  }]
};

const taskOne = {
  _id: new mongoose.Types.ObjectId,
  description: "Test Task One",
  completed: false,
  owner: userOneId
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId,
  description: "Test Task Two",
  completed: true,
  owner: userOneId
}

const taskThree = {
  _id: new mongoose.Types.ObjectId,
  description: "Test Task Three",
  completed: true,
  owner: userTwoId
}

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase
}