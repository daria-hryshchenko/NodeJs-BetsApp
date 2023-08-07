const { addUUIDPrimaryKey, addTimestamps } = require('../common');

exports.up = function (knex) {
  return knex.schema.createTable("bet", function (table) {
    addUUIDPrimaryKey(table);
    table.uuid("event_id").notNullable().references('id').inTable('event');
    table.uuid("user_id").notNullable().references('id').inTable('user');
    table.float("bet_amount").notNullable();
    table.string("prediction").notNullable();
    table.float("multiplier").notNullable();
    table.boolean("win");
    addTimestamps(table);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("bet");
};

  