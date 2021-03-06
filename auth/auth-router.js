const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Users = require("../users/users-model")
const restrict = require("../middleware/restrict")

const router = express.Router()

// Worked on Insomnia
router.post("/api/register", async (req, res, next) => {
  try {
    const { username } = req.body
    const user = await Users.findBy({ username }).first()
    
    if (user) {
      return res.status(409).json({
        message: "Username is already taken",
      })
    }

    res.status(201).json(await Users.add(req.body))
  } catch(err) {
      next(err)
  }
})

// Worked on Insomnia
router.post("/api/login", async (req, res, next) => {
  const authError = {
    message: "Invalid Credentials",
  }

  try {
    const user = await Users.findBy({ username: req.body.username }).first()
    if(!user) {
      return req.status(401).json(authError)
    }

    const passwordValid = await bcrypt.compare(req.body.password, user.password)
    if (!passwordValid) {
      return res.status(401).json(authError)
    }

    const tokenPayload = {
      userId: user.id, 
      userRole: "admin", // this would normally come from the db
    }

    // this sends the token back as a cookie instea of in the request body, 
    // so the client will automatically save it in its cookie jar.
    res.cookie("token", jwt.sign(tokenPayload, process.env.JWT_SECRET))

    res.json({
      message: `Welcome ${user.username}!`,
    })
  } catch(err) {
      next(err)
  }
})

module.exports = router