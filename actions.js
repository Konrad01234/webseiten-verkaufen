// ============================================================================
// WorkPilot — Zentrales Event-Delegation-System
// ============================================================================
// Ersetzt alle inline onclick/oninput/onchange/onkeydown/onsubmit-Handler
// durch data-Attribute + einen zentralen Delegator. Dadurch kann
// script-src 'unsafe-inline' aus der CSP entfernt werden.
//
// Nutzung in HTML:
//   <button data-action="navigate" data-page="jobs">Jobs</button>
//   <select data-on-change="setFilter" data-key="category">
//   <input data-on-input="setFilterValue" data-key="search">
//   <form data-on-submit="loginForm">
//
// Registrierung in JS:
//   registerAction('navigate', (el) => navigate(el.dataset.page));
//   registerChange('setFilter', (el) => { state.filters[el.dataset.key] = el.value; render(); });
// ============================================================================

(function () {
  'use strict';

  // ----- Registries -----
  var clickActions = {};
  var changeActions = {};
  var inputActions = {};
  var keydownActions = {};
  var submitActions = {};

  // ----- Public API (auf window, damit app.js + Module registrieren koennen) -----
  window.registerAction  = function (name, fn) { clickActions[name] = fn; };
  window.registerChange  = function (name, fn) { changeActions[name] = fn; };
  window.registerInput   = function (name, fn) { inputActions[name] = fn; };
  window.registerKeydown = function (name, fn) { keydownActions[name] = fn; };
  window.registerSubmit  = function (name, fn) { submitActions[name] = fn; };

  // ----- Click Delegation -----
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;
    var fn = clickActions[action];
    if (!fn) {
      console.warn('[actions] Unknown click action:', action);
      return;
    }
    // Links und Buttons: Default verhindern damit # nicht in die URL kommt
    if (el.tagName === 'A') e.preventDefault();
    fn(el, e);
  });

  // ----- Change Delegation (select, checkbox, radio) -----
  document.addEventListener('change', function (e) {
    var el = e.target.closest('[data-on-change]');
    if (!el) return;
    var action = el.dataset.onChange;
    var fn = changeActions[action];
    if (fn) fn(el, e);
  });

  // ----- Input Delegation (text inputs, textareas) -----
  document.addEventListener('input', function (e) {
    var el = e.target.closest('[data-on-input]');
    if (!el) return;
    var action = el.dataset.onInput;
    var fn = inputActions[action];
    if (fn) fn(el, e);
  });

  // ----- Keydown Delegation -----
  document.addEventListener('keydown', function (e) {
    var el = e.target.closest('[data-on-keydown]');
    if (!el) return;
    var action = el.dataset.onKeydown;
    var fn = keydownActions[action];
    if (fn) fn(el, e);
  });

  // ----- Submit Delegation -----
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-on-submit]');
    if (!form) return;
    e.preventDefault();
    var action = form.dataset.onSubmit;
    var fn = submitActions[action];
    if (fn) fn(form, e);
  });

  // ----- Mouseover/Mouseout Delegation (fuer Hover-Effekte) -----
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest('[data-on-hover]');
    if (!el) return;
    var action = el.dataset.onHover;
    var fn = clickActions['hover_' + action];
    if (fn) fn(el, e);
  });
  document.addEventListener('mouseout', function (e) {
    var el = e.target.closest('[data-on-hover]');
    if (!el) return;
    var action = el.dataset.onHover;
    var fn = clickActions['unhover_' + action];
    if (fn) fn(el, e);
  });
})();
