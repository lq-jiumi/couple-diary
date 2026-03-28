const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.post('/', uploadController.uploadImage);
router.delete('/:filename', uploadController.deleteImage);

module.exports = router;
