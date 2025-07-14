console.log("Helpers loaded!");
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SECRET = "WILLE-REST-API";

//salt pw
export const random = () => crypto.randomBytes(128).toString("base64");
export const createSessionToken = (salt: string, password: string) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};

//hash pw
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
