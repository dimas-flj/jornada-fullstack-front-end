import axios from "axios";
import { config } from "./config.js";

const dominio = config.back_end.dominio;

export const getAllArtists = async () => {
	const array = await axios.get(`${dominio}/artists/`);
	return array?.data;
};

export const getArtistsWithSongs = async () => {
	const array = await axios.get(`${dominio}/artists/songs`);
	return array?.data;
};

export const getArtistById = async (id) => {
	const artist = await axios.get(`${dominio}/artists/artist/id/${id}`);
	return artist?.data;
};

export const getArtistByName = async (name) => {
	const artist = await axios.get(`${dominio}/artists/artist/name/${name}`);
	return artist?.data;
};

export const getSongsByArtistId = async (id) => {
	const artist = await axios.get(`${dominio}/artists/songs/artist/id/${id}`);
	return artist?.data;
};

export const getSongsByArtistName = async (name) => {
	const artist = await axios.get(`${dominio}/artists/songs/artist/name/${name}`);
	return artist?.data;
};

export const getArtistSongBySongId = async (id) => {
	const song_artist = await axios.get(`${dominio}/artists/song/artist/song/id/${id}`);
	return song_artist?.data;
};

export const getAllSongs = async () => {
	const array = await axios.get(`${dominio}/songs/`);
	return array?.data;
};

export const getSongsWithArtist = async () => {
	const song = await axios.get(`${dominio}/songs/artist`);
	return song?.data;
};

export const getOnlySongsByArtistName = async (name) => {
	const song = await axios.get(`${dominio}/songs/artist/name/${name}`);
	return song?.data;
};

export const getSongById = async (id) => {
	const song = await axios.get(`${dominio}/songs/song/id/${id}`);
	return song?.data;
};

export const getSongByName = async (name) => {
	const song = await axios.get(`${dominio}/songs/song/name/${name}`);
	return song?.data;
};
