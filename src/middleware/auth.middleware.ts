import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../helpers/auth.helpers";

export interface AuthRequest extends Request {
    user?: any
};

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token found" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJWT(token);

    if (!decoded) {
        return res.status(401).json({ message: "Unable to access token" })
    }

    req.user = decoded;

    next();
}