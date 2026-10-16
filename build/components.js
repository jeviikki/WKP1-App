const restaurantRow = (restaurant) => {
    const { name, address, company } = restaurant;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${name}</td><td>${address}</td><td>${company}</td>`;
    return tr;
};
const dailyRestaurantModal = (restaurant, menu) => {
    const dailyMenu = menu.courses;
    let menuHtml = "";
    if (dailyMenu.length < 1) {
        menuHtml = `Empty.`;
    }
    else {
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
    return addDialogBody(menuHtml, restaurant);
};
const weeklyRestaurantModal = (restaurant, menu) => {
    const week = menu.days || "";
    let menuHtml = "";
    if (week.length < 1) {
        // in case of no weekly menu (e.g. Stadin AO as of oct 11th)
        menuHtml = "Empty.";
    }
    else {
        for (const day of week) {
            const date = day.date || "Unknown";
            const weeklyMenu = day.courses;
            if (weeklyMenu.length < 1) {
                // in case of empty day
                menuHtml += `<h3>${date}</h3>
				Empty.`;
            }
            else {
                // table header
                menuHtml += `<div>
				<h3>${date}</h3>
				<table>
					<tr>
						<th>Course</th>
						<th>Price</th>
						<th>Diets</th>
					</tr>`;
                for (const course of weeklyMenu) {
                    menuHtml += addCourse(course); //returns the course html and adds it to the menu html
                }
                menuHtml += "</table></div>";
            }
        }
    }
    return addDialogBody(menuHtml, restaurant);
};
const addCourse = (course) => {
    const noDiets = "No special diets listed";
    let courseHtml;
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
	<td>${diets.map((diet) => {
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
                return "<span title='Dairy-free'> M</span>";
            //vegaani
            case "Veg":
            case "Vegan":
                return "<span title='Vegan'> Vegan</span>";
            // sisältää allergeeneja
            case "A":
                return "<span title='May contain allergens'> A</span>";
            // sisältää valkosipulia
            case "VS":
                return "<span title='May contain garlic'> VS</span>";
            // soy
            case "Soy":
                return "<span> Soy</span>";
            // sesame
            case "Sesame":
                return "<span> Sesame</span>";
            default:
                return diet;
        }
    })}</td>`;
    return courseHtml;
};
const addDialogBody = (menuHtml, restaurant) => {
    const { name, address, postalCode, city, phone, company } = restaurant;
    const html = `
		<div class="dialog-top">
			<h2>${name}</h2>
			<nav>
				<button id="fave-btn" class="big-btn fave-btn">Favorite</button>
				<button id="close-restaurant-btn" class="big-btn close-btn">X</button>
			</nav>
		</div>

		<div class="dialog-body">
			<span id="place-address"><br><b>Address:</b> ${address}, ${postalCode} ${city}</span>
			<span id="place-phone"><br><b>Phone number:</b> ${phone}</span>
			<span id="place-company"><br><b>Company:</b> ${company}</p></span>
		<h2>Menu</h2>
		<div class="dialog-menu-section">
			${menuHtml}
		</div>
		</div>`;
    return html;
};
export { dailyRestaurantModal, weeklyRestaurantModal, restaurantRow };
