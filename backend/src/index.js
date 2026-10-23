'use strict';

const { setupPermissions } = require('./bootstrap/permissions');
const { seedDemoData } = require('./bootstrap/demo-data');

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    // creation des roles employe / manager + leurs droits
    const roles = await setupPermissions(strapi);

    // donnees de demo (seulement si SEED_DEMO=true et base vide)
    if (process.env.SEED_DEMO === 'true') {
      await seedDemoData(strapi, roles);
    }
  },
};
