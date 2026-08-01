require("dotenv").config();
const express = require("express");
const cors = require("cors");

const usersRouter = require("./routes/users");
const categoriesRouter = require("./routes/categories");
const expensesRouter = require("./routes/expenses");
const totalsRouter = require("./routes/totals");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
  res.send('Welcome to the Expense Tracker Application.');
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Expense Tracker API" });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/totals", totalsRouter);

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// Central error handler (catches anything asyncHandler forwards)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Expense Tracker API listening on http://localhost:${PORT}`);
});
