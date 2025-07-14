import express from "express";
import setupAuthRoutes from "./authentication";

export const createUserRouter = (): express.Router => {
  const router = express.Router();
  setupAuthRoutes(router);
  return router;
};
