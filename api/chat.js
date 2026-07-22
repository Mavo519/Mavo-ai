export default async function handler(req, res) {
  const { message } = req.body;

  // Check if the API key exists
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      reply: "OPENAI_API_KEY is missing in Vercel",
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are Mavo AI, a helpful personal AI assistant.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({
        reply: JSON.stringify(data),
      });
    }

    res.status(200).json({
      reply: data.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: error.message,
    });
  }
}
