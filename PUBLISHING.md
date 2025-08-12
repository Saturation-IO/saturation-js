# Publishing @saturation-api/js SDK

Guide for publishing the @saturation-api/js SDK to npm.

## Prerequisites

Before publishing, ensure you have:

1. **npm Account & Access**

   - Active npm account
   - Member of the `@saturation-api` organization on npm
   - 2FA enabled (required for publishing)
2. **Local Setup**

   ```bash
   # Verify you're logged in
   npm whoami

   # If not logged in
   npm login

   # Verify you have publish access
   npm access list packages @saturation-api
   ```
3. **Repository Access**

   - Write access to the saturation-js repository
   - Ability to create git tags and releases

## Pre-Publishing Checklist

Before every release, verify:

- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No ESLint issues: `npm run lint`
- [ ] Build works: `npm run build`
- [ ] Updated version in `package.json`
- [ ] Updated CHANGELOG.md with release notes
- [ ] README.md is up to date
- [ ] API docs are current

## Publishing Process

### 1. Update OpenAPI Types (If API Changed)

If the API has changed, regenerate types:

```bash
cd saturation-js

# Regenerate types from OpenAPI spec
npm run generate

# Verify the generated types
npm run typecheck

# Run tests to ensure nothing broke
npm test
```

### 2. Version Bump

Choose the appropriate version bump based on [Semantic Versioning](https://semver.org/):

```bash
# For bug fixes (1.0.0 → 1.0.1)
npm version patch

# For new features, backward compatible (1.0.0 → 1.1.0)
npm version minor

# For breaking changes (1.0.0 → 2.0.0)
npm version major

# For pre-releases (1.0.0 → 1.1.0-beta.0)
npm version prerelease --preid=beta
```

This will:

- Update version in package.json
- Create a git commit
- Create a git tag

### 3. Final Build & Test

```bash
# Clean build
npm run build

# Run all validations
npm run lint && npm run typecheck && npm test

# Test the package locally (optional but recommended)
npm pack
# This creates saturation-js-X.X.X.tgz
# Test it in another project: npm install ../path/to/saturation-js-X.X.X.tgz
```

### 4. Publish to npm

```bash
# For latest stable release
npm publish --access public

# For beta/preview releases
npm publish --access public --tag beta

# For next/canary releases
npm publish --access public --tag next
```

You'll be prompted for your 2FA code.

### 5. Push to GitHub

```bash
# Push the version commit and tag
git push origin main
git push origin --tags
```

### 6. Create GitHub Release

1. Go to [GitHub Releases](https://github.com/saturation-api/saturation-js/releases)
2. Click "Create a new release"
3. Select the version tag you just created
4. Title: `v{version}` (e.g., `v1.2.0`)
5. Add release notes (copy from CHANGELOG.md)
6. If it's a pre-release, check "This is a pre-release"
7. Click "Publish release"

### 7. Verify Publication

```bash
# Check npm registry
npm view @saturation-api/js

# Verify the latest version
npm view @saturation-api/js version

# Check all published versions
npm view @saturation-api/js versions

# Test installation in a fresh directory
mkdir test-sdk && cd test-sdk
npm init -y
npm install @saturation-api/js
```

## Publishing Workflow (GitHub Actions)

The SDK has automated publishing via GitHub Actions. To use it:

### Automatic Release (Recommended)

1. Create a new release on GitHub
2. The workflow automatically publishes to npm
3. Requires `NPM_TOKEN` secret to be set in repository settings

### Manual Release

1. Go to Actions tab
2. Select "Publish to npm" workflow
3. Click "Run workflow"
4. Enter version and tag
5. Click "Run workflow"

## Version Management

### Version Tags on npm

- `latest` - Current stable release (default)
- `beta` - Pre-release for testing
- `next` - Experimental features
- `alpha` - Early development versions

### Installing Specific Versions

Users can install different versions:

```bash
# Latest stable (default)
npm install @saturation-api/js

# Beta version
npm install @saturation-api/js@beta

# Specific version
npm install @saturation-api/js@1.2.3

# Version range
npm install @saturation-api/js@^1.0.0
```

## Rollback Process

If something goes wrong:

### 1. Deprecate the Bad Version

```bash
npm deprecate @saturation-api/js@1.2.3 "Critical bug in this version, please use 1.2.4"
```

### 2. Publish a Fix

```bash
# Revert the problematic commits
git revert <commit-hash>

# Bump version
npm version patch

# Publish the fix
npm publish --access public
```

### 3. Update the Latest Tag (if needed)

```bash
# Point latest to a previous stable version
npm dist-tag add @saturation-api/js@1.2.2 latest
```

## Security Considerations

1. **Never commit sensitive data**

   - API keys
   - Internal URLs
   - Customer data
2. **Review generated code**

   - Check the OpenAPI generation output
   - Ensure no internal endpoints are exposed
3. **Token Security**

   - Use npm's built-in 2FA
   - Rotate npm tokens regularly
   - Use granular access tokens for CI/CD
4. **Dependency Audit**

   ```bash
   # Check for vulnerabilities
   npm audit

   # Fix vulnerabilities
   npm audit fix
   ```

## Troubleshooting

### "402 Payment Required"

- Organization needs a paid npm plan for private packages
- Ensure using `--access public` for public packages

### "403 Forbidden"

- Not logged in: `npm login`
- No publish access: Contact npm org admin
- 2FA required: Enable 2FA on npm account

### "409 Conflict"

- Version already exists
- Bump version and try again

### Build Fails

```bash
# Clean everything and rebuild
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### Types Out of Sync

```bash
# Regenerate from latest OpenAPI
npm run generate
npm run typecheck
```

## Release Cadence

- **Patch releases**: As needed for bug fixes
- **Minor releases**: Monthly or when new features are ready
- **Major releases**: Quarterly or for breaking changes
- **Beta releases**: Before any major/minor release

## Communication

After publishing:

1. **Internal**

   - Post in #engineering Slack channel
   - Update internal documentation
   - Notify the product team
2. **External** (for significant releases)

   - Update API documentation
   - Post in Discord community
   - Tweet from @saturation-api account
   - Update customer-facing changelog

## Contacts

- **npm Organization**: admin@saturation.io
- **GitHub Repository**: github.com/saturation-api/saturation-js
- **SDK Maintainers**: @engineering-team
- **Questions**: #sdk-development channel in Slack

---

**Remember**: Publishing affects all users. Always test thoroughly and follow the checklist!
