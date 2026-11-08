/**
 * ShrinkCord - Settings Manager
 */

(function () {
  "use strict";

  const extApi = typeof chrome !== "undefined" && chrome?.storage ? chrome : (typeof browser !== "undefined" ? browser : null);
  const controls = {
    format: document.getElementById("default-format"),
    targetMB: document.getElementById("default-size"),
    quality: document.getElementById("default-quality"),
    fps: document.getElementById("default-fps")
  };
  const keys = Object.keys(controls);

  function saveSettings() {
    if (!extApi?.storage?.local) return;
    const payload = {};
    keys.forEach((key) => {
      const el = controls[key];
      if (el) payload[key] = key === "targetMB" ? parseFloat(el.value) : el.value;
    });
    extApi.storage.local.set(payload);
  }

  if (extApi?.storage?.local) {
    extApi.storage.local.get(keys, (res = {}) => {
      keys.forEach((key) => {
        if (res[key] !== undefined && controls[key]) {
          controls[key].value = String(res[key]);
        }
      });
    });
  }

  keys.forEach((key) => {
    controls[key]?.addEventListener("change", saveSettings);
  });
})();
