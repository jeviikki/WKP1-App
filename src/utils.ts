"use strict";

// for restaurants and menus

const fetchData = async (url: string) => {
	let data;
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("invalid");
		data = response.json();
	} catch (error) {
		data = `Error loading restaurants. Check that you are connected to eduroam or using Metropolia VPN`;
		console.log(error);
	}
	console.log("sending data now...")
	return data;
};

// for users

const fetchUserData = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
	let data;
	try {
		const response = await fetch(url, options);
		if (!response.ok) throw new Error("invalid");
		data = response.json();
	} catch (error) {
		data = `Error loading user data`;
		console.log(error);
	}
	return data
};

// for username availability

const fetchAvailability = async <T>(
  url: string
): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error ${response.status} occured`);
  }
  const json = response.json();
  return json;
};

export { fetchData, fetchUserData, fetchAvailability };
