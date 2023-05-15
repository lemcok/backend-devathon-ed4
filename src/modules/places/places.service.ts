import prisma from '../../utils/prisma'
import {CreatePlaceSchema, idPlaceSchema, SearchPlaceSchema} from './places.schemas'
import { GOOGLE_MAPS_KEY } from "../../../config";
import { getWeelChair, filteredTypes } from '../search/search.service';

export type Location = {
    lat: string,
    lng: string
}
 
 export interface Place {
    place_id: string,
    icon: string,
    name: string,
    location: Location,   
    types: string
}

const endPoint = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'

const getPlacefromdb = async (place:any) => {
   const placedb = await prisma.place.findFirst({
      where: {
         id_google_place: place.place_id
      },
      select: {
         raiting: true,
         id_google_place: true,
         commets: {
            select: {
               id: true,
               raiting_comment: true,
               text: true,
               user: {select: {id: true, name: true}}
            },
         }
      }
   })
   return placedb
}

export async function getPlaces(location: Location) {
   const url = `${endPoint}?location=${location.lat} ${location.lng}&radius=5000&key=${GOOGLE_MAPS_KEY}&accessibility=accessible`
   const result = await fetch(url)
      .then(res => {
         if(res.ok){
            return res.json()
         }
         throw new Error('Error al obtener los lugares')
      })
      .then( async(data) => {
         const lista = await Promise.all(
            data?.results.map( async(item:any) => {
               const res =  await getPlacefromdb(item)
               return {
                  place_id: item.place_id,
                  icon: item.icon,
                  name: item.name,
                  location: {lat: item.geometry.location},   
                  types: item.types,
                  raiting: res?.raiting || 0,
                  comments: res?.commets || []
               }
            })
         ) 
         return lista
      })
      return result;
}

export async function getPlaces2(location: Location) {
    const url = `${endPoint}?location=${location.lat} ${location.lng}&radius=5000&key=${GOOGLE_MAPS_KEY}&accessibility=accessible`;
    const result = await fetch(url)
    .then((res) => {
        if (res.ok) {
            return res.json();
        }
    })
    .then((data) => {
        return Promise.all(
        data?.results.map(async (item: any) => {
            const wheelchair_accessible_entrance = await getWeelChair(item.place_id);
            return {
                place_id: item.place_id,
                name: item.name,
                types: item.types.filter(filteredTypes),
                location: item.geometry.location ,
                wheelchair_accessible_entrance,
            };
        })
        );
    });
    return result;
}

export async function getPlaceByIdGoogle(input: CreatePlaceSchema) {
    return await prisma.place.findMany({
        where: {
            id_google_place: input.id_google_place
        }
    }) 
}

export async function createPlace(input: CreatePlaceSchema) {
    return await prisma.place.create({
        data: {
            id_google_place: input.id_google_place
        }
    })
}

export async function updatePlaces(idpla: idPlaceSchema, input: CreatePlaceSchema) {
    return await prisma.place.update({
        where: idpla,
        data: {
            id_google_place: input.id_google_place
        }
    })
}

export async function calculateAvg(id_place: number) {
    const avg = await prisma.comment.aggregate({
        _avg: {
            raiting_comment: true
        },
        where: {
            id_place,
            raiting_comment: {
                not: null
            }
        }
    })
    
    return await prisma.place.update({
        where: {
            id: id_place
        },
        data: {
            rating: avg._avg.raiting_comment ? avg._avg.raiting_comment : null
        }
    })
}


export async function createFavoritesPlaces(userId: number, placeId: number) {
   return await prisma.userOnPlaces.create({
      data: {
         placeId,
         userId
      }
   })
}

export async function getPlaceById(id_place: string){
   console.log( id_place );
   // const idPlace = 'ChIJFfyzTTeuEmsRuMxvFyNRfbk'
   const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id_place}&key=${GOOGLE_MAPS_KEY}`
            // 'https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4&fields=name%2Crating%2Cformatted_phone_number&key=YOUR_API_KEY',

   try {
      const res = await fetch(url)
      const data =  await res.json()
      console.log(data);
      return data
      
   } catch (error) {
      console.error(error);
   }
   // console.log( data );
      // .then(res => res.json())
      // .then(data => console.log( data ))
}

// getPlaceById('ChIJ4U8HhjiuEmsRyevJVTxWbFo')