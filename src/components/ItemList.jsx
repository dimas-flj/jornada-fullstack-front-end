import { Link, useLocation } from "react-router-dom";
import { getAllArtists, getAllSongs } from "../scripts/api_service.js";
import SingleItem from "./SingleItem";
import { config } from "../scripts/config";
import { useEffect, useState } from "react";

const ItemList = ({ type }) => {
	const [itemsArray, setItemsArray] = useState([]);

	const items = type === "artists" ? config.contents.artists.items : config.contents.songs.items;
	const title = type === "artists" ? config.contents.artists.title : config.contents.songs.title;

	const { pathname } = useLocation();
	const isHome = pathname === "/";
	const finalAmountItems = isHome ? items : Infinity;

	useEffect(() => {
		if (type === "artists") {
			getAllArtists().then((artistArray) => {
				setItemsArray(artistArray);
			});
		} else {
			getAllSongs().then((songsArray) => {
				setItemsArray(songsArray);
			});
		}
	}, [type, setItemsArray]);

	return (
		<div className="item-list">
			<div className="item-list__header">
				<h2>{title} Populares</h2>

				{isHome ? (
					<Link className="item-list__link" to={title === "Artistas" ? "/artists" : "/songs"}>
						Mostrar tudo
					</Link>
				) : (
					<></>
				)}
			</div>
			<div className="item-list__container">
				{itemsArray
					.filter((currentValue, index) => index < finalAmountItems)
					.map((currObj, index) => (
						<SingleItem key={`${title}_${index}`} itemArray={currObj} />
					))}
			</div>
		</div>
	);
};

export default ItemList;
