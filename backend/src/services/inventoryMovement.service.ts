import prisma from "../lib/prisma.js";
import { CreateInventoryMovementData } from "../interfaces/inventory.interface.js";
import { setActivityToLog } from "../middleware/log.js";
import { Request } from "express";

export class InventoryMovementService {
  async createInventoryMovement(data: any, req: Request) {

    let information: object = {
        status: 0,
        message: ``,
      };

    const user = await prisma.user.findUnique({
      where: { id: data.performedById },
    })

    if (!user) {
      throw { status: 400, message: "El usuario asignado al movimiento de inventario no existe" };
    }
  
    try {
      const inventory: CreateInventoryMovementData = {
        productId: data.productId,
        quantity: data.quantity,
        type: 'incoming',
        referenceType: 'purchase',
        referenceId: '',
        notes: 'Se ha creado un nuevo movimiento de inventario',
        performedById: data.performedById,
        warehouseId: data.warehouseId,
      }

      const inventoryMovement = await prisma.inventoryMovement.create({ data: inventory });
      information = { message: `Movimiento de inventario creado con éxito - ${inventoryMovement.id}`, status: true, inventoryMovement };
      return { information, status: true, inventoryMovement };
    } catch (error: any) {
      information = { message: "No se pudo crear el movimiento de inventario", status: false };
      throw information;
    } finally {
      setActivityToLog(req, {
        action: "create",
        entityType: "inventoryMovement",
        description: (information as { message: string }).message,
      });
    }
  }

  async updateInventoryMovement(id: number, data: Partial<CreateInventoryMovementData>, req: Request) {
    let information: object = {
        status: 0,
        message: ``,
      };
  
    try {
      const inventoryMovement = await prisma.inventoryMovement.update({
        where: { id },
        data,
      });
      information = { message: `Movimiento de inventario actualizado con éxito - ${inventoryMovement.id}`, status: true, inventoryMovement };
      return {
        message: "Movimiento de inventario actualizado",
        status: true,
        inventoryMovement,
      };
    } catch (error: any) {
      information = { message: "No se pudo actualizar el movimiento de inventario", status: false };
      throw information;
    } finally {
      setActivityToLog(req, {
        action: "update",
        entityType: "inventoryMovement",
        description: (information as { message: string }).message,
      });
    }
  }

  async searchInventoryMovementByAnyField(field: string, value: string) {
    try {
      const inventoryMovement = field.includes('id') ? 
      await prisma.inventoryMovement.findUnique({ where: { id: Number(value) } }) : 
      await prisma.inventoryMovement.findFirst({ where: { [field]: value }});

      return inventoryMovement
        ? {
            message: "Movimiento de inventario encontrado",
            status: true,
            inventoryMovement,
          }
        : {
            message: "No se encontró el movimiento de inventario",
            status: false,
          };
    } catch (error: any) {
      throw error;
    } finally {
    }
  }

  async getAllInventoryMovements() {
    try {
      const inventoryMovements = await prisma.inventoryMovement.findMany();
      return {
        message: "Movimientos de inventario encontrados",
        status: true,
        inventoryMovements,
      };
    } catch (error: any) {
      throw error;
    } finally {
    }
  }
}
