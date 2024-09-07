import jwt from "jsonwebtoken";

export const shouldBeLoggedIn = async (req, res) => {
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
  });

  res.status(200).json({
    status: "success",
    message: "You are Authenticated",
  });
};
export const shouldBeAdmin = async (req, res) => {
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
    if (!payload.isAdmin) {
      return res.status(403).json({
        status: "failed",
        message: "Not Authorized",
      });
    }
  });

  res.status(200).json({
    status: "success",
    message: "You are Authenticated",
  });
};
