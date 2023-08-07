const { addUUIDPrimaryKey, addTimestamps } = require('../common');

exports.up = function (knex) {
  return knex.schema.createTable("odds", function (table) {
    addUUIDPrimaryKey(table);
    table.float("home_win").notNullable();
    table.float("draw").notNullable();
    table.float("away_win").notNullable();
    addTimestamps(table);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("odds");
};
