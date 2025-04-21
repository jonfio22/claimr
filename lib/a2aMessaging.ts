/**
 * a2aMessaging.ts
 * Utility for Agent-to-Agent (A2A) communication protocol
 * 
 * Dependencies:
 * - fetch API for HTTP requests
 * - Environment variables for A2A host configuration
 */

export interface A2AMessage {
  sender: string;
  recipient: string;
  message_type: 'request' | 'response' | 'error' | 'notification';
  payload: Record<string, any>;
  timestamp: string;
  trace_id: string;
  metadata?: Record<string, any>;
}

/**
 * Sends a message to another agent using the A2A protocol
 */
export async function sendA2AMessage(message: A2AMessage): Promise<A2AMessage> {
  const a2aHost = process.env.A2A_HOST;
  
  if (!a2aHost) {
    throw new Error('A2A_HOST environment variable is not set');
  }

  try {
    const url = `${a2aHost}/api/agents/${message.recipient}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`A2A message failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending A2A message:', error);
    throw error;
  }
}

/**
 * Creates a new A2A message with proper format
 */
export function createA2AMessage(
  sender: string,
  recipient: string,
  messageType: A2AMessage['message_type'],
  payload: Record<string, any>,
  traceId: string,
  metadata?: Record<string, any>
): A2AMessage {
  return {
    sender,
    recipient,
    message_type: messageType,
    payload,
    timestamp: new Date().toISOString(),
    trace_id: traceId,
    metadata,
  };
}
