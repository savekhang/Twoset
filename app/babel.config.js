module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env",
        path: ".env",
        allowUndefined: false,
      },
    ],
    "react-native-reanimated/plugin", // 👈 thêm plugin này cuối cùng
  ],
};
