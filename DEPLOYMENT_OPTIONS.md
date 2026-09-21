# Guía de Deployment Automático

Como Cloud Agent, no puedo autenticar interactivamente con Vercel, pero he preparado **3 opciones** para desplegar tu proyecto:

---

## 🚀 OPCIÓN 1: Usar el Botón "Publish" (MÁS FÁCIL)

**Ya está habilitado arriba en tu interfaz.**

1. Haz clic en **"Publish"** 
2. Sigue el flujo de Vercel
3. Configura las variables de entorno:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```

---

## 🔧 OPCIÓN 2: Vercel CLI Manual

He instalado Vercel CLI en el proyecto. Ejecuta en tu terminal:

```bash
cd /workspace
npx vercel login  # Autentícate una vez
npx vercel        # Deploy preview
npx vercel --prod # Deploy a producción
```

Durante el primer deploy, Vercel preguntará:
- **Set up and deploy?** → Yes
- **Which scope?** → Tu cuenta/team
- **Link to existing project?** → No
- **Project name?** → dedicastudio
- **Directory?** → ./
- **Override settings?** → No

---

## ⚙️ OPCIÓN 3: GitHub Actions (AUTOMÁTICO)

He creado `.github/workflows/deploy.yml` para deployment automático en cada push.

**Configuración necesaria**:

1. Ve a tu repositorio en GitHub → Settings → Secrets
2. Agrega estos secrets:
   - `VERCEL_TOKEN` - Obtén en https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Obtén con `npx vercel --debug` (primera línea)
   - `VERCEL_PROJECT_ID` - Obtén con `npx vercel --debug` (segunda línea)

3. Haz push a `main`:
```bash
git push origin main
```

El deployment se ejecutará automáticamente.

---

## 📦 Archivos Preparados

He creado estos archivos de configuración:

- ✅ `vercel.json` - Configuración de build
- ✅ `.vercelignore` - Archivos a ignorar
- ✅ `.github/workflows/deploy.yml` - CI/CD automático
- ✅ Vercel CLI instalado localmente

---

## 🎯 Recomendación

**Para deployment inmediato**: Usa la **OPCIÓN 1** (botón Publish)

**Para automation**: Configura la **OPCIÓN 3** (GitHub Actions)

---

## 🔑 Variables de Entorno Requeridas

No olvides configurar en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]
```

Obtén estos valores en: https://supabase.com/dashboard → Tu Proyecto → Settings → API

---

## ✅ Todo Está Listo

- ✅ Build funciona correctamente
- ✅ Vercel CLI instalado
- ✅ Configuración de Vercel creada
- ✅ GitHub Actions configurado
- ✅ Botón Publish habilitado

**Elige la opción que prefieras y procede con el deployment.** 🚀
