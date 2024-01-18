# Furaffinity Custom Settings

Helper Script to create Custom settings on Furaffinitiy. Also see this Script on Greasy Fork as [Furaffinity-Custom-Settings](https://greasyfork.org/de/scripts/475041-furaffinity-custom-settings)

#### Table of Contents

- [How to use](#how-to-use)
- [Feature Roadmap](#feature-roadmap)
- [Documentation](#documentation)

## How to use

- `@require` this script with the following url "https://raw.githubusercontent.com/Midori-Dragon/Furaffinity-Custom-Settings/main/Furaffinity-Custom-Settings.js"
- _Optional:_ Change Extension Settings Header Name at any Point in your Code:
  ```javascript
  CustomSettings.Name = "Extension Settings";
  ```
- _Optional:_ Change Extension Settings Name at any Point in your Code:
  ```javascript
  CustomSettings.Provider = "Midori's Script Settings";
  ```
- _Optional:_ Change the Settings Header Name:
  ```javascript
  CustomSettings.HeaderName = "My Script Settings";
  ```
- Create a new Setting:
  ```javascript
  const setting = new Setting("Setting Name", "Setting Description", SettingType, "Type Description", DefaultValue, Action);
  ```
  See [Setting](#setting) for more info
- Trigger when settings should be loaded:
  ```javascript
  CustomSettings.loadSettings();
  ```

## Feature Roadmap

- [x] Create new Settings and easily access Settings change
- [x] Have different Setting Types
  - [x] Number (TextField that only allowes Numbers)
  - [x] Boolean (Checkbox with a description)
  - [x] Action (Button with a description)
  - [x] Text (TextField that allow any Characters)
- [x] Change Settings Page Name and Header Name
- [x] Have multiple different Setting Pages

## Documentation

### Setting

The Setting class contains following Properties:

- `id` - Can only be set once. Defines the Setting elements html id. Is set to setting Name, if not set manually.
- `name` - Name of the Setting. _(Also defines Settings Header name)_
- `description` - Description of the Setting.
- `type` - Type of the Setting. _(See [SettingTypes](#settingtypes) for more info)_
- `typeDescription` - Description of the Setting element itself. _(Doesn't apply on `SettingTypes.Number`)_
- `defaultValue` - Default value for the Setting. _(Is ignored on `SettingTypes.Action`)_
- `action` - Action that is executed when the Setting changes. _(See [Action](#action) for more info)_
- `value` - Current value of the Setting.

### SettingTypes

SettingTypes can have the following values:

- `SettingTypes.Number` - A TextField that only accepts Numbers _(Type Description doesn't aplly here)_
- `SettingTypes.Boolean` - A Checkbox with a description
- `SettingTypes.Action` - A Button with a certain Action

### Action

The Action Parameter defines a Function that is executed when the Setting changed. It receives the Settings Element as a Parameter. Example:

```javascript
new Setting("Name", "Description", SettingTypes.Boolean, "Checkbox Description", false, (target) => {
  console.log(target.checked); // In this case target is a Checkbox
});
```

Here every time the Checkbox is clicked the program prints out wether it is checked or not.
