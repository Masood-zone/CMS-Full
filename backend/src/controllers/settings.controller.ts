import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

import prisma from "../config/database";

export const settingsController = {
  getSettings: async (req: Request, res: Response) => {
    const { category } = req.query;

    try {
      const settings = await prisma.settings.findMany({
        where: category ? { category: category as string } : undefined,
        orderBy: { key: "asc" },
      });

      res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getSetting: async (req: Request, res: Response) => {
    const { key } = req.params;

    try {
      const setting = await prisma.settings.findUnique({
        where: { key },
      });

      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }

      res.status(200).json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createOrUpdateSetting: async (req: Request, res: Response) => {
    const { key, value, category = "general" } = req.body;

    try {
      const setting = await prisma.settings.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category },
      });

      res.status(200).json(setting);
    } catch (error) {
      console.error("Error creating/updating setting:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteSetting: async (req: Request, res: Response) => {
    const { key } = req.params;

    try {
      await prisma.settings.delete({
        where: { key },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting setting:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Specific methods for canteen settings
  getCanteenAmount: async (req: Request, res: Response) => {
    try {
      const setting = await prisma.settings.findUnique({
        where: { key: "canteen_daily_amount" },
      });

      res.status(200).json({
        data: {
          value: setting?.value || "0",
        },
      });
    } catch (error) {
      console.error("Error fetching canteen amount:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateCanteenAmount: async (req: Request, res: Response) => {
    const { amount } = req.body;

    try {
      const setting = await prisma.settings.upsert({
        where: { key: "canteen_daily_amount" },
        update: { value: amount.toString() },
        create: {
          key: "canteen_daily_amount",
          value: amount.toString(),
          category: "canteen",
        },
      });

      res.status(200).json(setting);
    } catch (error) {
      console.error("Error updating canteen amount:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
