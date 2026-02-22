const jwt = require('jsonwebtoken');

const checkAuth = (
  accessTokenSecret,
  refreshTokenSecret = process.env.USER_REFRESH_TOKEN_SECRET
) => {
  return async (req, res, next) => {
    try {

      // ✅ Get Authorization Header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const accessToken = authHeader.split(" ")[1];

      try {
        // ✅ Verify Access Token
        const decoded = jwt.verify(accessToken, accessTokenSecret);

        // ✅ Attach user info to request
        req.user = decoded;

        return next();

      } catch (error) {

        // 🔁 If access token expired → check refresh token
        const refreshToken =
          req.cookies.jwt || req.cookies.refreshToken;

        if (!refreshToken) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const refreshDecoded = jwt.verify(
          refreshToken,
          refreshTokenSecret
        );

        // ✅ Create new access token (preserve role)
        const newAccessToken = jwt.sign(
          { email: refreshDecoded.email, role: refreshDecoded.role },
          accessTokenSecret,
          { expiresIn: "10m" }
        );

        // ✅ Attach new token in response header
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);

        req.user = refreshDecoded;

        return next();
      }

    } catch (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

module.exports = checkAuth;
