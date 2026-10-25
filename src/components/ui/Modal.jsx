import { T } from "../../constants/theme";

export function Modal({open,onClose,title,width=500,children}) {
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