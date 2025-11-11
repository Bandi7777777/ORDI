type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "email";
  icon?: React.ReactNode;
  error?: string;
};

export default function InputPro({ label, value, onChange, placeholder, type = "text", icon, error }: Props) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-fg-1">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-2">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input w-full ${icon ? "pl-10" : ""} ${error ? "border-red-500" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}