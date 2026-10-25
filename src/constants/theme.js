export const T = {
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

export const CAT_COLORS = {
  "Мої шаблони": {bg:"#F3E8FF",text:"#6B21A8"},
  "Заяви":    {bg:"#E6F1FB",text:"#0C447C"},
  "Договори": {bg:"#EAF3DE",text:"#27500A"},
  "Довідки":  {bg:"#FAEEDA",text:"#633806"},
  "Звіти":    {bg:"#EEEDFE",text:"#3C3489"},
};

export const FIELD_TYPES = [
  {v:"text",   l:"Текст"},
  {v:"number", l:"Число"},
  {v:"date",   l:"Дата"},
];

export const FONTS  = ["Times New Roman","Arial","Georgia","Courier New","Verdana"];
export const FSIZES = [10,11,12,14,16,18,20,22];
export const ALIGNS = [{v:"left",l:"Ліво"},{v:"center",l:"Центр"},{v:"right",l:"Право"},{v:"justify",l:"Ширина"}];
export const LINEHS = [{v:1.0,l:"1.0"},{v:1.2,l:"1.2"},{v:1.5,l:"1.5"},{v:1.8,l:"1.8"},{v:2,l:"2.0"}];

export const DEFAULT_FMT = {
  font:"Times New Roman",size:14,align:"justify",
  lineH:1.5,mTop:24,mBottom:24,mLeft:28,mRight:18,
};

export const lbl = {
  display:"block",fontSize:11,fontWeight:700,
  color:"#5f5e5a",textTransform:"uppercase",
  letterSpacing:"0.06em",marginBottom:7,
};

export const sel = {
  width:"100%",padding:"8px 10px",fontSize:13,
  border:"1px solid rgba(0,0,0,0.15)",borderRadius:"8px",
  background:"#ffffff",color:"#1a1916",
  outline:"none",boxSizing:"border-box",
};