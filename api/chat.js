export default async function handler(req, res) {
  const { message } = req.body;

  try {
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
                  text: `You are Mavo AI, a helpful personal AI assistant.\n\nUser: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.status(200).json({
      reply: data.candidates[0].content.parts[0].text
    });

  } catch (error) {
    res.status(500).json({
      reply: "Sorry, I had a problem connecting."
    });
  }
}
