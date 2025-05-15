export const formatTime = (timeInSeconds) => {
	const minutes = Math.floor(timeInSeconds / 60)
		.toString()
		.padStart(1, "0");
	const seconds = Math.floor(timeInSeconds - minutes * 60)
		.toString()
		.padStart(2, "0");

	return `${minutes}:${seconds}`;
};

export const isMobile = () => {
	let isMobile = true;
	try {
		isMobile = window.navigator.userAgentData.mobile;
		// eslint-disable-next-line no-unused-vars
	} catch (error) {
		isMobile = Math.min(window.screen.width, window.screen.height) < 768;
	}
	return isMobile;
};

const getRandomIndex = (songsArray, id, lastIndex) => {
	const currentIndexFromIdSong = songsArray.map((elem) => elem._id).indexOf(id);
	let found = false;
	let index;
	while (!found) {
		index = Math.floor(Math.random() * (songsArray.length - 1));
		if (index !== currentIndexFromIdSong && index !== lastIndex && songsArray[index] !== undefined && id !== songsArray[index]._id) {
			found = true;
		}
	}
	return index;
};

export const getRandomizeProperties = (songsArray, id, randomized) => {
	let randomIndexBackward,
		randomIndexForward = undefined;

	let _idBackward,
		_idForward,
		_backwardSongName,
		_forwardSongName = undefined;

	let _disableBackwardButton = false;
	let _disableForwardButton = false;

	if (songsArray !== undefined && songsArray.length > 0) {
		const currentIndexFromIdSong = songsArray.map((elem) => elem._id).indexOf(id);

		if (randomized) {
			randomIndexBackward = getRandomIndex(songsArray, id, -1);
			randomIndexForward = getRandomIndex(songsArray, id, randomIndexBackward);

			_idBackward = songsArray[randomIndexBackward]._id;
			_idForward = songsArray[randomIndexForward]._id;
			_backwardSongName = songsArray[randomIndexBackward].name;
			_forwardSongName = songsArray[randomIndexForward].name;
		} else {
			randomIndexForward = currentIndexFromIdSong + 1;
			randomIndexBackward = currentIndexFromIdSong - 1;

			// if is the first song on the list
			if (currentIndexFromIdSong == 0) {
				_disableBackwardButton = true;

				const forwardSong = songsArray[randomIndexForward];
				if (forwardSong !== undefined) {
					_idForward = forwardSong._id;
					_forwardSongName = forwardSong.name;
				} else {
					_disableForwardButton = true;
				}
			}
			// if is the last song on the list
			else if (currentIndexFromIdSong === songsArray.length - 1) {
				_disableForwardButton = true;

				const backwardSong = songsArray[randomIndexBackward];
				if (backwardSong !== undefined) {
					_idBackward = backwardSong._id;
					_backwardSongName = backwardSong.name;
				} else {
					_disableBackwardButton = true;
				}
			} else {
				const backwardSong = songsArray[randomIndexBackward];
				_idBackward = backwardSong._id;
				_backwardSongName = backwardSong.name;

				const forwardSong = songsArray[randomIndexForward];
				_idForward = forwardSong._id;
				_forwardSongName = forwardSong.name;
			}
		}
	}

	return {
		idBackward: _idBackward,
		idForward: _idForward,
		songNameBackward: _backwardSongName,
		songNameForward: _forwardSongName,
		disableBackwardButton: _disableBackwardButton,
		disableForwardButton: _disableForwardButton,
	};
};
