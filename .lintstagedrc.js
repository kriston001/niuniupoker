const path = require("path");

const buildNextEslintCommand = (filenames) =>
  `yarn next:lint --fix --file ${filenames
    .map((f) => path.relative(path.join("packages", "nextjs"), f))
    .join(" --file ")}`;

const checkTypesNextCommand = () => "yarn next:check-types";

const buildHardhatEslintCommand = (filenames) =>
  `yarn hardhat:lint-staged --fix ${filenames
    .map((f) => path.relative(path.join("packages", "hardhat"), f))
    .join(" ")}`;

module.exports = {
  "packages/nextjs/**/*.{ts,tsx}": [
    // buildNextEslintCommand,   //注释就不会检查语法等错误了
    // checkTypesNextCommand,   //注释就不会检查类型错误了
  ],
  "packages/hardhat/**/*.{ts,tsx}": [buildHardhatEslintCommand],
};
