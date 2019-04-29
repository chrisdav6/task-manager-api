const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user"); //User model
const auth = require("../middleware/auth"); //Auth Middleware
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account"); //SendGrid Email Service
const router = new express.Router();

//New User - POST
router.post("/users", async (req, res) => {
  //Create New User
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    sendWelcomeEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//Login - POST
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//Logout - POST
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

//Logout All Sessions - POST
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

//Get User Profile - GET
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//Update User - PATCH
router.patch("/users/me", auth, async (req, res) => {
  //Make sure update field is valid
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

  try {
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Delete User - DELETE
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelEmail(req.user.email, req.user.name);
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Configure Multer
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload .jpg, .jpeg or .png!"));
    }
    cb(undefined, true);
  }
});

//Upload User Photo - POST
router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send("Avatar Uploaded");
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

//Delete User Photo - DELETE
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send("Avatar Deleted");
});

//Get Avatar - GET
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send("Cannot find Image");
  }
});

module.exports = router;