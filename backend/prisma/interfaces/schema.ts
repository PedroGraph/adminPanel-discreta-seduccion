export interface UserData {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'employee';
    status: 'active' | 'inactive';
}

export interface CategoryData {
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'inactive';
}

export interface ProductData {
    sku: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    costPrice: number;
    status: 'active' | 'inactive';
    categoryId: number;
    attributes: {
        create: Array<{
            attributeName: string;
            attributeValue: string;
        }>;
    };
    images: {
        create: Array<{
            imageUrl: string;
            isPrimary: boolean;
            sortOrder: number;
        }>;
    };
}

export interface WarehouseData {
    name: string;
    location: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    status: 'active' | 'inactive';
}

export interface SupplierData {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    paymentTerms: string;
    leadTime: string;
    reliability: 'High' | 'Medium' | 'Low';
    status: 'active' | 'inactive';
}

export interface InventoryData {
    productId: number;
    warehouseId: number;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    thresholdQuantity: number;
    location: string;
}

export interface CouponData {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minPurchaseAmount: number;
    maxDiscountAmount?: number;
    startsAt: Date;
    expiresAt: Date;
    usageLimit: number;
    usageLimitPerUser: number;
    status: 'active' | 'inactive';
    appliesTo: 'all' | 'specific_products' | 'specific_categories';
}

export interface EmailTemplateData {
    name: string;
    subject: string;
    content: string;
    type: 'transactional' | 'marketing';
    variables: string[];
}

