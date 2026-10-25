import { T } from "../../constants/theme";

export function FieldInput({f,value,error,onChange}) {
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