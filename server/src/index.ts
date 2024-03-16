import Express from "express";
import path from "path";
import { load } from "cheerio";
import fetch from "node-fetch";
import { WordMap, WordTag } from "../types/word";

const app = Express();
const wordMap: WordMap = {};

app.use(Express.static(path.join(__dirname, "../../public")));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "../../client/index.html"));
});

const getTextContent = (element: cheerio.Cheerio) => {
    return element.contents().filter((_, item) => {
        return item.type === "text"
    }).text();
}

const organize = () => {
    const killWords: Set<String> = new Set();

    for (const [ word, state ] of Object.entries(wordMap)) {
        if (state.tags.includes("Kill")) killWords.add(word.slice(-1));
    }

    for (const [ word, state ] of Object.entries(wordMap)) {
        if (!state.tags.includes("Kill")) {
            const isKillWord = Array.from(killWords).some(endWord => word.slice(-1) === endWord);

            if (isKillWord) state.tags.push("Kill");
        }
    }
}

const getLongWord = async () => {
    const pathes = [ "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ" ];
    const url = "https://kkukowiki.kr/w/긴_단어/한국어/";
    
    for (const path of pathes) {
        const response = await fetch(encodeURI(`${url}${path}`));
        const html = await response.text();
        const $ = load(html);
        $("table > tbody > tr > td:nth-child(2)").each((_, element) => {
            const word = $(element).text();
            const tags: WordTag[] = [];
    
            if (!word) return;
    
            if (wordMap[word]) {
                wordMap[word].tags = Array.from(new Set([ ...wordMap[word].tags, ...tags ]))
            }
            else {
                wordMap[word] = {
                    tags
                }
            }
        });
    }
}

const getAttackWord = async () => {
    const pathes = [ "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ" ];
    const url = "https://kkukowiki.kr/w/공격단어/한국어/";
    
    for (const path of pathes) {
        const response = await fetch(encodeURI(`${url}${path}`));
        const html = await response.text();
        const $ = load(html);
        $("table > tbody > tr > td:nth-child(2)").each((_, element) => {
            const word = $(element).text();
            const tags: WordTag[] = [];
    
            if (!word) return;

            tags.push("Attack");
    
            if (wordMap[word]) {
                wordMap[word].tags = Array.from(new Set([ ...wordMap[word].tags, ...tags ]))
            }
            else {
                wordMap[word] = {
                    tags
                }
            }
        });
    }
}

app.get("/get", async (request, response) => {
    if (request.method !== "GET") return;

    try {
        await getLongWord();
        await getAttackWord();
        organize();
    } catch {
        response.send({
            state: "Error"     
        });
        return;
    }
    response.send({
        state: "Success",
        result: wordMap
    });
});

app.listen(3000);