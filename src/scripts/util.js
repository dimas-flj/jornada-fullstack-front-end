export const formatTime = (timeInSeconds) => {
	const minutes = Math.floor(timeInSeconds / 60)
		.toString()
		.padStart(1, "0");
	const seconds = Math.floor(timeInSeconds - minutes * 60)
		.toString()
		.padStart(2, "0");

	return `${minutes}:${seconds}`;
};
