const router = require('express').Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authenticateToken = require('../middleware/auth.js').authenticateToken
require('dotenv').config()
//get all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({})
    res.json(users)
  } catch (error) {
    console.log(error)
    throw error
  }
});


//get one user by ID
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: {
        id: id
      }
    })
    res.json(user)
  } catch (error) {
    console.log(error)
    throw error
  }
});


//sign in
router.post('/users/login', async (req, res, next) => {

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email
    }
  })
  if (!user) {
    return res.status(400).send('Username or Password is incorrect')
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      console.log('login successful');
    } else {
      res.send('Invalid Username or Password')
      return
    }
  } catch (error) {
    res.status(500).send
  }
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

  res.json({
    accessToken: accessToken,
    id: user.id
  })
});



//create user
router.post('/users/signup', async (req, res, next) => {
  const exists = await prisma.user.count({
    where: {
      email: req.body.email
    }
  })
  if (exists) {
    res.send("A user with this Email Already Exists")
    return
  }
  try {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      }
    })
    res.json(user)
  } catch (error) {
    console.log(error)
    next(error)
  }
});


//update user
router.patch('/users/:id', authenticateToken, async (req, res, next) => {
  const authorized = req.user.role === 'ADMIN' || req.user.id === req.params.id ? true : false
  if(!authorized) {
    console.log('invalid permissions');
    return res.status(401).send('invalid permissions')
  }
  try {
    const { id } = req.params
    const user = await prisma.user.update({
      where: {
        id: id
      },
      data: req.body
    })
    res.json(user)
  } catch (error) {
    console.log(error)
    next(error)
  }
});


//delete user
router.delete('/users/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params
    const deletedUser = await prisma.user.delete({
      where: {
        id: id
      }
    })
    res.json(deletedUser)
  } catch (error) {
    next(error)
  }
});


module.exports = router;
