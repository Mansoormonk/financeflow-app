import { execSync } from 'child_process';
import { createGitHubRepo, getAuthenticatedUser } from '../server/github-setup';

async function setupGitHub() {
  try {
    console.log('Setting up GitHub repository...\n');
    
    // Get GitHub user info
    const user = await getAuthenticatedUser();
    console.log(`✓ Authenticated as: ${user.login}`);
    
    // Create repository
    const repoName = 'financeflow-app';
    const description = 'FinanceFlow - Personal Finance Management Application with income tracking, expense management, debt tracking, and financial reports';
    
    console.log(`\n✓ Creating repository: ${repoName}`);
    const repo = await createGitHubRepo(repoName, description, false);
    console.log(`✓ Repository created/found: ${repo.html_url}`);
    
    // Initialize git if not already initialized
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      console.log('\n✓ Git repository already initialized');
    } catch {
      console.log('\n✓ Initializing git repository...');
      execSync('git init', { stdio: 'inherit' });
      execSync('git checkout -b main', { stdio: 'inherit' });
    }
    
    // Configure git user if not set
    try {
      execSync('git config user.email', { stdio: 'pipe' });
    } catch {
      execSync(`git config user.email "${user.email || user.login + '@users.noreply.github.com'}"`, { stdio: 'inherit' });
      execSync(`git config user.name "${user.name || user.login}"`, { stdio: 'inherit' });
      console.log('✓ Git user configured');
    }
    
    // Add all files
    console.log('\n✓ Adding files to git...');
    execSync('git add .', { stdio: 'inherit' });
    
    // Create initial commit if needed
    try {
      execSync('git rev-parse HEAD', { stdio: 'pipe' });
      console.log('✓ Repository already has commits');
    } catch {
      console.log('✓ Creating initial commit...');
      execSync('git commit -m "Initial commit: FinanceFlow personal finance management app"', { stdio: 'inherit' });
    }
    
    // Add remote
    const remoteUrl = repo.clone_url.replace('https://', `https://${user.login}@`);
    try {
      execSync('git remote get-url origin', { stdio: 'pipe' });
      console.log('✓ Remote origin already exists');
      execSync(`git remote set-url origin ${remoteUrl}`, { stdio: 'inherit' });
    } catch {
      console.log('✓ Adding remote origin...');
      execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
    }
    
    // Push to GitHub
    console.log('\n✓ Pushing to GitHub...');
    try {
      execSync('git push -u origin main', { stdio: 'inherit' });
      console.log('\n✅ Successfully pushed to GitHub!');
    } catch (error) {
      console.log('\n⚠️  Push may have failed. Trying force push...');
      execSync('git push -u origin main --force', { stdio: 'inherit' });
      console.log('\n✅ Successfully force pushed to GitHub!');
    }
    
    console.log(`\n🎉 Your project is now on GitHub!`);
    console.log(`📦 Repository: ${repo.html_url}`);
    console.log(`\nYou can now:`);
    console.log(`  • View your code: ${repo.html_url}`);
    console.log(`  • Clone it: git clone ${repo.clone_url}`);
    console.log(`  • Share it: ${repo.html_url}`);
    
  } catch (error: any) {
    console.error('\n❌ Error setting up GitHub:', error.message);
    if (error.response) {
      console.error('GitHub API Error:', error.response.data);
    }
    process.exit(1);
  }
}

setupGitHub();
