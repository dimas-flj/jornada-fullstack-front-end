import { useCallback, useEffect, useRef, useState } from "react";
import { getSongsWithArtist } from "../scripts/api_service.js";
import { Link } from "react-router-dom";

const InputSearch = () => {
	const [searchArtistResults, setSearchArtistResults] = useState([]);
	const [searchSongResults, setSearchSongResults] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [items, setItems] = useState([]);
	const [countItems, setCountItems] = useState(-1);

	const suggestionsContainer = useRef();
	const searchCleanIcon = useRef();
	const searchContainer = useRef();
	const inputSearch = useRef();
	const noneDiv = useRef();

	const hasBorderInput = useCallback(() => {
		return searchContainer.current.classList.value.includes("show_border_input");
	}, [searchContainer]);

	const hasBtnClean = useCallback(() => {
		return searchCleanIcon.current.classList.value.includes("show_btn_clean");
	}, [searchCleanIcon]);

	const hideBorderInput = useCallback(() => {
		if (hasBorderInput()) {
			searchContainer.current.classList.toggle("show_border_input");
		}
	}, [hasBorderInput]);

	const showBorderInput = useCallback(() => {
		if (!hasBorderInput()) {
			searchContainer.current.classList.toggle("show_border_input");
		}
	}, [hasBorderInput]);

	const hideBtnClean = useCallback(() => {
		if (hasBtnClean()) {
			searchCleanIcon.current.classList.toggle("show_btn_clean");
		}
	}, [hasBtnClean]);

	const showBtnClean = useCallback(() => {
		if (!hasBtnClean()) {
			searchCleanIcon.current.classList.toggle("show_btn_clean");
		}
	}, [hasBtnClean]);

	const handleSearch = useCallback(
		(e) => {
			setCountItems(-1);
			inputSearch.current.placeholder = "Type you looking for";

			const searchTerm = e ? e.target.value : inputSearch.current.value;
			setSearchTerm(searchTerm);
			setSearchArtistResults([]);
			setSearchSongResults([]);

			if (searchTerm.length === 0) {
				hideBtnClean();
				suggestionsContainer.current.style.display = "none";
				return;
			}
			showBtnClean();

			const phrase = searchTerm
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.toLowerCase();

			let filteredSongResults,
				filteredArtistResults = [];

			// eslint-disable-next-line array-callback-return
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

			let countList = 1;
			if (filteredSongResults.length > 0) {
				filteredSongResults.map((current) => {
					current.tabIndex = countList++;
				});
				setSearchSongResults(filteredSongResults);
			}

			// eslint-disable-next-line array-callback-return
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
				filteredArtistResults.map((current) => {
					current.tabIndex = countList++;
				});
				setSearchArtistResults(filteredArtistResults);
			}

			if (filteredSongResults.length > 0 || filteredArtistResults.length > 0) {
				suggestionsContainer.current.style.display = "block";
			} else {
				suggestionsContainer.current.style.display = "none";
			}
		},
		[hideBtnClean, items, showBtnClean]
	);

	const focusIn = useCallback(() => {
		showBorderInput();
		if (searchTerm.length > 0) {
			handleSearch();
		}
	}, [handleSearch, searchTerm, showBorderInput]);

	const focusOut = useCallback(() => {
		if (searchTerm.length === 0) {
			hideBorderInput();
		}
	}, [hideBorderInput, searchTerm]);

	const resetSuggestions = useCallback(() => {
		setSearchTerm("");
		inputSearch.current.value = "";
		suggestionsContainer.current.style.display = "none";
		setSearchArtistResults([]);
		setSearchSongResults([]);
	}, []);

	const cleanValue = useCallback(() => {
		resetSuggestions();
		inputSearch.current.focus();
		hideBtnClean();
		setCountItems(-1);
	}, [resetSuggestions, hideBtnClean]);

	const resetControllsToNavigate = useCallback(() => {
		resetSuggestions();
		setCountItems(-1);
		hideBorderInput();
		hideBtnClean();
		noneDiv.current.focus();
	}, [hideBorderInput, hideBtnClean, resetSuggestions]);

	const handleKeyDown = useCallback(
		(e) => {
			// [ESC] key
			if (e.keyCode === 27) {
				suggestionsContainer.current.style.display = "none";
				setSearchArtistResults([]);
				setSearchSongResults([]);
				setCountItems(-1);
				noneDiv.current.focus();
			}

			const changeSelectedChildBackground = (show, index) => {
				const element = suggestionsContainer.current.children[index];
				if (!element) {
					return;
				}

				const link = element.children[0];
				if (show) {
					if (!link.classList.value.includes("suggestions-container__items-selected")) {
						link.classList.toggle("suggestions-container__items-selected");
					}
					link.selected = true;
					link.focus();
				} else {
					if (link.classList.value.includes("suggestions-container__items-selected")) {
						link.classList.toggle("suggestions-container__items-selected");
					}
					link.selected = false;
				}
			};

			const up = 38;
			const down = 40;
			const enter = 13;
			if (e.keyCode === up || e.keyCode === down) {
				e.preventDefault();

				const lenItems = suggestionsContainer.current.children.length;
				if (lenItems > 0) {
					let newCountItems;
					if (e.keyCode === down) {
						if (countItems < lenItems - 1) {
							newCountItems = countItems + 1;
							changeSelectedChildBackground(false, newCountItems - 1);
						}
					} else {
						if (countItems > 0) {
							newCountItems = countItems - 1;
							changeSelectedChildBackground(false, newCountItems + 1);
						}
					}
					if (newCountItems === undefined) {
						newCountItems = countItems;
					}
					changeSelectedChildBackground(true, newCountItems);
					setCountItems(newCountItems);
				}
			}

			if (e.keyCode === enter) {
				if (countItems > -1) {
					suggestionsContainer.current.children[countItems].click();
					resetControllsToNavigate();
				}
			}
		},
		[countItems, resetControllsToNavigate]
	);

	const cleanDuplicates = (array) => {
		let cleanedArray = [];
		array.forEach((item) => {
			var duplicated =
				cleanedArray.findIndex((redItem) => {
					return item.artistName === redItem.artistName;
				}) > -1;

			if (!duplicated) {
				cleanedArray.push(item);
			}
		});
		return cleanedArray;
	};

	useEffect(() => {
		getSongsWithArtist().then((songs) => {
			const results = songs.map((song) => ({
				songId: song._id,
				songName: song.name,
				songImage: song.image,
				artistName: song.artist,
				artistId: song.artistObj._id,
				artistImage: song.artistObj.image,
			}));
			setItems(results);
		});
	}, []);

	useEffect(() => {
		const input_search = inputSearch.current;
		const clean_icon = searchCleanIcon.current;

		input_search.addEventListener("focusin", focusIn);
		input_search.addEventListener("focusout", focusOut);
		document.addEventListener("keydown", handleKeyDown);

		clean_icon.addEventListener("click", cleanValue);

		return () => {
			input_search.removeEventListener("focusin", focusIn);
			input_search.removeEventListener("focusout", focusOut);
			document.removeEventListener("keydown", handleKeyDown);

			clean_icon.removeEventListener("click", cleanValue);
		};
	}, [cleanValue, focusIn, focusOut, handleKeyDown]);

	return (
		<div className="search">
			<div ref={searchContainer} className="search-container">
				<div ref={noneDiv} className="noneDiv" tabIndex="0"></div>
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
							<Link key={index} to={`/song/${item.songId}/songs`} style={{ textDecoration: "none" }} onClick={resetControllsToNavigate}>
								<div className="suggestions-container__items" tabIndex={item.tabIndex}>
									<img className="suggestions-container__items--img" src={item.songImage} alt={`Imagem da música ${item.songName}`} />
									<div className="suggestions-container__items--description">
										{item.songName} - ({item.artistName})
									</div>
								</div>
							</Link>
						))}
						{searchArtistResults.map((item, index) => (
							<Link key={index} to={`/artist/${item.artistId}`} style={{ textDecoration: "none" }} onClick={resetControllsToNavigate}>
								<div className="suggestions-container__items" tabIndex={item.tabIndex}>
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
