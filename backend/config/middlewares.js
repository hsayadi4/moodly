module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    // le front (vite / capacitor) n'est pas sur la meme origine que l'api
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGINS', ['*']),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
