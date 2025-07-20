const ACTIVATION_CHECKBOX = document.getElementById("activation-checkbox");
const RULES_TABLE = document.getElementById("rules-table");
const INPUT_OFFSET = document.getElementById("input-offset");

function send(data) {
    if (!chrome.runtime?.id)
        return new Promise(r => r()); // Context invalidated
    return chrome.runtime.sendMessage(data);
}

async function configGetActivated() {
    return !!(await chrome.storage.local.get("activated")).activated ?? false;
}

async function configSetActivated(activated) {
    await chrome.storage.local.set({ activated: !!activated });
}

async function configGetOffset() {
    return Number((await chrome.storage.local.get("offset")).offset) || 0;
}

async function configSetOffset(offset) {
    console.log("Set Offset: ", offset)
    await chrome.storage.local.set({ offset });
}


async function renderRules(data) {
    const rows = document.createDocumentFragment();

    for (let i = 0; i < data.length; ++i) {
        const row = document.createElement("tr");
        const pattern = document.createElement("th");
        // const substitution = document.createElement("th");

        pattern.textContent = data[i][0];
        // substitution.textContent = data[i][1];

        row.appendChild(pattern);
        // row.append(pattern, substitution);
        rows.appendChild(row);
    }

    RULES_TABLE.replaceChildren(rows);
}


function onInputOffsetChange() {
    let offset = Number(INPUT_OFFSET.value);
    if (!Number.isFinite(offset)) return;

    configSetOffset(offset);
}


send({ listTabs: true }).then((result) => {
    console.log("Result: ", result)
    if (Array.isArray(result))
        renderRules(result.map(url => ([url])));
});

configGetActivated().then(value => ACTIVATION_CHECKBOX.checked = !value);
ACTIVATION_CHECKBOX.onchange = function () {
    console.log("Set", !ACTIVATION_CHECKBOX.checked);
    configSetActivated(!ACTIVATION_CHECKBOX.checked);
}

INPUT_OFFSET.addEventListener('change', onInputOffsetChange);
INPUT_OFFSET.addEventListener('keyup', onInputOffsetChange);
configGetOffset().then(value => INPUT_OFFSET.setAttribute("value", value));
