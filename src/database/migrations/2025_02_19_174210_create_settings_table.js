const { Migration, sutando } = require('sutando');
const { v4: uuid } = require('uuid');

module.exports = class extends Migration {
  /**
    * Run the migrations.
    */
  async up(schema, connection) {
    await schema.createTable('settings', (table) => {
      table.string('id', 21).primary();
      table.tinyint('allow_registration', 1).defaultTo(1);
      table.tinyint('allow_create_workspace', 1).defaultTo(1);
      table.string('storage_driver');
      table.text('storage_s3_config');
      table.text('storage_webhook_config');
    });

    await connection.table('settings').insert({
      id: uuid(),
      allow_registration: 1,
      allow_create_workspace: 1,
      storage_driver: 'local',
      storage_s3_config: '{}',
      storage_webhook_config: '{}',
    });
  }

  /**
    * Reverse the migrations.
    */
  async down(schema) {
    await schema.dropTableIfExists('settings');
  }
};