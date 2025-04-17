import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PawFinder API',
            version: '1.0.0',
            description: 'Hayvan sahiplendirme platformu API dokümantasyonu',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Geliştirme sunucusu',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./app.js', './docs/api-docs.js'], // API rotalarının ve dokümantasyonun bulunduğu dosyalar
};

const specs = swaggerJsdoc(options);

export default specs; 