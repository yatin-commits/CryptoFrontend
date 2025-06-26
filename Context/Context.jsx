// src/Context/Context.js
import { createContext, useState } from "react";
import run from "../src/config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSent() {
    if (!input.trim()) return; // Prevent sending empty prompts

    setLoading(true);
    setShowResult(true);
    const currentInput = input;
    setRecentPrompt(currentInput);
    setInput("");

    // Add prompt to history with empty result
    setPrevPrompts((prev) => [...prev, { query: currentInput, result: "" }]);

    try {
      const response = await run(currentInput);
      // Clean response: remove extra newlines, preserve Markdown
      const cleanedResponse = response.replace(/\n{2,}/g, '\n').trim();

      // Update the latest prompt's result
      setPrevPrompts((prev) =>
        prev.map((item, index) =>
          index === prev.length - 1 ? { ...item, result: cleanedResponse } : item
        )
      );
    } catch (error) {
      console.error("Error in crypto query:", error);
      setPrevPrompts((prev) =>
        prev.map((item, index) =>
          index === prev.length - 1
            ? { ...item, result: "Error fetching response." }
            : item
        )
      );
    }

    setLoading(false);
  }

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    recentPrompt,
    setRecentPrompt,
    showResult,
    loading,
    input,
    setInput,
  };

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;