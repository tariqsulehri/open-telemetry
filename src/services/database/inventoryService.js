const fs = require('fs').promises;
const path = require('path');

const inventoryFile = path.join(__dirname, '../../data/inventory.json');

async function readInventoryFile() {
	const content = await fs.readFile(inventoryFile, 'utf8');
	return JSON.parse(content);
}

async function writeInventoryFile(data) {
	await fs.writeFile(inventoryFile, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Return all inventory items from src/data/inventory.json
 * @returns {Array|null}
 */
exports.getInventoryItems = async () => {
	try {
		const items = await readInventoryFile();
		return Array.isArray(items) ? items : null;
	} catch (err) {
		return null;
	}
};

/**
 * Return single inventory item by id
 * @param {string} id
 * @returns {Object|null}
 */
exports.getInventoryItem = async (id) => {
	try {
		const items = await readInventoryFile();
		const found = items.find((it) => String(it.id) === String(id));
		return found || null;
	} catch (err) {
		return null;
	}
};

/**
 * Update price (rate) for an inventory item and persist to file
 * @param {string} id
 * @param {number|string} newPrice
 * @returns {Object|null} updated item or null
 */
exports.updateInventoryRate = async (id, newPrice) => {
	try {
		const price = typeof newPrice === 'number' ? newPrice : Number(newPrice);
		if (Number.isNaN(price)) return null;

		const items = await readInventoryFile();
		const idx = items.findIndex((it) => String(it.id) === String(id));
		if (idx === -1) return null;

		items[idx].price = price;
		await writeInventoryFile(items);
		return items[idx];
	} catch (err) {
		return null;
	}
};

