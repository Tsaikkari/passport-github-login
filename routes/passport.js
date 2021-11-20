const router = require("express").Router();
const passport = require('passport');

router.get('/github', passport.authenticate('github'))


// router.get('/auth/github/callback', 
//   passport.authenticate('github'), {
//   successRedirect: '/profile',
//   failureRedirect: '/login'
// })

router.get('/auth/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/index'
  }),
  (req, res) => {
    // Successful authentication, redirect to profile.
    res.redirect('/profile');
  });

// router.post('/login', passport.authenticate('local', {
//   successRedirect: '/profile',
// 	failureRedirect: '/login',
// 	passReqToCallback: true
// }))

module.exports = router
