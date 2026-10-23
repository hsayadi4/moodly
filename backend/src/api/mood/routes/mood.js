'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/moods/today', handler: 'mood.today' },
    { method: 'PUT', path: '/moods/today', handler: 'mood.submit' },
    { method: 'GET', path: '/moods/history', handler: 'mood.history' },
    {
      method: 'GET',
      path: '/moods/team-stats',
      handler: 'mood.teamStats',
      config: { policies: ['global::is-manager'] },
    },
  ],
};
