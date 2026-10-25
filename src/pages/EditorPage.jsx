import { useState } from "react";
import { T, DEFAULT_FMT, FSIZES, ALIGNS, LINEHS, lbl, sel } from "../constants/theme";
import { Btn } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { ToggleGroup } from "../components/ui/ToggleGroup";
import { FieldInput } from "../components/ui/FieldInput";
import { RichTextEditor } from "../components/editors/RichTextEditor";
import { RichDocPreview } from "../components/preview/RichDocPreview";
import { AddFieldModal } from "../components/editors/AddFieldModal";
import { tmplToLines, resolveLines } from "../utils/templateHelpers";

const SL = ({ children }) => (
  <p style={{
    margin: "0 0 16px", fontSize: 11, fontWeight: 700,
    color: T.textSub, textTransform: "uppercase", letterSpacing: "0.06em",
  }}>{children}</p>
);

function FormatModal({ open, onClose, fmt, setFmt }) {
  return (
    <Modal open={open} onClose={onClose} title="Стиль тексту" width={540}>
      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <label style={lbl}>Шрифт</label>
          <select
            value={fmt.font}
            onChange={e => setFmt(p => ({ ...p, font: e.target.value }))}
            style={sel}
          >
            {["Times New Roman", "Arial", "Georgia", "Courier New", "Verdana"].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={lbl}>Розмір за замовчуванням (pt)</label>
            <select
              value={fmt.size}
              onChange={e => setFmt(p => ({ ...p, size: +e.target.value }))}
              style={sel}
            >
              {FSIZES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Міжрядковий інтервал</label>
            <ToggleGroup
              opts={LINEHS}
              value={fmt.lineH}
              onChange={v => setFmt(p => ({ ...p, lineH: v }))}
            />
          </div>
        </div>
        {/* <div>
          <label style={lbl}>Вирівнювання за замовчуванням</label>
          <ToggleGroup
            opts={ALIGNS}
            value={fmt.align}
            onChange={v => setFmt(p => ({ ...p, align: v }))}
          />
        </div> */}
        <div>
          <label style={lbl}>Поля сторінки (мм)</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[["mTop", "Верх"], ["mBottom", "Низ"], ["mLeft", "Ліво"], ["mRight", "Право"]].map(([k, l]) => (
              <div key={k}>
                <span style={{ fontSize: 11, color: T.textHint, display: "block", marginBottom: 4 }}>{l}</span>
                <input
                  type="number"
                  value={fmt[k]}
                  min={5}
                  max={60}
                  onChange={e => setFmt(p => ({ ...p, [k]: +e.target.value }))}
                  style={{ ...sel, padding: "7px 8px" }}
                />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <Btn onClick={onClose}>Скасувати</Btn>
          <Btn variant="primary" onClick={onClose}>Застосувати</Btn>
        </div>
      </div>
    </Modal>
  );
}

export function EditorPage({ tpl, onNext, onBack }) {
  const [vals, setVals] = useState({});
  const [errs, setErrs] = useState({});
  const [fmtOpen, setFmtOpen] = useState(false);
  const [fmt, setFmt] = useState(DEFAULT_FMT);
  const [lines, setLines] = useState(() => tmplToLines(tpl));
  const [templateFields, setTemplateFields] = useState(tpl.fields || []);
  const [addFieldOpen, setAddFieldOpen] = useState(false);

  const setFieldValue = (id, v) => {
    setVals(p => ({ ...p, [id]: v }));
    setErrs(p => ({ ...p, [id]: null }));
  };

  const validate = () => {
    const e = {};
    templateFields.forEach(f => {
      if (f.req && !vals[f.id]) e[f.id] = "Обов'язкове поле";
      else if (f.type === "date" && vals[f.id] && isNaN(new Date(vals[f.id]))) e[f.id] = "Невірна дата";
      else if (f.type === "number" && vals[f.id] && (isNaN(+vals[f.id]) || +vals[f.id] < 0)) e[f.id] = "Введіть число";
    });
    setErrs(e);
    return !Object.keys(e).length;
  };

  const addNewField = (field) => {
    setTemplateFields(prev => [...prev, field]);
  };

  const buildDoc = () => lines.map(l => {
    let text = l.text;
    templateFields.forEach(f => {
      text = text.replaceAll(`{${f.id}}`, vals[f.id] || (f.type === "date" ? "__.__.____" : f.type === "number" ? "__" : "[" + f.label + "]"));
    });
    return text;
  }).join("\n");

  const resolvedLines = resolveLines(lines, vals, templateFields);

  const handleNext = () => {
    if (validate()) {
      onNext(vals, fmt, buildDoc(), resolvedLines);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={onBack} style={{
          background: "#ffffff", border: "1px solid rgba(0,0,0,0.18)",
          borderRadius: T.rMd, padding: "7px 14px", cursor: "pointer",
          fontSize: 13, color: T.textSub,
        }}>← Назад</button>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{tpl.icon}</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: T.text }}>{tpl.name}</span>
        <Badge cat={tpl.cat} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
        <div style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.09)",
          borderRadius: T.rXl,
          padding: "20px",
          position: "sticky",
          top: 70,
        }}>
          <SL>Заповнення полів</SL>

          {templateFields.map(f => (
            <FieldInput
              key={f.id}
              f={f}
              value={vals[f.id]}
              error={errs[f.id]}
              onChange={setFieldValue}
            />
          ))}

          <div style={{ marginTop: 4, marginBottom: 12 }}>
            <Btn variant="subtle" fullW onClick={() => setAddFieldOpen(true)}>
              + Створити поле
            </Btn>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="subtle" onClick={() => setFmtOpen(true)}>
              ⚙ Стиль
            </Btn>
            <Btn variant="primary" fullW onClick={handleNext}>
              Далі →
            </Btn>
          </div>
        </div>

        <div>
          <RichTextEditor
            lines={lines}
            fields={templateFields}
            globalFmt={fmt}
            onLinesChange={setLines}
            onAddField={addNewField}
          />

          <div style={{
            marginTop: 16,
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.09)",
            borderRadius: T.rXl,
            padding: "20px",
          }}>
            <SL>Попередній перегляд</SL>
            <RichDocPreview lines={resolvedLines} fmt={fmt} />
          </div>
        </div>
      </div>

      <AddFieldModal
        open={addFieldOpen}
        onClose={() => setAddFieldOpen(false)}
        onAdd={(field) => { setTemplateFields(prev => [...prev, field]); setAddFieldOpen(false); }}
      />

      <FormatModal open={fmtOpen} onClose={() => setFmtOpen(false)} fmt={fmt} setFmt={setFmt} />
    </div>
  );
}