module.exports = {
  apps: [
    {
      name: 'xinghe-dashboard',
      cwd: './server',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        DATABASE_URL: 'file:./dev.db',
        CORS_ORIGIN: '*'
      }
    }
  ]
};
