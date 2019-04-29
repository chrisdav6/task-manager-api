const express = require("express");
require("./db/mongoose"); //Connect to DB
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const app = express();
const port = process.env.PORT;


//Setup
app.use(express.json());


//----ROUTES-----//
app.use(userRouter);
app.use(taskRouter);


//Server
app.listen(port, () => {
  console.log(`Connected to server on port ${port}`);
});