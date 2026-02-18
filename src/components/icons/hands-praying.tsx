
const HandsPraying = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M12 4c.667 0 1.333.333 2 1 1.333 1.333 2 3 2 5v4c0 1.105-.895 2-2 2h-4c-1.105 0-2-.895-2-2v-4c0-2 .667-3.667 2-5 .667-.667 1.333-1 2-1z" />
        <path d="M14 5l3 3c1.5 1.5 2.5 3.5 2.5 5.5v2.5" />
        <path d="M10 5l-3 3c-1.5 1.5-2.5 3.5-2.5 5.5v2.5" />
        <path d="M4.5 16h15" />
    </svg>
);

export default HandsPraying;
