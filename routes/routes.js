const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer'); //for image upload
const fs = require('fs');
// image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    // console.log('filename', file);
    cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
  },
});
let upload = multer({ storage: storage }).single('image');
// inserting an user into database route
router.post('/add', upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  user
    .save()
    .then(() => {
      req.session.message = {
        type: 'success',
        message: 'User added successfully',
      };
      res.redirect('/');
    })
    .catch((err) => {
      res.json({ message: err.message, type: 'danger' });
    });
});

// get all users router

router.get('/', async (req, res) => {
  User.find()
    .then((users) => {
      res.render('index', {
        title: 'Home Page',
        users: users,
      });
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

router.get('/add', (req, res) => {
  res.render('addUsers', { title: 'Add Page' });
});

// edit an user route
router.get('/edit/:id', async (req, res) => {
  // console.log(req.params);

  try {
    const user = await User.findById(req.params.id);
    res.render('editUsers', {
      title: 'Edit User',
      user: user,
    });
  } catch (error) {
    res.redirect('/');
  }
});

// update user route
router.post('/update/:id', upload, async (req, res) => {
  const id = req.params.id;
  let new_image = '';
  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync('./uploads' + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found', type: 'danger' });
    } else {
      fs.unlinkSync(`./uploads/${updatedUser.image}`);

      req.session.message = {
        type: 'success',
        message: 'User Updated Successfully',
      };
      res.redirect('/');
    }
  } catch (err) {
    res.status(500).json({
      message: 'Error updating user',
      type: 'danger',
      error: err.message,
    });
  }
});

// delete user route
router.get('/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    let deletedUser = await User.findOneAndDelete(id);
    if (!deletedUser) {
      res.json({ message: 'User not deleted', type: 'danger' });
    } else {
      fs.unlinkSync(`./uploads/${deletedUser.image}`);
      req.session.message = {
        type: 'success',
        message: 'User Deleted Successfully',
      };
    }
    res.redirect('/');
  } catch (err) {
    res.status(500).json({
      message: 'User Not deleted Error',
      type: 'danger',
      error: err.message,
    });
  }
});

module.exports = router;
