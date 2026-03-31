const { supabase } = require('../config/supabase');

class CoupleController {
  async getCoupleInfo(req, res) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userData.coupleid) {
        return res.json({
          couple: null,
          isBound: false,
          anniversaries: userData.anniversaries || [],
        });
      }

      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .eq('id', userData.coupleid)
        .single();

      let partnerData = null;
      if (userData.partnerid) {
        const { data: partner, error: partnerError } = await supabase
          .from('users')
          .select('id, email, displayname')
          .eq('id', userData.partnerid)
          .single();

        if (!partnerError) {
          partnerData = {
            uid: partner.id,
            email: partner.email,
            displayName: partner.displayname,
          };
        }
      }

      res.json({
        couple: couple || null,
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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('coupleid')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (userData.coupleid) {
        return res.status(400).json({ error: 'Already bound to a couple' });
      }

      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: inviteError } = await supabase
        .from('invites')
        .insert({
          id: inviteCode,
          createdby: req.user.uid,
          createdat: new Date(),
          expiresat: expiresAt,
          used: false,
          usedby: null,
        });

      if (inviteError) {
        return res.status(500).json({ error: inviteError.message });
      }

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

      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('id', inviteCode)
        .single();

      if (inviteError) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }

      if (invite.used) {
        return res.status(400).json({ error: 'Invite code already used' });
      }

      if (invite.expiresat < new Date()) {
        return res.status(400).json({ error: 'Invite code has expired' });
      }

      if (invite.createdby === req.user.uid) {
        return res.status(400).json({ error: 'Cannot use your own invite code' });
      }

      const coupleId = invite.createdby + '_' + req.user.uid;

      const { error: coupleError } = await supabase
        .from('couples')
        .insert({
          id: coupleId,
          createdat: new Date(),
          member1: invite.createdby,
          member2: req.user.uid,
        });

      if (coupleError) {
        return res.status(500).json({ error: coupleError.message });
      }

      const { error: user1Error } = await supabase
        .from('users')
        .update({ coupleid: coupleId, partnerid: invite.createdby })
        .eq('id', req.user.uid);

      if (user1Error) {
        return res.status(500).json({ error: user1Error.message });
      }

      const { error: user2Error } = await supabase
        .from('users')
        .update({ coupleid: coupleId, partnerid: req.user.uid })
        .eq('id', invite.createdby);

      if (user2Error) {
        return res.status(500).json({ error: user2Error.message });
      }

      const { error: updateInviteError } = await supabase
        .from('invites')
        .update({ used: true, usedby: req.user.uid })
        .eq('id', inviteCode);

      if (updateInviteError) {
        return res.status(500).json({ error: updateInviteError.message });
      }

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

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userData.coupleid) {
        return res.status(400).json({ error: 'Not bound to any couple' });
      }

      const partnerId = userData.partnerid;

      const { error: user1Error } = await supabase
        .from('users')
        .update({ coupleid: null, partnerid: null })
        .eq('id', req.user.uid);

      if (user1Error) {
        return res.status(500).json({ error: user1Error.message });
      }

      if (partnerId) {
        const { error: user2Error } = await supabase
          .from('users')
          .update({ coupleid: null, partnerid: null })
          .eq('id', partnerId);

        if (user2Error) {
          return res.status(500).json({ error: user2Error.message });
        }
      }

      const { error: deleteCoupleError } = await supabase
        .from('couples')
        .delete()
        .eq('id', userData.coupleid);

      if (deleteCoupleError) {
        return res.status(500).json({ error: deleteCoupleError.message });
      }

      res.json({ message: 'Successfully unbound from couple' });
    } catch (error) {
      console.error('Unbind couple error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateAnniversary(req, res) {
    try {
      const { anniversaries } = req.body;

      const { error: updateError } = await supabase
        .from('users')
        .update({ anniversaries: anniversaries || [] })
        .eq('id', req.user.uid);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

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
