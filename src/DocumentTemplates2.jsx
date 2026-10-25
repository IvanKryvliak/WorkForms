import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";

const T = {
  surface:   "var(--color-background-primary,#ffffff)",
  surfaceSub:"var(--color-background-secondary,#f7f7f5)",
  pageBg:    "var(--color-background-tertiary,#f0efe9)",
  text:      "var(--color-text-primary,#1a1916)",
  textSub:   "var(--color-text-secondary,#5f5e5a)",
  textHint:  "var(--color-text-tertiary,#9e9b94)",
  border:    "var(--color-border-tertiary,rgba(0,0,0,0.1))",
  borderMd:  "var(--color-border-secondary,rgba(0,0,0,0.18))",
  infoBg:    "var(--color-background-info,#E6F1FB)",
  infoText:  "var(--color-text-info,#0C447C)",
  successBg: "var(--color-background-success,#EAF3DE)",
  successTx: "var(--color-text-success,#27500A)",
  dangerBg:  "var(--color-background-danger,#FCEBEB)",
  dangerTx:  "var(--color-text-danger,#791F1F)",
  blue50:    "#E6F1FB",
  blue600:   "#7d18a5",
  blue800:   "#550c7c",
  rMd: "var(--border-radius-md,8px)",
  rLg: "var(--border-radius-lg,12px)",
  rXl: "var(--border-radius-xl,16px)",
};

const CAT_COLORS = {
  "Мої шаблони": {bg:"#F3E8FF",text:"#6B21A8"},
  "Заяви":    {bg:"#E6F1FB",text:"#0C447C"},
  "Договори": {bg:"#EAF3DE",text:"#27500A"},
  "Довідки":  {bg:"#FAEEDA",text:"#633806"},
  "Звіти":    {bg:"#EEEDFE",text:"#3C3489"},
};

const FIELD_TYPES = [
  {v:"text",   l:"Текст"},
  {v:"number", l:"Число"},
  {v:"date",   l:"Дата"},
];

const DEFAULT_CUSTOM_FIELD = {id:"",label:"",type:"text",ph:"",req:true};
const DEFAULT_FIELD = () => ({...DEFAULT_CUSTOM_FIELD});

/* ─── STRING FORMAT EDITOR ─── */
function StringFormatEditor({value, fields, onChange}) {
  const varPattern = /\{(\w+)\}/g;
  const parts = [];
  let last = 0, m;
  const re = new RegExp(varPattern.source,"g");
  while((m=re.exec(value))!==null){
    if(m.index>last) parts.push({text:value.slice(last,m.index),type:"text"});
    const known = fields.find(f=>f.id===m[1]);
    parts.push({text:m[0],type:"var",known:!!known,id:m[1]});
    last=re.lastIndex;
  }
  if(last<value.length) parts.push({text:value.slice(last),type:"text"});

  return (
    <div>
      <div style={{
        background:"#f9f8f5",borderRadius:T.rMd,border:"1px solid rgba(0,0,0,0.1)",
        padding:"10px 12px",marginBottom:10,minHeight:60,
        fontSize:12,lineHeight:1.6,fontFamily:"monospace",
        wordBreak:"break-all",
      }}>
        {parts.map((p,i)=>
          p.type==="text"
          ? <span key={i}>{p.text}</span>
          : <span key={i} style={{
              background: p.known?"#D1FAE5":"#FEE2E2",
              color: p.known?"#065F46":"#991B1B",
              borderRadius:4,padding:"1px 4px",fontWeight:600,
            }}>{p.text}</span>
        )}
        {parts.length===0 && <span style={{color:"#aaa"}}>Введіть шаблон нижче…</span>}
      </div>
      <textarea
        value={value}
        onChange={e=>onChange(e.target.value)}
        rows={7}
        style={{
          width:"100%",boxSizing:"border-box",
          padding:"10px 12px",fontSize:13,
          border:"1.5px solid rgba(0,0,0,0.18)",borderRadius:T.rMd,
          fontFamily:"monospace",lineHeight:1.65,resize:"vertical",
          background:"#ffffff",color:T.text,outline:"none",
        }}
        placeholder={"ЗАЯВА\n\nПрошу надати мені, {fullName}, {position},\nвідпустку з {startDate} по {endDate}.\n\nПідпис: ________________"}
      />
      <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>
        <span style={{fontSize:11,color:T.textHint,marginRight:4}}>Вставити поле:</span>
        {fields.filter(f=>f.id).map(f=>(
          <button key={f.id} onClick={()=>onChange(value+`{${f.id}}`)} style={{
            padding:"3px 10px",fontSize:11,fontWeight:600,cursor:"pointer",
            border:"1px solid #065F46",borderRadius:T.rMd,
            background:"#D1FAE5",color:"#065F46",
          }}>{`{${f.id}}`}</button>
        ))}
        {fields.filter(f=>f.id).length===0 &&
          <span style={{fontSize:11,color:T.textHint,fontStyle:"italic"}}>Спочатку додайте поля</span>}
      </div>
    </div>
  );
}

