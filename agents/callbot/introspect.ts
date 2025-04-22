/**
 * Introspect – returns agent meta for discovery (ADK §4.2)
 */
export default function introspect() {
  return {
    name: 'callbot',
    description: 'Phone-based RMA handler: dials vendor, navigates IVR, captures RMA numbers.',
    capabilities: ['dial', 'navigate_ivr', 'capture_rma', 'log'],
    schema: '/public/agents-meta/callbot.schema.json'
  };
}
