'use strict';

// GET /api/me -> infos de l'utilisateur connecte (role + equipe)
module.exports = ({ strapi }) => ({
  async me(ctx) {
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: ['role', 'team'],
    });

    ctx.body = {
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.type,
        team: user.team ? user.team.name : null,
      },
    };
  },
});
