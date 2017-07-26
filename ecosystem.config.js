module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name: 'tramtime',
      script: 'index.js',
      env: {
        PORT: '2369'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user: 'levi',
      host: 'wtf0.com',
      ref: 'origin/master',
      repo: 'git@github.com:levibuzolic/tramtime.git',
      path: '/var/www/ferociatrams.wtf0.com',
      'pre-deploy': 'which nvm && echo which nvm',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
