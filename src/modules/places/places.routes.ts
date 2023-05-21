import { type FastifyInstance } from "fastify";
import { searchPlaceByPlaceGoogle, savePlaces, caculateRating, getPlacesHandler, detailPlaceById } from "./places.controller"
import { $placeRef } from "./places.schemas"

export async function PlaceRoutes(app: FastifyInstance) {
    app.get("/list",{
        schema: {
            //    description: 'description',
            tags: ['Place'],
            querystring: $placeRef("locationSchema"),
            response:{
            200:$placeRef('responseSuccessPlacesList')
        }
        },
    }, getPlacesHandler)

    app.post("/create", {
        schema: {
            tags: ["Place"],
            body: $placeRef("createPlaceSchema"),
            response: {
                201: $placeRef("responsePlaceSchema")
            }
        }
    }, savePlaces)

    app.get("/searchByIdGoogle/:id_google_place", {
        schema: {
            tags: ["Place"],
            params: $placeRef("createPlaceSchema"),
            response: {
                201: $placeRef("responsePlaceSchema")
            }
        }
    }, searchPlaceByPlaceGoogle)

    app.get("/ratingavg/:id_google_place", {
        schema: {
            tags: ["Place"],
            params: $placeRef("idPlaceSchema"),
            response: {
                201: $placeRef("responsePlaceSchema")
            }
        }

    }, caculateRating)

    app.get("/detailPlace/:id_google_place", {
        preHandler: [app.authenticate],
        schema: {
            params: $placeRef("createPlaceSchema"),
            response: {
                200: $placeRef("responsePlaceSchema")
            }
        }
    }, detailPlaceById)
}

export default PlaceRoutes
