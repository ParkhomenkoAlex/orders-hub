interface IconProps {
    className?: string;
}

export function TrashIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
            <path
                d="M3 4h10M6 4V2h4v2m-6 0 .7 10h6.6L12 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function InventoryIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <rect
                x="4"
                y="5"
                width="16"
                height="14"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M8 9h8M8 13h8M8 17h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
