// ===================== Utilities =====================
const fmt = (ms) => { if (!isFinite(ms)) return "-"; const s = ms / 1000; return s.toFixed(3); };
const fmtS = (s) => isFinite(s) ? s.toFixed(3) : "-";
const dl = (filename, text) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = filename; a.click(); URL.revokeObjectURL(a.href); };

// Simple beep generator
const beeper = (() => {
    let ctx; const ensure = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());
    const beep = (freq=880, dur=120) => { try { const ac = ensure(); const o = ac.createOscillator(); const g = ac.createGain(); o.connect(g); g.connect(ac.destination); o.frequency.value = freq; o.type = "sine"; const t = ac.currentTime; g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.6, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur/1000); o.start(t); o.stop(t + dur/1000 + 0.02);} catch {} };
    return { beep };
})();

// ===================== Scrambler (3x3) =====================
const faces = ["U","R","F","D","L","B"];
const mods = ["", "'", "2"];
const axisOf = { U:"y", D:"y", L:"x", R:"x", F:"z", B:"z" };
function genScramble(n){
    const len = Number(localStorage.getItem("cube.scrLen")||n||25);
    let res = [], prevAxis = null, prevFace = null;
    while (res.length < len){
    const f = faces[Math.floor(Math.random()*faces.length)];
    if (axisOf[f] === prevAxis) continue;
    if (f === prevFace) continue;
    const m = mods[Math.floor(Math.random()*mods.length)];
    res.push(f + m); prevAxis = axisOf[f]; prevFace = f;
    }
    return res.join(" ");
}

// ===================== Pattern Generator =====================
const colors = ["W","R","G","B","O","Y"];
function getSolvedCube() {
    return { top:Array(9).fill("W"), left:Array(9).fill("O"), front:Array(9).fill("G"), right:Array(9).fill("R"), back:Array(9).fill("B"), bottom:Array(9).fill("Y") };
}

function applyMove(cube, move) {
    const result = JSON.parse(JSON.stringify(cube));
    const face = move[0]; const modifier = move.slice(1);
    const cw = (f)=>{ const t=[...f]; return [t[6],t[3],t[0], t[7],t[4],t[1], t[8],t[5],t[2]]; };
    let rotations = 1; if (modifier === "'") rotations = 3; if (modifier === "2") rotations = 2;
    for (let i=0;i<rotations;i++){
    if (face==="U"){
        result.top = cw(result.top);
        const temp = [result.front[0],result.front[1],result.front[2]];
        [result.front[0],result.front[1],result.front[2]] = [result.right[0],result.right[1],result.right[2]];
        [result.right[0],result.right[1],result.right[2]] = [result.back[0],result.back[1],result.back[2]];
        [result.back[0],result.back[1],result.back[2]] = [result.left[0],result.left[1],result.left[2]];
        [result.left[0],result.left[1],result.left[2]] = temp;
    } else if (face==="D"){
        result.bottom = cw(result.bottom);
        const temp = [result.front[6],result.front[7],result.front[8]];
        [result.front[6],result.front[7],result.front[8]] = [result.left[6],result.left[7],result.left[8]];
        [result.left[6],result.left[7],result.left[8]] = [result.back[6],result.back[7],result.back[8]];
        [result.back[6],result.back[7],result.back[8]] = [result.right[6],result.right[7],result.right[8]];
        [result.right[6],result.right[7],result.right[8]] = temp;
    } else if (face==="R"){
        result.right = cw(result.right);
        const temp = [result.top[2],result.top[5],result.top[8]];
        [result.top[2],result.top[5],result.top[8]] = [result.front[2],result.front[5],result.front[8]];
        [result.front[2],result.front[5],result.front[8]] = [result.bottom[2],result.bottom[5],result.bottom[8]];
        [result.bottom[2],result.bottom[5],result.bottom[8]] = [result.back[6],result.back[3],result.back[0]];
        [result.back[6],result.back[3],result.back[0]] = temp;
    } else if (face==="L"){
        result.left = cw(result.left);
        const temp = [result.top[0],result.top[3],result.top[6]];
        [result.top[0],result.top[3],result.top[6]] = [result.back[8],result.back[5],result.back[2]];
        [result.back[8],result.back[5],result.back[2]] = [result.bottom[0],result.bottom[3],result.bottom[6]];
        [result.bottom[0],result.bottom[3],result.bottom[6]] = [result.front[0],result.front[3],result.front[6]];
        [result.front[0],result.front[3],result.front[6]] = temp;
    } else if (face==="F"){
        result.front = cw(result.front);
        const temp = [result.top[6],result.top[7],result.top[8]];
        [result.top[6],result.top[7],result.top[8]] = [result.left[8],result.left[5],result.left[2]];
        [result.left[8],result.left[5],result.left[2]] = [result.bottom[2],result.bottom[1],result.bottom[0]];
        [result.bottom[2],result.bottom[1],result.bottom[0]] = [result.right[0],result.right[3],result.right[6]];
        [result.right[0],result.right[3],result.right[6]] = temp;
    } else if (face==="B"){
        result.back = cw(result.back);
        const temp = [result.top[0],result.top[1],result.top[2]];
        [result.top[0],result.top[1],result.top[2]] = [result.right[2],result.right[5],result.right[8]];
        [result.right[2],result.right[5],result.right[8]] = [result.bottom[8],result.bottom[7],result.bottom[6]];
        [result.bottom[8],result.bottom[7],result.bottom[6]] = [result.left[6],result.left[3],result.left[0]];
        [result.left[6],result.left[3],result.left[0]] = temp;
    }
    }
    return result;
}

