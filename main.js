import { restaurantModal, restaurantRow } from "./components.js";
import {baseUrl, target, dialog} from "./variables.js";
import {fetchData} from "./utils.js";

// clean up code and turn into typescript

"use strict";

async function getRestaurants(){
	const restaurants = await fetchData(baseUrl);
	const filteredRestaurants = filterRestaurants(restaurants);
	const sortedRestaurants = sortRestaurants(filteredRestaurants);
	await renderRestaurants(sortedRestaurants);
}

const filterRestaurants = (restaurants) => {
	let data;
	let filter1 = "";
	let filter2 = "";

	const filters = document.querySelectorAll("input[type='checkbox']:checked");

	if (filters.length == 1) {
		filter1 = filters[0].value || "";
	}
	if (filters.length == 2) {
		filter2 = filters[1].value || "";
	}

	const filtered = restaurants.filter(restaurant => 
		restaurant.company.toLowerCase() == filter1 || filter2
	);

	deleteRows();
	data = filtered;
	return data;
};

const deleteRows = () => {
	const deletion = document.querySelectorAll("tr:not(.tableheader)")
	deletion.forEach((element) => {
		element.remove();
	});
}

const sortRestaurants = (restaurants) => {
	const sort = document.querySelector("#order");

	switch (sort.value) {
		case "name":
			restaurants.sort((a,b) => a.name > b.name);
			console.log("name sort")
			break
		case "address":
			restaurants.sort((a,b) => a.address > b.address);
			console.log("address sort")
			break
		case "location":
			// todo
			restaurants.sort((a,b) => a.name > b.name);
			console.log("location sort")
			break
		default:
			restaurants.sort((a,b) => a.name > b.name);
			console.log("default sort")
			break
	}

	return restaurants
}

async function renderRestaurants(restaurants){
	//render
	restaurants.forEach((restaurant) => {
		const row = restaurantRow(restaurant);
		target.append(row);

		row.addEventListener("click", async function(evt){
			// highlight
			const menu = await fetchData(`${baseUrl}/daily/${restaurant._id}/en`);
			document.querySelectorAll("tr").forEach((row) => {
				row.classList.remove("highlight");
			});
			row.classList = "highlight";

			dialog.innerHTML = restaurantModal(restaurant, menu)
			dialog.setAttribute("open", "")

			const closeBtn = document.querySelector("#close-btn");
			closeBtn.addEventListener("click", (event) => {
				dialog.close();
			})
		});
	});
};

// filter button
const form = document.querySelector("#filter-form");
form.addEventListener("submit", async(event) => {
	event.preventDefault();
	await getRestaurants();
});

//open filters
const openFilters = document.querySelector("#open-filters");
openFilters.addEventListener("click", (event) => {
	form.setAttribute("class", "visible-form");
});
await getRestaurants();