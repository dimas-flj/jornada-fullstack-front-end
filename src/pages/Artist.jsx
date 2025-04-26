import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { getSongsByArtistId } from "../scripts/api_service";
import SongList from "../components/SongList";

const Artist = () => {
	const [randomIdFromArtist, setRandomIdFromArtist] = useState("0");
	const [songNameFromArtist, setSongNameFromArtist] = useState();
	const [artist, setArtist] = useState({});
	const [songs, setSongs] = useState([]);

	const toLabelSong = useRef();
	const labelSong = useRef();

	const { id } = useParams();

	useEffect(() => {
		if (id !== undefined) {
			getSongsByArtistId(id).then((artistObj) => {
				const localArtist = artistObj[0];
				setArtist(localArtist);

				const songs_array = localArtist.songs;
				setSongs(songs_array);

				const randomIndex = Math.floor(Math.random() * (songs_array.length - 1));

				setRandomIdFromArtist(songs_array[randomIndex]._id);
				setSongNameFromArtist(songs_array[randomIndex].name);
			});

			toLabelSong.current.addEventListener("mouseover", () => {
				labelSong.current.style.opacity = 1;
			});

			toLabelSong.current.addEventListener("mouseout", () => {
				labelSong.current.style.opacity = 0;
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
			<div>
				<div className="single-item__icon--label" ref={labelSong}>
					{songNameFromArtist}
				</div>
				<Link to={`/song/${randomIdFromArtist}`} ref={toLabelSong}>
					<FontAwesomeIcon className="single-item__icon single-item__icon--artist" icon={faCirclePlay} />
				</Link>
			</div>
		</div>
	);
};

export default Artist;
