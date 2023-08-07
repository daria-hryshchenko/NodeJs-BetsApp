const { addUUIDPrimaryKey, addTimestamps } = require('../common');

exports.up = function (knex) {
  return knex.schema.createTable("user", function (table) {
    addUUIDPrimaryKey(table);
    table.string("type").notNullable();
    table.string("email").unique().notNullable();
    table.string("phone").unique().notNullable();
    table.string("name").notNullable();
    table.float("balance").notNullable();
    table.string("city");
    addTimestamps(table);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user");
};


