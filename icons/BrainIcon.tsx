import React from "react";

// Inline SVG converted from your iconav.svg
// Fills mapped to currentColor so you can control color via CSS (e.g., className="text-black").
const RAW = `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 4267 4267" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><g id="Livello1"><path d="M3583.28,2998.79l-619.102,-0l-0,-316.31l-993.512,-0l-0,-1458.57l1331.05,0l-0,1445.62l585.014,-0l0,-279.477l-268.922,-0l0,-1497.2l-622.631,-0l-0,-245.168l-325.299,-0l0,245.168l-365.733,-0l-0,-833.622l1007.85,0l-0,274.494l325.657,-0l-0,307.485l277.355,0l-0,264.657l285.516,-0l0,915.982l-285.516,-0l-0,252.502l285.516,-0l0,924.437l-274.994,-0l0,652.61l-596.842,-0l-0,556.037c-0,0 -666.923,0 -666.923,0l0,-286.963l324.221,0l0,-557.953l597.289,0l0,-363.731Zm-1588.75,-2939.56l-0,833.622l-368.661,-0l0,1237.3l-330.957,0l0,-589.516l-312.621,0l-0,856.617l-300.405,0l-0,288.737l301.112,0l0,-289.324l644.402,-0l-0,638.083l1034.37,-0l0,885.721l-356.785,0l-0,-547.148l-990.716,0l0,-369.596l-933.272,0l-0,-606.473l-314.863,0l-0,-611.369l593.995,0l0,-245.248l-577.51,0l-0,-612.874l278.962,-0l-0,-287.432l298.548,0l0,-309.212l312.458,0l0,-271.889l1021.94,0Zm969.649,2046.2l-0,-575.896l-683.459,-0l0,865.71l373.438,0l-0,-289.814l310.021,0Zm-2291.86,-1179.33l0,321.182l622.595,-0l0,-606.818l-312.621,0l-0,285.636l-309.974,0Z" style="fill:currentColor;"/></g></svg>`;

export default function BrainIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{ display: "inline-block", width: size, height: size, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: RAW }}
    />
  );
}
