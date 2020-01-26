const jwt = require("jsonwebtoken");
const JWT_KEY="secret";
module.exports = (req, res, next) => {
  try {
      console.log("Inside");
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, JWT_KEY);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
      console.log("kaand");
    res.status(401).json({ message: "You are not authenticated!" });
  }
};
