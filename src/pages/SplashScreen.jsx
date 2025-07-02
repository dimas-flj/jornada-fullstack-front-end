import charging from "../assets/images/charging.gif";
import gramofone from "../assets/images/gramofone_512x512.png";

const SplashScreen = () => {
	return (
		<>
			<div className="splash">
				<img src={gramofone} alt="Banner" className="splash-banner" />
				<p className="splash-txt1">Songify</p>
				<p className="splash-txt2">Estabelecendo comunicação com a biblioteca de músicas</p>
				<img src={charging} alt="Charging GIF" className="splash-charge" />
			</div>
		</>
	);
};
export default SplashScreen;
