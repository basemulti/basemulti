const { Migration } = require('sutando');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema) {
    await schema.createTable('users', (table) => {
      table.string('id', 21).primary();
      table.string('email');
      table.string('name');
      table.string('password');
      table.timestamps();
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('users');
  }
};