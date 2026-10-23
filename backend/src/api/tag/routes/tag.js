'use strict';

const { factories } = require('@strapi/strapi');

// on expose seulement la liste des tags (ils sont geres dans l'admin)
module.exports = factories.createCoreRouter('api::tag.tag', {
  only: ['find'],
});
