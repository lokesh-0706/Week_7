const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const { default: errorMap } = require("zod/locales/en.js");
JWT_SECRET = "secret";

mongoose.connect(
  "mongodb+srv://lokeshkarri2002:ammananna2002@cluster0.awesm.mongodb.net/todoApp"
);

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  const requiredBody = z.object({
    email: z.string().min(3).max(100).email(),
    password: z.string().min(3).max(100),
    name: z.string(),
  });

  const parsedData = requiredBody.safeParse(req.body);
  if (parsedData.success) {
    const response = await bcrypt.hash(req.body.password, 5);
    console.log(response);
    try {
      await UserModel.create({
        email: req.body.email,
        password: response,
        name: req.body.name,
      });

      res.json({
        message: "Signed Up successfully",
      });
      return;
    } catch (e) {
      res.json({
        message: "Duplicate Email",
      });
      return;
    }
  } else {
    res.json({
      message: "Invalid Format",
      error: parsedData.error,
    });
  }
});

app.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    email,
  });
  if (user) {
    const result = bcrypt.compare(password, user.password);
  }
  if (user && result) {
    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_SECRET
    );
    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Incorrect Credentials",
    });
  }
});

app.post("/todo/", auth, async (req, res) => {
  const userId = req.userId;
  const response = await UserModel.findOne({
    _id: userId,
  });
  console.log(response);
  res.json(response);
});

app.get("/todos/", auth, async (req, res) => {
  const userId = req.userId;
  console.log(userId);
  const response = await UserModel.findOne({
    _id: userId,
  });
  console.log(response);
  res.json({ message: "Done Succesfully" });
});

function auth(req, res, next) {
  const token = req.headers.token;
  const decodedData = jwt.verify(token, JWT_SECRET);
  console.log(decodedData);
  if (decodedData) {
    req.userId = decodedData.id;
    next();
  } else {
    res.status(403).json({
      message: "Incorrect Credentials",
    });
  }
}

app.listen(3000);
