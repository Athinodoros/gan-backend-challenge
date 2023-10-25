import AddressBook from "./db.ts";
import iAddress from "./interfaces.ts";


export default class AddressHandler {
    addresses: iAddress[];
    promiseResults: { [key: string]: iAddress[] };

    constructor(db: AddressBook) {
        this.addresses = db.getAddresses()
        this.promiseResults = {}
    }

    getDistance(from: iAddress, to: iAddress) {
        if (from.longitude > 180 || from.longitude < -180
            || to.longitude > 180 || to.longitude < -180 ||
            from.latitude > 90 || from.latitude < -90
            || to.latitude > 90 || to.latitude < -90) {
            throw new Error("address is out of this world!")
        }
        const R = 6371; // km
        const deltaLat = this.getRadians(to.latitude - from.latitude);
        const deltaLon = this.getRadians(to.longitude - from.longitude);
        const lat1 = this.getRadians(from.latitude);
        const lat2 = this.getRadians(to.latitude);

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return +d.toFixed(2);
    }

    getRadians(degrees: number): number {
        return degrees * Math.PI / 180
    }

    getCityById(id: string): iAddress {
        return this.addresses.filter(city => city.guid == id)[0]
    }

    getAllAddresses(): iAddress[] {
        return this.addresses
    }

    getAddressesByTag(tag: string): iAddress[] {
        return this.addresses.filter(city => city.tags.includes(tag))
    }

    getActiveAddressesByTag(tag: string): iAddress[] {
        return this.addresses.filter(city => city.tags.includes(tag) && city.isActive)
    }

    getAddressesInRadiusFrom(from: iAddress, distance: number,id:string) {
        setTimeout(()=>{
            return new Promise((resolve, reject) => {
                const results: iAddress[] = []
                try {
                    this.addresses.forEach(addr => {
                        const tempDistance = this.getDistance(from, addr)
                        if (tempDistance <= distance && from.guid != addr.guid) {
                            results.push(addr)
                        }
                    });
                    this.promiseResults[id]= results;
                    resolve(results)
                } catch (error) {
                    reject(error)
                }
            })
        },0)
    }

}