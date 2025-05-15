import React, { useCallback, useEffect, useRef, useState } from "react";
import { getSongsWithArtist } from "../scripts/api_service.js";
import { Link } from "react-router-dom";

const InputSearch = () => {
	const [searchArtistResults, setSearchArtistResults] = useState([]);
	const [searchSongResults, setSearchSongResults] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [items, setItems] = useState([]);

	const suggestionsContainer = useRef();
	const searchCleanIcon = useRef();
	const searchContainer = useRef();
	const inputSearch = useRef();

	const focusIn = () => {
		if (inputSearch.current.value.length === 0) {
			searchContainer.current.classList.toggle("show_border_input");
		}
	};

	const focusOut = () => {
		if (inputSearch.current.value.length === 0) {
			searchContainer.current.classList.toggle("show_border_input");
		}
	};

	const inputText = () => {
		var value = inputSearch.current.value;

		if (value === undefined || value === null || value.length === 0) {
			searchCleanIcon.current.classList.toggle("show_btn_clean");
		} else if (!searchCleanIcon.current.classList.value.includes("show_btn_clean")) {
			searchCleanIcon.current.classList.toggle("show_btn_clean");
		}
	};

	const resetSuggestions = useCallback(() => {
		setSearchTerm("");
		inputSearch.current.value = "";
		inputText();
		searchContainer.current.classList.toggle("show_border_input");
		suggestionsContainer.current.style.display = "none";
		setSearchArtistResults([]);
		setSearchSongResults([]);
	}, [setSearchArtistResults, setSearchSongResults]);

	const cleanValue = useCallback(() => {
		resetSuggestions();
		inputSearch.current.focus();
	}, [resetSuggestions]);

	const handleKeyDown = useCallback(
		(e) => {
			// e.keyCode === 27 (ESC key)
			if (e.keyCode === 27) {
				cleanValue();
			}
		},
		[cleanValue]
	);

	const cleanDuplicates = (array) => {
		let cleanedArray = [];
		array.forEach((item) => {
			var duplicated =
				cleanedArray.findIndex((redItem) => {
					return item.artistName == redItem.artistName;
				}) > -1;

			if (!duplicated) {
				cleanedArray.push(item);
			}
		});
		return cleanedArray;
	};

	const handleSearch = (e) => {
		const searchTerm = e.target.value;
		setSearchTerm(searchTerm);
		setSearchArtistResults([]);
		setSearchSongResults([]);

		const phrase = searchTerm.toLowerCase();
		if (searchTerm === undefined || searchTerm === null || searchTerm.length === 0) {
			suggestionsContainer.current.style.display = "none";
			return;
		}

		let filteredSongResults,
			filteredArtistResults = [];

		filteredSongResults = items.filter((item) => {
			const name = item.songName
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.toLowerCase();
			if (name.includes(phrase)) {
				return item;
			}
		});
		filteredSongResults = cleanDuplicates(filteredSongResults);

		if (filteredSongResults.length > 0) {
			setSearchSongResults(filteredSongResults);
		}

		filteredArtistResults = items.filter((item) => {
			const name = item.artistName
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.toLowerCase();
			if (name.includes(phrase)) {
				return item;
			}
		});
		filteredArtistResults = cleanDuplicates(filteredArtistResults);

		if (filteredArtistResults.length > 0) {
			setSearchArtistResults(filteredArtistResults);
		}

		if (filteredSongResults.length > 0 || filteredArtistResults.length > 0) {
			suggestionsContainer.current.style.display = "block";
		} else {
			suggestionsContainer.current.style.display = "none";
		}
	};

	useEffect(() => {
		getSongsWithArtist().then((songs) => {
			const results = songs.map((song) => ({
				songId: song._id,
				songName: song.name,
				songImage: song.image,
				artistId: song.artist[0]._id,
				artistName: song.artist[0].name,
				artistImage: song.artist[0].image,
			}));
			setItems(results);
		});
	}, []);

	useEffect(() => {
		const input_search = inputSearch.current;
		const clean_icon = searchCleanIcon.current;

		input_search.addEventListener("focusin", focusIn);
		input_search.addEventListener("focusout", focusOut);
		input_search.addEventListener("input", inputText);
		input_search.addEventListener("keydown", handleKeyDown);

		clean_icon.addEventListener("click", cleanValue);

		return () => {
			input_search.removeEventListener("focusin", focusIn);
			input_search.removeEventListener("focusout", focusOut);
			input_search.removeEventListener("input", inputText);
			input_search.removeEventListener("keydown", handleKeyDown);

			clean_icon.removeEventListener("click", cleanValue);
		};
	}, [cleanValue, handleKeyDown]);

	return (
		<div className="search">
			<div ref={searchContainer} className="search-container">
				<div className="search-container__icons">
					<img alt="Pesquisar" className="input-search__search-icon" />
				</div>

				<div className="search-container__input">
					<input
						ref={inputSearch}
						type="text"
						className="input-search"
						placeholder="Type you looking for"
						value={searchTerm}
						onChange={handleSearch}
					/>

					<div ref={suggestionsContainer} className="suggestions-container">
						{searchSongResults.map((item, index) => (
							<Link key={index} to={`/song/${item.songId}/songs`} style={{ textDecoration: "none" }} onClick={resetSuggestions}>
								<div className="suggestions-container__items">
									<img className="suggestions-container__items--img" src={item.songImage} alt={`Imagem da música ${item.songName}`} />
									<div className="suggestions-container__items--description">
										{item.songName} - ({item.artistName})
									</div>
								</div>
							</Link>
						))}
						{searchArtistResults.map((item, index) => (
							<Link key={index} to={`/artist/${item.artistId}`} style={{ textDecoration: "none" }} onClick={resetSuggestions}>
								<div className="suggestions-container__items">
									<img className="suggestions-container__items--img" src={item.artistImage} alt={`Imagem do artista ${item.artistName}`} />
									<div className="suggestions-container__items--description">{item.artistName}</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				<div className="input-search__pipe"></div>

				<div className="search-container__icons">
					<img ref={searchCleanIcon} alt="Pesquisar" className="input-search__clean-icon" />
				</div>
			</div>
		</div>
	);
};

export default InputSearch;
