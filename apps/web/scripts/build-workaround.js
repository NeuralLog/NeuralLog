#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Next.js build with trace file workaround...');

// Try to create .next directory if it doesn't exist
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  try {
    fs.mkdirSync(nextDir, { recursive: true });
    console.log('Created .next directory');
  } catch (error) {
    console.log('Could not create .next directory:', error.message);
  }
}

// Set environment variables to disable telemetry and tracing
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Start the build process
const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

buildProcess.on('error', (error) => {
  console.error('Build process error:', error);
  process.exit(1);
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully!');
  } else {
    console.log(`Build process exited with code ${code}`);
  }
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating build process...');
  buildProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Terminating build process...');
  buildProcess.kill('SIGTERM');
});
