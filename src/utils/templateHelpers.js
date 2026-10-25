export function makeLineId() {
  return Math.random().toString(36).slice(2,8);
}

export function tmplToLines(tpl) {
  const rawStr = tpl._tmplStr || tpl.build({});
  return rawStr.split("\n").map(t => ({
    id: makeLineId(),
    text: t,
    align: "justify",
    bold: false,
    italic: false,
    size: null,
  }));
}

export function resolveLine(line, vals, fields) {
  return line.text.replace(/\{(\w+)\}/g, (_, id) => {
    const f = fields.find(f => f.id === id);
    if (!f) return `{${id}}`;
    return vals[id] || (f.type === "date" ? "__.__.____" : f.type === "number" ? "__" : "[" + f.label + "]");
  });
}

export function resolveLines(lines, vals, fields) {
  return lines.map(line => ({
    ...line,
    text: resolveLine(line, vals, fields),
  }));
}