const core = require("@actions/core");
const github = require("@actions/github");

const CHECKED = "- [x] <!-- manual job -->";
const UNCHECKED = "- [ ] <!-- manual job -->";

async function run() {
  try {
    const masterIssueId = core.getInput("master-issue-id");
    const owner = core.getInput("owner");
    const repo = core.getInput("repo");
    const token = core.getInput("token");
    const octokit = github.getOctokit(token || process.env.GITHUB_TOKEN);

    if (!masterIssueId) {
      core.setFailed("master-issue-id is missing! Please take a look at the documentation and set the missing parameter.");
      return;
    }

    core.info(owner || github.context.repo.owner);
    core.info(repo || github.context.repo.repo);

    const { data: masterIssue } = await octokit.issues.get({
      owner: owner || github.context.repo.owner,
      repo: repo || github.context.repo.repo,
      issue_number: masterIssueId,
    }).catch(err => console.log(err));

    // if (masterIssue.user.login !== "renovate[bot]") {
    //   const message = `Issue ID ${masterIssue.id} author must be "renovate[bot]"`;
    //   core.setFailed(message);
    // }

    // Stop here if already checked
    if (masterIssue.body.includes(CHECKED)) {
      core.info(`Checkbox already checked.`);
      return "Already Checked";
    }

    await octokit.issues.update({
      owner: owner || github.context.repo.owner,
      repo: repo || github.context.repo.repo,
      issue_number: masterIssueId,
      body: masterIssue.body.replace(UNCHECKED, CHECKED),
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
