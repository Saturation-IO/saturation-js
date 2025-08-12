# Saturation JS SDK Development Guidelines

## Project Overview
This is the TypeScript SDK for the Saturation API. The SDK is auto-generated from an OpenAPI specification and provides type-safe access to the Saturation API.

## Required Commands After Code Changes

After making any code changes, ALWAYS run these commands in order:

1. **Type checking**: `npm run typecheck`
   - Ensures all TypeScript types are correct
   - Must pass before proceeding

2. **Tests**: `npm test`
   - Runs the Jest test suite
   - All tests must pass

3. **Linting**: `npm run lint`
   - Checks code style and quality
   - Fix any linting errors

4. **Build**: `npm run build`
   - Builds both CommonJS and ESM versions
   - Ensures the package can be published

## Code Generation

The SDK uses @hey-api/openapi-ts to generate TypeScript code from the OpenAPI specification:

- **DO NOT manually edit** files in the `src/generated/` directory
- To update generated code: `npm run generate`
- Generated files:
  - `src/generated/sdk.gen.ts` - API function implementations
  - `src/generated/types.gen.ts` - TypeScript interfaces and types
  - `src/generated/client/` - HTTP client implementation
  - `src/generated/core/` - Core utilities

## Development Workflow

1. **Before starting work**:
   ```bash
   npm install
   npm run typecheck
   npm test
   ```

2. **When implementing new features**:
   - Write tests first (TDD approach)
   - Implement the feature
   - Run `npm run typecheck` after each significant change
   - Run `npm test` to verify functionality
   - Run `npm run lint` to check code style

3. **Before committing**:
   ```bash
   npm run typecheck && npm test && npm run lint && npm run build
   ```

## Type Safety Requirements

- **NEVER use `any` type** - use proper TypeScript types or generics
- **NEVER use `unknown` without type guards**
- **AVOID dynamic casting** - let TypeScript infer types
- **USE generic types** where appropriate for flexibility

## Testing Requirements

- Write tests for all new functionality
- Maintain test coverage above 80%
- Mock external dependencies (HTTP requests)
- Test both success and error cases

## File Structure

```
src/
├── client.ts           # Main SDK client class (Saturation)
├── generated/          # Auto-generated code (DO NOT EDIT)
│   ├── sdk.gen.ts     # Generated API functions
│   ├── types.gen.ts   # Generated TypeScript types
│   ├── client/        # Generated HTTP client
│   └── core/          # Generated utilities
└── index.ts           # Main export file
```

## API Implementation Pattern

The SDK wraps the generated API functions in `client.ts` to provide a clean interface:

```typescript
async methodName(projectId: string, data: Types.SomeInput): Promise<Types.SomeOutput> {
  const result = await sdk.someMethod({
    client: this.client,
    path: { projectId },
    body: data,
  });
  return result.data as Types.SomeOutput;
}
```

## Common Tasks

### Adding a new API endpoint
1. Update the OpenAPI spec (`openapi.yaml`)
2. Run `npm run generate` to update types
3. Implement the method in `client.ts`
4. Add tests in `__tests__/client.test.ts`
5. Run `npm run typecheck && npm test`

### Updating types
1. All types are now generated from `openapi.yaml`
2. Run `npm run generate` to update types after OpenAPI spec changes
3. The client.ts file uses the generated types directly

### Publishing (Internal Use)
See `PUBLISHING.md` for detailed publishing instructions.

## Browser Compatibility

The SDK works in both Node.js and browsers:
- Uses `fetch-wrapper.ts` for cross-platform HTTP
- No Node.js-specific dependencies in runtime code
- Works with React and other frontend frameworks

## Important Notes

- The main class is named `Saturation` (not SaturationClient)
- The SDK uses ES modules with `.js` extensions in imports
- Both CommonJS and ESM builds are provided
- The SDK is designed to be tree-shakeable