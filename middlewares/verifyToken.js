import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  let jwtToken;

  //1: Read the token and check if exist
  const testToken = req.headers.authorization;
  if (testToken && testToken.startsWith("Bearer")) {
    jwtToken = testToken.split(" ")[1];
  }

  if (!jwtToken) {
    return res.status(401).json({
      status: "failed",
      message: "Not Authenticated",
    });
  }

  jwt.verify(jwtToken, process.env.JWT_SECRET, (err, payload) => {
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
