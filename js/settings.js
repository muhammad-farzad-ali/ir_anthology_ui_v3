let sparqlEndpoint = "https://webislab33.medien.uni-weimar.de/sparql/";

function initSettings() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsPanel = document.getElementById("settings-panel");
  const saveBtn = document.getElementById("save-settings-btn");
  const endpointInput = document.getElementById("sparql-endpoint-input");

  if (!settingsBtn || !settingsPanel) return;

  endpointInput.value = sparqlEndpoint;

  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
      settingsPanel.classList.add("hidden");
    }
  });

  saveBtn.addEventListener("click", () => {
    const newEndpoint = endpointInput.value.trim();

    if (newEndpoint && newEndpoint !== sparqlEndpoint) {
      sparqlEndpoint = newEndpoint;
      window.dispatchEvent(
        new CustomEvent("endpointChanged", {
          detail: { endpoint: sparqlEndpoint },
        }),
      );
    }

    settingsPanel.classList.add("hidden");
  });
}

function getSparqlEndpoint() {
  return sparqlEndpoint;
}

export { initSettings, getSparqlEndpoint };

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initSettings, getSparqlEndpoint };
}
