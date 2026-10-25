import { BrowserRouter, Routes, Route } from "react-router-dom";
import DocumentTemplates from "./DocumentTemplates2";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentTemplates/>}/>
        {/* <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/export" element={<ExportPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;