import { faCirclePlay, faCirclePause, faBackwardStep, faForwardStep, faVolumeXmark, faVolumeHigh, faVolumeLow } from "@fortawesome/free-solid-svg-icons";

// import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
// import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getSongById, getAllSongs, getSongsByArtistName } from "../scripts/api_service.js";
import { formatTime } from "../scripts/util.js";
import { useNavigate } from "react-router-dom";

import { LightTooltip } from "./LightTooltip.jsx";
import InputRangeSong from "./InputRangeSong";
import chargingDuration from "../assets/images/charging.gif";
import { faVolumeMedium } from "./faVolumeMedium.js";
import tenBackward from "../assets/images/ten_backward.png";
import tenForward from "../assets/images/ten_forward.png";

const Player = ({ id, random }) => {
	const navigate = useNavigate();

	const [rangeAudioVolumeDisabled, setRangeAudioVolumeDisabled] = useState(false);
	const [rangeSoundBackgroundInput, serRangeSoundBackgroundInput] = useState();
	const [disableBackwardButton, setDisableBackwardButton] = useState(false);
	const [disableForwardButton, setDisableForwardButton] = useState(false);
	const [initTimeToggleVolume, setInitTimeToggleVolume] = useState(null);
	const [advanceTenSeconds, setAdvanceTenSeconds] = useState(false);
	const [controlsReleased, setControlsReleased] = useState(false);
	const [goBackTenSeconds, setGoBackTenSeconds] = useState(false);
	const [currentTime, setCurrentTime] = useState(formatTime(0));
	const [rangeVolumeValue, setRangeVolumeValue] = useState(5);
	const [iconVolume, setIconVolume] = useState(faVolumeXmark);
	const [randomIdBackward, setRandomIdBackward] = useState();
	const [backwardSongName, setBackwardSongName] = useState();
	const [pressedKeys, setPressedKeys] = useState(new Set());
	const [forwardSongName, setForwardSongName] = useState();
	const [randomIdForward, setRandomIdForward] = useState();
	const [toolTipVolume, setToolTipVolume] = useState();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [duration, setDuration] = useState(0);
	const [song, setSong] = useState({});

	const divRangeAudioVolumeVolume = useRef();
	const rangeAudioVolume = useRef();
	const tooltip = useRef();

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
		serRangeSoundBackgroundInput(`linear-gradient(to right, silver 0%, silver ${value}%, rgb(119, 101, 101) ${value}%, rgb(119, 101, 101) 100%)`);
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
		serRangeSoundBackgroundInput(`linear-gradient(to right, silver 0%, silver ${value}%, rgb(119, 101, 101) ${value}%, rgb(119, 101, 101) 100%)`);
	};

	const stopRedirect = (paramId) => {
		const id = paramId || randomIdForward;
		setIsPlaying(false);
		navigate(random === undefined ? `/song/${id}` : `/song/${id}/true`);
	};

	const handleMutedVol = () => {
		setIsMuted(!isMuted);
		setRangeAudioVolumeDisabled(!rangeAudioVolumeDisabled);
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

				// if (e.keyCode === 107 || e.keyCode === 109) {
				setInitTimeToggleVolume(Date.now());

				let classList = divRangeAudioVolumeVolume.current.classList.toString();

				let isToggle = classList.indexOf("toggle") > -1;
				if (!isToggle) {
					divRangeAudioVolumeVolume.current.classList.toggle("toggle");
				}

				const range = rangeAudioVolume.current;
				let level = Number(range.value);
				if (signal === "+" && level < 10) {
					// if (e.keyCode === 107 && level < 10) {
					level++;
				}
				if (signal === "-" && level > 0) {
					// if (e.keyCode === 109 && level > 0) {
					level--;
				}
				setRangeVolumeValue(level);
				setTimeout(() => {
					classList = tooltip.current.classList + "";
					isToggle = classList.indexOf("toggle") > -1;
					if (!isToggle) {
						tooltip.current.classList.toggle("toggle");
					}
				}, 400);
			}
		},
		[getPlusMinusSignal]
	);

	// Handle Backward/Forward button
	useEffect(() => {
		getSongById(id).then((song) => {
			setSong(song);

			// Given that the test base contains repeated MP3 files, to ensure testing,
			// the audio URL needs a differential parameter
			if (song.audio !== null && song.audio !== undefined) {
				if (song.audio.endsWith(".mp3")) {
					song.audio = `${song.audio}?t=${Date.now()}`;
				} else {
					song.audio = `${song.audio}&t=${Date.now()}`;
				}
			}

			if (random === undefined) {
				getAllSongs().then((songsArray) => {
					const currentIndexFromIdSong = songsArray.map((elem) => elem._id).indexOf(id);

					let randomIndexBackward;
					let found = false;
					while (!found) {
						randomIndexBackward = Math.floor(Math.random() * (songsArray.length - 1));
						if (randomIndexBackward !== currentIndexFromIdSong) {
							found = true;
						}
					}

					let randomIndexForward;
					found = false;
					while (!found) {
						randomIndexForward = Math.floor(Math.random() * (songsArray.length + 1));
						if (randomIndexForward !== currentIndexFromIdSong) {
							found = true;
						}
					}

					const songNameBackward = songsArray[randomIndexBackward].name;
					setBackwardSongName(songNameBackward);

					const idBackward = songsArray[randomIndexBackward]._id;
					setRandomIdBackward(idBackward);

					const songNameForward = songsArray[randomIndexForward].name;
					setForwardSongName(songNameForward);

					const idForward = songsArray[randomIndexForward]._id;
					setRandomIdForward(idForward);
				});
			} else {
				getSongsByArtistName(song.artist).then((artist) => {
					const songsArray = artist[0].songs;

					const currentIndexFromIdSong = songsArray.map((elem) => elem._id).indexOf(id);

					let idBackward,
						idForward = null;

					// if is the first song on the list
					if (currentIndexFromIdSong == 0) {
						setDisableBackwardButton(true);
						setBackwardSongName("");

						const forwardSong = songsArray[currentIndexFromIdSong + 1];
						if (forwardSong !== undefined) {
							idForward = forwardSong._id;
							setForwardSongName(forwardSong.name);
							setDisableForwardButton(false);
						} else {
							setDisableForwardButton(true);
							setForwardSongName("");
						}
					}
					// if is the last song on the list
					else if (currentIndexFromIdSong === songsArray.length - 1) {
						setDisableForwardButton(true);
						setForwardSongName("");

						const backwardSong = songsArray[currentIndexFromIdSong - 1];
						if (backwardSong !== undefined) {
							idBackward = backwardSong._id;
							setBackwardSongName(backwardSong.name);
							setDisableBackwardButton(false);
						} else {
							setDisableBackwardButton(true);
							setBackwardSongName("");
						}
					} else {
						setDisableBackwardButton(false);
						setDisableForwardButton(false);

						const backwardSong = songsArray[currentIndexFromIdSong - 1];
						idBackward = backwardSong._id;
						setBackwardSongName(backwardSong.name);

						const forwardSong = songsArray[currentIndexFromIdSong + 1];
						idForward = forwardSong._id;
						setForwardSongName(forwardSong.name);
					}

					setRandomIdBackward(idBackward);
					setRandomIdForward(idForward);
				});
			}
		});
	}, [id, random]);

	// Handle keyboard events
	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown, false);
		document.addEventListener("keyup", cleanListKeys, false);

		return () => {
			document.removeEventListener("keydown", handleKeyDown, false);
			document.removeEventListener("keyup", cleanListKeys, false);
		};
	}, [handleKeyDown, pressedKeys, cleanListKeys]);

	// Handle current time
	useEffect(() => {
		const interval = setInterval(() => {
			// hide container audio volume
			if (initTimeToggleVolume != null && Date.now() - initTimeToggleVolume > 800) {
				divRangeAudioVolumeVolume.current.classList.toggle("toggle");
				tooltip.current.classList.toggle("toggle");
				setInitTimeToggleVolume(null);
			}
		}, 500);

		return () => clearInterval(interval);
	}, [initTimeToggleVolume]);

	// Handle input audio/range volume
	useEffect(() => {
		const range = rangeAudioVolume.current;
		if (isMuted) {
			setIconVolume(faVolumeXmark);
		} else {
			range.value = rangeVolumeValue;
			setToolTipVolume(rangeVolumeValue);
			changeIconVolume(rangeVolumeValue);
		}

		setRangeVolumeThumbsPosition();
	}, [changeIconVolume, initTimeToggleVolume, isMuted, rangeVolumeValue]);

	return (
		<div className="player">
			<div className="player__controllers">
				<LightTooltip title={backwardSongName} placement="top">
					<FontAwesomeIcon
						className={disableBackwardButton || !controlsReleased ? "player__icon--disabled" : "player__icon"}
						icon={faBackwardStep}
						onClick={(e) => (disableBackwardButton || !controlsReleased ? e.preventDefault() : stopRedirect(randomIdBackward))}
					/>
				</LightTooltip>

				<LightTooltip title="10 segundos" placement="top">
					<img
						src={tenBackward}
						alt="Retorna 10 segundos"
						className={disableBackwardButton || !controlsReleased ? "player__icon--disabled" : "player__icon"}
						onClick={(e) => (!controlsReleased ? e.preventDefault() : setGoBackTenSeconds(true))}
						style={{ height: "25px", width: "25px" }}
					/>
				</LightTooltip>

				<LightTooltip title={isPlaying ? "Pausar" : "Executar"} placement="top">
					<FontAwesomeIcon
						className={!controlsReleased ? "player__icon--charging" : "player__icon player__icon--play"}
						icon={isPlaying ? faCirclePause : faCirclePlay}
						onClick={(e) => {
							!controlsReleased ? e.preventDefault() : setIsPlaying(!isPlaying);
						}}
					/>
				</LightTooltip>

				<LightTooltip title="10 segundos" placement="top">
					<img
						src={tenForward}
						alt="Avança 10 segundos"
						className={disableBackwardButton || !controlsReleased ? "player__icon--disabled" : "player__icon"}
						onClick={(e) => (!controlsReleased ? e.preventDefault() : setAdvanceTenSeconds(true))}
						style={{ height: "25px", width: "25px" }}
					/>
				</LightTooltip>

				<LightTooltip title={forwardSongName} placement="top">
					<FontAwesomeIcon
						className={disableForwardButton || !controlsReleased ? "player__icon--disabled" : "player__icon"}
						icon={faForwardStep}
						onClick={(e) => (disableForwardButton || !controlsReleased ? e.preventDefault() : stopRedirect(randomIdForward))}
					/>
				</LightTooltip>
			</div>

			<div
				className="player__progress"
				style={{
					height: "30px",
					/* background-color: yellow; */
				}}
			>
				<p>{currentTime}</p>
				<InputRangeSong
					disabled={!controlsReleased}
					songAudio={song.audio}
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

				<p style={{ position: "relative", width: "50px" }}>
					{controlsReleased ? formatTime(duration | 0) : <img src={chargingDuration} alt="Charging duration song" className="charging_duration" />}
				</p>
				<div className="volume_control">
					<span ref={tooltip} className="range__volume-label">
						{toolTipVolume}
					</span>
					<div ref={divRangeAudioVolumeVolume} className="volume">
						<FontAwesomeIcon
							icon={iconVolume}
							onClick={(e) => (!controlsReleased ? e.preventDefault() : handleMutedVol())}
							className="icon_volume"
						/>
						<input
							id="range"
							type="range"
							ref={rangeAudioVolume}
							className="range__volume"
							min="0"
							max="10"
							step="1"
							disabled={rangeAudioVolumeDisabled || !controlsReleased}
							onInput={(e) => changeValueVolume(e)}
							style={{ background: rangeSoundBackgroundInput }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Player;
