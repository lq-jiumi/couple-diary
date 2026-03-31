const { supabase } = require('../config/supabase');

class DiaryController {
  async getEntries(req, res) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('coupleid')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userData.coupleid) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      const { year, month } = req.query;
      let query = supabase
        .from('diary_entries')
        .select('*')
        .eq('coupleid', userData.coupleid)
        .order('date', { ascending: false });

      if (year && month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
        query = query
          .gte('date', startDate)
          .lte('date', endDate);
      }

      const { data: entries, error: entriesError } = await query;

      if (entriesError) {
        return res.status(500).json({ error: entriesError.message });
      }

      res.json({ entries });
    } catch (error) {
      console.error('Get entries error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getEntryByDate(req, res) {
    try {
      const { date } = req.params;
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('coupleid')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userData.coupleid) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      const { data: entry, error: entryError } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('coupleid', userData.coupleid)
        .eq('date', date)
        .single();

      if (entryError && entryError.code === 'PGRST116') {
        return res.json({ entry: null });
      }

      if (entryError) {
        return res.status(500).json({ error: entryError.message });
      }

      res.json({ entry });
    } catch (error) {
      console.error('Get entry by date error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createEntry(req, res) {
    try {
      const { date, content, images } = req.body;
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('coupleid')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userData.coupleid) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      const { data: existingEntry, error: existingError } = await supabase
        .from('diary_entries')
        .select('id')
        .eq('coupleid', userData.coupleid)
        .eq('date', date)
        .single();

      if (!existingError) {
        return res.status(400).json({ error: 'Entry already exists for this date' });
      }

      const { data: newEntry, error: createError } = await supabase
        .from('diary_entries')
        .insert({
          coupleid: userData.coupleid,
          date,
          content: content || '',
          images: images || [],
          createdby: req.user.uid,
          createdat: new Date(),
          updatedat: new Date(),
        })
        .select();

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      res.status(201).json({
        message: 'Entry created successfully',
        entry: newEntry[0],
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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('coupleid')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userData.coupleid) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      const { data: entry, error: entryError } = await supabase
        .from('diary_entries')
        .select('id')
        .eq('coupleid', userData.coupleid)
        .eq('date', date)
        .single();

      if (entryError) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      const { data: updatedEntry, error: updateError } = await supabase
        .from('diary_entries')
        .update({
          content: content || '',
          images: images || [],
          updatedat: new Date(),
          updatedby: req.user.uid,
        })
        .eq('id', entry.id)
        .select();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      res.json({
        message: 'Entry updated successfully',
        entry: updatedEntry[0],
      });
    } catch (error) {
      console.error('Update entry error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteEntry(req, res) {
    try {
      const { date } = req.params;
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('coupleid')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userData.coupleid) {
        return res.status(400).json({ error: 'Not bound to a couple' });
      }

      const { data: entry, error: entryError } = await supabase
        .from('diary_entries')
        .select('id')
        .eq('coupleid', userData.coupleid)
        .eq('date', date)
        .single();

      if (entryError) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      const { error: deleteError } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entry.id);

      if (deleteError) {
        return res.status(500).json({ error: deleteError.message });
      }

      res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
      console.error('Delete entry error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DiaryController();
