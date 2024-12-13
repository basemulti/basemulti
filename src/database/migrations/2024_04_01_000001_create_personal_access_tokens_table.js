const { Migration } = require('sutando');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema) {
    await schema.createTable('personal_access_tokens', (table) => {
      table.increments('id');
      table.string('tokenable_type');
      table.string('tokenable_id', 27);
      table.string('name');
      table.string('token', 64).unique();
      table.string('abilities').nullable();
      table.datetime('last_used_at').nullable();
      table.datetime('expires_at').nullable();
      table.timestamps();

      table.index(['tokenable_type', 'tokenable_id'], 'personal_access_tokens_tokenable_type_tokenable_id_index');
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('personal_access_tokens');
  }
};