import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "32px",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#fff",
            color: "#1b1b1b",
          }}
        >
          <h1 style={{ marginTop: 0 }}>React Render Error</h1>
          <p>The landing page hit a runtime error while rendering.</p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f6f6f6",
              padding: "16px",
              borderRadius: "12px",
              overflow: "auto",
            }}
          >
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
