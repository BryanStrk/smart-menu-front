# 🍽️ Smart Menu Front

### Aplicación web cliente para sistema de menú digital inteligente con recomendaciones nutricionales

---

## 📋 Descripción general

**Smart Menu Front** es la aplicación cliente desarrollada con **Angular 20** para el sistema de menú digital de restaurante **SmartMenu**. El frontend proporciona dos experiencias diferenciadas según el rol del usuario: una interfaz orientada a tablet de mesa para el cliente del restaurante (consulta de carta, pedido y seguimiento), y una interfaz de gestión para el personal y empresa (panel kanban de cocina, administración de productos y seguimiento de pedidos).

La aplicación se comunica con el backend **Smart Menu Back** a través de una API REST protegida con JWT, y está diseñada para funcionar como una aplicación web progresiva (PWA-ready) instalable en dispositivos de mesa (tablets) en modo pantalla completa.

El sistema incorpora un módulo de **recomendaciones nutricionales inteligentes** que, partiendo del perfil biométrico del usuario, sugiere combinaciones de platos personalizadas según su dieta y objetivos de salud.

---

## ✅ Funcionalidades principales

- **Autenticación basada en JWT** con almacenamiento seguro en `localStorage` y redirección automática según rol.
- **Guard de roles** que protege las rutas según el perfil del usuario (`CLIENTE`, `EMPRESA`, `EMPLEADO`).
- **Interceptor HTTP funcional** que inyecta automáticamente el token Bearer en todas las peticiones al backend.
- **Carta digital interactiva** con dos modos de uso: modo *visualización* y modo *armar pedido*, con filtros por categoría y buscador en tiempo real.
- **Carrito de pedido con rondas** (comandas múltiples): soporta el envío de varias rondas por mesa sin perder el historial de lo ya pedido en cocina.
- **Seguimiento de estado del pedido** en tiempo real (mediante polling sobre `localStorage`) con barra de progreso visual animada.
- **Panel Kanban de cocina** (`/barra`): vista para el personal con columnas por estado (Recibido → Preparando → Listo → Entregado), agrupadas por mesa, con actualización automática cada 5 segundos.
- **Panel de administración de productos** (`/admin`): CRUD completo de productos del menú con formulario reactivo, validaciones, gestión de tags y alérgenos y filtros de búsqueda.
- **Formulario de recomendaciones IA** (`/formulario-ia`): solicita el perfil biométrico del usuario (edad, peso, altura, dieta, objetivo) y muestra menús sugeridos personalizados con desglose calórico.
- **Botón de llamada al camarero (FAB)** disponible globalmente en todas las vistas, con modal de confirmación y notificación toast.
- **Diseño oscuro** con sistema de CSS Variables cohesionado y tematización con Angular Material 3.
- **Lazy loading** en todas las rutas para optimizar el tiempo de carga inicial.
- **Generación de documentación técnica** con TypeDoc.

---

## 🏛️ Arquitectura del proyecto

El proyecto sigue una **arquitectura basada en componentes standalone** de Angular (sin módulos `NgModule`), siguiendo los patrones modernos de Angular 17+ con la API de `bootstrapApplication`. La separación de responsabilidades se organiza en capas funcionales:

```
┌─────────────────────────────────────────────────────────────────┐
│                 CAPA DE PRESENTACIÓN (Pages / Components)       │
│  Componentes standalone con @Component. Gestionan la UI.        │
│  Usan signals y two-way binding para estado local.              │
└───────────────────────┬─────────────────────────────────────────┘
                        │ inyecta
┌───────────────────────▼─────────────────────────────────────────┐
│              CAPA DE SERVICIOS DE API (api/)                    │
│  AuthService, MenuService, PedidoService, RecommendationService │
│  AdminProductosService, ServiceCallService, OrdersService       │
│  Todos usan ApiClient como wrapper centralizado de HttpClient   │
└───────────────────────┬─────────────────────────────────────────┘
                        │ delega en
┌───────────────────────▼─────────────────────────────────────────┐
│              CAPA DE INFRAESTRUCTURA HTTP (http/)               │
│  ApiClient: construye URLs con la base de environment           │
│  authInterceptor: adjunta el Bearer token a cada petición       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│           CAPA DE ESTADO LOCAL (state/)                         │
│  PedidoStore: gestión del carrito y sesión de mesa              │
│  persiste en localStorage (sin NgRx)                            │
└───────────────────────┬─────────────────────────────────────────┘
                        │ llama a
┌───────────────────────▼─────────────────────────────────────────┐
│                  API REST (Backend Spring Boot)                 │
│  http://localhost:9002 (dev) / http://lakritas.com:8080 (prod)  │
└─────────────────────────────────────────────────────────────────┘
```

