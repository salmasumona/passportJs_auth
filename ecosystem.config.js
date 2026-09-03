module.exports = {
  apps: [{
    name: 'passport-auth',
    script: 'server.js',
    cwd: '/var/www/passportJs_auth',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
