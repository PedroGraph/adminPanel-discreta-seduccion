import prisma from "../lib/prisma.js";
import { CreateInventoryData } from "../interfaces/inventory.interface.js";
import { setActivityToLog } from "../middleware/log.js";
import { Request } from "express";

export class InventoryService {
  async  createInventory(data: CreateInventoryData, req: Request) {
    let information: object = {
        status: 0,
        message: ``,
      };
  
    try {
      if (!data.productId)
        throw { status: 400, message: "El campo productId es obligatorio" };
      const inventory = await prisma.inventory.create({ data });
      information = { message: "Inventario creado con éxito", status: true, inventory };
      return { message: "Inventario creado", status: true, inventory };
    } catch (error: any) {
      information = { message: "No se pudo crear el inventario", status: false };
      throw error;
    }finally{
      setActivityToLog(req, {
        action: "create",
        entityType: "inventory",
        description: (information as { message: string }).message
      });
    }
  }

  async updateInventory(id: number, data: Partial<CreateInventoryData>, req: Request) {
    let information: object = {
        status: 0,
        message: ``,
      };
  
    try {
      if (!id) throw { status: 400, message: "El campo ID es obligatorio" };
      const inventory = await prisma.inventory.update({ where: { id }, data });
      information = { message: `Inventario actualizado con éxito - ${inventory.id}`, status: true, inventory };
      return { message: "Inventario actualizado", status: true, inventory };
    } catch (error: any) {
      information = { message: "No se pudo actualizar el inventario", status: false };
      throw error;
    }finally{
      setActivityToLog(req, {
        action: "update",
        entityType: "inventory",
        description: (information as { message: string }).message,
      });
    }
  }

  async deleteInventory(id: number, req: Request) {
    let information: object = {
        status: 0,
        message: ``,
    };
  
    try {
      if (!id) throw { status: 400, message: "El campo ID es obligatorio" };
      const inventory = await prisma.inventory.delete({ where: { id } });
      information = { message: `Inventario eliminado con éxito - ${inventory.id}`, status: true, inventory };
      return { message: "Inventario eliminado", status: true, inventory };
    } catch (error: any) {
      information = { message: "No se pudo eliminar el inventario", status: false };
      throw error;
    }finally{
      setActivityToLog(req, {
        action: "delete",
        entityType: "inventory",
        description: (information as { message: string }).message,
      });
    }
  }

  async getInventoryById(id: number) {
    try {
      if (!id) throw { status: 400, message: "El campo ID es obligatorio" };
      const inventory = await prisma.inventory.findUnique({ where: { id } });
      return inventory
        ? { message: "Inventario encontrado", status: true, inventory }
        : { message: "No se encontró el inventario", status: false };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllInventories() {
    try {
      const inventories = await prisma.inventory.findMany();
      return inventories.length > 0
        ? { message: "Inventarios encontrados", status: true, inventories }
        : { message: "No se encontraron inventarios", status: false };
    } catch (error: any) {
      throw error;
    }
  }
}
