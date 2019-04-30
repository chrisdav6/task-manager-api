const app = require("./app");
const port = process.env.PORT;

//Server
app.listen(port, () => {
  console.log(`Connected to server on port ${port}`);
});