import { useState } from "react";
import { T } from "../constants/theme";
import { Modal } from "../components/ui/Modal";
import { Btn } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { CreateTemplateModal } from "../components/editors/CreateTemplateModal";
import { useTemplates } from "../hooks/useTemplates";

function TemplateModal({ open, onClose, tpl, onOpen }) {
  return (
    <Modal open={open} onClose={onClose} title={tpl?.name || ""} width={560}>
      {tpl && (
        <>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: T.textSub }}>{tpl.desc}</p>
          <div style={{
            background: "#f9f8f5", border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: T.rMd, padding: "16px 18px",
            fontFamily: "Georgia,serif", fontSize: 13, lineHeight: 1.75,
            whiteSpace: "pre-wrap", color: "#111",
            maxHeight: 260, overflowY: "auto", marginBottom: 18,
          }}>{tpl.build({})}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: T.textHint }}>{tpl.fields.length} полів для заповнення</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={onClose} sm>Закрити</Btn>
              <Btn variant="primary" sm onClick={() => { onClose(); onOpen(tpl); }}>Відкрити →</Btn>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

export function HomePage({ onOpen }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Всі");
  const [preview, setPreview] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { templates, addTemplate } = useTemplates();

  const cats = ["Всі", ...Array.from(new Set(templates.map(t => t.cat)))];
  const list = templates.filter(t => {
    const mc = cat === "Всі" || t.cat === cat;
    const ms = t.name.toLowerCase().includes(search.toLowerCase()) || 
               t.desc.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>
            Шаблони документів
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: T.textSub }}>
            Виберіть шаблон, заповніть поля та завантажте готовий документ
          </p>
        </div>
        <Btn variant="primary" onClick={() => setCreateOpen(true)}>+ Новий шаблон</Btn>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: T.textHint, fontSize: 15, pointerEvents: "none", userSelect: "none",
          }}>⌕</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Пошук шаблону..."
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "9px 12px 9px 36px", fontSize: 14,
              border: "1.5px solid rgba(0,0,0,0.18)", borderRadius: T.rMd,
              background: "#ffffff", color: T.text, outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cats.map(c => {
            const active = c === cat;
            return (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "8px 16px", fontSize: 13, cursor: "pointer",
                border: `1.5px solid ${active ? T.blue600 : "rgba(0,0,0,0.15)"}`,
                borderRadius: T.rMd, fontWeight: active ? 600 : 400,
                background: active ? T.blue50 : "#ffffff",
                color: active ? T.blue800 : T.textSub,
              }}>{c}</button>
            );
          })}
        </div>
      </div>

      {list.length === 0
        ? <div style={{ textAlign: "center", padding: "4rem", color: T.textHint, fontSize: 15 }}>Нічого не знайдено</div>
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 16 }}>
            {list.map(t => (
              <div key={t.id} style={{
                background: "#ffffff", border: "1px solid rgba(0,0,0,0.09)",
                borderRadius: T.rXl, padding: "20px 20px 18px",
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge cat={t.cat} />
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 15, color: T.text }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: 13, color: T.textSub }}>{t.desc}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => setPreview(t)} sm>Переглянути</Btn>
                  <Btn variant="primary" onClick={() => onOpen(t)} sm>Відкрити →</Btn>
                </div>
              </div>
            ))}
          </div>
        )
      }

      <CreateTemplateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={(tpl) => { addTemplate(tpl); setCreateOpen(false); }}
      />

      <TemplateModal
        open={!!preview}
        onClose={() => setPreview(null)}
        tpl={preview}
        onOpen={onOpen}
      />
    </div>
  );
}