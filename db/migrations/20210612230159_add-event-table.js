const { addUUIDPrimaryKey, addTimestamps } = require('../common');

exports.up = function (knex) {
  return knex.schema.createTable("event", function (table) {
    addUUIDPrimaryKey(table);
    table.uuid("odds_id").notNullable().references('id').inTable('odds');
    table.string("type").notNullable();
    table.string("home_team").notNullable();
    table.string("away_team").notNullable();
    table.string("score");
    table.timestamp("start_at").notNullable();
    addTimestamps(table);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("event");
};

  