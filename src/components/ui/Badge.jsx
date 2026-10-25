import { CAT_COLORS, T } from "../../constants/theme";

export function Badge({cat}) {
  const c=CAT_COLORS[cat]||{bg:T.surfaceSub,text:T.textSub};
  return (
    <span style={{
      fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
      background:c.bg,color:c.text,padding:"3px 10px",borderRadius:T.rMd,
    }}>{cat}</span>
  );
}