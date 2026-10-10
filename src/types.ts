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
		coordinates: number[];
	};
	company: String;
	distance?: number; //for distance calc
}

type course = {
	name: String;
	price: String;
	diets: String | String[]; // sodexo and compass group list them differently
}

type day = {
	date: String;
	courses: course[];
}

type Restaurants = {
	filter(arg0: (restaurant: Restaurant) => any): Restaurants;
	sort(arg0: (a: Restaurant, b: Restaurant) => boolean): Restaurants;
	forEach(arg0: (restaurant: Restaurant) => void): Restaurants;
	restaurants: Restaurant[];
}

type dailyMenu = {
	courses: course[];
}

type weeklyMenu = {
	days: day[];
}

export { Restaurant, Restaurants, course, day, dailyMenu, weeklyMenu };
