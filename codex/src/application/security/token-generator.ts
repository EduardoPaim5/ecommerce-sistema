import { randomBytes } from "node:crypto";

export type TokenGenerator = {
  gerar(): string;
};

export class RandomTokenGenerator implements TokenGenerator {
  gerar(): string {
    return randomBytes(32).toString("hex");
  }
}
