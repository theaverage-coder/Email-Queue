require("dotenv").config();
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
        delay: 5000, // wait 5 seconds before processing email
        attempts: 3, // retry up to 3 times
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    });

    res.json({ message: "Added email to queue." });
});

// endpoint to get status of an email job
app.get("/get-status/:id", async (req, res) => {
    const jobId = req.params.id;

    // find job
    const job = await emailQueue.getJob(jobId);

    // return error if no job found
    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }

    const state = job.getState();

    // return job
    res.json({
        id: jobId,
        type: job.name,
        state,
        attempts: job.attemptsMade,
        failedReason: job.failedReason,
        data: job.data
    });
})

app.get("/get-logs", async (req, res) => {
    const counts = await emailQueue.getJobCounts('wait', 'completed', 'failed');

    res.json({
        wait: `${counts.wait} jobs waiting`,
        completed: `${counts.completed} jobs completed`,
        failed: `${counts.failed} jobs failed`
    })
})



const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullAdapter(emailQueue)],
    serverAdapter,
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);


app.use('/admin/queues', serverAdapter.getRouter());