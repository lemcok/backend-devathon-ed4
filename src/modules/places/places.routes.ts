import { type FastifyInstance } from "fastify";
import { searchPlaceByPlaceGoogle, savePlaces, caculateRating, getPlacesHandler, getDetailHandler } from "./places.controller"
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

    app.get('/detail',{
        schema:{
            tags:['Place'],
            querystring:$placeRef('queryDetail'),
            summary:'Get details of place by place_id',
            response:{
                200:$placeRef('responseSuccessDetail'),
                404:{
                description:'Missing fill place_id',
               types:'object',
               properties: {
                 status: {
                  type: 'string',
                  example:'failed'
                 },
                 error:{
                  type:'string',
                  example:'place_id is required'
                 },
               }
                }
            }
        }
    }, getDetailHandler);

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

    app.get("/ratingavg/:id", {
        schema: {
            tags: ["Place"],
            params: $placeRef("idPlaceSchema"),
            response: {
                201: $placeRef("responsePlaceSchema")
            }
        }

    }, caculateRating)
}

export default PlaceRoutes