function applyScramble(cube, scrambleStr) { return scrambleStr.split(" ").filter(m=>m.trim()).reduce((c,m)=>applyMove(c,m.trim()), cube); }

function generateRandomPattern(difficulty = "medium") {
    let scrambleLength; switch(difficulty){ case "easy": scrambleLength = 10; break; case "medium": scrambleLength = 18; break; case "hard": scrambleLength = 28; break; default: scrambleLength = 18; }
    const scrambleForPattern = genScramble(scrambleLength);
    const scrambledCube = applyScramble(getSolvedCube(), scrambleForPattern);
    return { pattern: scrambledCube, generatingScramble: scrambleForPattern };
}

function renderCubeNet(pattern) {
    const cubeNet = document.getElementById("cubeNet"); cubeNet.innerHTML = "";
    const faceOrder = ["top", "left", "front", "right", "back", "bottom"];
    faceOrder.forEach(faceName => { const faceDiv = document.createElement("div"); faceDiv.className = `face ${faceName}`; pattern[faceName].forEach(color => { const sticker = document.createElement("div"); sticker.className = `sticker ${color}`; faceDiv.appendChild(sticker); }); cubeNet.appendChild(faceDiv); });
}

// ===================== Practice Sets (sample) =====================
const PRACTICE_DB = {
    oll: [
    { name: "OLL 1 (Sune)", alg: "R U R' U R U2 R'", hint: "右上を軸に3回のUで上面を揃える定番ケース。" },
    { name: "OLL 2 (Anti-Sune)", alg: "R U2 R' U' R U' R'", hint: "逆スーン。U2から始まる。" },
    { name: "OLL 27", alg: "R U R' U' R U' R' F' U' F R U R'", hint: "T字を作ってからF挿入。" },
    ],
    pll: [
    { name: "PLL T", alg: "R U R' U' R' F R2 U' R' U' R U R' F'", hint: "前面の2点交換。実戦で頻出。" },
    { name: "PLL U (a)", alg: "R U' R U R U R U' R' U' R2", hint: "上面の三点交換（時計回り）。" },
    { name: "PLL J (a)", alg: "R U R' F' R U R' U' R' F R2 U' R' U'", hint: "コーナーとエッジの交換。" },
    ],
    f2l: [
    { name: "F2L 基本1", alg: "U R U' R'", hint: "白を下にキープしたままペアを挿入。" },
    { name: "F2L 基本2", alg: "U' F' U F", hint: "左手での基本インサート。" },
    { name: "F2L スロット跨ぎ", alg: "y U R U' R' y'", hint: "視線移動を減らす回転を意識。" },
    ]
};

