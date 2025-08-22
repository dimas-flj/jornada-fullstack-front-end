import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Player from "../components/Player";
import { getArtistSongBySongId } from "../scripts/api_service.js";

const Song = () => {
	const { id, origin } = useParams();

	const [artist, setArtist] = useState({});
	const [song, setSong] = useState({});

	useEffect(() => {
		getArtistSongBySongId(id).then((artistAndSong) => {
			setArtist(artistAndSong);

			const song = artistAndSong.song;
			if (song.audio.endsWith(".mp3")) {
				song.audio = `${song.audio}?t=${Date.now()}`;
			} else {
				song.audio = `${song.audio}&t=${Date.now()}`;
			}
			setSong(song);
		});
	}, [id]);

	return (
		<div className="song">
			<div className="song__container">
				<div className="song__image-container">
					<img src={song.image} alt={`Imagem da música ${song.name}`} />
				</div>
			</div>
			<div className="song__bar">
				<div className="song__bar-link">
					<Link to={`/artist/${artist._id}`} className="song__artist-image">
						<img width={75} height={75} src={artist.image} alt={`Imagem do Artista ${artist.name}`} />
					</Link>
				</div>

				<Player id={id} origin={origin} songObj={song} />

				<div className="song__bar-songname">
					<p className="song__name">{song.name}</p>
					<p>{song.artist}</p>
				</div>
			</div>
		</div>
	);
};

export default Song;
