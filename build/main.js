import { dailyRestaurantModal, weeklyRestaurantModal, restaurantRow } from "./components.js";
import { baseUrl, defLat, defLon, target, restaurantDialog, restaurantError } from "./variables.js";
import { fetchData } from "./utils.js";
import { Map, TileLayer, Marker, Circle } from "leaflet";
("use strict");
// default filters
let filterSort;
let filterMenuType;
let filterCompany;
// table and dialog
if (!target || !restaurantDialog) {
    throw new Error("dialog and/or table not found");
}
// map stuff
let userLat = defLat, userLon = defLon;
const map = new Map("grand-map").setView([userLat, userLon], 11);
if (!map) {
    throw new Error("map is missing");
}
new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
    if (typeof (restaurants) == "string") {
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
const filterRestaurants = (restaurants) => {
    // which restaurants it will show
    let filter1 = filterCompany[0] || "";
    let filter2 = filterCompany[1] || "";
    const data = restaurants.filter((restaurant) => restaurant.company.toLowerCase() == filter1 || filter2);
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
const sortRestaurants = (restaurants) => {
    switch (filterSort) {
        case "name":
            restaurants.sort((a, b) => a.name > b.name);
            break;
        case "address":
            restaurants.sort((a, b) => a.address > b.address);
            break;
        case "location":
            // locations get calculated before this is executed
            restaurants.sort((a, b) => a.distance > b.distance);
            break;
        default:
            restaurants.sort((a, b) => a.name > b.name);
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
            const fetchMenuUrl = `${baseUrl}/${filterMenuType}/${restaurant._id}/en`;
            const menu = await fetchData(fetchMenuUrl);
            // which type of menu to render
            if (filterMenuType == "daily") {
                restaurantDialog.innerHTML = dailyRestaurantModal(restaurant, menu);
            }
            else {
                restaurantDialog.innerHTML = weeklyRestaurantModal(restaurant, menu);
            }
            restaurantDialog.showModal();
            const closeBtn = document.querySelector("#close-restaurant-btn");
            closeBtn.addEventListener("click", () => {
                restaurantDialog.close();
            });
        });
    });
};
const calcRestaurantDistance = (restaurants) => {
    // calculates distance between user location and restaurant location and saves it for later use
    // formula is not 100% accurate however
    restaurants.forEach((restaurant) => {
        const resLon = restaurant.location.coordinates[0];
        const resLat = restaurant.location.coordinates[1];
        restaurant.distance = Math.sqrt((userLat - resLat) ** 2 + (userLon - resLon) ** 2);
    });
    return restaurants;
};
const mapRestaurants = (restaurants) => {
    restaurants.forEach((restaurant) => {
        const resLon = restaurant.location.coordinates[0];
        const resLat = restaurant.location.coordinates[1];
        // marker & popup
        const marker = new Marker([resLat, resLon]).addTo(map);
        marker.bindPopup(`
				<h3>${restaurant.name}</h3>
				<p>${restaurant.address}</p>
			`).openPopup;
    });
};
const centerRestaurant = (restaurant) => {
    // when a restaurant is selected, map centers to its location
    map.setView([
        restaurant.location.coordinates[1],
        restaurant.location.coordinates[0],
    ], 14);
};
const centerUser = () => {
    // centers map to user location
    map.setView([userLat, userLon], 11);
    // also moves user from default location
    you.setLatLng([userLat, userLon]);
};
//open register dialog
const registerBtn = document.querySelector("#register-dialog-btn");
registerBtn.addEventListener("click", async () => {
    const registerDialog = document.querySelector("#register-dialog");
    registerDialog.showModal();
    const closeRegisterBtn = document.querySelector("#close-register-btn");
    closeRegisterBtn.addEventListener("click", () => {
        registerDialog.close();
    });
});
//open login dialog
const loginBtn = document.querySelector("#login-dialog-btn");
loginBtn.addEventListener("click", async () => {
    const loginDialog = document.querySelector("#login-dialog");
    loginDialog.showModal();
    const closeLoginBtn = document.querySelector("#close-login-btn");
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
};
// filter button
const form = document.querySelector("#filter-form");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    updateFilters();
    window.location.replace("#restaurants");
    await getRestaurants();
});
// getting user location
function success(pos) {
    userLat = pos.coords.latitude;
    userLon = pos.coords.longitude;
    centerUser();
}
function error(err) {
    console.warn(`Error ${err.code}: ${err.message}`);
    alert(`Error ${err.code}: ${err.message} \nThe app will place you at Karamalmi Campus.`);
}
navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: false,
    timeout: 5000,
});
centerUser();
mapRestaurants(await getRestaurants());
