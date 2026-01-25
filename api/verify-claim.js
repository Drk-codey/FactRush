export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { claim, category } = await req.json();

    if (!claim) {
      return new Response(JSON.stringify({ error: 'Claim is required' }), { status: 400 });
    }

    // TODO: Integrate GenLayer logic here or Call Claude API

    // MOCK DELAY & RESPONSE
    await new Promise(resolve => setTimeout(resolve, 1500));

    const verdicts = ['VERIFIED', 'FALSE', 'UNCERTAIN'];
    const selectedVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];

    const mockResponse = {
      verdict: selectedVerdict,
      confidence: Math.floor(Math.random() * 20) + 75,
      reasoning: `Analysis of claim '${claim.substring(0, 20)}...' suggests ${selectedVerdict === 'VERIFIED' ? 'strong consensus' : 'contradicting evidence'} from primary sources.`,
      sources: ['reuters.com', 'wikipedia.org', 'nature.com']
    };

    return new Response(JSON.stringify(mockResponse), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