// ===================== State =====================
const el = (id) => document.getElementById(id);
const big = el("bigTime");
const timesEl = el("times");
const scrambleEl = el("scramble");
const inspStateEl = el("inspState");
const patternSection = el("patternSection");
const currentModeEl = el("currentMode");
const goalInput = el("goalInput");
const goalStatus = el("goalStatus");
const goalSummary = el("goalSummary");
const scrLen = el("scrLen");
const scrLenVal = el("scrLenVal");
const chartCanvas = el("chart");

let currentMode = localStorage.getItem("cube.mode") || "normal"; // "normal" or "pattern"
let currentDifficulty = localStorage.getItem("cube.diff") || "easy";
let currentPattern = null;
let practiceSet = localStorage.getItem("cube.practiceSet") || "free";
let session = JSON.parse(localStorage.getItem(`cube.session.${currentMode}`) || "[]");
let inspectOn = JSON.parse(localStorage.getItem("cube.inspectOn") || "false");
let goalTime = parseFloat(localStorage.getItem("cube.goal") || "NaN");
let theme = localStorage.getItem("cube.theme") || "light";
let scrLenValStore = parseInt(localStorage.getItem("cube.scrLen") || "25", 10);
let celebrateOn = JSON.parse(localStorage.getItem("cube.celebrate") || "true");

let state = "idle"; // idle | hold | ready | inspect | running
let t0 = 0, raf = 0, holdTimer = 0, inspectEnd = 0, currentScramble = "";

// ===================== Theme & Controls =====================
const applyTheme = (t) => {
    document.body.classList.remove("theme-dark","theme-fun");
    if (t==="dark") document.body.classList.add("theme-dark");
    if (t==="fun") document.body.classList.add("theme-fun");
    localStorage.setItem("cube.theme", t);
};

const themeSel = document.getElementById("themeSel");
themeSel.value = theme; applyTheme(theme);
themeSel.addEventListener("change", ()=>{ theme = themeSel.value; applyTheme(theme); drawChart(); });

const updateScrLenUI = ()=>{ scrLen.value = scrLenValStore; scrLenVal.textContent = scrLenValStore + " 手"; };
updateScrLenUI();
scrLen.addEventListener("input", ()=>{ scrLenValStore = parseInt(scrLen.value,10); localStorage.setItem("cube.scrLen", scrLenValStore); updateScrLenUI(); });

if (!isNaN(goalTime)) goalInput.value = goalTime.toFixed(2);
const updateGoalStatus = ()=>{ if (isNaN(goalTime)) { goalStatus.textContent = "未設定"; return; } goalStatus.textContent = `${goalTime.toFixed(2)}s 目標`; };
updateGoalStatus();
goalInput.addEventListener("change", ()=>{ goalTime = parseFloat(goalInput.value); if (isNaN(goalTime)) { localStorage.removeItem("cube.goal"); } else { localStorage.setItem("cube.goal", String(goalTime)); } updateGoalStatus(); renderAnalysis(); });

// Celebration toggle init
const celebrateChk = el("celebrateChk");
celebrateChk.checked = celebrateOn;
celebrateChk.addEventListener("change", ()=>{ celebrateOn = celebrateChk.checked; localStorage.setItem("cube.celebrate", JSON.stringify(celebrateOn)); });

// ===================== Rendering =====================
function renderTimes(){
    timesEl.innerHTML = "";
    session.slice().reverse().forEach((it, idx) => {
    const div = document.createElement("div");
    div.className = "time-row";
    const n = session.length - idx;
    const challengeText = it.challenge || it.scramble;
    const goalClass = (!isNaN(goalTime) && it.ms/1000 <= goalTime) ? "goal-ok" : "";
    div.innerHTML = `<span>#${n}</span><span class="${goalClass}">${fmt(it.ms)} s</span><span class="pill">${challengeText}</span>`;
    timesEl.appendChild(div);
    });
    el("statCount").textContent = String(session.length);
    el("statBest").textContent = session.length ? fmt(Math.min(...session.map(t=>t.ms))) + " s" : "-";
    el("statAvg").textContent = session.length ? fmt(avg(session.map(t=>t.ms))) + " s" : "-";
    const a5 = averageTrimmed(5), a12 = averageTrimmed(12);
    el("statAos").textContent = `${a5 ? fmt(a5)+ " s" : "-"} / ${a12 ? fmt(a12) + " s" : "-"}`;
    el("statMo3").textContent = mo3() ? fmt(mo3()) + " s" : "-";
    const a50 = averageTrimmed(50, true); const a100 = averageTrimmed(100, true);
    el("statLong").textContent = `${a50 ? fmt(a50)+ " s" : "-"} / ${a100 ? fmt(a100) + " s" : "-"}`;
    drawChart();
}

