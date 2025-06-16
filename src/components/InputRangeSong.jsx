import { useCallback, useEffect, useRef } from "react";
import { formatTime } from "../scripts/util";

const InputRangeSong = ({
	songUrl,
	duration,
	setDuration,
	isPlaying,
	setIsPlaying,
	timeLapse,
	rangeVolumeValue,
	isMuted,
	goBackTenSeconds,
	setGoBackTenSeconds,
	advanceTenSeconds,
	setAdvanceTenSeconds,
	stopRedirect,
	controlsReleased,
	setControlsReleased,
}) => {
	const lastInputValue = useRef(0);

	const rangeProgressbar = useRef();
	const audioPlayer = useRef();
	const divAdvisor = useRef();

	const resetControllers = () => {
		audioPlayer.current.pause();
		setDuration(audioPlayer.current.duration | 0);
		timeLapse.current.textContent = formatTime(0);
		setControlsReleased(true);
		setIsPlaying(true);

		const range = rangeProgressbar.current;
		range.value = 0;

		const value = ((range.value - range.min) / (range.max - range.min)) * 100;
		rangeProgressbar.current.style.background = `linear-gradient(to right, rgb(119, 101, 101) 0%, rgb(119, 101, 101) ${value}%, silver ${value}%, silver 100%)`;
	};

	const onSongTimeUpdate = (e) => {
		const audio = e.target;
		const range = rangeProgressbar.current;

		timeLapse.current.textContent = formatTime(audio.currentTime);
		range.value = audio.currentTime | 0;

		lastInputValue.current = Number(range.value);

		const value = ((range.value - range.min) / (range.max - range.min)) * 100;
		rangeProgressbar.current.style.background = `linear-gradient(to right, rgb(119, 101, 101) 0%, rgb(119, 101, 101) ${value}%, silver ${value}%, silver 100%)`;
	};

	const fastBackward = useCallback(() => {
		audioPlayer.current.pause();

		const rangeValue = Number(rangeProgressbar.current.value);
		const newValue = rangeValue - 10;
		rangeProgressbar.current.value = newValue;
		lastInputValue.current = newValue;

		audioPlayer.current.currentTime = parseFloat(newValue).toFixed(1);
		timeLapse.current.textContent = formatTime(audioPlayer.current.currentTime);

		setGoBackTenSeconds(false);
		if (isPlaying) {
			audioPlayer.current.play();
		}
	}, [isPlaying, audioPlayer, rangeProgressbar, lastInputValue, timeLapse, setGoBackTenSeconds]);

	const fastForward = useCallback(() => {
		audioPlayer.current.pause();

		const rangeValue = Number(rangeProgressbar.current.value);
		const newValue = rangeValue + 10;
		rangeProgressbar.current.value = newValue;
		lastInputValue.current = newValue;

		audioPlayer.current.currentTime = parseFloat(newValue).toFixed(1);
		timeLapse.current.textContent = formatTime(audioPlayer.current.currentTime);

		setAdvanceTenSeconds(false);
		if (isPlaying) {
			audioPlayer.current.play();
		}
	}, [isPlaying, audioPlayer, rangeProgressbar, timeLapse, lastInputValue, setAdvanceTenSeconds]);

	const changeCurrentTrailSong = useCallback(
		(newValue) => {
			audioPlayer.current.pause();

			audioPlayer.current.currentTime = parseFloat(newValue).toFixed(1);
			timeLapse.current.textContent = formatTime(parseFloat(newValue).toFixed(1));
			lastInputValue.current = newValue;
			if (isPlaying) {
				audioPlayer.current.play();
			}
		},
		[isPlaying, timeLapse, audioPlayer, lastInputValue]
	);

	const handleKeyCode = useCallback(
		(e) => {
			// pause/play sound
			// e.keyCode === 32 (space key)
			if (e.keyCode === 32) {
				setIsPlaying(!isPlaying);
			}

			if (e.keyCode === 37 || e.keyCode === 39) {
				audioPlayer.current.pause();

				let newValue = 0;
				// <- left key (e.keyCode === 37)
				if (e.keyCode === 37) {
					newValue = lastInputValue.current - 1;
				}
				// -> rigth key (e.keyCode === 39)
				else {
					newValue = lastInputValue.current + 1;
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
		if (controlsReleased) {
			isPlaying ? audioPlayer.current.play() : audioPlayer.current.pause();

			audioPlayer.current.volume = rangeVolumeValue / 10;

			audioPlayer.current.muted = isMuted;

			if (goBackTenSeconds) {
				fastBackward();
			}

			if (advanceTenSeconds) {
				fastForward();
			}
		}
	}, [isMuted, isPlaying, audioPlayer, rangeVolumeValue, goBackTenSeconds, advanceTenSeconds, fastBackward, fastForward, controlsReleased, duration]);

	// handle keycode event
	useEffect(() => {
		document.addEventListener("keydown", handleKeyCode);

		return () => document.removeEventListener("keydown", handleKeyCode);
	}, [handleKeyCode]);

	return (
		<>
			<div ref={divAdvisor} className="player__advisor">
				<div className="player__advisor-banner">
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
					disabled={!controlsReleased}
				/>
				<audio
					ref={audioPlayer}
					src={songUrl}
					onEnded={() => stopRedirect()}
					onLoadedMetadata={() => resetControllers()}
					onTimeUpdate={(e) => onSongTimeUpdate(e)}
				></audio>
			</div>
		</>
	);
};

export default InputRangeSong;