### Gestión de estado

No se utiliza NgRx ni ninguna librería de state management externa. El estado se gestiona a tres niveles:

- **Estado de componente**: variables de instancia y `signal()` de Angular para estado local de UI.
- **Estado de sesión de pedido**: `PedidoStore` persiste el carrito, la mesa y el historial de rondas en `localStorage`.
- **Estado de autenticación**: `AuthService` persiste el token JWT y el perfil de usuario en `localStorage`.

### Flujo de autenticación y navegación

1. El usuario accede a `/login` (única ruta pública).
2. `AuthService.login()` realiza el `POST /auth/login` al backend. La respuesta incluye el JWT y el perfil del usuario, que se persisten en `localStorage`.
3. El `roleGuard` protege todas las demás rutas. Verifica que el usuario está autenticado y que su rol está en la lista `data.roles` de la ruta.
4. El `authInterceptor` (funcional, no clase) intercepta **todas** las peticiones HTTP y adjunta la cabecera `Authorization: Bearer <token>` si existe token en `localStorage`.
5. Al navegar a una ruta protegida sin sesión → redirección a `/login`. Con sesión pero sin rol correcto → redirección a `/inicio`.

---

## 📁 Estructura del proyecto

```bash
smart-menu-front-main/
├── src/
│   ├── app/
│   │   ├── api/                             # Servicios de comunicación con el backend
│   │   │   ├── api-client.ts                # Wrapper centralizado de HttpClient (GET/POST/PUT/DELETE/PATCH)
│   │   │   ├── auth-service.ts              # Login, token y perfil de usuario
│   │   │   ├── menu-service.ts              # Obtención y normalización del catálogo de productos
│   │   │   ├── pedido-service.ts            # Creación, listado y cambio de estado de pedidos
│   │   │   ├── orders-service.ts            # Alias/vista de pedidos desde el cliente
│   │   │   ├── admin-productos-service.ts   # CRUD de productos para el panel de administración
│   │   │   ├── recommendation-service.ts    # Petición al motor de recomendaciones nutricionales
│   │   │   └── service-call-service.ts      # Llamada al camarero desde la mesa
│   │   ├── components/                      # Componentes reutilizables
│   │   │   ├── nav-component/               # Barra de navegación inferior (condicional por rol)
│   │   │   └── footer-component/            # Pie de página (pendiente de desarrollar)
│   │   ├── config/
│   │   │   ├── app.config.ts                # Proveedores globales (router, httpClient, interceptor)
│   │   │   └── endpoints.ts                 # Diccionario centralizado de rutas de la API
│   │   ├── guards/
│   │   │   └── role.guard.ts                # Guard funcional: verifica autenticación + rol
│   │   ├── http/
│   │   │   └── auth.interceptor.ts          # Interceptor funcional JWT (agrega Bearer token)
│   │   ├── models/                          # Interfaces y tipos TypeScript
│   │   │   ├── auth.models.ts               # User, AuthResponse, Role
│   │   │   ├── menu.models.ts               # Producto, MenuResponse
│   │   │   ├── order.models.ts              # OrderItem, CreateOrderRequest, OrderResponse
│   │   │   ├── producto.model.ts            # Modelo de producto (variante para admin)
│   │   │   └── recomendation.models.ts      # DietType, GoalType, RecommendationRequest/Response
│   │   ├── pages/                           # Vistas / páginas de la aplicación
│   │   │   ├── login/                       # Pantalla de activación del terminal / login
│   │   │   ├── inicio/                      # Pantalla de bienvenida con acceso a los modos
│   │   │   ├── menu/                        # Carta digital con modos "ver" y "armar pedido"
│   │   │   ├── pedir/                       # Carrito y confirmación de rondas
│   │   │   ├── barra/                       # Panel Kanban para cocina / barra
│   │   │   ├── formulario-ia/               # Formulario de perfil nutricional + recomendaciones IA
│   │   │   ├── admin/                       # Panel de administración de productos (EMPRESA)
│   │   │   └── pagina404/                   # Página de error 404
│   │   ├── services/
│   │   │   └── producto.ts                  # Servicio alternativo de productos (acceso directo)
│   │   ├── state/
│   │   │   └── pedido.store.ts              # Store del carrito y sesión de pedido en localStorage
│   │   ├── app.ts                           # Componente raíz (FAB campana + toast global)
│   │   ├── app.html                         # Template raíz: nav + router-outlet + FAB
│   │   ├── app.routes.ts                    # Definición de rutas (lazy loading)
│   │   └── app.config.ts                    # Configuración de la aplicación (root)
│   ├── environment/
│   │   └── environment.ts                   # URL base de la API (dev/producción)
│   ├── custom-theme.scss                    # Tema Angular Material 3 (paleta azure/blue)
│   ├── styles.css                           # Variables CSS globales + reset + estilos base
│   ├── index.html                           # HTML raíz (Google Fonts Roboto + Material Icons)
│   └── main.ts                             # Punto de entrada: bootstrapApplication()
├── public/
│   └── favicon.ico
├── angular.json                             # Configuración del proyecto Angular CLI
├── package.json                             # Dependencias y scripts npm
├── tsconfig.json                            # Configuración TypeScript (strict mode)
├── typedoc.json                             # Configuración de documentación TypeDoc
├── INTEGRACION.md                           # Guía de integración frontend-backend
└── README.md                               # README original del proyecto
```

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| Angular | 20.3.0 | Framework frontend principal |
| TypeScript | ~5.9.2 | Lenguaje de programación (modo strict) |
| Angular Router | 20.3.0 | Enrutado SPA con lazy loading y guards |
| Angular Forms | 20.3.0 | Template-driven forms y Reactive Forms |
| Angular HttpClient | 20.3.0 | Comunicación HTTP con el backend |
| Angular Material | ^20.2.14 | Componentes UI (tema Material 3) |
| Angular CDK | ^20.2.14 | Primitivas de UI |
| Bootstrap | ^5.3.8 | Grid y utilidades CSS adicionales |
| RxJS | ~7.8.0 | Programación reactiva (Observables) |
| TypeDoc | ^0.28.16 | Generación de documentación técnica |
| Karma + Jasmine | ~6.4.0 | Framework de tests unitarios |
| Zone.js | ~0.15.0 | Detección de cambios Angular |

