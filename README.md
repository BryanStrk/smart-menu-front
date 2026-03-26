<div align="center">

# 🍽️ SmartMenu — Sistema de Menú Inteligente

**Aplicación Angular para la digitalización de menús, gestión de pedidos en tiempo real y recomendaciones nutricionales impulsadas por IA.**

[![Angular](https://img.shields.io/badge/Angular-v20.3-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com)
[![Angular Material](https://img.shields.io/badge/Angular_Material-20.2-FF4081?style=for-the-badge&logo=angular&logoColor=white)](https://material.angular.io)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev)

</div>

---

## 📋 Tabla de Contenidos

1. [Descripción](#-descripción)
2. [Características Principales](#-características-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
5. [Estructura de Carpetas](#-estructura-de-carpetas)
6. [Instalación y Configuración](#-instalación-y-configuración)
7. [Scripts Disponibles](#-scripts-disponibles)
8. [Sistema de Roles y Rutas Protegidas](#-sistema-de-roles-y-rutas-protegidas)
9. [Módulo de Recomendación IA](#-módulo-de-recomendación-ia)
10. [Gestión de Estado](#-gestión-de-estado)
11. [Guía de Estilo](#-guía-de-estilo)
12. [Documentación Técnica](#-documentación-técnica)

---

## 📖 Descripción

SmartMenu es una **Single Page Application (SPA)** desarrollada con Angular 20 que digitaliza la experiencia completa de un restaurante: desde la carta interactiva y el pedido en mesa, hasta la gestión en cocina/barra y la administración del catálogo de productos.

El sistema integra un **motor de recomendación nutricional basado en IA** que analiza los datos biométricos del cliente (edad, peso, altura, objetivo nutricional y tipo de dieta) para sugerir combinaciones de menú personalizadas, calculando la ingesta calórica óptima y los macronutrientes.

> Proyecto académico desarrollado en equipo como parte del ciclo formativo **DAW (Desarrollo de Aplicaciones Web)**, conectado al backend **SmartMenu Backend** (Spring Boot + MongoDB).

---

## ✨ Características Principales

| Característica | Descripción |
|---|---|
| 🤖 **Recomendaciones por IA** | El cliente introduce sus datos biométricos y recibe menús personalizados adaptados a sus objetivos nutricionales (perder peso, mantener, ganar músculo) y tipo de dieta (normal, vegetariana, vegana). |
| 📋 **Carta digital interactiva** | Catálogo de productos filtrable por categoría (Entrantes, Principales, Postres, Bebidas) con búsqueda en tiempo real y contador de calorías. |
| 🛒 **Carrito persistente** | Estado del pedido almacenado en `localStorage`, con soporte de múltiples rondas de comandas por mesa y registro de historial local. |
| 🍳 **Panel de barra / cocina** | Vista en tiempo real de los pedidos activos con actualización automática por **polling** cada 10 segundos. Permite avanzar el estado de cada pedido (RECIBIDO → EN_PREPARACION → LISTO → ENTREGADO). |
| 🔧 **Panel de administración** | CRUD completo de productos con formulario reactivo validado: nombre, precio, IVA, kcal, macronutrientes, alérgenos, etiquetas, imagen y disponibilidad. |
| 🔐 **Control de acceso por roles** | Guard de rutas que valida autenticación (JWT) y autorización (CLIENTE, EMPLEADO, EMPRESA) en cada navegación. |
| 📱 **Diseño responsive** | Interfaz oscura con tema dorado-accent (`--accent: #d6b15e`) optimizada para tablets de mesa y dispositivos móviles. |

---

## 🛠️ Stack Tecnológico

### Dependencias de Producción

| Paquete | Versión | Propósito |
|---|---|---|
| `@angular/core` | ^20.3.0 | Framework principal (standalone components) |
| `@angular/router` | ^20.3.0 | Enrutado SPA con lazy loading |
| `@angular/forms` | ^20.3.0 | Formularios reactivos (`ReactiveFormsModule`) |
| `@angular/material` | ^20.2.14 | Componentes UI (botones, modales, inputs) |
| `@angular/cdk` | ^20.2.14 | Primitivas de comportamiento UI |
| `bootstrap` | ^5.3.8 | Grid system y utilidades CSS |
| `rxjs` | ~7.8.0 | Programación reactiva (Observables, polling) |
| `zone.js` | ~0.15.0 | Detección de cambios de Angular |

### Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---|---|---|
| `@angular/cli` | ^20.3.6 | Toolchain de Angular |
| `typescript` | ~5.9.2 | Lenguaje de tipado estático |
| `typedoc` | ^0.28.16 | Generación de documentación API |
| `karma` + `jasmine` | ~6.4 / ~5.9 | Suite de testing unitario |

---

## 🏗️ Arquitectura del Proyecto

SmartMenu sigue una arquitectura en capas basada en el patrón **Servicio → Store → Componente**, con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                 │
│         Pages (login, menu, pedir, barra, admin…)       │
│         Components reutilizables (Nav, Footer)          │
└──────────────────────┬──────────────────────────────────┘
                       │ inyección de dependencias
┌──────────────────────▼──────────────────────────────────┐
│                   CAPA DE ESTADO LOCAL                  │
│          PedidoStore → localStorage (carrito,           │
│          mesa, historial de rondas, ID de pedido)       │
└──────────────────────┬──────────────────────────────────┘
                       │ cuando el usuario confirma
┌──────────────────────▼──────────────────────────────────┐
│                   CAPA DE SERVICIOS                     │
│   AuthService · MenuService · PedidoService             │
│   AdminProductosService · RecommendationService         │
└──────────────────────┬──────────────────────────────────┘
                       │ usa
┌──────────────────────▼──────────────────────────────────┐
│                     CAPA HTTP                           │
│   ApiClient (wrapper centralizado de HttpClient)        │
│   authInterceptor → inyecta JWT en cada petición        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
              ┌────────▼────────┐
              │  Backend :9002  │
              │  Spring Boot    │
              │  + MongoDB      │
              └─────────────────┘
```

### Principios de diseño aplicados

- **Standalone Components**: todos los componentes y páginas son standalone (sin NgModules), siguiendo el modelo moderno de Angular 17+.
- **Lazy Loading**: cada ruta carga su componente bajo demanda con `loadComponent()`, reduciendo el bundle inicial.
- **Centralización de endpoints**: el objeto `endpoints` en `config/endpoints.ts` es la única fuente de verdad para las rutas API. Ningún servicio escribe URLs literales.
- **Interceptor transparente**: `authInterceptor` añade automáticamente el header `Authorization: Bearer <token>` sin que los servicios lo gestionen individualmente.
- **Guard de roles compuesto**: `roleGuard` valida tanto autenticación (¿hay token?) como autorización (¿el rol del usuario está en `data.roles`?).

---

## 📁 Estructura de Carpetas

```
smart-menu-front-main/
├── src/
│   ├── app/
│   │   │
│   │   ├── api/                           # 🌐 Capa de comunicación HTTP
│   │   │   ├── api-client.ts              #    Wrapper de HttpClient (get/post/put/patch/delete)
│   │   │   ├── auth-service.ts            #    Login, logout, token JWT, rol del usuario
│   │   │   ├── menu-service.ts            #    GET catálogo de productos
│   │   │   ├── pedido-service.ts          #    CRUD de pedidos y cambio de estado
│   │   │   ├── admin-productos-service.ts #    CRUD de productos (panel admin)
│   │   │   ├── recommendation-service.ts  #    POST al motor de IA nutricional
│   │   │   └── service-call-service.ts    #    Llamada al camarero desde mesa
│   │   │
│   │   ├── http/                          # 🔒 Interceptores HTTP
│   │   │   └── auth.interceptor.ts        #    Añade Authorization: Bearer <token>
│   │   │
│   │   ├── components/                    # 🧩 Componentes reutilizables
│   │   │   ├── nav-component/             #    Barra de navegación (adaptativa por rol)
│   │   │   └── footer-component/          #    Pie de página
│   │   │
│   │   ├── config/                        # ⚙️ Configuración global
│   │   │   ├── endpoints.ts               #    Diccionario centralizado de rutas API
│   │   │   └── app.config.ts              #    Providers de Angular (router, HTTP + interceptor)
│   │   │
│   │   ├── guards/                        # 🛡️ Protección de rutas
│   │   │   └── role.guard.ts              #    Valida autenticación y autorización por rol
│   │   │
│   │   ├── models/                        # 📐 Interfaces y tipos TypeScript
│   │   │   ├── auth.models.ts             #    User, AuthResponse, Role
│   │   │   ├── menu.models.ts             #    Producto, MenuResponse
│   │   │   ├── order.models.ts            #    OrderItem, CreateOrderRequest, OrderResponse
│   │   │   ├── producto.model.ts          #    Modelo extendido con macros nutricionales
│   │   │   └── recomendation.models.ts    #    DietType, GoalType, RecommendationRequest/Response
│   │   │
│   │   ├── pages/                         # 📄 Vistas principales (lazy loaded)
│   │   │   ├── login/                     #    Formulario de acceso con JWT
│   │   │   ├── inicio/                    #    Dashboard de bienvenida post-login
│   │   │   ├── menu/                      #    Carta digital + carrito (modo ver / modo armar IA)
│   │   │   ├── pedir/                     #    Revisión del carrito y confirmación de pedido
│   │   │   ├── formulario-ia/             #    Formulario biométrico + sugerencias del motor IA
│   │   │   ├── barra/                     #    Panel kanban de cocina con polling automático
│   │   │   ├── admin/                     #    CRUD de productos con formulario reactivo
│   │   │   └── pagina404/                 #    Página de error para rutas no encontradas
│   │   │
│   │   ├── services/                      # 🔧 Lógica de negocio adicional
│   │   │   └── producto.ts                #    Transformaciones y helpers de productos
│   │   │
│   │   ├── state/                         # 🗄️ Gestión de estado (localStorage)
│   │   │   └── pedido.store.ts            #    Carrito, mesa, ID pedido, historial de rondas
│   │   │
│   │   ├── app.routes.ts                  # 🗺️ Configuración del enrutado principal
│   │   ├── app.ts                         #    Componente raíz
│   │   └── app.html / app.css             #    Template y estilos del root
│   │
│   ├── environment/
│   │   └── environment.ts                 # 🌍 Variables de entorno (apiUrl)
│   ├── styles.css                         # 🎨 CSS global + custom properties de diseño
│   ├── custom-theme.scss                  #    Tema personalizado de Angular Material
│   ├── index.html
│   └── main.ts                            #    Bootstrap de la aplicación
│
├── typedoc.json                           # Configuración de TypeDoc
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

Asegúrate de tener instalado en tu sistema:

- **Node.js** ≥ 20.x → [nodejs.org](https://nodejs.org)
- **npm** ≥ 8.x (incluido con Node.js)
- **Angular CLI** ≥ 20.x

```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli

# Verificar versiones
node --version   # v20.x o superior
ng version       # Angular CLI: 20.x
```

### Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd smart-menu-front-main

# 2. Instalar dependencias
npm install

# 3. Arrancar en modo desarrollo
npm start
```

La aplicación estará disponible en **[http://localhost:4200](http://localhost:4200)**

> ⚠️ El backend SmartMenu debe estar corriendo en el puerto configurado (por defecto `9002`) para que las llamadas HTTP funcionen correctamente.

### Configuración del entorno

El archivo `src/environment/environment.ts` centraliza la URL base de la API. Actualízala según el entorno de despliegue:

```typescript
// Desarrollo local
export const environment = {
  production: false,
  apiUrl: 'http://localhost:9002',
};

// Producción
export const environment = {
  production: true,
  apiUrl: 'https://tu-servidor.com/api',
};
```

> El `authInterceptor` usa `environment.apiUrl` para determinar a qué peticiones añadir el header de autenticación. Mantener esta variable actualizada es crítico para el correcto funcionamiento en todos los entornos.

---

## 📜 Scripts Disponibles

Todos los scripts se ejecutan desde la raíz del proyecto con `npm run <script>`:

```bash
# Inicia el servidor de desarrollo con hot reload
npm start
# Equivale a: ng serve — disponible en http://localhost:4200

# Compila la aplicación para producción (output: /dist)
npm run build
# Activa optimizaciones: tree-shaking, minificación, AOT

# Compila en modo watch para desarrollo iterativo
npm run watch
# Equivale a: ng build --watch --configuration development

# Ejecuta la suite de tests unitarios con Karma + Jasmine
npm test
# Abre Chrome con el informe de cobertura en tiempo real

# Genera la documentación técnica del proyecto con TypeDoc
npm run generate-docs
# Lee los comentarios JSDoc del código fuente
# y genera una referencia API navegable en HTML
```

### Build de producción

```bash
npm run build

# El output en /dist/ incluye:
# ├── index.html
# ├── main-[hash].js        (bundle principal + lazy chunks)
# ├── polyfills-[hash].js
# └── styles-[hash].css
```

---

## 🔐 Sistema de Roles y Rutas Protegidas

SmartMenu implementa un control de acceso basado en roles (**RBAC**) mediante el `roleGuard`. El guard evalúa dos condiciones en cada navegación:

1. **Autenticación**: ¿existe un token JWT válido en `localStorage`?
2. **Autorización**: ¿el rol del usuario está incluido en el array `data.roles` de la ruta?

```typescript
// src/app/guards/role.guard.ts
export const roleGuard: CanActivateFn = (route) => {
  if (!auth.isLoggedIn()) {
    router.navigateByUrl('/login');   // Sin sesión → redirige al login
    return false;
  }

  const rolesPermitidos = route.data['roles'] as string[];
  const userRole = auth.getRole();

  if (rolesPermitidos && !rolesPermitidos.includes(userRole)) {
    router.navigateByUrl('/inicio');  // Sesión válida pero sin rol → redirige a inicio
    return false;
  }

  return true;
};
```

### Matriz de acceso por ruta

| Ruta | CLIENTE | EMPLEADO | EMPRESA |
|---|:---:|:---:|:---:|
| `/login` | ✅ | ✅ | ✅ |
| `/inicio` | ✅ | ✅ | ✅ |
| `/menu` | ✅ | ✅ | ✅ |
| `/pedir` | ✅ | ✅ | ✅ |
| `/formulario-ia` | ✅ | ✅ | ✅ |
| `/barra` | ❌ | ✅ | ✅ |
| `/admin` | ❌ | ❌ | ✅ |

### Flujo de autenticación

```
POST /auth/login  { email, password }
        │
        ▼
  { token, user: { id, nombre, rol, mesaId? } }
        │
        ├──► localStorage.setItem('sm_token', token)
        └──► localStorage.setItem('sm_user', JSON.stringify(user))
                       │
                       ▼
             authInterceptor actúa en cada petición saliente
             └──► Authorization: Bearer <token>
```

---

## 🤖 Módulo de Recomendación IA

El formulario IA (`/formulario-ia`) es el componente diferenciador de SmartMenu. Recoge datos biométricos del cliente y obtiene del backend un conjunto de menús personalizados calculados por el motor de IA.

### Modelos de datos

```typescript
// Tipos de dieta soportados
export enum DietType {
  NORMAL      = 'NORMAL',
  VEGETARIANA = 'VEGETARIANA',
  VEGANA      = 'VEGANA',
}

// Objetivos nutricionales del cliente
export enum GoalType {
  PERDER_PESO   = 'PERDER_PESO',
  MANTENER      = 'MANTENER',
  GANAR_MUSCULO = 'GANAR_MUSCULO',
}

// Payload enviado al endpoint POST /recommendations
export interface RecommendationRequest {
  restauranteId?: string;
  edad:           number;
  pesoKg:         number;
  alturaCm:       number;
  dieta:          DietType;
  objetivo:       GoalType;
  kcalObjetivo:   number;
  incluirBebida:  boolean;
}

// Respuesta con menús sugeridos y totales nutricionales
export interface RecommendationResponse {
  kcalObjetivo: number;
  menus: MenuSuggestion[];
}
```

### Flujo completo del recomendador

```
Usuario rellena formulario biométrico (/formulario-ia)
        │
        ▼
RecommendationService → POST /recommendations
        │
        ▼
Backend calcula menús óptimos (proximidad calórica)
        │
        ▼
Frontend muestra sugerencias con kcal y proteínas totales
        │
Usuario selecciona un menú → "Ver en carta"
        │
        ▼
Router.navigate(['/menu'], {
  queryParams: {
    modo: 'armar',
    recomendados: 'id1,id2,id3',
    kcal: 1850
  }
})
        │
        ▼
/menu activa el modo 'armar': resalta visualmente los
productos sugeridos y permite añadirlos al carrito.
```

---

## 🗄️ Gestión de Estado

El estado de la sesión del cliente se gestiona con `PedidoStore`, un servicio singleton que persiste en `localStorage` sin dependencias externas:

| Clave `localStorage` | Contenido | Gestionada por |
|---|---|---|
| `sm_token` | JWT de autenticación | `AuthService` |
| `sm_user` | Objeto usuario `{ id, nombre, rol, mesaId }` | `AuthService` |
| `sm_carrito` | Array `ItemCarrito[]` (productos en selección) | `PedidoStore` |
| `sm_mesa` | Identificador de mesa | `PedidoStore` |
| `sm_pedido_id` | ID único de la sesión de pedido | `PedidoStore` |
| `sm_historial_pedidos` | Array de rondas de comandas enviadas | `PedidoStore` |
| `estado_actual` | Estado del pedido activo | `PedidoStore` |

### API pública de `PedidoStore`

```typescript
// Carrito
obtenerItems(): ItemCarrito[]
guardarItems(items: ItemCarrito[]): void
totalItems(): number          // Cantidad total de unidades
totalEuros(): number          // Importe total del carrito

// Mesa y sesión
guardarMesa(mesa: string): void
obtenerMesa(): string
guardarIdPedido(id: string): void
obtenerIdPedido(): string     // Genera uno aleatorio si no existe

// Estado y historial de rondas
guardarEstado(estado: string): void
obtenerEstado(): string
agregarAlHistorial(comanda: any): void
obtenerHistorial(): any[]

// Reset completo de la sesión de mesa
vaciar(): void
```

---

## 🎨 Guía de Estilo

### Prettier

El proyecto usa **Prettier** para el formateo automático y consistente del código. La configuración está definida en `package.json`:

```json
"prettier": {
  "printWidth": 100,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.html",
      "options": { "parser": "angular" }
    }
  ]
}
```

Reglas clave a tener en cuenta:
- **Comilla simple** (`singleQuote: true`) en todos los archivos TypeScript.
- **Longitud de línea máxima**: 100 caracteres.
- **Parser `angular`** para templates HTML: respeta la sintaxis de bindings `[()]`, directivas `*ngIf` y pipes.

### CSS Custom Properties (Variables globales)

El sistema de diseño se controla desde `src/styles.css`. Para personalizar la identidad visual del restaurante, modificar únicamente estas variables:

```css
:root {
  /* Fondos */
  --bg:        #0f1115;   /* Fondo principal oscuro */
  --surface:   #161a22;   /* Superficie de tarjetas */
  --surface-2: #1c2230;   /* Superficie secundaria / hover */

  /* Acento de marca (cambiar para personalizar el restaurante) */
  --accent:    #d6b15e;   /* Color principal de acción — dorado */
  --accent-2:  #b8923b;   /* Dorado para estados hover/pressed */

  /* Estados semánticos */
  --danger:    #ff5a5f;
  --success:   #2ecc71;

  /* Tipografía */
  --text:      rgba(255, 255, 255, 0.92);
  --muted:     rgba(255, 255, 255, 0.65);
  --border:    rgba(255, 255, 255, 0.08);

  /* Layout */
  --radius:    18px;
  --radius-lg: 24px;
  --shadow:    0 12px 30px rgba(0, 0, 0, 0.35);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes y clases | `PascalCase` | `FormularioIa`, `NavComponent` |
| Servicios | `PascalCase` + sufijo `Service` | `AuthService`, `PedidoService` |
| Interfaces y tipos | `PascalCase` | `ItemCarrito`, `AdminProducto` |
| Variables y métodos | `camelCase` | `obtenerItems()`, `totalEuros()` |
| Archivos | `kebab-case` | `pedido-service.ts`, `role.guard.ts` |
| Rutas URL | `kebab-case` | `/formulario-ia`, `/pagina404` |
| Enums | `PascalCase` (clave) + `UPPER_SNAKE_CASE` (valor) | `DietType.VEGETARIANA` |

---

## 📚 Documentación Técnica

El proyecto está documentado con **TypeDoc**, que genera una referencia API navegable en HTML a partir de los comentarios JSDoc del código fuente.

```bash
# Generar la documentación
npm run generate-docs
```

Los servicios, stores, guards y modelos incluyen comentarios `/** */` con descripción de métodos y parámetros, siguiendo el estándar JSDoc:

```typescript
/**
 * Recupera el ID del pedido o genera uno nuevo si no existe.
 * @returns Identificador único de la sesión de pedido.
 */
obtenerIdPedido(): string { ... }

/**
 * Añade una nueva comanda confirmada al historial local.
 * @param comanda Objeto con los datos de la ronda enviada.
 */
agregarAlHistorial(comanda: any): void { ... }
```

---

<div align="center">

**SmartMenu** · Proyecto académico DAW · Angular 20 + Spring Boot + MongoDB

</div>


