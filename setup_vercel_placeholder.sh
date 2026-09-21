#!/bin/bash

# Configurar variables placeholder en Vercel
echo "🔧 Configurando variables placeholder en Vercel..."

cd /workspace

# Agregar variables de entorno con valores placeholder
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development <<< "https://placeholder.supabase.co" > /dev/null 2>&1
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder" > /dev/null 2>&1
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjgwMCwiZXhwIjoxOTYwNzY4ODAwfQ.placeholder" > /dev/null 2>&1

echo "✅ Variables placeholder configuradas"
echo ""
echo "Nota: Estas son variables placeholder. Necesitarás reemplazarlas"
echo "con tus credenciales reales de Supabase."
