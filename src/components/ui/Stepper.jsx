import { T } from "../../constants/theme";

export function Stepper({step}) {
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