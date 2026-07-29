export function findRelevantContext(
    knowledge: string,
    question: string
): string {

    const paragraphs = knowledge
        .split("\n\n")
        .filter(Boolean);

    const words = question
        .toLowerCase()
        .split(" ");

    const result = paragraphs.find(paragraph =>

        words.some(word =>
            paragraph
                .toLowerCase()
                .includes(word)
        )

    );

    return result ?? knowledge;

}