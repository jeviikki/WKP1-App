import { Restaurant, course, dailyMenu, weeklyMenu } from "./types.js";

const restaurantRow = (restaurant: Restaurant) => {
	const { name, address = "Unknown", company } = restaurant;
	const tr = document.createElement("tr");
	tr.innerHTML = `<td>${name}</td><td>${address}</td><td>${company}</td>`;
	return tr;
};

const dailyRestaurantModal = (restaurant: Restaurant, menu: dailyMenu) => {
	const { name, address, postalCode, city, phone, company } = restaurant;
	const dailyMenu = menu.courses;
	let menuHtml = "";

	if (dailyMenu.length < 1) {
		menuHtml = `Empty.`;
	} else {
		// table header
		menuHtml = `<table>
			<tr>
				<th>Course</th>
				<th>Price</th>
				<th>Diets</th>
			</tr>`;

		for (const course of dailyMenu) {
			menuHtml += addCourse(course); //returns the course html and adds it to the menu html
		}
		menuHtml += "</table>";
	}
	const dialogHtml = `
		<div class="dialog-top">
			<h2>${name}</h2>
			<button id="close-restaurant-btn" class="close-btn">X</button>
		</div>

		<div class="dialog-body">
			<span id="place-address"><br><b>Address:</b> ${address}, ${postalCode} ${city}</span>
			<span id="place-phone"><br><b>Phone number:</b> ${phone}</span>
			<span id="place-company"><br><b>Company:</b> ${company}</p></span>
		<h2>Menu</h2>
		${menuHtml}
		</div>`;
	return dialogHtml;
}

const weeklyRestaurantModal = (restaurant: Restaurant, menu: weeklyMenu) => {
	const { name, address, postalCode, city, phone, company } = restaurant;
	const week = menu.days;
	let menuHtml = "";

	for (const day of week) {
		const date = day.date || "Unknown";
		const weeklyMenu = day.courses || "Empty.";

		// table header
		menuHtml += `<h3>${date}</h3>
		<table>
			<tr>
				<th>Course</th>
				<th>Price</th>
				<th>Diets</th>
			</tr>`;

		for (const course of weeklyMenu) {
			menuHtml += addCourse(course); //returns the course html and adds it to the menu html
		}
		menuHtml += "</table>";
	}
	const dialogHtml = `
		<div class="dialog-top">
			<h2>${name}</h2>
			<button id="close-restaurant-btn" class="close-btn">X</button>
		</div>

		<div class="dialog-body">
			<span id="place-address"><br><b>Address:</b> ${address}, ${postalCode} ${city}</span>
			<span id="place-phone"><br><b>Phone number:</b> ${phone}</span>
			<span id="place-company"><br><b>Company:</b> ${company}</p></span>
		<h2>Menu</h2>
		${menuHtml}
		</div>`;
		return dialogHtml;
}

const addCourse = (course: course) => {
	const noDiets = "No special diets listed";
	let courseHtml: string;

	let { name, price, diets } = course;
	price = price || "? €";
	diets = diets || noDiets;

	// some arrays have no items
	if (diets.length == 0) {
		diets = noDiets;
	}

	// sodexo lists diets as a string. this converts them to array
	if (Array.isArray(diets) == false) {
		diets = diets.split(", ");
	}

	courseHtml = `<tr>
	<td>${name}</td> 
	<td>${price}</td>
	<td>${diets.map((diet: String) => {
		switch (diet) {
			//sydänmerkitty
			case "*":
				return "<span title='Healthy choice'> *</span>";
			//ilmastoystävällinen
			case "ILM":
				return "<span title='Environmentally friendly'> ILM</span>";
			//gluteeniton
			case "G":
				return "<span title='Gluten-free'> G</span>";
			//laktoositon, vähälaktoosinen, maidoton
			case "L":
				return "<span title='Lactose-free'> L</span>";
			case "VL":
				return "<span title='Low-lactose'> VL</span>";
			case "M":
				return "<span title='Dairy-free'> M</span>"
			//vegaani
			case "Veg":
				return "<span title='Vegan'> Veg</span>";
			// sisältää allergeeneja
			case "A":
				return "<span title='May contain allergens'> A</span>";
			// sisältää valkosipulia
			case "VS":
				return "<span title='May contain garlic'> VS</span>";
			default:
				return diet;
			}
	})}</td>`;
		return courseHtml;
	
};

export { dailyRestaurantModal, weeklyRestaurantModal, restaurantRow };
