import { Link } from "react-router-dom";
import bdxLogo from "../../assets/BDX_EXTREME.svg";
import "./homePage.css";

const platformFeatures = [
	{
		icon: "emoji_events",
		title: "Compete",
		text: "Find PUBG competitions and play for the top spot.",
	},
	{
		icon: "leaderboard",
		title: "Track results",
		text: "Follow match results, rankings, and tournament progress.",
	},
	{
		icon: "groups",
		title: "Build your squad",
		text: "Connect with teams and players across Bangladesh.",
	},
];

export function HomePage() {
	return (
		<main className="home-page">
			<section className="home-hero">
				<div className="home-hero-content">
					<span className="home-eyebrow">PUBG: BATTLEGROUNDS</span>
					<h1>BD-EXTREME</h1>
					<p className="home-hero-copy">
						The home of competitive PUBG esports in Bangladesh.
						Discover tournaments, follow the leaderboard, and make your mark.
					</p>
					<div className="home-hero-actions">
						<Link to="/tournament" className="home-primary-action">
							Explore tournaments
							<span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
						</Link>
						<Link to="/teams" className="home-secondary-action">Find a team</Link>
					</div>
				</div>
				<div className="home-hero-mark" aria-hidden="true">
					<img src={bdxLogo} alt="" />
					<span>DROP IN. PLAY HARD.</span>
				</div>
			</section>

			<section className="home-intro" aria-labelledby="home-intro-title">
				<div>
					<span className="home-section-kicker">YOUR NEXT MATCH STARTS HERE</span>
					<h2 id="home-intro-title">Made for the battleground.</h2>
				</div>
				<p>
					Keep up with the action, see who is leading, and find your place
					in Bangladesh&apos;s growing PUBG competition scene.
				</p>
			</section>

			<section className="home-features" aria-label="Platform features">
				{platformFeatures.map((feature) => (
					<article className="home-feature" key={feature.title}>
						<span className="material-symbols-outlined home-feature-icon" aria-hidden="true">
							{feature.icon}
						</span>
						<div>
							<h3>{feature.title}</h3>
							<p>{feature.text}</p>
						</div>
					</article>
				))}
			</section>
		</main>
	);
}
