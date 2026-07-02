const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(null, false, { message: "No email found in Google profile" });
        }

        // 1. Check if user already exists by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // 2. Check if a local account exists with the same email
        user = await User.findOne({ email });

        if (user) {
          // Link Google to existing local account
          user.googleId = profile.id;
          user.authProvider = "google";
          if (avatar && !user.avatar) user.avatar = avatar;
          await user.save();
          return done(null, user);
        }

        // 3. Brand new user — create account (auto-verified via Google)
        user = await User.create({
          username: profile.displayName || email.split("@")[0],
          email,
          googleId: profile.id,
          authProvider: "google",
          avatar,
          isVerified: true,   // Google already verified the email
          role: "USER",
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
