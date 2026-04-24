const emailQueue = require("../queue/queue");

// process jobs
emailQueue.process(async (job) => {
    const { to, subject, body } = job.data;

    console.log("Processing email request...");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);

    // Random chance of failure
    if (Math.random() < 0.3) {
        throw new Error("Email failed to send.");
    }

    // Simulate delay when sending an email
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Email sent!");
});

// log completed jobs
emailQueue.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

// log failures
emailQueue.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

