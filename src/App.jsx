import Header from "./components/Header";
import Artists from "./pages/Artists";
import Artist from "./pages/Artist";
import Songs from "./pages/Songs";
import Song from "./pages/Song";
import Home from "./pages/Home";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { config } from "./scripts/config";
import SplashScreen from "./pages/SplashScreen";
import { isMobile } from "./scripts/util";

const App = () => {
	const [freeHome, setFreeHome] = useState(false);
	const splashTimerInit = useRef(Date.now());

	useEffect(() => {
		const dominio = config.back_end.dominio;
		const cutTime = isMobile() ? 5000 : 2000;
		const response = axios.get(dominio);

		response.then((json) => {
			const data = json.data;
			if (data && data.app_name) {
				if (isMobile()) {
					const splashTimerEnd = Date.now();
					const elapsed = splashTimerEnd - splashTimerInit.current;
					if (elapsed < cutTime) {
						setTimeout(() => {
							setFreeHome(true);
						}, cutTime - elapsed);
					} else {
						setFreeHome(true);
					}
				} else {
					setFreeHome(true);
				}
			} else {
				setFreeHome(true);
			}
		});
	}, [splashTimerInit]);

	return freeHome ? (
		<BrowserRouter>
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/artists" element={<Artists />} />
				<Route path="/artist/:id" element={<Artist />} />
				<Route path="/songs" element={<Songs />} />
				<Route path="/song/:id/:origin?" element={<Song key={Math.random()} />} />
			</Routes>
		</BrowserRouter>
	) : (
		<SplashScreen />
	);
};

export default App;
