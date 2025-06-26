import React, { useState, useEffect } from "react";

const CryptoSearch = () => {
  const [symbol, setSymbol] = useState("btcusdt"); // Default symbol
  const [price, setPrice] = useState(null);
  const [currency, setCurrency] = useState("usd"); // This is for UI consistency, Binance provides USD pairs.
  const [error, setError] = useState(null);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.p) {
        setPrice(parseFloat(data.p).toFixed(2));
        setError(null);
      }
    };

    ws.onerror = (err) => {
      setError("Error connecting to WebSocket. Please try again.");
    };

    ws.onclose = () => {
      console.log("WebSocket closed. Reconnecting...");
    };

    // Cleanup WebSocket on component unmount or when symbol changes
    return () => {
      ws.close();
    };
  }, [symbol]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symbol.trim()) {
      setError("Please enter a valid symbol.");
      return;
    }
    setError(null); // Reset error state
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", textAlign: "center", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Real-Time Crypto Price</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter symbol (e.g., btcusdt)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toLowerCase())}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Fetch Real-Time Price
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {price && (
        <div style={{ marginTop: "20px", textAlign: "left", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <p><strong>Symbol:</strong> {symbol.toUpperCase()}</p>
          <p><strong>Price ({currency.toUpperCase()}):</strong> {price}</p>
        </div>
      )}
    </div>
  );
};

export default CryptoSearch;
