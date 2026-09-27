#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { execFileSync } = require('child_process');

const prodEnvPath = path.resolve(process.cwd(), '.env.production');
if (!fs.existsSync(prodEnvPath)) {
  console.error('Error: .env.production file not found at', prodEnvPath);
  process.exit(1);
}

const prodEnv = dotenv.parse(fs.readFileSync(prodEnvPath));
const env = {
  ...process.env,
  ...prodEnv,
};

console.log('Deploying Prisma migrations to production database...');
const dbUrl = env.DIRECT_URL || env.DATABASE_URL;
if (dbUrl) {
  const urlObj = new URL(dbUrl);
  console.log(`Target Host: ${urlObj.host}, User: ${urlObj.username}`);
}

try {
  execFileSync('npx', ['prisma', 'migrate', 'deploy', '--schema', 'apps/api/prisma/schema.prisma'], {
    env,
    stdio: 'inherit',
    shell: true,
  });
  console.log('\n✔ Migrations deployed successfully to production!');
} catch (err) {
  console.error('\n✖ Failed to deploy migrations:', err.message);
  process.exit(1);
}
