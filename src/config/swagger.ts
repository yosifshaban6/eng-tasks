import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Eng Tasks API",
      version: "1.0.0",
      description: `
        A REST API for managing tasks, comments, and activity tracking.
        
        ## Features
        - Task CRUD operations
        - Pagination, filtering, and sorting
        - Activity logging for all changes
        - Comment system
        - Real-time updates (WebSocket)
        - Rate limiting
        - Redis caching
      `,
      contact: {
        name: "API Support",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        // We'll add auth later if needed
      },
      schemas: {
        // Define reusable schemas
        Task: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "ICU Patient Bed Availability Check" },
            description: { type: "string", example: "Check and update ICU bed availability" },
            status: { type: "string", enum: ["BACKLOG", "IN_PROGRESS", "BLOCKED", "DONE"], example: "IN_PROGRESS" },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], example: "URGENT" },
            category: { type: "string", example: "Emergency" },
            dueDate: { type: "string", format: "date-time", example: "2026-04-15T10:00:00Z" },
            archived: { type: "boolean", example: false },
            assigneeId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TaskWithDetails: {
          allOf: [
            { $ref: "#/components/schemas/Task" },
            {
              properties: {
                assignee: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    email: { type: "string" },
                  },
                },
                comments: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Comment" },
                },
                activity: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ActivityLog" },
                },
              },
            },
          ],
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            taskId: { type: "integer" },
            authorId: { type: "integer" },
            message: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            author: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                email: { type: "string" },
              },
            },
          },
        },
        ActivityLog: {
          type: "object",
          properties: {
            id: { type: "integer" },
            taskId: { type: "integer" },
            userId: { type: "integer" },
            action: { type: "string", enum: ["CREATE", "UPDATE", "DELETE", "ARCHIVE", "RESTORE", "COMMENT"] },
            field: { type: "string", nullable: true },
            oldValue: { type: "string", nullable: true },
            newValue: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                email: { type: "string" },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
            meta: { type: "object", nullable: true },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            meta: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
            error: { type: "object", nullable: true },
          },
        },
      },
    },
    tags: [
      {
        name: "Tasks",
        description: "Task management endpoints",
      },
      {
        name: "Comments",
        description: "Comment management endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Health",
        description: "Health check endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
