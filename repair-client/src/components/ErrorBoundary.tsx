import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // می‌تونی اینجا لاگ هم بفرستی
    console.error("UI Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          direction: "rtl",
          padding: "16px",
          margin: "12px",
          border: "1px solid var(--glass-line)",
          borderRadius: "12px",
          background: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))",
          color: "var(--fg-1)"
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>خطا در نمایش صفحه</div>
          <div style={{ fontSize: 12, opacity: .85 }}>
            لطفاً کنسول مرورگر (F12 → Console) را چک کن.  
            پیام خطا: <code dir="ltr">{String(this.state.error)}</code>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
