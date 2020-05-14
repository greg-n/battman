process.env.NODE_ENV = "test";
process.env.PING_INTERVAL = 500;

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node"
};
