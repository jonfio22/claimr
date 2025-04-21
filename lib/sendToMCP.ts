/**
 * sendToMCP.ts
 * Utility for sending messages to Anthropic's Model Context Protocol (MCP)
 * 
 * Dependencies:
 * - Google Vertex AI
 * - Environment variables for API configuration
 */

import { VertexAI } from '@google-cloud/vertexai';

// Types for MCP protocol
export interface MCPRequest {
  messages: MCPMessage[];
  context?: Record<string, any>;
  tools?: MCPTool[];
}

export interface MCPMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MCPTool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  output_schema?: Record<string, any>;
}

export interface MCPResponse {
  message: MCPMessage;
  tool_calls?: MCPToolCall[];
  context_updates?: Record<string, any>;
}

export interface MCPToolCall {
  tool: string;
  input: Record<string, any>;
}

// Initialize Vertex AI with the project and location
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || '',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

// The name of the model deployed on Vertex AI
const MODEL_NAME = 'claude-3-sonnet@20240229';

/**
 * Sends a request to the MCP protocol via Vertex AI
 */
export async function sendToMCP(request: MCPRequest): Promise<MCPResponse> {
  try {
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: MODEL_NAME,
      generation_config: {
        temperature: 0.2,
        max_output_tokens: 8192,
      },
    });

    // Format request for Vertex AI
    const vertexResponse = await generativeModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: JSON.stringify(request) }],
        },
      ],
    });

    // Parse the response
    const responseText = vertexResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('Empty response from MCP');
    }

    return JSON.parse(responseText) as MCPResponse;
  } catch (error) {
    console.error('Error sending to MCP:', error);
    throw error;
  }
}
