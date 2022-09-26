const router = require('express').Router();
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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

//create user
router.post('/users/signup', async (req, res, next) => {
  try {
    const user = await prisma.user.create({
      data: req.body
    })
    res.json(user)
  } catch (error) {
    console.log(error)
    next(error)
  }
});


//update user
router.patch('/users/:id', async (req, res, next) => {
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

router.delete('/users/:id', async (req, res, next) => {
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
