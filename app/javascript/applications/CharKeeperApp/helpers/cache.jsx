export const readFromCache = async (key) => window.__TAURI_INTERNALS__ ? await readTauriStore(key) : localStorage.getItem(key);

export const writeToCache = (key, value) => {
  if (value === null) {
    if (window.__TAURI_INTERNALS__ === undefined) localStorage.removeItem(key);
    else updateTauriStore(key, null);
  } else {
    if (window.__TAURI_INTERNALS__ === undefined) localStorage.setItem(key, value);
    else updateTauriStore(key, value);
  }
}

export const readTauriStore = async (key) => {
  try {
    const { load } = window.__TAURI__.store;
    const store = await load('settings.json');
    const value = await store.get(key);
    return value;
  } catch(e) {
    console.log(e.message);
    return null;
  }
}

export const updateTauriStore = async (key, value) => {
  try {
    const { load } = window.__TAURI__.store;
    const store = await load('settings.json');
    await store.set(key, value);
    await store.save();
  } catch(e) {
    console.log(e.message);
    return null;
  }
}
