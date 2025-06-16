import charging from "../assets/images/charging.gif";
import gramofone from "../assets/images/gramofone_512x512.png";
import spotify from "../assets/images/spotify_banner.png";
import { isMobile } from "../scripts/util";

const SplashScreen = () => {
	const banner = !isMobile() ? spotify : gramofone;
	const title = !isMobile() ? "Spotify" : "Songify";

	return (
		<>
			<div className="splash">
				<img src={banner} alt="Banner" className="splash-banner" />
				<p className="splash-txt1">{title}</p>
				<p className="splash-txt2">Estabelecendo comunicação com a biblioteca de músicas</p>
				<img src={charging} alt="Charging GIF" className="splash-charge" />
			</div>
		</>
	);
};
export default SplashScreen;
