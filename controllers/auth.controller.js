import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    //HASH THE PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    //CREATE A NEW USER & SAVE INTO DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    //CHECK IF USER EXIST OR NOT
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not exist",
      });
    }

    //CHECK IF PASSWORD IS CORRECT OR NOT
    const isValidPassword = bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        status: "failed",
        message: "Incorrect email or password",
      });
    }

    //GENERATE COOKIE TOKEN AND SEND BACK TO USER

    const maxAge = 1000 * 60 * 60 * 24 * 7; //expire after a week

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,
    });

    res
      .cookie("JWT_TOKEN", token, {
        httpOnly: true,
        maxAge,
      })
      .status(200)
      .json({ status: "success", data: {} });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
};
export const logout = (req, res) => {};
