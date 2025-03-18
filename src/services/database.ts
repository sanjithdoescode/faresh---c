// Using Prisma ORM for type-safe database operations

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getNearbyFarmers(
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<Farmer[]> {
  return prisma.$queryRaw`
    SELECT *, 
           (6371 * acos(cos(radians(${latitude})) 
           * cos(radians(lat)) 
           * cos(radians(lng) - radians(${longitude})) 
           + sin(radians(${latitude})) 
           * sin(radians(lat)))) AS distance 
    FROM Farmer 
    HAVING distance < ${radiusKm} 
    ORDER BY distance
  `
} 