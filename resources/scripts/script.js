/*
 * Futures Matter Northwood - shared script
 * Loaded with "defer" on every page. Each part works on its own and
 * does nothing on pages where its elements are not present.
 */
(function () {
  "use strict";

  var SCHOOL_EMAIL = "office@futuresmattereducation.co.uk";

  /* ---------- Header: current page and mobile menu ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var here = window.location.pathname.split("/").pop() || "index.html";
    header.querySelectorAll(".site-nav a").forEach(function (link) {
      if (link.getAttribute("href") === here) {
        link.setAttribute("aria-current", "page");
      }
    });

    var toggle = header.querySelector(".nav-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        toggle.focus();
      }
    });
  }

  /* ---------- Tables: scroll sideways inside a box on small screens ---------- */
  function wrapTables() {
    document.querySelectorAll("main table").forEach(function (table) {
      if (
        table.parentElement &&
        table.parentElement.classList.contains("table-wrap")
      )
        return;
      var wrap = document.createElement("div");
      wrap.className = "table-wrap";
      wrap.setAttribute("role", "region");
      wrap.setAttribute("tabindex", "0");
      var caption = table.querySelector("caption");
      wrap.setAttribute(
        "aria-label",
        caption ? caption.textContent.trim() : "Scrollable table",
      );
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  /* ---------- Policies: search by name or code, debounced ---------- */
  function initPolicySearch() {
    var input = document.getElementById("policy-search");
    if (!input) return;

    var items = Array.prototype.slice.call(
      document.querySelectorAll(".policy-item"),
    );
    var groups = Array.prototype.slice.call(
      document.querySelectorAll(".policy-group"),
    );
    var status = document.getElementById("policy-status");
    var none = document.getElementById("policy-none");
    var timer = null;

    /* Every word typed must appear in the policy's name or code, in any order. */
    function filter() {
      var terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;

      items.forEach(function (item) {
        var text = item.getAttribute("data-search") || "";
        var match = terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
        item.hidden = !match;
        if (match) shown++;
      });

      groups.forEach(function (group) {
        group.hidden = !group.querySelector(".policy-item:not([hidden])");
      });

      if (none) none.hidden = shown > 0 || terms.length === 0;
      if (status) {
        status.textContent = terms.length
          ? shown +
            (shown === 1 ? " policy matches" : " policies match") +
            " your search."
          : "";
      }
    }

    /* Wait 250 ms after the last key press before filtering. */
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(filter, 250);
    });
    /* The clear (x) button in search fields fires this event. */
    input.addEventListener("search", filter);
  }

  /* ---------- Contact: enquiry form ---------- */
  function initEnquiryForm() {
    var form = document.getElementById("enquiry-form");
    if (!form) return;

    var result = document.getElementById("f-result");
    var error = document.getElementById("f-error");
    var preview = document.getElementById("f-preview");
    var mailto = document.getElementById("f-mailto");
    var hint = document.getElementById("f-hint");

    function val(id) {
      var el = document.getElementById(id);
      return el ? (el.value || "").trim() : "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var missing = [];
      if (!val("f-name")) missing.push("your name");
      if (!val("f-role")) missing.push("who you are");
      if (!/^\S+@\S+\.\S+$/.test(val("f-email")))
        missing.push("a valid email address");
      if (!val("f-topic")) missing.push("what your enquiry is about");
      if (!val("f-msg")) missing.push("your message");
      var consent = document.getElementById("f-consent");
      if (consent && !consent.checked)
        missing.push("your agreement to be contacted");

      if (missing.length) {
        error.textContent = "Please add " + missing.join(", ") + ".";
        error.hidden = false;
        var first = form.querySelector(
          '[aria-invalid="true"], :invalid, #f-name',
        );
        if (first) first.focus();
        return;
      }

      error.hidden = true;

      var lines = [
        "Enquiry about: " + val("f-topic"),
        "From: " + val("f-name") + " (" + val("f-role") + ")",
        "Email: " + val("f-email"),
      ];
      if (val("f-phone")) lines.push("Telephone: " + val("f-phone"));
      lines.push("", "Message:", val("f-msg"));

      var text = lines.join("\n");
      var subject = "Website enquiry: " + val("f-topic");

      preview.value = text;
      mailto.href =
        "mailto:" +
        SCHOOL_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(text);
      hint.textContent = "";

      form.hidden = true;
      result.hidden = false;
      result.focus();
    });

    document.getElementById("f-edit").addEventListener("click", function () {
      result.hidden = true;
      form.hidden = false;
      document.getElementById("f-name").focus();
    });

    document.getElementById("f-copy").addEventListener("click", function () {
      function fallback() {
        preview.focus();
        preview.select();
        hint.textContent = "Text selected. Press Ctrl+C (or Cmd+C) to copy it.";
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(preview.value).then(function () {
          hint.textContent =
            "Copied. Paste it into an email to " + SCHOOL_EMAIL + ".";
        }, fallback);
      } else {
        fallback();
      }
    });

    mailto.addEventListener("click", function () {
      hint.textContent =
        "If your email app did not open, use Copy enquiry and email it to " +
        SCHOOL_EMAIL +
        ".";
    });
  }

  /* ---------- Larger text toggle ---------- */
  function initLargerText() {
    var button = document.getElementById("a11y-toggle");
    if (!button) return;

    function setLarge(on) {
      document.documentElement.classList.toggle("big-text", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.textContent = on ? "Normal text" : "Larger text";
    }

    var remembered = false;
    try {
      remembered = window.localStorage.getItem("fme-large-text") === "on";
    } catch (e) {
      remembered = false;
    }
    setLarge(remembered);

    button.addEventListener("click", function () {
      var on = !document.documentElement.classList.contains("big-text");
      setLarge(on);
      try {
        window.localStorage.setItem("fme-large-text", on ? "on" : "off");
      } catch (e) {
        /* storage not available: the choice lasts for this page only */
      }
    });
  }

  /* ---------- Start ---------- */
  function init() {
    initHeader();
    wrapTables();
    initPolicySearch();
    initEnquiryForm();
    initLargerText();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
