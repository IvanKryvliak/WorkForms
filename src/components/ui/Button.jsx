import { T } from "../../constants/theme";

export function Btn({onClick,children,variant="ghost",disabled,fullW,sm}) {
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