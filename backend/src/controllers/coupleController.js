const admin = require('firebase-admin');
const db = require('../config/firebase');

class CoupleController {
  async getCoupleInfo(req, res) {
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      if (!userData.coupleId) {
        return res.json({
          couple: null,
          isBound: false,
          anniversaries: userData.anniversaries || [],
        });
      }

      const coupleDoc = await db.collection('couples').doc(userData.coupleId).get();
      const partnerId = userData.partnerId;

      let partnerData = null;
      if (partnerId) {
        const partnerDoc = await db.collection('users').doc(partnerId).get();
        if (partnerDoc.exists) {
          partnerData = {
            uid: partnerDoc.id,
            email: partnerDoc.data().email,
            displayName: partnerDoc.data().displayName,
          };
        }
      }

      res.json({
        couple: coupleDoc.exists ? { id: coupleDoc.id, ...coupleDoc.data() } : null,
        isBound: true,
        partner: partnerData,
        anniversaries: userData.anniversaries || [],
      });
    } catch (error) {
      console.error('Get couple info error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createInviteCode(req, res) {
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      if (userData.coupleId) {
        return res.status(400).json({ error: 'Already bound to a couple' });
      }

      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await db.collection('invites').doc(inviteCode).set({
        createdBy: req.user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: expiresAt,
        used: false,
        usedBy: null,
      });

      res.json({
        inviteCode,
        expiresAt: expiresAt.toISOString(),
        inviteLink: `couple-diary://join?code=${inviteCode}`,
      });
    } catch (error) {
      console.error('Create invite error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async joinWithCode(req, res) {
    try {
      const { inviteCode } = req.body;

      if (!inviteCode) {
        return res.status(400).json({ error: 'Invite code is required' });
      }

      const inviteDoc = await db.collection('invites').doc(inviteCode).get();

      if (!inviteDoc.exists) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }

      const inviteData = inviteDoc.data();

      if (inviteData.used) {
        return res.status(400).json({ error: 'Invite code already used' });
      }

      if (inviteData.expiresAt.toDate() < new Date()) {
        return res.status(400).json({ error: 'Invite code has expired' });
      }

      if (inviteData.createdBy === req.user.uid) {
        return res.status(400).json({ error: 'Cannot use your own invite code' });
      }

      const coupleId = inviteData.createdBy + '_' + req.user.uid;

      await db.collection('couples').doc(coupleId).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        member1: inviteData.createdBy,
        member2: req.user.uid,
      });

      await db.collection('users').doc(req.user.uid).update({
        coupleId,
        partnerId: inviteData.createdBy,
      });

      await db.collection('users').doc(inviteData.createdBy).update({
        coupleId,
        partnerId: req.user.uid,
      });

      await db.collection('invites').doc(inviteCode).update({
        used: true,
        usedBy: req.user.uid,
      });

      res.json({
        message: 'Successfully joined couple',
        coupleId,
      });
    } catch (error) {
      console.error('Join with code error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async unbindCouple(req, res) {
    try {
      const { confirm } = req.body;

      if (!confirm) {
        return res.status(400).json({ error: 'Confirmation required' });
      }

      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      if (!userData.coupleId) {
        return res.status(400).json({ error: 'Not bound to any couple' });
      }

      const partnerId = userData.partnerId;

      await db.collection('users').doc(req.user.uid).update({
        coupleId: null,
        partnerId: null,
      });

      if (partnerId) {
        await db.collection('users').doc(partnerId).update({
          coupleId: null,
          partnerId: null,
        });
      }

      await db.collection('couples').doc(userData.coupleId).delete();

      res.json({ message: 'Successfully unbound from couple' });
    } catch (error) {
      console.error('Unbind couple error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateAnniversary(req, res) {
    try {
      const { anniversaries } = req.body;

      await db.collection('users').doc(req.user.uid).update({
        anniversaries: anniversaries || [],
      });

      res.json({ message: 'Anniversaries updated', anniversaries });
    } catch (error) {
      console.error('Update anniversary error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = new CoupleController();
