const router = require('express').Router()
const bcrypt = require('bcryptjs')

const User = require('../models/User')
const { loginCheck, isLoggedOut } = require('../middlewares/route-guard.js')

router.get('/signup', isLoggedOut(), (req, res, next) => {
  res.render('signup')
})

router.get('/login', isLoggedOut(), (req, res, next) => {
  res.render('login')
})

router.get('/main', (req, res, next) => {
  res.render('main')
})

router.get('/private', loginCheck(), (req, res, next) => {
  res.render('private')
})

router.get('/profile', loginCheck(), (req, res, next) => {
  const loggedInUser = req.session.user
  res.render('profile', { user: loggedInUser })
})

router.post('/signup', async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (password.length < 10) {
      res.render('signup', { message: 'Your password is too short' })
      return
    }
    if (username.length === 0) {
      res.render('signup', { message: 'No username'})
      return
    }

    const exists = await User.findOne({
      username: username
    })

    if (exists) {
      res.render('signup')
      return next(new Error(`Username ${username} already exists.`))
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    User.create({
      username,
      password: hashedPassword
    })

    res.redirect('/login')

  } catch (error) {
    next(new Error(error.message))
  }
})

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body
  const user = await User.findOne({ username: username })

  if (!user) {
    res.render('/login')
    return next(new Error('Invalid credentials'))
  }

  if (bcrypt.compareSync(password, user.password)) {
    req.session.user = user
    res.redirect('/profile')
  } else {
    res.render('login', { message: 'Invalide credentials' })
  }
})

router.get('/logout', (req, res, next) => {
  // req.logout()
  // res.redirect('/')
  req.session.destroy(err => {
    if (err) {
      next(err)
    } else {
      res.redirect('/')
    }
  })
}) 

module.exports = router