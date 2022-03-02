# BagelDB Contributing Guide

Hi! We are really excited that you are interested in contributing to BagelDB 👏. Before submitting your contribution though, please make sure to take a moment and read through the following guidelines.

- [Code of Conduct](./.github/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)

## Issue Reporting Guidelines

- The issue list of this repo is **exclusively** for bug reports and docs reports. Non-conforming issues will be closed immediately.

  - For simple beginner questions, you can get quick answers from the [BagelDB Discord](https://discord.gg/49hq7wu).

  <!-- - For more complicated questions, you can use [the Discussions section](https://forum.bageldb.dev/). Make sure to provide enough information when asking your questions - this makes it easier for others to help you! TODO: -->

  - For feature requests, you can [start a new feature discussion](https://github.com/bageldb/libraries/discussions/new?category=ideas-proposals).

- Try to search for your issue, it may have already been answered or even fixed in the development branch (`dev`).

- Check if the issue is reproducible with the latest stable version of bageldb. If you are using a pre-release, please indicate the specific version you are using.

- It is **required** that you clearly describe the steps necessary to reproduce the issue you are running into. Although we would love to help our users as much as possible, diagnosing issues without clear reproduction steps is extremely time-consuming and simply not sustainable.

- Use only the minimum amount of code necessary to reproduce the unexpected behavior. A good bug report should isolate specific methods that exhibit unexpected behavior and precisely define how expectations were violated. What did you expect the method or methods to do, and how did the observed behavior differ? The more precisely you isolate the issue, the faster we can investigate.

- Issues with no clear reproduction steps will not be triaged. If an issue labeled "bug/0-needs-info" receives no further input from the issue author for more than 5 days, it will be closed.

- If your issue is resolved but still open, don't hesitate to close it. In case you found a solution by yourself, it could be helpful to explain how you fixed it.

- Most importantly, we beg your patience: the team must balance your request against many other responsibilities — fixing other bugs, answering other questions, new features, new documentation, etc. The issue list is not paid support and we cannot make guarantees about how fast your issue can be resolved.

## Pull Request Guidelines

- The `master` branch is basically just a snapshot of the latest stable release. All development should be done in dedicated branches. **DO NOT submit PRs against the `master` branch.**

- Checkout a topic branch from the relevant branch, e.g. `dev`, and merge back against that branch.

- **DO NOT** checkin `dist` in the commits.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before merging.

- If adding new feature:
  - Provide convincing reason to add this feature. Ideally you should [start a new feature discussion](https://github.com/bageldb/libraries/discussions/new?category=ideas-proposals) first and have it greenlighted before working on it.

- If fixing a bug:
  - If you are resolving a special issue, add `(fix: #xxxx[,#xxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `fix: update entities encoding/decoding (fix #3899)`.
  - Provide detailed description of the bug in the PR. A live demo is preferred.

## Development Setup

You might need [Node.js](http://nodejs.org) **version 12.22.1+** along [Yarn](https://yarnpkg.com/) or [NPM](https://docs.npmjs.com/getting-started/installing-node). Read `package.json` for the library you plan on working on and take note of the scripts you can use.

After cloning the repo look for furthure instuctions in the directory of the library you're working on.