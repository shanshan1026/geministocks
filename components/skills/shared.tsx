import React from 'react';

// ---------------------------------------------------------------------------
// Shared building blocks for skill result components.
// Visual language follows the existing app: white cards, stone borders,
// rounded-xl, black as the primary accent.
// ---------------------------------------------------------------------------

export const SectionCard: React.FC<{
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}> = ({ title, icon, children, className = '' }) => (
    <section className={`bg-white rounded-xl border border-stone-200 shadow-sm p-5 sm:p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-x-2 mb-4">
            {icon}
            <span className="text-balance">{title}</span>
        </h3>
        {children}
    </section>
);

export const StatBox: React.FC<{
    label: string;
    value: string;
    tone?: 'positive' | 'negative' | 'neutral' | 'accent';
    sub?: string;
}> = ({ label, value, tone = 'neutral', sub }) => {
    const toneClasses: Record<string, string> = {
        positive: 'bg-green-50 border-green-200 text-green-700',
        negative: 'bg-red-50 border-red-200 text-red-700',
        neutral: 'bg-stone-50 border-stone-200 text-gray-900',
        accent: 'bg-stone-900 border-stone-900 text-white',
    };
    const subTone = tone === 'accent' ? 'text-stone-300' : 'text-gray-500';
    return (
        <div className={`rounded-lg border p-4 flex flex-col gap-y-1 ${toneClasses[tone]}`}>
            <span className={`text-xs font-medium ${tone === 'accent' ? 'text-stone-300' : 'text-gray-500'}`}>{label}</span>
            <span className="text-xl sm:text-2xl font-bold leading-tight">{value}</span>
            {sub && <span className={`text-xs ${subTone}`}>{sub}</span>}
        </div>
    );
};

export const VerdictBadge: React.FC<{
    label: string;
    tone: 'positive' | 'negative' | 'caution' | 'neutral';
}> = ({ label, tone }) => {
    const tones: Record<string, string> = {
        positive: 'bg-green-100 text-green-800 border-green-300',
        negative: 'bg-red-100 text-red-800 border-red-300',
        caution: 'bg-amber-100 text-amber-800 border-amber-300',
        neutral: 'bg-stone-100 text-stone-700 border-stone-300',
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${tones[tone]}`}>
            {label}
        </span>
    );
};

export const PassFailDot: React.FC<{ pass: boolean }> = ({ pass }) => (
    <span
        aria-hidden="true"
        className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${pass ? 'bg-green-500' : 'bg-red-500'}`}
    />
);

export const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
    <ul className="space-y-2">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-x-2 text-sm text-gray-700 leading-relaxed">
                <span aria-hidden="true" className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

// Format a number as a price string, tolerating missing data
export const fmtPrice = (n: number | null | undefined): string =>
    typeof n === 'number' && isFinite(n) ? `$${n.toFixed(2)}` : 'N/A';

export const fmtPct = (n: number | null | undefined, signed = false): string => {
    if (typeof n !== 'number' || !isFinite(n)) return 'N/A';
    const sign = signed && n > 0 ? '+' : '';
    return `${sign}${n.toFixed(1)}%`;
};

export const fmtNum = (n: number | null | undefined, digits = 1): string =>
    typeof n === 'number' && isFinite(n) ? n.toFixed(digits) : 'N/A';

// Format millions into $B / $M
export const fmtMillions = (n: number | null | undefined): string => {
    if (typeof n !== 'number' || !isFinite(n)) return 'N/A';
    if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}B`;
    return `$${n.toFixed(0)}M`;
};

export const pctTone = (n: number | null | undefined): 'positive' | 'negative' | 'neutral' =>
    typeof n === 'number' && isFinite(n) ? (n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral') : 'neutral';
