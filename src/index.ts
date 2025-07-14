import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import { createUserRouter } from "./router";

const app = express();

app.use(cors({
  credentials: true,
  origin: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/', createUserRouter());

const server = http.createServer(app);

const MONGO_URL = 'mongodb+srv://wilhelmbjor:HiPRYuPKSf59oTjb@cluster0.cawwvwj.mongodb.net/';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");

    server.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();