process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "8460272f-b9cb-415f-a318-6fff09d5d17b";
process.env.PING_INTERVAL = 500;
process.env.REMOVE_NON_CLIENT_TIMEOUT = 500;

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node"
};
