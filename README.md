# Cadete CGR

Pequeña aplicación/juego web estático desarrollado con **HTML**, **CSS** y **JavaScript**.  
El objetivo del proyecto es ofrecer una experiencia ligera que pueda ejecutarse directamente en el navegador, sin dependencias pesadas ni backend.

### Objetivo

Procesar las respuestas del jugador para verificar si las respuestas de la IA son correctas o qué tanto se acercan a una respuesta correcta. Esto ayudará al equipo a hacer ajustes para mejorar el servicio.


## 👀 Vista rápida

- **Frontend puro**: HTML + CSS + JS vanilla.
- **Ejecución local sencilla**: basta con abrir `index.html` o usar un servidor estático.
- **Estructura clara**: recursos en `assets/`, estilos en `style.css`, lógica en `game.js`.

## 🧱 Estructura del proyecto
```
cadete_cgr/
├── assets/ # Imágenes, íconos, audio u otros recursos estáticos
├── index.html # Página principal
├── style.css # Estilos de la interfaz
└── game.js # Lógica y comportamiento del juego/app
```

> Esta estructura y archivos existen en el repo público. Si añades otros (por ejemplo sprites o audio), colócalos dentro de `assets/`.

## 🚀 Cómo ejecutar

### Opción A: abrir directo en el navegador
1. Clona o descarga el repositorio.
2. Abre `index.html` con tu navegador (doble clic o drag & drop).

> En algunos navegadores, las rutas relativas a archivos locales pueden restringir acceso a recursos. Si algo no carga, usa un servidor estático (opción B).

### Opción B: servidor estático local

#### Con **Python 3**:
```
# Desde la carpeta del proyecto
python -m http.server 5500
# Abre: http://localhost:5500
```
#### Con Node (http-server):
```
npm i -g http-server
http-server -p 5500
# Abre: http://localhost:5500
```
#### Con VS Code (Live Server):

- Instala la extensión Live Server.

- Click derecho sobre index.html → Open with Live Server.

### 🧩 Dependencias

- No requiere dependencias externas para ejecutarse.
- Para desarrollo se recomienda un navegador moderno (Chrome, Edge, Firefox).
