# Sistema de Personalización (White-Label)

Este sistema permite a cada cliente personalizar su propia marca mientras mantiene "Powered by ZIII Solutions".

## Configuración de Marca

Cada organización puede configurar en `/backoffice/branding`:

- **Logo personalizado**: URL o archivo subido
- **Nombre de marca**: Nombre comercial (si difiere del legal)
- **Colores primarios**: Para adaptar el tema del sistema
- **Colores secundarios**: Para acentos y destacados

## Arquitectura

### Base de Datos

```sql
organizations:
  - brand_name: text (nullable)
  - logo_url: text (nullable)
  - primary_color: text (default '#1c1917')
  - secondary_color: text (default '#16a34a')
```

### Componentes

1. **AppShell**: Muestra logo personalizado en sidebar + "Powered by ZIII Solutions"
2. **BrandingForm**: Formulario de configuración en backoffice
3. **PrintLayout**: Headers/footers para impresión con logo + powered by

### Archivos Clave

- `src/app/backoffice/branding/page.tsx` - Página de configuración
- `src/components/backoffice/branding-form.tsx` - Formulario
- `src/components/layout/app-shell.tsx` - Layout con logo personalizado
- `src/components/print/print-layout.tsx` - Layout de impresión
- `src/lib/config/branding.ts` - Helpers de configuración

## Uso en Reportes

```tsx
import { PrintHeader, PrintFooter } from "@/components/print/print-layout";

// En cualquier reporte/ticket
<PrintHeader
  organizationName={branding.name}
  logoUrl={branding.logoUrl}
  branchName="Sucursal Centro"
  documentType="Ticket"
  documentNumber="#001234"
/>

{/* Contenido del reporte */}

<PrintFooter /> {/* Siempre incluye "Powered by ZIII Solutions" */}
```

## Logo ZIII Solutions

Logo disponible en: `/ziii-logo.svg`

Siempre visible en:
- Footer del sidebar (todas las páginas)
- Footer de reportes impresos
- Pantalla de login (opcional)
