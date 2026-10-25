export function DocPreview({text,fmt}) {
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