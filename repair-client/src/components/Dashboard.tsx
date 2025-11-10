import { useMemo } from "react";
import type { Currency, Part } from "../types";
import { formatMoney } from "../utils/format";

type Props = {
  parts: Part[];
  currency: Currency;
  onGo?: (dest: "list" | "settings" | "dashboard") => void;
  onQuickFilter?: (patch: Partial<{ status: string; settled: string }>) => void;
};

export default function Dashboard({ parts, currency, onGo, onQuickFilter }: Props) {
  const S = useMemo(() => {
    const sum = (xs:number[]) => xs.reduce((a,b)=>a+b,0);
    const repaired = parts.filter(p=>p.status==="repaired");
    const pending  = parts.filter(p=>p.status==="pending");
    const unsettled = sum(parts.filter(p=>!p.settled).map(p=>p.companyPrice));
    return { total:parts.length, repaired:repaired.length, pending:pending.length, unsettled };
  }, [parts]);

  const Tile = ({ k, v, c, onClick }: {k:string; v:string; c:"cyan"|"mint"|"violet"|"pink"; onClick?:()=>void}) => (
    <div className="tile" style={{cursor:onClick?"pointer":"default"}} onClick={onClick}>
      <div className="k" style={{color:"var(--fg-2)"}}>{k}</div>
      <div className="v" style={{color: `var(--c-${c})`}}>{v}</div>
    </div>
  );

  return (
    <section className="tiles">
      <Tile k="کل رکوردها" v={`${S.total}`} c="cyan" onClick={()=>onGo?.("list")} />
      <Tile k="در جریان"   v={`${S.pending}`} c="violet" onClick={()=>onQuickFilter?.({ status:"pending" })} />
      <Tile k="تعمیر شده"  v={`${S.repaired}`} c="mint" onClick={()=>onQuickFilter?.({ status:"repaired" })} />
      <Tile k="مبلغ تسویه‌نشده" v={formatMoney(S.unsettled, currency)} c="pink" />
    </section>
  );
}
