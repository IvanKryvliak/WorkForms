import { T } from "../../constants/theme";

export function ToggleGroup({opts,value,onChange}) {
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