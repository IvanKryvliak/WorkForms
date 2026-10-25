import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Btn } from "../ui/Button";
import { T, FIELD_TYPES, lbl, sel } from "../../constants/theme";
import { StringFormatEditor } from "./StringFormatEditor";

const DEFAULT_CUSTOM_FIELD = { id: "", label: "", type: "text", ph: "", req: true };

export function CreateTemplateModal({ open, onClose, onSave }) {
  const emptyCat = "Мої шаблони";
  const [name, setName] = useState("");
  const [cat, setCat] = useState(emptyCat);
  const [icon, setIcon] = useState("📝");
  const [desc, setDesc] = useState("");
  const [fields, setFields] = useState([{ ...DEFAULT_CUSTOM_FIELD }]);
  const [tmplStr, setTmplStr] = useState("");
  const [step, setStep] = useState(0);
  const [errs, setErrs] = useState({});

  const reset = () => {
    setName("");
    setCat(emptyCat);
    setIcon("📝");
    setDesc("");
    setFields([{ ...DEFAULT_CUSTOM_FIELD }]);
    setTmplStr("");
    setStep(0);
    setErrs({});
  };

  const addField = () => setFields(p => [...p, { ...DEFAULT_CUSTOM_FIELD }]);
  const updField = (i, k, v) => setFields(p => p.map((f, j) => j === i ? { ...f, [k]: v } : f));
  const delField = (i) => setFields(p => p.filter((_, j) => j !== i));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!name.trim()) e.name = "Назва обов'язкова";
    }
    if (step === 1) {
      fields.forEach((f, i) => {
        if (!f.id.trim()) e[`fid${i}`] = "ID обов'язковий";
        else if (!/^[a-zA-Z_]\w*$/.test(f.id)) e[`fid${i}`] = "Тільки латиниця без пробілів";
        if (!f.label.trim()) e[`flbl${i}`] = "Назва обов'язкова";
      });
    }
    if (step === 2) {
      if (!tmplStr.trim()) e.tmpl = "Шаблон рядка обов'язковий";
    }
    setErrs(e);
    return !Object.keys(e).length;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const save = () => {
    if (!validateStep()) return;
    const newTpl = {
      id: Date.now(),
      cat, icon, name, desc,
      fields: fields.map(f => ({ ...f, req: f.req === true || f.req === "true" })),
      build: (d) => {
        let t = tmplStr;
        fields.forEach(f => {
          t = t.replaceAll(`{${f.id}}`, d[f.id] || (f.type === "date" ? "__.__.____" : f.type === "number" ? "__" : "[" + f.label + "]"));
        });
        return t;
      },
      _tmplStr: tmplStr,
    };
    onSave(newTpl);
    reset();
    onClose();
  };

  const icons = ["📄", "✈️", "🏖️", "🏢", "🧾", "📋", "📮", "📨", "📊", "📚", "📈", "🏠", "💰", "🤝", "🖋️", "📑", "👨‍👩‍👧‍👦", "🏦", "💵", "🛒", "📦"];
  const CATS_EXT = ["Мої шаблони", "Заяви", "Договори", "Довідки", "Звіти", "Накази"];
  const stepLabels = ["Інформація", "Поля", "Шаблон рядка"];

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="" width={600}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: T.text }}>Новий шаблон</span>
        <button onClick={() => { reset(); onClose(); }} style={{
          background: "#f5f4f0", border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: T.rMd, width: 32, height: 32, cursor: "pointer",
          fontSize: 18, color: "#5f5e5a",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderRadius: T.rMd, overflow: "hidden", border: "1px solid rgba(0,0,0,0.12)" }}>
        {stepLabels.map((l, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center", padding: "8px 4px", fontSize: 12, fontWeight: i === step ? 700 : 400,
            background: i === step ? T.blue600 : i < step ? "#E6F1FB" : "#f7f7f5",
            color: i === step ? "#fff" : i < step ? T.blue800 : T.textHint,
            borderRight: i < 2 ? "1px solid rgba(0,0,0,0.1)" : undefined,
          }}>{i < step ? "✓ " : ""}{l}</div>
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={lbl}>Назва шаблону *</label>
            <input value={name} onChange={e => { setName(e.target.value); setErrs(p => ({ ...p, name: null })); }}
              placeholder="Заява на відрядження"
              style={{ ...sel, border: `1.5px solid ${errs.name ? "#dc2626" : "rgba(0,0,0,0.18)"}` }} />
            {errs.name && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#dc2626" }}>{errs.name}</p>}
          </div>
          <div>
            <label style={lbl}>Опис</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Короткий опис шаблону" style={sel} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lbl}>Категорія</label>
              <select value={cat} onChange={e => setCat(e.target.value)} style={sel}>
                {CATS_EXT.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Іконка</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                {icons.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)} style={{
                    width: 34, height: 34, fontSize: 18, cursor: "pointer",
                    border: `2px solid ${ic === icon ? T.blue600 : "rgba(0,0,0,0.1)"}`,
                    borderRadius: T.rMd, background: ic === icon ? T.blue50 : "#fff",
                  }}>{ic}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 14px", lineHeight: 1.6 }}>
            Визначте поля, які заповнюватиме користувач. <b>ID поля</b> — латиниця без пробілів (наприклад: <code>fullName</code>), він буде використовуватись у шаблоні рядка як <code>{"{" + "fullName" + "}"}</code>.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            {fields.map((f, i) => (
              <div key={i} style={{
                background: "#f9f8f5", borderRadius: T.rMd,
                border: "1px solid rgba(0,0,0,0.09)", padding: "12px 14px",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ ...lbl, marginBottom: 4 }}>ID поля</label>
                    <input value={f.id} onChange={e => updField(i, "id", e.target.value.replace(/\s/g, ""))}
                      placeholder="fullName"
                      style={{
                        ...sel, fontSize: 12, padding: "6px 8px",
                        border: `1.5px solid ${errs[`fid${i}`] ? "#dc2626" : "rgba(0,0,0,0.15)"}`
                      }} />
                    {errs[`fid${i}`] && <p style={{ margin: "3px 0 0", fontSize: 10, color: "#dc2626" }}>{errs[`fid${i}`]}</p>}
                  </div>
                  <div>
                    <label style={{ ...lbl, marginBottom: 4 }}>Назва поля</label>
                    <input value={f.label} onChange={e => updField(i, "label", e.target.value)}
                      placeholder="Повне ім'я"
                      style={{
                        ...sel, fontSize: 12, padding: "6px 8px",
                        border: `1.5px solid ${errs[`flbl${i}`] ? "#dc2626" : "rgba(0,0,0,0.15)"}`
                      }} />
                    {errs[`flbl${i}`] && <p style={{ margin: "3px 0 0", fontSize: 10, color: "#dc2626" }}>{errs[`flbl${i}`]}</p>}
                  </div>
                  <div>
                    <label style={{ ...lbl, marginBottom: 4 }}>Тип</label>
                    <select value={f.type} onChange={e => updField(i, "type", e.target.value)} style={{ ...sel, fontSize: 12, padding: "6px 8px" }}>
                      {FIELD_TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center" }}>
                  <div>
                    <input value={f.ph} onChange={e => updField(i, "ph", e.target.value)}
                      placeholder="Підказка (placeholder)"
                      style={{ ...sel, fontSize: 12, padding: "5px 8px" }} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.textSub, cursor: "pointer", whiteSpace: "nowrap" }}>
                    <input type="checkbox" checked={f.req} onChange={e => updField(i, "req", e.target.checked)} style={{ accentColor: T.blue600 }} />
                    Обов'язкове
                  </label>
                  {fields.length > 1 && (
                    <button onClick={() => delField(i)} style={{
                      width: 28, height: 28, borderRadius: T.rMd, cursor: "pointer",
                      border: "1px solid #dc2626", background: "#FEF2F2", color: "#dc2626", fontSize: 16,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Btn variant="subtle" sm onClick={addField}>+ Додати поле</Btn>
        </div>
      )}

      {step === 2 && (
        <div>
          <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 12px", lineHeight: 1.6 }}>
            Напишіть текст документу. Використовуйте <code style={{ background: "#D1FAE5", color: "#065F46", padding: "1px 5px", borderRadius: 4 }}>{"{" + "fieldId" + "}"}</code> для підстановки значень з полів.
          </p>
          <StringFormatEditor value={tmplStr} fields={fields} onChange={v => { setTmplStr(v); setErrs(p => ({ ...p, tmpl: null })); }} />
          {errs.tmpl && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#dc2626" }}>{errs.tmpl}</p>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        {step > 0 && <Btn onClick={back}>← Назад</Btn>}
        <Btn onClick={() => { reset(); onClose(); }}>Скасувати</Btn>
        {step < 2
          ? <Btn variant="primary" onClick={next}>Далі →</Btn>
          : <Btn variant="primary" onClick={save}>💾 Зберегти шаблон</Btn>
        }
      </div>
    </Modal>
  );
}