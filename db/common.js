const { gen_random_uuid } = require("pgcrypto");

exports.addTimestamps = function (table) {
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.timestamp('updated_at').defaultTo(knex.fn.now());
};

exports.addUUIDPrimaryKey = function (table) {
  table.uuid("id").defaultTo(gen_random_uuid()).primary();
};


exports.insertUser = async function (knex, user) {
  return knex("user").insert(user);
};

exports.insertOddsAndEvent = async function (knex, odds, event) {
  return knex.transaction(async (trx) => {
    const [oddsId] = await trx("odds").insert(odds);
    event.odds_id = oddsId;
    await trx("event").insert(event);
  });
};

exports.insertBet = async function (knex, bet) {
  return knex("bet").insert(bet);
};