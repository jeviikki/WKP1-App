import { dailyRestaurantModal, weeklyRestaurantModal, restaurantRow } from "./components.js";
import { baseUrl, userUrl, uploadUrl, defLat, defLon } from "./variables.js";
import * as e from "./elements.js";
import { fetchData, fetchUserData, fetchAvailability } from "./utils.js";
import { Map, TileLayer, Marker, Circle } from "leaflet";
("use strict");
// default filters
let filterSort;
let filterMenuType;
let filterCompany;
// table and dialog
if (!e.target || !e.restaurantDialog) {
    throw new Error("dialog and/or table not found");
}
// user login forms
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
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
        e.restaurantError.classList.add("display-error");
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
        e.target.append(row);
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
                e.restaurantDialog.innerHTML = dailyRestaurantModal(restaurant, menu);
            }
            else {
                e.restaurantDialog.innerHTML = weeklyRestaurantModal(restaurant, menu);
            }
            e.restaurantDialog.showModal();
            const closeBtn = document.querySelector("#close-restaurant-btn");
            closeBtn.addEventListener("click", () => {
                e.restaurantDialog.close();
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
e.registerBtn.addEventListener("click", async () => {
    const registerDialog = document.querySelector("#register-dialog");
    registerDialog.showModal();
    const closeRegisterBtn = document.querySelector("#close-register-btn");
    closeRegisterBtn.addEventListener("click", () => {
        registerDialog.close();
    });
});
//open login dialog
e.loginBtn.addEventListener("click", async () => {
    e.loginDialog.showModal();
    const closeLoginBtn = document.querySelector("#close-login-btn");
    closeLoginBtn.addEventListener("click", () => {
        e.loginDialog.close();
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
// register account
const regUser = document.querySelector("#register-username");
const regEmail = document.querySelector("#register-email");
const regPass = document.querySelector("#register-password");
const registerUser = async () => {
    const credentials = {
        username: regUser.value,
        password: regPass.value,
        email: regEmail.value,
    };
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials),
    };
    return await fetchUserData(userUrl + "users", options);
};
const checkAvailability = async (username) => {
    return await fetchAvailability(userUrl + `users/available/${username}`);
};
registerForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    // check usename availability
    const availability = await checkAvailability(regUser.value);
    console.log(availability.available);
    if (availability.available == false) {
        alert("Username is already taken!");
        return;
    }
    // if username is available:
    const user = await registerUser();
    console.log(user);
    if (user.message = "ok") {
        alert("User account created successfully! You can now log in.");
        e.registerDialog.close();
    }
});
// logging in
const loginUser = document.querySelector("#login-username");
const loginPass = document.querySelector("#login-password");
const login = async () => {
    const credentials = {
        username: loginUser?.value,
        password: loginPass?.value,
    };
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials),
    };
    return await fetchUserData(userUrl + "auth/login", options);
};
loginForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const user = await login();
    // todo: a "wrong username/password" alert
    localStorage.setItem("token", user.token);
    e.loginDialog.close();
    displayUserData(user.data);
});
const getUserData = async (token) => {
    const options = {
        method: "GET",
        headers: {
            Authorization: "Bearer " + token,
        }
    };
    return await fetchUserData(userUrl + "users/token", options);
};
const displayUserData = (data) => {
    const userName = data.username || "This user";
    const userFave = data.favouriteRestaurant || "0";
    const userAvatar = data.avatar || null;
    e.userCard.classList.add("visible-card");
    e.unregisteredSection.classList.add("logged-in");
    e.nameTarget.innerText = userName;
    if (userAvatar == null) {
        e.avatarTarget.src = "../images/user-svgrepo-com.svg";
    }
    else {
        e.avatarTarget.src = uploadUrl + userAvatar;
    }
};
const checkToken = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
        console.log("Not logged in");
        return;
    }
    try {
        const userData = await getUserData(token);
        displayUserData(userData);
    }
    catch (error) {
        console.log(error.message);
    }
};
// check if token exists to keep user logged in 
checkToken();
centerUser();
mapRestaurants(await getRestaurants());
