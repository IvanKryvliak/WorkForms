import { useState } from "react";

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
  "Заяви":    {bg:"#E6F1FB",text:"#0C447C"},
  "Договори": {bg:"#EAF3DE",text:"#27500A"},
  "Довідки":  {bg:"#FAEEDA",text:"#633806"},
  "Звіти":    {bg:"#EEEDFE",text:"#3C3489"},
};

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

/* ════════════════════════════════════
   PAGE 1 · HOME
════════════════════════════════════ */
function HomePage({onOpen}) {
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("Всі");
  const [preview,setPreview]=useState(null);

  const cats=["Всі",...Array.from(new Set(TEMPLATES.map(t=>t.cat)))];
  const list=TEMPLATES.filter(t=>{
    const mc=cat==="Всі"||t.cat===cat;
    const ms=t.name.toLowerCase().includes(search.toLowerCase())||t.desc.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });

  return (
    <div style={{maxWidth:940,margin:"0 auto",padding:"2.5rem 1.5rem"}}>
      <div style={{marginBottom:"2rem"}}>
        <h1 style={{margin:"0 0 6px",fontSize:30,fontWeight:700,color:T.text,letterSpacing:"-0.02em"}}>
          Шаблони документів
        </h1>
        <p style={{margin:0,fontSize:15,color:T.textSub}}>
          Виберіть шаблон, заповніть поля та завантажте готовий документ
        </p>
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

      {/* MODAL 1 — Перегляд шаблону */}
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
function EditorPage({tpl,onNext,onBack}) {
  const [vals,setVals]=useState({});
  const [errs,setErrs]=useState({});
  const [fmtOpen,setFmtOpen]=useState(false);
  const [fmt,setFmt]=useState(DEFAULT_FMT);

  const set=(id,v)=>{setVals(p=>({...p,[id]:v}));setErrs(p=>({...p,[id]:null}));};

  const validate=()=>{
    const e={};
    tpl.fields.forEach(f=>{
      if(f.req&&!vals[f.id])e[f.id]="Обов'язкове поле";
      else if(f.type==="date"&&vals[f.id]&&isNaN(new Date(vals[f.id])))e[f.id]="Невірна дата";
      else if(f.type==="number"&&vals[f.id]&&(isNaN(+vals[f.id])||+vals[f.id]<0))e[f.id]="Введіть число";
    });
    setErrs(e);
    return !Object.keys(e).length;
  };

  const doc=tpl.build(vals);

  return (
    <div style={{maxWidth:1000,margin:"0 auto",padding:"1.5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.5rem",flexWrap:"wrap"}}>
        <button onClick={onBack} style={{
          background:"#ffffff",border:"1px solid rgba(0,0,0,0.18)",
          borderRadius:T.rMd,padding:"7px 14px",cursor:"pointer",fontSize:13,color:T.textSub,
        }}>← Назад</button>
        <span style={{fontSize:22,lineHeight:1}}>{tpl.icon}</span>
        <span style={{fontSize:18,fontWeight:600,color:T.text}}>{tpl.name}</span>
        <Badge cat={tpl.cat}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"360px 1fr",gap:20,alignItems:"start"}}>
        <div>
          <div style={{
            background:"#ffffff",border:"1px solid rgba(0,0,0,0.09)",
            borderRadius:T.rXl,padding:"20px",marginBottom:12,
          }}>
            <SL>Заповнення полів</SL>
            {tpl.fields.map(f=>(
              <FieldInput key={f.id} f={f} value={vals[f.id]} error={errs[f.id]} onChange={set}/>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="subtle" onClick={()=>setFmtOpen(true)}>⚙ Форматування</Btn>
            <Btn variant="primary" fullW onClick={()=>{if(validate())onNext(vals,fmt,doc);}}>
              Далі →
            </Btn>
          </div>
        </div>

        <div style={{
          background:"#ffffff",border:"1px solid rgba(0,0,0,0.09)",
          borderRadius:T.rXl,padding:"20px",
        }}>
          <SL>Попередній перегляд</SL>
          <DocPreview text={doc} fmt={fmt}/>
        </div>
      </div>

      {/* MODAL 2 — Форматування тексту */}
      <Modal open={fmtOpen} onClose={()=>setFmtOpen(false)} title="Форматування тексту" width={540}>
        <div style={{display:"grid",gap:20}}>
          <div>
            <label style={lbl}>Шрифт</label>
            <select value={fmt.font} onChange={e=>setFmt(p=>({...p,font:e.target.value}))} style={sel}>
              {FONTS.map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <label style={lbl}>Розмір (pt)</label>
              <select value={fmt.size} onChange={e=>setFmt(p=>({...p,size:+e.target.value}))} style={sel}>
                {FSIZES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Міжрядковий інтервал</label>
              <ToggleGroup opts={LINEHS} value={fmt.lineH} onChange={v=>setFmt(p=>({...p,lineH:v}))}/>
            </div>
          </div>
          <div>
            <label style={lbl}>Вирівнювання</label>
            <ToggleGroup opts={ALIGNS} value={fmt.align} onChange={v=>setFmt(p=>({...p,align:v}))}/>
          </div>
          <div>
            <label style={lbl}>Поля сторінки (мм)</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[["mTop","Верх"],["mBottom","Низ"],["mLeft","Ліво"],["mRight","Право"]].map(([k,l])=>(
                <div key={k}>
                  <span style={{fontSize:11,color:T.textHint,display:"block",marginBottom:4}}>{l}</span>
                  <input type="number" value={fmt[k]} min={5} max={60}
                    onChange={e=>setFmt(p=>({...p,[k]:+e.target.value}))}
                    style={{...sel,padding:"7px 8px"}}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Зразок</label>
            <div style={{
              background:"#f9f8f5",borderRadius:T.rMd,border:"1px solid rgba(0,0,0,0.07)",
              padding:"12px 14px",fontSize:Math.min(fmt.size,13),
              fontFamily:fmt.font,textAlign:fmt.align,lineHeight:fmt.lineH,
              color:"#111",maxHeight:72,overflow:"hidden",whiteSpace:"pre-wrap",
            }}>{"ЗАЯВА\n\nПрошу надати мені відпустку тривалістю 14 днів."}</div>
          </div>
          <div style={{
            display:"flex",justifyContent:"flex-end",gap:8,
            paddingTop:16,borderTop:"1px solid rgba(0,0,0,0.07)",
          }}>
            <Btn onClick={()=>setFmtOpen(false)}>Скасувати</Btn>
            <Btn variant="primary" onClick={()=>setFmtOpen(false)}>Застосувати</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ════════════════════════════════════
   PAGE 3 · EXPORT
════════════════════════════════════ */
function ExportPage({tpl,fmt,doc,onBack,onHome}) {
  const [modal,setModal]=useState(null);
  const [lastFmt,setLastFmt]=useState("");

  const openModal=(f)=>{setLastFmt(f);setModal(f);};

  const confirm=()=>{
    const blob=new Blob([doc],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`${tpl.name}.${lastFmt}`;
    a.click();URL.revokeObjectURL(url);
    setModal("success");
  };

  const alignLabel={left:"Ліво",center:"Центр",right:"Право",justify:"По ширині"};

  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"1.5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.5rem"}}>
        <button onClick={onBack} style={{
          background:"#ffffff",border:"1px solid rgba(0,0,0,0.18)",
          borderRadius:T.rMd,padding:"7px 14px",cursor:"pointer",fontSize:13,color:T.textSub,
        }}>← Назад</button>
        <span style={{fontSize:18,fontWeight:600,color:T.text}}>Перегляд та експорт</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:20,alignItems:"start"}}>
        <div style={{background:"#ffffff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:T.rXl,padding:"20px"}}>
          <SL>Готовий документ</SL>
          <DocPreview text={doc} fmt={fmt}/>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#ffffff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:T.rXl,padding:"20px"}}>
            <SL>Завантажити</SL>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {f:"pdf", iconBg:"#FEE2E2",iconColor:"#991B1B",iconLetter:"P",label:"Завантажити PDF",sub:"Для друку та перегляду"},
                {f:"docx",iconBg:"#DBEAFE",iconColor:"#1E40AF",iconLetter:"W",label:"Завантажити DOCX",sub:"Для редагування у Word"},
              ].map(item=>(
                <button key={item.f} onClick={()=>openModal(item.f)} style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"13px 14px",
                  border:"1px solid rgba(0,0,0,0.09)",
                  borderRadius:T.rLg,
                  background:"#f7f7f5",cursor:"pointer",textAlign:"left",width:"100%",
                }}>
                  <div style={{
                    width:38,height:38,borderRadius:T.rMd,
                    background:item.iconBg,color:item.iconColor,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:17,fontWeight:700,flexShrink:0,
                  }}>{item.iconLetter}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:T.text,marginBottom:2}}>{item.label}</div>
                    <div style={{fontSize:11,color:T.textHint}}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{background:"#ffffff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:T.rXl,padding:"20px"}}>
            <SL>Форматування</SL>
            {[
              ["Шрифт",fmt.font],
              ["Розмір",`${fmt.size} pt`],
              ["Інтервал",fmt.lineH],
              ["Вирівнювання",alignLabel[fmt.align]],
              ["Поля",`${fmt.mTop}·${fmt.mBottom}·${fmt.mLeft}·${fmt.mRight} мм`],
            ].map(([k,v])=>(
              <div key={k} style={{
                display:"flex",justifyContent:"space-between",
                padding:"5px 0",borderBottom:"1px solid rgba(0,0,0,0.05)",
              }}>
                <span style={{fontSize:12,color:T.textHint}}>{k}</span>
                <span style={{fontSize:12,fontWeight:500,color:T.text}}>{v}</span>
              </div>
            ))}
          </div>

          <Btn fullW variant="subtle" onClick={onHome}>← На головну</Btn>
        </div>
      </div>

      {/* MODAL 3 — Підтвердження PDF */}
      <Modal open={modal==="pdf"} onClose={()=>setModal(null)} title="Підтвердження — PDF" width={440}>
        <div style={{
          display:"flex",alignItems:"center",gap:14,
          background:"#FEF2F2",borderRadius:T.rLg,padding:"14px 16px",marginBottom:16,
        }}>
          <div style={{
            width:44,height:44,borderRadius:T.rMd,background:"#FECACA",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20,fontWeight:700,color:"#7F1D1D",flexShrink:0,
          }}>P</div>
          <div>
            <p style={{margin:"0 0 2px",fontWeight:600,fontSize:14,color:"#7F1D1D"}}>{tpl.name}.pdf</p>
            <p style={{margin:0,fontSize:12,color:"#B91C1C"}}>{fmt.font} · {fmt.size}pt · Готово до друку</p>
          </div>
        </div>
        <p style={{fontSize:13,color:T.textSub,margin:"0 0 20px",lineHeight:1.65}}>
          Файл буде збережено у форматі PDF. Перевірте, що всі поля заповнені коректно перед завантаженням.
        </p>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setModal(null)}>Скасувати</Btn>
          <Btn variant="danger" onClick={confirm}>Завантажити PDF</Btn>
        </div>
      </Modal>

      {/* MODAL 4 — Підтвердження DOCX */}
      <Modal open={modal==="docx"} onClose={()=>setModal(null)} title="Підтвердження — DOCX" width={440}>
        <div style={{
          display:"flex",alignItems:"center",gap:14,
          background:"#EFF6FF",borderRadius:T.rLg,padding:"14px 16px",marginBottom:16,
        }}>
          <div style={{
            width:44,height:44,borderRadius:T.rMd,background:"#BFDBFE",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20,fontWeight:700,color:"#1E3A5F",flexShrink:0,
          }}>W</div>
          <div>
            <p style={{margin:"0 0 2px",fontWeight:600,fontSize:14,color:"#1E3A5F"}}>{tpl.name}.docx</p>
            <p style={{margin:0,fontSize:12,color:"#1E40AF"}}>{fmt.font} · {fmt.size}pt · Сумісний з Word</p>
          </div>
        </div>
        <p style={{fontSize:13,color:T.textSub,margin:"0 0 20px",lineHeight:1.65}}>
          Файл буде збережено у форматі DOCX. Ви зможете відкрити та редагувати його в Microsoft Word або Google Docs.
        </p>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setModal(null)}>Скасувати</Btn>
          <Btn variant="primary" onClick={confirm}>Завантажити DOCX</Btn>
        </div>
      </Modal>

      {/* MODAL 5 — Успішне завантаження */}
      <Modal open={modal==="success"} onClose={()=>setModal(null)} title="" width={400}>
        <div style={{textAlign:"center",padding:"12px 0 8px"}}>
          <div style={{
            width:64,height:64,borderRadius:"50%",
            background:"#D1FAE5",
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 18px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{fontWeight:700,fontSize:19,margin:"0 0 6px",color:T.text}}>Файл завантажено!</p>
          <p style={{fontSize:13,color:T.textSub,margin:"0 0 20px",lineHeight:1.6}}>
            «{tpl.name}» успішно збережено на ваш пристрій
          </p>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:"#F0FDF4",border:"1px solid #BBF7D0",
            borderRadius:T.rMd,padding:"9px 16px",marginBottom:24,
          }}>
            <span style={{fontSize:13,fontWeight:600,color:"#166534"}}>
              {tpl.name}.{lastFmt}
            </span>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <Btn onClick={()=>setModal(null)}>Залишитися</Btn>
            <Btn variant="primary" onClick={()=>{setModal(null);onHome();}}>На головну</Btn>
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
  const [page,setPage]=useState("home");
  const [tpl,setTpl]=useState(null);
  const [fmt,setFmt]=useState(DEFAULT_FMT);
  const [doc,setDoc]=useState("");

  const openTpl=(t)=>{setTpl(t);setPage("editor");};
  const goExport=(_v,f,d)=>{setFmt(f);setDoc(d);setPage("export");};
  const goHome=()=>{setPage("home");setTpl(null);};
  const stepIdx={home:0,editor:1,export:2}[page];

  return (
    <div style={{minHeight:"100vh",background:T.pageBg}}>
      <nav style={{
        background:"#ffffff",
        borderBottom:"1px solid rgba(0,0,0,0.09)",
        height:54,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 1.5rem",
        position:"sticky",top:0,zIndex:100,
      }}>
        <button onClick={goHome} style={{
          background:"none",border:"none",cursor:"pointer",
          fontWeight:700,fontSize:16,color:T.text,padding:0,
          display:"flex",alignItems:"center",gap:8,
        }}>
          <span style={{
            width:28,height:28,background:T.blue600,borderRadius:T.rMd,
            display:"inline-flex",alignItems:"center",justifyContent:"center",
            fontSize:14,color:"#fff",flexShrink:0,fontWeight:700,
          }}>F</span>
          FormDoc
        </button>
        <Stepper step={stepIdx}/>
        <div style={{width:80}}/>
      </nav>

      {page==="home"   && <HomePage onOpen={openTpl}/>}
      {page==="editor" && tpl && <EditorPage tpl={tpl} onNext={goExport} onBack={goHome}/>}
      {page==="export" && tpl && <ExportPage tpl={tpl} fmt={fmt} doc={doc} onBack={()=>setPage("editor")} onHome={goHome}/>}
    </div>
  );
}