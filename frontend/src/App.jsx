import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Tournament } from "./pages/Tournament/Tournament";
import { TeamGrid } from "./pages/Teams/TeamGrid";
import { PlayerGrid } from "./pages/Players/PlayerGrid";
import { AboutUs } from "./pages/AboutUs/AboutUs";
import { MyActivity } from "./pages/MyActivity/MyActivity";
import './App.css'
function App() {


	return (

		<Routes>
		<Route path="/" element={<Header />} />
		<Route path="/tournament" element={<Tournament />} />
		<Route path="/teams" element={<TeamGrid />} />
		<Route path="/players" element={<PlayerGrid />} />
		<Route path="/about-us" element={<AboutUs />} />
		<Route path="/my-activity" element={<MyActivity />} />

		</ Routes>

	)
}

export default App
