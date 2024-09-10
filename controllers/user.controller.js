import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to fetch users",
    });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to fetch user",
    });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...body } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({
      status: "failed",
      message: "Not Authorized",
    });
  }

  let updatedPassword = null;

  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...body,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json({
      status: "success",
      data: {
        user: rest,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to update user",
    });
  }
};
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({
      status: "failed",
      message: "Not Authorized",
    });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to delete user",
    });
  }
};
