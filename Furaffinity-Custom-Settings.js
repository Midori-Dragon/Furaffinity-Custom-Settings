let nameId;
let providerId;
let bodyContainer;

class Settings {
  constructor() {
    this._name = "Extension Settings";
    this._provider = "Custom Furaffinity Settings";
    this.Settings = [];

    nameId = makeIdCompatible(this._name);
    providerId = makeIdCompatible(this._provider);
  }

  set Name(value) {
    this._name = value;
    nameId = makeIdCompatible(this._name);
  }
  get Name() {
    return this._name;
  }

  set Provider(value) {
    this._provider = value;
    providerId = makeIdCompatible(this._provider);
  }
  get Provider() {
    return this._provider;
  }

  addSetting(newSetting) {
    const setting = new LocalSetting();
    if (newSetting.id) setting.id = newSetting.id;
    else {
      setting.id = nameId + "_" + makeIdCompatible(newSetting.name);
      newSetting.id = setting.id;
    }
    setting.name = newSetting.name;
    setting.type = newSetting.type;
    setting.defaultValue = newSetting.defaultValue;
    setting.value = newSetting.defaultValue;
    setting.document = createSetting(setting.id, newSetting.name, newSetting.description, newSetting.type, newSetting.typeDescription, (target) => {
      let value;
      switch (setting.type) {
        case SettingTypes.Number:
          value = +target.value;
          setting.value = value;
          newSetting.value = value;
          if (value == setting.defaultValue) localStorage.removeItem(setting.id);
          else localStorage.setItem(setting.id, value);
          break;
        case SettingTypes.Boolean:
          value = target.checked;
          setting.value = value;
          newSetting.value = value;
          if (value == setting.defaultValue) localStorage.removeItem(setting.id);
          else localStorage.setItem(setting.id, value);
          break;
      }
      setting.action(target);
    });
    setting.action = newSetting.action;
    CustomSettings.Settings.push(setting);
  }

  async loadSettings() {
    try {
      await readSettings();
      addExSettings();
      if (window.location.toString().includes("controls/settings")) {
        addExSettingsSidebar();
        if (window.location.toString().includes("?extension=" + nameId)) loadSettings();
      }
    } catch (e) {
      console.error(e);
    }
  }

  toString() {
    let settingsString = "(";
    for (const setting of CustomSettings.Settings) {
      settingsString += `"${setting.toString()}", `;
    }
    settingsString = settingsString.slice(0, -2);
    settingsString += ")";
    return settingsString;
  }
}

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

    CustomSettings.addSetting(this);
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
    getLocalSettingById(this._id).value = newValue;
  }
  get value() {
    return getLocalSettingById(this._id).value;
  }
}

const CustomSettings = new Settings();
const SettingTypes = Object.freeze({
  Number: Symbol("Number"),
  Boolean: Symbol("Boolean"),
  Action: Symbol("Action"),
});

class LocalSetting {
  constructor() {
    this.id;
    this.name;
    this.type;
    this.document;
    this.action;
    this.value;
    this.defaultValue;
  }

  toString() {
    return `${this.name} = ${this.value}`;
  }
}

// Adding settings to the navigation menu
async function addExSettings() {
  if (document.getElementById(nameId)) return;

  const settings = document.querySelector('ul[class="navhideonmobile"]').querySelector('a[href="/controls/settings/"]').parentNode;
  const exSettingsHeader = document.createElement("h3");
  exSettingsHeader.id = nameId;
  exSettingsHeader.textContent = CustomSettings.Name;
  settings.appendChild(exSettingsHeader);

  const currExSettings = document.createElement("a");
  currExSettings.id = providerId;
  currExSettings.textContent = CustomSettings.Provider;
  currExSettings.href = "/controls/settings?extension=" + nameId;
  currExSettings.style.cursor = "pointer";
  settings.appendChild(currExSettings);
}

// Adding settings to the settings sidebar menu
async function addExSettingsSidebar() {
  if (document.getElementById(nameId + "_side")) return;

  const settings = document.getElementById("controlpanelnav");
  const exSettingsHeader = document.createElement("h3");
  exSettingsHeader.id = nameId + "_side";
  exSettingsHeader.textContent = CustomSettings.Name;
  settings.appendChild(exSettingsHeader);

  const currExSettings = document.createElement("a");
  currExSettings.id = providerId + "_side";
  currExSettings.textContent = CustomSettings.Provider;
  currExSettings.href = "/controls/settings?extension=" + nameId;
  currExSettings.style.cursor = "pointer";
  settings.appendChild(currExSettings);
}

// Reading stored Settings data
async function readSettings() {
  for (const setting of CustomSettings.Settings) {
    const value = localStorage.getItem(setting.id);
    if (value == null || value == undefined) continue;
    setting.value = convertStringToValue(value);
  }
}

// Creating the settings page
async function loadSettings() {
  if (!CustomSettings || !CustomSettings.Settings || CustomSettings.Settings.length === 0) return;

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
  header.textContent = CustomSettings.Name;
  headerContainer.appendChild(header);
  section.appendChild(headerContainer);
  bodyContainer = document.createElement("div");
  bodyContainer.className = "section-body";

  // Creating the settings
  for (const setting of CustomSettings.Settings) {
    const settingElem = setting.document.querySelector(`[id="${setting.id}"]`);
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
  const container = document.createElement("div");
  const setting = document.createElement("input");
  setting.id = id;
  setting.type = "checkbox";
  setting.style.cursor = "pointer";
  setting.style.marginRight = "4px";
  setting.addEventListener("change", () => action(setting));
  container.appendChild(setting);
  const settingLabel = document.createElement("label");
  settingLabel.textContent = typeDescription;
  settingLabel.style.cursor = "pointer";
  settingLabel.style.userSelect = "none";
  settingLabel.addEventListener("click", () => {
    setting.checked = !setting.checked;
    action(setting);
  });
  container.appendChild(settingLabel);
  return container;
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

function getLocalSettingById(id) {
  return CustomSettings.Settings.find((setting) => setting.id === id);
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
