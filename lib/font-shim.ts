// Offline-friendly shim for next/font/google to avoid build-time fetch failures.
// Returns tailwind-friendly classNames instead of downloading Google fonts.
type FontConfig = Record<string, unknown>

export function Playfair_Display(_config?: FontConfig) {
    const variable = typeof _config?.['variable'] === 'string' ? String(_config['variable']) : ''
    const className = variable ? `${variable} font-bebas` : 'font-bebas'
    return { className, variable }
}

export function Inter(_config?: FontConfig) {
    const variable = typeof _config?.['variable'] === 'string' ? String(_config['variable']) : ''
    const className = variable ? `${variable} font-bebas` : 'font-bebas'
    return { className, variable }
}

export function Bebas_Neue(_config?: FontConfig) {
    const variable = typeof _config?.['variable'] === 'string' ? String(_config['variable']) : ''
    const className = variable ? `${variable} font-bebas` : 'font-bebas'
    return { className, variable }
}

export function Ballet(_config?: FontConfig) {
    const variable = typeof _config?.['variable'] === 'string' ? String(_config['variable']) : ''
    const className = variable ? `${variable} font-ballet` : 'font-ballet'
    return { className, variable }
}
