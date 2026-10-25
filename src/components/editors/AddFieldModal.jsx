import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Btn } from "../ui/Button";
import { FIELD_TYPES, lbl, sel, T } from "../../constants/theme";

export function AddFieldModal({open,onClose,onAdd}) {
  const [field, setField] = useState({id:"", label:"", type:"text", ph:"", req:true});
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!field.id.trim() || !field.label.trim()) {
      setError("ID та Назва поля обов'язкові");
      return;
    }
    if (!/^[a-zA-Z_]\w*$/.test(field.id)) {
      setError("ID тільки латиниця без пробілів");
      return;
    }
    onAdd({...field, id: field.id.trim()});
    setField({id:"", label:"", type:"text", ph:"", req:true});
    setError("");
    onClose();
  };

  const handleClose = () => {
    setField({id:"", label:"", type:"text", ph:"", req:true});
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Додати нове поле" width={480}>
      <div style={{display:"grid",gap:16}}>
        <div>
          <label style={lbl}>ID поля *</label>
          <input
            value={field.id}
            onChange={e=>setField(p=>({...p, id: e.target.value.replace(/\s/g,"")}))}
            placeholder="fullName"
            style={{...sel, padding:"8px 10px"}}
          />
          <p style={{fontSize:10,color:T.textHint,margin:"4px 0 0"}}>Латиниця без пробілів, наприклад: fullName</p>
        </div>
        <div>
          <label style={lbl}>Назва поля *</label>
          <input
            value={field.label}
            onChange={e=>setField(p=>({...p, label: e.target.value}))}
            placeholder="Повне ім'я"
            style={{...sel, padding:"8px 10px"}}
          />
        </div>
        <div>
          <label style={lbl}>Тип поля</label>
          <select
            value={field.type}
            onChange={e=>setField(p=>({...p, type: e.target.value}))}
            style={{...sel, padding:"8px 10px"}}
          >
            {FIELD_TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Підказка (placeholder)</label>
          <input
            value={field.ph}
            onChange={e=>setField(p=>({...p, ph: e.target.value}))}
            placeholder="Підказка для заповнення"
            style={{...sel, padding:"8px 10px"}}
          />
        </div>
        <div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:T.textSub}}>
            <input
              type="checkbox"
              checked={field.req}
              onChange={e=>setField(p=>({...p, req: e.target.checked}))}
              style={{accentColor:T.blue600, width:16, height:16}}
            />
            Обов'язкове поле
          </label>
        </div>
        {error && (
          <div style={{
            padding:"8px 12px",
            background:"#FEF2F2",
            border:"1px solid #FECACA",
            borderRadius:T.rMd,
            color:"#dc2626",
            fontSize:12,
          }}>{error}</div>
        )}
      </div>
      <div style={{
        display:"flex",gap:8,justifyContent:"flex-end",
        marginTop:20,paddingTop:16,
        borderTop:"1px solid rgba(0,0,0,0.07)",
      }}>
        <Btn onClick={handleClose}>Скасувати</Btn>
        <Btn variant="primary" onClick={handleAdd}>Додати поле</Btn>
      </div>
    </Modal>
  );
}