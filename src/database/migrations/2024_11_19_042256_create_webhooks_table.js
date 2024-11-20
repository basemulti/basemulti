const { Migration } = require('sutando');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema) {
    await schema.createTable('webhooks', (table) => {
      table.string('id', 21).primary();
      table.string('base_id');
      table.string('table_name');
      table.string('label');
      table.string('method');
      table.string('endpoint');
      table.string('type');
      table.tinyint('active', 1).defaultTo(1);
      table.timestamps();
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('webhooks');
  }
};