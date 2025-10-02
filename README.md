# Guía de despliegue local — personal-data-frontend

## Pila tecnológica (Tech Stack)

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- npm

---

## Requisitos previos

- Node.js LTS (≥ 18.x recomendado)
- npm (o pnpm / yarn) instalado
- Acceso a la API que consumirá este frontend (URL base y credenciales públicas si aplican)

---

### 2) Duplicar para entorno local

Copia el archivo y crea tu `.env`

```bash
cp .env.example .env
```

Edita los valores con tus endpoints reales. Puedes revisar el archivo .env.example de referencia.

> Regla (Next.js): toda variable que inicie con `NEXT_PUBLIC_` puede quedar expuesta en el bundle del cliente. Nunca coloques secretos en estas variables.

---

## Instalación

Clona el repo y entra a la carpeta:

```bash
git clone https://github.com/CerebiiaCompany/personal-data-frontend
cd personal-data-frontend
```

Instala dependencias (elige tu gestor):

```bash
# con npm
npm install
```

---

## Ejecución en desarrollo

```bash
npm run dev
```

Por defecto, la app estará en `http://localhost:3000`.
Asegúrate de que la API esté accesible en `NEXT_PUBLIC_API_BASE_URL`.

---

## Build de producción y arranque

Genera el build:

```bash
npm run build
```

Levanta el servidor de producción:

```bash
npm start
```

---

## Scripts útiles (ejemplo)

Ajusta según tu `package.json` si difiere.

```jsonc
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  }
}
```

---

## Comprobación rápida

1. Ejecuta `npm run dev` y verifica que no haya errores.
2. Abre `http://localhost:3000` y navega por la app.
3. En el panel Network del navegador verifica que las llamadas van a `NEXT_PUBLIC_API_BASE_URL`.
4. Si usas Tailwind, cambia una clase y confirma que se aplica correctamente.

---

## Solución de problemas

- Errores 404/500 al llamar la API: valida `NEXT_PUBLIC_API_BASE_URL` y que el backend esté activo.
- CORS bloqueado: configura CORS en el backend para permitir `http://localhost:3000`.
- Variables no cargan: confirma que `.env` exista y reinicia `npm run dev`.
- Errores de TypeScript: ejecuta `npm run type-check`.
- Tailwind no aplica: revisa `tailwind.config.ts` y que `content` apunte a las rutas correctas.
