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
      'post-deploy': 'node --version && which node && which npm && npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
