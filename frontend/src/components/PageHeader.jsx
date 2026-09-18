

export function PageHeader({ title }) {
    return (
        <div className="page-header">
            <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#B6FF2E" />
                <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#ffffff" />
            </svg>
            <p>{title}</p>
        </div>
    );
}