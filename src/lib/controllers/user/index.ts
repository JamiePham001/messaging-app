import { getUserFromDb, createUser, getUserByUsername } from "@/lib/db/queries";
import bcrypt, { compare } from "bcryptjs";

export const checkUserExistsQuery = async (email: string, password: string) => {
  const user = await getUserFromDb(email);

  if (!user || !user.password) {
    return null;
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return null;
  }

  return comparePassword ? user : null;
};

export const createUserQuery = async (
  email: string,
  displayName: string,
  username: string,
  password: string,
  status: string,
) => {
  function generateRandomFourDigit(): number {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  async function createUniqueUsername(username: string): Promise<string> {
    let validUsername = false;
    let usernameWithCode = "";
    while (validUsername === false) {
      const newRandomFourDigit = generateRandomFourDigit();
      usernameWithCode = username.concat(newRandomFourDigit.toString());
      const existingUser = await getUserByUsername(usernameWithCode);
      if (!existingUser) {
        validUsername = true;
      }
    }
    return usernameWithCode;
  }
  const usernameWithCode = await createUniqueUsername(username);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return await createUser(
    email,
    displayName,
    usernameWithCode,
    hashedPassword,
    status,
  );
};
