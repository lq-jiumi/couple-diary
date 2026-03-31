const { supabase } = require('../config/supabase');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // 使用管理员API创建用户，避免发送验证邮件
      const { data: user, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // 自动确认邮箱，避免发送验证邮件
        user_metadata: {
          displayName: displayName || email.split('@')[0],
        }
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // 登录用户以获取访问令牌
      const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        return res.status(401).json({ error: loginError.message });
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.user.id,
          email,
          displayname: displayName || email.split('@')[0],
          createdat: new Date(),
          coupleid: null,
          partnerid: null,
        })
        .select();

      if (profileError) {
        return res.status(400).json({ error: profileError.message });
      }

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          uid: user.user.id,
          email: user.user.email,
          displayName: displayName || email.split('@')[0],
        },
        token: session.session.access_token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const { data: user, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return res.status(401).json({ error: authError.message });
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Login successful',
        user: {
          uid: user.user.id,
          email: user.user.email,
          displayName: userData.displayname,
          coupleId: userData.coupleid,
          partnerId: userData.partnerid,
        },
        token: user.session.access_token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req, res) {
    res.json({ message: 'Logout successful' });
  }

  async getCurrentUser(req, res) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.uid)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'User not found' });
      }

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
        user: {
          uid: req.user.uid,
          email: userData.email,
          displayName: userData.displayname,
          coupleId: userData.coupleid,
          partnerId: userData.partnerid,
        },
        partner: partnerData,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
