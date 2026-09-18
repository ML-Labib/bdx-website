import { Link } from "react-router-dom";
import bdxLogo from "../assets/BDX_EXTREME.svg";
import "./footer.css";

const socialLinks = [
    { label: "YouTube", icon: "smart_display", href: "https://www.youtube.com/@BD-Extreme-delta" },
    { label: "Facebook Group", icon: "groups", href: "https://www.facebook.com/groups/1276517580933932/" },
    { label: "Facebook Page", icon: "public", href: "https://www.facebook.com/bdextreme.official" },
];

const developerLinks = [
    { label: "GitHub", icon: "code", href: "https://github.com/ML-Labib/" },
    { label: "Facebook", icon: "public", href: "https://www.facebook.com/mllabib914/" },
    { label: "YouTube", icon: "smart_display", href: "https://www.youtube.com/@mllabib473" },
];

function ExternalLink({ href, icon, children }) {
    return (
        <a href={href} target="_blank" rel="noreferrer">
            <span className="material-symbols-outlined footer-link-icon" aria-hidden="true">
                {icon}
            </span>
            {children}
        </a>
    );
}

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo-link" aria-label="BD-Extreme home">
                        <img src={bdxLogo} alt="BD-Extreme" className="footer-logo" />
                    </Link>
                    <div>
                        <h2>BD-EXTREME</h2>
                        <p>Esports competition platform from Bangladesh.</p>
                    </div>
                </div>

                <div className="footer-column">
                    <h3>Community</h3>
                    {socialLinks.map((link) => (
                        <ExternalLink key={link.label} href={link.href} icon={link.icon}>
                            {link.label}
                        </ExternalLink>
                    ))}
                </div>

                <div className="footer-column">
                    <h3>Developer</h3>
                    <p className="developer-name">ML Labib</p>
                    {developerLinks.map((link) => (
                        <ExternalLink key={link.label} href={link.href} icon={link.icon}>
                            {link.label}
                        </ExternalLink>
                    ))}
                </div>
            </div>

            <div className="site-footer-bottom">
                <span>© {new Date().getFullYear()} BD-EXTREME</span>
                <span>Built for competitive esports in Bangladesh.</span>
            </div>
        </footer>
    );
}