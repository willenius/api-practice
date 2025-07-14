import express from "express";
import setupAuthRoutes from "../controllers/authentication";

export default (router: express.Router) => {
  setupAuthRoutes(router);
};
