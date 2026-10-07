const restaurantRow = (restaurant) => {
    const { name, address = "Unknown", company } = restaurant;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${name}</td><td>${address}</td><td>${company}</td>`;
    return tr;
};
const restaurantModal = (restaurant, menu) => {
    const { name, address, postalCode, city, phone, company } = restaurant;
    const noDiets = "No special diets listed";
    let menuHtml = "", courses;
    const menuType = typeof menu;
    console.log(menuType);
    // figuring out
    if (menuType == "dailyMenu") {
        courses = menu.courses;
    }
    else if (menuType == "weekly") {
        courses = menu.days;
    }
    console.log(courses);
    if (courses.length < 1) {
        menuHtml = `Empty.`;
    }
    else if (menuType == "daily") {
        // table header
        menuHtml = `<table>
			<tr>
				<th>Course</th>
				<th>Price</th>
				<th>Diets</th>
			</tr>`;
        for (const course of courses) {
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
            menuHtml += `<tr>
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
            })}</td>
			`;
        }
        menuHtml += "</table>";
    }
    else if (menuType == "weekly") {
        for (const day of courses) {
            const date = day.date || "Unknown";
            const weeklyMenu = day.courses || "Empty.";
            // table header
            menuHtml += `<h3>${date}</h3><table>
				<tr>
					<th>Course</th>
					<th>Price</th>
					<th>Diets</th>
				</tr>`;
            for (const course of weeklyMenu) {
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
                menuHtml += `<tr>
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
                })}</td>
				`;
            }
            menuHtml += "</table>";
        }
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
};
export { restaurantModal, restaurantRow };
