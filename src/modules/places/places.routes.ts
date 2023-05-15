import { type FastifyInstance } from "fastify";
import { searchPlaceByPlaceGoogle, savePlaces, caculateRating, getPlacesHandler, getPlaceByIdHandler } from "./places.controller"
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
    // }, registerPlaces)

    app.get("/searchByIdGoogle/:id_google_place", {
        schema: {
            tags: ["Place"],
            params: $placeRef("createPlaceSchema"),
            response: {
                201: $placeRef("responsePlaceSchema")
            }
        }
    }, searchPlaceByPlaceGoogle)

    app.get("/ratingavg/:id", {
        schema: {
            tags: ["Place"],
            params: $placeRef("idPlaceSchema"),
            response: {
                201: $placeRef("responsePlaceSchema")
            }
        }

    }, caculateRating)

    app.get('/:id', {
        schema: {
            tags: ['Places'],
            params: {
                type: "object",
                required: ["id"],
                // properties: { id: { type: 'string', pattern: "^[0-9a-fA-F]{24}$" } }
                properties: { id: { type: 'string' } }
             }
        },
    }, getPlaceByIdHandler)
}


export default PlaceRoutes
