const { Octokit } = require("@octokit/action");
const payload = require(process.env.GITHUB_EVENT_PATH);

console.log(JSON.stringify(payload.pull_request));

const pattern = /\bwip\b|🚧/i;
const isWip =
  pattern.test(payload.pull_request.title) ||
  payload.pull_request.labels.some(({ name }) => pattern.test(name));
const octokit = new Octokit();

// https://developer.github.com/v3/repos/statuses/#create-a-status
octokit
  .request("POST /repos/:owner/:repo/statuses/:sha", {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    sha: payload.pull_request.head.sha,
    state: isWip ? "pending" : "success",
    target_url: "https://github.com/knu/wip",
    description: isWip ? "work in progress" : "ready for review",
    context: "WIP (action)",
  })
  .catch(console.error);
