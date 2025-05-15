import {
	faCirclePlay,
	faCirclePause,
	faBackwardStep,
	faForwardStep,
	faVolumeXmark,
	faVolumeHigh,
	faVolumeLow,
	faShuffle,
	faRepeat,
} from "@fortawesome/free-solid-svg-icons";

import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getAllSongs, getSongsByArtistName } from "../scripts/api_service.js";
import { formatTime, getRandomizeProperties, isMobile } from "../scripts/util.js";

import { LightTooltip } from "./LightTooltip.jsx";
import InputRangeSong from "./InputRangeSong";
import chargingDuration from "../assets/images/charging.gif";
import { faVolumeMedium } from "./faVolumeMedium.js";
import tenBackward from "../assets/images/ten_backward.png";
import tenForward from "../assets/images/ten_forward.png";
import { useNavigate } from "react-router-dom";

const Player = ({ id, origin, songObj }) => {
	const navigate = useNavigate();

	const [randomizedSongs, setRandomizedSongs] = useState(JSON.parse(window.localStorage.getItem("randomized_songs")));
	const [initTimeToggleVolume, setInitTimeToggleVolume] = useState(null);
	const [advanceTenSeconds, setAdvanceTenSeconds] = useState(false);
	const [controlsReleased, setControlsReleased] = useState(false);
	const [goBackTenSeconds, setGoBackTenSeconds] = useState(false);
	const [currentTime, setCurrentTime] = useState(formatTime(0));
	const [rangeVolumeValue, setRangeVolumeValue] = useState(5);
	const [iconVolume, setIconVolume] = useState(faVolumeXmark);
	const [pressedKeys, setPressedKeys] = useState(new Set());
	const [songProperties, setSongProperties] = useState({});
	const [toolTipVolume, setToolTipVolume] = useState();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [duration, setDuration] = useState(0);

	const divRangeAudioVolume = useRef();
	const rangeAudioVolume = useRef();
	const tooltip = useRef();

	const changeRandomizedSongsValue = () => {
		setRandomizedSongs(!randomizedSongs);
		window.localStorage.setItem("randomized_songs", !randomizedSongs);
	};

	const changeIconVolume = useCallback((volume) => {
		if (volume === 0) {
			setIconVolume(faVolumeXmark);
		} else if (volume > 0 && volume <= 4) {
			setIconVolume(faVolumeLow);
		} else if (volume > 4 && volume <= 8) {
			setIconVolume(faVolumeMedium);
		} else if (volume > 8) {
			setIconVolume(faVolumeHigh);
		}

		setRangeVolumeThumbsPosition();
	}, []);

	const changeValueVolume = (e) => {
		const range = e.target;
		setRangeVolumeValue(Number(range.value));

		const value = ((range.value - range.min) / (range.max - range.min)) * 100;
		rangeAudioVolume.current.style.background = `linear-gradient(to right, silver 0%, silver ${value}%, rgb(119, 101, 101) ${value}%, rgb(119, 101, 101) 100%)`;
	};

	const setRangeVolumeThumbsPosition = () => {
		const range = rangeAudioVolume.current;
		const range_value = Number(range.value);
		const range_max = Number(range.max);
		const range_min = Number(range.min);

		let thumbSize = 8;
		const ratio = (range_value - range_min) / (range_max - range_min);
		let amountToMove = ratio * (range.offsetWidth - thumbSize - thumbSize) + thumbSize;
		tooltip.current.style.left = amountToMove + 25 + "px";

		const value = ((range.value - range.min) / (range.max - range.min)) * 100;
		rangeAudioVolume.current.style.background = `linear-gradient(to right, silver 0%, silver ${value}%, rgb(119, 101, 101) ${value}%, rgb(119, 101, 101) 100%)`;
	};

	const stopRedirect = (paramId) => {
		const id = paramId || songProperties.idForward;

		setIsPlaying(false);
		setTimeout(() => {
			setControlsReleased(false);
			let path = `/song/${id}`;
			if (origin === "songs") {
				path += `/${origin}`;
			}
			navigate(path, { replace: true });
		}, 1000);
	};

	const handleMutedVol = () => {
		setIsMuted(!isMuted);
		rangeAudioVolume.current.disabled = !isMuted;
	};

	const getPlusMinusSignal = useCallback(
		(e) => {
			setPressedKeys(() => pressedKeys.add(e.key));

			// [Ctrl]+[Shift]+[+]
			if ((pressedKeys.has("Control") && pressedKeys.has("Shift") && pressedKeys.has("+")) || pressedKeys.has("+")) {
				return "+";
			}
			// [Ctrl]+[+]
			else if ((pressedKeys.has("Control") && pressedKeys.has("-")) || pressedKeys.has("-")) {
				return "-";
			}
			// [any key]
			else {
				return e.key;
			}
		},
		[pressedKeys]
	);

	const cleanListKeys = useCallback(
		(e) => {
			pressedKeys.delete(e.key);
		},
		[pressedKeys]
	);

	const handleKeyDown = useCallback(
		(e) => {
			const signal = getPlusMinusSignal(e);

			// e.keyCode === 107 (- key)
			// e.keyCode === 109 (+ key)
			if (signal === "-" || signal === "+") {
				e.preventDefault();

				setInitTimeToggleVolume(Date.now());

				let classList = divRangeAudioVolume.current.classList.toString();

				let isToggle = classList.indexOf("toggle") > -1;
				if (!isToggle) {
					divRangeAudioVolume.current.classList.toggle("toggle");
				}

				const range = rangeAudioVolume.current;
				let level = Number(range.value);
				if (signal === "+" && level < 10) {
					level++;
				}
				if (signal === "-" && level > 0) {
					level--;
				}
				setRangeVolumeValue(level);
				setTimeout(() => {
					classList = tooltip.current.classList.toString();
					isToggle = classList.indexOf("toggle") > -1;
					if (!isToggle) {
						tooltip.current.classList.toggle("toggle");
					}
				}, 400);
			}
		},
		[getPlusMinusSignal]
	);

	// Handle controllers songs navigation
	useEffect(() => {
		console.log("entrei 1");
		const randomized = JSON.parse(window.localStorage.getItem("randomized_songs"));
		if (origin === "songs") {
			getAllSongs().then((songsArray) => {
				setSongProperties(getRandomizeProperties(songsArray, id, randomized));
			});
		} else {
			if (songObj.artist !== undefined) {
				getSongsByArtistName(songObj.artist).then((artist) => {
					const songsArray = artist[0].songs;
					setSongProperties(getRandomizeProperties(songsArray, id, randomized));
				});
			}
		}
	}, [id, origin, songObj, randomizedSongs]);

	// Handle keyboard events
	useEffect(() => {
		console.log("entrei 2");
		document.addEventListener("keydown", handleKeyDown, false);
		document.addEventListener("keyup", cleanListKeys, false);

		return () => {
			document.removeEventListener("keydown", handleKeyDown, false);
			document.removeEventListener("keyup", cleanListKeys, false);
		};
	}, [handleKeyDown, pressedKeys, cleanListKeys]);

	// Handle current time
	useEffect(() => {
		console.log("entrei 3");
		if (!isMobile()) {
			const interval = setInterval(() => {
				// hide container audio volume
				if (initTimeToggleVolume != null && Date.now() - initTimeToggleVolume > 800) {
					divRangeAudioVolume.current.classList.toggle("toggle");
					tooltip.current.classList.toggle("toggle");
					setInitTimeToggleVolume(null);
				}
			}, 500);

			return () => clearInterval(interval);
		}
	}, [initTimeToggleVolume]);

	// Handle input audio/range volume
	useEffect(() => {
		console.log("entrei 4");
		if (!isMobile()) {
			const range = rangeAudioVolume.current;
			if (isMuted) {
				setIconVolume(faVolumeXmark);
			} else {
				range.value = rangeVolumeValue;
				setToolTipVolume(rangeVolumeValue);
				changeIconVolume(rangeVolumeValue);
			}

			setRangeVolumeThumbsPosition();
		}
	}, [changeIconVolume, isMuted, rangeVolumeValue]);

	return (
		<div className="player">
			<div className="player__controllers">
				<LightTooltip title={songProperties.disableBackwardButton || !controlsReleased ? "" : songProperties.songNameBackward} placement="top">
					<FontAwesomeIcon
						className={songProperties.disableBackwardButton || !controlsReleased ? "player__icon--disabled" : "player__icon"}
						icon={faBackwardStep}
						onClick={(e) =>
							songProperties.disableBackwardButton || !controlsReleased ? e.preventDefault() : stopRedirect(songProperties.idBackward)
						}
					/>
				</LightTooltip>

				<LightTooltip title={songProperties.disableBackwardButton || !controlsReleased ? "" : "-10 segundos"} placement="top">
					<img
						src={tenBackward}
						alt="Retorna 10 segundos"
						className={
							songProperties.disableBackwardButton || !controlsReleased
								? "player__icon--disabled player__icon-redimensioned"
								: "player__icon  player__icon-redimensioned"
						}
						onClick={(e) => (!controlsReleased ? e.preventDefault() : setGoBackTenSeconds(true))}
					/>
				</LightTooltip>

				<LightTooltip title={songProperties.disableBackwardButton || !controlsReleased ? "" : isPlaying ? "Pausar" : "Executar"} placement="top">
					<FontAwesomeIcon
						className={!controlsReleased ? "player__icon--charging" : "player__icon player__icon--play"}
						icon={isPlaying ? faCirclePause : faCirclePlay}
						onClick={(e) => {
							!controlsReleased ? e.preventDefault() : setIsPlaying(!isPlaying);
						}}
					/>
				</LightTooltip>

				<LightTooltip title={songProperties.disableBackwardButton || !controlsReleased ? "" : "+10 segundos"} placement="top">
					<img
						src={tenForward}
						alt="Avança 10 segundos"
						className={
							songProperties.disableBackwardButton || !controlsReleased
								? "player__icon--disabled player__icon-redimensioned"
								: "player__icon player__icon-redimensioned"
						}
						onClick={(e) => (!controlsReleased ? e.preventDefault() : setAdvanceTenSeconds(true))}
					/>
				</LightTooltip>

				<LightTooltip title={songProperties.disableBackwardButton || !controlsReleased ? "" : songProperties.songNameForward} placement="top">
					<FontAwesomeIcon
						className={songProperties.disableForwardButton || !controlsReleased ? "player__icon--disabled" : "player__icon"}
						icon={faForwardStep}
						onClick={(e) =>
							songProperties.disableForwardButton || !controlsReleased ? e.preventDefault() : stopRedirect(songProperties.idForward)
						}
					/>
				</LightTooltip>
			</div>

			<div className="player__progress">
				<LightTooltip title={randomizedSongs ? "on" : "off"} placement="top">
					<div className={randomizedSongs ? "random__control random__control-selected" : "random__control"}>
						<FontAwesomeIcon
							icon={randomizedSongs ? faShuffle : faRepeat}
							onClick={changeRandomizedSongsValue}
							className={randomizedSongs ? "random__control-icon random__control-icon--selected" : "random__control-icon"}
						/>
					</div>
				</LightTooltip>

				<p>{currentTime}</p>
				<InputRangeSong
					disabled={!controlsReleased}
					songUrl={songObj.audio}
					duration={duration}
					setDuration={setDuration}
					setCurrentTime={setCurrentTime}
					isPlaying={isPlaying}
					setIsPlaying={setIsPlaying}
					rangeVolumeValue={rangeVolumeValue}
					isMuted={isMuted}
					goBackTenSeconds={goBackTenSeconds}
					setGoBackTenSeconds={setGoBackTenSeconds}
					advanceTenSeconds={advanceTenSeconds}
					setAdvanceTenSeconds={setAdvanceTenSeconds}
					stopRedirect={stopRedirect}
					controlsReleased={controlsReleased}
					setControlsReleased={setControlsReleased}
				/>

				<p className="player__progress-img_charging">
					{controlsReleased ? formatTime(duration | 0) : <img src={chargingDuration} alt="Charging duration song" className="charging_duration" />}
				</p>
				<div className="volume_control">
					{!isMobile() ? (
						<>
							<span ref={tooltip} className="range__volume-label">
								{toolTipVolume}
							</span>

							<div ref={divRangeAudioVolume} className="volume">
								<div className="volume__icon">
									<FontAwesomeIcon
										icon={iconVolume}
										onClick={(e) => (!controlsReleased ? e.preventDefault() : handleMutedVol())}
										className="icon_volume"
									/>
								</div>
								<div>
									<input
										id="range"
										type="range"
										ref={rangeAudioVolume}
										className="range__volume"
										min="0"
										max="10"
										step="1"
										disabled={!controlsReleased}
										onInput={(e) => changeValueVolume(e)}
									/>
								</div>
							</div>
						</>
					) : (
						<></>
					)}
				</div>
			</div>
		</div>
	);
};

export default Player;
