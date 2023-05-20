import prisma from '../../utils/prisma'
import {CreatePlaceSchema, idPlaceSchema, SearchPlaceSchema} from './places.schemas'
import { GOOGLE_MAPS_KEY } from "../../../config";
import { getWeelChair, filteredTypes } from '../search/search.service';

export type Location = {
    lat: string,
    lng: string
}

export async function getPlaceBy(input: CreatePlaceSchema) {
   return await prisma.place.findMany({
      where: input
   }) 
}

export async function getPhotoUrl(photo_reference: string){
   const endpoint='https://maps.googleapis.com/maps/api/place/photo' 
   const url = `${endpoint}?maxwidth=400&photo_reference=${photo_reference}&key=${GOOGLE_MAPS_KEY}`
   
   const urlImage = await fetch(url)
      .then( res => res.ok && res.url)
      .then( data =>  data)
      console.log( urlImage )
   return urlImage
}


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
   const endPoint = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
   const url = `${endPoint}?location=${location.lat} ${location.lng}&radius=5000&type=restaurant&key=${GOOGLE_MAPS_KEY}&accessibility=accessible`
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
                  // photo: await getPhotoUrl(item.photos[0].photo_reference),
                  raiting: res?.raiting || 0,
                  comments: res?.commets || []
               }
            })
         )  
         console.log( lista )
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

// export async function getfavoritesPlaces(user_id:number){
//    const google_places_ids = await prisma.userOnPlaces.findMany({
//       where: {
//          userId: user_id,
//       },
//       include: {
//          place: {
//             include:{
                  
//             }
//          }, 

//       }
//    })
// }

export async function getPlaceById(id_place: string){
   const endpoint = `https://maps.googleapis.com/maps/api/place/details/json`;
   const url = `${endpoint}?place_id=${id_place}&fields=name%2Ctype%2Cwheelchair_accessible_entrance&key=${GOOGLE_MAPS_KEY}`

   try {
      const res = await fetch(url)
      const data =  await res.json()
      console.log(data);
      return data
      
   } catch (error) {
      console.error(error);
   }
}

// 41.386725, 2.165333
// getPlaceById('ChIJ4U8HhjiuEmsRyevJVTxWbFo')
getPlaces({lat:'-33.8688197' , lng: '151.2092955'})