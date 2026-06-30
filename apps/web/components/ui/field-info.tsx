"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function FieldInfo({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="inline-block h-3.5 w-3.5 cursor-help text-[var(--text-muted)]" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}
