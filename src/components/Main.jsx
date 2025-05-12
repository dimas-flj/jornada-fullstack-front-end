import ItemList from "./ItemList";

const Main = ({ type }) => {
	const origins = ["all", "artists", "songs"];
	return (
		<div className="main">
			{origins
				.filter((content, index) => {
					if (type === origins[0]) {
						return index > 0;
					} else if (type === origins[1]) {
						return index == 1;
					} else {
						return index == 2;
					}
				})
				.map((origin, index) => (
					<ItemList origin={origin} key={index} />
				))}
		</div>
	);
};

export default Main;
