#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import type { OpenAPIV3 } from 'openapi-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GeneratedMethod {
  name: string;
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters: Array<{
    name: string;
    in: string;
    required: boolean;
    type: string;
    description?: string;
  }>;
  requestBody?: {
    type: string;
    required: boolean;
  };
  response?: string;
}

async function loadOpenAPISpec(): Promise<OpenAPIV3.Document> {
  const specPath = path.join(__dirname, '../../saturation/apps/api-server/api/openapi.yaml');
  const content = await fs.readFile(specPath, 'utf-8');
  return yaml.load(content) as OpenAPIV3.Document;
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function generateTypeFromSchema(schema: any, name: string): string {
  if (!schema) return 'unknown';

  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return refName;
  }

  if (schema.type === 'array') {
    const itemType = generateTypeFromSchema(schema.items, `${name}Item`);
    return `${itemType}[]`;
  }

  if (schema.type === 'object') {
    if (!schema.properties) return 'Record<string, unknown>';
    
    const properties = Object.entries(schema.properties)
      .map(([key, prop]: [string, any]) => {
        const isRequired = schema.required?.includes(key) ?? false;
        const nullable = prop.nullable ? ' | null' : '';
        const optional = !isRequired && !nullable ? '?' : '';
        const propType = generateTypeFromSchema(prop, toPascalCase(key));
        return `  ${key}${optional}: ${propType}${nullable};`;
      })
      .join('\n');

    return `{\n${properties}\n}`;
  }

  if (schema.enum) {
    return schema.enum.map((v: any) => `'${v}'`).join(' | ');
  }

  if (schema.oneOf) {
    return schema.oneOf.map((s: any) => generateTypeFromSchema(s, name)).join(' | ');
  }

  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'number',
    boolean: 'boolean',
  };

  return typeMap[schema.type] || 'unknown';
}

function generateInterfaces(spec: OpenAPIV3.Document): string {
  const schemas = (spec.components?.schemas || {}) as Record<string, OpenAPIV3.SchemaObject>;
  
  const interfaces = Object.entries(schemas)
    .map(([name, schema]) => {
      const interfaceBody = generateTypeFromSchema(schema, name);
      
      if (interfaceBody.startsWith('{')) {
        return `export interface ${name} ${interfaceBody}`;
      } else {
        return `export type ${name} = ${interfaceBody};`;
      }
    })
    .join('\n\n');

  return interfaces;
}

function extractMethods(spec: OpenAPIV3.Document): GeneratedMethod[] {
  const methods: GeneratedMethod[] = [];
  
  for (const [pathStr, pathItem] of Object.entries(spec.paths || {})) {
    for (const [httpMethod, operation] of Object.entries(pathItem as OpenAPIV3.PathItemObject)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(httpMethod)) continue;
      
      const op = operation as OpenAPIV3.OperationObject;
      if (!op.operationId) continue;

      const parameters = (op.parameters || []).map((param: any) => ({
        name: param.name,
        in: param.in,
        required: param.required || false,
        type: param.schema ? generateTypeFromSchema(param.schema, toPascalCase(param.name)) : 'string',
        description: param.description,
      }));

      let requestBody;
      if (op.requestBody) {
        const rb = op.requestBody as OpenAPIV3.RequestBodyObject;
        const content = rb.content?.['application/json'];
        if (content?.schema) {
          requestBody = {
            type: generateTypeFromSchema(content.schema, `${toPascalCase(op.operationId)}Request`),
            required: rb.required || false,
          };
        }
      }

      let response;
      const successResponse = op.responses?.['200'] || op.responses?.['201'];
      if (successResponse && 'content' in successResponse) {
        const content = successResponse.content?.['application/json'];
        if (content?.schema) {
          response = generateTypeFromSchema(content.schema, `${toPascalCase(op.operationId)}Response`);
        }
      }

      methods.push({
        name: op.operationId,
        path: pathStr,
        method: httpMethod,
        summary: op.summary,
        description: op.description,
        parameters,
        requestBody,
        response,
      });
    }
  }

  return methods;
}

async function generateSDK() {
  console.log('Loading OpenAPI specification...');
  const spec = await loadOpenAPISpec();
  
  console.log('Generating TypeScript interfaces...');
  const interfaces = generateInterfaces(spec);
  
  console.log('Extracting API methods...');
  const methods = extractMethods(spec);
  
  // Generate types file
  const typesContent = `// Generated from OpenAPI specification
// Do not edit manually

${interfaces}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ExpandParams {
  expands?: string[];
}
`;

  await fs.mkdir(path.join(__dirname, '../src/types'), { recursive: true });
  await fs.writeFile(path.join(__dirname, '../src/types/index.ts'), typesContent);
  
  // Generate API methods
  const methodsContent = methods.map((method) => {
    const pathParams = method.parameters.filter((p) => p.in === 'path');
    const queryParams = method.parameters.filter((p) => p.in === 'query');
    
    const paramsList: string[] = [];
    
    // Add path parameters
    pathParams.forEach((p) => {
      paramsList.push(`${p.name}: ${p.type}`);
    });
    
    // Add query parameters as optional object
    if (queryParams.length > 0) {
      const queryInterface = `{
${queryParams.map((p) => `    ${p.name}${p.required ? '' : '?'}: ${p.type};`).join('\n')}
  }`;
      paramsList.push(`params?: ${queryInterface}`);
    }
    
    // Add request body
    if (method.requestBody) {
      paramsList.push(`data${method.requestBody.required ? '' : '?'}: ${method.requestBody.type}`);
    }
    
    const methodSignature = `async ${method.name}(${paramsList.join(', ')})`;
    const returnType = method.response || 'unknown';
    
    return `  /**
   * ${method.summary || method.name}
   ${method.description ? `* ${method.description}` : ''}
   */
  ${methodSignature}: Promise<${returnType}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }`;
  }).join('\n\n');
  
  const apiClassContent = `// Generated API methods
// Do not edit manually

import type * as Types from './types/index.js';

export class GeneratedAPI {
${methodsContent}
}
`;
  
  await fs.writeFile(path.join(__dirname, '../src/generated-api.ts'), apiClassContent);
  
  console.log('✅ TypeScript interfaces and API methods generated successfully!');
  console.log(`  - Generated ${Object.keys(spec.components?.schemas || {}).length} type definitions`);
  console.log(`  - Generated ${methods.length} API methods`);
}

generateSDK().catch(console.error);