---

## 🎨 Sistema de diseño

La aplicación implementa un **diseño oscuro personalizado** definido mediante CSS Variables en `styles.css`, complementado con el tema Material 3 de Angular Material configurado en `custom-theme.scss`.

### Paleta de colores principal

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#0f1115` | Fondo base de la aplicación |
| `--surface` | `#161a22` | Superficie de tarjetas y paneles |
| `--surface-2` | `#1c2230` | Superficie secundaria, inputs |
| `--accent` | `#d6b15e` | Color de acción principal (dorado) |
| `--accent-2` | `#b8923b` | Variante del acento |
| `--danger` | `#ff5a5f` | Acciones destructivas |
| `--success` | `#2ecc71` | Confirmaciones y éxito |
| `--text` | `rgba(255,255,255,0.92)` | Texto principal |
| `--muted` | `rgba(255,255,255,0.65)` | Texto secundario |

### Tipografía

Se utiliza **Roboto** (300, 400, 500) servida desde Google Fonts, con Material Icons para iconografía.

---

## 🗺️ Rutas de la aplicación

| Ruta | Componente | Roles permitidos | Descripción |
|---|---|---|---|
| `/login` | `Login` | Público | Activación del terminal / inicio de sesión |
| `/inicio` | `Inicio` | CLIENTE, EMPRESA, EMPLEADO | Pantalla de bienvenida con acceso a modos |
| `/menu` | `Menu` | CLIENTE, EMPRESA, EMPLEADO | Carta digital (modo ver / armar pedido) |
| `/pedir` | `Pedir` | CLIENTE, EMPRESA, EMPLEADO | Carrito y confirmación de rondas |
| `/barra` | `Barra` | EMPRESA, EMPLEADO | Panel Kanban de cocina |
| `/formulario-ia` | `FormularioIa` | CLIENTE, EMPRESA, EMPLEADO | Formulario de perfil nutricional + recomendaciones IA |
| `/admin` | `Admin` | EMPRESA | Panel de administración de productos |
| `/404` | `Pagina404` | Público | Página de error 404 |
| `/**` | — | — | Redirección a `/404` |
| `/` | — | — | Redirección a `/login` |

