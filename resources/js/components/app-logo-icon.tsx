import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="none">
            <rect x="3" y="3" width="34" height="34" rx="11" fill="currentColor" />
            <path d="M12 12h14M12 18h10M12 28V12" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 26l8-8M30 26l-8-8" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
            <path d="M27 12c2.8 1 4.8 3.4 5.2 6.4" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
