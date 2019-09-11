const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // "Bearer sdfsdfsdfgkqkfovbij" the struct of authorization so split
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, "this_password_should_be_secret");
    // req.userData does not exist we create it here
    //req.userData = { username: decodedToken.username, userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({
      message: "You are not Authenticated"
    });
  }


}
