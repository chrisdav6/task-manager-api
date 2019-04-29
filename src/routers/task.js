const express = require("express");
const Task = require("../models/task"); //Task model
const auth = require("../middleware/auth"); //Auth Middleware
const router = new express.Router();

//New Task - POST
router.post("/tasks", auth, async (req, res) => {
  //Create New Task
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Get All Tasks - GET - or set query string to completed=true or completed=false
//Set limit and skip options in query string
//Sort options sortBy=
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Get Single Task - GET
router.get("/tasks/:id", auth, async (req, res) => {
  //Get id from route parameter
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send("Task not found!");
    }

    res.status(200).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Update Task - PATCH
router.patch("/tasks/:id", auth, async (req, res) => {
  //Make sure update field is valid
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

  //Get id from route parameter
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send("Task does not exist!");
    }

    updates.forEach((update) => task[update] = req.body[update]);
    await task.save();

    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Delete Task - DELETE
router.delete("/tasks/:id", auth, async (req, res) => {
  //Get id from route parameter
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send("Task does not exist!");
    }

    res.status(200).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;