# Commit Message Convention

see https://www.conventionalcommits.org/

## Full Message Format
```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Commit Message Header

`<type>(<scope>): <subject>`

type: `feat|fix|build|perf|size|docs|refactor|test|chore|wip|...`
scope: `core|build|docs|deps|workflow|...`
subject: Use the imperative, present tense: "change" not "changed" nor "changes". Don't capitalize the first letter. Do dot (.) at the end

fix: a commit of the type fix patches a bug in your codebase (this correlates with PATCH in semantic versioning).
feat: a commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in semantic versioning).


#### Revert
If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit.
In the body, it should say: `This reverts commit <hash>`, where the hash is the SHA of the commit being reverted.

### Body

Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

Breaking Changes should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

BREAKING CHANGE: a commit that has a footer BREAKING CHANGE:, or appends a ! after the type/scope, introduces a breaking API change (correlating with MAJOR in semantic versioning). A BREAKING CHANGE can be part of commits of any type.
