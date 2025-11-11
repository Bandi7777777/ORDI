import JalaliDatePicker from "./JalaliDatePicker";

type Props = {
  type: "received" | "completed" | "delivered";
  onTypeChange: (t: Props["type"]) => void;
  from: string;
  to: string;
  onFrom: (iso: string) => void;
  onTo: (iso: string) => void;
};

export default function DateRangeField({ type, onTypeChange, from, to, onFrom, onTo }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg" style={{ border:"1px solid var(--line)", background:"rgba(255,255,255,.05)"}}>
      <div className="flex items-center gap-1">
        <button className={`btn ${type==="received"?"btn-tone":"btn-ghost"} text-xs`} onClick={()=>onTypeChange("received")}>تحویل‌گیری</button>
        <button className={`btn ${type==="completed"?" btn-tone":"btn-ghost"} text-xs`} onClick={()=>onTypeChange("completed")}>تکمیل</button>
        <button className={`btn ${type==="delivered"?" btn-tone":"btn-ghost"} text-xs`} onClick={()=>onTypeChange("delivered")}>تحویل</button>
      </div>
      <div className="flex items-end gap-2" style={{marginInlineStart:"auto"}}>
        <Jalali?Picker label="از" value={from} onChange={onFrom}/>
        <Jalali?Picker label="تا" value={to} onChange={onTo}/>
      </div>
    </div>
  );
}
