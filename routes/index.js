const express = require('express');
const router = express.Router();
const userModel = require('./users'); // This is your mongoose model with passport-local-mongoose
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

// Passport setup
passport.use(new localStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// Middleware to check if a user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Profile route
router.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const currentUser = await userModel.findById(req.user._id)
      .populate('friends', 'FullName username profilePicture')
      .populate('requests', 'FullName username profilePicture')
      .exec();

    // all users except current one
    const users = await userModel.find({ _id: { $ne: req.user._id } });

    res.render('./pages/profile', {
      currentUser,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// Signup route
router.post('/signup', (req, res) => {
  const { username, FullName, password } = req.body;
  const userData = new userModel({ username, FullName});

  userModel.register(userData, password)
    .then(() => {
      passport.authenticate('local')(req, res, () => res.redirect('/home'));
    })
    .catch(err => res.status(500).send('Registration failed: ' + err.message));
});

// Login route
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: false
  })
);
router.get('/home', isLoggedIn, async (req, res) => {
  try {
    const currentUser = await userModel.findById(req.user._id)
    .populate('friends')
    const users = await userModel.find({ _id: { $ne: req.user._id } });

    res.render('./pages/home', {
      currentUser,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Signup page
router.get('/', (req, res) => res.render('./Auth/signup'));

// Login page
router.get('/login', (req, res) => res.render('./Auth/login'));

module.exports = router;