/* ─── CREATE TEMPLATE MODAL ─── */
function CreateTemplateModal({open,onClose,onSave}) {
  const emptyCat = "Мої шаблони";
  const [name,setName]=useState("");
  const [cat,setCat]=useState(emptyCat);
  const [icon,setIcon]=useState("📝");
  const [desc,setDesc]=useState("");
  const [fields,setFields]=useState([{...DEFAULT_CUSTOM_FIELD}]);
  const [tmplStr,setTmplStr]=useState("");
  const [step,setStep]=useState(0);
  const [errs,setErrs]=useState({});

  const reset=()=>{setName("");setCat(emptyCat);setIcon("📝");setDesc("");setFields([{...DEFAULT_CUSTOM_FIELD}]);setTmplStr("");setStep(0);setErrs({});};

  const addField=()=>setFields(p=>[...p,{...DEFAULT_CUSTOM_FIELD}]);
  const updField=(i,k,v)=>setFields(p=>p.map((f,j)=>j===i?{...f,[k]:v}:f));
  const delField=(i)=>setFields(p=>p.filter((_,j)=>j!==i));

  const validateStep=()=>{
    const e={};
    if(step===0){
      if(!name.trim())e.name="Назва обов'язкова";
    }
    if(step===1){
      fields.forEach((f,i)=>{
        if(!f.id.trim())e[`fid${i}`]="ID обов'язковий";
        else if(!/^[a-zA-Z_]\w*$/.test(f.id))e[`fid${i}`]="Тільки латиниця без пробілів";
        if(!f.label.trim())e[`flbl${i}`]="Назва обов'язкова";
      });
    }
    if(step===2){
      if(!tmplStr.trim())e.tmpl="Шаблон рядка обов'язковий";
    }
    setErrs(e);
    return !Object.keys(e).length;
  };

  const next=()=>{ if(validateStep()) setStep(s=>s+1); };
  const back=()=>setStep(s=>s-1);

  const save=()=>{
    if(!validateStep()) return;
    const newTpl = {
      id: Date.now(),
      cat, icon, name, desc,
      fields: fields.map(f=>({...f,req:f.req===true||f.req==="true"})),
      build:(d)=>{
        let t=tmplStr;
        fields.forEach(f=>{ t=t.replaceAll(`{${f.id}}`,d[f.id]||(f.type==="date"?"__.__.____":f.type==="number"?"__":"["+f.label+"]")); });
        return t;
      },
      _tmplStr: tmplStr,
    };
    onSave(newTpl);
    reset();
    onClose();
  };

  const icons=["📝","✍","📋","🗂️","📊","📄","📑","🖊","📃","📌","🔖","📎"];
  const CATS_EXT = ["Мої шаблони","Заяви","Договори","Довідки","Звіти"];
  const stepLabels=["Інформація","Поля","Шаблон рядка"];

  return (
    <Modal open={open} onClose={()=>{reset();onClose();}} title="" width={600}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <span style={{fontSize:17,fontWeight:700,color:T.text}}>Новий шаблон</span>
        <button onClick={()=>{reset();onClose();}} style={{
          background:"#f5f4f0",border:"1px solid rgba(0,0,0,0.1)",
          borderRadius:T.rMd,width:32,height:32,cursor:"pointer",
          fontSize:18,color:"#5f5e5a",
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>×</button>
      </div>

      <div style={{display:"flex",gap:0,marginBottom:24,borderRadius:T.rMd,overflow:"hidden",border:"1px solid rgba(0,0,0,0.12)"}}>
        {stepLabels.map((l,i)=>(
          <div key={i} style={{
            flex:1,textAlign:"center",padding:"8px 4px",fontSize:12,fontWeight:i===step?700:400,
            background:i===step?T.blue600:i<step?"#E6F1FB":"#f7f7f5",
            color:i===step?"#fff":i<step?T.blue800:T.textHint,
            borderRight:i<2?"1px solid rgba(0,0,0,0.1)":undefined,
          }}>{i<step?"✓ ":""}{l}</div>
        ))}
      </div>

      {step===0&&(
        <div style={{display:"grid",gap:16}}>
          <div>
            <label style={lbl}>Назва шаблону *</label>
            <input value={name} onChange={e=>{setName(e.target.value);setErrs(p=>({...p,name:null}));}}
              placeholder="Заява на відрядження"
              style={{...sel,border:`1.5px solid ${errs.name?"#dc2626":"rgba(0,0,0,0.18)"}`}}/>
            {errs.name&&<p style={{margin:"4px 0 0",fontSize:11,color:"#dc2626"}}>{errs.name}</p>}
          </div>
          <div>
            <label style={lbl}>Опис</label>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Короткий опис шаблону" style={sel}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <label style={lbl}>Категорія</label>
              <select value={cat} onChange={e=>setCat(e.target.value)} style={sel}>
                {CATS_EXT.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Іконка</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:2}}>
                {icons.map(ic=>(
                  <button key={ic} onClick={()=>setIcon(ic)} style={{
                    width:34,height:34,fontSize:18,cursor:"pointer",
                    border:`2px solid ${ic===icon?T.blue600:"rgba(0,0,0,0.1)"}`,
                    borderRadius:T.rMd,background:ic===icon?T.blue50:"#fff",
                  }}>{ic}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step===1&&(
        <div>
          <p style={{fontSize:12,color:T.textSub,margin:"0 0 14px",lineHeight:1.6}}>
            Визначте поля, які заповнюватиме користувач. <b>ID поля</b> — латиниця без пробілів (наприклад: <code>fullName</code>), він буде використовуватись у шаблоні рядка як <code>{"{"+"fullName"+"}"}</code>.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {fields.map((f,i)=>(
              <div key={i} style={{
                background:"#f9f8f5",borderRadius:T.rMd,
                border:"1px solid rgba(0,0,0,0.09)",padding:"12px 14px",
              }}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 90px",gap:8,marginBottom:8}}>
                  <div>
                    <label style={{...lbl,marginBottom:4}}>ID поля</label>
                    <input value={f.id} onChange={e=>updField(i,"id",e.target.value.replace(/\s/g,""))}
                      placeholder="fullName"
                      style={{...sel,fontSize:12,padding:"6px 8px",
                        border:`1.5px solid ${errs[`fid${i}`]?"#dc2626":"rgba(0,0,0,0.15)"}`}}/>
                    {errs[`fid${i}`]&&<p style={{margin:"3px 0 0",fontSize:10,color:"#dc2626"}}>{errs[`fid${i}`]}</p>}
                  </div>
                  <div>
                    <label style={{...lbl,marginBottom:4}}>Назва поля</label>
                    <input value={f.label} onChange={e=>updField(i,"label",e.target.value)}
                      placeholder="Повне ім'я"
                      style={{...sel,fontSize:12,padding:"6px 8px",
                        border:`1.5px solid ${errs[`flbl${i}`]?"#dc2626":"rgba(0,0,0,0.15)"}`}}/>
                    {errs[`flbl${i}`]&&<p style={{margin:"3px 0 0",fontSize:10,color:"#dc2626"}}>{errs[`flbl${i}`]}</p>}
                  </div>
                  <div>
                    <label style={{...lbl,marginBottom:4}}>Тип</label>
                    <select value={f.type} onChange={e=>updField(i,"type",e.target.value)} style={{...sel,fontSize:12,padding:"6px 8px"}}>
                      {FIELD_TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"center"}}>
                  <div>
                    <input value={f.ph} onChange={e=>updField(i,"ph",e.target.value)}
                      placeholder="Підказка (placeholder)"
                      style={{...sel,fontSize:12,padding:"5px 8px"}}/>
                  </div>
                  <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:T.textSub,cursor:"pointer",whiteSpace:"nowrap"}}>
                    <input type="checkbox" checked={f.req} onChange={e=>updField(i,"req",e.target.checked)} style={{accentColor:T.blue600}}/>
                    Обов'язкове
                  </label>
                  {fields.length>1&&(
                    <button onClick={()=>delField(i)} style={{
                      width:28,height:28,borderRadius:T.rMd,cursor:"pointer",
                      border:"1px solid #dc2626",background:"#FEF2F2",color:"#dc2626",fontSize:16,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Btn variant="subtle" sm onClick={addField}>+ Додати поле</Btn>
        </div>
      )}

      {step===2&&(
        <div>
          <p style={{fontSize:12,color:T.textSub,margin:"0 0 12px",lineHeight:1.6}}>
            Напишіть текст документу. Використовуйте <code style={{background:"#D1FAE5",color:"#065F46",padding:"1px 5px",borderRadius:4}}>{"{"+"fieldId"+"}"}</code> для підстановки значень з полів.
          </p>
          <StringFormatEditor value={tmplStr} fields={fields} onChange={v=>{setTmplStr(v);setErrs(p=>({...p,tmpl:null}));}}/>
          {errs.tmpl&&<p style={{margin:"6px 0 0",fontSize:11,color:"#dc2626"}}>{errs.tmpl}</p>}
        </div>
      )}

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:24,paddingTop:16,borderTop:"1px solid rgba(0,0,0,0.07)"}}>
        {step>0&&<Btn onClick={back}>← Назад</Btn>}
        <Btn onClick={()=>{reset();onClose();}}>Скасувати</Btn>
        {step<2
          ? <Btn variant="primary" onClick={next}>Далі →</Btn>
          : <Btn variant="primary" onClick={save}>💾 Зберегти шаблон</Btn>
        }
      </div>
    </Modal>
  );
}

const TEMPLATES = [
  {
    id:1,cat:"Заяви",icon:"✍",
    name:"Заява про відпустку",
    desc:"Щорічна оплачувана відпустка",
    fields:[
      {id:"fullName",label:"ПІБ заявника",      type:"text",  ph:"Іваненко Іван Іванович",   req:true},
      {id:"position",label:"Посада",             type:"text",  ph:"Старший розробник",         req:true},
      {id:"startDate",label:"Початок відпустки", type:"date",                                  req:true},
      {id:"endDate",  label:"Кінець відпустки",  type:"date",                                  req:true},
      {id:"days",     label:"Кількість днів",    type:"number",ph:"14",                        req:true},
    ],
    build:(d)=>`ЗАЯВА\n\nПрошу надати мені, ${d.fullName||"[ПІБ]"}, ${d.position||"[посада]"},\nщорічну оплачувану відпустку тривалістю ${d.days||"__"} календарних\nднів з ${d.startDate||"__.__.____"} по ${d.endDate||"__.__.____"}.\n\n${new Date().toLocaleDateString("uk-UA")} р.\n\nПідпис: ________________`,
    _tmplStr: "ЗАЯВА\n\nПрошу надати мені, {fullName}, {position},\nщорічну оплачувану відпустку тривалістю {days} календарних\nднів з {startDate} по {endDate}.\n\nПідпис: ________________",
  },
  {
    id:2,cat:"Договори",icon:"📋",
    name:"Договір надання послуг",
    desc:"Між виконавцем та замовником",
    fields:[
      {id:"executor",label:"ПІБ виконавця",type:"text",  ph:"Петренко Петро Петрович",    req:true},
      {id:"client",  label:"ПІБ замовника",type:"text",  ph:"Сидоренко Сидір Сидорович",  req:true},
      {id:"service", label:"Опис послуги", type:"text",  ph:"Розробка веб-сайту",          req:true},
      {id:"amount",  label:"Сума (грн)",   type:"number",ph:"15000",                       req:true},
      {id:"date",    label:"Дата договору",type:"date",                                    req:true},
    ],
    build:(d)=>`ДОГОВІР НАДАННЯ ПОСЛУГ\n\nм. Київ, ${d.date||"__.__.____"}\n\n${d.executor||"[Виконавець]"} (Виконавець) та\n${d.client||"[Замовник]"} (Замовник) уклали цей договір:\n\n1. Виконавець надає послугу: ${d.service||"[опис]"}.\n2. Вартість послуг: ${d.amount||"__"} грн.\n3. Договір набирає чинності з моменту підписання.\n\nВиконавець: ________________\nЗамовник:   ________________`,
    _tmplStr: "ДОГОВІР НАДАННЯ ПОСЛУГ\n\nм. Київ, {date}\n\n{executor} (Виконавець) та\n{client} (Замовник) уклали цей договір:\n\n1. Виконавець надає послугу: {service}.\n2. Вартість послуг: {amount} грн.\n3. Договір набирає чинності з моменту підписання.\n\nВиконавець: ________________\nЗамовник:   ________________",
  },
  {
    id:3,cat:"Довідки",icon:"🗂️",
    name:"Довідка з місця роботи",
    desc:"Для пред'явлення за місцем вимоги",
    fields:[
      {id:"org",     label:"Назва організації",type:"text",  ph:"ТОВ Технологія",            req:true},
      {id:"employee",label:"ПІБ працівника",   type:"text",  ph:"Коваленко Ольга Василівна", req:true},
      {id:"empPos",  label:"Посада",            type:"text",  ph:"Бухгалтер",                 req:true},
      {id:"salary",  label:"Зарплата (грн)",   type:"number",ph:"25000",                     req:false},
      {id:"issDate", label:"Дата видачі",       type:"date",                                  req:true},
    ],
    build:(d)=>`ДОВІДКА\n\nВидана ${d.employee||"[ПІБ]"} в тому, що вона/він дійсно\nпрацює в ${d.org||"[організація]"} на посаді ${d.empPos||"[посада]"}${d.salary?`\nіз середньомісячною зарплатою ${d.salary} грн`:""}.\n\nДовідка видана ${d.issDate||"__.__.____"} р. для пред'явлення\nза місцем вимоги.\n\nДиректор: ________________     М.П.`,
    _tmplStr: "ДОВІДКА\n\nВидана {employee} в тому, що вона/він дійсно\nпрацює в {org} на посаді {empPos}\nіз середньомісячною зарплатою {salary} грн.\n\nДовідка видана {issDate} р. для пред'явлення\nза місцем вимоги.\n\nДиректор: ________________     М.П.",
  },
  {
    id:4,cat:"Звіти",icon:"📊",
    name:"Звіт про виконану роботу",
    desc:"Результати діяльності за період",
    fields:[
      {id:"author", label:"ПІБ автора",       type:"text",ph:"Мельник Андрій Юрійович",  req:true},
      {id:"period", label:"Звітний період",    type:"text",ph:"Квітень 2025",             req:true},
      {id:"tasks",  label:"Виконані завдання", type:"text",ph:"Розробка модулів A, B, C", req:true},
      {id:"results",label:"Результати",        type:"text",ph:"Виконано 100% плану",      req:true},
      {id:"repDate",label:"Дата звіту",        type:"date",                              req:true},
    ],
    build:(d)=>`ЗВІТ ПРО ВИКОНАНУ РОБОТУ\n\nАвтор:  ${d.author||"[ПІБ]"}\nПеріод: ${d.period||"[період]"}\nДата:   ${d.repDate||"__.__.____"}\n\n1. ВИКОНАНІ ЗАВДАННЯ:\n   ${d.tasks||"[перелік завдань]"}\n\n2. РЕЗУЛЬТАТИ:\n   ${d.results||"[результати]"}\n\nПідпис: ________________`,
    _tmplStr: "ЗВІТ ПРО ВИКОНАНУ РОБОТУ\n\nАвтор:  {author}\nПеріод: {period}\nДата:   {repDate}\n\n1. ВИКОНАНІ ЗАВДАННЯ:\n   {tasks}\n\n2. РЕЗУЛЬТАТИ:\n   {results}\n\nПідпис: ________________",
  },
];

const FONTS  = ["Times New Roman","Arial","Georgia","Courier New","Verdana"];
const FSIZES = [10,11,12,14,16,18,20,22];
const ALIGNS = [{v:"left",l:"Ліво"},{v:"center",l:"Центр"},{v:"right",l:"Право"},{v:"justify",l:"Ширина"}];
const LINEHS = [{v:1.0,l:"1.0"},{v:1.2,l:"1.2"},{v:1.5,l:"1.5"},{v:1.8,l:"1.8"},{v:2,l:"2.0"}];

const DEFAULT_FMT = {
  font:"Times New Roman",size:14,align:"justify",
  lineH:1.5,mTop:24,mBottom:24,mLeft:28,mRight:18,
};

/* ─── MODAL ─── */
function Modal({open,onClose,title,width=500,children}) {
  if(!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed",inset:0,zIndex:2000,
        background:"rgba(10,10,8,0.55)",
        display:"flex",alignItems:"center",justifyContent:"center",
        padding:"1rem",
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:"#ffffff",
          borderRadius:T.rXl,
          border:"1px solid rgba(0,0,0,0.1)",
          boxShadow:"0 24px 64px rgba(0,0,0,0.22),0 4px 16px rgba(0,0,0,0.1)",
          width:"100%",maxWidth:width,
          maxHeight:"88vh",overflowY:"auto",
          padding:"28px",
        }}
      >
        {title&&(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
            <span style={{fontSize:17,fontWeight:600,color:"#1a1916"}}>{title}</span>
            <button onClick={onClose} style={{
              background:"#f5f4f0",border:"1px solid rgba(0,0,0,0.1)",
              borderRadius:T.rMd,width:32,height:32,cursor:"pointer",
              fontSize:18,color:"#5f5e5a",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ─── BUTTON ─── */
function Btn({onClick,children,variant="ghost",disabled,fullW,sm}) {
  const pad=sm?"6px 14px":"10px 20px";
  const fs=sm?12:14;
  const vs={
    primary:{background:T.blue600,color:"#fff",       border:`1px solid ${T.blue600}`},
    ghost:  {background:"#ffffff", color:T.text,       border:`1px solid rgba(0,0,0,0.18)`},
    subtle: {background:T.surfaceSub,color:T.text,     border:`1px solid ${T.border}`},
    danger: {background:"#dc2626",color:"#fff",        border:"1px solid #dc2626"},
  };
  return (
    <button onClick={disabled?undefined:onClick} style={{
      padding:pad,fontSize:fs,fontWeight:500,
      cursor:disabled?"not-allowed":"pointer",
      borderRadius:T.rMd,opacity:disabled?0.45:1,
      width:fullW?"100%":undefined,
      display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,
      ...vs[variant],
    }}>{children}</button>
  );
}

/* ─── BADGE ─── */
function Badge({cat}) {
  const c=CAT_COLORS[cat]||{bg:T.surfaceSub,text:T.textSub};
  return (
    <span style={{
      fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
      background:c.bg,color:c.text,padding:"3px 10px",borderRadius:T.rMd,
    }}>{cat}</span>
  );
}

/* ─── TOGGLE GROUP ─── */
function ToggleGroup({opts,value,onChange}) {
  return (
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {opts.map(o=>{
        const v=o.v??o,l=o.l??o,active=v===value;
        return (
          <button key={v} onClick={()=>onChange(v)} style={{
            padding:"6px 13px",fontSize:12,fontWeight:active?600:400,cursor:"pointer",
            border:`1px solid ${active?T.blue600:"rgba(0,0,0,0.15)"}`,
            borderRadius:T.rMd,
            background:active?T.blue50:"#ffffff",
            color:active?T.blue800:T.textSub,
          }}>{l}</button>
        );
      })}
    </div>
  );
}

/* ─── FIELD ─── */
function FieldInput({f,value,error,onChange}) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{
        display:"block",fontSize:11,fontWeight:700,
        color:T.textSub,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5,
      }}>
        {f.label}{f.req&&<span style={{color:"#dc2626",marginLeft:3}}>*</span>}
      </label>
      <input
        type={f.type} value={value||""} placeholder={f.ph||""}
        onChange={e=>onChange(f.id,e.target.value)}
        style={{
          width:"100%",boxSizing:"border-box",
          padding:"9px 12px",fontSize:14,
          border:`1.5px solid ${error?"#dc2626":"rgba(0,0,0,0.18)"}`,
          borderRadius:T.rMd,
          background:error?"#FEF2F2":"#ffffff",
          color:T.text,outline:"none",
        }}
      />
      {error&&<p style={{margin:"4px 0 0",fontSize:11,color:"#dc2626"}}>{error}</p>}
    </div>
  );
}

/* ─── DOC PREVIEW ─── */
function DocPreview({text,fmt}) {
  return (
    <div style={{
      background:"#ffffff",
      boxShadow:"0 2px 8px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.05)",
      border:"1px solid rgba(0,0,0,0.06)",
      borderRadius:6,
      padding:`${fmt.mTop}px ${fmt.mRight}px ${fmt.mBottom}px ${fmt.mLeft}px`,
      fontSize:fmt.size,fontFamily:fmt.font,
      textAlign:fmt.align,lineHeight:fmt.lineH,
      whiteSpace:"pre-wrap",color:"#111111",
      minHeight:320,
    }}>{text}</div>
  );
}

/* ─── RICH DOC PREVIEW (line-based) ─── */
function RichDocPreview({lines, fmt}) {
  return (
    <div style={{
      background:"#ffffff",
      boxShadow:"0 2px 8px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.05)",
      border:"1px solid rgba(0,0,0,0.06)",
      borderRadius:6,
      padding:`${fmt.mTop}px ${fmt.mRight}px ${fmt.mBottom}px ${fmt.mLeft}px`,
      fontFamily:fmt.font,
      lineHeight:fmt.lineH,
      color:"#111111",
      minHeight:320,
    }}>
      {lines.map((ln,i)=>(
        <div key={ln.id} style={{
          textAlign:ln.align||fmt.align,
          fontSize:ln.size||fmt.size,
          fontWeight:ln.bold?"700":"400",
          fontStyle:ln.italic?"italic":"normal",
          marginBottom: ln.text===""?`${fmt.lineH*0.6}em`:undefined,
          whiteSpace:"pre-wrap",
          minHeight:ln.text===""?"1em":undefined,
        }}>{ln.text||"\u00a0"}</div>
      ))}
    </div>
  );
}

/* ─── STEPPER ─── */
function Stepper({step}) {
  const steps=["Шаблони","Редактор","Перегляд"];
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      {steps.map((s,i)=>(
        <span key={s} style={{display:"flex",alignItems:"center",gap:6}}>
          {i>0&&<span style={{color:T.textHint,fontSize:12}}>›</span>}
          <span style={{
            fontSize:13,fontWeight:i===step?600:400,
            color:i===step?T.blue800:i<step?T.textSub:T.textHint,
          }}>{s}</span>
        </span>
      ))}
    </div>
  );
}

/* ─── SECTION LABEL ─── */
const SL = ({children}) => (
  <p style={{
    margin:"0 0 16px",fontSize:11,fontWeight:700,
    color:T.textSub,textTransform:"uppercase",letterSpacing:"0.06em",
  }}>{children}</p>
);

const lbl = {
  display:"block",fontSize:11,fontWeight:700,
  color:"#5f5e5a",textTransform:"uppercase",
  letterSpacing:"0.06em",marginBottom:7,
};
const sel = {
  width:"100%",padding:"8px 10px",fontSize:13,
  border:"1px solid rgba(0,0,0,0.15)",borderRadius:"8px",
  background:"#ffffff",color:"#1a1916",
  outline:"none",boxSizing:"border-box",
};

/* ─── STORAGE ─── */
const STORAGE_KEY = "formdoc_templates";

function rebuildBuild(tpl) {
  // After JSON.parse, functions are lost — rebuild build() from _tmplStr
  if (tpl._tmplStr && typeof tpl.build !== "function") {
    const tmplStr = tpl._tmplStr;
    const fields = tpl.fields || [];
    tpl.build = (d) => {
      let t = tmplStr;
      fields.forEach(f => {
        t = t.replaceAll(`{${f.id}}`, d[f.id] || (f.type==="date" ? "__.__.____" : f.type==="number" ? "__" : "["+f.label+"]"));
      });
      return t;
    };
  }
  return tpl;
}

function loadTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).map(rebuildBuild) : [];
  } catch { return []; }
}

function saveTemplates(tpls) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tpls));
  } catch {}
}

