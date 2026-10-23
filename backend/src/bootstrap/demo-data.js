'use strict';

// Donnees de demo : tags, 2 equipes, des comptes et 30 jours d'humeurs.
// Lance seulement si la base est vide (aucune equipe).

const { todayISO, shiftDays } = require('../api/mood/utils/dates');

const PASSWORD = 'Moodly2026!';

const tags = [
  { label: 'Charge de travail', emoji: '📚', order: 1 },
  { label: 'Équipe', emoji: '🤝', order: 2 },
  { label: 'Management', emoji: '🧭', order: 3 },
  { label: 'Équilibre pro/perso', emoji: '⚖️', order: 4 },
  { label: 'Reconnaissance', emoji: '🏆', order: 5 },
  { label: 'Sens du travail', emoji: '🎯', order: 6 },
  { label: 'Conditions de travail', emoji: '🏢', order: 7 },
  { label: 'Santé', emoji: '💪', order: 8 },
];

const badTags = ['Charge de travail', 'Équilibre pro/perso', 'Management', 'Conditions de travail'];
const goodTags = ['Équipe', 'Reconnaissance', 'Sens du travail', 'Santé'];

const teams = [
  {
    name: 'Équipe Produit',
    // moral moyen selon le jour : un rush il y a 1-2 semaines et une baisse en ce moment
    baseMood: (daysAgo) => {
      if (daysAgo >= 8 && daysAgo <= 14) return 2.4;
      if (daysAgo <= 5) return 2.7;
      return 3.7;
    },
    users: [
      { username: 'claire.martin', email: 'manager@moodly.demo', role: 'manager' },
      { username: 'alex.durand', email: 'employe@moodly.demo', role: 'employee' },
      { username: 'ines.benali', email: 'ines@moodly.demo', role: 'employee' },
      { username: 'lucas.petit', email: 'lucas@moodly.demo', role: 'employee' },
      { username: 'emma.roux', email: 'emma@moodly.demo', role: 'employee' },
      { username: 'hugo.leroy', email: 'hugo@moodly.demo', role: 'employee' },
      { username: 'lea.moreau', email: 'lea@moodly.demo', role: 'employee' },
    ],
  },
  {
    name: 'Équipe Support',
    baseMood: () => 3.4,
    users: [
      { username: 'karim.haddad', email: 'manager.support@moodly.demo', role: 'manager' },
      { username: 'nina.faure', email: 'nina@moodly.demo', role: 'employee' },
      { username: 'tom.garnier', email: 'tom@moodly.demo', role: 'employee' },
      { username: 'sofia.costa', email: 'sofia@moodly.demo', role: 'employee' },
    ],
  },
];

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomTags(score, tagsByLabel) {
  let pool = [...badTags, ...goodTags];
  if (score <= 2) pool = badTags;
  if (score >= 4) pool = goodTags;

  const nb = Math.floor(Math.random() * 3); // 0 a 2 tags
  const chosen = [];
  while (chosen.length < nb) {
    const label = randomItem(pool);
    if (!chosen.includes(label)) chosen.push(label);
  }
  return chosen.map((label) => tagsByLabel[label].id);
}

async function seedDemoData(strapi, roles) {
  const nbTeams = await strapi.db.query('api::team.team').count();
  if (nbTeams > 0) return;

  strapi.log.info('Creation des donnees de demo...');
  const today = todayISO();

  // compte admin strapi pour la demo
  const adminService = strapi.service('admin::user');
  if (!(await adminService.exists())) {
    await adminService.createFirstAdmin({
      email: 'admin@moodly.demo',
      firstname: 'Admin',
      lastname: 'Moodly',
      password: PASSWORD,
    });
  }

  const tagsByLabel = {};
  for (const tag of tags) {
    tagsByLabel[tag.label] = await strapi.documents('api::tag.tag').create({ data: tag });
  }

  for (const t of teams) {
    const team = await strapi.documents('api::team.team').create({ data: { name: t.name } });

    for (const u of t.users) {
      const user = await strapi.plugin('users-permissions').service('user').add({
        username: u.username,
        email: u.email,
        password: PASSWORD,
        provider: 'local',
        confirmed: true,
        role: roles[u.role].id,
        team: team.id,
      });

      const hash = strapi.service('api::mood.mood').authorHash(user.id);

      for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
        // les 2 comptes de demo n'ont pas encore repondu aujourd'hui
        if (daysAgo === 0 && (u.email === 'manager@moodly.demo' || u.email === 'employe@moodly.demo')) continue;
        // environ 80% de participation
        if (Math.random() < 0.2) continue;

        let score = Math.round(t.baseMood(daysAgo) + (Math.random() * 2.2 - 1.1));
        score = Math.max(1, Math.min(5, score));

        await strapi.documents('api::mood.mood').create({
          data: {
            score,
            day: shiftDays(today, -daysAgo),
            authorHash: hash,
            team: team.id,
            tags: randomTags(score, tagsByLabel),
          },
        });
      }
    }
  }

  strapi.log.info('Donnees de demo creees (mot de passe : ' + PASSWORD + ')');
}

module.exports = { seedDemoData };
