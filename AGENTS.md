# GMZ repository operating rules

## Branching and main protection

- Never modify `main` directly.
- Every change must start from a dedicated branch created from the latest `main`.
- Commits must be made only on the working branch.
- Changes reach `main` only through a pull request and merge.
- Force-pushes and direct commits to `main` are not part of the workflow.

## Deployment policy

- `main` is the only branch allowed to trigger a Vercel deployment.
- Feature, fix, refactor, chore, and other non-`main` branches must not create Vercel preview deployments.
- GitHub Actions running on pull requests may validate code, but must not deploy it.

## Validation policy

Before merging a pull request into `main`:

1. run the TypeScript check;
2. run the automated test suite;
3. run the production build;
4. resolve failing required checks before merge.

## Change discipline

- Keep changes scoped to the task.
- Prefer small, reviewable commits.
- Avoid unrelated formatting or refactors in the same change.
- Preserve existing behavior unless the task explicitly changes it.
