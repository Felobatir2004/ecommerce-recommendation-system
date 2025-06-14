import { EventEmitter } from "events";
import { sendEmails } from "./sendEmail.js";
import { UserModel } from "../../DB/Models/user.model.js";
import { welcomeTemplate } from "./generateHtml.js";

export const emailEmitter = new EventEmitter();

// ترحيب بعد التسجيل
emailEmitter.on("sendWelcomeEmail", async (email, userName) => {
  await sendEmails({
    to: email,
    subject: "Welcome to Shopop!",
    html: welcomeTemplate(userName)
  });
});
