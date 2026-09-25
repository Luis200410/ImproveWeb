'use client'

interface CheckboxToggleProps {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    description?: string
}

export function CheckboxToggle({ checked, onChange, label, description }: CheckboxToggleProps) {
    return (
        <div className="flex items-start gap-4">
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`
          relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner
          ${checked
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }
        `}
            >
                <span
                    className={`
            absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300
            ${checked ? 'translate-x-6' : 'translate-x-0'}
          `}
                >
                    {checked && (
                        <svg
                            className="w-6 h-6 text-teal-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    )}
                </span>
            </button>

            {(label || description) && (
                <div className="flex-1">
                    {label && (
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                            {label}
                        </div>
                    )}
                    {description && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
