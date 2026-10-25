import html2pdf from "html2pdf.js";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";

const alignMapPDF = {
  left: "left",
  center: "center",
  right: "right",
  justify: "justify",
};

const alignMapDOCX = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

const fontMap = {
  "Times New Roman": "Times New Roman",
  "Arial": "Arial",
  "Georgia": "Georgia",
  "Courier New": "Courier New",
  "Verdana": "Verdana",
};

export async function generatePDF(tplName, lines = [], fmt = {}) {
  const container = document.createElement("div");
  container.style.width = "210mm";
  container.style.boxSizing = "border-box";
  container.style.background = "#ffffff";
  container.style.color = "#000000";
  container.style.fontFamily = fmt.font || "Times New Roman";
  container.style.fontSize = `${fmt.size || 12}pt`;
  container.style.lineHeight = fmt.lineH || 1.5;
  container.style.padding = `${fmt.mTop || 20}mm ` + `${fmt.mRight || 20}mm ` + `${fmt.mBottom || 20}mm ` + `${fmt.mLeft || 20}mm`;

  lines.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line.text || "";
    p.style.margin = "0";
    p.style.padding = "0";
    p.style.fontSize = `${line.size || fmt.size || 12}pt`;
    p.style.fontWeight = line.bold ? "700" : "400";
    p.style.fontStyle = line.italic ? "italic" : "normal";
    p.style.textAlign = line.align || fmt.align || "left";
    p.style.lineHeight = fmt.lineH || 1.5;
    p.style.whiteSpace = "pre-wrap";
    p.style.wordBreak = "break-word";
    container.appendChild(p);
  });
  document.body.appendChild(container);
  try {
    await html2pdf()
      .set({
        filename: `${tplName}.pdf`,
        margin: 0,
        image: {
          type: "jpeg",
          quality: 1,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(container)
      .save();
  }

  finally {
    document.body.removeChild(container);
  }

}

export async function generateDOCX(tplName, lines, fmt) {
  const paragraphs = lines.map(line => {
    const isEmpty = !line.text || line.text.trim() === "";
    return new Paragraph({
      children: isEmpty
        ? [new TextRun({ text: "", break: 0 })]
        : [new TextRun({
          text: line.text,
          size: (line.size || fmt.size) * 2,
          font: fontMap[fmt.font] || "Times New Roman",
          bold: line.bold,
          italics: line.italic,
        })],
      alignment: alignMapDOCX[line.align || fmt.align] || AlignmentType.LEFT,
      spacing: { line: Math.round(240 * fmt.lineH), before: 0, after: 0 },
    });
  });

  const docxDoc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: fmt.mTop * 56.7,
            bottom: fmt.mBottom * 56.7,
            left: fmt.mLeft * 56.7,
            right: fmt.mRight * 56.7,
          },
        },
      },
      children: paragraphs,
    }],
  });

  const blob = await Packer.toBlob(docxDoc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tplName}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}