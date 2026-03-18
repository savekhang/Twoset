const db = require('../config/db');

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const generateFakeAI = (context) => {
  const { userA, userB, common } = context;

  let pool = [];

  if (common.same_city) {
    pool.push(`Ủa bạn cũng ở ${userA.location} hả 😆`);
  }

  if (common.shared_interests.length > 0) {
    pool.push(`Mình thấy tụi mình có điểm chung đó 👀`);
  }

  pool.push(
    "Hello 👋 rất vui được match với bạn!",
    "Hey 👋 có vẻ chúng ta hợp đó 😆"
  );

  return shuffle(pool).slice(0, 3);
};

const generateMessageSuggestions = async (matchId, user1Id, user2Id) => {
  try {
    const [[exist]] = await db.query(
      `SELECT id FROM message_suggestions WHERE match_id=?`,
      [matchId]
    );
    if (exist) return;

    const [[u1]] = await db.query(
  `SELECT u.id, l.name AS location 
   FROM users u
   LEFT JOIN locations l ON u.location_id = l.id
   WHERE u.id=?`,
  [user1Id]
);

const [[u2]] = await db.query(
  `SELECT u.id, l.name AS location 
   FROM users u
   LEFT JOIN locations l ON u.location_id = l.id
   WHERE u.id=?`,
  [user2Id]
);

    const [i1] = await db.query(
      `SELECT interest_id FROM user_interests WHERE user_id=?`,
      [user1Id]
    );

    const [i2] = await db.query(
      `SELECT interest_id FROM user_interests WHERE user_id=?`,
      [user2Id]
    );

    const list1 = i1.map(i => i.interest_id);
    const list2 = i2.map(i => i.interest_id);

    const shared = list1.filter(id => list2.includes(id));

    const context = {
      userA: u1,
      userB: u2,
      common: {
        shared_interests: shared,
        same_city: u1.location === u2.location
      }
    };

    const suggestions = generateFakeAI(context);

    await db.query(
      `INSERT INTO message_suggestions (match_id, user1_id, user2_id, suggestions)
       VALUES (?, ?, ?, ?)`,
      [matchId, user1Id, user2Id, JSON.stringify(suggestions)]
    );

    console.log("✅ Generated suggestions for match:", matchId);

  } catch (err) {
    console.error("❌ Suggestion error:", err);
  }
};

exports.generateMessageSuggestions = generateMessageSuggestions;