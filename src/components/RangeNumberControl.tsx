'use client';

type Props={
  label:string;
  value:string;
  onChange:(value:string)=>void;
  min:number;
  max:number;
  step?:number;
  id?:string;
};

export default function RangeNumberControl({label,value,onChange,min,max,step=1,id}:Props){
  const parsed=Number(value);
  const safe=Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):min;
  const pct=max===min?0:((safe-min)/(max-min))*100;
  return <label className="smart-field smart-field-range" htmlFor={id}>
    <span>{label}</span>
    <div className="range-number-control" style={{'--range-fill':`${pct}%`} as React.CSSProperties}>
      <input
        className="range-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={safe}
        onChange={e=>onChange(e.target.value)}
        aria-label={`${label} slider`}
      />
      <input
        className="range-number-value"
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e=>onChange(e.target.value)}
        aria-label={`${label} value`}
      />
    </div>
  </label>
}
