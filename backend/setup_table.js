const db = require('./config/db');

async function checkAndCreateTable() {
  try {
    console.log('🔍 Checking message_suggestions table...');

    const [rows] = await db.query('SHOW TABLES LIKE "message_suggestions"');
    if (rows.length === 0) {
      console.log('📝 Creating message_suggestions table...');
      await db.query(`
        CREATE TABLE message_suggestions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          match_id INT NOT NULL,
          user1_id INT NOT NULL,
          user2_id INT NOT NULL,
          suggestions JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_match (match_id)
        )
      `);
      console.log('✅ Table created successfully');
    } else {
      console.log('✅ Table already exists');
    }

    // Test insert
    console.log('🧪 Testing insert...');
    const testData = {
      match_id: 999,
      user1_id: 1,
      user2_id: 2,
      suggestions: JSON.stringify(['Test suggestion 1', 'Test suggestion 2'])
    };

    await db.query(
      'INSERT INTO message_suggestions (match_id, user1_id, user2_id, suggestions) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE suggestions = VALUES(suggestions)',
      [testData.match_id, testData.user1_id, testData.user2_id, testData.suggestions]
    );

    console.log('✅ Test insert successful');

    // Check data
    const [result] = await db.query('SELECT * FROM message_suggestions WHERE match_id = ?', [999]);
    console.log('📊 Test data:', result[0]);

    // Clean up test data
    await db.query('DELETE FROM message_suggestions WHERE match_id = ?', [999]);
    console.log('🧹 Cleaned up test data');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    process.exit(0);
  }
}

checkAndCreateTable();