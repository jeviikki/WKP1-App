"use strict";

async function fetchData(url){
    let data
    try {
		const response = await fetch(url)
        if (!response.ok) throw new Error("invalid");
		data = response.json();
        return data

    } catch (error) {
		data = `Error loading restaurants`;
		console.log(error)
		return data;
	}
}

export{
	fetchData,
};