'use strict';

const { lastNDays } = require('./dates');

// calcul des stats pour la vue manager
// regle d'anonymat : on n'affiche pas de moyenne s'il y a moins de minGroupSize reponses

function round1(n) {
  return Math.round(n * 10) / 10;
}

function average(scores, minGroupSize) {
  if (scores.length < minGroupSize) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return round1(sum / scores.length);
}

function getAlerts(lastWeek, trend, participation, worstTag) {
  const alerts = [];

  if (lastWeek !== null && lastWeek < 2.5) {
    alerts.push({ level: 'critical', message: "Moral bas sur les 7 derniers jours, prévoir un point avec l'équipe." });
  } else if (lastWeek !== null && lastWeek < 3) {
    alerts.push({ level: 'warning', message: 'Moral en dessous de la moyenne cette semaine.' });
  }

  if (trend !== null && trend <= -0.5) {
    alerts.push({ level: 'warning', message: `Baisse de ${String(Math.abs(trend)).replace(".", ",")} point par rapport à la semaine dernière.` });
  }

  if (participation < 40) {
    alerts.push({ level: 'info', message: 'Peu de réponses : rappeler à l’équipe que c’est anonyme.' });
  }

  if (worstTag) {
    alerts.push({ level: 'info', message: `Facteur le plus cité quand le moral est bas : ${worstTag.label}.` });
  }

  return alerts;
}

function computeTeamStats({ moods, teamSize, today, days = 30, minGroupSize = 3 }) {
  const period = lastNDays(today, days);
  const result = {
    period: { from: period[0], to: today, days },
    teamSize,
    minGroupSize,
    restricted: false,
  };

  // equipe trop petite -> pas de stats sinon on peut deviner qui a repondu quoi
  if (teamSize < minGroupSize) {
    result.restricted = true;
    return result;
  }

  // on range les scores par jour
  const byDay = {};
  period.forEach((d) => { byDay[d] = []; });
  moods.forEach((m) => {
    if (byDay[m.day]) byDay[m.day].push(m.score);
  });

  const series = period.map((day) => ({
    day,
    responses: byDay[day].length,
    average: average(byDay[day], minGroupSize),
  }));

  const scoresOf = (list) => list.flatMap((d) => byDay[d]);
  const allScores = scoresOf(period);
  const lastWeek = average(scoresOf(period.slice(-7)), minGroupSize);
  const previousWeek = days >= 14 ? average(scoresOf(period.slice(-14, -7)), minGroupSize) : null;
  const trend = lastWeek !== null && previousWeek !== null ? round1(lastWeek - previousWeek) : null;
  const participation = Math.round((allScores.length * 100) / (teamSize * days));

  // comptage des tags (raisons)
  const tags = {};
  moods.forEach((m) => {
    if (!byDay[m.day]) return;
    (m.tags || []).forEach((t) => {
      if (!tags[t.label]) tags[t.label] = { label: t.label, emoji: t.emoji || '', count: 0, low: 0 };
      tags[t.label].count++;
      if (m.score <= 2) tags[t.label].low++;
    });
  });

  let topTags = [];
  let worstTag = null;
  if (allScores.length >= minGroupSize) {
    const list = Object.values(tags);
    topTags = list
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((t) => ({
        label: t.label,
        emoji: t.emoji,
        count: t.count,
        share: Math.round((t.count * 100) / allScores.length),
        lowShare: Math.round((t.low * 100) / t.count),
      }));
    worstTag = list.filter((t) => t.low >= minGroupSize).sort((a, b) => b.low - a.low)[0] || null;
  }

  return {
    ...result,
    responses: allScores.length,
    average: average(allScores, minGroupSize),
    lastWeek,
    previousWeek,
    trend,
    participation,
    series,
    topTags,
    alerts: getAlerts(lastWeek, trend, participation, worstTag),
  };
}

module.exports = { computeTeamStats };
