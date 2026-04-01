// Test script for Grok AI
require('dotenv').config();
const { generateAISuggestions } = require('./utils/aiSuggestion');

const testContext = {
  userA: {
    name: "Nguyen Van A",
    age: 25,
    gender: "Nam",
    location: "Hanoi",
    interests: ["Đọc sách", "Du lịch", "Âm nhạc"],
    bio: "Thích khám phá và học hỏi"
  },
  userB: {
    name: "Tran Thi B",
    age: 23,
    gender: "Nữ",
    location: "Hanoi",
    interests: ["Du lịch", "Nấu ăn", "Thể thao"],
    bio: "Yêu thích cuộc sống năng động"
  },
  common: {
    shared_interests: [2], // Du lịch
    shared_interest_names: ["Du lịch"],
    same_city: true
  }
};

async function test() {
  console.log("🧪 Testing Grok AI suggestions...");
  const suggestions = await generateAISuggestions(testContext);
  console.log("📝 Generated suggestions:", suggestions);
}

test();