function avg(arr){ return arr.reduce((a,b)=>a+b,0)/arr.length; }

function mo3(){ if (session.length < 3) return null; const arr = session.slice(-3).map(x=>x.ms); return avg(arr); }

// WCA風トリム平均: N<=12 は両端1つずつ除外、それ以上は5%切り捨て
function averageTrimmed(n, pct=false){ if (session.length < n) return null; const lastN = session.slice(-n).map(t=>t.ms).slice(); lastN.sort((a,b)=>a-b); let drop = 1; if (pct && n>12) drop = Math.max(1, Math.floor(n*0.05)); const trimmed = lastN.slice(drop, lastN.length-drop); if (!trimmed.length) return null; return avg(trimmed); }

function setInspect(on){ inspectOn = !!on; localStorage.setItem("cube.inspectOn", JSON.stringify(inspectOn)); inspStateEl.textContent = inspectOn ? "ON" : "OFF"; }

function generateNew(){
    if (currentMode === "normal") {
    currentScramble = genScramble(25);
    scrambleEl.textContent = currentScramble;
    } else if (currentMode === "pattern") {
    // Practice set handling
    let infoHTML = "";
    if (practiceSet !== "free"){
        const list = PRACTICE_DB[practiceSet];
        const pick = list[Math.floor(Math.random()*list.length)];
        infoHTML += `<div style="margin-bottom:8px;"><strong>練習ケース:</strong> ${pick.name}</div>`;
        // 展開図だけ表示（ヒントテキストは削除済み）
        currentPattern = getSolvedCube(); // Keep solved diagram for clarity
        renderCubeNet(currentPattern);
    } else {
        const patternData = generateRandomPattern(currentDifficulty);
        currentPattern = patternData.pattern; renderCubeNet(currentPattern);
        infoHTML += `<div style="font-size: 0.9em; color: var(--muted);"><strong>パターン生成:</strong> ${patternData.generatingScramble}</div>`;
    }
    currentScramble = genScramble(25);
    scrambleEl.innerHTML = `<div style="margin-bottom:8px;"><strong>スタート用スクランブル:</strong> ${currentScramble}</div>${infoHTML}`;
    }
}

