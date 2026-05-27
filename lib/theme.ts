export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'fleetflow-theme'

const VALID: ThemePreference[] = ['light', 'dark', 'system']

export function isThemePreference(value: string): value is ThemePreference {
  return (VALID as string[]).includes(value)
}

export function getStoredThemePreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw && isThemePreference(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'system'
}

export function setStoredThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    /* ignore */
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'dark') return 'dark'
  if (preference === 'light') return 'light'
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

/** Inline bootstrap (see index.html) — same rules as `resolveTheme` + `applyResolvedTheme`. */
export function readThemePreferenceForBootstrap(): ThemePreference {
  return getStoredThemePreference()
}

/** Runs before React hydrates — keeps first paint aligned with stored theme. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var p=localStorage.getItem(k);var pref=(p==='dark'||p==='light'||p==='system')?p:'system';var dark=pref==='dark'||(pref==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',dark);r.style.colorScheme=dark?'dark':'light';}catch(e){}})();`
