-- Seed data for DedicaStudio
-- This seed creates:
-- 1. System template: Galaxy Yellow Flowers
-- 2. Demo workspace (will be created on first user signup)

-- Insert system template: Galaxy Yellow Flowers
INSERT INTO templates (
  id,
  workspace_id,
  key,
  name,
  description,
  category,
  version,
  schema_json,
  default_config,
  is_system,
  is_active
) VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  NULL,
  'galaxy-yellow-flowers',
  'Galaxy Yellow Flowers',
  'Una experiencia inmersiva que combina galaxias, nebulosas y flores en un viaje visual único',
  'immersive',
  '1.0.0',
  '{
    "scenes": [
      {
        "type": "intro",
        "name": "Introducción",
        "description": "Pantalla de bienvenida con botón de inicio"
      },
      {
        "type": "galaxy",
        "name": "Galaxia",
        "description": "Campo estelar en 3D con partículas brillantes"
      },
      {
        "type": "nebula",
        "name": "Nebulosa",
        "description": "Efectos de nebulosa procedural"
      },
      {
        "type": "flowers",
        "name": "Flores",
        "description": "Lluvia de flores en espiral"
      },
      {
        "type": "photoOrbit",
        "name": "Órbita de fotos",
        "description": "Fotografías orbitando en 3D"
      },
      {
        "type": "message",
        "name": "Mensaje",
        "description": "Texto principal con animación"
      },
      {
        "type": "finale",
        "name": "Final",
        "description": "Cierre con opción de repetir"
      }
    ]
  }',
  '{
    "scenes": [
      {
        "sceneType": "intro",
        "sceneKey": "intro-1",
        "name": "Introducción",
        "position": 0,
        "duration": { "enter": 1000, "hold": 0, "exit": 1000 },
        "trigger": "click",
        "enabled": true,
        "config": {
          "title": "Para ti",
          "subtitle": "Una experiencia especial",
          "buttonText": "Comenzar",
          "backgroundColor": "#0a0a0a",
          "textColor": "#ffffff",
          "glowColor": "#fbbf24",
          "particlesEnabled": true
        }
      },
      {
        "sceneType": "galaxy",
        "sceneKey": "galaxy-1",
        "name": "Galaxia",
        "position": 1,
        "duration": { "enter": 3000, "hold": 8000, "exit": 2000 },
        "trigger": "auto",
        "enabled": true,
        "config": {
          "starCount": 3000,
          "starSize": 2.5,
          "starColor": "#ffffff",
          "depth": 100,
          "speed": 0.2,
          "rotationSpeed": 0.1,
          "cameraZ": 50,
          "bloomStrength": 1.5,
          "backgroundColor": "#000000"
        }
      },
      {
        "sceneType": "nebula",
        "sceneKey": "nebula-1",
        "name": "Nebulosa",
        "position": 2,
        "duration": { "enter": 2000, "hold": 6000, "exit": 2000 },
        "trigger": "auto",
        "enabled": true,
        "config": {
          "primaryColor": "#fbbf24",
          "secondaryColor": "#f59e0b",
          "density": 0.7,
          "opacity": 0.6,
          "speed": 0.3,
          "scale": 1.2,
          "bloom": 1.0
        }
      },
      {
        "sceneType": "flowers",
        "sceneKey": "flowers-1",
        "name": "Flores",
        "position": 3,
        "duration": { "enter": 2000, "hold": 10000, "exit": 2000 },
        "trigger": "auto",
        "enabled": true,
        "config": {
          "amount": 40,
          "scale": 1.0,
          "spread": 15,
          "speed": 1.0,
          "rotation": true,
          "mode": "spiral"
        }
      },
      {
        "sceneType": "photoOrbit",
        "sceneKey": "photos-1",
        "name": "Momentos",
        "position": 4,
        "duration": { "enter": 2000, "hold": 12000, "exit": 2000 },
        "trigger": "auto",
        "enabled": true,
        "config": {
          "gallery": [],
          "radius": 8,
          "cardScale": 1.0,
          "speed": 0.5,
          "rotation": true,
          "spacing": 1.5,
          "borderRadius": 8
        }
      },
      {
        "sceneType": "message",
        "sceneKey": "message-1",
        "name": "Mensaje",
        "position": 5,
        "duration": { "enter": 1500, "hold": 0, "exit": 1500 },
        "trigger": "click",
        "enabled": true,
        "config": {
          "text": "Tu mensaje especial aquí.\n\nPuedes usar múltiples líneas.",
          "font": "sans",
          "size": "2xl",
          "color": "#ffffff",
          "align": "center",
          "animation": "fade",
          "duration": 1500,
          "maxWidth": "2xl"
        }
      },
      {
        "sceneType": "finale",
        "sceneKey": "finale-1",
        "name": "Final",
        "position": 6,
        "duration": { "enter": 1500, "hold": 0, "exit": 0 },
        "trigger": "manual",
        "enabled": true,
        "config": {
          "message": "Gracias por acompañarme en este viaje",
          "signature": "Con cariño",
          "date": "",
          "repeatButton": "Ver de nuevo",
          "background": "stars",
          "animation": "fade"
        }
      }
    ],
    "audio": {
      "volume": 0.7,
      "loop": false,
      "fadeIn": 2000,
      "fadeOut": 2000
    },
    "metadata": {
      "noIndex": true
    }
  }',
  TRUE,
  TRUE
);

-- Note: The initial workspace and workspace_member will be created
-- programmatically when the first user signs up
