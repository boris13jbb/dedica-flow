#!/bin/bash

# 🚀 DedicaFlow - Script de Setup Automático
# Este script ayuda a configurar el proyecto rápidamente

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

print_success() {
    print_color "$GREEN" "✅ $1"
}

print_error() {
    print_color "$RED" "❌ $1"
}

print_warning() {
    print_color "$YELLOW" "⚠️  $1"
}

print_info() {
    print_color "$BLUE" "ℹ️  $1"
}

print_header() {
    echo ""
    print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_color "$BLUE" "  $1"
    print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Banner
echo ""
print_color "$BLUE" "╔═══════════════════════════════════════════╗"
print_color "$BLUE" "║                                           ║"
print_color "$BLUE" "║         🎨 DEDICAFLOW SETUP 🎨            ║"
print_color "$BLUE" "║                                           ║"
print_color "$BLUE" "║   Sistema de Experiencias Interactivas   ║"
print_color "$BLUE" "║                                           ║"
print_color "$BLUE" "╚═══════════════════════════════════════════╝"
echo ""

# 1. Verificar prerequisitos
print_header "1. Verificando Prerequisitos"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js instalado: $NODE_VERSION"
    
    # Verificar versión mínima (18.0.0)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js version 18+ requerida. Tienes: $NODE_VERSION"
        exit 1
    fi
else
    print_error "Node.js no está instalado"
    print_info "Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm instalado: v$NPM_VERSION"
else
    print_error "npm no está instalado"
    exit 1
fi

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git instalado: $GIT_VERSION"
else
    print_warning "Git no está instalado (opcional pero recomendado)"
fi

# 2. Instalación de dependencias
print_header "2. Instalando Dependencias"

print_info "Esto puede tomar algunos minutos..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    exit 1
fi

# 3. Configuración de variables de entorno
print_header "3. Configurando Variables de Entorno"

if [ -f ".env.local" ]; then
    print_warning ".env.local ya existe"
    read -p "¿Deseas sobrescribirlo? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Manteniendo .env.local existente"
    else
        cp .env.example .env.local
        print_success ".env.local creado desde .env.example"
    fi
else
    cp .env.example .env.local
    print_success ".env.local creado desde .env.example"
fi

print_warning "IMPORTANTE: Debes configurar tus credenciales de Supabase en .env.local"
echo ""
print_info "Necesitas:"
print_info "  1. NEXT_PUBLIC_SUPABASE_URL"
print_info "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY"
print_info "  3. SUPABASE_SERVICE_ROLE_KEY"
echo ""
print_info "Obtén estas credenciales en: https://supabase.com/dashboard"
echo ""

read -p "¿Quieres configurar las credenciales ahora? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Abre .env.local en tu editor y configura las variables"
    print_info "Luego ejecuta este script nuevamente o continúa manualmente"
    
    # Intentar abrir con editor disponible
    if command -v code &> /dev/null; then
        code .env.local
    elif command -v nano &> /dev/null; then
        nano .env.local
    elif command -v vim &> /dev/null; then
        vim .env.local
    else
        print_info "Abre .env.local manualmente en tu editor favorito"
    fi
fi

# 4. Verificar configuración de Supabase
print_header "4. Verificando Configuración de Supabase"

if grep -q "tu-proyecto.supabase.co" .env.local; then
    print_warning "Las credenciales de Supabase aún no están configuradas"
    print_info "Edita .env.local con tus credenciales reales"
    SUPABASE_CONFIGURED=false
else
    print_success "Credenciales de Supabase configuradas"
    SUPABASE_CONFIGURED=true
fi

# 5. Type checking
print_header "5. Verificando Tipos de TypeScript"

print_info "Ejecutando type check..."
npm run type-check

if [ $? -eq 0 ]; then
    print_success "Type check exitoso"
else
    print_warning "Hay errores de tipado (pueden ser normales en configuración inicial)"
fi

# 6. Lint
print_header "6. Verificando Código (Linter)"

print_info "Ejecutando linter..."
npm run lint

if [ $? -eq 0 ]; then
    print_success "Linter pasó sin errores"
else
    print_warning "Hay warnings del linter (pueden ser normales)"
fi

# 7. Tests (opcional)
print_header "7. Ejecutando Tests"

read -p "¿Quieres ejecutar los tests? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Ejecutando tests unitarios..."
    npm test -- --run
    
    if [ $? -eq 0 ]; then
        print_success "Tests pasaron correctamente"
    else
        print_warning "Algunos tests fallaron"
    fi
else
    print_info "Tests omitidos"
fi

# 8. Resumen y próximos pasos
print_header "8. Resumen y Próximos Pasos"

echo ""
print_color "$GREEN" "╔═══════════════════════════════════════════╗"
print_color "$GREEN" "║                                           ║"
print_color "$GREEN" "║        ✅ SETUP COMPLETADO ✅             ║"
print_color "$GREEN" "║                                           ║"
print_color "$GREEN" "╚═══════════════════════════════════════════╝"
echo ""

if [ "$SUPABASE_CONFIGURED" = false ]; then
    print_warning "⚠️  PENDIENTE: Configurar credenciales de Supabase en .env.local"
    echo ""
fi

print_info "📋 PRÓXIMOS PASOS:"
echo ""
print_info "1. Configura Supabase (si aún no lo hiciste):"
print_color "$BLUE" "   • Ve a https://supabase.com/dashboard"
print_color "$BLUE" "   • Crea un nuevo proyecto"
print_color "$BLUE" "   • Copia las credenciales a .env.local"
echo ""
print_info "2. Ejecuta las migraciones de base de datos:"
print_color "$BLUE" "   • Ve al SQL Editor en Supabase Dashboard"
print_color "$BLUE" "   • Ejecuta: supabase/migrations/20260921000000_initial_schema.sql"
print_color "$BLUE" "   • Ejecuta: supabase/migrations/20260921010000_storage_setup.sql"
print_color "$BLUE" "   • (Opcional) Ejecuta: supabase/seed.sql"
echo ""
print_info "3. Inicia el servidor de desarrollo:"
print_color "$BLUE" "   npm run dev"
echo ""
print_info "4. Abre en tu navegador:"
print_color "$BLUE" "   http://localhost:3000"
echo ""
print_info "📚 RECURSOS:"
print_color "$BLUE" "   • README.md - Documentación principal"
print_color "$BLUE" "   • CONTRIBUTING.md - Guía de contribución"
print_color "$BLUE" "   • FAQ.md - Preguntas frecuentes"
print_color "$BLUE" "   • ARCHITECTURE.md - Arquitectura del proyecto"
echo ""
print_info "🐛 PROBLEMAS?"
print_color "$BLUE" "   • Issues: https://github.com/boris13jbb/dedica-flow/issues"
print_color "$BLUE" "   • FAQ: cat FAQ.md"
echo ""

print_color "$GREEN" "¡Listo para comenzar! 🚀"
echo ""
