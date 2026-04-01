const { generateMessageSuggestions } = require('./utils/aiSuggestion');
const db = require('./config/db');

async function testAIWithRealData() {
  try {
    console.log('🔍 Finding a recent match to test AI...');

    // Find any match
    const [matches] = await db.query(
      'SELECT id, user1_id, user2_id FROM matches ORDER BY id DESC LIMIT 1'
    );

    if (matches.length === 0) {
      console.log('❌ No matches found in database');
      return;
    }

    const match = matches[0];
    console.log(`🎯 Testing with match ID: ${match.id}, users: ${match.user1_id} ↔ ${match.user2_id}`);

    // Check if suggestions already exist
    const [existing] = await db.query(
      'SELECT * FROM message_suggestions WHERE match_id = ?',
      [match.id]
    );

    if (existing.length > 0) {
      console.log('⚠️ Suggestions already exist for this match');
      const suggestions = existing[0].suggestions; // Already parsed by MySQL JSON column
      console.log('Existing suggestions:');
      suggestions.forEach((suggestion, i) => {
        console.log(`${i+1}. ${suggestion}`);
      });
      return;
    }

    console.log('🚀 Generating AI suggestions...');
    await generateMessageSuggestions(match.id, match.user1_id, match.user2_id);

    // Check result
    const [result] = await db.query(
      'SELECT * FROM message_suggestions WHERE match_id = ?',
      [match.id]
    );

    if (result.length > 0) {
      console.log('✅ SUCCESS! AI suggestions generated:');
      const suggestions = result[0].suggestions; // Already parsed by MySQL JSON column
      suggestions.forEach((suggestion, i) => {
        console.log(`${i+1}. ${suggestion}`);
      });
    } else {
      console.log('❌ FAILED: No suggestions found after generation');
    }

  } catch (err) {
    console.error('❌ Test error:', err);
    console.error('Stack:', err.stack);
  } finally {
    process.exit(0);
  }
}

testAIWithRealData();