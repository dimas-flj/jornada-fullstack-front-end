import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Player from "../components/Player";
import { getArtistSongBySongId } from "../scripts/api_service.js";

const Song = () => {
	const { id, random } = useParams();

	const [artist, setArtist] = useState({});
	const [song, setSong] = useState({});

	useEffect(() => {
		getArtistSongBySongId(id).then((current) => {
			const artistAndSong = current[0];

			setArtist(artistAndSong);
			setSong(artistAndSong.song);
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
				<div
					style={{
						textAlign: "left",
						width: "100%",
					}}
				>
					<Link to={`/artist/${artist._id}`} className="song__artist-image">
						<img width={75} height={75} src={artist.image} alt={`Imagem do Artista ${artist.name}`} />
					</Link>
				</div>

				<Player id={id} random={random} />

				<div style={{ textAlign: "center" }}>
					<p className="song__name">{song.name}</p>
					<p>{song.artist}</p>
				</div>
			</div>
		</div>
	);
};

export default Song;
