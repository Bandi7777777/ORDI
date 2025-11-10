import { useEffect } from "react";

export default function Toast({ text, onClose }: { text: string; onClose: () => void }) {
  useEffect(() => {
    if (text) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [text, onClose]);

  if (!text) return null;

  return (
    <div className="toast animate-fadeIn">
      <div className="text-sm">{text}</div>
      <button className="btn btn-ghost text-xs mt-2" onClick={onClose}>
        بستن
      </button>
    </div>
  );
}