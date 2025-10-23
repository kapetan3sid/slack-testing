const { Octokit } = require('@octokit/rest');

async function debugPRs() {
  const octokit = new Octokit({ 
    auth: process.env.GITHUB_TOKEN 
  });

  // Test with one of the repositories
  const repos = [
    { owner: 'polkadot-developers', repo: 'polkadot-docs' },
    { owner: 'wormhole-foundation', repo: 'wormhole-docs' },
    { owner: 'kluster-ai', repo: 'docs' },
    { owner: 'paritytech', repo: 'polkadot-sdk' },
    { owner: 'ethereumjs', repo: 'ethereumjs-monorepo' }
  ];

  for (const repoConfig of repos) {
    try {
      console.log(`\n🔍 Checking ${repoConfig.owner}/${repoConfig.repo}...`);
      
      const { data: pulls } = await octokit.rest.pulls.list({
        owner: repoConfig.owner,
        repo: repoConfig.repo,
        state: 'open',
        per_page: 10
      });

      console.log(`   Found ${pulls.length} open PRs`);
      
      const pullsWithAssignments = pulls.filter(pr => 
        (pr.requested_reviewers && pr.requested_reviewers.length > 0) ||
        (pr.assignees && pr.assignees.length > 0)
      );

      console.log(`   ${pullsWithAssignments.length} PRs have assignments`);
      
      for (const pr of pullsWithAssignments) {
        const reviewers = pr.requested_reviewers?.map(r => r.login) || [];
        const assignees = pr.assignees?.map(a => a.login) || [];
        console.log(`   PR #${pr.number}: "${pr.title.substring(0, 50)}..."`);
        console.log(`     Reviewers: [${reviewers.join(', ')}]`);
        console.log(`     Assignees: [${assignees.join(', ')}]`);
        console.log(`     Draft: ${pr.draft}`);
        
        if (reviewers.includes('kapetan3sid') || assignees.includes('kapetan3sid')) {
          console.log(`     ⭐ YOU ARE ASSIGNED TO THIS PR!`);
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error accessing ${repoConfig.owner}/${repoConfig.repo}:`, error.message);
    }
  }
}

if (require.main === module) {
  debugPRs().catch(console.error);
}