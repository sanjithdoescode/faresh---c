// Using Prisma ORM for type-safe database operations

import { PrismaClient, Farmer } from '@prisma/client'
import { prisma } from '../lib/prisma'

export async function findFarmersNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<Farmer[]> {
  return prisma.$queryRaw`
    SELECT *, 
           (6371 * acos(cos(radians(${latitude})) 
           * cos(radians(latitude)) 
           * cos(radians(longitude) 
           - radians(${longitude})) 
           + sin(radians(${latitude})) 
           * sin(radians(latitude)))) AS distance 
    FROM "Farmer"
    HAVING distance < ${radiusKm}
    ORDER BY distance;
  `
}

export { prisma } 