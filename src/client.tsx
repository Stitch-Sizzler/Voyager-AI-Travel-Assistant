import "./styles.css";
import { createRoot } from "react-dom/client";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";

function Chat() {
  const agent = useAgent({ agent: "TravelAgent" });

  const { messages, sendMessage, clearHistory, status } = useAgentChat({
    agent
  });

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "2rem",
        fontFamily: "system-ui",
        background: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}
    >
      <h2>Cloudflare AI Travel Agent</h2>
      <p style={{ color: "#555" }}>
        Ask me for the weather or the best attraction in any city.
      </p>

      <div
        style={{
          border: "1px solid #ddd",
          background: "white",
          padding: "1rem",
          height: "400px",
          overflowY: "auto",
          marginBottom: "1rem",
          borderRadius: "8px"
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "1rem",
              textAlign: msg.role === "user" ? "right" : "left"
            }}
          >
            <div
              style={{ fontSize: "0.8rem", color: "#888", marginBottom: "4px" }}
            >
              {msg.role === "user" ? "You" : "Travel Agent"}
            </div>
            <div
              style={{
                background: msg.role === "user" ? "#f48120" : "#f1f1f1",
                color: msg.role === "user" ? "white" : "black",
                padding: "10px 14px",
                borderRadius: "8px",
                display: "inline-block",
                textAlign: "left"
              }}
            >
              {msg.parts.map((part, i) => {
                if (part.type === "text")
                  return <span key={i}>{part.text}</span>;
                return null;
              })}
            </div>
          </div>
        ))}
        {status === "streaming" && (
          <div style={{ color: "#888", fontSize: "0.9rem" }}>
            <em>Agent is checking its sources...</em>
          </div>
        )}
      </div>

      <form
        style={{ display: "flex", gap: "10px" }}
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem(
            "message"
          ) as HTMLInputElement;
          if (input.value.trim()) {
            sendMessage({ text: input.value });
            input.value = "";
          }
        }}
      >
        <input
          name="message"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
          placeholder="What is the weather like in Tokyo?"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={status === "streaming"}
          style={{
            padding: "10px 20px",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </form>
      <button
        onClick={clearHistory}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          background: "transparent",
          border: "1px solid #ccc",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Clear History
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Chat />);
