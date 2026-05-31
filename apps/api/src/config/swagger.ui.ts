import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API documentation for E-commerce project'
    },
    servers: [
      {
        url: process.env.HOST || 'http://localhost:3000'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // chứa document của api
}

const swaggerSpec = swaggerJsdoc(options)

export { swaggerUi, swaggerSpec }
