import { Routes, Route } from "react-router";
import { Header } from "./components/Header";
import { Tournament } from "./pages/Tournament/Tournament";
import { Teams } from "./pages/Teams/Teams";
import { Players } from "./pages/Players/Players";
import './App.css'
function App() {


	return (

		<Routes>
		<Route path="/" element={<Header />} />
		<Route path="/tournament" element={<Tournament />} />
		<Route path="/teams" element={<Teams />} />
		<Route path="/players" element={<Players />} />
		</ Routes>

	)
}

export default App
