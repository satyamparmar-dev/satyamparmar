#!/usr/bin/env node

/**
 * Deploy to GitHub Pages Script
 * This script builds the project and pushes to gh-pages branch
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting GitHub Pages deployment...');

try {
  // Step 1: Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Check if out directory exists
  const outDir = path.join(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    throw new Error('Build failed: out directory not found');
  }

  // Step 3: Create .nojekyll file
  const nojekyllPath = path.join(outDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  console.log('✅ Created .nojekyll file');

  // Step 4: Initialize git in out directory if needed
  if (!fs.existsSync(path.join(outDir, '.git'))) {
    console.log('🔧 Initializing git in out directory...');
    execSync('git init', { cwd: outDir, stdio: 'inherit' });
    execSync('git remote add origin https://github.com/satyamparmar-dev/backend-engineering.git', { 
      cwd: outDir, 
      stdio: 'inherit' 
    });
  }

  // Step 5: Add all files and commit
  console.log('📝 Adding files to git...');
  execSync('git add .', { cwd: outDir, stdio: 'inherit' });
  execSync('git commit -m "Deploy to GitHub Pages"', { cwd: outDir, stdio: 'inherit' });

  // Step 6: Push to gh-pages branch
  console.log('🚀 Pushing to gh-pages branch...');
  execSync('git push -f origin HEAD:gh-pages', { cwd: outDir, stdio: 'inherit' });

  console.log('🎉 Deployment successful!');
  console.log('🌐 Your site should be available at: https://satyamparmar-dev.github.io/backend-engineering');
  console.log('⏰ It may take a few minutes for the changes to be visible.');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
