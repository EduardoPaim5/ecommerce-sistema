import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export type PasswordHasher = {
  hash(senha: string): string;
  verify(senha: string, senhaHash: string): boolean;
};

export class ScryptPasswordHasher implements PasswordHasher {
  hash(senha: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(senha, salt, KEY_LENGTH).toString("hex");
    return `scrypt:${salt}:${hash}`;
  }

  verify(senha: string, senhaHash: string): boolean {
    const [algoritmo, salt, hash] = senhaHash.split(":");
    if (algoritmo !== "scrypt" || !salt || !hash) return false;

    const hashInformado = Buffer.from(scryptSync(senha, salt, KEY_LENGTH).toString("hex"), "hex");
    const hashPersistido = Buffer.from(hash, "hex");
    return hashInformado.length === hashPersistido.length && timingSafeEqual(hashInformado, hashPersistido);
  }
}
