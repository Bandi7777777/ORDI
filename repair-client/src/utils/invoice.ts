// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\utils\invoice.ts
import type { Part, Currency } from "../types";
import { formatMoney } from "./format";

async function getPdfMake(){ const mod = await import("pdfmake/build/pdfmake"); return (mod as any).default ?? mod; }
async function ensureFonts(pdfMake:any){
  if(!pdfMake?.vfs || !pdfMake.vfs["Vazirmatn-Regular.ttf"]){
    try{
      const reg = await fetch("/fonts/Vazirmatn-Regular.ttf").then(r=>r.arrayBuffer());
      const bold= await fetch("/fonts/Vazirmatn-Bold.ttf").then(r=>r.arrayBuffer());
      pdfMake.vfs = pdfMake.vfs || {};
      pdfMake.vfs["Vazirmatn-Regular.ttf"] = btoa(String.fromCharCode(...new Uint8Array(reg)));
      pdfMake.vfs["Vazirmatn-Bold.ttf"]    = btoa(String.fromCharCode(...new Uint8Array(bold)));
      pdfMake.fonts = { vazir:{normal:"Vazirmatn-Regular.ttf", bold:"Vazirmatn-Bold.ttf", italics:"Vazirmatn-Regular.ttf", bolditalics:"Vazirmatn-Bold.ttf"} };
    }catch{}
  }
}

export async function renderInvoicePDF(p: Part, currency: Currency="TOMAN"){
  const pdfMake = await getPdfMake(); await ensureFonts(pdfMake);

  const headerLogo = { image: "/logo/ordi-logo.png", width: 80, alignment: "left" as const, margin:[0,0,0,10] };
  const qrText = JSON.stringify({ id:p.id, final:p.companyPrice, customer: p.customerName });

  const docDef = {
    pageSize:"A4",
    pageMargins:[40,48,40,48],
    defaultStyle:{ font:"vazir", fontSize:10, alignment:"right" as const },
    content:[
      headerLogo,
      { text:"فاکتور تعمیر قطعه", style:"title", rtl:true, margin:[0,0,0,10] },
      {
        columns:[
          { width:"*", text:`شماره: ${p.id ?? "-"}`, rtl:true },
          { width:"auto", text:`تاریخ صدور: ${new Date().toLocaleString("fa-IR")}`, rtl:true }
        ], margin:[0,0,0,10]
      },
      {
        table:{ headerRows:1, widths:["*", "*"], body:[
          [{text:"شرح",bold:true,rtl:true},{text:"مقدار",bold:true,rtl:true}],
          ["نام قطعه", p.partName], ["مشتری", p.customerName], ["تعمیرکننده", p.technicianName],
          ["وضعیت", p.status==="repaired"?"تعمیر شده":"در جریان"],
          ["تسویه", p.settled? "انجام شد":"نشده"], ["اولویت", p.severity],
          ...(p.serial? [["سریال", p.serial]]: []),
          ...(p.invoiceNo? [["شماره فاکتور", p.invoiceNo]]: []),
          ...(p.tags?.length? [["برچسب‌ها", p.tags.join("، ")]]: []),
          ...(p.estimateDays!=null? [["برآورد مدت (روز)", String(p.estimateDays)]]: []),
          ...(p.warranty? [["گارانتی", "بله"]]: []),
          ...(p.receivedDate? [["تاریخ دریافت", p.receivedDate]]: []),
          ...(p.completedDate? [["تاریخ تکمیل", p.completedDate]]: []),
          ...(p.deliveredDate? [["تاریخ تحویل", p.deliveredDate]]: []),
        ]}, layout:"lightHorizontalLines", margin:[0,0,0,14]
      },
      {
        table:{ headerRows:1, widths:["*", "*"], body:[
          [{text:"شرح",bold:true,rtl:true},{text:"مبلغ",bold:true,rtl:true}],
          ["قیمت تعمیر", formatMoney(p.techPrice,currency)],
          ["قیمت شما", formatMoney(p.myPrice,currency)],
          ["قیمت نهایی", formatMoney(p.companyPrice,currency)]
        ]}, layout:"lightHorizontalLines"
      },
      p.notes? { text:`\nیادداشت:\n${p.notes}`, rtl:true, margin:[0,12,0,0]}: {},
      { text:"\nQR پرداخت", bold:true, rtl:true, margin:[0,8,0,4] },
      { qr: qrText, fit:90, alignment:"left" as const }
    ],
    styles:{ title:{ fontSize:14, bold:true } }
  };
  (pdfMake as any).createPdf(docDef).download(`invoice_${p.id ?? "part"}.pdf`);
}
