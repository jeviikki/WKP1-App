import { restaurantModal, restaurantRow } from "./components.js";
import { baseUrl } from "./variables.js";
import { fetchData } from "./utils.js";

// clean up code and turn into typescript

("use strict");

const target = document.querySelector("table");
const dialog = document.querySelector("dialog");

if (!target || !dialog) {
	throw new Error("dialog and/or table not found");
}

// TODO: make it so that user can still use program without giving location

const defLat = 60.223184;
const defLon = 24.7586024;
const map = L.map("grand-map").setView([defLat, defLon], 11);

// temporary until location detection is implemented

let userLat = defLat;
let userLon = defLon;

if (!map) {
	throw new Error("map is missing");
}

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution:
		'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const getRestaurants = async () => {
	const restaurants = await fetchData(baseUrl);
	const calculatedRestaurants = calcRestaurantDistance(restaurants);
	const filteredRestaurants = filterRestaurants(calculatedRestaurants);
	const sortedRestaurants = sortRestaurants(filteredRestaurants);
	renderRestaurants(sortedRestaurants);
	return sortedRestaurants;
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

	data = restaurants.filter(
		(restaurant) => restaurant.company.toLowerCase() == filter1 || filter2,
	);

	deleteRows();
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
			restaurants.sort((a,b) => a.distance - b.distance);
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

			document.querySelectorAll(".highlight").forEach((highlighted) => {
				highlighted.classList.remove("highlight");
			});
			row.classList.add("highlight");

			centerRestaurant(restaurant);

			// dialog

			const menu = await fetchData(
				`${baseUrl}/daily/${restaurant._id}/en`,
			);

			dialog.innerHTML = restaurantModal(restaurant, menu);
			dialog.showModal();

			const closeBtn = document.querySelector("#close-btn");
			closeBtn.addEventListener("click", () => {
				dialog.close();
			});
		});
	});
};

const calcRestaurantDistance = (restaurants) => {

	// calculates distance between user location and restaurant location and saves it for later use
	// formula is not 100% accurate however

	for (const restaurant of restaurants) {
		const resLon = restaurant.location.coordinates[0];
		const resLat = restaurant.location.coordinates[1];
		restaurant.distance = Math.sqrt((userLat-resLat)**2 + (userLon-resLon)**2);
	}
	return restaurants;
}

const mapRestaurants = (restaurants) => {
	restaurants.forEach((restaurant) => {

		const resLon = restaurant.location.coordinates[0];
		const resLat = restaurant.location.coordinates[1];

		// marker & popup

		const marker = L.marker([resLat, resLon]).addTo(map);
		marker.bindPopup(
			`
				<h3>${restaurant.name}</h3>
				<p>${restaurant.address}</p>
			`,
		).openPopup;
	});
};

const centerRestaurant = (restaurant) => {
	// when a restaurant is selected, map centers to its location
	map.setView(
		[
			restaurant.location.coordinates[1],
			restaurant.location.coordinates[0],
		],
		14,
	);
};

// filter button
const form = document.querySelector("#filter-form");
form.addEventListener("submit", async (event) => {
	event.preventDefault();
	await getRestaurants();
});

mapRestaurants(await getRestaurants());
