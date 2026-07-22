export default async function handler(req, res) {
  const { message } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      reply: "GEMINI_API_KEY is missing in Vercel",
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Mavo AI, a helpful, friendly, and intelligent personal AI assistant. Always give clear, useful, and conversational answers.\n\nUser: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({
        reply: JSON.stringify(data),
      });
    }

    res.status(200).json({
      reply: data.candidates[0].content.parts[0].text,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: error.message,
    });
  }
}
