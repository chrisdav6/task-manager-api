const express = require("express");
require("./db/mongoose"); //Connect to DB
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const app = express();

//Setup
app.use(express.json());

//----ROUTES-----//
app.use(userRouter);
app.use(taskRouter);

module.exports = app;