import { dailyRestaurantModal, weeklyRestaurantModal, restaurantRow } from "./components.js";
import { baseUrl, userUrl, uploadUrl, defLat, defLon } from "./variables.js";
import {target, restaurantDialog, restaurantError, unregisteredSection, registerBtn, loginBtn, loginDialog, userCard, avatarTarget, faveTarget, nameTarget} from "./elements.js";
import { fetchData, fetchUserData } from "./utils.js";
import { Restaurant, Restaurants } from "./types/restaurant.js";
import { User, LoginUser, UpdateUser } from "./types/user.js";
import {Map, TileLayer, Marker, Circle} from "leaflet";

("use strict");

// default filters

let filterSort: FormDataEntryValue;
let filterMenuType: FormDataEntryValue;
let filterCompany: FormDataEntryValue[];

// table and dialog

if (!target || !restaurantDialog) {
	throw new Error("dialog and/or table not found");
}

// user login forms
const loginForm = document.querySelector("#login-form") as HTMLFormElement;

// map stuff

let userLat = defLat, userLon = defLon;

const map = new Map("grand-map").setView([userLat, userLon], 11);

if (!map) {
	throw new Error("map is missing");
}

new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution:
		'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const you = new Circle([userLat, userLon], {
	color: 'red',
	fillColor: '#f03',
	fillOpacity: 0.5,
	radius: 500,
}).addTo(map);

// restaurant stuff

const getRestaurants = async () => {
	// fetch restaurants from api
	const restaurants = await fetchData(baseUrl);
	// in case it fails
	if (typeof(restaurants) == "string"){
		restaurantError.classList.add("display-error");
	}
	// distance
	const calculatedRestaurants = calcRestaurantDistance(restaurants);
	// filtering related
	updateFilters();
	const filteredRestaurants = filterRestaurants(calculatedRestaurants);
	const sortedRestaurants = sortRestaurants(filteredRestaurants);
	// render them on the page
	renderRestaurants(sortedRestaurants);
	return sortedRestaurants;
};

const filterRestaurants = (restaurants: Restaurants) => {
	// which restaurants it will show
	let filter1 = filterCompany[0] || "";
	let filter2 = filterCompany[1] || "";

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
			break;
		case "address":
			restaurants.sort((a: Restaurant, b: Restaurant) => a.address > b.address);
			break;
		case "location":
			// locations get calculated before this is executed
			restaurants.sort((a: Restaurant, b: Restaurant) => a.distance! > b.distance!);
			break;
		default:
			restaurants.sort((a: Restaurant, b: Restaurant) => a.name > b.name);
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

		const marker = new Marker([resLat, resLon]).addTo(map);
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

registerBtn.addEventListener("click", async () => {

	const registerDialog = document.querySelector("#register-dialog") as HTMLDialogElement;

	registerDialog.showModal();

	const closeRegisterBtn = document.querySelector("#close-register-btn") as HTMLButtonElement;
	closeRegisterBtn.addEventListener("click", () => {
		registerDialog.close();
	});

});

//open login dialog

loginBtn.addEventListener("click", async () => {

	loginDialog.showModal();

	const closeLoginBtn = document.querySelector("#close-login-btn") as HTMLButtonElement;
	closeLoginBtn.addEventListener("click", () => {
		loginDialog.close();
	});

});

const updateFilters = () => {
	const formData = new FormData(form);
	let data = Object.fromEntries(formData);
	filterCompany = formData.getAll("company");
	filterSort = data.order;
	filterMenuType = data["menu-type"];
}

// filter button
const form = document.querySelector("#filter-form") as HTMLFormElement;
form.addEventListener("submit", async (event) => {
	event.preventDefault();
	updateFilters();
	window.location.replace("#restaurants");
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
	alert(`Error ${err.code}: ${err.message} \nThe app will place you at Karamalmi Campus.`);
}
navigator.geolocation.getCurrentPosition(
	success,
	error,
	{
		enableHighAccuracy: false,
		timeout: 5000,
	},
);

// logging in

const loginUser = document.querySelector("#login-username") as HTMLFormElement;
const loginPass = document.querySelector("#login-password") as HTMLFormElement;

const login = async (): Promise<LoginUser> => {
  const credentials = {
    username: loginUser?.value,
    password: loginPass?.value,
  };

  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type" : "application/json"
    },
    body: JSON.stringify(credentials),
  };
  return await fetchUserData(userUrl + "auth/login", options);
};

loginForm.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const user = await login();
  localStorage.setItem("token", user.token);
	loginDialog.close();
  displayUserData(user.data);
});

const displayUserData = (data: User) => {
	const userName = data.username || "This user";
	const userFave = data.favouriteRestaurant || "0";
	const userAvatar = data.avatar || null;

	userCard.classList.add("visible-card");
	unregisteredSection.classList.add("logged-in");
	
	nameTarget.innerText = userName;
	if (userAvatar == null) {
		avatarTarget.src = "../images/user-svgrepo-com.svg";
	} else{
		avatarTarget.src = uploadUrl + userAvatar;
	}
}

centerUser();

mapRestaurants(await getRestaurants());
