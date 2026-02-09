import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = 8080;

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/chat", chatRoutes);

// DB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("Connected DB:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
