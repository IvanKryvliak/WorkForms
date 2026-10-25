import { useState } from "react";
import { T } from "../constants/theme";
import { Btn } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { RichDocPreview } from "../components/preview/RichDocPreview";
import { DocPreview } from "../components/preview/DocPreview";
import { generatePDF, generateDOCX } from "../utils/exportUtils";

const SL = ({ children }) => (
  <p style={{
    margin: "0 0 16px", fontSize: 11, fontWeight: 700,
    color: T.textSub, textTransform: "uppercase", letterSpacing: "0.06em",
  }}>{children}</p>
);

export function ExportPage({ tpl, fmt, doc, lines, vals, onBack, onHome }) {
  const [modal, setModal] = useState(null);
  const [lastFmt, setLastFmt] = useState("");

  const openModal = (f) => { setLastFmt(f); setModal(f); };

  const confirm = async () => {
    if (lastFmt === "pdf") {
      await generatePDF(tpl.name, lines, fmt);
    } else if (lastFmt === "docx") {
      await generateDOCX(tpl.name, lines, fmt);
    }
    setModal("success");
  };

  const alignLabel = { left: "Ліво", center: "Центр", right: "Право", justify: "По ширині" };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <button onClick={onBack} style={{
          background: "#ffffff", border: "1px solid rgba(0,0,0,0.18)",
          borderRadius: T.rMd, padding: "7px 14px", cursor: "pointer", fontSize: 13, color: T.textSub,
        }}>← Назад</button>
        <span style={{ fontSize: 18, fontWeight: 600, color: T.text }}>Перегляд та експорт</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 20, alignItems: "start" }}>
        <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.09)", borderRadius: T.rXl, padding: "20px" }}>
          <SL>Готовий документ</SL>
          {lines && lines.length > 0
            ? <RichDocPreview lines={lines} fmt={fmt} />
            : <DocPreview text={doc} fmt={fmt} />
          }
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.09)", borderRadius: T.rXl, padding: "20px" }}>
            <SL>Завантажити</SL>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { f: "pdf", iconBg: "#FEE2E2", iconColor: "#991B1B", iconLetter: "P", label: "Завантажити PDF", sub: "Для друку та перегляду" },
                { f: "docx", iconBg: "#DBEAFE", iconColor: "#1E40AF", iconLetter: "W", label: "Завантажити DOCX", sub: "Для редагування у Word" },
              ].map(item => (
                <button key={item.f} onClick={() => openModal(item.f)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px",
                  border: "1px solid rgba(0,0,0,0.09)",
                  borderRadius: T.rLg,
                  background: "#f7f7f5", cursor: "pointer", textAlign: "left", width: "100%",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: T.rMd,
                    background: item.iconBg, color: item.iconColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17, fontWeight: 700, flexShrink: 0,
                  }}>{item.iconLetter}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: T.textHint }}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.09)", borderRadius: T.rXl, padding: "20px" }}>
            <SL>Форматування</SL>
            {[
              ["Шрифт", fmt.font],
              ["Розмір", `${fmt.size} pt`],
              ["Інтервал", fmt.lineH],
              ["Вирівнювання", alignLabel[fmt.align]],
              ["Поля", `${fmt.mTop}·${fmt.mBottom}·${fmt.mLeft}·${fmt.mRight} мм`],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between",
                padding: "5px 0", borderBottom: "1px solid rgba(0,0,0,0.05)",
              }}>
                <span style={{ fontSize: 12, color: T.textHint }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{v}</span>
              </div>
            ))}
          </div>

          <Btn fullW variant="subtle" onClick={onHome}>← На головну</Btn>
        </div>
      </div>

      <Modal open={modal === "pdf"} onClose={() => setModal(null)} title="Підтвердження — PDF" width={440}>
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "#FEF2F2", borderRadius: T.rLg, padding: "14px 16px", marginBottom: 16,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: T.rMd, background: "#FECACA",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, color: "#7F1D1D", flexShrink: 0,
          }}>P</div>
          <div>
            <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: "#7F1D1D" }}>{tpl.name}.pdf</p>
            <p style={{ margin: 0, fontSize: 12, color: "#B91C1C" }}>{fmt.font} · {fmt.size}pt · Готово до друку</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: T.textSub, margin: "0 0 20px", lineHeight: 1.65 }}>
          Файл буде збережено у форматі PDF. Перевірте, що всі поля заповнені коректно перед завантаженням.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn onClick={() => setModal(null)}>Скасувати</Btn>
          <Btn variant="danger" onClick={confirm}>Завантажити PDF</Btn>
        </div>
      </Modal>

      <Modal open={modal === "docx"} onClose={() => setModal(null)} title="Підтвердження — DOCX" width={440}>
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "#EFF6FF", borderRadius: T.rLg, padding: "14px 16px", marginBottom: 16,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: T.rMd, background: "#BFDBFE",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, color: "#1E3A5F", flexShrink: 0,
          }}>W</div>
          <div>
            <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: "#1E3A5F" }}>{tpl.name}.docx</p>
            <p style={{ margin: 0, fontSize: 12, color: "#1E40AF" }}>{fmt.font} · {fmt.size}pt · Сумісний з Word</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: T.textSub, margin: "0 0 20px", lineHeight: 1.65 }}>
          Файл буде збережено у форматі DOCX. Ви зможете відкрити та редагувати його в Microsoft Word або Google Docs.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn onClick={() => setModal(null)}>Скасувати</Btn>
          <Btn variant="primary" onClick={confirm}>Завантажити DOCX</Btn>
        </div>
      </Modal>

      <Modal open={modal === "success"} onClose={() => setModal(null)} title="" width={400}>
        <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#D1FAE5",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ fontWeight: 700, fontSize: 19, margin: "0 0 6px", color: T.text }}>Файл завантажено!</p>
          <p style={{ fontSize: 13, color: T.textSub, margin: "0 0 20px", lineHeight: 1.6 }}>
            «{tpl.name}» успішно збережено на ваш пристрій
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: T.rMd, padding: "9px 16px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>
              {tpl.name}.{lastFmt}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <Btn onClick={() => setModal(null)}>Залишитися</Btn>
            <Btn variant="primary" onClick={() => { setModal(null); onHome(); }}>На головну</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}