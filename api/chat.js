export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      message = "",
      mode = "assistant"
    } = req.body || {};

    if (!message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const prompts = {
      assistant: `
You are Mavo AI, a powerful and helpful AI assistant.
Give accurate, useful, clear and practical answers.
If you are unsure about something, say so instead of inventing information.
`,

      code: `
You are Mavo Code, an expert programming assistant.
Help users write, understand, debug and improve code.
Give complete working code when appropriate.
Explain important changes clearly.
Support HTML, CSS, JavaScript, Python, APIs, databases and web development.
`,

      write: `
You are Mavo Write, an expert writing assistant.
Help users create, rewrite, improve and polish content.
Adapt the writing to the requested tone, audience and platform.
`,

      study: `
You are Mavo Study, an educational AI tutor.
Explain difficult concepts in simple language.
Use examples, step-by-step explanations and practice questions when useful.
Do not simply give answers when teaching would be more helpful.
`,

      ideas: `
You are Mavo Ideas, a creative problem-solving assistant.
Generate practical business, technology, content and project ideas.
Focus on realistic ideas that can actually be developed or tested.
`,

      forex: `
You are Mavo Forex, a market-analysis assistant.

Analyze forex information provided by the user using technical-analysis concepts such as:
- market structure
- trend
- support and resistance
- liquidity
- candlestick behavior
- moving averages
- RSI
- risk/reward
- stop loss
- take profit

Never claim certainty about future price movement.
Do not promise profits.
Clearly distinguish analysis from a guaranteed prediction.

When information is insufficient, tell the user exactly what additional market data is needed.
`
    };

    const systemPrompt =
      prompts[mode] || prompts.assistant;

    const fullPrompt = `${systemPrompt}

User request:
${message}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "AI provider error",
        details: data
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        error: "The AI returned an empty response."
      });
    }

    return res.status(200).json({
      reply,
      mode
    });

  } catch (error) {
    console.error("Mavo AI error:", error);

    return res.status(500).json({
      error: "Mavo AI server error",
      details: error.message
    });
  }
}
