// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config');

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);

// default value for title local
const projectName = 'lab-express-basic-auth';
const capitalized = string => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}- Generated with Ironlauncher`;

// session config
const session = require('express-session');
const MongoStore = require('connect-mongo')

// passport config
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('./models/User');

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

// github strategy
const GitHubStrategy = require('passport-github').Strategy

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // User.findOrCreate({ githubId: profile.id }, function (err, user) {
      //   return done(err, user);
      // });
    const user = await User.findOne(({ githubId: profile.id }))
      if (user) {
        // pass the user obj to passport serialize 
        done(null, user)
      } else {
        // create a user first
        const createdUser = await User.create({ githubId: profile.id })
        done(null, createdUser)
      }
    } catch (err) {
      done(err)
    }
  }
))

// register the local strategy
// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const user = User.findOne({ username: username })
//       if (!user) {
//         done(null, false, { message: 'wrong credentials' })
//       }
//       if (!bcrypt.compareSync(password, user.password)) {
//         return done(null, false, { message: 'wrong credentials' });
//       }

//       done(null, user)
//     } catch (error) {
//       done(error)
//     }
//   })
// )

const DB_URL = process.env.MONGO_URI

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: DB_URL
    })
  })
)

app.use(passport.initialize());
app.use(passport.session());

// 👇 Start handling routes here
const index = require('./routes/index');
const authRouter = require('./routes/auth')
const passportRouter = require('./routes/passport')

app.use('/', index);
app.use('/', authRouter);
app.use('/', passportRouter);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;

