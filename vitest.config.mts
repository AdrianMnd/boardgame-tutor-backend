import { defineConfig } from "vitest/config";

export default defineConfig({

    test: {

        globals: true,

        environment: "node",

        // Nunca deben rastrearse tests dentro de node_modules
        // o de la salida ya compilada de TypeScript — sin esto,
        // un `dist/` desactualizado puede colar "tests" falsos.
        exclude: [

            "**/node_modules/**",

            "**/dist/**"

        ],

        coverage: {

            provider: "v8",

            reporter: [
                "text",
                "html"
            ]

        }

    }

});
