# 🔒 Política de Seguridad

## 📋 Versiones Soportadas

| Versión | Soporte           |
| ------- | ----------------- |
| 0.1.x   | :white_check_mark:|

## 🚨 Reportar una Vulnerabilidad

La seguridad de DedicaFlow es una prioridad. Si descubres una vulnerabilidad de seguridad, por favor repórtala de manera responsable.

### ¿Qué Considerar como Vulnerabilidad?

- Ejecución de código remoto
- Inyección SQL
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Bypass de autenticación
- Escalada de privilegios
- Exposición de datos sensibles
- Vulnerabilidades en dependencias críticas

### Cómo Reportar

**NO** crees un issue público para vulnerabilidades de seguridad.

En su lugar:

1. **Email**: Contacta al propietario del repositorio directamente
2. **Información a Incluir**:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir el problema
   - Impacto potencial
   - Posibles soluciones (si las tienes)
   - Tu información de contacto

### Proceso de Respuesta

1. **Confirmación**: Recibirás una respuesta inicial en 48 horas
2. **Evaluación**: Evaluaremos la vulnerabilidad en 5 días hábiles
3. **Corrección**: Trabajaremos en un fix dependiendo de la severidad
4. **Release**: Publicaremos un fix y un advisory de seguridad
5. **Crédito**: Te acreditaremos en el CHANGELOG (si lo deseas)

## 🛡️ Mejores Prácticas de Seguridad

### Para Usuarios

1. **Variables de Entorno**
   - Nunca commits archivos `.env` o `.env.local`
   - Usa valores seguros para `SUPABASE_SERVICE_ROLE_KEY`
   - Rota tus claves periódicamente

2. **Autenticación**
   - Usa contraseñas fuertes
   - Habilita 2FA en Supabase
   - No compartas credenciales

3. **Deployment**
   - Mantén las variables de entorno seguras en Vercel
   - Usa HTTPS en producción
   - Configura CORS apropiadamente

### Para Desarrolladores

1. **Código Seguro**
   - Valida todas las entradas de usuario
   - Usa prepared statements para queries
   - Sanitiza datos antes de renderizar
   - No expongas información sensible en logs

2. **Dependencias**
   - Mantén las dependencias actualizadas
   - Ejecuta `npm audit` regularmente
   - Revisa las alertas de seguridad de GitHub

3. **RLS Policies**
   - Siempre habilita Row Level Security
   - Revisa las policies regularmente
   - Prueba las policies con diferentes roles

4. **Supabase Storage**
   - Configura permisos de bucket correctamente
   - Valida tipos de archivo en upload
   - Limita tamaños de archivo

## 🔍 Auditorías de Seguridad

### Herramientas Recomendadas

```bash
# Audit de dependencias
npm audit

# Fix automático de vulnerabilidades
npm audit fix

# Análisis estático de código
npm run lint

# Type checking
npm run type-check
```

### Checklist de Seguridad

- [ ] Variables de entorno no commiteadas
- [ ] RLS policies habilitadas en todas las tablas
- [ ] Autenticación requerida en rutas protegidas
- [ ] CORS configurado correctamente
- [ ] Validación de inputs en forms
- [ ] Sanitización de outputs
- [ ] Rate limiting en APIs (si aplica)
- [ ] HTTPS en producción
- [ ] Headers de seguridad configurados
- [ ] Logs no exponen datos sensibles

## 📚 Recursos de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist#security)
- [React Security Best Practices](https://react.dev/learn/security)

## 🔄 Actualizaciones de Seguridad

Las actualizaciones de seguridad se publicarán:
- En el [CHANGELOG](CHANGELOG.md)
- En [GitHub Releases](https://github.com/boris13jbb/dedica-flow/releases)
- Como GitHub Security Advisories

Para recibir notificaciones:
1. Ve al repositorio en GitHub
2. Click en "Watch"
3. Selecciona "Custom" → "Security alerts"

## ⚖️ Divulgación Responsable

Apreciamos y reconocemos a los investigadores de seguridad que:
- Reportan vulnerabilidades de manera privada
- Dan tiempo razonable para corregir el problema
- No explotan la vulnerabilidad para propósitos maliciosos

---

**Última actualización**: 21 de septiembre de 2026
