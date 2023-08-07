const ee = require('events');

const statEmitter = new ee();

const stats = {
  totalUsers: 3,
  totalBets: 1,
  totalEvents: 1,
};

function getStats(req, res) {
  res.send(stats);
}

module.exports = {
  statEmitter,
  stats,
  getStats,
};