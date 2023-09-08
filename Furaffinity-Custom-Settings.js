try {
  addExSettings();
  if (window.location.toString().includes("controls/settings")) {
    addExSettingsSidebar();
    const exSettings = JSON.parse(localStorage.getItem(nameId)) || false;
    if (exSettings) loadSettings();
  }
} catch (e) {
  console.error(e);
}

//#region Globals
class Settings {
  constructor() {
    this.settingsName = "Extension Settings";
    this.settingsProvider = "Custom Furaffinity Settings";
    this.settings = [];
  }

  addSetting(newSetting) {
    const setting = new LocalSetting();
    setting.id = nameId + "_" + makeIdCompatible(newSetting.name);
    setting.document = createSetting(setting.id, newSetting.name, newSetting.description, newSetting.type, newSetting.typeDescription, (target) => {
      let value;
      switch (type) {
        case SettingTypes.Number:
          value = +target.value;
          setting.value = value;
          newSetting.value = value;
          localStorage.setItem(setting.id, value);
          break;
        case SettingTypes.Boolean:
          value = target.checked;
          setting.value = value;
          newSetting.value = value;
          localStorage.setItem(setting.id, value);
          break;
      }
      setting.action(target);
    });
    setting.action = newSetting.action;
    CustomSettings.settings.push(setting);
    // setting.querySelector('[id*="setting"]').checked = showLoadLastXFavsButton;
  }
}

class Setting {
  constructor(name, description, type, typeDescription, action) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.typeDescription = typeDescription;
    this.action = action;
    this.value;
  }
}

class SettingType {
  static Number = new SettingType("Number");
  static Boolean = new SettingType("Boolean");
  static Action = new SettingType("Action");

  constructor(type) {
    this.type = type;
  }
}

const CustomSettings = new Settings();
const SettingTypes = Object.freeze({
  Number: Symbol("Number"),
  Boolean: Symbol("Boolean"),
  Action: Symbol("Action"),
});

// export { Settings, Setting, SettingType, CustomSettings, SettingTypes };
//#endregion

//#region Locals
class LocalSetting {
  constructor() {
    this.id;
    this.document;
    this.action;
    this.value;
  }
}

let nameId = makeIdCompatible(Settings.settingsName);
let providerId = makeIdCompatible(Settings.settingsProvider);
let bodyContainer;
//#endregion

// Adding settings to the navigation menu
async function addExSettings() {
  const settings = document.querySelector('ul[class="navhideonmobile"]').querySelector('a[href="/controls/settings/"]').parentNode;

  if (document.getElementById(nameId)) {
    document.getElementById(providerId).addEventListener("click", () => {
      localStorage.setItem(nameId, true);
    });
    return;
  }
  const exSettingsHeader = document.createElement("h3");
  exSettingsHeader.id = nameId;
  exSettingsHeader.textContent = Settings.settingsName;
  settings.appendChild(exSettingsHeader);

  const currExSettings = document.createElement("a");
  currExSettings.id = providerId;
  currExSettings.textContent = Settings.settingsProvider;
  currExSettings.style.cursor = "pointer";
  currExSettings.onclick = function () {
    localStorage.setItem(nameId, true);
    window.location = "https://www.furaffinity.net/controls/settings";
  };
  settings.appendChild(currExSettings);
}

// Adding settings to the settings sidebar menu
async function addExSettingsSidebar() {
  const settings = document.getElementById("controlpanelnav");

  if (document.getElementById(nameId + "side")) {
    document.getElementById(providerId + "_side").addEventListener("click", () => {
      localStorage.setItem(nameId, true);
    });
    return;
  }
  const exSettingsHeader = document.createElement("h3");
  exSettingsHeader.id = nameId + "_side";
  exSettingsHeader.textContent = Settings.settingsName;
  settings.appendChild(exSettingsHeader);

  const currExSettings = document.createElement("a");
  currExSettings.id = providerId + "_side";
  currExSettings.textContent = Settings.settingsProvider;
  currExSettings.style.cursor = "pointer";
  currExSettings.onclick = function () {
    localStorage.setItem(nameId, true);
    window.location = "https://www.furaffinity.net/controls/settings";
  };
  settings.appendChild(currExSettings);
}

