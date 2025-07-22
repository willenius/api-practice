import dotenv from "dotenv";
dotenv.config();
import { authenticateJWT } from "../middleware/auth.middleware";
import { AuthRequest } from "../middleware/auth.middleware";
import express from "express";
import {
  getUsers,
  createUser,
  deleteUserById,
  getUserByEmail,
  getUserByUsername,
  updateUserById,
} from "../models/users";
import {
  generateJWT,
  hashPassword,
  verifyPassword,
} from "../helpers/auth.helpers";

const setupAuthRoutes = (router: express.Router) => {
  // Registrerar användare
  router.post("/auth/register", async (req, res) => {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      streetAddress,
      postalCode,
    } = req.body;

    try {
      // Kontrollerar om användarnamn eller email redan finns
      if (await getUserByEmail(email)) {
        return res.status(409).json({ message: "Email är redan registrerat" });
      }
      if (await getUserByUsername(username)) {
        return res
          .status(409)
          .json({ message: "Username already in use" });
      }
      const hashedPassword = await hashPassword(password);

      const newUser = {
        username,
        email,
        firstName,
        lastName,
        streetAddress,
        postalCode,
        authentication: {
          password: hashedPassword,
        },
      };

      const createdUser = await createUser(newUser);
      return res.status(201).json(createdUser);
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logga in en användare
  router.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await getUserByUsername(username).select(
        "+authentication.password +authentication.salt +authentication.sessionToken"
      );
      if (!user) {
        return res
          .status(401)
          .json({ message: "Username or password wrong" });
      }

      const isPasswordValid = await verifyPassword(
        password,
        user.authentication.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Username or password wrong" });
      }

      // Skapa jwtToken
      const jwtToken = generateJWT({ id: user._id, username: user.username });

      return res.status(200).json({
        message: "Successful login",
        token: jwtToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Uppdaterar användare
  router.put("/auth/users/:id", authenticateJWT, async (req: AuthRequest, res) => {
    const { id } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ message: "You don't have access to perform changes." })
    }

    try {
      const updatedUser = await updateUserById(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "Couldn't find user" });
      }
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ message: "Update failed" });
    }
  });

  // Ta bort användare
  router.delete("/auth/users/:id", authenticateJWT, async (req: AuthRequest, res) => {
    const { id } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ message: "Du har inte behörighet att ta bort denna användare" });
    }

    try {
      const deletedUser = await deleteUserById(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "Could not find user per id" });
      }
      return res
        .status(200)
        .json({ message: "Användare borttagen", user: deletedUser });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ message: "Delete failed" });
    }
  });

  // Hämta alla användare
  router.get("/auth/users", async (_req, res) => {
    try {
      const users = await getUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Couldn't fetch users" });
    }
  });
};

export default setupAuthRoutes;
