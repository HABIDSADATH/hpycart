const User = require('../models/userSchema');

const userAuth = (req, res, next) => {
  if (req.session.admin) {
    console.log(req.session.admi)
    User.findById(req.session.user)
      .then(user => {
        if (user && !user.isBlocked) {
          next();
        } else {
          console.warn("User is blocked or not found:", req.session.user);
          res.redirect("/login");
        }
      })
      .catch(error => {
        console.error("Error in userAuth middleware:", error);
        res.status(500).send("An unexpected error occurred.");
      });
  } else {
    console.warn("Unauthorized access attempt: No user session.");
    res.redirect("/login");
  }
};

const adminAuth = (req, res, next) => {
  if (req.session.user) {
    console.log("Session user ID:", req.session.user);
    User.findById(req.session.user)
      .then(user => {
        if (!user) {
          console.warn("User not found for session ID:", req.session.user);
          return res.redirect("/admin/login");
        }
        if (!User.isAdmin) {
          console.warn("User is not an admin:", user);
          return res.redirect("/admin/login");
        }
        console.log("Admin verified:", user);
        next();
      })
      .catch(error => {
        console.error("Error in adminAuth middleware:", error);
        res.status(500).send("An unexpected error occurred.");
      });
  } else {
    console.warn("Unauthorized admin access attempt: No user session.");
    res.redirect("/admin/login");
  }
};

module.exports = {
  userAuth,
  adminAuth
};
