export async function generateAnswer(
    gameId: number,
    question: string
) {


    console.log(
        "Pregunta recibida:",
        {
            gameId,
            question
        }
    );



    return `
    Esta es una respuesta generada por la IA
    para la pregunta:

    "${question}"

    Todavía no hemos conectado el modelo real.
    `;


}