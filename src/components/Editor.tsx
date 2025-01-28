import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useState } from "react";

const Editor = ({
  isGenerating,
  onGenerateReview,
}: {
  isGenerating: boolean;
  onGenerateReview: (code: string) => void;
}) => {
  const [code, setCode] = useState("Hello World! Welcome to the arena.");

  return (
    <div className="relative h-full w-6/12">
      <button
        disabled={isGenerating}
        onClick={() => onGenerateReview(code)}
        className="absolute bottom-3 right-3 z-50 w-max rounded bg-green-500 p-2 text-white hover:bg-green-700 active:translate-y-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-75"
      >
        Generate Review
      </button>
      <CodeMirror
        minHeight="100vh"
        value={code}
        onChange={setCode}
        theme="dark"
        extensions={[javascript({ jsx: true })]}
        style={{
          fontSize: "20px",
        }}
      />
    </div>
  );
};

export default Editor;
