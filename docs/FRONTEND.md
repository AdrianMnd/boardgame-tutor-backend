# Frontend

## Stack

- React 19
- TypeScript
- Vite
- TanStack React Query
- React Markdown
- Lucide React
- React Router DOM está instalado, pero no se utilizan rutas en la aplicación actual.

## Entrada

`src/main.tsx` crea el root de React y monta:

```text
StrictMode
└── QueryClientProvider
    └── ConversationProvider
        └── App
```

Los estilos globales se cargan desde:

```text
src/styles/global.css
```

## App

`App.tsx`:

1. consulta los juegos mediante React Query;
2. mantiene `selectedGameId`;
3. selecciona el juego correspondiente o el primero disponible;
4. muestra `SplashScreen` durante la carga;
5. muestra `SplashScreen` de error si falla la consulta;
6. monta `Header`, `Sidebar`, `Chat` y, cuando corresponde, `PdfViewer`.

## Sidebar

`Sidebar.tsx`:

- recibe la lista de juegos;
- permite buscar por nombre;
- marca el juego seleccionado;
- muestra número de jugadores y año;
- intenta mostrar `coverUrl`;
- usa un icono de dados como fallback si la portada no existe o falla.

La portada se recibe del backend mediante `GameResponse.coverUrl`.

## Chat

`Chat.tsx`:

- muestra el juego actual;
- permite abrir el manual completo;
- permite iniciar una conversación nueva;
- muestra sugerencias iniciales;
- permite escribir preguntas;
- permite cancelar una generación;
- abre el manual en una página cuando una fuente es seleccionada.

## Mensajes

`Message.tsx`:

- diferencia mensajes de usuario y asistente;
- muestra avatar;
- muestra hora;
- renderiza Markdown;
- soporta GFM;
- aplica resaltado de código;
- permite copiar el contenido;
- muestra fuentes de la respuesta.

## Fuentes

`Sources.tsx` representa las fuentes devueltas por el backend. Cada fuente contiene:

```text
id
gameId
page
score
text
```

La página de una fuente se utiliza para abrir el visor PDF en esa página.

## Visor PDF

`PdfViewer.tsx` construye:

```text
GET /api/games/:id/manual
```

y permite:

- abrir el PDF dentro de un `iframe`;
- abrirlo en una pestaña nueva;
- cerrar el visor;
- cerrarlo mediante Escape.

La página se expresa como fragmento:

```text
#page=<n>
```

## Conversaciones

`ConversationContext.tsx` mantiene una conversación por `gameId`.

Las conversaciones se guardan en `localStorage` y se restauran al cargar la aplicación.

Los mensajes almacenan `createdAt` y el contexto revive los valores a objetos `Date`.

## API client

`ApiClient` implementa:

- `get`
- `post`
- `put`
- `delete`

El endpoint final es:

```text
${VITE_API_URL}${endpoint}
```

El cliente espera JSON cuando `Content-Type` lo indica y convierte respuestas no satisfactorias en `ApiError`.

## Variables de entorno

La versión recibida contiene:

```env
VITE_API_URL=http://localhost:3000
API_PUBLIC_URL=http://localhost:3000
```

La aplicación utiliza directamente `VITE_API_URL`. `API_PUBLIC_URL` no aparece utilizado por el frontend actual.

Para producción, `VITE_API_URL` debe apuntar a la API pública.

## Estilos

Los estilos están separados por componente y por capas globales:

```text
styles/
├── reset.css
├── global.css
├── variables.css
├── typography.css
└── animations.css
```

Los componentes mantienen sus CSS junto al componente.

## Build

```bash
npm run build
```

ejecuta:

```text
tsc -b
vite build
```

El resultado de Vite se genera en `dist/`.
