import { T } from "../../constants/theme";
import { useRef } from "react";

export function StringFormatEditor({ value, fields, onChange }) {
  const textareaRef = useRef(null);
  const varPattern = /\{(\w+)\}/g;
  const parts = [];
  let last = 0, m;
  const re = new RegExp(varPattern.source, "g");
  while ((m = re.exec(value)) !== null) {
    if (m.index > last) parts.push({ text: value.slice(last, m.index), type: "text" });
    const known = fields.find(f => f.id === m[1]);
    parts.push({ text: m[0], type: "var", known: !!known, id: m[1] });
    last = re.lastIndex;
  }
  if (last < value.length) parts.push({ text: value.slice(last), type: "text" });

  const insertField = (fieldId) => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const token = `{${fieldId}}`;

    const newValue =
      value.slice(0, start) +
      token +
      value.slice(end);

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();

      const pos = start + token.length;

      textarea.setSelectionRange(pos, pos);
    });
  };

  return (
    <div>
      <div style={{
        background: "#f9f8f5", borderRadius: T.rMd, border: "1px solid rgba(0,0,0,0.1)",
        padding: "10px 12px", marginBottom: 10, minHeight: 60,
        fontSize: 12, lineHeight: 1.6, fontFamily: "monospace",
        wordBreak: "break-all",
      }}>
        {parts.map((p, i) =>
          p.type === "text"
            ? <span key={i}>{p.text}</span>
            : <span key={i} style={{
              background: p.known ? "#D1FAE5" : "#FEE2E2",
              color: p.known ? "#065F46" : "#991B1B",
              borderRadius: 4, padding: "1px 4px", fontWeight: 600,
            }}>{p.text}</span>
        )}
        {parts.length === 0 && <span style={{ color: "#aaa" }}>Введіть шаблон нижче…</span>}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={7}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "10px 12px", fontSize: 13,
          border: "1.5px solid rgba(0,0,0,0.18)", borderRadius: T.rMd,
          fontFamily: "monospace", lineHeight: 1.65, resize: "vertical",
          background: "#ffffff", color: T.text, outline: "none",
        }}
        placeholder={"ЗАЯВА\n\nПрошу надати мені, {fullName}, {position},\nвідпустку з {startDate} по {endDate}.\n\nПідпис: ________________"}
      />
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 11, color: T.textHint, marginRight: 4 }}>Вставити поле:</span>
        {fields.filter(f => f.id).map(f => (
          <button key={f.id} onClick={() => insertField(f.id)} style={{
            padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
            border: "1px solid #065F46", borderRadius: T.rMd,
            background: "#D1FAE5", color: "#065F46",
          }}>{`{${f.id}}`}</button>
        ))}
        {fields.filter(f => f.id).length === 0 &&
          <span style={{ fontSize: 11, color: T.textHint, fontStyle: "italic" }}>Спочатку додайте поля</span>}
      </div>
    </div>
  );
}