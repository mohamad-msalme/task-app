import bcrypt from "bcrypt";

const saltRounds = 10;

export async function hashPassword(password: string) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash; // Store this hash in the database
  } catch (error) {
    console.error("Hashing error:", error);
    throw error;
  }
}

export async function comparePassword(
  providedPassword: string,
  storedHash: string
) {
  try {
    const match = await bcrypt.compare(providedPassword, storedHash);
    return match; // true if password is correct
  } catch (error) {
    console.error("Error checking password:", error);
    return false;
  }
}
