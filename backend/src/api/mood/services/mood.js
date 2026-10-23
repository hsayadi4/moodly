'use strict';

const crypto = require('crypto');
const { errors } = require('@strapi/utils');
const { todayISO, shiftDays } = require('../utils/dates');
const { computeTeamStats } = require('../utils/stats');

// Anonymisation : on ne stocke pas l'id de l'utilisateur dans la table moods
// mais un hash HMAC de l'id (avec un secret qui est dans le .env).
// Ca permet de retrouver "mon humeur du jour" sans pouvoir relier une humeur a quelqu'un.
function authorHash(userId) {
  const secret = process.env.MOOD_HASH_SECRET;
  if (!secret) throw new Error('MOOD_HASH_SECRET manquant dans le .env');
  return crypto.createHmac('sha256', secret).update(String(userId)).digest('hex');
}

// on renvoie seulement ce qui est utile au front
function format(mood) {
  if (!mood) return null;
  return {
    day: mood.day,
    score: mood.score,
    tags: (mood.tags || []).map((t) => ({ documentId: t.documentId, label: t.label, emoji: t.emoji })),
  };
}

module.exports = ({ strapi }) => ({
  authorHash,

  async findMoodOfDay(userId, day) {
    return strapi.db.query('api::mood.mood').findOne({
      where: { authorHash: authorHash(userId), day },
      populate: ['tags'],
    });
  },

  async getToday(user) {
    const mood = await this.findMoodOfDay(user.id, todayISO());
    return format(mood);
  },

  // une seule humeur par jour : si elle existe deja on la modifie
  async saveToday(user, score, tags) {
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      throw new errors.ValidationError('Le score doit être entre 1 et 5');
    }
    if (!Array.isArray(tags) || tags.length > 3) {
      throw new errors.ValidationError('3 raisons maximum');
    }

    const tagList = await strapi.db.query('api::tag.tag').findMany({
      where: { documentId: { $in: tags } },
    });
    if (tagList.length !== tags.length) {
      throw new errors.ValidationError('Tag inconnu');
    }
    const tagIds = tagList.map((t) => t.id);

    const today = todayISO();
    const existing = await this.findMoodOfDay(user.id, today);

    if (existing) {
      const updated = await strapi.documents('api::mood.mood').update({
        documentId: existing.documentId,
        data: { score, tags: tagIds },
        populate: ['tags'],
      });
      return { mood: format(updated), created: false };
    }

    const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['team'],
    });

    const created = await strapi.documents('api::mood.mood').create({
      data: {
        score,
        day: today,
        authorHash: authorHash(user.id),
        team: fullUser.team ? fullUser.team.id : null,
        tags: tagIds,
      },
      populate: ['tags'],
    });
    return { mood: format(created), created: true };
  },

  // historique perso (seulement pour l'utilisateur lui-meme)
  async getHistory(user, days) {
    const moods = await strapi.db.query('api::mood.mood').findMany({
      where: { authorHash: authorHash(user.id), day: { $gte: shiftDays(todayISO(), -(days - 1)) } },
      select: ['day', 'score'],
      orderBy: { day: 'asc' },
    });
    return moods.map((m) => ({ day: m.day, score: m.score }));
  },

  // stats de l'equipe du manager connecte
  async getTeamStats(user, days) {
    const manager = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['team'],
    });
    if (!manager.team) {
      throw new errors.NotFoundError("Vous n'avez pas d'équipe");
    }

    const today = todayISO();
    const teamSize = await strapi.db.query('plugin::users-permissions.user').count({
      where: { team: manager.team.id, blocked: false },
    });

    const moods = await strapi.db.query('api::mood.mood').findMany({
      where: { team: manager.team.id, day: { $gte: shiftDays(today, -(days - 1)) } },
      select: ['day', 'score'],
      populate: { tags: { select: ['label', 'emoji'] } },
    });

    const stats = computeTeamStats({
      moods,
      teamSize,
      today,
      days,
      minGroupSize: Number(process.env.MIN_GROUP_SIZE || 3),
    });

    return { team: { name: manager.team.name }, ...stats };
  },
});
