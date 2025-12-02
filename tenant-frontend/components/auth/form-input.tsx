import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface FormInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  endAdornment?: ReactNode;
  minLength?: number;
  className?: string;
}

export function FormInput({
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  icon,
  endAdornment,
  minLength,
  className = ""
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-3.5 h-5 w-5 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          type={type}
          placeholder={placeholder}
          className={`${icon ? 'pl-12' : 'pl-4'} ${endAdornment ? 'pr-14' : 'pr-4'} h-14 text-base border-gray-300 dark:border-gray-600 ${className}`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          minLength={minLength}
        />
        {endAdornment && (
          <div className="absolute right-2 top-2">
            {endAdornment}
          </div>
        )}
      </div>
    </div>
  );
}