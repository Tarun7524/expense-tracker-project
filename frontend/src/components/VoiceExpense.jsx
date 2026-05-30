import { useState } from "react";
import { addExpense } from "../api/expenseApi";

function VoiceExpense({ onExpenseAdded }) {
  // Listening state
  const [listening, setListening] = useState(false);

  // Spoken text display state
  const [spokenText, setSpokenText] = useState("");

  // Voice listening start function
  const startListening = () => {
    // Browser voice recognition support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    // Browser support check
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported. Use Chrome browser.");
      return;
    }

    // Recognition object create
    const recognition = new SpeechRecognition();

    // Language set
    recognition.lang = "en-IN";

    // Start listening
    recognition.start();

    // Mic started
    recognition.onstart = () => {
      setListening(true);
    };

    // Voice result
    recognition.onresult = async (event) => {
      // User spoken text
      const text = event.results[0][0].transcript;

      // Display spoken text
      setSpokenText(text);

      // Example:
      // "spent 300 on food"

      // Amount extract
      const amountMatch = text.match(/\d+/);

      const amount = amountMatch ? amountMatch[0] : "";

      // Lowercase text
      const lowerText = text.toLowerCase();

      // Default category
      let category = "Other";

      // Category detection
      if (lowerText.includes("food")) {
        category = "Food";
      } else if (lowerText.includes("shopping")) {
        category = "Shopping";
      } else if (lowerText.includes("travel")) {
        category = "Travel";
      } else if (lowerText.includes("bill")) {
        category = "Bills";
      }

      // Amount not found
      if (!amount) {
        alert("Amount not detected. Say like: spent 300 on food");
        return;
      }

      // Backend send data
      const expenseData = {
        title: "Voice Expense",
        amount: amount,
        category: category,
      };

      try {
        // Expense add API call
        await addExpense(expenseData);

        alert("Voice expense added successfully!");

        // Dashboard refresh
        if (onExpenseAdded) {
          onExpenseAdded();
        }
      } catch (error) {
        console.log(error);
        alert("Failed to add expense");
      }
    };

    // Listening stop
    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <section className="voice-card">
      <div className="voice-content">
        <h2>🎤 Voice Expense Entry</h2>

        <p>
          Say like:
          <span className="voice-example">
            spent 300 on food
          </span>
        </p>
      </div>

      <button
        type="button"
        className={`voice-btn ${listening ? "listening" : ""}`}
        onClick={startListening}
      >
        {listening
          ? "🎙 Listening..."
          : "🎤 Add Expense by Voice"}
      </button>

      {spokenText && (
        <div className="spoken-text">
          <strong>You said:</strong> {spokenText}
        </div>
      )}
    </section>
  );
}

export default VoiceExpense;