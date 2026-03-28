const express = require('express');
const router = express.Router();
const coupleController = require('../controllers/coupleController');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.get('/', coupleController.getCoupleInfo);
router.post('/invite', coupleController.createInviteCode);
router.post('/join', coupleController.joinWithCode);
router.post('/unbind', coupleController.unbindCouple);
router.put('/anniversary', coupleController.updateAnniversary);

module.exports = router;