// Creating the settings page
async function loadSettings() {
  localStorage.setItem(nameId, false);
  const columnPage = document.getElementById("columnpage");
  const content = columnPage.querySelector('div[class="content"]');

  for (const section of content.querySelectorAll('section:not([class="exsettings"])')) {
    section.parentNode.removeChild(section);
  }

  const section = document.createElement("section");
  section.className = "exsettings";
  const headerContainer = document.createElement("div");
  headerContainer.className = "section-header";
  const header = document.createElement("h2");
  header.textContent = settingsName;
  headerContainer.appendChild(header);
  section.appendChild(headerContainer);
  bodyContainer = document.createElement("div");
  bodyContainer.className = "section-body";

  // Creating the settings
  for (const setting of CustomSettings.settings) {
    const settingElem = setting.document.getElementById(setting.id);
    switch (setting.type) {
      case SettingTypes.Number:
        settingElem.value = setting.value;
        break;
      case SettingTypes.Boolean:
        settingElem.checked = setting.value;
        break;
    }
    bodyContainer.appendChild(setting.document);
  }

  section.appendChild(bodyContainer);
  content.appendChild(section);
}

function createSetting(id, name, description, type, typeDescription, action) {
  const settingContainer = document.createElement("div");
  settingContainer.className = "control-panel-item-container";

  const settingName = document.createElement("div");
  settingName.className = "control-panel-item-name";
  const settingNameText = document.createElement("h4");
  settingNameText.textContent = name;
  settingName.appendChild(settingNameText);
  settingContainer.appendChild(settingName);

  const settingDesc = document.createElement("div");
  settingDesc.className = "control-panel-item-description";
  const settingDescText = document.createTextNode(description);
  settingDesc.appendChild(settingDescText);
  settingContainer.appendChild(settingDesc);

  const settingOption = document.createElement("div");
  settingOption.className = "control-panel-item-options";

  switch (type) {
    case SettingTypes.Number:
      settingOption.appendChild(createSettingNumber(id, action));
      break;
    case SettingTypes.Boolean:
      settingOption.appendChild(createSettingBoolean(id, typeDescription, action));
      break;
    case SettingTypes.Action:
      settingOption.appendChild(createSettingAction(id, typeDescription, action));
      break;
  }

  settingContainer.appendChild(settingOption);
  return settingContainer;
}

function createSettingNumber(id, action) {
  const setting = document.createElement("input");
  setting.id = id;
  setting.type = "text";
  setting.className = "textbox";
  setting.addEventListener("keydown", (event) => {
    const currentValue = parseInt(setting.value) || 0;
    if (event.key === "ArrowUp") {
      setting.value = (currentValue + 1).toString();
      action(setting);
    } else if (event.key === "ArrowDown") {
      if (currentValue != 0) setting.value = (currentValue - 1).toString();
      action(setting);
    }
  });
  setting.addEventListener("input", () => {
    setting.value = setting.value.replace(/[^0-9]/g, "");
    if (setting.value < 0) setting.value = 0;
  });
  setting.addEventListener("input", () => action(setting));
  return setting;
}

function createSettingBoolean(id, typeDescription, action) {
  const setting = document.createElement("input");
  setting.id = id;
  setting.type = "checkbox";
  setting.style.cursor = "pointer";
  setting.style.marginRight = "4px";
  setting.addEventListener("change", () => action(setting));
  settingOption.appendChild(setting);
  const settingOptionLabel = document.createElement("label");
  settingOptionLabel.textContent = typeDescription;
  settingOptionLabel.style.cursor = "pointer";
  settingOptionLabel.addEventListener("click", () => {
    setting.checked = !setting.checked;
    action(setting);
  });
  return setting;
}

function createSettingAction(id, typeDescription, action) {
  const setting = document.createElement("button");
  setting.id = id;
  setting.type = "button";
  setting.className = "button standard mobile-fix";
  setting.textContent = typeDescription;
  setting.addEventListener("click", () => action(setting));
  return setting;
}

function makeIdCompatible(inputString) {
  const sanitizedString = inputString
    .replace(/[^a-zA-Z0-9-_\.]/g, "-") // Replace invalid characters with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading and trailing hyphens
    .replace(/^-*(?=\d)/, "id-"); // Prefix with 'id-' if it starts with a digit

  // Ensure the ID starts with a letter
  return /^[0-9]/.test(sanitizedString) ? "id-" + sanitizedString : sanitizedString;
}
