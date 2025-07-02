import logoSongify from "../assets/images/gramofone_32x32.png";
import { Link } from "react-router-dom";
import InputSearch from "./InputSearch";

const Header = () => {
	return (
		<div className="header-container">
			<div className="header">
				<Link to="/">
					<img src={logoSongify} alt="Logo Songify" className="header__img" />
				</Link>

				<InputSearch />

				<Link to="/">
					<h1 className="header__link">Songify</h1>
				</Link>
			</div>
		</div>
	);
};

export default Header;
