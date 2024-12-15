import { decrypt } from "./encrypt.util";

export function validatePassword(encryptedPassword: string, password: string) {
  return decrypt(encryptedPassword) === password;
}
