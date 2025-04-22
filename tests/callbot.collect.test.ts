import handler from '../pages/api/twilio/collect';
import { createMocks } from 'node-mocks-http';

jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockResolvedValue({ data: null, error: null })
  }
}));

test('collect stores RMA', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { CallSid: 'CA123', Digits: 'RMA12345' }
  });
  await handler(req, res);
  expect(res._getStatusCode()).toBe(200);
});
