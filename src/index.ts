import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import { createUserRouter } from "./router";
import dotenv from "dotenv";
const app = express();

dotenv.config();
app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/', createUserRouter());

const server = http.createServer(app);

async function startServer() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("not defined in .env");

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 3030;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();