> Todas las rutas protegidas usan lazy loading (`loadComponent`) para optimizar el bundle inicial.

---

## 📄 Descripción de páginas y componentes

### `Login` — Activación de terminal
Formulario de email y contraseña. Diseñado para el contexto de activación de una tablet de mesa ("Activar dispositivo"). Al autenticar correctamente, redirige a `/inicio` y persiste el JWT y el perfil en `localStorage`.

### `Inicio` — Pantalla de bienvenida
Ofrece dos accesos principales:
- **Menú Inteligente** → navega a `/formulario-ia` para obtener recomendaciones personalizadas por perfil nutricional.
- **Menú Completo** → navega a `/menu?modo=armar` para explorar toda la carta y construir el pedido libremente.

### `Menu` — Carta digital
Componente central de la experiencia del cliente. Implementa dos modos de operación activables por query param:
- **Modo `ver`**: visualización de la carta sin controles de cantidad.
- **Modo `armar`**: permite incrementar/decrementar cantidades de productos y añadirlos al carrito. Muestra el resumen del carrito en tiempo real.

Funcionalidades adicionales:
- **Filtro por categoría** (Entrantes, Principales, Postres, Bebidas) derivado automáticamente del campo `tags` del producto.
- **Buscador por nombre y descripción** con filtrado en tiempo real.
- **Integración con Recomendaciones IA**: si la ruta incluye el query param `recomendados=id1,id2,...`, el menú muestra únicamente los productos recomendados con una etiqueta visual "Recomendado" y permite volver a ver toda la carta.
- **Muestra datos nutricionales**: calorías (kcal), proteínas, grasas y carbohidratos por producto.
- **Sincronización con el carrito**: al cargar, recupera los items del `PedidoStore` y sincroniza las cantidades en la vista.

### `Pedir` — Carrito y confirmación de rondas
Gestiona el flujo completo de confirmación del pedido. Soporta **rondas múltiples** por mesa:
- Los items se clasifican en "EN COCINA (Confirmado)" (ya enviados) y "A PEDIR (Nueva Ronda)" (pendientes).
- Al confirmar, construye un objeto `NuevoPedido` y lo envía al backend vía `PedidoService`.
- Si el backend falla, **opera en modo offline** (fallback local) guardando la comanda en el historial de `PedidoStore`.
- **Seguimiento del estado**: una vez enviada la ronda, muestra una barra de progreso animada que refleja el estado del pedido (`RECIBIDO → PREPARANDO → LISTO → ENTREGADO`) mediante polling sobre `localStorage` cada 2 segundos.
- Permite añadir **notas individuales** por línea de pedido (instrucciones para cocina).

### `Barra` — Panel Kanban de cocina
Vista exclusiva para personal (`EMPRESA`, `EMPLEADO`). Implementa un tablero Kanban con 4 columnas de estado:

```
RECIBIDO  →  PREPARANDO  →  LISTO  →  ENTREGADO
```

- Los pedidos se agrupan por mesa dentro de cada columna.
- Cada ticket muestra: código de pedido, mesa, hora, importe total, líneas de pedido con cantidades y notas.
- Los botones de acción respetan el flujo de estados (no se puede saltar estados).
- **Polling automático**: recarga los pedidos desde el backend cada **5 segundos**.
- Al cambiar un estado, actualiza `localStorage` para que la vista `Pedir` del cliente refleje el cambio en tiempo real.

### `FormularioIa` — Recomendaciones nutricionales
Formulario reactivo con validaciones que recoge:
- Datos biométricos: edad (12-99), peso en kg (30-250), altura en cm (100-250).
- Preferencia de dieta: Normal / Vegetariana / Vegana.
- Objetivo: Perder peso / Mantener / Ganar músculo.

Al enviar, llama al endpoint `POST /recommendations` del backend. El resultado muestra hasta 3 propuestas de menú con su desglose calórico. Cada propuesta incluye un botón "Ver Platos e Ir al Menú" que navega a `/menu?modo=armar&recomendados=id1,id2,...` para filtrar automáticamente la carta con los platos recomendados.

### `Admin` — Gestión de productos
Panel exclusivo para el rol `EMPRESA`. Implementa:
- **Listado de productos** con búsqueda y filtro por disponibilidad.
- **Formulario reactivo modal** para crear y editar productos, incluyendo: nombre, descripción, precio base, tipo IVA, imagen (URL), disponibilidad, kcal, tags (texto separado por comas) y alérgenos.
- **Eliminación** con confirmación nativa del navegador.
- **Normalización de IDs** de MongoDB para compatibilidad con el formato de respuesta del backend.

