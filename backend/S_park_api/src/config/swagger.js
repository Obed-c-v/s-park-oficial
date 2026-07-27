const swaggerJsdoc = require('swagger-jsdoc');

const isProduction = process.env.NODE_ENV === 'production';

const servers = isProduction
  ? [
      {
        url: process.env.API_BASE_URL || 'https://spark-backend-8zi1.onrender.com/api',
        description: 'Servidor de Producción (Render)',
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de Desarrollo (local)',
      },
    ]
  : [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de Desarrollo (local)',
      },
      {
        url: process.env.API_BASE_URL || 'https://spark-backend-8zi1.onrender.com/api',
        description: 'Servidor de Producción (Render)',
      },
    ];

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'S-park API',
      version: '1.0.0',
      description: 'API para detección de Parkinson por voz',
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;

