import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const SingleItem = ({ itemArray }) => {
	const path = itemArray.artist ? `/song/` : `/artist/`;
	return (
		<Link to={`${path}${itemArray._id}`} className="single-item">
			<div className="single-item__div-image-button">
				<div className="single-item__div-image">
					<img
						className="single-item__image"
						src={itemArray.image}
						alt={`Imagem do artista ${itemArray.name}`}
					/>
				</div>
				<FontAwesomeIcon
					className="single-item__icon"
					icon={faCirclePlay}
				/>
			</div>
			<div className="single-item__texts">
				<div className="single-item__2lines">
					<p className="single-item__title">{itemArray.name}</p>
				</div>

				<p className="single-item__type">
					{itemArray.artist ?? "Artistas"}
				</p>
			</div>
		</Link>
	);
};

export default SingleItem;
