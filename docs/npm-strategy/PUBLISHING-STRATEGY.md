# WebAX Publishing Strategy

## Overview

This document outlines the strategy for publishing WebAX packages to NPM. A well-defined publishing strategy ensures that packages are released in a consistent and predictable manner, making it easier for users to understand the stability and compatibility of each release.

## Version Numbering

WebAX packages follow semantic versioning (SemVer):

```
MAJOR.MINOR.PATCH[-PRERELEASE]
```

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes
- **PRERELEASE**: Alpha, beta, or release candidate versions

### Examples

- `0.1.0`: Initial development version
- `0.1.1`: Bug fix release
- `0.2.0`: New feature release
- `1.0.0`: First stable release
- `1.0.1`: Bug fix for stable release
- `1.1.0`: New feature for stable release
- `2.0.0`: Breaking change release
- `1.0.0-alpha.1`: Alpha release
- `1.0.0-beta.1`: Beta release
- `1.0.0-rc.1`: Release candidate

## Release Phases

WebAX packages go through several release phases:

### 1. Alpha Releases

Alpha releases are early, unstable versions of the package. They are used for internal testing and early adopters who want to provide feedback on the API design.

- **Version Format**: `0.1.0-alpha.1`, `0.1.0-alpha.2`, etc.
- **NPM Tag**: `alpha`
- **Stability**: Low
- **API Stability**: May change significantly
- **Documentation**: Basic README and API documentation
- **Testing**: Basic unit tests

#### Publishing Alpha Releases

```bash
# Update version in package.json
npm version prerelease --preid=alpha

# Build the package
npm run build

# Publish to NPM with alpha tag
npm publish --tag alpha
```

### 2. Beta Releases

Beta releases are more stable than alpha releases but may still contain bugs. They are used for wider testing and feedback.

- **Version Format**: `0.1.0-beta.1`, `0.1.0-beta.2`, etc.
- **NPM Tag**: `beta`
- **Stability**: Medium
- **API Stability**: May change, but less frequently than alpha
- **Documentation**: More comprehensive README and API documentation
- **Testing**: More comprehensive unit tests and some integration tests

#### Publishing Beta Releases

```bash
# Update version in package.json
npm version prerelease --preid=beta

# Build the package
npm run build

# Publish to NPM with beta tag
npm publish --tag beta
```

### 3. Release Candidates

Release candidates are nearly stable versions of the package. They are used for final testing before a stable release.

- **Version Format**: `1.0.0-rc.1`, `1.0.0-rc.2`, etc.
- **NPM Tag**: `rc`
- **Stability**: High
- **API Stability**: Should not change unless critical issues are found
- **Documentation**: Complete README, API documentation, and examples
- **Testing**: Comprehensive unit tests, integration tests, and some end-to-end tests

#### Publishing Release Candidates

```bash
# Update version in package.json
npm version prerelease --preid=rc

# Build the package
npm run build

# Publish to NPM with rc tag
npm publish --tag rc
```

### 4. Stable Releases

Stable releases are production-ready versions of the package. They are used for general consumption.

- **Version Format**: `1.0.0`, `1.0.1`, `1.1.0`, etc.
- **NPM Tag**: `latest`
- **Stability**: Very high
- **API Stability**: Should not change within the same major version
- **Documentation**: Complete README, API documentation, examples, and tutorials
- **Testing**: Comprehensive unit tests, integration tests, and end-to-end tests

#### Publishing Stable Releases

```bash
# Update version in package.json
npm version major|minor|patch

# Build the package
npm run build

# Publish to NPM with latest tag
npm publish
```

## Release Process

The release process for WebAX packages consists of the following steps:

1. **Prepare the Release**:
   - Update the version in package.json
   - Update the CHANGELOG.md
   - Update the README.md if necessary
   - Ensure all tests pass
   - Ensure the build succeeds

2. **Create a Release Branch**:
   - Create a release branch from the main branch
   - Make any necessary changes for the release
   - Merge the release branch back into the main branch

3. **Tag the Release**:
   - Create a Git tag for the release
   - Push the tag to the remote repository

4. **Publish to NPM**:
   - Build the package
   - Publish the package to NPM with the appropriate tag

5. **Announce the Release**:
   - Update the release notes on GitHub
   - Announce the release on the WebAX website
   - Notify users through appropriate channels

## Release Automation

To automate the release process, you can use tools like:

- **semantic-release**: Automates the whole package release workflow
- **standard-version**: Automates versioning and CHANGELOG generation
- **GitHub Actions**: Automates the build, test, and publish process

### Example GitHub Action

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

## Deprecation Policy

When a package or a specific version of a package is no longer supported, it should be deprecated:

```bash
# Deprecate a specific version
npm deprecate @net.webax/package-name@1.0.0 "This version is no longer supported"

# Deprecate all versions
npm deprecate @net.webax/package-name "This package is no longer supported"
```

## Conclusion

Following a consistent publishing strategy is essential for creating a reliable and trustworthy ecosystem of WebAX packages. By adhering to the strategy outlined in this document, you can ensure that your packages are released in a way that is predictable and understandable for users.
