module.exports = {
  apps: [
    {
      name: "restoapp",
      script: "node_modules/.bin/next",
      args: "start --hostname 127.0.0.1",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 5555,
      },
    },
  ],
}
