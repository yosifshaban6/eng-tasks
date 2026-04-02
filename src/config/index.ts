import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  // Environment
  env: process.env.NODE_ENV || "development",
  
  // Server
  port: parseInt(process.env.PORT || "3000"),
  
  // API
  apiVersion: process.env.API_VERSION || "v1",
  apiPrefix: process.env.API_PREFIX || "/api",
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  get baseUrl() {
    return `http://localhost:${this.port}`;
  },
  
  get apiBasePath() {
    return `${this.apiPrefix}/${this.apiVersion}`;
  }
};

// Validation
if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}