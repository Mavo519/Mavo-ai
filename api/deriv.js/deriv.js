export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  const symbol = req.query.symbol || "frxEURUSD";

  const allowedSymbols = [
    "frxEURUSD",
    "frxGBPUSD",
    "frxUSDJPY",
    "frxAUDUSD",
    "frxUSDCAD",
    "frxUSDCHF",
    "frxNZDUSD"
  ];

  if (!allowedSymbols.includes(symbol)) {
    return res.status(400).json({
      success: false,
      error: "Unsupported symbol"
    });
  }

  try {
    const wsUrl =
      "wss://ws.derivws.com/websockets/v3?app_id=1089";

    const ws = new WebSocket(wsUrl);

    const tick = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        try {
          ws.close();
        } catch {}

        reject(new Error("Deriv connection timed out"));
      }, 10000);

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            ticks: symbol,
            subscribe: 0,
            req_id: 1
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            clearTimeout(timeout);

            try {
              ws.close();
            } catch {}

            reject(
              new Error(
                data.error.message || "Deriv API error"
              )
            );

            return;
          }

          if (data.msg_type === "tick" && data.tick) {
            clearTimeout(timeout);

            const result = {
              symbol: data.tick.symbol || symbol,
              quote: data.tick.quote,
              bid: data.tick.bid ?? null,
              ask: data.tick.ask ?? null,
              epoch: data.tick.epoch,
              pip_size: data.tick.pip_size ?? null
            };

            try {
              ws.close();
            } catch {}

            resolve(result);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Unable to connect to Deriv"));
      };
    });

    return res.status(200).json({
      success: true,
      provider: "Deriv",
      market: "Forex",
      symbol,
      data: tick,
      message: "Mavo AI live-market connection is ready."
    });

  } catch (error) {
    console.error("Deriv connection error:", error);

    return res.status(500).json({
      success: false,
      error: "Mavo Deriv connection error",
      details: error.message || "Failed to get Deriv market data"
    });
  }
}
