#!/usr/bin/env node

import { Command } from 'commander';
import { GitHubRewardsSDK } from './sdk';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { ProcessedMetrics } from './types/metrics';

export const program = new Command();

program
  .name('near-protocol-rewards')
  .description('CLI for NEAR Protocol Rewards SDK')
  .version('0.3.0');

program
  .command('init')
  .description('Initialize NEAR Protocol Rewards in your project')
  .action(async () => {
    try {
      // 1. Create GitHub workflow directory
      const workflowDir = join(process.cwd(), '.github', 'workflows');
      mkdirSync(workflowDir, { recursive: true });

      // 2. Create workflow file
      const workflowContent = `name: NEAR Protocol Rewards Tracking
on:
  schedule:
    - cron: '0 */12 * * *'  # Every 12 hours
  workflow_dispatch:        # Manual trigger
  push:
    branches: [ main ]     # Start on main branch updates

jobs:
  track-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Run Metrics Collection
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: \${{ github.repository }}
        run: npx near-protocol-rewards track
`;

      writeFileSync(join(workflowDir, 'near-rewards.yml'), workflowContent);
      console.log('✅ Created GitHub Action workflow');
      
      console.log('\n🎉 NEAR Protocol Rewards initialized successfully!');
      console.log('\nMetrics collection will start automatically:');
      console.log('1. On every push to main branch');
      console.log('2. Every 12 hours via scheduled run');
      console.log('\n📊 View your metrics at: https://protocol-rewards-dashboard.vercel.app');
      console.log('\nTo connect your repository to the dashboard:');
      console.log('1. Go to https://protocol-rewards-dashboard.vercel.app');
      console.log('2. Sign in with your GitHub account');
      console.log('3. Select this repository from the list');
      console.log('\nNote: First metrics will appear after your next push to main');
    } catch (error) {
      console.error('Failed to initialize:', error);
      process.exit(1);
    }
  });

program
  .command('track')
  .description('Track metrics (used by GitHub Action)')
  .action(async () => {
    try {
      // Validate environment
      if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
        throw new Error('This command should only be run in GitHub Actions environment');
      }

      const sdk = new GitHubRewardsSDK({
        githubToken: process.env.GITHUB_TOKEN,
        githubRepo: process.env.GITHUB_REPO,
        timeframe: 'week'
      });

      // Setup event handlers
      sdk.on('metrics:collected', (metrics: ProcessedMetrics) => {
        console.log('📊 Metrics collected:', {
          commits: metrics.github.commits.count,
          prs: metrics.github.pullRequests.merged,
          reviews: metrics.github.reviews.count,
          issues: metrics.github.issues.closed
        });
      });

      sdk.on('error', (error: Error) => {
        console.error('❌ Error:', error.message);
      });

      // Collect metrics once
      await sdk.startTracking();
      const metrics = await sdk.getMetrics();
      await sdk.stopTracking();

      if (!metrics) {
        throw new Error('Failed to collect metrics');
      }

      console.log('✅ Metrics collection complete');
      process.exit(0);
    } catch (error) {
      console.error('Failed to track metrics:', error);
      process.exit(1);
    }
  });

// Only parse if this is the main module
if (require.main === module) {
  program.parse();
} 