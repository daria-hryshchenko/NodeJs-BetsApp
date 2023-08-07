
const express = require("express");
const app = express();
const port = 3000;

const healthRouter = require("./src/routers/healthRouter");
const usersRouter = require("./src/routers/usersRoutes");
const transactionsRouter = require("./src/routers/transactionsRouter");
const eventsRouter = require("./src/routers/eventsRouter");
const betsRouter = require("./src/routers/betsRouter");
const statsRouter = require("./src/routers/statsRouter");

const db = require("./src/services/db");
const { statEmitter, stats } = require("./src/services/stats");
 

app.use(express.json());
app.use(db.connectMiddleware);


app.use("/health", healthRouter);
app.use("/users", usersRouter);
app.use("/transactions", transactionsRouter);
app.use("/events", eventsRouter);
app.use("/bets", betsRouter);
app.use("/stats", statsRouter);


const server = app.listen(port, () => {
  statEmitter.on('newUser', () => {
    stats.totalUsers++;
  });
  statEmitter.on('newBet', () => {
    stats.totalBets++;
  });
  statEmitter.on('newEvent', () => {
    stats.totalEvents++;
  });
  console.log(`App listening at http://localhost:${port}`);
});

// Do not change this line
module.exports = { app, server };