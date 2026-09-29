export const SECRET_DEV_PASSKEY = "Ahmed2026Secure";

export function loadConfig() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlDevKey = urlParams.get('dev');

  if (urlDevKey === SECRET_DEV_PASSKEY) {
    sessionStorage.setItem('is_authenticated_dev', 'true');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  return JSON.parse(localStorage.getItem('eposter_dev_config')) || {
    title1: "WORLD AIDS",
    title2: "DAY 2026",
    dateText: "1 DECEMBER",
    hashtags: ["#WorldAIDSDay", "#KnowYourStatus"],
    slogans: [
      "RETHINK. REBUILD. RISE.",
      "KNOW YOUR STATUS. GET TESTED.",
      "END STIGMA, SUPPORT LIVES.",
      "COMMUNITY LEADERSHIP MATTERS.",
      "EQUALIZE ACCESS TO HEALTHCARE.",
      "STAND IN SOLIDARITY FOR HEALTH.",
      "PROTECT HUMAN RIGHTS, END AIDS.",
      "EARLY TESTING SAVES LIVES."
    ],
    customBackdropDataUrl: null
  };
}

export function saveConfig(newConfig) {
  localStorage.setItem('eposter_dev_config', JSON.stringify(newConfig));
}
