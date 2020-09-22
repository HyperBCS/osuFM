module.exports = {
  apps : [{
    name: 'osuFM',
    script: './bin/www',
    autorestart: true,
    max_memory_restart: '1G',
    watch: ["osuFM.db"],
    env: {
      NODE_ENV: 'production'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
};
