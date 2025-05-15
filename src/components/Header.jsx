import logoSpotify from "../assets/images/spotify-logo.png";
import { Link } from "react-router-dom";
import InputSearch from "./InputSearch";

const Header = () => {
	return (
		<div className="header-container">
			<div className="header">
				<Link to="/">
					<img src={logoSpotify} alt="Logo Spotify" className="header__img" />
				</Link>

				<InputSearch />

				<Link to="/">
					<h1 className="header__link">Spotify</h1>
				</Link>
			</div>
		</div>
	);
};

export default Header;
