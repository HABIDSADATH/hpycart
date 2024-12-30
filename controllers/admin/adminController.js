const User = require('../../models/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



const pageerror=async(req,res)=>{
  res.render("admin-error")
}

const loadLogin = (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render("admin-login", { message: null });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, isAdmin: true });
   
    if (!admin) {
      
      return res.render("admin-login", { message: "You are not an admin!" });
    }

    
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (passwordMatch) {
      req.session.admin = admin._id;
      return res.redirect("/admin");
    } else {
     
      return res.render("admin-login", { message: "Incorrect password!" });
    }
  } catch (error) {
    console.error("Login error:", error);
  
    return res.render("admin-login", { message: "An unexpected error occurred. Please try again." });
  }
};


const loadDashboard = async (req, res) => {
  if (req.session.admin) {
    try {
      res.render("dashboard");
    } catch (error) {
      res.redirect("/pageerror");
    }
  } else {
    return res.redirect("/login"); 
  }
};

const logout=async (req,res)=>{
  try {
    req.session.destroy(err =>{
      if(err){
        console.log("Error destroying session",err);
        return res.redirect("/pageerror")
      }
      res.redirect("/admin/login")
    })
  } catch (error) {
    console.log("unextecpted error during logout",error)
    res.redirect("/pageerror")
  }
}

module.exports = {
  loadLogin,
  login,
  loadDashboard,
  pageerror,
  logout,
};
