const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const express = require("express");
const emailQueue = require("../queue/queue");

const app = express();
app.use(express.json());

// endpoint to send an email
app.post("/send-email", async (req, res) => {
    const { to, subject, body } = req.body;

    // add job to queue with delays and retries to simulate real-world scenarios
    await emailQueue.add(
        "send-email",
        {
            to,
            subject,
            body,
        }, {
        jobId: `email-${Date.now()}`, // create an unique ID for the email job
        delay: 5000, // wait 5 seconds before processing email
        attempts: 3, // retry up to 3 times
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    });

    res.json({ message: "Added email to queue." });
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullAdapter(emailQueue)],
    serverAdapter,
});


app.listen(3000, () => {
    console.log("API running on http://localhost:3000");
});

app.use('/admin/queues', serverAdapter.getRouter());