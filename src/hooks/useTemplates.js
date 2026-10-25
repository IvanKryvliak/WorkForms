import { useState, useEffect } from "react";

const STORAGE_KEY = "formdoc_templates";

function rebuildBuild(tpl) {
  if (tpl._tmplStr && typeof tpl.build !== "function") {
    const tmplStr = tpl._tmplStr;
    const fields = tpl.fields || [];
    tpl.build = (d) => {
      let t = tmplStr;
      fields.forEach(f => {
        t = t.replaceAll(`{${f.id}}`, d[f.id] || (f.type === "date" ? "__.__.____" : f.type === "number" ? "__" : "[" + f.label + "]"));
      });
      return t;
    };
  }
  return tpl;
}

export const TEMPLATES = [
  {
    id: 1, cat: "Заяви", icon: "🏖️",
    name: "Заява про відпустку",
    desc: "Щорічна оплачувана відпустка",
    fields: [
      { id: "fullName", label: "ПІБ заявника", type: "text", ph: "Іваненко Іван Іванович", req: true },
      { id: "position", label: "Посада", type: "text", ph: "Старший розробник", req: true },
      { id: "startDate", label: "Початок відпустки", type: "date", req: true },
      { id: "endDate", label: "Кінець відпустки", type: "date", req: true },
      { id: "days", label: "Кількість днів", type: "number", ph: "14", req: true },
    ],
    build: (d) => `ЗАЯВА\n\nПрошу надати мені, ${d.fullName || "[ПІБ]"}, ${d.position || "[посада]"},\nщорічну оплачувану відпустку тривалістю ${d.days || "__"} календарних\nднів з ${d.startDate || "__.__.____"} по ${d.endDate || "__.__.____"}.\n\n${new Date().toLocaleDateString("uk-UA")} р.\n\nПідпис: ________________`,
    _tmplStr: "ЗАЯВА\n\nПрошу надати мені, {fullName}, {position},\nщорічну оплачувану відпустку тривалістю {days} календарних\nднів з {startDate} по {endDate}.\n\nПідпис: ________________",
  },
  {
    id: 2, cat: "Договори", icon: "📋",
    name: "Договір надання послуг",
    desc: "Між виконавцем та замовником",
    fields: [
      { id: "executor", label: "ПІБ виконавця", type: "text", ph: "Петренко Петро Петрович", req: true },
      { id: "client", label: "ПІБ замовника", type: "text", ph: "Сидоренко Сидір Сидорович", req: true },
      { id: "service", label: "Опис послуги", type: "text", ph: "Розробка веб-сайту", req: true },
      { id: "amount", label: "Сума (грн)", type: "number", ph: "15000", req: true },
      { id: "date", label: "Дата договору", type: "date", req: true },
    ],
    build: (d) => `ДОГОВІР НАДАННЯ ПОСЛУГ\n\nм. Київ, ${d.date || "__.__.____"}\n\n${d.executor || "[Виконавець]"} (Виконавець) та\n${d.client || "[Замовник]"} (Замовник) уклали цей договір:\n\n1. Виконавець надає послугу: ${d.service || "[опис]"}.\n2. Вартість послуг: ${d.amount || "__"} грн.\n3. Договір набирає чинності з моменту підписання.\n\nВиконавець: ________________\nЗамовник:   ________________`,
    _tmplStr: "ДОГОВІР НАДАННЯ ПОСЛУГ\n\nм. Київ, {date}\n\n{executor} (Виконавець) та\n{client} (Замовник) уклали цей договір:\n\n1. Виконавець надає послугу: {service}.\n2. Вартість послуг: {amount} грн.\n3. Договір набирає чинності з моменту підписання.\n\nВиконавець: ________________\nЗамовник:   ________________",
  },
  {
    id: 3, cat: "Довідки", icon: "🗂️",
    name: "Довідка з місця роботи",
    desc: "Для пред'явлення за місцем вимоги",
    fields: [
      { id: "org", label: "Назва організації", type: "text", ph: "ТОВ Технологія", req: true },
      { id: "employee", label: "ПІБ працівника", type: "text", ph: "Коваленко Ольга Василівна", req: true },
      { id: "empPos", label: "Посада", type: "text", ph: "Бухгалтер", req: true },
      { id: "salary", label: "Зарплата (грн)", type: "number", ph: "25000", req: false },
      { id: "issDate", label: "Дата видачі", type: "date", req: true },
    ],
    build: (d) => `ДОВІДКА\n\nВидана ${d.employee || "[ПІБ]"} в тому, що вона/він дійсно\nпрацює в ${d.org || "[організація]"} на посаді ${d.empPos || "[посада]"}${d.salary ? `\nіз середньомісячною зарплатою ${d.salary} грн` : ""}.\n\nДовідка видана ${d.issDate || "__.__.____"} р. для пред'явлення\nза місцем вимоги.\n\nДиректор: ________________     М.П.`,
    _tmplStr: "ДОВІДКА\n\nВидана {employee} в тому, що вона/він дійсно\nпрацює в {org} на посаді {empPos}\nіз середньомісячною зарплатою {salary} грн.\n\nДовідка видана {issDate} р. для пред'явлення\nза місцем вимоги.\n\nДиректор: ________________     М.П.",
  },
  {
    id: 4, cat: "Звіти", icon: "📊",
    name: "Звіт про виконану роботу",
    desc: "Результати діяльності за період",
    fields: [
      { id: "author", label: "ПІБ автора", type: "text", ph: "Мельник Андрій Юрійович", req: true },
      { id: "period", label: "Звітний період", type: "text", ph: "Квітень 2025", req: true },
      { id: "tasks", label: "Виконані завдання", type: "text", ph: "Розробка модулів A, B, C", req: true },
      { id: "results", label: "Результати", type: "text", ph: "Виконано 100% плану", req: true },
      { id: "repDate", label: "Дата звіту", type: "date", req: true },
    ],
    build: (d) => `ЗВІТ ПРО ВИКОНАНУ РОБОТУ\n\nАвтор:  ${d.author || "[ПІБ]"}\nПеріод: ${d.period || "[період]"}\nДата:   ${d.repDate || "__.__.____"}\n\n1. ВИКОНАНІ ЗАВДАННЯ:\n   ${d.tasks || "[перелік завдань]"}\n\n2. РЕЗУЛЬТАТИ:\n   ${d.results || "[результати]"}\n\nПідпис: ________________`,
    _tmplStr: "ЗВІТ ПРО ВИКОНАНУ РОБОТУ\n\nАвтор:  {author}\nПеріод: {period}\nДата:   {repDate}\n\n1. ВИКОНАНІ ЗАВДАННЯ:\n   {tasks}\n\n2. РЕЗУЛЬТАТИ:\n   {results}\n\nПідпис: ________________",
  },
  {
    id: 5,
    cat: "Заяви",
    icon: "📄",
    name: "Заява на звільнення",
    desc: "За власним бажанням",

    fields: [
      { id: "org", label: "Назва установи", type: "text", ph: "ТОВ Компанія", req: true },
      { id: "director", label: "Керівник", type: "text", ph: "Петренко П.П.", req: true },
      { id: "fullName", label: "ПІБ працівника", type: "text", ph: "Іваненко Іван Іванович", req: true },
      { id: "position", label: "Посада", type: "text", ph: "Менеджер", req: true },
      { id: "dismissDate", label: "Дата звільнення", type: "date", req: true },
    ],

    build: (d) => `${d.org || "[установа]"}\nКерівнику ${d.director || "[керівник]"}\nвід ${d.fullName || "[ПІБ]"}\nпосада: ${d.position || "[посада]"}\n\nЗАЯВА\n\nПрошу звільнити мене за власним бажанням з ${d.dismissDate || "__.__.____"} відповідно до законодавства України.\nДата: ${new Date().toLocaleDateString("uk-UA")}\nПідпис: ________________`,
    _tmplStr: "{org}\nКерівнику {director}\nвід {fullName}\nпосада: {position}\n\nЗАЯВА\n\nПрошу звільнити мене за власним бажанням з {dismissDate} відповідно до законодавства України.\nДата: __.__.____\nПідпис: ________________",
  },
  {
    id: 6,
    cat: "Накази",
    icon: "📑",
    name: "Наказ",
    desc: "Наказ установи",

    fields: [
      { id: "org", label: "Назва установи", type: "text", req: true },
      { id: "number", label: "Номер наказу", type: "text", ph: "15-к", req: true },
      { id: "date", label: "Дата", type: "date", req: true },
      { id: "city", label: "Місто", type: "text", ph: "Київ", req: true },
      { id: "topic", label: "Тема наказу", type: "text", req: true },
      { id: "items", label: "Пункти наказу", type: "text", req: true },
      { id: "director", label: "Керівник", type: "text", req: true },
    ],

    build: (d) => `${d.org || "[установа]"}\nНАКАЗ\n№ ${d.number || "__"}\nвід ${d.date || "__.__.____"}\nм. ${d.city || "[місто]"}\nПро ${d.topic || "[тема]"}\nНАКАЗУЮ:\n${d.items || "[пункти наказу]"}\nКонтроль за виконанням наказу залишаю за собою.\nПідпис: ________________ \n${d.director || "[керівник]"}`,
    _tmplStr: "{org}\nНАКАЗ\n№ {number}\nвід {date}\nм. {city}\n\nПро {topic}\n\nНАКАЗУЮ:\n{items}\n\nКонтроль за виконанням наказу залишаю за собою.\nПідпис: ________________\n{director}",
  },
  {
    id: 7,
    cat: "Довідки",
    icon: "💰",
    name: "Довідка про доходи",
    desc: "Підтвердження доходів",

    fields: [
      { id: "org", label: "Організація", type: "text", req: true },
      { id: "employee", label: "ПІБ", type: "text", req: true },
      { id: "period", label: "Період", type: "text", req: true },
      { id: "income", label: "Сума доходу", type: "number", req: true },
      { id: "director", label: "Керівник", type: "text", req: true },
    ],

    build: (d) => `${d.org || "[організація]"}\nДОВІДКА ПРО ДОХОДИ\n\nВидана ${d.employee || "[ПІБ]"}.\nЗа період:\n${d.period || "[період]"}\nдохід становив:\n${d.income || "__"} грн.\n\nКерівник: ${d.director || "[керівник]"}\nПідпис: ________________`,
    _tmplStr: "{org}\nДОВІДКА ПРО ДОХОДИ\n\nВидана {employee}.\nЗа період:\n{period}\nдохід становив:\n{income} грн.\n\nКерівник: {director}\nПідпис: ________________",
  },
];

export function useTemplates() {
  const [customTpls, setCustomTpls] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw).map(rebuildBuild) : [];
      if (saved.length > 0) {
        setCustomTpls(saved);
      }
    } catch { }
  }, []);

  const saveTemplates = (tpls) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tpls));
      setCustomTpls(tpls);
    } catch { }
  };

  const addTemplate = (tpl) => {
    const updated = [...customTpls, tpl];
    saveTemplates(updated);
    return updated;
  };

  const allTemplates = [...TEMPLATES, ...customTpls];

  return { templates: allTemplates, customTemplates: customTpls, addTemplate };
}

