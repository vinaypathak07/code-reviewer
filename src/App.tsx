import React, { useState } from "react";
import Editor from "./components/Editor";
import "./App.css";
import Review from "./components/Review";

function App() {
  const [review, setReview] = useState("# Review would be here");
  const [state, setState] = useState<"idle" | "generated" | "generating">(
    "idle",
  );

  const isGenerating = state === "generating";

  const handleGenerateReview = async (code: string) => {
    setState("generating");
    try {
      const response = await fetch("http://localhost:3001/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setReview(data.review);
    } catch (error) {
      alert("Something went wrong. Please try again later!");
      console.log(error);
    }
    setState("generated");
  };

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <img alt="check cdn" src="https://image-cdn.xyz.in/HEIST.png" />
      <Editor
        isGenerating={isGenerating}
        onGenerateReview={handleGenerateReview}
      />
      <Review isGenerating={isGenerating} review={review} />
    </div>
  );
}

export default App;
