// Componente Input reutilizable usando Shadcn design system

import * as React from "react"
import { cn } from "@/lib/utils"

// Props del componente Input que extiende las props nativas del input HTML
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

// Componente Input con forwarded ref para acceso directo al elemento DOM
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type} // Tipo del input (text, email, password, etc.)
        className={cn(
          // Clases base del input siguiendo el design system de Shadcn
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className // Permite override de clases CSS
        )}
        ref={ref} // Referencia forwarded para acceso al DOM
        {...props} // Spread de todas las props restantes
      />
    )
  }
)

// Nombre del componente para debugging
Input.displayName = "Input"

export { Input }
