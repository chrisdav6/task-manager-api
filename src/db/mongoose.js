const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}, () => {
  console.log("Connected to DB with Mongoose");
});