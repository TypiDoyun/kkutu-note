type WordTag = "Attack" | "Kill" | "Defence";

type WordMap = {
    [key: string]: {
        tags: WordTag[];
    }
}

let wordMap: WordMap = {};
let loaded = false;

const findWords = (filter: (word: string, tags: WordTag[]) => boolean): string[] => {
    if (!loaded) return [];

    const words: string[] = [];

    for (const [ word, state ] of Object.entries(wordMap)) {
        if (filter(word, state.tags)) words.push(word);
    }

    return words;
}

const main = async () => {
    const response = await fetch(`/get`);
    response.json()
        .then(json => {
            loaded = true;
            wordMap = json.result;
            console.log("loaded!");
        })
        .catch(err => {
            console.error("failed to load data");
        })
}

main();

const input = document.getElementById("search") as HTMLInputElement;
const mannerModeCheckbox = document.getElementById("manner") as HTMLInputElement;
const longMode = document.getElementById("long") as HTMLInputElement;
const wordsElement = document.getElementById("words") as HTMLOListElement;

const isMannerMode = () => {
    return mannerModeCheckbox.checked;
}

window.addEventListener("focus", () => {
    setTimeout(() => {
        input.focus();
    }, 50);
});

input.addEventListener("keypress", eventData => {
    if (eventData.key !== "Enter") return;

    const mannerMode = isMannerMode();
    const search = input.value;

    if (!search) return;

    const words = findWords((word, tags) => {
        return !(mannerMode && tags.includes("Kill"));
    });

    if (longMode.checked) {
        words.sort((a, b) => {
            // -1: a가 우선
            // 1: b가 우선
            return +b.startsWith(search) - +a.startsWith(search) ||
                b.length - a.length;
        });
    }
    else {
        words.sort((a, b) => {
            // -1: a가 우선
            // 1: b가 우선
            return +b.startsWith(search) - +a.startsWith(search) ||
                +wordMap[b].tags.includes("Attack") - +wordMap[a].tags.includes("Attack") ||
                b.length - a.length;
                
        });
    }

    input.value = "";
    wordsElement.innerHTML = "";

    for (const word of words.slice(0, 150)) {
        let item = document.createElement("li");
        item.textContent = word;
        item = wordsElement.appendChild(item);
        if (word.startsWith(search)) {
            item.style.fontWeight = "bold";
        }
    }
})