/* ════════════════════════════════════
   PAGE 1 · HOME
════════════════════════════════════ */
function HomePage({onOpen}) {
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("Всі");
  const [preview,setPreview]=useState(null);
  const [createOpen,setCreateOpen]=useState(false);
  const [customTpls,setCustomTpls]=useState([]);

  useEffect(() => {
    const saved = loadTemplates();
    if (saved.length > 0) {
      setCustomTpls(saved);
    }
  }, []);

  const allTpls=[...TEMPLATES,...customTpls];
  const cats=["Всі",...Array.from(new Set(allTpls.map(t=>t.cat)))];
  const list=allTpls.filter(t=>{
    const mc=cat==="Всі"||t.cat===cat;
    const ms=t.name.toLowerCase().includes(search.toLowerCase())||t.desc.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });

  const handleSaveTemplate = (tpl) => {
    const updated = [...customTpls, tpl];
    setCustomTpls(updated);
    saveTemplates(updated);
  };

  return (
    <div style={{maxWidth:940,margin:"0 auto",padding:"2.5rem 1.5rem"}}>
      <div style={{marginBottom:"2rem",display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{margin:"0 0 6px",fontSize:30,fontWeight:700,color:T.text,letterSpacing:"-0.02em"}}>
            Шаблони документів
          </h1>
          <p style={{margin:0,fontSize:15,color:T.textSub}}>
            Виберіть шаблон, заповніть поля та завантажте готовий документ
          </p>
        </div>
        <Btn variant="primary" onClick={()=>setCreateOpen(true)}>+ Новий шаблон</Btn>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:"1.5rem",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:1,minWidth:220}}>
          <span style={{
            position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
            color:T.textHint,fontSize:15,pointerEvents:"none",userSelect:"none",
          }}>⌕</span>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Пошук шаблону..."
            style={{
              width:"100%",boxSizing:"border-box",
              padding:"9px 12px 9px 36px",fontSize:14,
              border:"1.5px solid rgba(0,0,0,0.18)",borderRadius:T.rMd,
              background:"#ffffff",color:T.text,outline:"none",
            }}
          />
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {cats.map(c=>{
            const active=c===cat;
            return (
              <button key={c} onClick={()=>setCat(c)} style={{
                padding:"8px 16px",fontSize:13,cursor:"pointer",
                border:`1.5px solid ${active?T.blue600:"rgba(0,0,0,0.15)"}`,
                borderRadius:T.rMd,fontWeight:active?600:400,
                background:active?T.blue50:"#ffffff",
                color:active?T.blue800:T.textSub,
              }}>{c}</button>
            );
          })}
        </div>
      </div>

      {list.length===0
        ? <div style={{textAlign:"center",padding:"4rem",color:T.textHint,fontSize:15}}>Нічого не знайдено</div>
        : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:16}}>
            {list.map(t=>(
              <div key={t.id} style={{
                background:"#ffffff",border:"1px solid rgba(0,0,0,0.09)",
                borderRadius:T.rXl,padding:"20px 20px 18px",
                display:"flex",flexDirection:"column",gap:14,
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <Badge cat={t.cat}/>
                  <span style={{fontSize:22,lineHeight:1}}>{t.icon}</span>
                </div>
                <div style={{flex:1}}>
                  <p style={{margin:"0 0 4px",fontWeight:600,fontSize:15,color:T.text}}>{t.name}</p>
                  <p style={{margin:0,fontSize:13,color:T.textSub}}>{t.desc}</p>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={()=>setPreview(t)} sm>Переглянути</Btn>
                  <Btn variant="primary" onClick={()=>onOpen(t)} sm>Відкрити →</Btn>
                </div>
              </div>
            ))}
          </div>
        )
      }

      <CreateTemplateModal
        open={createOpen}
        onClose={()=>setCreateOpen(false)}
        onSave={handleSaveTemplate}
      />

      <Modal open={!!preview} onClose={()=>setPreview(null)} title={preview?.name||""} width={560}>
        {preview&&(
          <>
            <p style={{margin:"0 0 14px",fontSize:13,color:T.textSub}}>{preview.desc}</p>
            <div style={{
              background:"#f9f8f5",border:"1px solid rgba(0,0,0,0.08)",
              borderRadius:T.rMd,padding:"16px 18px",
              fontFamily:"Georgia,serif",fontSize:13,lineHeight:1.75,
              whiteSpace:"pre-wrap",color:"#111",
              maxHeight:260,overflowY:"auto",marginBottom:18,
            }}>{preview.build({})}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:T.textHint}}>{preview.fields.length} полів для заповнення</span>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>setPreview(null)} sm>Закрити</Btn>
                <Btn variant="primary" sm onClick={()=>{setPreview(null);onOpen(preview);}}>Відкрити →</Btn>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

