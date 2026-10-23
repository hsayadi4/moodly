'use strict';

// tests du calcul des stats (npm test)

const test = require('node:test');
const assert = require('node:assert/strict');
const { computeTeamStats } = require('../src/api/mood/utils/stats');
const { lastNDays, shiftDays } = require('../src/api/mood/utils/dates');

const TODAY = '2026-10-23';
const mood = (daysAgo, score, tags = []) => ({ day: shiftDays(TODAY, -daysAgo), score, tags });

test('lastNDays renvoie N jours consécutifs se terminant aujourd\'hui', () => {
  const days = lastNDays(TODAY, 3);
  assert.deepEqual(days, ['2026-10-21', '2026-10-22', '2026-10-23']);
});

test('lastNDays gère les changements de mois', () => {
  assert.deepEqual(lastNDays('2026-03-01', 2), ['2026-02-28', '2026-03-01']);
});

test('une équipe trop petite ne renvoie aucune statistique', () => {
  const stats = computeTeamStats({ moods: [mood(0, 5)], teamSize: 2, today: TODAY, minGroupSize: 3 });
  assert.equal(stats.restricted, true);
  assert.equal(stats.series, undefined);
});

test('la série contient un point par jour sur la période', () => {
  const stats = computeTeamStats({ moods: [], teamSize: 5, today: TODAY, days: 30 });
  assert.equal(stats.series.length, 30);
  assert.equal(stats.series[29].day, TODAY);
  assert.equal(stats.period.from, '2026-09-24');
});

test('une moyenne journalière est masquée sous le seuil d\'anonymat', () => {
  const moods = [mood(0, 1), mood(0, 2), mood(1, 4), mood(1, 4), mood(1, 5)];
  const stats = computeTeamStats({ moods, teamSize: 5, today: TODAY, minGroupSize: 3 });
  const today = stats.series.at(-1);
  const yesterday = stats.series.at(-2);
  assert.equal(today.responses, 2);
  assert.equal(today.average, null); // 2 réponses < 3 : masqué
  assert.equal(yesterday.average, 4.3);
});

test('moyenne globale, participation et tendance', () => {
  const moods = [
    // semaine précédente : moyenne 4
    mood(10, 4), mood(10, 4), mood(9, 4),
    // dernière semaine : moyenne 2
    mood(2, 2), mood(1, 2), mood(0, 2),
  ];
  const stats = computeTeamStats({ moods, teamSize: 3, today: TODAY, days: 30 });
  assert.equal(stats.responses, 6);
  assert.equal(stats.average, 3);
  assert.equal(stats.lastWeek, 2);
  assert.equal(stats.previousWeek, 4);
  assert.equal(stats.trend, -2);
  assert.equal(stats.participation, Math.round((100 * 6) / (3 * 30)));
  const levels = stats.alerts.map((a) => a.level);
  assert.ok(levels.includes('critical'));
});

test('les tags sont agrégés avec leur part dans les humeurs basses', () => {
  const work = { label: 'Charge de travail', emoji: '📚' };
  const team = { label: 'Équipe', emoji: '🤝' };
  const moods = [mood(0, 1, [work]), mood(0, 2, [work]), mood(1, 2, [work]), mood(1, 5, [team])];
  const stats = computeTeamStats({ moods, teamSize: 4, today: TODAY });
  assert.equal(stats.topTags[0].label, 'Charge de travail');
  assert.equal(stats.topTags[0].count, 3);
  assert.equal(stats.topTags[0].lowShare, 100);
  assert.ok(stats.alerts.some((a) => a.message.includes('Charge de travail')));
});

test('les humeurs hors période sont ignorées', () => {
  const stats = computeTeamStats({
    moods: [mood(40, 1), mood(0, 5), mood(0, 5), mood(0, 5)],
    teamSize: 3,
    today: TODAY,
  });
  assert.equal(stats.responses, 3);
  assert.equal(stats.average, 5);
});
