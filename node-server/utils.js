
const fs = require('fs');

//read addresses in memory once
const addresses = JSON.parse(fs.readFileSync("../addresses.json"))

function getDistance(from, to) {
    const R = 6371; // km
    const deltaLat = getRadians(to.latitude - from.latitude);
    const deltaLon = getRadians(to.longitude - from.longitude);
    const lat1 = getRadians(from.latitude);
    const lat2 = getRadians(to.latitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return +d.toFixed(2);
}

function getRadians(degrees) {
    return degrees * Math.PI / 180
}


function getCityById(id) {
    return addresses.filter(city => city.guid == id)[0]
}

function getAllAddresses() {
    return addresses
}

function getAddressesByTag(tag) {
    return addresses.filter(city => city.tags.includes(tag))
}

function getActiveAddressesByTag(tag) {
    return addresses.filter(city => city.tags.includes(tag) && city.isActive)
}

function getAddressesInRadiusFrom(from, distance) {
    return new Promise((resolve, reject) => {
        const results = []
        try {
            addresses.forEach(addr => {
                const tempDistance = getDistance(from, addr)
                if (tempDistance <= distance && from.guid!=addr.guid) {
                    results.push(addr)
                }
            });
            resolve(results)
        } catch (error) {
            reject(error)
        }
    })
}
module.exports = { getCityById, getDistance, getAddressesInRadiusFrom, getAllAddresses, getActiveAddressesByTag, getAddressesByTag }