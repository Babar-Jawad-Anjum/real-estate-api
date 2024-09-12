import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 10000000,
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        posts,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failed",
      message: "Failed to get posts",
    });
  }
};
export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Function to verify JWT token
    const verifyToken = (token) => {
      return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
          if (err) return reject(err);
          resolve(payload);
        });
      });
    };

    let isSaved = false;

    const testToken = req.headers.authorization;
    if (testToken && testToken.startsWith("Bearer")) {
      const jwtToken = testToken.split(" ")[1];
      try {
        const payload = await verifyToken(jwtToken);
        const savedPost = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              postId: id,
              userId: payload.id,
            },
          },
        });
        isSaved = !!savedPost;
      } catch (err) {
        console.log("JWT verification failed:", err);
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        post: { ...post, isSaved },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failed",
      message: "Failed to get post",
    });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        post: newPost,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failed",
      message: "Failed to add post",
    });
  }
};
export const updatePost = (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failed",
      message: "Failed to update post",
    });
  }
};
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({
        status: "failed",
        message: "Not Authorized",
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      data: {},
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failed",
      message: "Failed to delete post",
    });
  }
};
