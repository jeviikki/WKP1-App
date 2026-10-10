import { dailyRestaurantModal, weeklyRestaurantModal, restaurantRow } from "./components.js";
import { baseUrl, defLat, defLon, target, restaurantDialog } from "./variables.js";
import { fetchData } from "./utils.js";
import { Restaurant, Restaurants } from "./types.js";
//import * as L from "leaflet";
//^ doesnt work yet when imported to js but works on ts

("use strict");

// default filters
let filterSort = "name" as FormDataEntryValue;
let filterMenuType = "daily" as FormDataEntryValue;

// table and dialog

if (!target || !restaurantDialog) {
	throw new Error("dialog and/or table not found");
}

// map stuff
// figure this out last its kinda held together by duct tape atm

let userLat = defLat, userLon = defLon;

const map = L.map("grand-map").setView([userLat, userLon], 11);

if (!map) {
	throw new Error("map is missing");
}

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution:
		'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const you = L.circle([userLat, userLon], {
	color: 'red',
	fillColor: '#f03',
	fillOpacity: 0.5,
	radius: 500,
}).addTo(map);

// restaurant stuff

const getRestaurants = async () => {
	const restaurants = await fetchData(baseUrl);
	const calculatedRestaurants = calcRestaurantDistance(restaurants);
	const filteredRestaurants = filterRestaurants(calculatedRestaurants);
	const sortedRestaurants = sortRestaurants(filteredRestaurants);
	renderRestaurants(sortedRestaurants);
	return sortedRestaurants;
};

const filterRestaurants = (restaurants: Restaurants) => {
	const filtersData = updateFilters();
	let filter1 = filtersData.company[0] || "";
	let filter2 = filtersData.company[1] || "";

	console.log(filter1, filter2)

	const data = restaurants.filter(
		(restaurant: Restaurant) => restaurant.company.toLowerCase() == filter1 || filter2,
	);

	deleteRows();
	return data;
};

const deleteRows = () => {
	// empties all restaurants from the table, but keeps the tableheaders.
	const deletion = document.querySelectorAll("tr:not(.tableheader)");
	deletion.forEach((element) => {
		element.remove();
	});
};

const sortRestaurants = (restaurants: Restaurants) => {

	switch (filterSort) {
		case "name":
			restaurants.sort((a: Restaurant, b: Restaurant) => a.name > b.name);
			console.log("name sort");
			break;
		case "address":
			restaurants.sort((a: Restaurant, b: Restaurant) => a.address > b.address);
			console.log("address sort");
			break;
		case "location":
			// locations get calculated before this is executed
			restaurants.sort((a: Restaurant, b: Restaurant) => a.distance! > b.distance!);
			console.log("location sort");
			break;
		default:
			restaurants.sort((a: Restaurant, b: Restaurant) => a.name > b.name);
			console.log("default sort");
			break;
	}

	return restaurants;
};

const renderRestaurants = (restaurants: Restaurants) => {
	//render
	restaurants.forEach((restaurant: Restaurant) => {
		const row = restaurantRow(restaurant) as HTMLTableRowElement;
		target.append(row);

		row.addEventListener("click", async () => {
			// highlight
			document.querySelectorAll(".highlight").forEach((highlighted) => {
				highlighted.classList.remove("highlight");
			});
			row.classList.add("highlight");

			centerRestaurant(restaurant);

			// dialog

			const fetchMenuUrl = `${baseUrl}/${filterMenuType}/${restaurant._id}/en`;
			const menu = await fetchData(fetchMenuUrl);

			// which type of menu to render

			if (filterMenuType == "daily") {
				restaurantDialog.innerHTML = dailyRestaurantModal(restaurant, menu);
			} else {
				restaurantDialog.innerHTML = weeklyRestaurantModal(restaurant, menu);
			}
			restaurantDialog.showModal();

			const closeBtn = document.querySelector("#close-restaurant-btn") as HTMLButtonElement;
			closeBtn.addEventListener("click", () => {
				restaurantDialog.close();
			});
		});
	});
};

const calcRestaurantDistance = (restaurants: Restaurants) => {

	// calculates distance between user location and restaurant location and saves it for later use
	// formula is not 100% accurate however

	restaurants.forEach((restaurant: Restaurant) => {
		const resLon = restaurant.location.coordinates[0];
		const resLat = restaurant.location.coordinates[1];
		restaurant.distance = Math.sqrt((userLat-resLat)**2 + (userLon-resLon)**2);
	});
	return restaurants;
}

const mapRestaurants = (restaurants: Restaurants) => {
	restaurants.forEach((restaurant: Restaurant) => {

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

const centerRestaurant = (restaurant: Restaurant) => {
	// when a restaurant is selected, map centers to its location
	map.setView(
		[
			restaurant.location.coordinates[1],
			restaurant.location.coordinates[0],
		],
		14,
	);
};

const centerUser = () => {

	// centers map to user location
	
	map.setView([userLat, userLon], 11);

	// also moves user from default location

	you.setLatLng([userLat, userLon]);
}

//open register dialog
const registerBtn = document.querySelector("#register-dialog-btn") as HTMLButtonElement;

registerBtn.addEventListener("click", async () => {

	const registerDialog = document.querySelector("#register-dialog") as HTMLDialogElement;

	registerDialog.showModal();

	const closeRegisterBtn = document.querySelector("#close-register-btn") as HTMLButtonElement;
	closeRegisterBtn.addEventListener("click", () => {
		registerDialog.close();
	});

});

//open login dialog
const loginBtn = document.querySelector("#login-dialog-btn") as HTMLButtonElement;

loginBtn.addEventListener("click", async () => {

	const loginDialog = document.querySelector("#login-dialog") as HTMLDialogElement;

	loginDialog.showModal();

	const closeLoginBtn = document.querySelector("#close-login-btn") as HTMLButtonElement;
	closeLoginBtn.addEventListener("click", () => {
		loginDialog.close();
	});

});

const updateFilters = () => {
	const formData = new FormData(form);
	let data = Object.fromEntries(formData);
	data.company = formData.getAll("company");
	filterSort = data.order;
	filterMenuType = data["menu-type"];
	return data
}

// filter button
const form = document.querySelector("#filter-form") as HTMLFormElement;
form.addEventListener("submit", async (event) => {
	event.preventDefault();
	updateFilters();
	await getRestaurants();
});

// getting user location

function success(pos: GeolocationPosition){
	userLat = pos.coords.latitude;
	userLon = pos.coords.longitude;
	centerUser();
} 
function error(err: GeolocationPositionError){
	console.warn(`Error ${err.code}: ${err.message}`)
	alert(`Error ${err.code}: ${err.message} \nThe app will assume you are at Karamalmi Campus.`);
}
navigator.geolocation.getCurrentPosition(
	success,
	error,
	{
		enableHighAccuracy: false,
		timeout: 5000,
	},
);

centerUser();

mapRestaurants(await getRestaurants());
