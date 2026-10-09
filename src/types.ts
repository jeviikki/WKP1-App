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
	distance?: number; //for distance calc
}

type course = {
	name: String;
	price: String;
	diets: String | String[];
}

type day = {
	date: String;
	courses: course[];
}

type Restaurants = {
	restaurants: Restaurant[]
}

type dailyMenu = {
	courses: course[];
}

type weeklyMenu = {
	days: day[];
}

export { Restaurant, Restaurants, course, day, dailyMenu, weeklyMenu };
