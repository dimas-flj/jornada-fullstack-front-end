import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "../scripts/util";

const InputRangeSong = ({
	songAudio,
	duration,
	setDuration,
	isPlaying,
	setIsPlaying,
	setCurrentTime,
	rangeVolumeValue,
	isMuted,
	goBackTenSeconds,
	setGoBackTenSeconds,
	advanceTenSeconds,
	setAdvanceTenSeconds,
	stopRedirect,
}) => {
	const [rangeSongBackgroundProgress, setRangeSongBackgroundProgress] = useState();
	const [lastInputValue, setLastInputValue] = useState(0);

	const rangeProgressbar = useRef();
	const audioPlayer = useRef();
	const divAdvisor = useRef();

	const resetControllers = () => {
		setDuration(audioPlayer.current.duration | 0);
		setCurrentTime(formatTime(0));

		audioPlayer.current
			.play()
			// .then(() => {
			// 	console.log("play() -> OK");
			// })
			.catch((error) => {
				const message = error.message;
				// console.log("message: " + message);
				if (message.includes("The play method") || message.includes("interact with the document first")) {
					// console.log('encontrou "The play method" ou "interact with the document first"');
					divAdvisor.current.style.display = "block";
				}
			});

		setIsPlaying(!isPlaying);

		const range = rangeProgressbar.current;
		range.value = 0;

		const value = ((range.value - range.min) / (range.max - range.min)) * 100;
		setRangeSongBackgroundProgress(`linear-gradient(to right, rgb(119, 101, 101) 0%, rgb(119, 101, 101) ${value}%, silver ${value}%, silver 100%)`);
	};

	const onSongTimeUpdate = (e) => {
		const audio = e.target;
		const range = rangeProgressbar.current;

		setCurrentTime(formatTime(audio.currentTime));
		range.value = audio.currentTime | 0;

		setLastInputValue(Number(range.value));

		const value = ((range.value - range.min) / (range.max - range.min)) * 100;
		setRangeSongBackgroundProgress(`linear-gradient(to right, rgb(119, 101, 101) 0%, rgb(119, 101, 101) ${value}%, silver ${value}%, silver 100%)`);
	};

	const fastBackward = useCallback(() => {
		audioPlayer.current.pause();

		const rangeValue = Number(rangeProgressbar.current.value);
		const newValue = rangeValue - 10;
		rangeProgressbar.current.value = newValue;
		setLastInputValue(newValue);

		audioPlayer.current.currentTime = parseFloat(newValue).toFixed(1);
		setCurrentTime(formatTime(audioPlayer.current.currentTime));

		setGoBackTenSeconds(false);
		if (isPlaying) {
			audioPlayer.current.play();
		}
	}, [isPlaying, audioPlayer, rangeProgressbar, setLastInputValue, setCurrentTime, setGoBackTenSeconds]);

	const fastForward = useCallback(() => {
		audioPlayer.current.pause();

		const rangeValue = Number(rangeProgressbar.current.value);
		const newValue = rangeValue + 10;
		rangeProgressbar.current.value = newValue;
		setLastInputValue(newValue);

		audioPlayer.current.currentTime = parseFloat(newValue).toFixed(1);
		setCurrentTime(formatTime(audioPlayer.current.currentTime));

		setAdvanceTenSeconds(false);
		if (isPlaying) {
			audioPlayer.current.play();
		}
	}, [isPlaying, audioPlayer, rangeProgressbar, setCurrentTime, setAdvanceTenSeconds]);

	const changeCurrentTrailSong = useCallback(
		(newValue) => {
			audioPlayer.current.pause();

			audioPlayer.current.currentTime = parseFloat(newValue).toFixed(1);
			setCurrentTime(formatTime(parseFloat(newValue).toFixed(1)));
			setLastInputValue(newValue);
			if (isPlaying) {
				audioPlayer.current.play();
			}
		},
		[isPlaying, setCurrentTime, audioPlayer, setLastInputValue]
	);

	const handleKeyCode = useCallback(
		(e) => {
			// pause/play sound
			// e.keyCode === 32 (space key)
			if (e.keyCode === 32) {
				setIsPlaying(!isPlaying);
				// setPlayPause(!isPlaying);
				// setPlayPauseChanged(true);
			}

			if (e.keyCode === 37 || e.keyCode === 39) {
				audioPlayer.current.pause();

				let newValue = 0;
				// <- left key (e.keyCode === 37)
				if (e.keyCode === 37) {
					newValue = lastInputValue - 1;
				}
				// -> rigth key (e.keyCode === 39)
				else {
					newValue = lastInputValue + 1;
				}

				if (newValue < 0) {
					newValue = 0;
				}

				if (newValue > duration) {
					newValue = duration;
				}
				changeCurrentTrailSong(newValue);
			}
		},
		[setIsPlaying, isPlaying, duration, changeCurrentTrailSong, lastInputValue]
	);

	// Handle external controllers
	useEffect(() => {
		isPlaying ? audioPlayer.current.play() : audioPlayer.current.pause();

		audioPlayer.current.volume = rangeVolumeValue / 10;

		audioPlayer.current.muted = isMuted;

		if (goBackTenSeconds) {
			fastBackward();
		}

		if (advanceTenSeconds) {
			fastForward();
		}
	}, [isMuted, isPlaying, audioPlayer, rangeVolumeValue, goBackTenSeconds, advanceTenSeconds, fastBackward, fastForward, songAudio]);

	// handle keycode event
	useEffect(() => {
		document.addEventListener("keydown", handleKeyCode);

		return () => document.removeEventListener("keydown", handleKeyCode);
	}, [handleKeyCode]);

	return (
		<>
			<div
				ref={divAdvisor}
				style={{
					position: "absolute",
					display: "none",
					left: "0px",
					top: "0px",
					zIndex: "1",
					width: "100%",
					height: "100vh",
					backgroundColor: "#254705",
				}}
			>
				<div style={{ textAlign: "center", width: "50%", color: "white", marginLeft: "25%", marginTop: "25%", transform: "translate(0, -25%)" }}>
					This banner is being displayed in view of some browser security rules that do not allow audio to be played automatically, without the user
					interacting with the page.
					<br />
					<br />
					In a production environment, this banner/message should be replaced by a relevant notice or even an advertising message.
					<br />
					<br />
					<a
						href="#"
						onClick={() => {
							divAdvisor.current.style.display = "none";
							audioPlayer.current.play();
						}}
					>
						Click here to continue
					</a>
				</div>
			</div>
			<div className="player__bar">
				<input
					ref={rangeProgressbar}
					type="range"
					className="range__song-progressbar"
					min="0"
					step="1"
					max={duration}
					defaultValue="0"
					onInput={(e) => changeCurrentTrailSong(Number(e.target.value))}
					style={{ background: rangeSongBackgroundProgress }}
				/>
				<audio
					ref={audioPlayer}
					src={songAudio}
					onEnded={() => stopRedirect()}
					onLoadedMetadata={() => resetControllers()}
					onTimeUpdate={(e) => onSongTimeUpdate(e)}
				></audio>
			</div>
		</>
	);
};

export default InputRangeSong;
