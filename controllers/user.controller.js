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
export const savedPost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Post removed from saved list",
      });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({
        status: "success",
        message: "Post saved successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failed",
      message: "Failed to save post",
    });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    // Fetch the user's posts
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Fetch saved posts separately
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Add isSaved flag to userPosts if the post is saved by the user
    const savedPostIds = new Set(
      savedPosts.map((savedPost) => savedPost.postId)
    );

    const userPostsWithIsSaved = userPosts.map((post) => ({
      ...post,
      isSaved: savedPostIds.has(post.id), // Mark as saved if found in savedPostIds
    }));

    // Format saved posts to include the isSaved flag
    const savedPostsWithFlag = savedPosts.map((savedPost) => ({
      ...savedPost.post,
      isSaved: true, // Add isSaved flag for saved posts
    }));

    // Return both userPosts with the isSaved flag and savedPosts separately
    res.status(200).json({
      status: "success",
      data: {
        userPosts: userPostsWithIsSaved,
        savedPosts: savedPostsWithFlag,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failed",
      message: "Failed to fetch profile posts",
    });
  }
};

export const notificationsCount = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const notificationsCount = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: { hasSome: [tokenUserId] },
        },
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        notificationsCount,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to fetch notifications count",
    });
  }
};
