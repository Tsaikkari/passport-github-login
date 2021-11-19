const loginCheck = () => {
  return (req, res, next) => {
    if (req.user) {
      next()
    } else {
      res.redirect('/login')
    }
  }
}

const isLoggedOut = () => {
  return (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/main')
    }
    next()
  }
}

module.exports = { loginCheck, isLoggedOut }