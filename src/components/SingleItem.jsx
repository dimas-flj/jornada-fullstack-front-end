import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const SingleItem = ({ origin, item }) => {
	const isTypeArtists = origin === "artists";
	const path = isTypeArtists ? `/artist/${item._id}` : `/song/${item._id}/${origin}`;
	return (
		<Link to={path} className="single-item">
			<div className="single-item__div-image-button">
				<div className="single-item__div-image">
					<img
						className="single-item__image"
						src={item.image}
						alt={isTypeArtists ? `Imagem do artista ${item.name}` : `Imagem do album ${item.name}`}
					/>
				</div>
				<FontAwesomeIcon className="single-item__icon" icon={faCirclePlay} />
			</div>
			<div className="single-item__texts">
				<div className="single-item__2lines">
					<p className="single-item__title">{item.name}</p>
				</div>

				<p className="single-item__type">{item.artist ?? "Artista"}</p>
			</div>
		</Link>
	);
};

export default SingleItem;
