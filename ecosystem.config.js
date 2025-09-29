module.exports = {
  apps: [
    {
      name: 'shipany-template-one',
      script: 'pnpm',
      args: 'start',
      cwd: '/home/ubuntu/ship-haopengyou',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        NODE_NO_WARNINGS: 1
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
