import path from "path";

const ROOT =
    process.cwd();

export const PATHS = {

    ROOT,

    KNOWLEDGE:
        path.join(ROOT, "knowledge"),

    GAMES:
        path.join(
            ROOT,
            "knowledge",
            "games"
        )

};