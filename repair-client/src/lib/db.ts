// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\lib\db.ts
import Dexie, { Table } from "dexie";
import type { Attachment, Part, Settings } from "../types";

type AttachmentRec = Attachment & { data: Blob };

class RepairDB extends Dexie {
  parts!: Table<Part, number>;
  settings!: Table<Settings, number>;
  attachments!: Table<AttachmentRec, number>;
  constructor(){
    super("repairDB");

    this.version(1).stores({
      parts:"++id, receivedDate, partName, customerName, status, settled, severity",
    });

    this.version(2).stores({
      parts:"++id, receivedDate, partName, customerName, status, settled, severity",
      settings:"id",
    }).upgrade(async tx=>{
      const T = tx.table<Settings,number>("settings");
      const s = await T.get(1);
      if(!s){
        await T.add({id:1, defaultMyMarginPct:20, defaultCompanyMarginPct:10, defaultTechnicianName:"دیجی‌بورده", theme:"dark", currency:"TOMAN", palette:"ink"});
      }else{
        const next: Settings = { ...s };
        let dirty=false;
        if(!(s as any).currency){ (next as any).currency="TOMAN"; dirty=true; }
        if(!(s as any).theme){ (next as any).theme="dark"; dirty=true; }
        if(!(s as any).palette){ (next as any).palette="ink"; dirty=true; }
        if(dirty) await T.put(next);
      }
    });

    this.version(3).stores({
      parts:"++id, receivedDate, partName, customerName, status, settled, severity",
      settings:"id",
      attachments:"++id, partId",
    });

    this.version(5).stores({
      parts:"++id, receivedDate, partName, customerName, status, settled, severity, technicianName, serial",
      settings:"id",
      attachments:"++id, partId",
    }).upgrade(async tx=>{
      const P = tx.table<Part,number>("parts");
      await P.toCollection().modify((row:any)=>{
        if(row.serial===undefined) row.serial="";
        if(row.invoiceNo===undefined) row.invoiceNo="";
        if(row.tags===undefined) row.tags=[];
        if(row.estimateDays===undefined) row.estimateDays=null;
        if(row.warranty===undefined) row.warranty=false;
      });
    });

    // v6: تاریخ‌های تکمیل/تحویل
    this.version(6).stores({
      parts:"++id, receivedDate, completedDate, deliveredDate, partName, customerName, status, settled, severity, technicianName, serial",
      settings:"id",
      attachments:"++id, partId",
    }).upgrade(async tx=>{
      const P = tx.table<Part,number>("parts");
      await P.toCollection().modify((row:any)=>{
        if(row.completedDate===undefined) row.completedDate="";
        if(row.deliveredDate===undefined) row.deliveredDate="";
      });
    });
  }
}

export const db = new RepairDB();

/* Parts CRUD */
export async function allParts(){ return db.parts.orderBy("id").reverse().toArray(); }
export async function addPart(p: Part){ p.updatedAt=new Date().toISOString(); return db.parts.add(p); }
export async function updatePart(id:number, patch: Partial<Part>){ patch.updatedAt=new Date().toISOString(); return db.parts.update(id, patch); }
export async function deletePart(id:number){ await db.parts.delete(id); await db.attachments.where("partId").equals(id).delete(); }

/* Settings */
export async function getSettings(){
  const s = await db.settings.get(1);
  if(s) return s;
  const def: Settings = { id:1, defaultMyMarginPct:20, defaultCompanyMarginPct:10, defaultTechnicianName:"دیجی‌بورده", theme:"dark", currency:"TOMAN", palette:"ink" };
  await db.settings.put(def); return def;
}
export async function saveSettings(patch: Partial<Settings>){
  const cur = await getSettings(); const next = { ...cur, ...patch, id:1 } as Settings;
  await db.settings.put(next); return next;
}

/* Distinct */
export async function distinctCustomers(){ const rows=await db.parts.toArray(); return Array.from(new Set(rows.map(r=> (r.customerName||"").trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"fa")); }
export async function distinctPartNames(){ const rows=await db.parts.toArray(); return Array.from(new Set(rows.map(r=> (r.partName||"").trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"fa")); }
export async function distinctTechnicians(){ const rows=await db.parts.toArray(); return Array.from(new Set(rows.map(r=> (r.technicianName||"").trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"fa")); }

/* Attachments */
type AttachmentRec2 = Attachment & { data: Blob };
export async function listAttachments(partId:number){ return db.attachments.where("partId").equals(partId).toArray(); }
export async function addAttachments(partId:number, files: FileList | File[]){
  const arr = Array.isArray(files)? files : Array.from(files);
  for(const f of arr){
    const data = await f.arrayBuffer();
    await db.attachments.add({ partId, name:f.name, type:f.type, size:f.size, createdAt:new Date().toISOString(), data:new Blob([data],{type:f.type}) });
  }
}
export async function deleteAttachment(id:number){ await db.attachments.delete(id); }

/* Export/Import */
type ExportShape = { meta:{ exportedAt:string; app:string; version:number }, parts:Part[], settings:Settings };
export async function exportAll(): Promise<ExportShape>{ const [parts,settings]=await Promise.all([allParts(), getSettings()]); return { meta:{exportedAt:new Date().toISOString(), app:"repair-client", version:6}, parts, settings }; }
export async function importAll(data: ExportShape){
  if(data.settings) await db.settings.put({ ...data.settings, id:1 });
  if(Array.isArray(data.parts)){
    for(const p of data.parts){ const {id:_, ...rest}=p; await db.parts.add({ ...rest, updatedAt:new Date().toISOString() }); }
  }
}
