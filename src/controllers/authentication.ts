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
  random,
  createSessionToken,
  hashPassword,
  verifyPassword,
} from "../helpers";

const setupAuthRoutes = (router: express.Router) => {
  // Registrera användare
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
      // Kontrollera om användarnamn eller email redan finns
      if (await getUserByEmail(email)) {
        return res.status(409).json({ message: "Email är redan registrerat" });
      }
      if (await getUserByUsername(username)) {
        return res
          .status(409)
          .json({ message: "Användarnamn är redan upptaget" });
      }

      const salt = random();
      const hashedPassword = await hashPassword(password);
      const sessionToken = createSessionToken(salt, password);

      const newUser = {
        username,
        email,
        firstName,
        lastName,
        streetAddress,
        postalCode,
        authentication: {
          salt,
          password: hashedPassword,
          sessionToken,
        },
      };

      const createdUser = await createUser(newUser);
      return res.status(201).json(createdUser);
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logga in användare
  router.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await getUserByUsername(username).select(
        "+authentication.password +authentication.salt +authentication.sessionToken"
      );
      if (!user) {
        return res
          .status(401)
          .json({ message: "Felaktigt användarnamn eller lösenord" });
      }

      const isPasswordValid = await verifyPassword(
        password,
        user.authentication.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Felaktigt användarnamn eller lösenord" });
      }

      // Skapa ny sessionToken och spara
      const sessionToken = createSessionToken(
        user.authentication.salt,
        password
      );
      user.authentication.sessionToken = sessionToken;
      await user.save();

      return res
        .status(200)
        .json({ message: "Inloggning lyckades", sessionToken });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Uppdatera användare
  router.put("/auth/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const updatedUser = await updateUserById(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "Användare hittades inte" });
      }
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ message: "Uppdatering misslyckades" });
    }
  });

  // Ta bort användare
  router.delete("/auth/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const deletedUser = await deleteUserById(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "Användare hittades inte" });
      }
      return res
        .status(200)
        .json({ message: "Användare borttagen", user: deletedUser });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ message: "Borttagning misslyckades" });
    }
  });

  // Hämta alla användare (exempel på route)
  router.get("/auth/users", async (_req, res) => {
    try {
      const users = await getUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Kunde inte hämta användare" });
    }
  });
};

export default setupAuthRoutes;
