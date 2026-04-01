const db = require('./config/db');

async function checkSchema() {
  try {
    console.log('🔍 Checking users table schema...');
    const [columns] = await db.query('DESCRIBE users');
    console.log('Users table columns:');
    columns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));

    console.log('\n🔍 Checking matches table schema...');
    const [matchColumns] = await db.query('DESCRIBE matches');
    console.log('Matches table columns:');
    matchColumns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));

    console.log('\n🔍 Checking message_suggestions table schema...');
    const [suggColumns] = await db.query('DESCRIBE message_suggestions');
    console.log('Message_suggestions table columns:');
    suggColumns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkSchema();