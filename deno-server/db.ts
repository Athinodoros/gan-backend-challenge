import iAddress from "./interfaces.ts";


export default class AddressBook {
    addresses: iAddress[];

    constructor() {

        const decoder = new TextDecoder("utf-8");
        this.addresses = JSON.parse(decoder.decode(Deno.readFileSync("addresses.json")))

    }

    getAddresses(): iAddress[] {
        return this.addresses;
    }
}