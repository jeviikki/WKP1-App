const restaurantRow = (restaurant) => {
	const { name, address = "Unknown", city, company } = restaurant;
	const tr = document.createElement("tr");
	tr.innerHTML = `<td>${name}</td><td>${address}</td><td>${city}</td><td>${company}</td>`;
	return tr;
};

const restaurantModal = (restaurant, menu) => {
	const { name, address, postalCode, city, phone, company } = restaurant;
	const courses = menu.courses;
	const noDiets = "No special diets listed";
	let menuHtml;

	if (courses.length < 1) {
		menuHtml = `Empty.`;
	} else {
		// table header
		menuHtml = `<table>
			<tr>
				<th>Course</th>
				<th>Price</th>
				<th>Diets</th>
			</tr>`;
		for (const course of courses) {
			let { name, price, diets } = course;
			console.log(course);
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

			menuHtml += `<tr>
			<td>${name}</td> 
			<td>${price}</td>
			<td>${diets.map((diet) => {
				switch (diet) {
					//sydänmerkitty
					case "*":
						return "&#x2764";
					//ilmastoystävällinen
					case "ILM":
						return "&#x267B";
					//gluteeniton
					case "G":
						return "&#x1F33E";
					//laktoositon, vähälaktoosinen, maidoton
					//should be given different icons to avoid having the same emoji multiple times in a diets listing
					case "L":
					case "VL":
					case "M":
						return "&#x1F42E";
					//vegaani
					case "Veg":
						return "&#x1F331";
					// sisältää allergeeneja
					case "A":
						return "&#x1F927";
					// sisältää valkosipulia
					case "VS":
						return "&#x1F9C4";
					default:
						return diet;
				}
			})}</td>
			`;
		}
		menuHtml += "</table>";
	}

	const dialogHtml = `
		<div class="dialog-top">
			<h2>${name}</h2>
			<button id="close-btn">X</button>
		</div>

		<div>
			<div>
				<span id="place-address"><br><b>Address:</b> ${address}, ${postalCode} ${city}</span>
				<span id="place-phone"><br><b>Phone number:</b> ${phone}</span>
				<span id="place-company"><br><b>Company:</b> ${company}</p></span>
			</div>
			<div id="map">
				<!-- MAP HERE -->
			</div>
		</div>
		<h2>Today's menu</h2>
		${menuHtml}`;
	return dialogHtml;
};

export { restaurantModal, restaurantRow };
