process.loadEnvFile('/var/www/continue/.env.production');

module.exports = {
  apps: [
    {
      name: 'continue',
      script: '.next/standalone/server.js',
      cwd: '/var/www/continue',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '127.0.0.1',
        MONGODB_URI: 'mongodb://127.0.0.1:27017/locus',
        SESSION_SECRET: process.env.SESSION_SECRET,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        MAIL_FROM: process.env.MAIL_FROM,
        GROQ_API_KEY: process.env.GROQ_API_KEY,
      },
      error_file: '/var/log/continue/error.log',
      out_file: '/var/log/continue/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
