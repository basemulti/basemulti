const { Migration } = require('sutando');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema) {
    await schema.createTable('shares', (table) => {
      table.string('id', 21).primary();
      table.string('type', 20);
      table.string('base_id', 21);
      table.string('table_name');
      table.string('view_id');
      table.string('password');
      table.timestamps();
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('shares');
  }
};