"use client";

import { type InputHTMLAttributes, useCallback } from "react";
import { applyMask, MASK_PLACEHOLDERS, type MaskType } from "@/lib/input-masks";

type MaskedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  mask: MaskType;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function MaskedInput({ mask, onChange, value, defaultValue, placeholder, ...props }: MaskedInputProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const masked = applyMask(mask, event.target.value);
      event.target.value = masked;
      onChange?.(event);
    },
    [mask, onChange],
  );

  const maskedValue = value !== undefined && value !== null ? applyMask(mask, String(value)) : undefined;
  const maskedDefault =
    defaultValue !== undefined && defaultValue !== null ? applyMask(mask, String(defaultValue)) : undefined;

  return (
    <input
      {...props}
      value={maskedValue}
      defaultValue={maskedDefault}
      placeholder={placeholder ?? MASK_PLACEHOLDERS[mask]}
      onChange={handleChange}
    />
  );
}
