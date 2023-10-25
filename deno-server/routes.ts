import { Router, MultiPartStream } from "oak";
import AddressHandler from "./addressHandler.ts";
import AddressBook from "./db.ts";
import { reset } from "https://deno.land/std@0.152.0/fmt/colors.ts";


const router = new Router();
const ah: AddressHandler = new AddressHandler(new AddressBook())


router
    .get("/cities-by-tag", async ctx => {
        const tag = ctx.request.url.searchParams.get('tag')
        const isActive = ctx.request.url.searchParams.get('isActive')

        if (!tag) {
            ctx.response.status = 400;
            ctx.response.body = "No was tag provided!"
        } else {
            ctx.response.status = 200;
            ctx.response.body = { cities: isActive ? ah.getActiveAddressesByTag(tag) : ah.getAddressesByTag(tag) }
        }
    })
    .get("/distance", async ctx => {
        const fromQ = ctx.request.url.searchParams.get('from')
        const toQ = ctx.request.url.searchParams.get('to')

        if (!fromQ || !toQ) {
            ctx.response.status = 400;
            ctx.response.body = "from and/or to ids are missing!";
        } else {
            const from = ah.getCityById(fromQ)
            const to = ah.getCityById(toQ)
            ctx.response.status = 200
            ctx.response.body = {
                from: from,
                to: to,
                unit: 'km',
                distance: ah.getDistance(from, to)
            }
        }
    })
    .get("/area", async (ctx) => {
        const fromQ = ctx.request.url.searchParams.get('from')
        const distance = ctx.request.url.searchParams.get('distance')
        if (!fromQ || !distance || isNaN(+distance)) {
            ctx.response.status = 400;
            ctx.response.body = "from and/or distance are missing!";
        } else {
            const from = ah.getCityById(fromQ)
            const start = new Date().getMilliseconds()
            ctx.response.status = 202;
            ctx.response.body = {
                resultsUrl: `${ctx.request.url.protocol + "//" + ctx.request.ip + ":" + ctx.request.url.port}/area-result/2152f96f-50c7-4d76-9e18-f7033bd14428`
            }

            ah.getAddressesInRadiusFrom(from, +distance, "2152f96f-50c7-4d76-9e18-f7033bd14428")


        }
    })
    .get("/area-result/:id", async ctx => {
        const id = ctx.params.id
        if (!ah.promiseResults[id]) {
            ctx.response.status = 202;
            ctx.response.body = [];
        } else {
            ctx.response.status = 200;
            ctx.response.body = { cities: ah.promiseResults[id] };
        }
    })
    .get('/all-cities', async (ctx) => {
        try {
            const imageBuf = await Deno.readFileSync("addresses.json");
            ctx.response.headers.set("Content-Type", "application/octet-stream");
            ctx.response.headers.set("Content-Disposition", `inline; filename="file.ext"`);
            //streaming files was not possible in DENO but I hope you enjoied reading this code!
            ctx.response.body = imageBuf
        } catch (error) {

            ctx.response.status = 500;
            ctx.response.body = "Internal server error";
        }
    })


export default router