import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Business Development Pipeline API',
      version,
      description: `
        A comprehensive CRM and sales pipeline management system designed for sales teams,
        team managers, and administrators to track opportunities, forecast revenue,
        and analyze performance metrics.

        ## Features
        - **Authentication**: JWT-based authentication with role-based access control (RBAC)
        - **Opportunities**: Track deals with probability scoring and revenue distribution
        - **Client Management**: Manage client companies and relationships
        - **Team Management**: Organize users into teams with managers
        - **Dashboards**: Individual, team, and global analytics with visualizations
        - **Activity Tracking**: Automatic logging of changes and updates
        - **Export**: Excel/CSV export for opportunities and analytics

        ## Authentication
        Most endpoints require authentication via JWT token in the Authorization header:
        \`Authorization: Bearer <token>\`

        ## Roles
        - **sales**: Regular sales representatives (can manage own opportunities)
        - **manager**: Team managers (can view team performance)
        - **admin**: System administrators (full access)
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'UNAUTHORIZED',
                },
                message: {
                  type: 'string',
                  example: 'Authentication required',
                },
                details: {
                  type: 'object',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            username: {
              type: 'string',
            },
            first_name: {
              type: 'string',
            },
            last_name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['sales', 'manager', 'admin'],
            },
            phone: {
              type: 'string',
              nullable: true,
            },
            avatar_url: {
              type: 'string',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ClientCompany: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            industry: {
              type: 'string',
              nullable: true,
            },
            relationship_tier: {
              type: 'string',
            },
            contact_person: {
              type: 'string',
              nullable: true,
            },
            email: {
              type: 'string',
              nullable: true,
            },
            phone: {
              type: 'string',
              nullable: true,
            },
            address: {
              type: 'string',
              nullable: true,
            },
            notes: {
              type: 'string',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Opportunity: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            project_name: {
              type: 'string',
            },
            service_type: {
              type: 'string',
            },
            sector_type: {
              type: 'string',
            },
            original_amount: {
              type: 'number',
              format: 'decimal',
            },
            project_maturity: {
              type: 'string',
            },
            client_type: {
              type: 'string',
            },
            client_relationship: {
              type: 'string',
            },
            conservative_approach: {
              type: 'boolean',
            },
            probability_score: {
              type: 'number',
              format: 'decimal',
            },
            weighted_amount: {
              type: 'number',
              format: 'decimal',
            },
            starting_date: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            closing_date: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['Active', 'Won', 'Lost', 'On Hold', 'Cancelled'],
            },
            stage: {
              type: 'string',
              enum: ['Prospection', 'Qualification', 'Proposal', 'Negotiation', 'Closed'],
            },
            notes: {
              type: 'string',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        RevenueDistribution: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            year: {
              type: 'integer',
            },
            month: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
            },
            sales_amount: {
              type: 'number',
              format: 'decimal',
            },
            gross_margin_amount: {
              type: 'number',
              format: 'decimal',
            },
          },
        },
        Activity: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            activity_type: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            old_value: {
              type: 'object',
              nullable: true,
            },
            new_value: {
              type: 'object',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {},
            },
            total: {
              type: 'integer',
            },
            page: {
              type: 'integer',
            },
            limit: {
              type: 'integer',
            },
            totalPages: {
              type: 'integer',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Teams',
        description: 'Team management endpoints',
      },
      {
        name: 'Clients',
        description: 'Client company management endpoints',
      },
      {
        name: 'Opportunities',
        description: 'Sales opportunity management endpoints',
      },
      {
        name: 'Dashboards',
        description: 'Analytics and dashboard endpoints',
      },
      {
        name: 'Export',
        description: 'Data export endpoints',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
