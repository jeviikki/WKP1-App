type Restaurant = {
	_id: String;
	companyId: Number;
	name: String;
	address: String;
	postalCode: String;
	city: String;
	phone: String;
	location: {
		type: String;
		coordinates: Number[];
	};
	company: String;
}

type course = {
	name: String;
	price: String;
	diets: String | String[];
}

type dailyMenu = {
	courses: course;
}

type weeklyMenu = {
	days: {
		date: String;
		courses: course;
	}
}

export { Restaurant, dailyMenu, weeklyMenu };