### `NavComponent` — Barra de navegación
Navegación inferior persistente en todas las vistas. Muestra las secciones según el rol del usuario:
- **Todos los roles**: Inicio, Menú, Carrito.
- **EMPLEADO y EMPRESA**: Cocina (Barra).
- **Solo EMPRESA**: Admin.

---

## 🔐 Seguridad y autenticación

### Interceptor funcional (`auth.interceptor.ts`)

El interceptor sigue la API moderna de Angular (función, no clase `HttpInterceptor`), registrado en `bootstrapApplication` mediante `withInterceptors([authInterceptor])`. Adjunta el token JWT a **todas** las peticiones HTTP salientes si existe token en `localStorage`.

```typescript
// Patrón de uso
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

### Guard funcional (`role.guard.ts`)

Implementado como `CanActivateFn`. Comprueba en orden:
1. Si hay sesión activa (`AuthService.isLoggedIn()`). Si no → `/login`.
2. Si la ruta define `data.roles`. Si no → acceso libre para cualquier autenticado.
3. Si el rol del usuario está en la lista de roles permitidos. Si no → `/inicio`.

### Almacenamiento de credenciales

| Clave `localStorage` | Contenido |
|---|---|
| `sm_token` | JWT Bearer token |
| `sm_user` | Objeto JSON del usuario (`nombre`, `email`, `rol`) |
| `sm_carrito` | Items del carrito actual |
| `sm_mesa` | Identificador de la mesa activa |
| `sm_pedido_id` | ID de la sesión de pedido |
| `sm_historial_pedidos` | Historial de rondas enviadas |
| `estado_actual` | Estado actual del pedido en seguimiento |
| `ultimo_estado_pedido` | Último estado recibido (para sincronizar barra → cliente) |

---

## 🔌 Comunicación con el backend

### `ApiClient` — Wrapper centralizado

Todas las peticiones HTTP pasan por `ApiClient`, que construye la URL completa concatenando la `apiUrl` del `environment` con el path relativo del endpoint:

```typescript
// Ejemplo
this.api.get('/producto')          // → GET http://localhost:9002/producto
this.api.post('/pedido', body)     // → POST http://localhost:9002/pedido
this.api.patch('/pedido/id/estado', { estado: 'LISTO' }) // → PATCH ...
```

### `endpoints.ts` — Diccionario de rutas

Todas las rutas de la API se centralizan en un único objeto tipado:

```typescript
endpoints.auth.login          // → '/auth/login'
endpoints.productos.list      // → '/producto'
endpoints.productos.one(id)   // → '/producto/:id'
endpoints.orders.create       // → '/pedido'
endpoints.orders.status(id)   // → '/pedido/:id/estado'
```

### Entornos de conexión

```typescript
// Desarrollo local (activo por defecto)
export const environment = {
  production: true,
  apiUrl: 'http://localhost:9002',
};

// Producción (comentado en el código)
// export const environment = {
//   production: true,
//   apiUrl: 'http://lakritas.com:8080/app3_back',
// };
```

---

## 📦 Modelos de datos (TypeScript)

### `User` y `AuthResponse`
```typescript
interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'CLIENTE' | 'EMPRESA';
  mesaId?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}
```

### `Producto` (carta)
```typescript
interface Producto {
  id?: any;
  nombre: string;
  descripcion: string;
  precio: number;
  tipoIva: number;
  importeIva: number;
  precioConIva: number;
  imagen?: string;
  disponible: boolean;
  categoria?: string;
  kcal?: number;
}
```

### `NuevoPedido` y `LineaPedido`
```typescript
interface LineaPedido {
  productoId: string;
  nombreActual: string;
  precioActual: number;
  cantidad: number;
  nota?: string;
}

interface NuevoPedido {
  mesaId: string;
  nota: string;
  lineasPedido: LineaPedido[];
  totalPedido: number;
  fechaCreacion: string; // ISO 8601
}
```

### `RecommendationRequest`
```typescript
interface RecommendationRequest {
  restauranteId?: string;
  edad: number;
  pesoKg: number;
  alturaCm: number;
  dieta: DietType;       // NORMAL | VEGETARIANA | VEGANA
  objetivo: GoalType;    // PERDER_PESO | MANTENER | GANAR_MUSCULO
  alergenosEvitar: string[];
  kcalObjetivo: number;
  incluirBebida: boolean;
}
```

---

## ⚙️ Configuración y puesta en marcha

### Requisitos previos

- **Node.js** 18.x o superior.
- **npm** 9.x o superior.
- El **backend Smart Menu Back** en ejecución en `localhost:9002`.

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd smart-menu-front-main

# Instalar dependencias
npm install
```

