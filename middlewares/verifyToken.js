import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.JWT_TOKEN;

  if (!token) {
    return res.status(401).json({
      status: "failed",
      message: "Not Authenticated",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({
        status: "failed",
        message: "Invalid Token",
      });
    }

    req.userId = payload.id;
    next();
  });
};
