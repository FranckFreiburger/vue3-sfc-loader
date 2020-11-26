# Commit Message Convention

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

type: `feat|fix|perf|docs|refactor|test|chore|...`
scope: `core|build|docs|...`
subject: Use the imperative, present tense: "change" not "changed" nor "changes". Don't capitalize the first letter. Do dot (.) at the end


### Body

Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

Breaking Changes should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

