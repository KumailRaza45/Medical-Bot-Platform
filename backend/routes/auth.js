const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Google OAuth Routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email 
        },
        process.env.JWT_SECRET || 'karetek_secret_key_2025',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendURL}/auth/callback?token=${token}&provider=google`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=token_generation_failed`);
    }
  }
);

// Facebook OAuth Routes
router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['email'],
    session: false 
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=facebook_auth_failed`
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email 
        },
        process.env.JWT_SECRET || 'karetek_secret_key_2025',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendURL}/auth/callback?token=${token}&provider=facebook`);
    } catch (error) {
      console.error('Facebook callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=token_generation_failed`);
    }
  }
);

module.exports = router;
