import express from "express";
import expressLayouts from "express-ejs-layouts";
import swaggerUi from "swagger-ui-express";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { swaggerSpec } from "./config/swagger.js";
import { config } from "./config/index.js";
import cacheRoutes from "./routes/cacheRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
import viewRoutes from "./routes/viewRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(expressLayouts); // Use layouts
app.set("layout", "layouts/main"); // Set default layout

// Static files
app.use(express.static(path.join(__dirname, "../public")));
app.use("/css", express.static(path.join(__dirname, "../public/css")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Eng Task Management API Docs",
  }),
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Request logging
if (config.env === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    version: config.apiVersion,
    environment: config.env,
    timestamp: new Date().toISOString(),
    docs: `${config.baseUrl}/api-docs`,
  });
});

// API Root
app.get(config.apiBasePath, (req, res) => {
  res.json({
    success: true,
    message: "Eng Task Management API",
    version: config.apiVersion,
    documentation: `${config.baseUrl}/api-docs`,
    endpoints: {
      tasks: `${config.baseUrl}${config.apiBasePath}/tasks`,
      users: `${config.baseUrl}${config.apiBasePath}/users`,
    },
  });
});

app.use(`${config.apiBasePath}/tasks`, taskRoutes);
app.use(`${config.apiBasePath}/users`, userRoutes);
app.use(`${config.apiBasePath}/`, cacheRoutes);
app.use(`/`, viewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      health: "GET /health",
      docs: "GET /api-docs",
      apiRoot: `GET ${config.apiBasePath}`,
      tasks: `GET ${config.apiBasePath}/tasks`,
    },
  });
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error:
        config.env === "development" ? err.message : "Internal server error",
    });
  },
);

export default app;
