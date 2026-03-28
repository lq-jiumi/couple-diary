const admin = require('firebase-admin');
const db = require('../config/firebase');

class DiaryController {
  async getEntries(req, res) {
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      if (!userData.coupleId) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      const { year, month } = req.query;
      let query = db.collection('diary_entries')
        .where('coupleId', '==', userData.coupleId);

      if (year && month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
        query = query.where('date', '>=', startDate).where('date', '<=', endDate);
      }

      const snapshot = await query.orderBy('date', 'desc').get();

      const entries = [];
      snapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() });
      });

      res.json({ entries });
    } catch (error) {
      console.error('Get entries error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getEntryByDate(req, res) {
    try {
      const { date } = req.params;
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      if (!userData.coupleId) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      const snapshot = await db.collection('diary_entries')
        .where('coupleId', '==', userData.coupleId)
        .where('date', '==', date)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.json({ entry: null });
      }

      let entry = null;
      snapshot.forEach(doc => {
        entry = { id: doc.id, ...doc.data() };
      });

      res.json({ entry });
    } catch (error) {
      console.error('Get entry by date error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createEntry(req, res) {
    try {
      const { date, content, images } = req.body;
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      if (!userData.coupleId) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      const existingSnapshot = await db.collection('diary_entries')
        .where('coupleId', '==', userData.coupleId)
        .where('date', '==', date)
        .limit(1)
        .get();

      if (!existingSnapshot.empty) {
        return res.status(400).json({ error: 'Entry already exists for this date' });
      }

      const entryRef = await db.collection('diary_entries').add({
        coupleId: userData.coupleId,
        date,
        content: content || '',
        images: images || [],
        createdBy: req.user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json({
        message: 'Entry created successfully',
        entry: {
          id: entryRef.id,
          coupleId: userData.coupleId,
          date,
          content,
          images,
        },
      });
    } catch (error) {
      console.error('Create entry error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateEntry(req, res) {
    try {
      const { date } = req.params;
      const { content, images } = req.body;
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      if (!userData.coupleId) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      const snapshot = await db.collection('diary_entries')
        .where('coupleId', '==', userData.coupleId)
        .where('date', '==', date)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      let entryId;
      snapshot.forEach(doc => {
        entryId = doc.id;
      });

      await db.collection('diary_entries').doc(entryId).update({
        content: content || '',
        images: images || [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user.uid,
      });

      res.json({
        message: 'Entry updated successfully',
        entry: {
          id: entryId,
          date,
          content,
          images,
        },
      });
    } catch (error) {
      console.error('Update entry error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteEntry(req, res) {
    try {
      const { date } = req.params;
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      if (!userData.coupleId) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      const snapshot = await db.collection('diary_entries')
        .where('coupleId', '==', userData.coupleId)
        .where('date', '==', date)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      let entryId;
      snapshot.forEach(doc => {
        entryId = doc.id;
      });

      await db.collection('diary_entries').doc(entryId).delete();

      res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
      console.error('Delete entry error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DiaryController();
