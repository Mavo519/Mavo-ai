export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      pair = "EUR/USD",
      timeframe = "1H",
      price = "",
      analysis = ""
    } = req.body || {};

    const prompt = `
You are Mavo Forex, a professional forex market-analysis assistant.

Analyze the information provided by the user.

Currency pair: ${pair}
Timeframe: ${timeframe}
Current price: ${price}
Additional market information: ${analysis}

Provide:
1. Market bias: Bullish, Bearish, or Neutral
2. Market structure
3. Important support/resistance
4. Possible entry area
5. Stop-loss area
6. Take-profit levels
7. Risk-to-reward ratio
8. What would invalidate the setup
9. Additional data needed if the information is insufficient

IMPORTANT:
- This is analysis, not a guaranteed prediction.
- Never promise profit.
- Do not claim certainty about future price movement.
- If there is not enough market data, clearly say what is missing.
- Encourage appropriate risk management.

Return the analysis in clear, easy-to-read sections.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
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
                  text: prompt
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
        error: "Empty AI response"
      });
    }

    return res.status(200).json({
      success: true,
      reply
    });

  } catch (error) {
    console.error("Forex error:", error);

    return res.status(500).json({
      error: "Mavo Forex server error",
      details: error.message
    });
  }
}
