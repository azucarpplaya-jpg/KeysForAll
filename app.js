(function () {
  "use strict";

  var STORAGE_KEY = "typeflow.accounts.v1";
  var CURRENT_USER_KEY = "typeflow.currentUser.v1";

  var defaultLessons = [
    "I can type with calm focus.",
    "The blue sky is bright today.",
    "Practice helps my fingers learn.",
    "I read each word before I type.",
    "Small steps make strong skills.",
    "Every lesson builds my confidence."
  ];

  var state = {
    accounts: {},
    currentUser: null,
    mode: "typing",
    activeLesson: 0,
    typingStartedAt: null,
    lastSpokenWordCount: 0,
    puzzleAnswer: []
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function loadAccounts() {
    try {
      state.accounts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      state.accounts = {};
    }
    state.currentUser = localStorage.getItem(CURRENT_USER_KEY);
  }

  function saveAccounts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.accounts));
  }

  function saveCurrentUser(username) {
    state.currentUser = username;
    if (username) {
      localStorage.setItem(CURRENT_USER_KEY, username);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  function createAccount(username, password) {
    return {
      username: username,
      password: password,
      customLessons: [],
      completedLessons: [],
      unlockedLessons: [0],
      settings: {
        speakWords: true,
        voiceRate: 0.9
      }
    };
  }

  function currentAccount() {
    return state.currentUser ? state.accounts[state.currentUser] : null;
  }

  function allLessons() {
    var account = currentAccount();
    return defaultLessons.concat(account ? account.customLessons : []);
  }

  function lessonText(index) {
    return allLessons()[index] || "";
  }

  function normalizeText(value) {
    return value.trim().replace(/\s+/g, " ");
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(function (screen) {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function setMessage(text, isError) {
    var card = byId("authScreen").querySelector(".auth-card");
    var message = byId("authMessage");

    if (!message) {
      message = document.createElement("p");
      message.id = "authMessage";
      message.className = "message";
      card.appendChild(message);
    }

    message.textContent = text;
    message.classList.toggle("error", Boolean(isError));
  }

  function clearMessage() {
    var message = byId("authMessage");
    if (message) {
      message.remove();
    }
  }

  function updateGreeting() {
    var account = currentAccount();
    byId("greeting").textContent = account ? "Hello, " + account.username : "Hello";
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function speak(text) {
    if (!("speechSynthesis" in window) || !text) {
      return;
    }

    var account = currentAccount();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = account && account.settings ? account.settings.voiceRate : 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function ensureProgressBar() {
    var box = byId("typingScreen").querySelector(".lesson-box");
    var progress = byId("typingProgressWrap");

    if (!progress) {
      progress = document.createElement("div");
      progress.id = "typingProgressWrap";
      progress.className = "progress-wrap";
      progress.innerHTML = [
        '<div class="progress-label">',
        "<span>Progress</span>",
        '<span id="progressText">0%</span>',
        "</div>",
        '<div class="progress-track">',
        '<div id="progressFill" class="progress-fill"></div>',
        "</div>"
      ].join("");
      box.insertBefore(progress, byId("typingInput"));
    }
  }

  function setProgress(percent) {
    var safePercent = Math.max(0, Math.min(100, Math.round(percent)));
    var fill = byId("progressFill");
    var text = byId("progressText");

    if (fill) {
      fill.style.width = safePercent + "%";
    }
    if (text) {
      text.textContent = safePercent + "%";
    }
  }

  function renderSentenceHighlight() {
    var target = lessonText(state.activeLesson);
    var typed = byId("typingInput").value;
    var html = "";

    for (var index = 0; index < target.length; index += 1) {
      var className = "char";
      if (index < typed.length) {
        className += typed[index] === target[index] ? " correct" : " incorrect";
      } else if (index === typed.length) {
        className += " current";
      }
      html += '<span class="' + className + '">' + escapeHtml(target[index]) + "</span>";
    }

    byId("sentence").innerHTML = html;
  }

  function updateTypingStats() {
    var target = lessonText(state.activeLesson);
    var typed = byId("typingInput").value;
    var correctCount = 0;

    for (var index = 0; index < typed.length; index += 1) {
      if (typed[index] === target[index]) {
        correctCount += 1;
      }
    }

    var accuracy = typed.length ? Math.round((correctCount / typed.length) * 100) : 100;
    var elapsedMinutes = state.typingStartedAt ? (Date.now() - state.typingStartedAt) / 60000 : 0;
    var wordsTyped = typed.trim() ? typed.trim().split(/\s+/).length : 0;
    var wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
    var progress = target.length ? (Math.min(typed.length, target.length) / target.length) * 100 : 0;

    byId("accuracy").textContent = "Accuracy: " + accuracy + "%";
    byId("wpm").textContent = "WPM: " + wpm;
    setProgress(progress);
    renderSentenceHighlight();
  }

  function completedWordFromTyping() {
    var input = byId("typingInput");
    var value = input.value;
    var words = value.trim().split(/\s+/).filter(Boolean);

    if (!value.endsWith(" ") || words.length <= state.lastSpokenWordCount) {
      return;
    }

    state.lastSpokenWordCount = words.length;
    speak(words[words.length - 1]);
  }

  function markLessonComplete(index) {
    var account = currentAccount();
    if (!account) {
      return;
    }

    if (!account.completedLessons.includes(index)) {
      account.completedLessons.push(index);
    }

    if (index + 1 < allLessons().length && !account.unlockedLessons.includes(index + 1)) {
      account.unlockedLessons.push(index + 1);
    }

    saveAccounts();
  }

  function isUnlocked(index) {
    var account = currentAccount();
    return Boolean(account && account.unlockedLessons.includes(index));
  }

  function showCompletion(isFinal, keepGoingHandlerName, keepGoingLabel) {
    var finalCard = byId("finalScreen").querySelector(".final-card");
    finalCard.innerHTML = [
      "<h1>" + (isFinal ? "Congratulations!" : "Good Job!") + "</h1>",
      '<div class="stars" aria-label="Three completion stars">★ ★ ★</div>',
      "<p>" + (isFinal ? "You finished every unlocked lesson." : "You completed this lesson.") + "</p>",
      '<div class="final-actions">',
      isFinal ? "" : '<button onclick="' + keepGoingHandlerName + '()">' + keepGoingLabel + "</button>",
      '<button class="secondary" onclick="backHome()">Main Menu</button>',
      "</div>"
    ].join("");
    showScreen("finalScreen");
  }

  function renderLessonMenu() {
    var grid = byId("lessonGrid");
    var lessons = allLessons();
    var account = currentAccount();
    var heading = byId("lessonScreen").querySelector("h2");

    heading.textContent = state.mode === "puzzle" ? "Sentence Puzzles" : "Typing Lessons";
    grid.innerHTML = "";

    lessons.forEach(function (lesson, index) {
      var unlocked = isUnlocked(index);
      var completed = account && account.completedLessons.includes(index);
      var card = document.createElement("div");
      card.className = "lesson-card" + (unlocked ? "" : " locked");
      card.tabIndex = unlocked ? 0 : -1;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", unlocked ? "Open lesson " + (index + 1) : "Lesson " + (index + 1) + " is locked");
      card.innerHTML = [
        '<div class="lesson-top">',
        '<span class="lesson-number">' + (index + 1) + "</span>",
        '<span class="lesson-status">' + (completed ? "★" : unlocked ? "→" : "🔒") + "</span>",
        "</div>",
        "<h3>Lesson " + (index + 1) + "</h3>",
        '<p class="lesson-preview">' + escapeHtml(lesson) + "</p>",
        '<div class="lesson-meta">' + (completed ? "Completed" : unlocked ? "Ready" : "Locked") + "</div>"
      ].join("");

      if (unlocked) {
        card.addEventListener("click", function () {
          openLesson(index);
        });
        card.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLesson(index);
          }
        });
      }

      grid.appendChild(card);
    });
  }

  function openLesson(index) {
    state.activeLesson = index;
    if (state.mode === "puzzle") {
      startPuzzle(index);
    } else {
      startTyping(index);
    }
  }

  function startTyping(index) {
    state.activeLesson = index;
    state.typingStartedAt = null;
    state.lastSpokenWordCount = 0;
    ensureProgressBar();
    byId("typingInput").value = "";
    updateTypingStats();
    showScreen("typingScreen");
    byId("typingInput").focus();
  }

  function shuffleWords(words) {
    var shuffled = words.slice();
    for (var index = shuffled.length - 1; index > 0; index -= 1) {
      var randomIndex = Math.floor(Math.random() * (index + 1));
      var temp = shuffled[index];
      shuffled[index] = shuffled[randomIndex];
      shuffled[randomIndex] = temp;
    }
    return shuffled;
  }

  function buildWordTile(word, originalIndex, inAnswer) {
    var tile = document.createElement("button");
    tile.type = "button";
    tile.className = "word-tile" + (inAnswer ? " in-answer" : "");
    tile.textContent = word;
    tile.dataset.word = word;
    tile.dataset.originalIndex = String(originalIndex);
    tile.addEventListener("click", function () {
      speak(word);
      if (inAnswer) {
        state.puzzleAnswer = state.puzzleAnswer.filter(function (item) {
          return item.id !== originalIndex;
        });
      } else {
        state.puzzleAnswer.push({ id: originalIndex, word: word });
      }
      renderPuzzle();
    });
    return tile;
  }

  function currentPuzzleWords() {
    return lessonText(state.activeLesson).split(/\s+/).filter(Boolean);
  }

  function renderPuzzle() {
    var wordBank = byId("wordBank");
    var answerArea = byId("answerArea");
    var words = currentPuzzleWords();
    var selectedIds = state.puzzleAnswer.map(function (item) {
      return item.id;
    });
    var shuffled = state.puzzleShuffled || [];

    wordBank.innerHTML = "";
    answerArea.innerHTML = "";

    shuffled.forEach(function (item) {
      if (!selectedIds.includes(item.id)) {
        wordBank.appendChild(buildWordTile(item.word, item.id, false));
      }
    });

    state.puzzleAnswer.forEach(function (item) {
      answerArea.appendChild(buildWordTile(item.word, item.id, true));
    });

    if (!wordBank.children.length) {
      wordBank.innerHTML = '<span class="lesson-meta">All words are in the answer area.</span>';
    }
    if (!answerArea.children.length) {
      answerArea.innerHTML = '<span class="lesson-meta">Click words in order to build the sentence.</span>';
    }
  }

  function startPuzzle(index) {
    var words = lessonText(index).split(/\s+/).filter(Boolean);
    state.activeLesson = index;
    state.puzzleAnswer = [];
    state.puzzleShuffled = shuffleWords(words.map(function (word, wordIndex) {
      return { id: wordIndex, word: word };
    }));
    renderPuzzle();
    showScreen("puzzleScreen");
  }

  function renderEditor() {
    var list = byId("customLessons");
    var account = currentAccount();
    list.innerHTML = "";

    if (!account || !account.customLessons.length) {
      list.innerHTML = '<p class="lesson-meta">No custom lessons yet.</p>';
      return;
    }

    account.customLessons.forEach(function (lesson, index) {
      var row = document.createElement("div");
      row.className = "editor-row";

      var input = document.createElement("input");
      input.value = lesson;
      input.setAttribute("aria-label", "Custom lesson " + (index + 1));

      var saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.textContent = "Save";
      saveButton.addEventListener("click", function () {
        editLesson(index, input.value);
      });

      var deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteLesson(index);
      });

      row.appendChild(input);
      row.appendChild(saveButton);
      row.appendChild(deleteButton);
      list.appendChild(row);
    });
  }

  function syncLessonAccessAfterLessonChange() {
    var account = currentAccount();
    var count = allLessons().length;

    account.completedLessons = account.completedLessons.filter(function (index) {
      return index < count;
    });
    account.unlockedLessons = account.unlockedLessons.filter(function (index) {
      return index < count;
    });
    if (!account.unlockedLessons.includes(0)) {
      account.unlockedLessons.push(0);
    }
  }

  window.showTab = function (tabName) {
    clearMessage();
    byId("loginTab").classList.toggle("active", tabName === "login");
    byId("signupTab").classList.toggle("active", tabName === "signup");
    document.querySelectorAll(".tabs button").forEach(function (button) {
      button.classList.toggle("active", button.textContent.toLowerCase().replace(" ", "") === tabName);
    });
  };

  window.signup = function () {
    var username = normalizeText(byId("signupUser").value);
    var password = byId("signupPass").value;

    if (!username || !password) {
      setMessage("Please enter a username and password.", true);
      return;
    }
    if (state.accounts[username]) {
      setMessage("That username already exists.", true);
      return;
    }

    state.accounts[username] = createAccount(username, password);
    saveAccounts();
    saveCurrentUser(username);
    byId("signupUser").value = "";
    byId("signupPass").value = "";
    updateGreeting();
    showScreen("homeScreen");
  };

  window.login = function () {
    var username = normalizeText(byId("loginUser").value);
    var password = byId("loginPass").value;
    var account = state.accounts[username];

    if (!account || account.password !== password) {
      setMessage("Username or password is incorrect.", true);
      return;
    }

    saveCurrentUser(username);
    byId("loginUser").value = "";
    byId("loginPass").value = "";
    clearMessage();
    updateGreeting();
    showScreen("homeScreen");
  };

  window.logout = function () {
    saveCurrentUser(null);
    state.activeLesson = 0;
    window.speechSynthesis && window.speechSynthesis.cancel();
    showScreen("authScreen");
    window.showTab("login");
  };

  window.openTyping = function () {
    state.mode = "typing";
    renderLessonMenu();
    showScreen("lessonScreen");
  };

  window.openPuzzle = function () {
    state.mode = "puzzle";
    renderLessonMenu();
    showScreen("lessonScreen");
  };

  window.openEditor = function () {
    renderEditor();
    showScreen("editorScreen");
  };

  window.backHome = function () {
    updateGreeting();
    showScreen("homeScreen");
  };

  window.backLessons = function () {
    renderLessonMenu();
    showScreen("lessonScreen");
  };

  window.speakSentence = function () {
    speak(lessonText(state.activeLesson));
  };

  window.checkTyping = function () {
    var target = normalizeText(lessonText(state.activeLesson));
    var typed = normalizeText(byId("typingInput").value);
    var isCorrect = typed === target;

    updateTypingStats();
    if (!isCorrect) {
      byId("typingInput").focus();
      return;
    }

    markLessonComplete(state.activeLesson);
    showCompletion(state.activeLesson >= allLessons().length - 1, "nextLesson", "Next Lesson");
  };

  window.nextLesson = function () {
    var account = currentAccount();
    if (!account || !account.completedLessons.includes(state.activeLesson)) {
      window.checkTyping();
      return;
    }

    var nextIndex = state.activeLesson + 1;
    if (nextIndex >= allLessons().length) {
      showCompletion(true, "nextLesson", "Next Lesson");
      return;
    }

    startTyping(nextIndex);
  };

  window.checkPuzzle = function () {
    var expected = normalizeText(lessonText(state.activeLesson));
    var answer = normalizeText(state.puzzleAnswer.map(function (item) {
      return item.word;
    }).join(" "));

    if (answer !== expected) {
      byId("answerArea").animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-8px)" },
          { transform: "translateX(8px)" },
          { transform: "translateX(0)" }
        ],
        { duration: 220 }
      );
      return;
    }

    markLessonComplete(state.activeLesson);
    showCompletion(state.activeLesson >= allLessons().length - 1, "nextPuzzle", "Keep Going");
  };

  window.nextPuzzle = function () {
    var account = currentAccount();
    if (!account || !account.completedLessons.includes(state.activeLesson)) {
      window.checkPuzzle();
      return;
    }

    var nextIndex = state.activeLesson + 1;
    if (nextIndex >= allLessons().length) {
      showCompletion(true, "nextPuzzle", "Keep Going");
      return;
    }

    startPuzzle(nextIndex);
  };

  window.addLesson = function () {
    var input = byId("newLessonText");
    var sentence = normalizeText(input.value);
    var account = currentAccount();

    if (!sentence || !account) {
      input.focus();
      return;
    }

    account.customLessons.push(sentence);
    syncLessonAccessAfterLessonChange();
    saveAccounts();
    input.value = "";
    renderEditor();
  };

  window.editLesson = function (customIndex, value) {
    var account = currentAccount();
    var sentence = normalizeText(value);

    if (!account || !sentence) {
      return;
    }

    account.customLessons[customIndex] = sentence;
    saveAccounts();
    renderEditor();
  };

  window.deleteLesson = function (customIndex) {
    var account = currentAccount();
    if (!account) {
      return;
    }

    account.customLessons.splice(customIndex, 1);
    syncLessonAccessAfterLessonChange();
    saveAccounts();
    renderEditor();
  };

  function bindEvents() {
    byId("typingInput").addEventListener("input", function () {
      if (!state.typingStartedAt && byId("typingInput").value.length) {
        state.typingStartedAt = Date.now();
      }
      updateTypingStats();

      if (normalizeText(byId("typingInput").value) === normalizeText(lessonText(state.activeLesson))) {
        markLessonComplete(state.activeLesson);
        showCompletion(state.activeLesson >= allLessons().length - 1, "nextLesson", "Next Lesson");
      }
    });

    byId("typingInput").addEventListener("keyup", function (event) {
      if (event.key === " ") {
        completedWordFromTyping();
      }
    });

    byId("newLessonText").addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        window.addLesson();
      }
    });
  }

  function init() {
    loadAccounts();
    bindEvents();
    window.showTab("login");

    if (state.currentUser && state.accounts[state.currentUser]) {
      updateGreeting();
      showScreen("homeScreen");
    } else {
      saveCurrentUser(null);
      showScreen("authScreen");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
}());
