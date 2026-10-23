'use strict';

// les dates sont gerees en string "YYYY-MM-DD" pour eviter les soucis de fuseau horaire

function todayISO() {
  const tz = process.env.APP_TIMEZONE || 'Europe/Paris';
  // en-CA donne directement le format YYYY-MM-DD
  return new Date().toLocaleDateString('en-CA', { timeZone: tz });
}

function shiftDays(day, nb) {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + nb);
  return d.toISOString().slice(0, 10);
}

// les n derniers jours (aujourd'hui inclus), du plus ancien au plus recent
function lastNDays(today, n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(shiftDays(today, -i));
  }
  return days;
}

module.exports = { todayISO, shiftDays, lastNDays };
