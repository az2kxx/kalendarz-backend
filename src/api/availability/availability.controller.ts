import { Response } from 'express';
import { prisma } from '../../app';
import { AuthRequest } from '../../middleware/auth.middleware';
import type { Prisma } from '@prisma/client';

export const setAvailability = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { availabilities } = req.body;

  try {
    
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.availability.deleteMany({ where: { userId } });
      await tx.availability.createMany({
        data: availabilities.map((a: any) => ({ ...a, userId })),
      });
    });
    
    const newAvailabilities = await prisma.availability.findMany({ where: { userId } });
    res.status(201).json(newAvailabilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error setting availability' });
  }
};

export const getAvailability = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const availabilities = await prisma.availability.findMany({ where: { userId }, orderBy: { dayOfWeek: 'asc' } });
    res.json(availabilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching availability' });
  }
};