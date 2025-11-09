# Implementation Notes

## Architecture Decisions

1. **Single Project Per Instance**: Each MCP server instance connects to one Langfuse project via environment variables
2. **Metrics API First**: Use Langfuse Metrics API for all aggregations to avoid manual processing
3. **Typed Wrappers**: All Langfuse API calls go through typed wrapper functions for maintainability
4. **Error Handling**: All tools catch and format errors appropriately for MCP clients

## Known Limitations

1. **Langfuse SDK API**: The `langfuse` npm package may not expose all internal API methods. If `client.fetch()` is not available, we'll need to implement direct HTTP calls with Basic Auth.

2. **Metrics API Response Format**: The exact response format from the Metrics API may need adjustment based on actual API responses.

3. **Tag Parsing**: Service extraction from tags assumes format `service:name`. Adjust based on your actual tag convention.

## Next Steps

1. Test with actual Langfuse API to verify response formats
2. Add integration tests
3. Implement caching for frequently accessed data
4. Add support for date range presets (last 7 days, last 30 days, etc.)
5. Consider adding export functionality for reports

## Testing Checklist

- [ ] Install dependencies: `npm install`
- [ ] Build TypeScript: `npm run build`
- [ ] Set environment variables in `.env` file
- [ ] Test with MCP Inspector: `npm run inspector`
- [ ] Verify each tool returns expected data:
  - [ ] `list_projects` returns project array
  - [ ] `project_overview` returns cost/token/trace summary
  - [ ] `usage_by_model` returns model breakdown
  - [ ] `usage_by_service` returns service breakdown (requires proper tags)
  - [ ] `top_expensive_traces` returns trace list
  - [ ] `get_trace_detail` returns trace with observations
- [ ] Test error handling with invalid inputs
- [ ] Test with Claude Desktop integration
- [ ] Document any API response format adjustments needed

## API Implementation Details

### Authentication
- Uses Basic Auth with `publicKey:secretKey` encoded in base64
- All API calls include `Authorization: Basic <encoded-credentials>` header

### Metrics API Format
The Langfuse Metrics API expects POST requests to `/api/public/metrics` with:
```json
{
  "view": "traces" | "observations",
  "metrics": [{"measure": "totalCost", "aggregation": "sum"}],
  "dimensions": [{"field": "environment"}],
  "filters": [],
  "fromTimestamp": "ISO-8601",
  "toTimestamp": "ISO-8601",
  "timeDimension": {"granularity": "day"}
}
```

### Response Processing
- All tools handle missing or null response data gracefully
- Arrays are sorted by cost (descending) where appropriate
- Limited results prevent overwhelming responses
- Service extraction relies on tag format: `service:serviceName`

## Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are set
2. **Base URL**: Verify `LANGFUSE_BASEURL` matches your Langfuse instance
3. **API Permissions**: Ensure your API keys have read access to metrics and traces
4. **Date Formats**: Use ISO 8601 format for all timestamps (e.g., `2024-01-01T00:00:00.000Z`)

### Debug Steps
1. Check environment variable loading in `src/config.ts`
2. Verify API responses in browser dev tools or with curl
3. Test individual tools with known data
4. Check Langfuse UI for expected data before querying via API

## Performance Considerations

1. **Rate Limiting**: Langfuse may have API rate limits - consider adding retry logic
2. **Large Datasets**: For projects with millions of traces, consider pagination
3. **Caching**: Frequent queries could benefit from response caching
4. **Concurrent Requests**: Multiple tool calls may happen simultaneously

## Security Notes (Enhanced in v1.4.2)

### Credential Protection
- API keys are kept server-side only
- Environment variables should never be logged or exposed to clients
- Basic Auth credentials are computed fresh for each request
- No persistent storage of sensitive data

### Built-in Security Features (New)

#### HTTPS Enforcement
- **Automatic validation** ensures `LANGFUSE_BASEURL` uses HTTPS protocol
- **Runtime rejection** of HTTP URLs prevents plaintext credential transmission
- **Error location**: `src/config.ts` - `getProjectConfig()` function
- **Protection against**: Man-in-the-middle attacks and credential interception

#### URL Sanitization
- **Automatic redaction** of sensitive query parameters in error logs
- **Smart filtering** preserves debugging info while removing secrets
- **Implementation**: `sanitizeUrlForLogging()` method in `src/langfuse-client.ts`
- **Protection against**: Information disclosure through log files

#### Pre-commit Security Hooks
- **Automated scanning** for Langfuse API key patterns (`pk-lf-*`, `sk-lf-*`)
- **General credential detection** for common secret patterns
- **Build validation** ensures TypeScript compilation before commits
- **Location**: `.husky/pre-commit` script
- **Protection against**: Accidental credential commits to version control

### Security Implementation Details
```typescript
// HTTPS validation in src/config.ts
if (!baseUrl.startsWith('https://')) {
  throw new Error(`Security Error: LANGFUSE_BASEURL must use HTTPS protocol to protect credentials.`);
}

// URL sanitization in src/langfuse-client.ts
private sanitizeUrlForLogging(url: string): string {
  const allowedParams = ['limit', 'page', 'view', 'orderBy', 'orderDirection'];
  // Redacts sensitive parameters while preserving debugging information
}
```

### Security Best Practices
1. **Never commit real credentials** - use placeholder values in code
2. **Use .env files** for local development (already in `.gitignore`)
3. **Rotate API keys regularly** in production environments
4. **Enable pre-commit hooks** with `npx husky install`