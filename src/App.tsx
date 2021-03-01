import React, { FC } from "react";
import logo from "./logo.svg";
import "./App.css";

const App: FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <div className="div row">
          <img src={logo} className="App-logo" alt="logo" />
          <img
            src="./assets/media/logo512.png"
            className="App-logo"
            alt="logo"
          />
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
};

export default App;
