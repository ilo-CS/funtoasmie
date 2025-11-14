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
        return process.env.CORS_ORIGIN
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);
      }

      return [
        'http://localhost',
        'http://localhost:80',
        'http://localhost:3000'
      ];
    })(),
    credentials: true
  },

  // Configuration de sécurité
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  }
};

module.exports = config;
