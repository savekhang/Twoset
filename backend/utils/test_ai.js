// Test script for AI Suggestion Engine
const { generateAISuggestions } = require('./aiSuggestion');

// Test context data
const testContext = {
  userA: {
    name: "Minh",
    age: 25,
    gender: "male",
    location: "Hà Nội",
    interests: ["Đọc sách", "Du lịch", "Âm nhạc"],
    bio: "Thích khám phá và học hỏi"
  },
  userB: {
    name: "Lan",
    age: 23,
    gender: "female",
    location: "Hà Nội",
    interests: ["Du lịch", "Nấu ăn", "Âm nhạc"],
    bio: "Yêu thích ẩm thực và văn hóa"
  },
  common: {
    shared_interests: [2, 3], // Du lịch, Âm nhạc
    shared_interest_names: ["Du lịch", "Âm nhạc"],
    same_city: true
  }
};

async function testAI() {
  console.log("🧪 Testing AI Suggestion Engine...");
  console.log("Context:", JSON.stringify(testContext, null, 2));

  try {
    const suggestions = await generateAISuggestions(testContext);
    console.log("\n✅ AI Suggestions Generated:");
    suggestions.forEach((suggestion, i) => {
      console.log(`${i+1}. ${suggestion}`);
    });
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testAI();