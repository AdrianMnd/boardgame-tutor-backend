import { Resend } from "resend";

import type { EmailConfiguration } from "../../config/email";

export interface GameRequestEmailDetails {

    requesterName: string;

    requesterEmail: string;

    gameName: string;

    bggUrl?: string;

    pdfLinks: string[];

    coverLink?: string;

}

function escapeHtml(

    value: string

): string {

    return value

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

}

export class EmailService {

    private readonly resend: Resend;

    constructor(

        private readonly configuration: EmailConfiguration

    ) {

        this.resend = new Resend(configuration.apiKey);

    }

    async sendGameRequestNotification(

        details: GameRequestEmailDetails

    ): Promise<void> {

        const pdfListHtml =

            details.pdfLinks.length > 0

                ? `<ul>${

                    details.pdfLinks

                        .map(

                            (link, index) =>

                                `<li><a href="${link}">PDF ${index + 1} (enlace válido 7 días)</a></li>`

                        )

                        .join("")

                }</ul>`

                : "<p><em>No se adjuntó ningún PDF — el usuario indicó que no dispone de ninguno.</em></p>";

        const bggHtml =

            details.bggUrl

                ? `<p><strong>BoardGameGeek:</strong> <a href="${escapeHtml(details.bggUrl)}">${escapeHtml(details.bggUrl)}</a></p>`

                : "<p><em>No se indicó ningún enlace a BoardGameGeek.</em></p>";

        const coverHtml =

            details.coverLink

                ? `<p><strong>Portada:</strong> <a href="${details.coverLink}">Ver imagen (enlace válido 7 días)</a></p>`

                : "";

        await this.resend.emails.send({

            from: "BoardGame Tutor <onboarding@resend.dev>",

            to: this.configuration.notificationEmail,

            subject: `Nueva solicitud de juego: ${details.gameName}`,

            html: `
                <h2>Nueva solicitud de juego</h2>
                <p><strong>Juego:</strong> ${escapeHtml(details.gameName)}</p>
                <p><strong>Solicitado por:</strong> ${escapeHtml(details.requesterName)} (${escapeHtml(details.requesterEmail)})</p>
                ${bggHtml}
                ${coverHtml}
                <p><strong>PDF adjuntos:</strong></p>
                ${pdfListHtml}
            `

        });

    }

}
