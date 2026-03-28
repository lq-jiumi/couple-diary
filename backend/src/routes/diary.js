const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.get('/', diaryController.getEntries);
router.get('/:date', diaryController.getEntryByDate);
router.post('/', diaryController.createEntry);
router.put('/:date', diaryController.updateEntry);
router.delete('/:date', diaryController.deleteEntry);

module.exports = router;
