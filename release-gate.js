(function () {
  "use strict";

  var RELEASE_DATE = new Date("2026-07-11T12:00:00-04:00");
  var SIGNUPS_KEY = "typeflow.releaseNotify.v1";
  var SIGNUP_LIMIT = 100;
  var now = new Date();

  if (now >= RELEASE_DATE) {
    return;
  }

  document.documentElement.classList.add("release-gated");

  function daysUntilRelease() {
    var difference = RELEASE_DATE.getTime() - Date.now();
    return Math.max(1, Math.ceil(difference / 86400000));
  }

  function savedEmails() {
    try {
      return JSON.parse(localStorage.getItem(SIGNUPS_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveEmail(email) {
    var emails = savedEmails();
    var normalizedEmail = email.trim().toLowerCase();

    if (emails.length >= SIGNUP_LIMIT && !emails.includes(normalizedEmail)) {
      return false;
    }

    if (!emails.includes(normalizedEmail)) {
      emails.push(normalizedEmail);
      localStorage.setItem(SIGNUPS_KEY, JSON.stringify(emails));
    }

    return true;
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.textContent = [
      ".release-gated body { overflow: hidden; }",
      ".release-gated .screen { display: none !important; }",
      ".release-screen {",
      "  min-height: 100vh;",
      "  display: grid;",
      "  place-items: center;",
      "  padding: clamp(1rem, 4vw, 3rem);",
      "  color: #143047;",
      "  background:",
      "    radial-gradient(circle at 18% 16%, rgba(103, 174, 239, 0.32), transparent 24rem),",
      "    radial-gradient(circle at 85% 72%, rgba(34, 153, 106, 0.15), transparent 22rem),",
      "    linear-gradient(180deg, #f8fcff 0%, #eef7ff 100%);",
      "  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
      "}",
      ".release-card {",
      "  width: min(100%, 720px);",
      "  padding: clamp(1.3rem, 5vw, 3rem);",
      "  border: 1px solid rgba(162, 203, 239, 0.72);",
      "  border-radius: 30px;",
      "  background: rgba(255, 255, 255, 0.92);",
      "  box-shadow: 0 24px 70px rgba(28, 94, 153, 0.18);",
      "}",
      ".release-pill {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  gap: 0.45rem;",
      "  margin-bottom: 1rem;",
      "  padding: 0.48rem 0.85rem;",
      "  border-radius: 999px;",
      "  color: #155b9e;",
      "  background: #d9ecff;",
      "  font-weight: 800;",
      "  font-size: 0.92rem;",
      "}",
      ".release-card h1 {",
      "  margin: 0 0 0.8rem;",
      "  font-size: clamp(2.4rem, 9vw, 5.3rem);",
      "  line-height: 0.98;",
      "  letter-spacing: 0;",
      "}",
      ".release-card p {",
      "  margin: 0;",
      "  color: #5d758c;",
      "  font-size: clamp(1rem, 2.3vw, 1.2rem);",
      "  line-height: 1.6;",
      "}",
      ".release-date {",
      "  margin: 1.25rem 0;",
      "  padding: 1rem;",
      "  border-radius: 18px;",
      "  color: #155b9e;",
      "  background: #f7fbff;",
      "  border: 1px solid #dceefa;",
      "  font-weight: 900;",
      "}",
      ".release-form {",
      "  display: grid;",
      "  grid-template-columns: 1fr auto;",
      "  gap: 0.75rem;",
      "  margin-top: 1.25rem;",
      "}",
      ".release-form input {",
      "  min-height: 50px;",
      "  width: 100%;",
      "  border: 2px solid #d6e8f8;",
      "  border-radius: 999px;",
      "  padding: 0.85rem 1rem;",
      "  color: #143047;",
      "  background: #fff;",
      "  font: inherit;",
      "}",
      ".release-form button {",
      "  min-height: 50px;",
      "  border: 0;",
      "  border-radius: 999px;",
      "  padding: 0.85rem 1.2rem;",
      "  color: #fff;",
      "  background: #2478c7;",
      "  box-shadow: 0 10px 22px rgba(36, 120, 199, 0.24);",
      "  cursor: pointer;",
      "  font: inherit;",
      "  font-weight: 800;",
      "}",
      ".release-message {",
      "  min-height: 1.5rem;",
      "  margin-top: 0.85rem !important;",
      "  color: #155b9e !important;",
      "  font-weight: 800;",
      "}",
      ".release-note {",
      "  margin-top: 1rem !important;",
      "  font-size: 0.9rem !important;",
      "}",
      "@media (max-width: 620px) {",
      "  .release-form { grid-template-columns: 1fr; }",
      "  .release-form button { width: 100%; }",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function renderReleaseScreen() {
    var screen = document.createElement("main");
    screen.className = "release-screen";
    screen.innerHTML = [
      '<section class="release-card" aria-labelledby="releaseTitle">',
      '<div class="release-pill">TypeFlow launch</div>',
      '<h1 id="releaseTitle">Opening soon.</h1>',
      "<p>TypeFlow is getting polished up for a calm, focused typing experience.</p>",
      '<div class="release-date">Site will release on July 11, 2026 at 12 PM EST. ' + daysUntilRelease() + " days to go.</div>",
     (function () {
  "use strict";

  var RELEASE_DATE = new Date("2026-07-11T12:00:00-04:00");
  var SIGNUPS_KEY = "typeflow.releaseNotify.v1";
  var SIGNUP_LIMIT = 100;
  var now = new Date();

  if (now >= RELEASE_DATE) {
    return;
  }

  document.documentElement.classList.add("release-gated");

  function daysUntilRelease() {
    var difference = RELEASE_DATE.getTime() - Date.now();
    return Math.max(1, Math.ceil(difference / 86400000));
  }

  function savedEmails() {
    try {
      return JSON.parse(localStorage.getItem(SIGNUPS_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveEmail(email) {
    var emails = savedEmails();
    var normalizedEmail = email.trim().toLowerCase();

    if (emails.length >= SIGNUP_LIMIT && !emails.includes(normalizedEmail)) {
      return false;
    }

    if (!emails.includes(normalizedEmail)) {
      emails.push(normalizedEmail);
      localStorage.setItem(SIGNUPS_KEY, JSON.stringify(emails));
    }

    return true;
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.textContent = [
      ".release-gated body { overflow: hidden; }",
      ".release-gated .screen { display: none !important; }",
      ".release-screen {",
      "  min-height: 100vh;",
      "  display: grid;",
      "  place-items: center;",
      "  padding: clamp(1rem, 4vw, 3rem);",
      "  color: #143047;",
      "  background:",
      "    radial-gradient(circle at 18% 16%, rgba(103, 174, 239, 0.32), transparent 24rem),",
      "    radial-gradient(circle at 85% 72%, rgba(34, 153, 106, 0.15), transparent 22rem),",
      "    linear-gradient(180deg, #f8fcff 0%, #eef7ff 100%);",
      "  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
      "}",
      ".release-card {",
      "  width: min(100%, 720px);",
      "  padding: clamp(1.3rem, 5vw, 3rem);",
      "  border: 1px solid rgba(162, 203, 239, 0.72);",
      "  border-radius: 30px;",
      "  background: rgba(255, 255, 255, 0.92);",
      "  box-shadow: 0 24px 70px rgba(28, 94, 153, 0.18);",
      "}",
      ".release-pill {",
      "  display: inline-flex;",
      "  align-items: center;",
      "  gap: 0.45rem;",
      "  margin-bottom: 1rem;",
      "  padding: 0.48rem 0.85rem;",
      "  border-radius: 999px;",
      "  color: #155b9e;",
      "  background: #d9ecff;",
      "  font-weight: 800;",
      "  font-size: 0.92rem;",
      "}",
      ".release-card h1 {",
      "  margin: 0 0 0.8rem;",
      "  font-size: clamp(2.4rem, 9vw, 5.3rem);",
      "  line-height: 0.98;",
      "  letter-spacing: 0;",
      "}",
      ".release-card p {",
      "  margin: 0;",
      "  color: #5d758c;",
      "  font-size: clamp(1rem, 2.3vw, 1.2rem);",
      "  line-height: 1.6;",
      "}",
      ".release-date {",
      "  margin: 1.25rem 0;",
      "  padding: 1rem;",
      "  border-radius: 18px;",
      "  color: #155b9e;",
      "  background: #f7fbff;",
      "  border: 1px solid #dceefa;",
      "  font-weight: 900;",
      "}",
      ".release-form {",
      "  display: grid;",
      "  grid-template-columns: 1fr auto;",
      "  gap: 0.75rem;",
      "  margin-top: 1.25rem;",
      "}",
      ".release-form input {",
      "  min-height: 50px;",
      "  width: 100%;",
      "  border: 2px solid #d6e8f8;",
      "  border-radius: 999px;",
      "  padding: 0.85rem 1rem;",
      "  color: #143047;",
      "  background: #fff;",
      "  font: inherit;",
      "}",
      ".release-form button {",
      "  min-height: 50px;",
      "  border: 0;",
      "  border-radius: 999px;",
      "  padding: 0.85rem 1.2rem;",
      "  color: #fff;",
      "  background: #2478c7;",
      "  box-shadow: 0 10px 22px rgba(36, 120, 199, 0.24);",
      "  cursor: pointer;",
      "  font: inherit;",
      "  font-weight: 800;",
      "}",
      ".release-message {",
      "  min-height: 1.5rem;",
      "  margin-top: 0.85rem !important;",
      "  color: #155b9e !important;",
      "  font-weight: 800;",
      "}",
      ".release-note {",
      "  margin-top: 1rem !important;",
      "  font-size: 0.9rem !important;",
      "}",
      "@media (max-width: 620px) {",
      "  .release-form { grid-template-columns: 1fr; }",
      "  .release-form button { width: 100%; }",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function renderReleaseScreen() {
    var screen = document.createElement("main");
    screen.className = "release-screen";
    screen.innerHTML = [
      '<section class="release-card" aria-labelledby="releaseTitle">',
      '<div class="release-pill">TypeFlow launch</div>',
      '<h1 id="releaseTitle">Opening soon.</h1>',
      "<p>TypeFlow is getting polished up for a calm, focused typing experience.</p>",
      '<div class="release-date">Site will release on July 11, 2026 at 12 PM EST. ' + daysUntilRelease() + " days to go.</div>",
      '<form class="release-form" id="releaseNotifyForm">',
     '<input id="releaseEmail" name="email" type="email" autocomplete="email" placeholder="Enter your email" required>',
      '<button type="submit">Notify me</button>',
 '<form class="release-form" id="releaseNotifyForm" action="https://buttondown.email/airfirico" method="post" target="popupwindow">',
      '<p class="release-message" id="releaseMessage" aria-live="polite"></p>',
      '<p class="release-note">This static preview saves signups in this browser. To send real launch emails, connect the form to an email service before release.</p>',
      "</section>"
    ].join("");

    document.body.prepend(screen);

    document.getElementById("releaseNotifyForm").addEventListener("submit", function (event) {
      var input = document.getElementById("releaseEmail");
      var message = document.getElementById("releaseMessage");

      event.preventDefault();
      if (!input.checkValidity()) {
        message.textContent = "Please enter a valid email.";
        return;
      }

      if (!saveEmail(input.value)) {
        message.textContent = "All the email spots are taken. However, you can reach this site on July 11, 2026 at 12 PM EST.";
        return;
      }

      input.value = "";
      message.textContent = "You're on the list for the TypeFlow launch.";
    });
  }

  function initReleaseGate() {
    injectStyles();
    renderReleaseScreen();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReleaseGate);
  } else {
    initReleaseGate();
  }
}());
      '<input id="releaseEmail" type="email" autocomplete="email" placeholder="Enter your email" required>',
      '<button type="submit">Notify me</button>',
      "</form>",
      '<p class="release-message" id="releaseMessage" aria-live="polite"></p>',
      '<p class="release-note">This static preview saves signups in this browser. To send real launch emails, connect the form to an email service before release.</p>',
      "</section>"
    ].join("");

    document.body.prepend(screen);

    document.getElementById("releaseNotifyForm").addEventListener("submit", function (event) {
      var input = document.getElementById("releaseEmail");
      var message = document.getElementById("releaseMessage");

      event.preventDefault();
      if (!input.checkValidity()) {
        message.textContent = "Please enter a valid email.";
        return;
      }

      if (!saveEmail(input.value)) {
        message.textContent = "All the email spots are taken. However, you can reach this site on July 11, 2026 at 12 PM EST.";
        return;
      }

      input.value = "";
      message.textContent = "You're on the list for the TypeFlow launch.";
    });
  }

  function initReleaseGate() {
    injectStyles();
    renderReleaseScreen();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReleaseGate);
  } else {
    initReleaseGate();
  }
}());
