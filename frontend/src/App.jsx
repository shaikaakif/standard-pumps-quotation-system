import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QuotationProvider } from "./context/QuotationContext";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/system/ErrorBoundary";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ErrorBoundary>
      <QuotationProvider>
        <BrowserRouter>
          {/* Main client application entry point */}
          <AppRoutes />

          {/* Premium customized Toast notification system */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e3a8a", // Navy Blue
                color: "#fff",
                fontSize: "13px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: "1px solid #102a43",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
              },
              success: {
                iconTheme: {
                  primary: "#fbbf24", // Accent Yellow
                  secondary: "#1e3a8a",
                },
              },
              error: {
                style: {
                  background: "#fee2e2", // light red
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                },
              },
            }}
          />
        </BrowserRouter>
      </QuotationProvider>
    </ErrorBoundary>
  );
}

export default App;
