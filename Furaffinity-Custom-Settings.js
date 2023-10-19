// ==UserScript==
// @name        Furaffinity-Custom-Settings
// @namespace   Violentmonkey Scripts
// @grant       none
// @version     4.0.13
// @author      Midori Dragon
// @description Helper Script to create Custom settings on Furaffinitiy
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png?v2
// @homepageURL https://greasyfork.org/de/scripts/475041-furaffinity-custom-settings
// @supportURL  https://greasyfork.org/de/scripts/475041-furaffinity-custom-settings/feedback
// @license     MIT
// ==/UserScript==

// jshint esversion: 8

(() => {
  window.Settings = class Settings {
    constructor() {
      this._name = "Extension Settings";
      this._nameId = makeIdCompatible(this._name);
      this._provider = "Custom Furaffinity Settings";
      this._providerId = makeIdCompatible(this._provider);
      this.headerName = "Extension Settings";
      this.settings = [];
    }

    set name(value) {
      this._name = value;
      this._nameId = makeIdCompatible(value);
    }
    get name() {
      return this._name;
    }
    get nameId() {
      return this._nameId;
    }

    set provider(value) {
      this._provider = value;
      this._providerId = makeIdCompatible(value);
    }
    get provider() {
      return this._provider;
    }
    get providerId() {
      return this._providerId;
    }

    newSetting(name, description, type, typeDescription, defaultValue, action) {
      const setting = new Setting(name, description, type, typeDescription, defaultValue, action);
      setting.id = this._providerId + "_" + makeIdCompatible(setting.name);
      setting.document = createSetting(setting, (target) => {
        let value;
        switch (setting.type.description) {
          case "Number":
            value = +target.value;
            if (value == setting.defaultValue) localStorage.removeItem(setting.id);
            else localStorage.setItem(setting.id, value);
            break;
          case "Text":
            value = target.value;
            if (value == setting.defaultValue) localStorage.removeItem(setting.id);
            else localStorage.setItem(setting.id, value);
            break;
          case "Boolean":
            value = target.checked;
            if (value == setting.defaultValue) localStorage.removeItem(setting.id);
            else localStorage.setItem(setting.id, value);
            break;
        }
        if (setting.action) setting.action(target);
      });
      this.settings.push(setting);
      return setting;
    }

    async loadSettings() {
      try {
        addExSettings(this._name, this._provider, this._nameId, this._providerId);
        if (window.location.toString().includes("controls/settings")) {
          addExSettingsSidebar(this._name, this._provider, this._nameId, this._providerId);
          if (window.location.toString().includes("?extension=" + this._providerId)) loadSettings(this.headerName, this.settings);
        }
      } catch (e) {
        console.error(e);
      }
    }

    toString() {
      if (!this.settings || this.settings.length === 0) return "";
      let settingsString = "(";
      for (const setting of this.settings) {
        if (setting.type.description != "Action") settingsString += `"${setting.toString()}", `;
      }
      settingsString = settingsString.slice(0, -2);
      settingsString += ")";
      return settingsString;
    }
  };

  let localSettingsCreated = false;
  window.CustomSettings = new Settings();
  window.SettingTypes = Object.freeze({
    Number: Symbol("Number"),
    Boolean: Symbol("Boolean"),
    Action: Symbol("Action"),
    Text: Symbol("Text"),
  });

  class Setting {
    constructor(name, description, type, typeDescription, defaultValue, action) {
      this._id;
      this.name = name;
      this.description = description;
      this.type = type;
      this.typeDescription = typeDescription;
      this.defaultValue = defaultValue;
      this.action = action;
      this._idFirstSet = true;
    }

    set id(newValue) {
      if (this._idFirstSet) {
        this._id = newValue;
        this._idFirstSet = false;
      } else throw new Error("Can't set Id of a Setting that was already been set.");
    }
    get id() {
      return this._id;
    }

    set value(newValue) {
      if (newValue == this.defaultValue) localStorage.removeItem(this._id);
      else localStorage.setItem(this._id, newValue);
      const elem = document.getElementById(this._id);
      if (elem) {
        switch (this.type.description) {
          case "Number":
          case "Text":
            elem.value = newValue;
            break;
          case "Boolean":
            elem.checked = newValue;
            break;
        }
      }
    }
    get value() {
      const newValue = localStorage.getItem(this._id);
      if (newValue == null || newValue == undefined) return this.defaultValue;
      return convertStringToValue(newValue);
    }

    toString() {
      return `${this.name} = ${this.value}`;
    }
  }

  const FuraffinitySettingsSettings = new Settings();
  FuraffinitySettingsSettings.name = "Extension Settings";
  FuraffinitySettingsSettings.provider = "Custom-Furaffinity-Settings";
  FuraffinitySettingsSettings.headerName = "Global Custom-Furaffinity-Settings";
  const showResetButtonSetting = FuraffinitySettingsSettings.newSetting("Show Reset Button", 'Set wether the "Reset this Setting" button is shown in other Settings.', SettingTypes.Boolean, "Show Reset Button", true);
  localSettingsCreated = true;
  FuraffinitySettingsSettings.loadSettings();

  async function addExSettings(name, provider, nameId, providerId) {
    const settings = document.querySelector('ul[class="navhideonmobile"]').querySelector('a[href="/controls/settings/"]').parentNode;

    if (!document.getElementById(nameId)) {
      const exSettingsHeader = document.createElement("h3");
      exSettingsHeader.id = nameId;
      exSettingsHeader.textContent = name;
      settings.appendChild(exSettingsHeader);
    }

    if (!document.getElementById(providerId)) {
      const currExSettings = document.createElement("a");
      currExSettings.id = providerId;
      currExSettings.textContent = provider;
      currExSettings.href = "/controls/settings?extension=" + providerId;
      currExSettings.style.cursor = "pointer";
      settings.appendChild(currExSettings);
    }
  }

  async function addExSettingsSidebar(name, provider, nameId, providerId) {
    const settings = document.getElementById("controlpanelnav");

    if (!document.getElementById(nameId + "_side")) {
      const exSettingsHeader = document.createElement("h3");
      exSettingsHeader.id = nameId + "_side";
      exSettingsHeader.textContent = name;
      settings.appendChild(exSettingsHeader);
    }

    if (!document.getElementById(providerId + "_side")) {
      const currExSettings = document.createElement("a");
      currExSettings.id = providerId + "_side";
      currExSettings.textContent = provider;
      currExSettings.href = "/controls/settings?extension=" + providerId;
      currExSettings.style.cursor = "pointer";
      settings.appendChild(currExSettings);
      settings.appendChild(document.createElement("br"));
    }
  }

  async function loadSettings(headerName, settings) {
    if (!settings || settings.length === 0) return;
    if (document.getElementById(headerName + "_settingscontainer")) return;

    const columnPage = document.getElementById("columnpage");
    const content = columnPage.querySelector('div[class="content"]');

    for (const section of content.querySelectorAll('section:not([class="exsettings"])')) {
      section.parentNode.removeChild(section);
    }

    const section = document.createElement("section");
    section.id = headerName + "_settingscontainer";
    section.className = "exsettings";
    const headerContainer = document.createElement("div");
    headerContainer.className = "section-header";
    const header = document.createElement("h2");
    header.textContent = headerName;
    headerContainer.appendChild(header);
    section.appendChild(headerContainer);
    const bodyContainer = document.createElement("div");
    bodyContainer.className = "section-body";

    for (const setting of settings) {
      const settingElem = setting.document.querySelector(`[id="${setting.id}"]`);
      switch (setting.type.description) {
        case "Number":
          settingElem.value = setting.value;
          break;
        case "Text":
          settingElem.value = setting.value;
          break;
        case "Boolean":
          settingElem.checked = setting.value;
          break;
      }
      bodyContainer.appendChild(setting.document);
    }

    section.appendChild(bodyContainer);
    content.appendChild(section);
  }

  function createSetting(setting, action) {
    const settingContainer = document.createElement("div");
    settingContainer.className = "control-panel-item-container";

    const settingName = document.createElement("div");
    settingName.className = "control-panel-item-name";
    const settingNameText = document.createElement("h4");
    settingNameText.textContent = setting.name;
    settingName.appendChild(settingNameText);
    settingContainer.appendChild(settingName);

    const settingDesc = document.createElement("div");
    settingDesc.className = "control-panel-item-description";
    const settingDescText = document.createTextNode(setting.description);
    settingDesc.appendChild(settingDescText);
    settingContainer.appendChild(settingDesc);

    if (localSettingsCreated && showResetButtonSetting.value) {
      settingDesc.appendChild(document.createElement("br"));
      settingDesc.appendChild(createSettingReset(setting));
    }

    const settingOption = document.createElement("div");
    settingOption.className = "control-panel-item-options";

    switch (setting.type.description) {
      case "Number":
        settingOption.appendChild(createSettingNumber(setting.id, action));
        break;
      case "Boolean":
        settingOption.appendChild(createSettingBoolean(setting.id, setting.typeDescription, action));
        break;
      case "Action":
        settingOption.appendChild(createSettingAction(setting.id, setting.typeDescription, action));
        break;
      case "Text":
        settingOption.appendChild(createSettingText(setting.id, action));
        break;
    }

    settingContainer.appendChild(settingOption);
    return settingContainer;
  }

  function createSettingReset(setting) {
    const settingDescReset = document.createElement("a");
    settingDescReset.id = setting.id + "_settingreset";
    settingDescReset.textContent = "Reset this Setting";
    settingDescReset.style.cursor = "pointer";
    settingDescReset.style.color = "aqua";
    settingDescReset.style.textDecoration = "underline";
    settingDescReset.style.fontStyle = "italic";
    settingDescReset.style.fontSize = "14px";
    settingDescReset.onclick = () => {
      const userConfirmed = window.confirm(`Are you sure you want to Reset the "${setting.name}" Setting to its default value?`);
      if (userConfirmed) setting.value = setting.defaultValue;
    };
    return settingDescReset;
  }

  function createSettingNumber(id, action) {
    const settingElem = document.createElement("input");
    settingElem.id = id;
    settingElem.type = "text";
    settingElem.className = "textbox";
    settingElem.addEventListener("keydown", (event) => {
      const currentValue = parseInt(settingElem.value) || 0;
      if (event.key === "ArrowUp") {
        settingElem.value = (currentValue + 1).toString();
        action(settingElem);
      } else if (event.key === "ArrowDown") {
        if (currentValue != 0) settingElem.value = (currentValue - 1).toString();
        action(settingElem);
      }
    });
    settingElem.addEventListener("input", () => {
      settingElem.value = settingElem.value.replace(/[^0-9]/g, "");
      if (settingElem.value < 0) settingElem.value = 0;
    });
    settingElem.addEventListener("input", () => action(settingElem));
    return settingElem;
  }

  function createSettingText(id, action) {
    const settingElem = document.createElement("input");
    settingElem.id = id;
    settingElem.type = "text";
    settingElem.className = "textbox";
    settingElem.addEventListener("keydown", (event) => action(settingElem));
    settingElem.addEventListener("input", () => action(settingElem));
    return settingElem;
  }

  function createSettingBoolean(id, typeDescription, action) {
    const container = document.createElement("div");
    const settingElem = document.createElement("input");
    settingElem.id = id;
    settingElem.type = "checkbox";
    settingElem.style.cursor = "pointer";
    settingElem.style.marginRight = "4px";
    settingElem.addEventListener("change", () => action(settingElem));
    container.appendChild(settingElem);
    const settingElemLabel = document.createElement("label");
    settingElemLabel.textContent = typeDescription;
    settingElemLabel.style.cursor = "pointer";
    settingElemLabel.style.userSelect = "none";
    settingElemLabel.addEventListener("click", () => {
      settingElem.checked = !settingElem.checked;
      action(settingElem);
    });
    container.appendChild(settingElemLabel);
    return container;
  }

  function createSettingAction(id, typeDescription, action) {
    const settingElem = document.createElement("button");
    settingElem.id = id;
    settingElem.type = "button";
    settingElem.className = "button standard mobile-fix";
    settingElem.textContent = typeDescription;
    settingElem.addEventListener("click", () => action(settingElem));
    return settingElem;
  }

  function makeIdCompatible(inputString) {
    const sanitizedString = inputString
      .replace(/[^a-zA-Z0-9-_\.]/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/^-*(?=\d)/, "id-");
    return /^[0-9]/.test(sanitizedString) ? "id-" + sanitizedString : sanitizedString;
  }

  function convertStringToValue(value) {
    if (value === "true" || value === "false") {
      return value === "true";
    }

    const parsedNumber = parseFloat(value);
    if (!isNaN(parsedNumber)) {
      return parsedNumber;
    }
    return value;
  }
})();
