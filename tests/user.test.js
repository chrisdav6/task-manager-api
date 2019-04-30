const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

//Test Cases
test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Chris",
      email: "chris@example.com",
      password: "MyPass666!"
    })
    .expect(201);

  //Assert that the database was updated correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  //Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "Chris",
      email: "chris@example.com",
    },
    token: user.tokens[0].token
  });

  //Make sure plain text password is not stored in database
  expect(user.password).not.toBe("MyPass666!");
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

  //Validate new token is saved in database
  const user = await User.findById(userOneId._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login non-existent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "someemail@email.com",
      password: "somePass!!"
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", "someinvalidtaken")
    .send()
    .expect(401);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  //Make sure user was deleted from database
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for unathenticated user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", "someinvalidtaken")
    .send()
    .expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/avatar.jpg")
    .expect(200);

  //Make sure binary data was saved in database
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Dave"
    })
    .expect(200);

  //Make sure data has been updated on database
  const user = await User.findById(userOneId);
  expect(user.name).toEqual("Dave");
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "Albany"
    })
    .expect(400);
});