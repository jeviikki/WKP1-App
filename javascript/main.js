import { restaurantModal, restaurantRow } from "./components.js";
import { baseUrl } from "./variables.js";
import { fetchData } from "./utils.js";

// clean up code and turn into typescript

("use strict");

const target = document.querySelector("table");
const dialog = document.querySelector("dialog");

if (!target || !dialog) {
	throw new Error("Some elements were not able to be found");
}

const getRestaurants = async () => {
	const restaurants = await fetchData(baseUrl);
	const filteredRestaurants = filterRestaurants(restaurants);
	const sortedRestaurants = sortRestaurants(filteredRestaurants);
	renderRestaurants(sortedRestaurants);
};

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

	const filtered = restaurants.filter(
		(restaurant) => restaurant.company.toLowerCase() == filter1 || filter2,
	);

	deleteRows();
	data = filtered;
	return data;
};

const deleteRows = () => {
	const deletion = document.querySelectorAll("tr:not(.tableheader)");
	deletion.forEach((element) => {
		element.remove();
	});
};

const sortRestaurants = (restaurants) => {
	const sort = document.querySelector("#order");

	switch (sort.value) {
		case "name":
			restaurants.sort((a, b) => a.name > b.name);
			console.log("name sort");
			break;
		case "address":
			restaurants.sort((a, b) => a.address > b.address);
			console.log("address sort");
			break;
		case "location":
			// todo
			restaurants.sort((a, b) => a.name > b.name);
			console.log("location sort");
			break;
		default:
			restaurants.sort((a, b) => a.name > b.name);
			console.log("default sort");
			break;
	}

	return restaurants;
};

const renderRestaurants = (restaurants) => {
	//render
	restaurants.forEach((restaurant) => {
		const row = restaurantRow(restaurant);
		target.append(row);

		row.addEventListener("click", async () => {
			// highlight
			const menu = await fetchData(
				`${baseUrl}/daily/${restaurant._id}/en`,
			);

			document.querySelectorAll(".highlight").forEach((highlighted) => {
				highlighted.classList.remove("highlight");
			});
			row.classList.add("highlight");

			dialog.innerHTML = restaurantModal(restaurant, menu);
			dialog.showModal();

			const closeBtn = document.querySelector("#close-btn");
			closeBtn.addEventListener("click", () => {
				dialog.close();
			});
		});
	});
};

// filter button
const form = document.querySelector("#filter-form");
form.addEventListener("submit", async (event) => {
	event.preventDefault();
	await getRestaurants();
});

//open filters
const openFilters = document.querySelector("#open-filters");
openFilters.addEventListener("click", () => {
	form.setAttribute("class", "visible-form");
});
await getRestaurants();
