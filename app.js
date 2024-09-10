import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import testRoute from "./routes/test.route.js";
import postRoute from "./routes/post.route.js";

dotenv.config({ path: "./.env" }); //.env file on root

const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);

app.use("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(8800, () => {
  console.log("Server is running on port 8800");
});
