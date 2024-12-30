const User = require("../../models/userSchema");
const env = require('dotenv').config();
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

const pageNotFound = async (req, res) => {
  try {
    res.render("page-404");
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

const loadHomepage = async (req, res) => {
  try {
    const sessionUser = req.session.user;

    if (sessionUser) {
      const userData = await User.findOne({ _id: sessionUser });
      if (userData) {
        return res.render('home', { user: userData });
      }
    }
    return res.render('home', { user: null });
  } catch (error) {
    console.error("Home page error", error);
    res.status(500).send("Server error");
  }
};

const loadSignup = async (req, res) => {
  try {
    return res.render("signup");
  } catch (error) {
    console.log("Signup page not found");
    res.status(500).send("Server error");
  }
};

async function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVarificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP: ${otp}</b>`
    });

    return info.accepted.length > 0;
  } catch (error) {
    console.error("Error sending email", error);
    return false;
  }
}

const signup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.render("signup", { message: "User with this email already exists" });
    }

    const otp = await generateOtp();
    const emailSend = await sendVarificationEmail(email, otp);

    if (!emailSend) {
      return res.render("signup", { message: "Failed to send verification email" });
    }

    req.session.userOtp = otp;
    req.session.userData = { name, phone, email, password };

    console.log("OTP sent", otp);
    res.render("verify-otp");
  } catch (error) {
    console.error("Signup error", error);
    res.redirect("/pageNotFound");
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.error("Error securing password", error);
    throw error;
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (otp === req.session.userOtp) {
      const user = req.session.userData;
      const passwordHash = await securePassword(user.password);

      const saveUserData = new User({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: passwordHash
      });

      await saveUserData.save();
      req.session.user = saveUserData._id;
      res.json({ success: true, redirectUrl: "/" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
    }
  } catch (error) {
    console.error("Error verifying OTP", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

const loadLogin = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("login");
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    return res.redirect("/pageNotFound");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ isAdmin: 0, email });

    if (!findUser) {
      return res.render("login", { message: "User not found" });
    }

    if (findUser.isBlocked) {
      return res.render("login", { message: "Your account is blocked, please contact admin" });
    }

    const passwordMatch = await bcrypt.compare(password, findUser.password);

    if (!passwordMatch) {
      return res.render("login", { message: "Incorrect password" });
    }

    req.session.user = findUser._id;
    return res.redirect("/");
  } catch (error) {
    console.error("Login error", error);
    return res.render("login", { message: "Login failed, please try again" });
  }
};

const logout = async (req,res)=>{
  try {
    req.session.destroy((err)=>{
      if(err){
        console.log("Session destruction error",err)
        return res.redirect("/pageNotFound");
      }
      return res.redirect("/login");
    })
  } catch (error) {
      console.log("logout error",error)
      return res.redirect("/pageNotFound");
  }
}

module.exports = {
  loadHomepage,
  pageNotFound,
  loadSignup,
  signup,
  verifyOtp,
  loadLogin,
  login,
  logout,
};
