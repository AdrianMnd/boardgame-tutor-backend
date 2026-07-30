const STOP_WORDS = new Set([
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "unos",
    "unas",
    "de",
    "del",
    "al",
    "y",
    "o",
    "que",
    "como",
    "para",
    "por",
    "en",
    "con",
    "se",
    "es",
    "puede",
    "puedo"
]);

function normalize(text: string): string[] {

    return text
        .toLowerCase()
        .replace(/[.,;:¿?¡!()]/g, "")
        .split(/\s+/)
        .filter(word =>
            word.length > 2 &&
            !STOP_WORDS.has(word)
        );

}

export function findRelevantContext(
    knowledge: string,
    question: string
): string {

    const questionWords =
        normalize(question);

    const paragraphs =
        knowledge
            .split("\n\n")
            .filter(Boolean);

    const scored = paragraphs.map(paragraph => {

        const paragraphWords =
            normalize(paragraph);

        const score =
            questionWords.reduce(

                (total, word) =>

                    total +
                    (paragraphWords.includes(word) ? 1 : 0),

                0

            );

        return {
            paragraph,
            score
        };

    });

    const best =
        scored
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 3)
            .filter(item => item.score > 0)
            .map(item => item.paragraph);

    return best.join("\n\n");

}