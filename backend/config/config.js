require('dotenv').config();

const config = {
  // Configuration de la base de données
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'raza',
    password: process.env.DB_PASSWORD || 'razapassword',
    name: process.env.DB_NAME || 'db_funtoasmie'
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Configuration du serveur
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },

  // Configuration CORS
  cors: {
    origin: (() => {
      if (process.env.CORS_ORIGIN) {
        const origins = process.env.CORS_ORIGIN
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);
        
        // Ajouter les variantes avec/sans trailing slash et port par défaut
        const expandedOrigins = [];
        origins.forEach(origin => {
          expandedOrigins.push(origin);
          // Ajouter sans trailing slash si présent
          if (origin.endsWith('/')) {
            expandedOrigins.push(origin.slice(0, -1));
          }
          // Ajouter avec port 80 si HTTP sans port explicite
          if (origin.startsWith('http://') && !origin.match(/:\d+/) && !origin.endsWith(':80')) {
            expandedOrigins.push(`${origin}:80`);
          }
          // Ajouter avec port 443 si HTTPS sans port explicite
          if (origin.startsWith('https://') && !origin.match(/:\d+/) && !origin.endsWith(':443')) {
            expandedOrigins.push(`${origin}:443`);
          }
        });
        
        return [...new Set(expandedOrigins)]; // Supprimer les doublons
      }

      // En développement, accepter localhost
      return [
        'http://37.59.118.164',
        'http://37.59.118.164:80',
        'http://37.59.118.164:3000',
        'http://127.0.0.1',
        'http://127.0.0.1:3000'
      ];
    })(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization']
  },

  // Configuration de sécurité
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  }
};

module.exports = config;
