const { Migration } = require('sutando');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema) {
    await schema.createTable('collaborators', (table) => {
      table.string('id', 21).primary();
      table.string('user_id');
      table.string('collaboratorable_type', 20);
      table.string('collaboratorable_id', 21);
      table.string('role', 20);
      table.timestamps();
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('collaborators');
  }
};