/* ════════════════════════════════════
   PAGE 2 · EDITOR
════════════════════════════════════ */

function makeLineId(){ return Math.random().toString(36).slice(2,8); }

/* ─── ADD FIELD MODAL ─── */
function AddFieldModal({open,onClose,onAdd}) {
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

/* ─── RICH TEXT EDITOR ─── */
function RichTextEditor({ lines, fields, globalFmt, onLinesChange, onAddField }) {
  const [selectedLineIndex, setSelectedLineIndex] = useState(0);
  const [showAddField, setShowAddField] = useState(false);

  const selectedLine = lines[selectedLineIndex] || lines[0];

  const handleTextChange = (newText) => {
    const newLines = [...lines];
    newLines[selectedLineIndex] = {
      ...newLines[selectedLineIndex],
      text: newText
    };
    onLinesChange(newLines);
  };

  const handleLineStyleChange = (patch) => {
    const newLines = [...lines];
    newLines[selectedLineIndex] = {
      ...newLines[selectedLineIndex],
      ...patch
    };
    onLinesChange(newLines);
  };

  const addNewLineAfter = (index) => {
    const newLine = {
      id: makeLineId(),
      text: "",
      align: "justify",
      bold: false,
      italic: false,
      size: null,
    };
    const newLines = [...lines];
    newLines.splice(index + 1, 0, newLine);
    onLinesChange(newLines);
    setSelectedLineIndex(index + 1);
  };

  const deleteLine = (index) => {
    if (lines.length <= 1) return;
    const newLines = lines.filter((_, i) => i !== index);
    onLinesChange(newLines);
    setSelectedLineIndex(Math.min(index, newLines.length - 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      addNewLineAfter(selectedLineIndex);
    } else if (e.key === "ArrowUp" && e.altKey) {
      e.preventDefault();
      setSelectedLineIndex(Math.max(0, selectedLineIndex - 1));
    } else if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault();
      setSelectedLineIndex(Math.min(lines.length - 1, selectedLineIndex + 1));
    }
  };

  const insertField = (fieldId) => {
    const newText = selectedLine.text + `{${fieldId}}`;
    handleTextChange(newText);
  };

  const ALIGN_ICONS = {
    left: "⬅",
    center: "↔",
    right: "➡",
    justify: "☰",
  };

  return (
    <div style={{
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
        padding: "10px 16px",
        background: "#f7f7f5",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: 3 }}>
          {["left", "center", "right", "justify"].map(a => (
            <button
              key={a}
              onClick={() => handleLineStyleChange({ align: a })}
              title={a === "left" ? "Ліво" : a === "center" ? "Центр" : a === "right" ? "Право" : "Ширина"}
              style={{
                width: 32, height: 32, fontSize: 14, cursor: "pointer",
                border: `1.5px solid ${selectedLine.align === a ? T.blue600 : "rgba(0,0,0,0.12)"}`,
                borderRadius: T.rMd,
                background: selectedLine.align === a ? T.blue50 : "#ffffff",
                color: selectedLine.align === a ? T.blue800 : T.textSub,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >{ALIGN_ICONS[a]}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: "rgba(0,0,0,0.1)" }} />

        <button
          onClick={() => handleLineStyleChange({ bold: !selectedLine.bold })}
          title="Жирний"
          style={{
            width: 32, height: 32, fontSize: 14, fontWeight: 700, cursor: "pointer",
            border: `1.5px solid ${selectedLine.bold ? T.blue600 : "rgba(0,0,0,0.12)"}`,
            borderRadius: T.rMd,
            background: selectedLine.bold ? T.blue50 : "#ffffff",
            color: selectedLine.bold ? T.blue800 : T.textSub,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
        >B</button>

        <button
          onClick={() => handleLineStyleChange({ italic: !selectedLine.italic })}
          title="Курсив"
          style={{
            width: 32, height: 32, fontSize: 14, fontStyle: "italic", fontWeight: 700, cursor: "pointer",
            border: `1.5px solid ${selectedLine.italic ? T.blue600 : "rgba(0,0,0,0.12)"}`,
            borderRadius: T.rMd,
            background: selectedLine.italic ? T.blue50 : "#ffffff",
            color: selectedLine.italic ? T.blue800 : T.textSub,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
        >I</button>

        <div style={{ width: 1, height: 24, background: "rgba(0,0,0,0.1)" }} />

        <select
          value={selectedLine.size || ""}
          onChange={e => handleLineStyleChange({ size: e.target.value ? +e.target.value : null })}
          style={{
            padding: "4px 8px", fontSize: 12,
            border: "1px solid rgba(0,0,0,0.15)", borderRadius: T.rMd,
            background: "#ffffff", color: T.textSub, cursor: "pointer",
          }}
        >
          <option value="">Авто ({globalFmt.size}pt)</option>
          {FSIZES.map(s => <option key={s} value={s}>{s} pt</option>)}
        </select>

        <div style={{ width: 1, height: 24, background: "rgba(0,0,0,0.1)" }} />

        <button
          onClick={() => addNewLineAfter(selectedLineIndex)}
          title="Додати рядок після"
          style={{
            padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${T.blue600}`, borderRadius: T.rMd,
            background: T.blue50, color: T.blue800,
            display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
          }}
        >+ Рядок</button>

        {lines.length > 1 && (
          <button
            onClick={() => deleteLine(selectedLineIndex)}
            title="Видалити поточний рядок"
            style={{
              padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: "1px solid rgba(220,38,38,0.3)", borderRadius: T.rMd,
              background: "#FEF2F2", color: "#dc2626",
              display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
            }}
          >× Видалити</button>
        )}

        <div style={{ flex: 1 }} />

        <span style={{
          fontSize: 11, color: T.textHint, background: "#ffffff",
          padding: "4px 10px", borderRadius: T.rMd,
          border: "1px solid rgba(0,0,0,0.1)",
        }}>
          Рядок {selectedLineIndex + 1} з {lines.length}
        </span>
      </div>

      {/* Текстовий блок */}
      <div style={{
        padding: `${globalFmt.mTop}px ${globalFmt.mRight}px ${globalFmt.mBottom}px ${globalFmt.mLeft}px`,
        fontFamily: globalFmt.font,
        lineHeight: globalFmt.lineH,
        minHeight: 400,
        background: "#fafaf8",
        position: "relative",
      }}>
        {lines.map((line, index) => (
          <div
            key={line.id}
            onClick={() => setSelectedLineIndex(index)}
            style={{
              position: "relative",
              cursor: "text",
              padding: "2px 4px",
              marginBottom: "2px",
              borderRadius: 4,
              border: index === selectedLineIndex
                ? "2px solid rgba(125,24,165,0.4)"
                : "2px solid transparent",
              background: index === selectedLineIndex
                ? "rgba(125,24,165,0.05)"
                : "transparent",
              transition: "all 0.15s",
            }}
          >
            <span style={{
              position: "absolute",
              left: -30, top: "50%", transform: "translateY(-50%)",
              fontSize: 9,
              color: index === selectedLineIndex ? T.blue600 : T.textHint,
              fontWeight: index === selectedLineIndex ? 700 : 400,
              userSelect: "none",
              opacity: index === selectedLineIndex ? 1 : 0.4,
            }}>
              {index + 1}
            </span>

            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const text = e.currentTarget.innerText;
                handleTextChange(text);
              }}
              onKeyDown={handleKeyDown}
              style={{
                fontSize: line.size || globalFmt.size,
                fontWeight: line.bold ? 700 : 400,
                fontStyle: line.italic ? "italic" : "normal",
                textAlign: line.align || globalFmt.align,
                outline: "none",
                minHeight: "1em",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {line.text || "\u00A0"}
            </div>

            <div style={{
              position: "absolute",
              left: "50%", bottom: -10,
              transform: "translateX(-50%)",
              opacity: index === selectedLineIndex ? 1 : 0,
              transition: "opacity 0.15s",
              zIndex: 10,
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addNewLineAfter(index);
                }}
                style={{
                  padding: "1px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${T.blue600}`, borderRadius: T.rMd,
                  background: T.blue600, color: "#fff",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                }}
              >+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Вставка полів */}
      {fields.length > 0 && (
        <div style={{
          padding: "10px 16px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: "#f7f7f5",
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 11, color: T.textHint, fontWeight: 600 }}>
            Вставити поле:
          </span>
          {fields.filter(f => f.id).map(f => (
            <button
              key={f.id}
              onClick={() => insertField(f.id)}
              style={{
                padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: "1px solid #065F46", borderRadius: T.rMd,
                background: "#D1FAE5", color: "#065F46",
                transition: "all 0.15s",
              }}
            >{`{${f.id}}`}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowAddField(true)}
            style={{
              padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: "1px dashed rgba(0,0,0,0.2)", borderRadius: T.rMd,
              background: "transparent", color: T.textSub,
            }}
          >+ Нове поле</button>
        </div>
      )}

      {/* Гарячі клавіші */}
      <div style={{
        padding: "8px 16px",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        background: "#fafaf8",
        display: "flex", gap: 16, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 10, color: T.textHint }}>
          <kbd style={{
            padding: "1px 5px", background: "#e5e5e0", borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.15)", fontFamily: "monospace",
            fontSize: 10, fontWeight: 600,
          }}>Alt+↑↓</kbd> перехід між рядками
        </span>
        <span style={{ fontSize: 10, color: T.textHint }}>
          <kbd style={{
            padding: "1px 5px", background: "#e5e5e0", borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.15)", fontFamily: "monospace",
            fontSize: 10, fontWeight: 600,
          }}>Shift+Enter</kbd> новий рядок
        </span>
        <span style={{ fontSize: 10, color: T.textHint }}>
          <kbd style={{
            padding: "1px 5px", background: "#e5e5e0", borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.15)", fontFamily: "monospace",
            fontSize: 10, fontWeight: 600,
          }}>Клік</kbd> вибір рядка
        </span>
      </div>

      <AddFieldModal
        open={showAddField}
        onClose={() => setShowAddField(false)}
        onAdd={onAddField}
      />
    </div>
  );
}

/* Helper: convert tpl.build() string to lines array */
function tmplToLines(tpl) {
  const rawStr = tpl._tmplStr || tpl.build({});
  return rawStr.split("\n").map(t=>({
    id: makeLineId(),
    text: t,
    align: "justify",
    bold: false,
    italic: false,
    size: null,
  }));
}

/* Helper: substitute field values into line text */
function resolveLine(line, vals, fields) {
  return line.text.replace(/\{(\w+)\}/g, (_, id) => {
    const f = fields.find(f=>f.id===id);
    if(!f) return `{${id}}`;
    return vals[id]||(f.type==="date"?"__.__.____":f.type==="number"?"__":"["+f.label+"]");
  });
}

function EditorPage({tpl, onNext, onBack}) {
  const [vals, setVals] = useState({});
  const [errs, setErrs] = useState({});
  const [fmtOpen, setFmtOpen] = useState(false);
  const [fmt, setFmt] = useState(DEFAULT_FMT);
  const [lines, setLines] = useState(() => tmplToLines(tpl));
  const [templateFields, setTemplateFields] = useState(tpl.fields || []);
  const [addFieldOpen, setAddFieldOpen] = useState(false);

  const set = (id, v) => {
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

  const buildDoc = () => lines.map(l => resolveLine(l, vals, templateFields)).join("\n");

  const resolvedLines = lines.map(l => ({
    ...l,
    text: resolveLine(l, vals, templateFields),
  }));

  const handleNext = () => {
    if (validate()) {
      onNext(vals, fmt, buildDoc(), resolvedLines);
    }
  };

  const handleLinesChange = (newLines) => {
    setLines(newLines);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: "1.5rem", flexWrap: "wrap",
      }}>
        <button onClick={onBack} style={{
          background: "#ffffff", border: "1px solid rgba(0,0,0,0.18)",
          borderRadius: T.rMd, padding: "7px 14px", cursor: "pointer",
          fontSize: 13, color: T.textSub,
        }}>← Назад</button>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{tpl.icon}</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: T.text }}>{tpl.name}</span>
        <Badge cat={tpl.cat} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: 20,
        alignItems: "start",
      }}>
        {/* ЛІВА ПАНЕЛЬ: Поля */}
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
              onChange={set}
            />
          ))}

          <div style={{ marginTop: 4, marginBottom: 12 }}>
            <Btn
              variant="subtle"
              fullW
              onClick={() => setAddFieldOpen(true)}
            >
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

        {/* ПРАВА ПАНЕЛЬ: Редактор */}
        <div>
          <RichTextEditor
            lines={lines}
            fields={templateFields}
            globalFmt={fmt}
            onLinesChange={handleLinesChange}
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
            <RichDocPreview
              lines={resolvedLines}
              fmt={fmt}
            />
          </div>
        </div>
      </div>

      <AddFieldModal
        open={addFieldOpen}
        onClose={() => setAddFieldOpen(false)}
        onAdd={(field) => { setTemplateFields(prev => [...prev, field]); setAddFieldOpen(false); }}
      />

      <Modal open={fmtOpen} onClose={() => setFmtOpen(false)} title="Стиль тексту" width={540}>
        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <label style={lbl}>Шрифт</label>
            <select
              value={fmt.font}
              onChange={e => setFmt(p => ({ ...p, font: e.target.value }))}
              style={sel}
            >
              {FONTS.map(f => <option key={f}>{f}</option>)}
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
          <div>
            <label style={lbl}>Вирівнювання за замовчуванням</label>
            <ToggleGroup
              opts={ALIGNS}
              value={fmt.align}
              onChange={v => setFmt(p => ({ ...p, align: v }))}
            />
          </div>
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
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 8,
            paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.07)",
          }}>
            <Btn onClick={() => setFmtOpen(false)}>Скасувати</Btn>
            <Btn variant="primary" onClick={() => setFmtOpen(false)}>Застосувати</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ════════════════════════════════════
   PAGE 3 · EXPORT
