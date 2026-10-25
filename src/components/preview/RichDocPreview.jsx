export function RichDocPreview({lines, fmt}) {
  return (
    <div style={{
      background:"#ffffff",
      boxShadow:"0 2px 8px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.05)",
      border:"1px solid rgba(0,0,0,0.06)",
      borderRadius:6,
      padding:`${fmt.mTop}px ${fmt.mRight}px ${fmt.mBottom}px ${fmt.mLeft}px`,
      fontFamily:fmt.font,
      lineHeight:fmt.lineH,
      color:"#111111",
      minHeight:320,
    }}>
      {lines.map((ln,i)=>(
        <div key={ln.id} style={{
          textAlign:ln.align||fmt.align,
          fontSize:ln.size||fmt.size,
          fontWeight:ln.bold?"700":"400",
          fontStyle:ln.italic?"italic":"normal",
          marginBottom: ln.text===""?`${fmt.lineH*0.6}em`:undefined,
          whiteSpace:"pre-wrap",
          minHeight:ln.text===""?"1em":undefined,
        }}>{ln.text||"\u00a0"}</div>
      ))}
    </div>
  );
}