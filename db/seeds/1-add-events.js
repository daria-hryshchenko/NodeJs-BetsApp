const { insertOddsAndEvent } = require("../common");

exports.seed = async function (knex) {
  await insertOddsAndEvent(knex, {
    home_win: 1.4,
    draw: 3.3,
    away_win: 7.2,
  }, {
    id: "154baa1f-2102-4874-a488-aa2713b9c2d3",
    type: "football",
    home_team: "Ukraine",
    away_team: "England",
    start_at: "2021-07-03T22:22:09.900Z",
  });
};

