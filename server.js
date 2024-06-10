const express = require("express");
const axios = require("axios");
const app = express();
const port = 5000;

const apiUrl = "https://www.dnd5eapi.co/api/spells";

async function fetchSpells() {
	try {
		const response = await axios.get(apiUrl);
		return response.data.results;
	} catch (error) {
		console.error("Error fetching spell: ", error);
		return [];
	}
}

async function fetchSpellDetails(spellIndex) {
	try {
		const response = await axios.get(`${apiUrl}/${spellIndex}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching spell details: ", error);
		return null;
	}
}

function applyFilters(spells, filters) {
	return spells.filter((spell) => {
		if (filters.level && spell.level !== parseInt(filters.level)) return false;
		if (filters.school && spell.school.name.toLowerCase() !== filters.school.toLowerCase())
			return false;
		if (
			filters.class &&
			!spell.classes.some((c) => c.name.toLowerCase() === filters.class.toLowerCase())
		)
			return false;
		return true;
	});
}

async function getRandomSpell(filters) {
	const spells = await fetchSpells();
	if (spells.length === 0) {
		console.log("No spells retrieved from API.");
		return null;
	}
	const spellDetails = await Promise.all(spells.map((spell) => fetchSpellDetails(spell.index)));
	const filteredSpells = applyFilters(spellDetails.filter(Boolean), filters);

	if (filteredSpells.length === 0) {
		console.log("No spells found with the given filters.");
		return null;
	}

	const randomIndex = Math.floor(Math.random() * filteredSpells.length);
	return filteredSpells[randomIndex];
}

app.get("/random-spell", async (req, res) => {
	const spell = await getRandomSpell({});
	res.json(spell);
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
