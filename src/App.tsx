import React from "react";
import "./App.css";
import { Canvas } from "./lib/core/canvas";
import { useCanvasStore } from "./lib/core/state";

function App() {
  const tool = useCanvasStore((s) => s.activeTool);
  return (
    <div className="App">
      <header className="App-header">
        {/* <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p> */}
        <Canvas width={window.innerWidth} height={window.innerHeight} />
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            onClick={() => useCanvasStore.setState({ activeTool: "draw" })}
            disabled={tool === "draw"}
          >
            draw
          </button>
          <button
            onClick={() => useCanvasStore.setState({ activeTool: "select" })}
            disabled={tool === "select"}
          >
            select
          </button>
          <button
            onClick={() => useCanvasStore.setState({ activeTool: "move" })}
            disabled={tool === "move"}
          >
            move
          </button>
          <button
            onClick={() => useCanvasStore.setState({ activeTool: "shape" })}
            disabled={tool === "shape"}
          >
            shape
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
