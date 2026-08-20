# Desarrollo

## Puesta en marcha

```bash
npm install
cp .env.example .env
# Rellena .env — ver el README para lo mínimo imprescindible
npm run dev
```

Arranca en el puerto `PORT` (por defecto `3000`), con recarga automática al modificar TypeScript. Necesitas el [frontend](https://github.com/AdrianMnd/boardgame-tutor-frontend) corriendo en paralelo (`npm run dev`, por defecto en `http://localhost:5173`) apuntando a este backend (`VITE_API_URL=http://localhost:3000` en el `.env.local` del frontend) para probar la aplicación completa.

## Tras modificar código

```bash
npm run build   # compila TypeScript — falla si hay errores de tipos
npm test         # tests unitarios (Vitest)
```

`npm run build` es el que se ejecuta en CI y en el despliegue de producción — cualquier error de tipos que no se detecte aquí en local se detectará ahí.

## Añadir un juego nuevo

Ver [`docs/CONFIGURATION.md`](./CONFIGURATION.md#importar-un-juego-nuevo) para la estructura completa de `metadata.json`. En resumen:

```bash
mkdir -p games/<id>/source games/<id>/assets
# añade metadata.json, source/rulebook.pdf, assets/cover.png
npm run import <id>
```

Para no escribir `metadata.json` a mano, `npm run fetch-bgg <id> <idOrUrlBGG>` lo rellena automáticamente con datos de BoardGameGeek (nombre, año, jugadores) — ver [`docs/IMPORT.md`](./IMPORT.md#rellenar-metadatajson-automáticamente-desde-boardgamegeek-opcional).

## Probar el pipeline RAG sin pasar por HTTP

```bash
npm run ask <id> "<pregunta>"
```

Útil para depurar la calidad de las respuestas sin necesitar el frontend ni hacer peticiones HTTP manuales.

## Diagnóstico de problemas frecuentes

Ver [`docs/TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) para una lista más completa. Los más comunes durante el desarrollo:

- **Juego no encontrado**: comprueba que existe en la tabla `games` de Postgres (`npm run import` lo habría creado) y que el `id` de la URL coincide exactamente.
- **Portada no visible**: comprueba que `cover_path` no sea `NULL` en la fila del juego, y que las credenciales de B2 en `.env` tengan permiso de lectura sobre esa ruta.
- **Preguntas sin buenos resultados / "no he encontrado esa información"**: comprueba que el juego tenga chunks en la tabla `chunks` (`npm run check:embeddings` detecta juegos con embeddings incompletos), y que `AI_EMBEDDING_PROVIDER` sea el mismo que se usó al importar ese juego en concreto.
- **Error 429 / cuota agotada**: revisa `AI_PROVIDER_ORDER` y añade más proveedores con API key configurada — el sistema pasa automáticamente al siguiente ante fallos de cuota (solo para chat, no para embeddings).

## Antes de dar por buena una entrega

```bash
npm run build
npm test
```

Si el cambio toca el frontend también, comprobar allí: `npm run build`, `npm run lint`, `npm run test`, y `npm run test:e2e` si el cambio afecta a un flujo de usuario cubierto por esos tests.
