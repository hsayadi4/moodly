'use strict';

const { setupPermissions } = require('./bootstrap/permissions');

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    // creation des roles employe / manager + leurs droits
    await setupPermissions(strapi);
  },
};
