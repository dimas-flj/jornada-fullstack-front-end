import { useEffect, useState } from "react";
import SongItem from "./SongItem";

const SongList = ({ songsArray }) => {
	const [labelOnClick, setLabelOnClick] = useState();
	const [items, setItems] = useState(5);

	useEffect(() => {
		if (songsArray.length < items) {
			setLabelOnClick("");
		} else {
			setLabelOnClick(items < songsArray.length ? "Ver mais" : "Recolher");
		}
	}, [items, songsArray.length]);

	return (
		<>
			<div className="song-list">
				{songsArray
					.filter((currentValue, index) => index < items)
					.map((currentSongObj, index) => (
						<SongItem {...currentSongObj} index={index} key={index} />
					))}

				<p
					className="song-list__see-more"
					onClick={() => {
						if (items < songsArray.length) {
							setItems(items + 5);
						} else {
							setItems(5);
						}
					}}
				>
					{labelOnClick}
				</p>
			</div>
		</>
	);
};

export default SongList;
