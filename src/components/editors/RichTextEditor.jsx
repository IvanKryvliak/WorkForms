import { useState, useRef, useCallback, useEffect } from "react";
import { T, FSIZES, DEFAULT_FMT } from "../../constants/theme";
import { AddFieldModal } from "./AddFieldModal";

function makeLineId() {
  return Math.random().toString(36).slice(2, 8);
}

const ALIGN_ICONS = {
  left: "⬅",
  center: "↔",
  right: "➡",
  justify: "☰",
};

// Компонент рядка з використанням textarea замість contentEditable
function EditableLine({ line, index, isSelected, globalFmt, onChange, onSelect, onKeyDown, onAddAfter, onDelete, onCaretChange }) {
  const textareaRef = useRef(null);
  const [localText, setLocalText] = useState(line.text);

  // Синхронізація зовнішніх змін
  useEffect(() => {
    setLocalText(line.text);
  }, [line.text]);

  // Автоматичне розширення висоти textarea
  useEffect(() => {
    if (textareaRef.current && isSelected) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [localText, isSelected]);

  // Фокус при виборі рядка
  useEffect(() => {
    if (isSelected && textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSelected]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setLocalText(newText);
    onChange(index, newText);
  };

  const handleKeyDownLocal = (e) => {
    const isEnter = e.key === "Enter" && !e.shiftKey;
    const isBackspace = e.key === "Backspace" && localText === "";
    const isArrowUp = e.key === "ArrowUp" && e.altKey;
    const isArrowDown = e.key === "ArrowDown" && e.altKey;

    if (isEnter) {
      e.preventDefault();
      onAddAfter(index);
      // Фокус на новий рядок після додавання
      setTimeout(() => {
        const textareas = document.querySelectorAll('.rich-editor-textarea');
        if (textareas[index + 1]) {
          textareas[index + 1].focus();
        }
      }, 50);
      return;
    }

    if (isBackspace) {
      e.preventDefault();
      onDelete(index);
      setTimeout(() => {
        const textareas = document.querySelectorAll('.rich-editor-textarea');
        const newIndex = Math.max(0, index - 1);
        if (textareas[newIndex]) {
          textareas[newIndex].focus();
          textareas[newIndex].setSelectionRange(
            textareas[newIndex].value.length,
            textareas[newIndex].value.length
          );
        }
      }, 50);
      return;
    }

    if (isArrowUp) {
      e.preventDefault();
      onSelect(Math.max(0, index - 1));
      setTimeout(() => {
        const textareas = document.querySelectorAll('.rich-editor-textarea');
        if (textareas[index - 1]) {
          textareas[index - 1].focus();
          const len = textareas[index - 1].value.length;
          textareas[index - 1].setSelectionRange(len, len);
        }
      }, 10);
      return;
    }

    if (isArrowDown) {
      e.preventDefault();
      onSelect(Math.min(index + 1, onSelect.totalLines - 1));
      setTimeout(() => {
        const textareas = document.querySelectorAll('.rich-editor-textarea');
        if (textareas[index + 1]) {
          textareas[index + 1].focus();
          const len = textareas[index + 1].value.length;
          textareas[index + 1].setSelectionRange(len, len);
        }
      }, 10);
      return;
    }

    onKeyDown(e, index);
  };

  const handleClick = (e) => {
    onSelect(index);
    if (e.target.tagName === "TEXTAREA") {
      onCaretChange(
        e.target.selectionStart,
        e.target.selectionEnd
      );
    }
  };

  const updateCaret = (e) => {
    onSelect(index);
    onCaretChange(
      e.target.selectionStart,
      e.target.selectionEnd
    );

  };

  return (
    <div
      className="rich-editor-line"
      onClick={handleClick}
      style={{
        position: "relative",
        marginBottom: "4px",
        borderRadius: 6,
        border: isSelected
          ? `2px solid ${T.blue600}`
          : "2px solid transparent",
        background: isSelected ? "rgba(125,24,165,0.04)" : "transparent",
        transition: "all 0.1s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -32,
          top: "50%",
          transform: "translateY(-50%)",
          width: 24,
          textAlign: "right",
          fontSize: 11,
          color: isSelected ? T.blue600 : T.textHint,
          fontWeight: isSelected ? 600 : 400,
          userSelect: "none",
        }}
      >
        {index + 1}
      </div>

      <textarea
        ref={textareaRef}
        className="rich-editor-textarea"
        value={localText}
        onChange={handleChange}
        onKeyDown={handleKeyDownLocal}
        placeholder=""
        style={{
          width: "100%",
          maxWidth: "100%",
          display: "block",
          fontSize: line.size || globalFmt.size,
          fontWeight: line.bold ? 700 : 400,
          fontStyle: line.italic ? "italic" : "normal",
          textAlign: line.align || globalFmt.align,
          fontFamily: globalFmt.font,
          lineHeight: globalFmt.lineH,
          padding: "8px 12px",
          border: "none",
          outline: "none",
          resize: "none",
          overflowX: "hidden",
          overflowY: "hidden",
          overflowWrap: "break-word",
          wordBreak: "normal",
          whiteSpace: "pre-wrap",
          background: "transparent",
          color: T.text,
          boxSizing: "border-box",
        }}
        rows={1}
        onSelect={updateCaret}
        onKeyUp={updateCaret}
        onMouseUp={updateCaret}
      />

      {isSelected && (
        <div
          style={{
            position: "absolute",
            right: -8,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: 4,
            opacity: 0.7,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddAfter(index);
            }}
            title="Додати рядок після (Enter)"
            style={{
              width: 24,
              height: 24,
              borderRadius: T.rMd,
              border: `1px solid ${T.blue600}`,
              background: T.blue50,
              color: T.blue600,
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              title="Видалити рядок"
              style={{
                width: 24,
                height: 24,
                borderRadius: T.rMd,
                border: "1px solid #dc2626",
                background: "#FEF2F2",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function RichTextEditor({ lines, fields, globalFmt, onLinesChange, onAddField }) {
  const [selectedLineIndex, setSelectedLineIndex] = useState(0);
  const [showAddField, setShowAddField] = useState(false);
  const containerRef = useRef(null);
  const caretRef = useRef({
    line: 0,
    start: 0,
    end: 0,
  });

  // Оновлення totalLines для навігації
  const selectLine = useCallback((index) => {
    if (index >= 0 && index < lines.length) {
      setSelectedLineIndex(index);
    }
  }, [lines.length]);

  // Додати totalLines до функції selectLine для доступу в EditableLine
  const selectLineWithTotal = useCallback((index) => {
    if (index >= 0 && index < lines.length) {
      setSelectedLineIndex(index);
    }
  }, [lines.length]);

  selectLineWithTotal.totalLines = lines.length;

  const handleTextChange = useCallback((index, newText) => {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      text: newText
    };
    onLinesChange(newLines);
  }, [lines, onLinesChange]);

  const handleLineStyleChange = useCallback((patch) => {
    const newLines = [...lines];
    newLines[selectedLineIndex] = {
      ...newLines[selectedLineIndex],
      ...patch
    };
    onLinesChange(newLines);
  }, [lines, selectedLineIndex, onLinesChange]);

  const addNewLineAfter = useCallback((index) => {
    const newLine = {
      id: makeLineId(),
      text: "",
      align: globalFmt.align,
      bold: false,
      italic: false,
      size: null,
    };
    const newLines = [...lines];
    newLines.splice(index + 1, 0, newLine);
    onLinesChange(newLines);
    setSelectedLineIndex(index + 1);
  }, [lines, globalFmt.align, onLinesChange]);

  const addNewLineAtEnd = useCallback(() => {
    const newLine = {
      id: makeLineId(),
      text: "",
      align: globalFmt.align,
      bold: false,
      italic: false,
      size: null,
    };
    const newLines = [...lines, newLine];
    onLinesChange(newLines);
    setSelectedLineIndex(newLines.length - 1);
  }, [lines, globalFmt.align, onLinesChange]);

  const deleteLine = useCallback((index) => {
    if (lines.length <= 1) {
      // Якщо це останній рядок, просто очищаємо його
      const newLines = [...lines];
      newLines[index] = {
        ...newLines[index],
        text: ""
      };
      onLinesChange(newLines);
      return;
    }

    const newLines = lines.filter((_, i) => i !== index);
    onLinesChange(newLines);
    const newIndex = Math.min(index, newLines.length - 1);
    setSelectedLineIndex(newIndex);
  }, [lines, onLinesChange]);

  const handleKeyDown = useCallback((e, index) => {
    // Жодної додаткової обробки, основна в EditableLine
  }, []);

  const insertField = useCallback((fieldId) => {
    const { line, start, end } = caretRef.current;
    const token = `{${fieldId}}`;
    const current = lines[line];
    if (!current)
      return;
    const text =
      current.text;
    const newText =
      text.slice(0, start)
      + token
      + text.slice(end);
    const newLines = [...lines];
    newLines[line] = {
      ...current,
      text: newText,
    };
    onLinesChange(newLines);
    setSelectedLineIndex(line);
    setTimeout(() => {
      const textarea =
        document.querySelectorAll(
          ".rich-editor-textarea"
        )[line];

      if (!textarea)
        return;

      textarea.focus();
      const pos =
        start + token.length;

      textarea.setSelectionRange(
        pos,
        pos
      );

      caretRef.current = {
        line,
        start: pos,
        end: pos,
      };

    }, 0);
  }, [lines, onLinesChange, selectedLineIndex]);

  const globalFmtSafe = globalFmt || DEFAULT_FMT;

  // Поточний вибраний рядок для панелі форматування
  const currentLine = lines[selectedLineIndex] || lines[0];

  return (
    <div ref={containerRef} style={{
      background: "#ffffff",
      border: "1px solid rgba(0,0,0,0.09)",
      borderRadius: T.rXl,
      overflow: "hidden",
    }}>
      {/* Панель форматування */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        background: "#f8f8f6",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["left", "center", "right", "justify"].map(a => (
            <button
              key={a}
              onClick={() => handleLineStyleChange({ align: a })}
              title={a === "left" ? "Ліво" : a === "center" ? "Центр" : a === "right" ? "Право" : "Ширина"}
              style={{
                width: 34,
                height: 34,
                fontSize: 14,
                cursor: "pointer",
                border: `1.5px solid ${currentLine?.align === a ? T.blue600 : "rgba(0,0,0,0.12)"}`,
                borderRadius: T.rMd,
                background: currentLine?.align === a ? T.blue50 : "#ffffff",
                color: currentLine?.align === a ? T.blue800 : T.textSub,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {ALIGN_ICONS[a]}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.1)" }} />

        <button
          onClick={() => handleLineStyleChange({ bold: !currentLine?.bold })}
          title="Жирний"
          style={{
            width: 34,
            height: 34,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            border: `1.5px solid ${currentLine?.bold ? T.blue600 : "rgba(0,0,0,0.12)"}`,
            borderRadius: T.rMd,
            background: currentLine?.bold ? T.blue50 : "#ffffff",
            color: currentLine?.bold ? T.blue800 : T.textSub,
          }}
        >
          B
        </button>

        <button
          onClick={() => handleLineStyleChange({ italic: !currentLine?.italic })}
          title="Курсив"
          style={{
            width: 34,
            height: 34,
            fontSize: 14,
            fontStyle: "italic",
            fontWeight: 700,
            cursor: "pointer",
            border: `1.5px solid ${currentLine?.italic ? T.blue600 : "rgba(0,0,0,0.12)"}`,
            borderRadius: T.rMd,
            background: currentLine?.italic ? T.blue50 : "#ffffff",
            color: currentLine?.italic ? T.blue800 : T.textSub,
          }}
        >
          I
        </button>

        <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.1)" }} />

        <select
          value={currentLine?.size || ""}
          onChange={e => handleLineStyleChange({ size: e.target.value ? +e.target.value : null })}
          style={{
            padding: "6px 10px",
            fontSize: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: T.rMd,
            background: "#ffffff",
            color: T.textSub,
            cursor: "pointer",
          }}
        >
          <option value="">Авто ({globalFmtSafe.size}pt)</option>
          {FSIZES.map(s => <option key={s} value={s}>{s} pt</option>)}
        </select>

        <div style={{ flex: 1 }} />

        <button
          onClick={addNewLineAtEnd}
          style={{
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            border: `1px solid ${T.blue600}`,
            borderRadius: T.rMd,
            background: T.blue50,
            color: T.blue800,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          + Новий рядок
        </button>

        <span style={{
          fontSize: 12,
          color: T.textHint,
          background: "#ffffff",
          padding: "4px 12px",
          borderRadius: T.rMd,
          border: "1px solid rgba(0,0,0,0.1)",
        }}>
          Рядок {selectedLineIndex + 1} з {lines.length}
        </span>
      </div>

      {/* Текстовий блок - список рядків */}
      <div
        style={{
          padding: `${globalFmtSafe.mTop}px ${globalFmtSafe.mRight}px ${globalFmtSafe.mBottom}px ${globalFmtSafe.mLeft}px`,
          background: "#fefefe",
          minHeight: 400,
        }}
      >
        {lines.map((line, index) => (
          <EditableLine
            key={line.id}
            line={line}
            index={index}
            isSelected={index === selectedLineIndex}
            globalFmt={globalFmtSafe}
            onChange={handleTextChange}
            onSelect={selectLineWithTotal}
            onKeyDown={handleKeyDown}
            onAddAfter={addNewLineAfter}
            onDelete={deleteLine}
            onCaretChange={(start, end) => {
              caretRef.current = {
                line: index,
                start,
                end,
              };
            }}
          />
        ))}
      </div>

      {/* Панель вставки полів */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        background: "#f8f8f6",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: T.textHint, fontWeight: 600 }}>
          + Вставити поле:
        </span>
        {fields.filter(f => f.id).map(f => (
          <button
            key={f.id}
            onMouseDown={(e) => {
              e.preventDefault();
              insertField(f.id);
            }}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid #065F46",
              borderRadius: T.rMd,
              background: "#D1FAE5",
              color: "#065F46",
              fontFamily: "monospace",
            }}
          >
            {`{${f.id}}`}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowAddField(true)}
          style={{
            padding: "5px 14px",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            border: "1px dashed rgba(0,0,0,0.25)",
            borderRadius: T.rMd,
            background: "transparent",
            color: T.textSub,
          }}
        >
          + Нове поле
        </button>
      </div>

      {/* Підказки */}
      <div style={{
        padding: "8px 16px",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        background: "#fafaf8",
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        fontSize: 11,
        color: T.textHint,
      }}>
        <span>⏎ Enter — новий рядок</span>
        <span>⌫ Backspace на порожньому — видалити рядок</span>
        <span>⌥ Alt + ↑/↓ — перехід між рядками</span>
      </div>

      <AddFieldModal
        open={showAddField}
        onClose={() => setShowAddField(false)}
        onAdd={(field) => {
          onAddField(field);
          setShowAddField(false);
        }}
      />
    </div>
  );
}