export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const symbol = req.query.symbol || "frxEURUSD";

    const response = await fetch(
      "https://ws.derivws.com/websockets/v3?app_id=1089"
    );

    if (!response.ok) {
      throw new Error("Unable to connect to Deriv");
    }

    const data = await response.text();

    return res.status(200).json({
      success: true,
      message: "Deriv connection endpoint is ready",
      symbol,
      deriv: data
    });

  } catch (error) {
    console.error("Deriv error:", error);

    return res.status(500).json({
      success: false,
      error: "Mavo Deriv connection error",
      details: error.message
    });
  }
}
