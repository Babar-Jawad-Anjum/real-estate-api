import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    console.log(chats);

    res.status(200).json({
      status: "success",
      data: {
        chats,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to fetch chats",
    });
  }
};
export const getChat = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            CreateAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        chat,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failed",
      message: "Failed to get chat",
    });
  }
};
export const addChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, req.body.receiverId],
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        chat: newChat,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to add chat",
    });
  }
};
export const readChat = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        chat,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to read chat",
    });
  }
};
