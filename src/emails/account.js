const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "chris.davis5440@gmail.com",
    subject: "Welcome to the Task Manager App",
    text: `Hi ${name}, welcome to the Task Manager App. We are happy to have you! :)`
  });
};

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "chris.davis5440@gmail.com",
    subject: "We're sorry to see you go! :(",
    text: `Hi ${name}, we are sorry to see you leaving the Task Manager App. If there is something we can do, please let us know! :)`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail
}