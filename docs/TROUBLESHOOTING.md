# Troubleshooting

## El frontend no carga juegos

Comprobar `VITE_API_URL` y hacer `GET /api/games` directamente. Si la API responde correctamente ahí pero no en la app, revisar la consola del navegador (posible error de CORS — ver más abajo).

## Las portadas no aparecen

`GET /api/games` debe incluir `coverUrl` (será `null` si el juego no tiene portada todavía). Si tiene valor, abrir esa URL directamente:

- Si da `404`: la fila del juego en Postgres tiene `cover_path` pero el archivo no existe en B2 en esa ruta, o las credenciales de B2 no tienen permiso de lectura.
- Si la URL apunta a `localhost:5173` (el puerto de Vite) en vez del backend: revisar `API_PUBLIC_URL` en el backend.

## El manual no abre

Probar `GET /api/games/<id>/manual` directamente. Si da `404`, comprobar en Postgres que existe una fila en `documents` para ese `game_id`, y que `storage_path` apunta a un archivo que realmente existe en B2.

## El chat falla o responde mal

En orden de probabilidad:

1. `gameId` inválido o inexistente.
2. El juego no tiene chunks en la tabla `chunks` (`npm run check:embeddings` lo detecta).
3. `AI_EMBEDDING_PROVIDER` distinto entre el momento de importar ese juego y ahora — ver el error específico que da el backend en ese caso (menciona explícitamente revisar esta variable).
4. Ningún proveedor de chat con API key válida configurada.
5. Cuota agotada en todos los proveedores de `AI_PROVIDER_ORDER` (revisar logs del backend).

## Error 429 al preguntar

Dos causas posibles, con mensajes distintos:

- **`rate_limited`**: se ha superado `CHAT_RATE_LIMIT` peticiones/15 min desde esa IP. Es una protección propia de la app, no de ningún proveedor de IA.
- **Error de cuota de un proveedor**: el sistema ya intenta pasar automáticamente al siguiente proveedor de `AI_PROVIDER_ORDER` — si el error llega igualmente al usuario, es que todos los proveedores configurados están sin cuota.

## Embeddings incompatibles

El error menciona explícitamente "misma dimensión" o similar. Pasa cuando se cambió `AI_EMBEDDING_PROVIDER` sin volver a importar los juegos existentes. Solución: volver a ejecutar `npm run import <id>` para cada juego afectado, con el proveedor actual.

## Importación interrumpida

Si `npm run import <id>` falla a mitad (típicamente por cuota agotada), simplemente volver a ejecutar el mismo comando — retoma desde el checkpoint guardado, siempre que el proveedor de embeddings no haya cambiado entre intentos.

## El juego no existe tras importarlo

Comprobar que `metadata.json` tiene un campo `id` que coincide exactamente con el nombre de la carpeta bajo `games/`. Si no coinciden, la importación puede completarse sin error pero el juego queda inaccesible con el id esperado.

## No autenticado (401) en endpoints que deberían funcionar

- Comprobar que la cabecera `Authorization: Bearer <token>` se está mandando (no solo el token suelto).
- El token puede haber caducado (`JWT_EXPIRES_IN`, 30 días por defecto) — hay que volver a iniciar sesión.
- Si `JWT_SECRET` cambió en el servidor, todos los tokens emitidos antes dejan de ser válidos.

## No se puede cambiar el email o la contraseña

Estos dos endpoints exigen `currentPassword` y devuelven `401` si no coincide, aunque el token de sesión sea válido — es intencionado, no un bug (ver [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)).

## La solicitud de juegos nuevos no manda correo

- Comprobar que `RESEND_API_KEY` y `NOTIFICATION_EMAIL` están configuradas.
- `NOTIFICATION_EMAIL` debe ser el mismo email con el que te registraste en Resend — sin un dominio propio verificado, Resend no entrega correos a direcciones distintas de la propia cuenta (ver [`docs/CONFIGURATION.md`](./CONFIGURATION.md)).
- Revisar la carpeta de spam.

## Archivo demasiado grande / demasiados archivos al solicitar un juego

Límites: 150MB por archivo, 10 archivos por solicitud (`multer`). El error `400` que se devuelve indica cuál de los dos límites se superó.

## CORS bloqueado en el navegador

El origen del frontend no está en la lista permitida. Revisar `FRONTEND_URL` (desarrollo local) o que el dominio de producción del frontend siga siendo el mismo que está permitido explícitamente en `src/index.ts` — si se renombra el proyecto de Vercel, hay que actualizar esa lista.

## No se puede acceder al panel de administración (401 con sesión iniciada)

`ADMIN_EMAIL` no está configurada, o no coincide exactamente con el email de la cuenta (la comparación no distingue mayúsculas/minúsculas, pero sí tiene que ser la misma cuenta). Confirmar con `GET /api/auth/me` — la respuesta incluye `isAdmin`, que debe ser `true`.

## `npm run fetch-bgg` falla con error 401

Estado conocido, no un bug — ver el aviso en [`docs/IMPORT.md`](./IMPORT.md#rellenar-metadatajson-automáticamente-desde-boardgamegeek-opcional). BGG exige aprobación explícita para su API, pendiente en el momento de escribir esto. Mientras tanto, rellena `metadata.json` a mano — el resto del flujo de importación funciona con total normalidad.

## Un juego importado sin errores no aparece en la tabla `games`

Desde la última revisión, esto ya no debería pasar en silencio — el propio comando hace una consulta de verificación tras terminar y falla con un error explícito si la fila no aparece (ver `docs/ARCHITECTURE.md`, sección "Importación de un juego"). Si sigue ocurriendo a pesar de ese error explícito, revisar que `metadata.json` tenga un `id` con forma válida (sin caracteres raros, no vacío) — es el valor real que se usa como clave primaria en `games`, independientemente del nombre de la carpeta.

## Verificación completa antes de dar por buena una entrega

```bash
# backend
npm run build
npm test

# frontend
npm run build
npm run lint
npm run test
npm run test:e2e   # si el cambio afecta a un flujo cubierto
```
