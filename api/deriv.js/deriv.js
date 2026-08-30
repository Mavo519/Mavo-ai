export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  const symbol = req.query.symbol || "frxEURUSD";

  try {
    // Deriv public WebSocket endpoint
    const wsUrl =
      "wss://ws.derivws.com/websockets/v3?app_id=1089";

    // This endpoint is designed for the browser to connect directly.
    // The server returns the connection information to Mavo.
    return res.status(200).json({
      success: true,
      provider: "Deriv",
      symbol,
      websocket: wsUrl,
      request: {
        ticks: symbol,
        subscribe: 1
      },
      message: "Mavo Forex live-market connection is ready."
    });
  } catch (error) {
    console.error("Deriv connection error:", error);

    return res.status(500).json({
      success: false,
      error: "Mavo Deriv connection error",
      details: error.message
    });
  }
}
