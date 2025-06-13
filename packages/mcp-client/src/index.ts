#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AuthenticatedHttpClient } from "./auth/AuthenticatedHttpClient.js";
import { SecurityConfig } from "./config/SecurityConfig.js";
import { logger } from "./utils/logger.js";

/**
 * NeuralLog MCP Client
 *
 * This client implements the Model Context Protocol (MCP) for the NeuralLog system.
 * It provides secure, authenticated tools for retrieving and searching logs.
 */

// Load and validate configuration
let config: SecurityConfig;
let httpClient: AuthenticatedHttpClient;

try {
  config = SecurityConfig.getInstance();
  logger.info('MCP Client starting with configuration:', config.getLoggableConfig());

  httpClient = new AuthenticatedHttpClient(
    {
      authServiceUrl: config.getAuthServiceUrl(),
      clientId: config.getClientId(),
      clientSecret: config.getClientSecret(),
      tenantId: config.getTenantId()
    },
    config.getWebServerUrl()
  );

  logger.info('Authenticated HTTP client initialized');
} catch (error) {
  logger.error('Failed to initialize MCP client:', error);
  process.exit(1);
}

// Create an MCP server
const server = new McpServer({
  name: "NeuralLog-MCP-Client",
  version: "1.0.0"
});

// Add get_logs tool
server.tool(
  "get_logs",
  { limit: z.number().optional().describe("Maximum number of log names to return (default: 1000)") },
  async (args) => {
    try {
      logger.debug('Getting logs with limit:', args.limit);

      // Use authenticated HTTP client
      const response = await httpClient.get('/logs', {
        params: { limit: args.limit || 1000 }
      });

      logger.debug('Successfully retrieved logs');
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      logger.error('Error getting logs:', error.message);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error getting logs: ${error.message || String(error)}`,
            tenant: httpClient.getTenantId()
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add get_log_by_name tool
server.tool(
  "get_log_by_name",
  {
    log_name: z.string().describe("Name of the log to retrieve"),
    limit: z.number().optional().describe("Maximum number of log entries to return (default: 100)")
  },
  async (args) => {
    try {
      logger.debug('Getting log:', args.log_name);

      // Use authenticated HTTP client
      const response = await httpClient.get(`/logs/${args.log_name}`, {
        params: { limit: args.limit || 100 }
      });

      logger.debug('Successfully retrieved log:', args.log_name);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      logger.error('Error getting log:', args.log_name, error.message);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error getting log '${args.log_name}': ${error.message || String(error)}`,
            tenant: httpClient.getTenantId()
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add search tool
server.tool(
  "search",
  {
    query: z.string().optional().describe("Text to search for across all logs"),
    log_name: z.string().optional().describe("Specific log to search (if omitted, searches all logs)"),
    start_time: z.string().optional().describe("Filter entries after this timestamp (ISO format)"),
    end_time: z.string().optional().describe("Filter entries before this timestamp (ISO format)"),
    field_filters: z.record(z.any()).optional().describe("Filter by specific field values, e.g. {\"level\": \"error\"}"),
    limit: z.number().optional().describe("Maximum number of entries to return (default: 100)")
  },
  async (args) => {
    try {
      // Prepare search parameters
      const params: Record<string, any> = {};

      // Add basic search parameters
      if (args.query) params.query = args.query;
      if (args.log_name) params.log_name = args.log_name;
      if (args.limit) params.limit = args.limit;
      if (args.start_time) params.start_time = args.start_time;
      if (args.end_time) params.end_time = args.end_time;

      // Add field filters with field_ prefix
      if (args.field_filters) {
        for (const [field, value] of Object.entries(args.field_filters)) {
          params[`field_${field}`] = value;
        }
      }

      logger.debug('Searching logs with params:', params);

      // Use authenticated HTTP client
      const response = await httpClient.get('/search', { params });

      logger.debug('Successfully searched logs');
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      logger.error('Error searching logs:', error.message);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error searching logs: ${error.message || String(error)}`,
            tenant: httpClient.getTenantId()
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add append_to_log tool
server.tool(
  "append_to_log",
  {
    log_name: z.string().describe("Name of the log to append to"),
    data: z.any().describe("Data to append to the log")
  },
  async (args) => {
    try {
      logger.debug('Appending to log:', args.log_name);

      // Use authenticated HTTP client
      const response = await httpClient.post(`/logs/${args.log_name}`, args.data);

      logger.debug('Successfully appended to log:', args.log_name);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      logger.error('Error appending to log:', args.log_name, error.message);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error appending to log '${args.log_name}': ${error.message || String(error)}`,
            tenant: httpClient.getTenantId()
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add clear_log tool
server.tool(
  "clear_log",
  {
    log_name: z.string().describe("Name of the log to clear")
  },
  async (args) => {
    try {
      logger.debug('Clearing log:', args.log_name);

      // Use authenticated HTTP client
      const response = await httpClient.delete(`/logs/${args.log_name}`);

      logger.debug('Successfully cleared log:', args.log_name);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      logger.error('Error clearing log:', args.log_name, error.message);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error clearing log '${args.log_name}': ${error.message || String(error)}`,
            tenant: httpClient.getTenantId()
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add graceful shutdown handling
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Start the server
try {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('MCP server started successfully');
} catch (error) {
  logger.error('Failed to start MCP server:', error);
  process.exit(1);
}
