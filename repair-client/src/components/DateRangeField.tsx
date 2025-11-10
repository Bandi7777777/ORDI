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
    <div className="datebox">
      <div className="seg">
        <button className={`seg-btn ${type==="received"?"active":""}`}  onClick={()=>onTypeChange("received")}>دریافت</button>
        <button className={`seg-btn ${type==="completed"?"active":""}`} onClick={()=>onTypeChange("completed")}>تکمیل</button>
        <button className={`seg-btn ${type==="delivered"?"active":""}`} onClick={()=>onTypeChange("delivered")}>تحویل</button>
      </div>
      <div className="date-range__body mt-2">
        <JalaliDatePicker label="از" value={from} onChange={onFrom}/>
        <span className="date-range__dash">—</span>
        <JalaliDatePicker label="تا" value={to} onChange={onTo}/>
      </div>
    </div>
  );
}
