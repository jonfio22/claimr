import type { NextApiRequest, NextApiResponse } from 'next';
import { VoiceResponse } from 'twilio/lib/twiml/VoiceResponse';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  const twiml = new VoiceResponse();
  const gather = twiml.gather({
    numDigits: 8,
    input: 'speech dtmf',
    action: '/api/twilio/collect',
    method: 'POST',
    timeout: 8
  });
  gather.say('Please enter or speak your R M A number, followed by the pound sign.');
  twiml.say('We did not receive any input. Goodbye.');
  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml.toString());
}
