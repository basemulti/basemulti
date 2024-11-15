const { Migration } = require('sutando');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema) {
    await schema.createTable('invite_links', (table) => {
      table.string('id', 21).primary();
      table.string('code');
      table.string('linkable_type', 20);
      table.string('linkable_id', 21);
      table.string('role', 20);
      table.timestamps();
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('invite_links');
  }
};