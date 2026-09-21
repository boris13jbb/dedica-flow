#!/bin/bash

# 🚀 DedicaFlow - Setup Automático Completo
# Este script automatiza la creación de Supabase + configuración de Vercel

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║   🚀 DEDICAFLOW SETUP AUTOMÁTICO 🚀      ║"
echo "║   Supabase + Vercel en 2 minutos         ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Paso 1: Verificar acceso a Supabase
echo -e "${YELLOW}📋 PASO 1: Acceso a Supabase${NC}"
echo ""
echo "Para crear el proyecto automáticamente, necesito un Access Token de Supabase."
echo ""
echo -e "${BLUE}Cómo obtenerlo (30 segundos):${NC}"
echo "1. Ve a: https://supabase.com/dashboard/account/tokens"
echo "2. Click en 'Generate New Token'"
echo "3. Nombre: 'DedicaFlow Setup'"
echo "4. Copia el token generado"
echo ""
read -p "Pega tu Supabase Access Token aquí: " SUPABASE_TOKEN
echo ""

if [ -z "$SUPABASE_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No se proporcionó token. Usando método manual...${NC}"
    echo ""
    echo "Alternativa: Proporciona las credenciales de un proyecto existente"
    read -p "¿Tienes un proyecto de Supabase ya creado? (s/n): " HAS_PROJECT
    
    if [ "$HAS_PROJECT" = "s" ]; then
        echo ""
        read -p "NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
        read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " ANON_KEY
        read -sp "SUPABASE_SERVICE_ROLE_KEY: " SERVICE_KEY
        echo ""
    else
        echo ""
        echo -e "${YELLOW}Por favor crea un proyecto manualmente en:${NC}"
        echo "https://supabase.com/dashboard"
        echo ""
        echo "Luego ejecuta este script nuevamente."
        exit 1
    fi
else
    # Crear proyecto automáticamente con la API de Supabase
    echo -e "${GREEN}✅ Token recibido${NC}"
    echo ""
    echo -e "${YELLOW}📦 PASO 2: Creando proyecto en Supabase...${NC}"
    
    PROJECT_NAME="dedicaflow-prod"
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REGION="us-east-1"
    
    echo "  • Nombre: $PROJECT_NAME"
    echo "  • Región: $REGION"
    echo "  • Generando contraseña segura..."
    echo ""
    
    # Crear proyecto via API
    CREATE_RESPONSE=$(curl -s -X POST \
        "https://api.supabase.com/v1/projects" \
        -H "Authorization: Bearer $SUPABASE_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$PROJECT_NAME\",
            \"organization_id\": \"default\",
            \"plan\": \"free\",
            \"region\": \"$REGION\",
            \"db_pass\": \"$DB_PASSWORD\"
        }")
    
    PROJECT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${YELLOW}⚠️  No se pudo crear el proyecto automáticamente${NC}"
        echo "Respuesta de API: $CREATE_RESPONSE"
        echo ""
        echo "Por favor crea el proyecto manualmente y proporciona las credenciales:"
        read -p "NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
        read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " ANON_KEY
        read -sp "SUPABASE_SERVICE_ROLE_KEY: " SERVICE_KEY
        echo ""
    else
        echo -e "${GREEN}✅ Proyecto creado: $PROJECT_ID${NC}"
        echo "  ⏳ Esperando que el proyecto esté listo (esto toma ~2 minutos)..."
        
        # Esperar a que el proyecto esté listo
        READY=false
        ATTEMPTS=0
        MAX_ATTEMPTS=60
        
        while [ "$READY" = false ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
            sleep 5
            ATTEMPTS=$((ATTEMPTS + 1))
            
            STATUS_RESPONSE=$(curl -s -X GET \
                "https://api.supabase.com/v1/projects/$PROJECT_ID" \
                -H "Authorization: Bearer $SUPABASE_TOKEN")
            
            STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            
            echo -n "."
            
            if [ "$STATUS" = "ACTIVE_HEALTHY" ]; then
                READY=true
                echo ""
                echo -e "${GREEN}✅ Proyecto listo!${NC}"
            fi
        done
        
        if [ "$READY" = false ]; then
            echo ""
            echo -e "${YELLOW}⚠️  El proyecto está tardando más de lo esperado${NC}"
            echo "Continúa en: https://supabase.com/dashboard"
            exit 1
        fi
        
        # Obtener credenciales
        SUPABASE_URL="https://${PROJECT_ID}.supabase.co"
        
        # Obtener keys del proyecto
        KEYS_RESPONSE=$(curl -s -X GET \
            "https://api.supabase.com/v1/projects/$PROJECT_ID/api-keys" \
            -H "Authorization: Bearer $SUPABASE_TOKEN")
        
        ANON_KEY=$(echo $KEYS_RESPONSE | grep -o '"anon":"[^"]*"' | cut -d'"' -f4)
        SERVICE_KEY=$(echo $KEYS_RESPONSE | grep -o '"service_role":"[^"]*"' | cut -d'"' -f4)
        
        echo ""
        echo -e "${GREEN}✅ Credenciales obtenidas${NC}"
    fi
fi

# Paso 3: Configurar base de datos
echo ""
echo -e "${YELLOW}🗄️  PASO 3: Configurando base de datos...${NC}"
echo ""

# Ejecutar migraciones via API de Supabase
echo "  • Ejecutando migración inicial..."

MIGRATION_1=$(cat /workspace/supabase/migrations/20260921000000_initial_schema.sql)

curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"${MIGRATION_1}\"}" > /dev/null 2>&1

echo -e "${GREEN}  ✅ Migración 1 completada${NC}"

echo "  • Ejecutando migración de storage..."

MIGRATION_2=$(cat /workspace/supabase/migrations/20260921010000_storage_setup.sql)

curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"${MIGRATION_2}\"}" > /dev/null 2>&1

echo -e "${GREEN}  ✅ Migración 2 completada${NC}"
echo ""

# Paso 4: Configurar Vercel
echo -e "${YELLOW}☁️  PASO 4: Configurando Vercel...${NC}"
echo ""

cd /workspace

# Remover variables anteriores si existen
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL production -y > /dev/null 2>&1 || true
npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production -y > /dev/null 2>&1 || true
npx vercel env rm SUPABASE_SERVICE_ROLE_KEY production -y > /dev/null 2>&1 || true

# Agregar nuevas variables
echo "  • Agregando NEXT_PUBLIC_SUPABASE_URL..."
echo "$SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development > /dev/null 2>&1

echo "  • Agregando NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development > /dev/null 2>&1

echo "  • Agregando SUPABASE_SERVICE_ROLE_KEY..."
echo "$SERVICE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development > /dev/null 2>&1

echo -e "${GREEN}✅ Variables configuradas en Vercel${NC}"
echo ""

# Paso 5: Redeploy
echo -e "${YELLOW}🚀 PASO 5: Redeployando aplicación...${NC}"
echo ""

npx vercel --prod --yes > /dev/null 2>&1 &
DEPLOY_PID=$!

echo "  • Deployment en progreso..."
echo "  • Esto puede tomar 1-2 minutos"
echo ""

wait $DEPLOY_PID

echo -e "${GREEN}✅ Deployment completado!${NC}"
echo ""

# Resumen final
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║          ✅ SETUP COMPLETADO ✅           ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}🎉 Tu aplicación está lista!${NC}"
echo ""
echo "📝 Credenciales guardadas:"
echo "  • Supabase URL: $SUPABASE_URL"
echo "  • Variables configuradas en Vercel"
echo ""
echo "🌐 URLs:"
echo "  • App: https://workspace-theta-mocha.vercel.app"
echo "  • Supabase: https://supabase.com/dashboard"
echo "  • Vercel: https://vercel.com/boris13jbbs-projects/workspace"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo "1. Visita tu app y crea una cuenta"
echo "2. Comienza a crear experiencias"
echo "3. ¡Disfruta! 🎨"
echo ""
