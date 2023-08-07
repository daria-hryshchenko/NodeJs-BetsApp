const { addUUIDPrimaryKey, addTimestamps } = require('../common');

exports.up = function (knex) {
  return knex.schema.createTable("transaction", function (table) {
    addUUIDPrimaryKey(table);
    table.uuid("user_id").notNullable().references('id').inTable('user');
    table.string("card_number").notNullable();
    table.float("amount").notNullable();
    addTimestamps(table);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transaction");
};

  
  