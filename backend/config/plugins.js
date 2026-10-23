module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      // jwt simple (plus facile a gerer dans l'app mobile)
      jwtManagement: 'legacy-support',
      jwt: {
        expiresIn: env('JWT_EXPIRES_IN', '7d'),
      },
    },
  },
});
