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