const { Migration } = require('sutando');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema) {
    await schema.createTable('bases', (table) => {
      table.string('id', 21).primary();
      table.string('workspace_id', 21);
      table.string('label');
      table.string('provider');
      table.text('connection');
      table.string('prefix', 10);
      table.text('schema_data', 'mediumtext');
      table.timestamps();
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('bases');
  }
};