/**
 * TraceRoute Agent: Introspection endpoint
 * 
 * Provides metadata about the agent for discovery and health checking
 * Compliant with Google's ADK standards
 * 
 * Dependencies:
 * - agent.json configuration
 */

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the agent configuration from agent.json
    const agentConfigPath = path.join(process.cwd(), 'agents/traceroute/agent.json');
    const agentConfig = JSON.parse(fs.readFileSync(agentConfigPath, 'utf-8'));

    // Return the agent metadata
    return res.status(200).json({
      status: 'healthy',
      lastUpdated: new Date().toISOString(),
      version: agentConfig.version,
      capabilities: agentConfig.capabilities,
      tools: agentConfig.tools,
      dependencies: agentConfig.dependencies,
    });
  } catch (error) {
    console.error('Error in TraceRoute introspection:', error);
    return res.status(500).json({ error: 'Failed to retrieve agent metadata' });
  }
}
