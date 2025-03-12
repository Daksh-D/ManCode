//scripts/seed.ts
// File: scripts/seed.ts
import mongoose from 'mongoose';
import { connectDB, Product, IProduct } from '../lib/db'; // Corrected import
import { faker } from '@faker-js/faker';

const categories = ['Shoes', 'Perfumes', 'Trousers', 'Shirts', 'T-Shirts', 'Accessories'];

const generateFakeProduct = ():  Partial<IProduct> => ({ // using Partial<IProduct>
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    images: [faker.image.urlLoremFlickr({ category: 'fashion' }), faker.image.urlLoremFlickr({ category: 'fashion' })], //Corrected property name
    category: faker.helpers.arrayElement(categories),
    rating: faker.number.int({ min: 1, max: 5 }),
    reviews: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [faker.color.human(), faker.color.human(), faker.color.human()],
    inStock: faker.datatype.boolean(),
    createdAt: new Date(),
});

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB (seed script)');

        await Product.deleteMany({});
        console.log('Existing products deleted.');

        // Generate 20 fake products
        const products: IProduct[] = []; //Now can be assign to IProduct
        for (let i = 0; i < 20; i++) {
            products.push(generateFakeProduct() as IProduct); //we need to cast it as IProduct
        }

        await Product.insertMany(products);  // Added await
        console.log('Products seeded successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedDB();