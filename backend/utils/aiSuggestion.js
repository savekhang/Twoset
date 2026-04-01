const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// AI Engine: Smart suggestion selector
class SmartSuggestionAI {
  constructor() {
    this.suggestionsPool = this.loadSuggestionsPool();
  }

  loadSuggestionsPool() {
    try {
      const filePath = path.join(__dirname, 'suggestions_pool.json');
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('❌ Error loading suggestions pool:', err);
      return [];
    }
  }

  calculateContextScore(suggestion, context) {
    const { userA, userB, common } = context;
    let score = 0;

    // Base score from suggestion metadata
    score += suggestion.context_score.shared_interests * (common.shared_interests.length > 0 ? 1 : 0);
    score += suggestion.context_score.same_city * (common.same_city ? 1 : 0);

    // Age compatibility score
    const ageDiff = Math.abs(userA.age - userB.age);
    if (ageDiff <= 2) score += 5; // Same age group
    else if (ageDiff <= 5) score += 3; // Close age
    else if (ageDiff <= 10) score += 1; // Reasonable age difference

    // Interest matching score
    if (common.shared_interests.length > 0) {
      score += common.shared_interests.length * 2; // More shared interests = higher score
    }

    // Location bonus
    if (common.same_city) {
      score += 8; // Significant bonus for same city
    }

    // Gender compatibility (slight preference for opposite gender in dating context)
    if (userA.gender !== userB.gender) {
      score += 2;
    }

    // Random factor to add variety (0-3 points)
    score += Math.random() * 3;

    return score;
  }

  processSuggestionText(suggestion, context) {
    const { userA, userB, common } = context;
    let text = suggestion.text;

    // Replace placeholders
    text = text.replace('[name]', userB.name || 'bạn');
    text = text.replace('[my_name]', userA.name || 'mình');
    text = text.replace('[age]', userA.age || '');
    text = text.replace('[location]', userA.location || 'đây');

    if (text.includes('[interests]')) {
      const interestsStr = common.shared_interest_names.length > 0
        ? common.shared_interest_names.slice(0, 2).join(', ') // Max 2 interests
        : 'nhiều thứ';
      text = text.replace('[interests]', interestsStr);
    }

    return text;
  }

  selectBestSuggestions(context, count = 2) {
    console.log('🤖 AI Engine: Analyzing context for smart suggestions...');

    // Calculate scores for all suggestions
    const scoredSuggestions = this.suggestionsPool.map(suggestion => ({
      ...suggestion,
      score: this.calculateContextScore(suggestion, context),
      processedText: this.processSuggestionText(suggestion, context)
    }));

    // Sort by score (highest first)
    scoredSuggestions.sort((a, b) => b.score - a.score);

    // Log top 5 for debugging
    console.log('📊 Top 5 suggestions by score:');
    scoredSuggestions.slice(0, 5).forEach((s, i) => {
      console.log(`  ${i+1}. Score: ${s.score.toFixed(1)} - "${s.processedText.substring(0, 50)}..."`);
    });

    // Select top suggestions, ensuring variety
    const selected = [];
    const usedTags = new Set();

    for (const suggestion of scoredSuggestions) {
      // Avoid too similar suggestions
      const hasCommonTag = suggestion.tags.some(tag => usedTags.has(tag));
      if (!hasCommonTag || selected.length >= count) {
        selected.push(suggestion.processedText);
        suggestion.tags.forEach(tag => usedTags.add(tag));

        if (selected.length >= count) break;
      }
    }

    // Fallback if not enough suggestions
    while (selected.length < count && scoredSuggestions.length > selected.length) {
      const nextBest = scoredSuggestions[selected.length];
      if (nextBest) {
        selected.push(nextBest.processedText);
      }
    }

    console.log(`✅ AI Engine selected ${selected.length} smart suggestions`);
    return selected;
  }
}

// Initialize AI Engine
const aiEngine = new SmartSuggestionAI();

// Legacy function for backward compatibility
const generateFakeAI = (context) => {
  return aiEngine.selectBestSuggestions(context, 3);
};

// Main function
const generateAISuggestions = async (context) => {
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    console.log("⚠️ No GROK_API_KEY found, using Smart AI Engine");
    return aiEngine.selectBestSuggestions(context, 2);
  }

  console.log("🤖 Attempting to use Grok AI for suggestions...");
  try {
    const { userA, userB, common } = context;

    const prompt = `Dựa trên thông tin của 2 người sau, hãy tạo ra đúng 2 câu gợi ý tin nhắn để bắt đầu cuộc trò chuyện. Chỉ trả về 2 câu, không giải thích, không phân tích.

Người A: ${userA.name}, ${userA.age} tuổi, ${userA.gender}, ở ${userA.location}, sở thích: ${userA.interests.join(', ')}, bio: ${userA.bio}

Người B: ${userB.name}, ${userB.age} tuổi, ${userB.gender}, ở ${userB.location}, sở thích: ${userB.interests.join(', ')}, bio: ${userB.bio}

Điểm chung: ${common.same_city ? 'Cùng thành phố' : 'Khác thành phố'}, sở thích chung: ${common.shared_interest_names.join(', ') || 'Không có'}

Tạo 2 câu gợi ý:`;

    console.log("📤 Sending request to Grok API...");
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Grok API error:", response.status, response.statusText);

      // Check for specific xAI errors
      if (response.status === 403 && errorText.includes("credits or licenses")) {
        console.log("⚠️ xAI API requires credits. Using Smart AI Engine.");
      } else if (response.status === 400 && errorText.includes("Model not found")) {
        console.log("⚠️ xAI model not available. Using Smart AI Engine.");
      } else {
        console.log("⚠️ Grok API unavailable. Using Smart AI Engine.");
      }

      return aiEngine.selectBestSuggestions(context, 2);
    }

    const data = await response.json();
    console.log("📥 Grok API response received");

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("❌ Invalid Grok API response format");
      return aiEngine.selectBestSuggestions(context, 2);
    }

    const content = data.choices[0].message.content.trim();
    console.log("💬 AI generated content:", content);

    // Parse suggestions from response
    const suggestions = content.split('\n').filter(line => line.trim()).slice(0, 2);

    console.log("✅ Final AI suggestions:", suggestions);
    return suggestions.length === 2 ? suggestions : aiEngine.selectBestSuggestions(context, 2);

  } catch (err) {
    console.error("❌ AI API network error:", err);
    console.log("⚠️ Falling back to Smart AI Engine due to network error");
    return aiEngine.selectBestSuggestions(context, 2);
  }
};

