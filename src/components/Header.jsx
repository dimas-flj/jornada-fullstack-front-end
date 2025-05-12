import logoSpotify from "../assets/images/spotify-logo.png";
import { Link } from "react-router-dom";
import InputSearch from "./InputSearch";

const Header = () => {
	return (
		<div className="header-container">
			<div className="header">
				<Link to="/">
					<img src={logoSpotify} alt="Logo Spotify" />
				</Link>

				<InputSearch />

				<Link className="header__link" to="/">
					<h1>Spotify</h1>
				</Link>
			</div>
		</div>
	);
};

export default Header;