════════════════════════════════════ */
function ExportPage({tpl, fmt, doc, lines, vals, onBack, onHome}) {
  const [modal, setModal] = useState(null);
  const [lastFmt, setLastFmt] = useState("");

  const openModal = (f) => { setLastFmt(f); setModal(f); };

  // ====== PDF Генерація ======
  const generatePDF = () => {
    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    // Додаємо підтримку кирилиці
    pdf.addFont("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf", "Roboto", "normal");
    pdf.setFont("Roboto");

    const margin = {
      top: fmt.mTop * 2.835,
      bottom: fmt.mBottom * 2.835,
      left: fmt.mLeft * 2.835,
      right: fmt.mRight * 2.835,
    };

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin.left - margin.right;

    pdf.setFontSize(fmt.size);

    const alignMap = {
      left: "left",
      center: "center",
      right: "right",
      justify: "justify",
    };

    // Якщо є lines (рядковий редактор), використовуємо їх
    // Якщо немає - розбиваємо doc на рядки
    let contentLines;

    if (lines && lines.length > 0) {
      // Використовуємо line-based дані з форматуванням
      contentLines = lines.map(line => ({
        text: line.text || " ",
        align: line.align || fmt.align,
        bold: line.bold || false,
        italic: line.italic || false,
        size: line.size || fmt.size,
      }));
    } else {
      // Звичайний текст
      const textLines = doc.split("\n");
      contentLines = textLines.map(text => ({
        text: text || " ",
        align: fmt.align,
        bold: false,
        italic: false,
        size: fmt.size,
      }));
    }

    const lineHeight = fmt.size * fmt.lineH;
    let y = margin.top;

    contentLines.forEach((line) => {
      if (y + lineHeight > pageHeight - margin.bottom) {
        pdf.addPage();
        y = margin.top;
      }

      // Встановлюємо стиль для рядка
      let fontStyle = "normal";
      if (line.bold && line.italic) fontStyle = "bolditalic";
      else if (line.bold) fontStyle = "bold";
      else if (line.italic) fontStyle = "italic";

      pdf.setFont("Roboto", fontStyle);
      pdf.setFontSize(line.size);

      pdf.text(line.text, margin.left, y, {
        align: alignMap[line.align] || "left",
        maxWidth: contentWidth,
      });

      y += lineHeight;
    });

    pdf.save(`${tpl.name}.pdf`);
    setModal("success");
  };

  // ====== DOCX Генерація ======
  const generateDOCX = async () => {
    const alignMap = {
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

    let contentLines;

    if (lines && lines.length > 0) {
      // Використовуємо line-based дані з форматуванням
      contentLines = lines.map(line => ({
        text: line.text || " ",
        align: line.align || fmt.align,
        bold: line.bold || false,
        italic: line.italic || false,
        size: line.size || fmt.size,
      }));
    } else {
      // Звичайний текст
      const textLines = doc.split("\n");
      contentLines = textLines.map(text => ({
        text: text || " ",
        align: fmt.align,
        bold: false,
        italic: false,
        size: fmt.size,
      }));
    }

    const paragraphs = contentLines.map(line => {
      const isEmpty = !line.text || line.text.trim() === "";

      return new Paragraph({
        children: isEmpty
          ? [new TextRun({ text: "", break: 0 })]
          : [
              new TextRun({
                text: line.text,
                size: line.size * 2, // docx використовує half-points
                font: fontMap[fmt.font] || "Times New Roman",
                bold: line.bold,
                italics: line.italic,
              }),
            ],
        alignment: alignMap[line.align] || AlignmentType.LEFT,
        spacing: {
          line: Math.round(240 * fmt.lineH),
          before: 0,
          after: 0,
        },
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
    a.download = `${tpl.name}.docx`;
    a.click();
    URL.revokeObjectURL(url);

    setModal("success");
  };

  const confirm = () => {
    if (lastFmt === "pdf") {
      generatePDF();
    } else if (lastFmt === "docx") {
      generateDOCX();
    }
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

/* ════════════════════════════════════
   APP SHELL
════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [tpl, setTpl] = useState(null);
  const [fmt, setFmt] = useState(DEFAULT_FMT);
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