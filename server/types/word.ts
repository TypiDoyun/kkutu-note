export type WordTag = "Attack" | "Kill"

export type WordMap = {
    [key: string]: {
        tags: WordTag[];
    }
}