"use strict";

const fetchData = async (url) => {
	let data;
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("invalid");
		data = response.json();
		return data;
	} catch (error) {
		data = `Error loading restaurants. Check that you are connected to eduroam or using Metropolia VPN`;
		console.log(error);
		alert(data);
		return data;
	}
};

export { fetchData };
