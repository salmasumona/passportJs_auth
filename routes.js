const path = require("path");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./api/auth");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." }
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  return res.redirect("/login");
}

module.exports = function registerRoutes(app, passport) {
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/auth", authLimiter, authRoutes(passport));

  app.get("/api/me", isAuthenticated, (req, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    });
  });

  app.post("/logout", isAuthenticated, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);

      req.session.destroy((sessionErr) => {
        if (sessionErr) return next(sessionErr);

        res.clearCookie("auth.sid");
        res.status(204).end();
      });
    });
  });

  app.get("/registration", (req, res) => {
    res.sendFile(path.join(__dirname, "public/view/registration.html"));
  });

  app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/view/login.html"));
  });

  app.get("/profile", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public/view/profile.html"));
  });

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/view/index.html"));
  });

  app.use((req, res) => {
    res.status(404).json({ message: "Not found." });
  });
};
