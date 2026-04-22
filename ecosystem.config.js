module.exports = {
  apps: [
    {
      name: "crochet-gallery",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
      // Automatically restart if memory gets too high
      max_memory_restart: "500M",
      // Set to true if you want it to automatically restart when .env.local changes
      watch: [".env.local"], 
      watch_options: {
        followSymlinks: false
      }
    },
  ],
};
