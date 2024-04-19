import { Secret } from "jsonwebtoken";
import { Request as ExpRequest } from "express";
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
      DATABASE_NAME: string;
      PORT: string;
      JWT_SECRET: Secret;
    }
  }
}

declare module "express" {
  export interface Request extends ExpRequest {
    userId?: string;
    token?: string;
  }
}
export {};
