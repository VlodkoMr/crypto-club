module.exports = {
    apps: [{
        name: "crypto-club-server",
        script: "./server.js",
        watch: ["app"],
        env_production: {
            "NODE_ENV": "production"
        }
    }]
}
