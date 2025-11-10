import { useCallback, useEffect, useState } from "react";
import { addAttachments, deleteAttachment, listAttachments } from "../lib/db";

type Props = { partId: number };

export default function AttachmentList({ partId }: Props) {
  const [items, setItems] = useState<Array<{ id: number; url: string; name: string; size: number; type: string; createdAt: string }>>([]);

  const load = useCallback(async () => {
    const atts = await listAttachments(partId);
    const withUrl = atts.map((a) => ({
      id: a.id!,
      url: URL.createObjectURL(a.data),
      name: a.name,
      size: a.size,
      type: a.type,
      createdAt: a.createdAt,
    }));
    setItems(withUrl);
  }, [partId]);

  useEffect(() => {
    load();
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [load, items]);

  const handleAdd = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      await addAttachments(partId, files);
      await load();
      e.target.value = "";
    },
    [partId, load]
  );

  const handleRemove = useCallback(
    async (id: number) => {
      if (!confirm("حذف ضمیمه؟")) return;
      await deleteAttachment(id);
      await load();
    },
    [load]
  );

  return (
    <div className="card p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">ضمائم</h3>
        <label className="btn btn-primary text-xs cursor-pointer">
          افزودن تصویر
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleAdd} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <img src={it.url} alt={it.name} className="block w-full aspect-video object-cover" loading="lazy" />
            <div className="p-2 text-xs flex items-center justify-between gap-2">
              <div className="truncate" title={it.name}>
                {it.name}
              </div>
              <button className="btn btn-ghost text-rose-600 text-xs" onClick={() => handleRemove(it.id)}>
                حذف
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-xs text-slate-500">ضمیمه‌ای وجود ندارد.</div>}
      </div>
    </div>
  );
}