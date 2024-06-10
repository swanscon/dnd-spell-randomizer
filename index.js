const axios = require("axios");
const { program } = require("commander");

program
	.option("-l, --level <level>", "Filter by spell level")
	.option("-s, --school <school>", "Filter by spell school")
	.option("-c, --class <class>", "Filter by spell class")
	.parse(process.argv);

const options = program.opts();
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

getRandomSpell(options).then((spell) => {
	if (spell) {
		console.log(`Spell: ${spell.name}`);
		console.log(`Description: ${spell.desc.join(" ")}`);
		console.log(`Level: ${spell.level}`);
		console.log(`School: ${spell.school.name}`);
		console.log(`Classes: ${spell.classes.map((c) => c.name).join(", ")}`);
	}
});
