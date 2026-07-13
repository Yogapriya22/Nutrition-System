import jwt from "jsonwebtoken";
import User from "../models/User.js";

// protect() is middleware we attach to any route that requires login
// (e.g. GET /api/auth/profile). It checks for a valid JWT in the
// "Authorization: Bearer <token>" header before letting the request through.
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify the token's signature and expiry using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the logged-in user (minus password) to req.user so that
      // every controller after this middleware knows who's making the request
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

export default protect;
