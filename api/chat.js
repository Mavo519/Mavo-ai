export default async function handler(req, res) {
  const { message } = req.body;

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
                text: `You are Mavo AI, a helpful assistant.\n\nUser: ${message}`
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return res.status(500).json({
      reply: JSON.stringify(data)
    });
  }

  return res.status(200).json({
    reply: data.candidates[0].content.parts[0].text
  });
}
