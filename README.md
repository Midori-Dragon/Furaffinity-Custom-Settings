# Furaffinity Custom Settings

Helper Script to create Custom settings on Furaffinitiy

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
- Create a new Setting:
  ```javascript
  const setting = new Setting("Setting Name", "Setting Description", SettingType, "Checkbox description", DefaultValue, Action);
  ```
  See [Setting](#setting) for more info
- Trigger when settings should be loaded:
  ```javascript
  CustomSettings.loadSettings();
  ```

### Setting

The Setting class contains following Properties:

- `id` - Can only be set once. Defines the Setting elements html id. Is set to setting Name, if not set manually.
- `name` - Name of the Setting. _(Also defines Settings Header name)_
- `description` - Description of the Setting.
- `type` - Type of the Setting. _(See [SettingTypes](#settingtypes) for more info)_
- `typeDescription` - Description of the Setting element itself. _(Only applies on `SettingTypes.Boolean`)_
- `defaultValue` - Default value for the Setting. _(Is ignored on `SettingTypes.Action`)_
- `action` - Action that is executed when the Setting changes. _(See [Action](#action) for more info)_
- `value` - Current value of the Setting.

### SettingTypes

SettingTypes can have the following values:

- `SettingTypes.Number` - A TextField that only accepts Numbers
- `SettingTypes.Boolean` - A Checkbox with a description (Checkbox description only applies if this Type was chosen)
- `SettingTypes.Action` - A Button with a certain Action

### Action

The Action Parameter defines a Function that is executed when the Setting changed. It receives the Settings Element as a Parameter. Example:

```javascript
new Setting("Name", "Description", SettingTypes.Boolean, "Checkbox Description", false, (target) => {
  console.log(target.checked); // In this case target is a Checkbox
});
```

Here every time the Checkbox is clicked the program prints out wether it is checked or not.
