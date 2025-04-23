import ItemList from "./ItemList";

const Main = ({ type }) => {
	const contents = ["all", "artists", "songs"];
	return (
		<div className="main">
			{contents
				.filter((content, index) => {
					if (type === contents[0]) {
						return index > 0;
					} else if (type === contents[1]) {
						return index == 1;
					} else {
						return index == 2;
					}
				})
				.map((content, index) => (
					<ItemList type={content} key={index} />
				))}
		</div>
	);
};

export default Main;
