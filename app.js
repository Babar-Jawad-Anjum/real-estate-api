import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: "./.env" }); //.env file on root

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(8800, () => {
  console.log("Server is running on port 8800");
});
