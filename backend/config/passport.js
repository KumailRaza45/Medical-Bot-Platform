const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const supabase = require('./supabase');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          
          // Check if user exists
          const { data: existingUsers, error: searchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

          if (searchError) {
            console.error('Supabase search error:', searchError);
            return done(searchError, null);
          }

          const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

          if (existingUser) {
            // Update OAuth info if needed
            if (!existingUser.oauth_provider || existingUser.oauth_provider !== 'google') {
              await supabase
                .from('users')
                .update({
                  oauth_provider: 'google',
                  oauth_id: profile.id,
                  profile_picture: profile.photos[0]?.value
                })
                .eq('id', existingUser.id);
            }
            return done(null, existingUser);
          }

          // Create new user
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              email: email,
              first_name: profile.name.givenName,
              last_name: profile.name.familyName,
              oauth_provider: 'google',
              oauth_id: profile.id,
              profile_picture: profile.photos[0]?.value,
              email_verified: true
            })
            .select()
            .single();

          if (createError) throw createError;
          done(null, newUser);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'picture.type(large)']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          
          if (!email) {
            return done(new Error('No email provided by Facebook'), null);
          }

          // Check if user exists
          const { data: existingUsers, error: searchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

          if (searchError) {
            console.error('Supabase search error:', searchError);
            return done(searchError, null);
          }

          const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

          if (existingUser) {
            // Update OAuth info if needed
            if (!existingUser.oauth_provider || existingUser.oauth_provider !== 'facebook') {
              await supabase
                .from('users')
                .update({
                  oauth_provider: 'facebook',
                  oauth_id: profile.id,
                  profile_picture: profile.photos[0]?.value
                })
                .eq('id', existingUser.id);
            }
            return done(null, existingUser);
          }

          // Create new user
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              email: email,
              first_name: profile.name.givenName,
              last_name: profile.name.familyName,
              oauth_provider: 'facebook',
              oauth_id: profile.id,
              profile_picture: profile.photos[0]?.value,
              email_verified: true
            })
            .select()
            .single();

          if (createError) throw createError;
          done(null, newUser);
        } catch (error) {
          console.error('Facebook OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