### Configurar entorno

Editar `src/environment/environment.ts` para apuntar al backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:9002', // URL del backend Spring Boot
};
```

### Ejecutar en desarrollo

```bash
npm start
# o equivalente:
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

### Build de producción

```bash
npm run build
```

Los artefactos compilados se generan en `dist/smart-menu-front/`. Para servir en producción es necesario configurar el servidor web (Nginx, Apache, etc.) para redirigir todas las rutas a `index.html` (SPA routing).

### Generar documentación técnica (TypeDoc)

```bash
npm run generate-docs
```

Una vez finalizado, abrir `docs/index.html` en el navegador. La documentación incluye todas las clases, interfaces, servicios y componentes con sus JSDoc.

---

## 🧪 Pruebas

El proyecto incluye la configuración de Karma + Jasmine para tests unitarios. Sin embargo, la opción `skipTests: true` está activada en los schematics de `angular.json` para todos los artefactos generados (componentes, servicios, guards, etc.).

```bash
npm test
```

> ⚠️ **Pendiente de completar**: No se han detectado tests unitarios implementados más allá de la configuración base. Se recomienda añadir specs para los servicios (`AuthService`, `PedidoStore`, `MenuService`) y para el `roleGuard`.

---

## 📝 Notas técnicas adicionales

- **Normalización de `ObjectId`**: Varios componentes (`Menu`, `Barra`, `Admin`) implementan lógica propia para normalizar los IDs de MongoDB que llegan en diferentes formatos (`p.id`, `p._id`, `p.id.$oid`, `p._id.$oid`, `p.id.hexString`) a una cadena hexadecimal de 24 caracteres. Esto es necesario por la serialización personalizada del backend.

- **Rondas múltiples de pedido**: El sistema de carrito diferencia entre items `enviado: true` (ya en cocina) e items `enviado: false` (pendientes). Esto permite que una misma mesa realice varias rondas de pedido sin perder el historial visual de lo ya solicitado.

- **Sincronización barra → cliente sin WebSockets**: La comunicación del cambio de estado desde la vista de cocina (`/barra`) hasta la vista del cliente (`/pedir`) se realiza a través de `localStorage` (clave `ultimo_estado_pedido`). El componente `Pedir` hace polling sobre esta clave cada 2 segundos mediante `RxJS interval`. Es una solución funcional que el propio `INTEGRACION.md` reconoce como simplificada, recomendando WebSockets para producción.

- **Modo offline/fallback**: El componente `Pedir` implementa un mecanismo de resiliencia: si el backend no está disponible al enviar una comanda, opera en modo local (guarda en `PedidoStore`) y muestra igualmente el mensaje de éxito, garantizando la continuidad del servicio.

- **Control de versiones de Angular**: El proyecto utiliza Angular 20 con la nueva sintaxis de control de flujo de plantillas (`@if`, `@for`, `@empty`) introducida en Angular 17, en lugar de las directivas estructurales clásicas (`*ngIf`, `*ngFor`).

- **Standalone components**: Todos los componentes son standalone (sin `NgModule`), usando `imports` directo en el decorador `@Component`. Esto simplifica la arquitectura y mejora el tree-shaking del compilador.

- **Signals**: El proyecto adopta parcialmente la API de `signal()` de Angular para estado reactivo en algunos componentes (`Admin`, `Inicio`, `App`), conviviendo con el patrón RxJS tradicional.

---

## 🔗 Integración con el backend

Para detalles completos sobre los contratos de API, modelos JSON requeridos y configuración de seguridad JWT entre frontend y backend, consultar el archivo [`INTEGRACION.md`](./INTEGRACION.md) incluido en el repositorio.

El backend compatible con este frontend es **Smart Menu Back** (Spring Boot 4 + MongoDB), disponible como proyecto independiente.

---

## 👤 Autor

Desarrollado como proyecto frontend para el sistema **Smart Menu**.

---

*Documentación generada mediante análisis estático del código fuente.*

