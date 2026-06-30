import { criarHttpApp } from "./http-app.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const app = await criarHttpApp();
await app.listen({ port, host });

console.log(`API HTTP ouvindo em http://${host}:${port}`);
