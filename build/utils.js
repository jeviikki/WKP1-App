"use strict";
// for restaurants and menus
const fetchData = async (url) => {
    let data;
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error("invalid");
        data = response.json();
        return data;
    }
    catch (error) {
        data = `Error loading restaurants. Check that you are connected to eduroam or using Metropolia VPN`;
        console.log(error);
        return data;
    }
};
// for users
const fetchUserData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        console.log(response);
        throw new Error(`Error ${response.status} occured`);
    }
    const json = response.json();
    return json;
};
export { fetchData, fetchUserData };
