import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { getSongsByArtistId } from "../scripts/api_service";
import SongList from "../components/SongList";

const Artist = () => {
	const randomIdFromArtist = useRef(0);
	const [artist, setArtist] = useState({});
	const [songs, setSongs] = useState([]);

	const { id } = useParams();

	useEffect(() => {
		if (id !== undefined) {
			getSongsByArtistId(id).then((artistObj) => {
				const localArtist = artistObj[0];
				setArtist(localArtist);

				const songs_array = localArtist.songs;
				setSongs(songs_array);
			});
		}
	}, [id]);

	return (
		<div className="artist">
			<div
				className="artist__header"
				style={{
					backgroundImage: `linear-gradient(to bottom, var(--_shade), var(--_shade)), url(${artist.banner})`,
				}}
			></div>
			<h2 className="artist__title">{artist.name}</h2>
			<div className="artist__body">
				<h2>Populares</h2>
				<SongList songsArray={songs} />
			</div>
			<Link to={`/song/${randomIdFromArtist.current}`}>
				<FontAwesomeIcon className="single-item__icon single-item__icon--artist" icon={faCirclePlay} />
			</Link>
		</div>
	);
};

export default Artist;