const generateMessageSuggestions = async (matchId, user1Id, user2Id) => {
  try {
    console.log(`🤖 Starting AI suggestions generation for match ${matchId}, users ${user1Id} ↔ ${user2Id}`);

    const [existRows] = await db.query(
      `SELECT id FROM message_suggestions WHERE match_id=?`,
      [matchId]
    );
    if (existRows.length > 0) {
      console.log(`⚠️ Suggestions already exist for match ${matchId}`);
      return;
    }

    console.log(`🔍 Fetching user data for users ${user1Id} and ${user2Id}`);

    const [u1Rows] = await db.query(
      `SELECT u.id, u.name, u.birthdate, u.gender, u.bio, l.name AS location
       FROM users u
       LEFT JOIN locations l ON u.location_id = l.id
       WHERE u.id=?`,
      [user1Id]
    );

    const [u2Rows] = await db.query(
      `SELECT u.id, u.name, u.birthdate, u.gender, u.bio, l.name AS location
       FROM users u
       LEFT JOIN locations l ON u.location_id = l.id
       WHERE u.id=?`,
      [user2Id]
    );

    if (!u1Rows[0] || !u2Rows[0]) {
      console.error(`❌ User data not found: u1=${!!u1Rows[0]}, u2=${!!u2Rows[0]}`);
      return;
    }

    const u1 = u1Rows[0];
    const u2 = u2Rows[0];

    // Calculate age from birthdate
    const calculateAge = (birthdate) => {
      if (!birthdate) return null;
      const today = new Date();
      const birth = new Date(birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const u1Age = calculateAge(u1.birthdate);
    const u2Age = calculateAge(u2.birthdate);

    console.log(`👤 User1: ${u1.name} (${u1Age}, ${u1.location})`);
    console.log(`👤 User2: ${u2.name} (${u2Age}, ${u2.location})`);

    const [i1Rows] = await db.query(
      `SELECT interest_id FROM user_interests WHERE user_id=?`,
      [user1Id]
    );

    const [i2Rows] = await db.query(
      `SELECT interest_id FROM user_interests WHERE user_id=?`,
      [user2Id]
    );

    const list1 = i1Rows.map(i => i.interest_id);
    const list2 = i2Rows.map(i => i.interest_id);

    const shared = list1.filter(id => list2.includes(id));

    console.log(`🎯 Shared interests: ${shared.length}`);

    // Fetch interest names for shared interests
    let sharedInterestNames = [];
    if (shared.length > 0) {
      const placeholders = shared.map(() => '?').join(',');
      const [interestRows] = await db.query(
        `SELECT name FROM interests WHERE id IN (${placeholders})`,
        shared
      );
      sharedInterestNames = interestRows.map(row => row.name);
    }

    // Fetch all interests for both users
    const [user1Interests] = await db.query(
      `SELECT i.name FROM interests i
       JOIN user_interests ui ON i.id = ui.interest_id
       WHERE ui.user_id = ?`,
      [user1Id]
    );

    const [user2Interests] = await db.query(
      `SELECT i.name FROM interests i
       JOIN user_interests ui ON i.id = ui.interest_id
       WHERE ui.user_id = ?`,
      [user2Id]
    );

    const context = {
      userA: {
        name: u1.name,
        age: u1Age,
        gender: u1.gender,
        location: u1.location,
        interests: user1Interests.map(i => i.name),
        bio: u1.bio
      },
      userB: {
        name: u2.name,
        age: u2Age,
        gender: u2.gender,
        location: u2.location,
        interests: user2Interests.map(i => i.name),
        bio: u2.bio
      },
      common: {
        shared_interests: shared,
        shared_interest_names: sharedInterestNames,
        same_city: u1.location === u2.location
      }
    };

    console.log(`🧠 Generating AI suggestions...`);
    const suggestions = await generateAISuggestions(context);

    console.log(`💾 Saving suggestions to database...`);
    await db.query(
      `INSERT INTO message_suggestions (match_id, user1_id, user2_id, suggestions)
       VALUES (?, ?, ?, ?)`,
      [matchId, user1Id, user2Id, JSON.stringify(suggestions)]
    );

    console.log(`✅ Successfully generated and saved ${suggestions.length} suggestions for match ${matchId}`);

  } catch (err) {
    console.error("❌ Error in generateMessageSuggestions:", err);
    console.error("Stack:", err.stack);
  }
};

exports.generateMessageSuggestions = generateMessageSuggestions;
exports.generateAISuggestions = generateAISuggestions;