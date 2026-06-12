import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { FluentProvider } from "@fluentui/react-components";
import { gwqLightTheme, gwqDarkTheme } from "./theme/brand";
import { AppProvider, useApp } from "./store/AppStore";
import { App } from "./App";
import "./index.css";

function ThemedShell() {
  const { colorScheme } = useApp();
  return (
    <FluentProvider
      theme={colorScheme === "dark" ? gwqDarkTheme : gwqLightTheme}
      style={{ height: "100%" }}
    >
      <App />
    </FluentProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <ThemedShell />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
