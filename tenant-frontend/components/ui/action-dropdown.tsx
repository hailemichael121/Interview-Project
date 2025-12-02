import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface ActionItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
}

interface ActionDropdownProps {
  items: ActionItem[];
  align?: "start" | "center" | "end";
  trigger?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function ActionDropdown({
  items,
  align = "end",
  trigger,
  size = "md"
}: ActionDropdownProps) {
  const sizeClasses = {
    sm: "h-6 w-6 p-0",
    md: "h-8 w-8 p-0",
    lg: "h-10 w-10 p-0"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className={sizeClasses[size]}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            disabled={item.disabled}
            className={item.destructive ? "text-red-600 focus:text-red-700" : ""}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}