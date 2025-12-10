// Offline-friendly shim for next/font/google to avoid build-time fetch failures.
// Returns tailwind-friendly classNames instead of downloading Google fonts.
type FontConfig = Record<string, unknown>

export function Playfair_Display(_config?: FontConfig) {
    const variable = typeof _config?.['variable'] === 'string' ? String(_config['variable']) : ''
    const className = variable ? `${variable} font-serif` : 'font-serif'
    return { className, variable }
}

export function Inter(_config?: FontConfig) {
    const variable = typeof _config?.['variable'] === 'string' ? String(_config['variable']) : ''
    const className = variable ? `${variable} font-sans` : 'font-sans'
    return { className, variable }
}
