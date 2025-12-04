// components/ui/tooltip.tsx  (or inline it)
import * as React from "react";
import { Info } from "lucide-react";

interface EditTooltipProps {
    children: React.ReactNode;
}

export function EditTooltip({ children }: EditTooltipProps) {
    return (
        <div className="group relative inline-block">
            {children}
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="whitespace-nowrap rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-black">
                    Double-click to edit
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white" />
                </div>
            </div>
        </div>
    );
}