'use strict';

// Pas de CRUD classique sur les moods : personne ne peut lister les humeurs individuelles.
// On expose seulement ces routes.

function getDays(value, defaultValue, max) {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1) return defaultValue;
  return Math.min(n, max);
}

module.exports = ({ strapi }) => ({
  // GET /api/moods/today
  async today(ctx) {
    const mood = await strapi.service('api::mood.mood').getToday(ctx.state.user);
    ctx.body = { data: mood };
  },

  // PUT /api/moods/today
  async submit(ctx) {
    const body = ctx.request.body.data || ctx.request.body;
    const result = await strapi
      .service('api::mood.mood')
      .saveToday(ctx.state.user, body.score, body.tags || []);
    ctx.status = result.created ? 201 : 200;
    ctx.body = { data: result.mood };
  },

  // GET /api/moods/history?days=7
  async history(ctx) {
    const days = getDays(ctx.query.days, 7, 30);
    ctx.body = { data: await strapi.service('api::mood.mood').getHistory(ctx.state.user, days) };
  },

  // GET /api/moods/team-stats?days=30 (manager)
  async teamStats(ctx) {
    const days = getDays(ctx.query.days, 30, 90);
    ctx.body = { data: await strapi.service('api::mood.mood').getTeamStats(ctx.state.user, days) };
  },
});
