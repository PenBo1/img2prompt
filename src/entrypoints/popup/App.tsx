import { useCallback, useState } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  const incrementCount = useCallback(() => {
    setCount((prevCount) => prevCount + 1);
  }, []);

  return (
    <>
      <div>
        <a href="https://wxt.dev" rel="noopener" target="_blank">
          <img
            alt="WXT logo"
            className="logo"
            height="6em"
            src={wxtLogo}
            width="6em"
          />
        </a>
        <a href="https://react.dev" rel="noopener" target="_blank">
          <img
            alt="React logo"
            className="logo react"
            height="6em"
            src={reactLogo}
            width="6em"
          />
        </a>
      </div>
      <h1>WXT + React</h1>
      <div className="card">
        <button onClick={incrementCount} type="button">
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
