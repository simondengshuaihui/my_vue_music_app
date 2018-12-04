module.exports = {
  apps : [{
    name: 'music',
    script: 'prod.server.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    // args: 'one two',
    // instances: 1,
    // autorestart: true,
    // watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'root',
      host : '47.107.127.139',
      ref  : 'origin/master',
      repo : 'git@gitee.com:simonhui/music-app.git',
      path : '/www/music/production',
      'post-deploy' : 'git pull origin master && cnpm install && npm build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
