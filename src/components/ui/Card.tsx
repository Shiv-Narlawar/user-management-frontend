import React from "react";
export function Card({ className="", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`glass rounded-3xl shadow-glow ${className}`} {...props} />;
}
