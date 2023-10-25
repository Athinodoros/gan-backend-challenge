import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from "https://deno.land/std@0.204.0/testing/mock.ts";
import { assertEquals, assertArrayIncludes, assertThrows, assertIsError } from "https://deno.land/std@0.201.0/assert/mod.ts";
import iAddress from "./interfaces.ts";
import AddressHandler from "./addressHandler.ts";

import AddressBook from "./db.ts";

Deno.test("Test get distance", async (t) => {
  const R = 6371;
  const circumference = 2 * Math.PI * R;
  const ah = new AddressHandler(new AddressBook())

  await t.step('test zero distance', () => {
    const from: iAddress = { address: "", guid: "", tags: [], isActive: true, latitude: 0, longitude: 0 }
    const to: iAddress = { address: "", guid: "", tags: [], isActive: true, latitude: 0, longitude: 0 }
    assertEquals(ah.getDistance(from, to), 0);
  })

  await t.step('test quarter distance', () => {
    const from: iAddress = { address: "", guid: "", tags: [], isActive: true, latitude: 0, longitude: 0 }
    const to: iAddress = { address: "", guid: "", tags: [], isActive: true, latitude: 0, longitude: 90 }

    assertEquals(Math.floor(ah.getDistance(from, to)), Math.floor(circumference / 4));
  })
  await t.step('test half distance', () => {
    const from: iAddress = { address: "", guid: "", tags: [], isActive: true, latitude: 0, longitude: 0 }
    const to: iAddress = { address: "", guid: "", tags: [], isActive: true, latitude: 0, longitude: 180 }
    assertEquals(ah.getDistance(from, to), +(circumference / 2).toFixed(2));
  })
  await t.step('test throw on wrong coordinates', () => {
    const from: iAddress = { address: "", guid: "", tags: [], isActive: true, latitude: 0, longitude: 0 }
    const to: iAddress = { address: "", guid: "", tags: [], isActive: true, latitude: 0, longitude: 181 }
    assertThrows(() => { ah.getDistance(from, to) });
  })

});

Deno.test("Test address filtering", async (t) => {
  const ah = new AddressHandler(new AddressBook())

  //1lat is about 111km
  //1long is also about 111km 
  ah.addresses = [
    { address: "", guid: "1", tags: ["first"], isActive: true, latitude: 0, longitude: 180 },//first3 should be less that 112km apart
    { address: "", guid: "1,1", tags: ["first"], isActive: false, latitude: 0, longitude: 179.9 },
    { address: "", guid: "2", tags: [], isActive: true, latitude: 0, longitude: 179.5 },
    { address: "", guid: "3", tags: [], isActive: true, latitude: 90, longitude: 0 },//last three
    { address: "", guid: "4", tags: [], isActive: true, latitude: 89.5, longitude: 0 },
    { address: "Copenhagen", guid: "5", tags: [], isActive: true, latitude: 89, longitude: 0 },
  ];

  await t.step("can get all", () => {
    assertEquals(ah.getAllAddresses().length, 6)
  })

  await t.step('Can get by tag', () => {
    const byTag = ah.getAddressesByTag('first')
    assertEquals(byTag.length, 2);
    assertArrayIncludes(byTag, [ah.addresses[0], ah.addresses[1]])
  })
  await t.step('Can get active by tag', () => {
    const byTag = ah.getActiveAddressesByTag('first')
    assertEquals(byTag.length, 1);
    assertArrayIncludes(byTag, [ah.addresses[0]])
  })
  await t.step('Can get by id', () => {
    const city = ah.getCityById('5')
    assertEquals(city.address, "Copenhagen");
  })
  await t.step('Can get addresses by distance', async () => {
    const closeCities = await ah.getAddressesInRadiusFrom(ah.getCityById("1"), 112,"222")
    assertEquals(closeCities.length, 2);
    const closeCities2 = await ah.getAddressesInRadiusFrom(ah.getCityById("5"), 112,"223")
    assertEquals(closeCities2.length, 2);
    const closeCitiesNone = await ah.getAddressesInRadiusFrom({
      address: "", guid: "someID", isActive: false, tags: ["loner"], latitude: 45, longitude: -45
    }, 112,"2324")
    assertEquals(closeCitiesNone.length,0);
  })

})
