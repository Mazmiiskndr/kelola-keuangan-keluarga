import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="none">
            <rect x="5" y="10" width="23" height="17" rx="4" fill="currentColor" />
            <path d="M9 16h15M9 21h9" stroke="var(--sidebar-primary)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M23 29c4.4-6.2 8-9.7 13-13.1" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
            <path d="M34 16v10h-10" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="31" r="3" fill="#22d3ee" />
            <circle cx="18" cy="31" r="3" fill="#10b981" />
        </svg>
    );
}
