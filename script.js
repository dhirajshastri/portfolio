/* ============================================================
   MAINFRAME PORTFOLIO — interactivity
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- Boot sequence ---------------- */
  const boot = $("#boot");
  const bootLog = $("#bootLog");
  const bootLines = [
    "MAINFRAME PORTFOLIO SYSTEM — POWER ON SELF TEST",
    "-------------------------------------------------",
    "BIOS v3.27 ..................... [ OK ]",
    "MEMORY CHECK 65536K ............ [ OK ]",
    "PHOSPHOR DISPLAY UNIT .......... [ ONLINE ]",
    "LOADING KERNEL /boot/portfolio.sys",
    "  > mounting /about ........... done",
    "  > mounting /experience ...... done",
    "  > mounting /skills .......... done",
    "  > mounting /awards .......... done",
    "  > mounting /hobbies ......... done",
    "  > mounting /contact ......... done",
    "INITIALIZING OPERATOR SESSION .. [ READY ]",
    "",
    "WELCOME, OPERATOR. LAUNCHING INTERFACE...",
  ];

  let li = 0;
  let bootDone = false;
  function typeBoot() {
    if (bootDone) return;
    if (li < bootLines.length) {
      bootLog.textContent += bootLines[li] + "\n";
      li++;
      setTimeout(typeBoot, 140 + Math.random() * 120);
    } else {
      setTimeout(endBoot, 700);
    }
  }
  function endBoot() {
    if (bootDone) return;
    bootDone = true;
    boot.classList.add("hide");
    setTimeout(() => boot.remove(), 600);
    if (termInput) termInput.focus({ preventScroll: true });
  }
  boot.addEventListener("click", endBoot);
  document.addEventListener("keydown", (e) => {
    if (!bootDone && (e.key === "Enter" || e.key === "Escape")) endBoot();
  });
  typeBoot();

  /* ---------------- Interactive terminal ---------------- */
  const termBody = $("#termBody");
  const termInput = $("#termInput");
  const history = [];
  let histIndex = -1;

  const commands = {
    help() {
      return [
        "Available commands:",
        "  about       -> who is the operator",
        "  experience  -> career log",
        "  skills      -> technical stack",
        "  awards      -> achievements",
        "  hobbies     -> off-duty interests",
        "  contact     -> open comms channel",
        "  play        -> launch BUG_HUNT.EXE",
        "  matrix      -> toggle digital rain",
        "  whoami      -> session identity",
        "  date        -> system clock",
        "  clear       -> wipe the screen",
      ];
    },
    about() { scrollToId("about"); return ["> navigating to /about ..."]; },
    experience() { scrollToId("experience"); return ["> loading experience.log ..."]; },
    skills() { scrollToId("skills"); return ["> reading tech_skills.sys ..."]; },
    awards() { scrollToId("awards"); return ["> opening awards.dat ..."]; },
    hobbies() { scrollToId("hobbies"); return ["> reading hobbies.cfg ..."]; },
    contact() { scrollToId("contact"); return ["> opening comms channel ..."]; },
    play() { openGame(); return ["> executing BUG_HUNT.EXE ..."]; },
    matrix() { toggleMatrix(); return ["> toggling digital rain ..."]; },
    whoami() { return ["dhiraj@mainframe (Mainframe Developer @ Tata Consultancy Services)"]; },
    date() { return [new Date().toString()]; },
    clear() { termBody.innerHTML = ""; return []; },
    ls() { return ["about  experience  skills  awards  hobbies  contact  README.txt"]; },
    cat() { return ["Usage: try 'cat README.txt'"]; },
  };

  function printLine(text, cls) {
    const div = document.createElement("div");
    div.className = "term-line" + (cls ? " " + cls : "");
    div.textContent = text;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function runCommand(raw) {
    const input = raw.trim();
    if (!input) return;
    printLine(input, "cmd");
    history.push(input);
    histIndex = history.length;

    const [cmd, ...args] = input.toLowerCase().split(/\s+/);

    if (cmd === "cat" && args[0] === "readme.txt") {
      ["# MAINFRAME PORTFOLIO", "A creative terminal built with love and phosphor.",
       "Type 'help' to explore. Type 'play' for a game."].forEach((l) => printLine(l));
      return;
    }
    if (commands[cmd]) {
      const out = commands[cmd](args) || [];
      out.forEach((l) => printLine(l));
    } else {
      printLine(`command not found: ${cmd}. Type 'help'.`, "");
    }
  }

  if (termInput) {
    termInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runCommand(termInput.value);
        termInput.value = "";
      } else if (e.key === "ArrowUp") {
        if (histIndex > 0) { histIndex--; termInput.value = history[histIndex]; }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (histIndex < history.length - 1) { histIndex++; termInput.value = history[histIndex]; }
        else { histIndex = history.length; termInput.value = ""; }
        e.preventDefault();
      }
    });
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  /* ---------------- Matrix rain ---------------- */
  const canvas = $("#matrix");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let matrixOn = !reduceMotion;
  let drops = [];
  const glyphs = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}#$%&*+=/\\".split("");
  const fontSize = 16;

  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / fontSize);
    drops = new Array(cols).fill(0).map(() => Math.random() * -50);
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);
  if (!matrixOn) canvas.style.opacity = "0";

  function drawMatrix() {
    if (!matrixOn) { requestAnimationFrame(drawMatrix); return; }
    ctx.fillStyle = "rgba(2,10,2,0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#33ff66";
    ctx.font = fontSize + "px monospace";
    for (let i = 0; i < drops.length; i++) {
      const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  function toggleMatrix() {
    matrixOn = !matrixOn;
    canvas.style.opacity = matrixOn ? "0.14" : "0";
  }
  $("#powerBtn").addEventListener("click", toggleMatrix);

  /* ---------------- Skills animation ---------------- */
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const level = entry.target.getAttribute("data-level");
        const fill = entry.target.querySelector(".bar i");
        if (fill) fill.style.width = level + "%";
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".skill").forEach((s) => skillObserver.observe(s));

  /* ---------------- Contact form ---------------- */
  const CONTACT_EMAIL = "dhirajshastri.work@gmail.com";
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !message || !emailOk) {
      status.className = "form-status err";
      status.textContent = "> ERROR: check name, valid email and message.";
      return;
    }
    const subject = encodeURIComponent(`Portfolio transmission from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    status.className = "form-status ok";
    status.textContent = `> TRANSMISSION READY. Opening mail client, ${name}...`;
    form.reset();
  });

  /* ---------------- Bug Hunt game ---------------- */
  const gameModal = $("#gameModal");
  const gameField = $("#gameField");
  const gameStart = $("#gameStart");
  const gScore = $("#gScore");
  const gTime = $("#gTime");
  const gBest = $("#gBest");
  let score = 0, timeLeft = 20, spawnTimer = null, clockTimer = null, playing = false;
  let best = Number(localStorage.getItem("bugHuntBest") || 0);
  gBest.textContent = best;

  function openGame() {
    gameModal.classList.add("show");
    gameModal.setAttribute("aria-hidden", "false");
  }
  function closeGame() {
    gameModal.classList.remove("show");
    gameModal.setAttribute("aria-hidden", "true");
    stopGame();
  }
  $("#playGameBtn").addEventListener("click", openGame);
  $("#gameClose").addEventListener("click", closeGame);
  gameModal.addEventListener("click", (e) => { if (e.target === gameModal) closeGame(); });

  $("#gameStartBtn").addEventListener("click", startGame);

  function startGame() {
    score = 0; timeLeft = 20; playing = true;
    gScore.textContent = score; gTime.textContent = timeLeft;
    gameStart.style.display = "none";
    clearField();
    spawnTimer = setInterval(spawnBug, 700);
    clockTimer = setInterval(() => {
      timeLeft--; gTime.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
    spawnBug();
  }

  function clearField() {
    gameField.querySelectorAll(".bug").forEach((b) => b.remove());
  }

  function spawnBug() {
    if (!playing) return;
    const bug = document.createElement("div");
    bug.className = "bug";
    bug.textContent = Math.random() > 0.5 ? "🐛" : "🪲";
    const maxX = gameField.clientWidth - 30;
    const maxY = gameField.clientHeight - 30;
    bug.style.left = Math.random() * maxX + "px";
    bug.style.top = Math.random() * maxY + "px";
    bug.addEventListener("click", () => {
      score++; gScore.textContent = score;
      bug.remove();
    });
    gameField.appendChild(bug);
    setTimeout(() => bug.remove(), 1400);
  }

  function stopGame() {
    playing = false;
    clearInterval(spawnTimer);
    clearInterval(clockTimer);
  }

  function endGame() {
    stopGame();
    clearField();
    if (score > best) {
      best = score;
      localStorage.setItem("bugHuntBest", best);
      gBest.textContent = best;
    }
    gameStart.style.display = "flex";
    gameStart.innerHTML =
      `<p>BATCH JOB COMPLETE.<br/>You squashed <b>${score}</b> bugs!<br/>` +
      `Best: <b>${best}</b></p>` +
      `<button class="btn" id="gameRestart">> PLAY AGAIN</button>`;
    $("#gameRestart").addEventListener("click", startGame);
  }
})();