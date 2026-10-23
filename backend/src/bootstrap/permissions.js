'use strict';

// Creation des roles Employe et Manager avec leurs permissions au demarrage.
// Comme ca pas besoin de cocher les cases a la main dans l'admin Strapi.

const employeeActions = [
  'api::account.account.me',
  'api::tag.tag.find',
  'api::mood.mood.today',
  'api::mood.mood.submit',
  'api::mood.mood.history',
];

const managerActions = [...employeeActions, 'api::mood.mood.teamStats'];

const roles = [
  { type: 'employee', name: 'Employé', description: 'Saisit son humeur', actions: employeeActions },
  { type: 'manager', name: 'Manager', description: "Saisit son humeur + voit les stats de l'équipe", actions: managerActions },
];

async function createRole(strapi, roleConfig) {
  let role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: roleConfig.type },
  });

  if (!role) {
    role = await strapi.db.query('plugin::users-permissions.role').create({
      data: { type: roleConfig.type, name: roleConfig.name, description: roleConfig.description },
    });
    strapi.log.info('Role cree : ' + roleConfig.name);
  }

  const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
    where: { role: role.id },
  });
  const existing = permissions.map((p) => p.action);

  for (const action of roleConfig.actions) {
    if (!existing.includes(action)) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      });
    }
  }

  return role;
}

async function setupPermissions(strapi) {
  const result = {};
  for (const r of roles) {
    result[r.type] = await createRole(strapi, r);
  }

  // les comptes sont crees par l'entreprise donc on desactive l'inscription publique
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });
  await strapi.db.query('plugin::users-permissions.permission').deleteMany({
    where: { role: publicRole.id, action: 'plugin::users-permissions.auth.register' },
  });

  return result;
}

module.exports = { setupPermissions };
