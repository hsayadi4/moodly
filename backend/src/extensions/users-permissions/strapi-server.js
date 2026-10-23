'use strict';

// ajout d'un champ "team" sur les utilisateurs
module.exports = (plugin) => {
  plugin.contentTypes.user.schema.attributes.team = {
    type: 'relation',
    relation: 'manyToOne',
    target: 'api::team.team',
    inversedBy: 'members',
  };
  return plugin;
};
