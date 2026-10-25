import { useState } from "react";
import { T } from "./constants/theme";
import { Stepper } from "./components/ui/Stepper";
import { HomePage } from "./pages/HomePage";
import { EditorPage } from "./pages/EditorPage";
import { ExportPage } from "./pages/ExportPage";

export default function App() {
  const [page, setPage] = useState("home");
  const [tpl, setTpl] = useState(null);
  const [fmt, setFmt] = useState(null);
  const [doc, setDoc] = useState("");
  const [lines, setLines] = useState([]);
  const [vals, setVals] = useState({});

  const openTpl = (t) => { setTpl(t); setPage("editor"); };

  const goExport = (v, f, d, ls) => {
    setVals(v);
    setFmt(f);
    setDoc(d);
    if (ls) setLines(ls);
    setPage("export");
  };

  const goHome = () => { setPage("home"); setTpl(null); setVals({}); };

  const stepIdx = { home: 0, editor: 1, export: 2 }[page];

  return (
    <div style={{ minHeight: "100vh", background: T.pageBg }}>
      <nav style={{
        background: "#ffffff",
        borderBottom: "1px solid rgba(0,0,0,0.09)",
        height: 54,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <button onClick={goHome} style={{
          background: "none", border: "none", cursor: "pointer",
          fontWeight: 700, fontSize: 16, color: T.text, padding: 0,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            width: 28, height: 28, background: T.blue600, borderRadius: T.rMd,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#fff", flexShrink: 0, fontWeight: 700,
          }}>F</span>
          FormDoc
        </button>
        <Stepper step={stepIdx} />
        <div style={{ width: 80 }} />
      </nav>

      {page === "home" && <HomePage onOpen={openTpl} />}
      {page === "editor" && tpl && (
        <EditorPage
          tpl={tpl}
          onNext={goExport}
          onBack={goHome}
        />
      )}
      {page === "export" && tpl && (
        <ExportPage
          tpl={tpl}
          fmt={fmt}
          doc={doc}
          lines={lines}
          vals={vals}
          onBack={() => setPage("editor")}
          onHome={goHome}
        />
      )}
    </div>
  );
}