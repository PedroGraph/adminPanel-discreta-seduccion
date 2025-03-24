import { seedUsers } from './01-users.js';
import { seedCategories } from './02-categories.js';
import { seedProducts } from './03-products.js';
import { seedWarehouses } from './04-warehouses.js';
import { seedSuppliers } from './05-suppliers.js';
import { seedInventory } from './06-inventory.js';
import { seedCoupons } from './07-coupons.js';
// import { seedEmailTemplates } from './08-email-templates.js';


async function main(): Promise<void> {
  try {
    console.log('🌱 Iniciando proceso de seed...');
    
    await seedUsers();
    await seedCategories();
    await seedProducts();
    await seedWarehouses();
    await seedSuppliers();
    await seedInventory();
    await seedCoupons();
    // await seedEmailTemplates();

    console.log('✅ Proceso de seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el proceso de seed:', error);
    process.exit(1);
  }
}

main();