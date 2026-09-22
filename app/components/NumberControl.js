"use client";

import { Minus, Plus } from "lucide-react";
import { IconButton } from "./ui";

export default function NumberControl({ label, value, min, max, suffix, onChange }) {
  return (
    <div className="number-control">
      <span><small>{label}</small><strong>{value}{suffix || ""}</strong></span>
      <span className="stepper">
        <IconButton label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}><Minus size={17} /></IconButton>
        <IconButton label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}><Plus size={17} /></IconButton>
      </span>
    </div>
  );
}
