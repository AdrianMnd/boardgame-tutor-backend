export interface EmailConfiguration {

    apiKey: string;

    /**
     * El único destinatario real de correos de esta app — sin
     * un dominio propio verificado en Resend, el remitente de
     * pruebas (onboarding@resend.dev) solo puede mandar correos
     * a la propia cuenta de Resend, no a destinatarios
     * arbitrarios. Por eso el correo de "nueva solicitud de
     * juego" solo llega aquí, nunca a quien hace la solicitud
     * (esa persona ve una confirmación en la propia pantalla en
     * su lugar).
     */
    notificationEmail: string;

}

function requireEnv(

    name: string

): string {

    const value = process.env[name];

    if (!value) {

        throw new Error(

            `Falta la variable de entorno ${name} — revisa tu .env.`

        );

    }

    return value;

}

export function loadEmailConfiguration(): EmailConfiguration {

    return {

        apiKey:
            requireEnv("RESEND_API_KEY"),

        notificationEmail:
            requireEnv("NOTIFICATION_EMAIL")

    };

}
