import express from "express";
import swaggerUi from "swagger-ui-express";
import taskRoutes from "./routes/taskRoutes";
import { swaggerSpec } from "./config/swagger";
import { config } from "./config/index";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Eng Task Management API Docs",
}));

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
    docs: `${config.baseUrl}/api-docs`
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
    }
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: config.env === "development" ? err.message : "Internal server error"
  });
});

export default app;
