export interface CreateInventoryData {
    productId: number;
    warehouseId: number;
    quantity: number;
    availableQuantity?: number;
    reservedQuantity?: number;
    thresholdQuantity?: number;
    location: string;
}

export interface CreateInventoryMovementData {
   productId: number;
   warehouseId: number;
   quantity: number;
   type: 'incoming' | 'outgoing' | 'adjustment' | 'transfer';  
   referenceType: 'sale' | 'purchase' | 'transfer' | 'stock_adjustment';
   referenceId: string;
   notes: string;
   performedById: number;
}