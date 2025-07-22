console.log("Helpers loaded!");
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";


const SECRET = process.env.JWT_SECRET as string;


//hash + salt pw
export const hashPassword = async (hashPassword: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(hashPassword, saltRounds);
};
export const verifyPassword = async (
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const generateJWT = (payload: object): string => {
  return jwt.sign(payload, SECRET, {expiresIn: "1h"});
}
export const verifyJWT = (token: string): any => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}