function renderAnalysis(){
    // Goal progress
    if (isNaN(goalTime) || !session.length){ goalSummary.textContent = "未設定"; }
    else {
    const times = session.map(s=>s.ms/1000);
    const under = times.filter(t=>t <= goalTime).length;
    const pct = Math.round(under*100/times.length);
    const recent = times.slice(-20);
    const underRecent = recent.filter(t=>t<=goalTime).length;
    goalSummary.innerHTML = `達成: <span class="goal-ok">${under}/${times.length} (${pct}%)</span> / 直近20: <span class="goal-ok">${underRecent}/${recent.length}</span>`;
    }

    // PB history
    const key = `cube.pb.${currentMode}`;
    const pbList = JSON.parse(localStorage.getItem(key) || "[]");
    const pbBox = document.getElementById("pbList");
    if (!pbList.length) pbBox.textContent = "—"; else pbBox.innerHTML = pbList.map(p=>`${new Date(p.at).toLocaleString()} — <strong>${fmt(p.ms)}s</strong>`).join("<br>");

    // By-date table (for current mode)
    const tbody = document.querySelector("#byDateTable tbody"); tbody.innerHTML = "";
    const byDate = {};
    session.forEach(r=>{ const d = new Date(r.at); const key = d.getFullYear()+ "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); (byDate[key] ||= []).push(r.ms); });
    Object.entries(byDate).sort((a,b)=>a[0]<b[0]?-1:1).forEach(([d, arr])=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d}</td><td>${arr.length}</td><td>${fmt(avg(arr))}</td><td>${fmt(Math.min(...arr))}</td>`; tbody.appendChild(tr);
    });

    // Mode comparison
    const modes = ["normal","pattern"];
    const tbodyM = document.querySelector("#byModeTable tbody"); tbodyM.innerHTML = "";
    modes.forEach(m=>{ const s = JSON.parse(localStorage.getItem(`cube.session.${m}`)||"[]"); if (!s.length) return; const arr = s.map(x=>x.ms); const tr=document.createElement("tr"); const name = (m==="normal"?"通常":"パターン"); tr.innerHTML = `<td>${name}</td><td>${s.length}</td><td>${fmt(avg(arr))}</td><td>${fmt(Math.min(...arr))}</td>`; tbodyM.appendChild(tr); });
}

// ===================== Chart =====================
let chartCtx = chartCanvas.getContext("2d");
function drawChart(){
    const w = chartCanvas.clientWidth, h = chartCanvas.clientHeight; chartCanvas.width = w * devicePixelRatio; chartCanvas.height = h * devicePixelRatio; chartCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    chartCtx.clearRect(0,0,w,h);
    const data = session.map(s=>s.ms/1000);
    if (!data.length){ chartCtx.fillStyle = getComputedStyle(document.body).getPropertyValue("--muted"); chartCtx.fillText("データなし", 12, 20); return; }
    const padding = {l:40, r:12, t:8, b:24};
    const xs = (i)=> padding.l + (w - padding.l - padding.r) * (i/(data.length-1||1));
    const min = Math.min(...data), max = Math.max(...data);
    const yMin = Math.floor((min-0.1)*10)/10; const yMax = Math.ceil((max+0.1)*10)/10;
    const ys = (v)=> padding.t + (h - padding.t - padding.b) * (1 - (v - yMin)/(yMax-yMin||1));
    // grid
    chartCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--border"); chartCtx.lineWidth = 1; chartCtx.beginPath();
    for (let g=0; g<=5; g++){ const y = padding.t + (h - padding.t - padding.b) * (g/5); chartCtx.moveTo(padding.l, y); chartCtx.lineTo(w - padding.r, y); }
    chartCtx.stroke();
    // line
    chartCtx.beginPath(); chartCtx.lineWidth = 2; chartCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--accent");
    data.forEach((v,i)=>{ const x = xs(i), y = ys(v); if (i===0) chartCtx.moveTo(x,y); else chartCtx.lineTo(x,y); }); chartCtx.stroke();
    // moving average (last 5)
    if (data.length>=5){ const ma = []; for (let i=0;i<data.length;i++){ const s = Math.max(0,i-4); const sub = data.slice(s,i+1); ma.push(sub.reduce((a,b)=>a+b,0)/sub.length); }
    chartCtx.beginPath(); chartCtx.lineWidth = 2; chartCtx.setLineDash([4,4]); chartCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--muted");
    ma.forEach((v,i)=>{ const x = xs(i), y = ys(v); if (i===0) chartCtx.moveTo(x,y); else chartCtx.lineTo(x,y); }); chartCtx.stroke(); chartCtx.setLineDash([]);
    }
    // axes labels
    chartCtx.fillStyle = getComputedStyle(document.body).getPropertyValue("--muted"); chartCtx.font = "12px sans-serif";
    chartCtx.fillText(`${yMax.toFixed(2)}s`, 4, ys(yMax)+4); chartCtx.fillText(`${yMin.toFixed(2)}s`, 4, ys(yMin)+4);
}

// ===================== PB tracking =====================
function recordPBIfNeeded(ms){
    const key = `cube.pb.${currentMode}`; const hist = JSON.parse(localStorage.getItem(key)||"[]");
    const best = session.length ? Math.min(...session.map(s=>s.ms)) : Infinity;
    if (!hist.length || ms <= Math.min(...hist.map(h=>h.ms))){ hist.push({ ms, at: Date.now() }); localStorage.setItem(key, JSON.stringify(hist)); }
}

// ===================== Celebration =====================
const celebrateRoot = el("celebrateRoot");
function rand(min,max){ return Math.random()*(max-min)+min; }
function showCelebration(message){
    if (!celebrateOn) return;
    celebrateRoot.innerHTML = "";
    celebrateRoot.style.display = "block";
    // message
    const txt = document.createElement("div"); txt.className = "celebration-text"; txt.textContent = message; celebrateRoot.appendChild(txt);
    // confetti pieces
    const colors = ["#ff3b30","#ff9500","#ffcc00","#34c759","#0a84ff","#af52de"];
    for (let i=0;i<60;i++){
    const c = document.createElement("div"); c.className = "confetti-piece";
    c.style.left = (rand(0,100)) + "vw";
    c.style.top = (rand(-20,10)) + "vh";
    c.style.background = colors[i%colors.length];
    c.style.transform = `rotate(${rand(0,360)}deg)`;
    c.style.animationDelay = `${rand(0,400)}ms`;
    c.style.width = `${rand(6,12)}px`;
    c.style.height = `${rand(10,20)}px`;
    c.style.opacity = `${rand(0.8,1)}`;
    celebrateRoot.appendChild(c);
    }
    // remove after a while
    setTimeout(()=>{ celebrateRoot.style.display="none"; celebrateRoot.innerHTML=""; }, 2800);
}

// ===================== Mode Management =====================
function setMode(mode) {
    localStorage.setItem(`cube.session.${currentMode}`, JSON.stringify(session));
    localStorage.setItem("cube.mode", mode);
    currentMode = mode; session = JSON.parse(localStorage.getItem(`cube.session.${currentMode}`) || "[]");
    document.querySelectorAll(".mode-btn").forEach(btn => { btn.classList.toggle("active", btn.dataset.mode === mode); });
    patternSection.classList.toggle("active", mode === "pattern");
    currentModeEl.textContent = mode === "pattern" ? "パターン" : "通常";
    renderTimes(); renderAnalysis(); generateNew();
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty; localStorage.setItem("cube.diff", difficulty);
    document.querySelectorAll(".difficulty-btn").forEach(btn => { btn.classList.toggle("active", btn.dataset.difficulty === difficulty); });
    if (currentMode === "pattern") generateNew();
}

const practiceSel = document.getElementById("practiceSet"); practiceSel.value = practiceSet;
practiceSel.addEventListener("change", ()=>{ practiceSet = practiceSel.value; localStorage.setItem("cube.practiceSet", practiceSet); if (currentMode==="pattern") generateNew(); });

// ===================== Timer =====================
function averageOf(n){ if (session.length < n) return null; const lastN = session.slice(-n).map(t=>t.ms).slice(); lastN.sort((a,b)=>a+b,0); const trimmed = lastN.slice(1, -1); const avg = trimmed.reduce((a,b)=>a+b,0) / trimmed.length; return avg; }

function tick(){
    if (state === "running"){
    const ms = performance.now() - t0; big.textContent = fmt(ms); raf = requestAnimationFrame(tick);
    } else if (state === "inspect"){
    const remain = Math.max(0, inspectEnd - performance.now());
    big.textContent = (remain/1000).toFixed(1);
    if (Math.abs(remain - 7000) < 20 || Math.abs(remain - 3000) < 20) { beeper.beep(880, 90); big.classList.add("beep"); setTimeout(()=>big.classList.remove("beep"), 120); }
    if (remain <= 0){ startRun(); }
    raf = requestAnimationFrame(tick);
    }
}

function startRun(){ state = "running"; big.classList.remove("inspect"); t0 = performance.now(); beeper.beep(660, 90); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }

function stopRun(){
    if (state !== "running") return; state = "idle"; cancelAnimationFrame(raf); const ms = performance.now() - t0; big.textContent = fmt(ms);
    // detect PB / goal BEFORE adding to session
    const prevBest = session.length ? Math.min(...session.map(s=>s.ms)) : Infinity;
    const isPB = ms < prevBest;
    const isGoal = !isNaN(goalTime) && (ms/1000) <= goalTime;

    const record = { ms, at: Date.now() };
    if (currentMode === "normal") { record.scramble = currentScramble; record.challenge = currentScramble; }
    else { record.scramble = currentScramble; record.pattern = currentPattern; record.difficulty = currentDifficulty; record.challenge = practiceSet==="free"?`パターン(${currentDifficulty})`:`${practiceSet.toUpperCase()} ケース`; }
    session.push(record); localStorage.setItem(`cube.session.${currentMode}`, JSON.stringify(session));
    // PB storage
    recordPBIfNeeded(ms);
    renderTimes(); renderAnalysis(); beeper.beep(520, 90);

    // Celebrate
    if (celebrateOn && isPB){ showCelebration("🎉 NEW PB! 🎉"); }
    else if (celebrateOn && isGoal){ showCelebration("🏁 目標達成！おめでとう！"); }

    generateNew();
}

function enterHold(){ if (state !== "idle") return; state = "hold"; big.classList.remove("inspect"); big.classList.remove("ready"); holdTimer = setTimeout(()=>{ if (state==="hold"){ state="ready"; big.classList.add("ready"); } }, 500); }

function releaseFromHold(){ clearTimeout(holdTimer); if (state === "ready"){ big.classList.remove("ready"); if (inspectOn){ state = "inspect"; big.classList.add("inspect"); inspectEnd = performance.now() + 15000; beeper.beep(1000, 80); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); } else { startRun(); } } else if (state === "hold"){ state = "idle"; } }

// ===================== Events =====================
document.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (e.code === "Space"){
    e.preventDefault(); if (state === "running") { stopRun(); return; } if (state === "inspect") { startRun(); return; } enterHold();
    } else if (e.key === "n" || e.key === "N"){ generateNew(); }
    else if (e.key === "t" || e.key === "T"){ setInspect(!inspectOn); }
    else if (e.key === "d" || e.key === "D"){ deleteLast(); }
    else if (e.key === "r" || e.key === "R"){ clearSession(); }
});

document.addEventListener("keyup", (e) => { if (e.code === "Space"){ e.preventDefault(); if (state === "hold" || state === "ready") releaseFromHold(); } });

const timerArea = document.querySelector(".timer");
if (timerArea) {
    timerArea.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && e.button !== 0) return; e.preventDefault(); if (state === "running") { stopRun(); return; } if (state === "inspect") { startRun(); return; } enterHold(); });
    timerArea.addEventListener("pointerup", (e) => { e.preventDefault(); if (state === "hold" || state === "ready") releaseFromHold(); });
    timerArea.addEventListener("pointercancel", () => { clearTimeout(holdTimer); if (state === "hold") state = "idle"; });
    timerArea.addEventListener("pointerleave", () => { if (state === "hold") { clearTimeout(holdTimer); state = "idle"; } });
}

document.querySelectorAll(".mode-btn").forEach(btn => { btn.addEventListener("click", () => setMode(btn.dataset.mode)); });
document.querySelectorAll(".difficulty-btn").forEach(btn => { btn.addEventListener("click", () => setDifficulty(btn.dataset.difficulty)); });

function deleteLast(){ if (!session.length) return; session.pop(); localStorage.setItem(`cube.session.${currentMode}`, JSON.stringify(session)); renderTimes(); renderAnalysis(); drawChart(); }
function clearSession(){ if (!confirm("セッションをすべて削除しますか？")) return; session = []; localStorage.setItem(`cube.session.${currentMode}`, JSON.stringify(session)); renderTimes(); renderAnalysis(); drawChart(); }

// Buttons
el("btnNew").onclick = generateNew;
el("btnToggleInsp").onclick = () => setInspect(!inspectOn);
el("btnDelete").onclick = deleteLast;
el("btnClear").onclick = clearSession;
el("btnExport").onclick = () => {
    const headers = ["index","time_ms","time_s","mode","challenge","scramble","difficulty","timestamp"];
    const rows = [headers].concat(session.map((t,i) => [ i+1, t.ms, (t.ms/1000).toFixed(3), currentMode, `"${t.challenge || t.scramble}"`, `"${t.scramble||""}"`, t.difficulty || "", new Date(t.at).toISOString() ]));
    const csv = rows.map(r=>r.join(",")).join("\n"); dl(`cube_session_${currentMode}.csv`, csv);
};

// Init
function init(){
    setInspect(inspectOn);
    // restore difficulty button state
    document.querySelectorAll(".difficulty-btn").forEach(btn => { btn.classList.toggle("active", btn.dataset.difficulty === currentDifficulty); });
    // mode
    setMode(currentMode);
    // first chart draw after layout
    setTimeout(drawChart, 0);
    window.addEventListener("resize", drawChart);
}
init();