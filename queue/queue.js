const Queue = require("bull");

// connect to Redis (default localhost:6379)
const emailQueue = new Queue("email-queue", {
    redis: { host: "redis", port: 6379 },
});

module.exports = emailQueue;