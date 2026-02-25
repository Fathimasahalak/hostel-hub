const { sequelize, User, MessMenu } = require('./models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true });

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const studentPassword = await bcrypt.hash('student123', 10);

        await User.create({
            name: 'Dr. Sharma',
            email: 'admin@hostel.com',
            password: hashedPassword,
            role: 'admin'
        });

        await User.create({
            name: 'Arjun Mehta',
            email: 'student@hostel.com',
            password: studentPassword,
            role: 'student',
            hostelRoom: 204,
            studentId: 'ST-001'
        });

        const menuData = [
            { day: 'Monday', breakfast: 'Idli & Sambar', lunch: 'Rice, Dal & Sabzi', snacks: 'Tea & Biscuits', dinnerVeg: 'Paneer Butter Masala', dinnerNonVeg: 'Chicken Curry' },
            { day: 'Tuesday', breakfast: 'Puri & Bhaji', lunch: 'Veg Biryani', snacks: 'Veg Cutlet', snacksNonVeg: 'Chicken Cutlet', dinnerVeg: 'Dal Tadka', dinnerNonVeg: 'Ghee Rice & Fish fry' },
            { day: 'Wednesday', breakfast: 'Poha', lunch: 'Rice & Sambar', snacks: 'Tea & Pakora', dinnerVeg: 'Aloo Gobi', dinnerNonVeg: 'Egg Roast' },
            { day: 'Thursday', breakfast: 'Appam & Stew', lunch: 'Veg Pulav', snacks: 'Veg Roll', snacksNonVeg: 'Egg Roll', dinnerVeg: 'Mushroom Masala', dinnerNonVeg: 'Beef Fry' },
            { day: 'Friday', breakfast: 'Dosa & Chutney', lunch: 'Curd Rice', snacks: 'Tea & Vada', dinnerVeg: 'Mix Veg Sabzi', dinnerNonVeg: 'Chicken 65' },
            { day: 'Saturday', breakfast: 'Upma', lunch: 'Fried Rice', snacks: 'Coffee & Samosa', dinnerVeg: 'Kadai Paneer', dinnerNonVeg: 'Mutton Curry' },
            { day: 'Sunday', breakfast: 'Masala Dosa', lunch: 'Special Lunch', snacks: 'Tea & Cake', dinnerVeg: 'Malai Kofta', dinnerNonVeg: 'Butter Chicken' }
        ];

        await MessMenu.bulkCreate(menuData);

        console.log('Database seeded with Users and Mess Menu!');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await sequelize.close();
    }
};

seedDatabase();
