class LocalStorageManager {
	constructor() {
		if (LocalStorageManager._instance) {
			return LocalStorageManager._instance;
		}
		LocalStorageManager._instance = this;
	}

	get(key) {
		try {
			const value = localStorage.getItem(key);
			return value ? JSON.parse(value) : null;
		} catch (e) {
			console.error(`Error reading key "${key}" from localStorage:`, e);
			return null;
		}
	}

	set(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			console.error(`Error writing key "${key}" to localStorage:`, e);
		}
	}

	remove(key) {
		try {
			localStorage.removeItem(key);
		} catch (e) {
			console.error(`Error removing key "${key}" from localStorage:`, e);
		}
	}

	clear() {
		try {
			localStorage.clear();
		} catch (e) {
			console.error("Error clearing localStorage:", e);
		}
	}
}

const instance = new LocalStorageManager();
export default instance;
