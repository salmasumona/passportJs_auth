const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./auth.model");

const MIN_PASSWORD_LENGTH = 8;

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validateRegistration(body) {
  const username = normalizeUsername(body.username);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const cpassword = String(body.cpassword || "");

  if (!/^[a-z0-9._-]{4,30}$/.test(username)) {
    return "Username must be 4-30 characters and contain only letters, numbers, dot, underscore or hyphen.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please provide a valid email address.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (password !== cpassword) {
    return "Passwords do not match.";
  }

  return null;
}

passport.use("registration", new LocalStrategy(
  { usernameField: "username", passwordField: "password", passReqToCallback: true },
  async (req, username, password, done) => {
    try {
      const validationError = validateRegistration(req.body);
      if (validationError) return done(null, false, { message: validationError });

      const normalizedUsername = normalizeUsername(username);
      const email = normalizeEmail(req.body.email);

      const existingUser = await User.findOne({
        $or: [{ username: normalizedUsername }, { email }]
      }).lean();

      if (existingUser) {
        return done(null, false, {
          message: "Username or email is already registered."
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        username: normalizedUsername,
        email,
        password: passwordHash
      });

      return done(null, user);
    } catch (error) {
      if (error.code === 11000) {
        return done(null, false, {
          message: "Username or email is already registered."
        });
      }

      return done(error);
    }
  }
));

passport.use("login", new LocalStrategy(
  { usernameField: "username", passwordField: "password", passReqToCallback: true },
  async (req, username, password, done) => {
    try {
      const loginId = String(username || "").trim().toLowerCase();

      if (!loginId || !password) {
        return done(null, false, { message: "Invalid username/email or password." });
      }

      const user = await User.findOne({
        $or: [{ username: loginId }, { email: loginId }]
      }).select("+password");

      if (!user) {
        return done(null, false, { message: "Invalid username/email or password." });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return done(null, false, { message: "Invalid username/email or password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

exports.registration = function registration(req, res, next) {
  passport.authenticate("registration", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info?.message || "Registration failed." });

    req.logIn(user, (loginError) => {
      if (loginError) return next(loginError);
      return res.status(201).json({
        username: user.username,
        message: "Registration successful."
      });
    });
  })(req, res, next);
};

exports.login = function login(req, res, next) {
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials." });

    req.logIn(user, (loginError) => {
      if (loginError) return next(loginError);
      return res.json({
        username: user.username,
        message: "Login successful."
      });
    });
  })(req, res, next);
};
