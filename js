import React, { useState, useEffect } from "react";
import axios from "axios";

const FINNHUB_API_KEY = "d3aksk1r01qrtc0ckpa0d3aksk1r01qrtc0ckpag";
const LOGIN_PASSWORD = "vse2k25@svv"; // Change your password here

// Default stocks: You can change symbols & display names here
const defaultStocks = [
  { symbol: "AAPL", displayName: "models department" },
  { symbol: "GOOGL", displayName: "tech department" },
  { symbol: "AMZN", displayName: "food department" },
  { symbol: "TSLA", displayName: "seminar department" },
  { symbol: "NVDA", displayName: "organising department" },
  { symbol: "AMD", displayName: "stalls department" },
  { symbol: "INTC", displayName: "games department" }, // added Intel, below 500$
  { symbol: "CSCO", displayName: "finance department" }, // added Cisco
  { symbol: "NFLX", displayName: "photography department" } // added Netflix
];

export default function App() {
  // --- States ---
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [stocks, setStocks] = useState(defaultStocks);
  const [stockData, setStockData] = useState({});
  const [bgColor, setBgColor] = useState("#f0f2f5");
  const [adminView, setAdminView] = useState(false);
  const [dematAccounts, setDematAccounts] = useState(() => {
    const saved = localStorage.getItem("dematAccounts");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Login Handler ---
  const handleLogin = () => {
    if (password === LOGIN_PASSWORD) {
      setLoggedIn(true);
    } else {
      alert("Incorrect password. Try again.");
    }
  };

  // --- Fetch stock data from Finnhub ---
  useEffect(() => {
    if (!loggedIn) return;

    const fetchStockData = async () => {
      try {
        const data = {};
        for (let stock of stocks) {
          const res = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`
          );
          data[stock.symbol] = res.data;
        }
        setStockData(data);
      } catch (err) {
        console.error("Error fetching stock data:", err);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 60 * 1000); // refresh every 60 seconds

    return () => clearInterval(interval);
  }, [loggedIn, stocks]);

  // --- Background color change ---
  const handleBgChange = (e) => setBgColor(e.target.value);

  // --- Add Demat Account ---
  const addDematAccount = (name, password) => {
    const newAccount = { id: Date.now(), name, password };
    const updated = [...dematAccounts, newAccount];
    setDematAccounts(updated);
    localStorage.setItem("dematAccounts", JSON.stringify(updated));
  };

  // --- JSX: Login Screen ---
  if (!loggedIn) {
    return (
      <div style={styles.loginContainer}>
        <h2>Welcome to V.S.E</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>
      </div>
    );
  }

  // --- JSX: Main App ---
  return (
    <div style={{ ...styles.appContainer, backgroundColor: bgColor }}>
      <header style={styles.header}>
        <h1 style={{ fontWeight: "900", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
          V.S.E — Virtual Stock Exchange
        </h1>
        <button
          onClick={() => setAdminView(!adminView)}
          style={styles.adminToggleButton}
        >
          {adminView ? "Hide Admin Panel" : "Show Admin Panel"}
        </button>
      </header>

      <div style={styles.bgColorPicker}>
        <label htmlFor="bgColor" style={{ marginRight: 8 }}>
          Background Color:
        </label>
        <input
          id="bgColor"
          type="color"
          value={bgColor}
          onChange={handleBgChange}
        />
      </div>

      {!adminView ? (
        <>
          <section>
            <h2 style={{ marginTop: 20 }}>Stock Market</h2>
            <div style={styles.stockGrid}>
              {stocks.map(({ symbol, displayName }) => {
                const data = stockData[symbol];
                return (
                  <div key={symbol} style={styles.stockCard}>
                    <h3>{displayName} <span style={{ color: "#888" }}>({symbol})</span></h3>
                    {data ? (
                      <>
                        <p><b>Current Price:</b> ${data.c.toFixed(2)}</p>
                        <p><b>High:</b> ${data.h.toFixed(2)}</p>
                        <p><b>Low:</b> ${data.l.toFixed(2)}</p>
                        <p><b>Open:</b> ${data.o.toFixed(2)}</p>
                        <p><b>Previous Close:</b> ${data.pc.toFixed(2)}</p>
                      </>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ marginTop: 40 }}>
            <h2>Open Demat Account</h2>
            <DematAccountForm addAccount={addDematAccount} />
          </section>
        </>
      ) : (
        <AdminPanel accounts={dematAccounts} />
      )}

      <footer style={styles.footer}>
        <p>© 2025 V.S.E - Virtual Stock Exchange</p>
      </footer>
    </div>
  );
}

// --- Demat Account Form ---
function DematAccountForm({ addAccount }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      alert("Please enter both name and password.");
      return;
    }
    addAccount(name.trim(), password.trim());
    setName("");
    setPassword("");
    alert("Demat account created successfully!");
  };

  return (
    <form onSubmit={handleSubmit} style={styles.dematForm}>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Set Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        Create Account
      </button>
    </form>
  );
}

// --- Admin Panel ---
function AdminPanel({ accounts }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h2>Admin Panel - Demat Accounts</h2>
      {accounts.length === 0 ? (
        <p>No demat accounts registered yet.</p>
      ) : (
        <table style={styles.adminTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(({ id, name, password }) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{name}</td>
                <td>{password}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --- Styles ---
const styles = {
  appContainer: {
    minHeight: "100vh",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#222"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  adminToggleButton: {
    padding: "8px 16px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold"
  },
  bgColorPicker: {
    marginTop: 15,
    marginBottom: 15
  },
  stockGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
    gap: 20
  },
  stockCard: {
    backgroundColor: "white",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: 15,
    textAlign: "center"
  },
  dematForm: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    maxWidth: 400
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    minWidth: 0
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  },
  adminTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#666"
  },
  loginContainer: {
    height: "100vh
