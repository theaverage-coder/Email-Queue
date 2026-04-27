const Queue = require("bull");

// connect to Redis (default localhost:6379)
const emailQueue = new Queue("email-queue", {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
});

module.exports = emailQueue;