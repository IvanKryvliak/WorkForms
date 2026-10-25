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
  "Заяви":    {bg:"#E6F1FB",text:"#0C447C"},
  "Договори": {bg:"#EAF3DE",text:"#27500A"},
  "Довідки":  {bg:"#FAEEDA",text:"#633806"},
  "Звіти":    {bg:"#EEEDFE",text:"#3C3489"},
};

export const TEMPLATES = [
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

export const FONTS  = ["Times New Roman","Arial","Georgia","Courier New","Verdana"];
export const FSIZES = [10,11,12,14,16,18,20,22];
export const ALIGNS = [{v:"left",l:"Ліво"},{v:"center",l:"Центр"},{v:"right",l:"Право"},{v:"justify",l:"Ширина"}];
export const LINEHS = [{v:1.0,l:"1.0"},{v:1.2,l:"1.2"},{v:1.5,l:"1.5"},{v:1.8,l:"1.8"},{v:2,l:"2.0"}];

export const DEFAULT_FMT = {
  font:"Times New Roman",size:14,align:"justify",
  lineH:1.5,mTop:24,mBottom:24,mLeft:28,mRight:18,
};