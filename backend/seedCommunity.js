const { User, Circle, Post, Comment, Like, sequelize } = require('./models');

async function seedCommunity() {
    try {
        console.log('Seeding Community data...');

        // 1. Create default circles
        const circles = await Circle.bulkCreate([
            {
                name: 'Morning Walk',
                description: 'Wake up early and walk together around campus',
                icon: 'Footprints',
                color: 'bg-success/10 text-success'
            },
            {
                name: 'Jogging Club',
                description: 'Evening jogging sessions at the sports ground',
                icon: 'Footprints',
                color: 'bg-info/10 text-info'
            },
            {
                name: 'Movie Night',
                description: 'Weekly movie screenings in the common room',
                icon: 'Film',
                color: 'bg-accent/10 text-accent-foreground'
            },
            {
                name: 'Food Outings',
                description: 'Spontaneous late-night food runs and cravings',
                icon: 'UtensilsCrossed',
                color: 'bg-warning/10 text-warning-foreground'
            }
        ]);

        // 2. Get some users
        const users = await User.findAll();
        if (users.length === 0) {
            console.log('No users found to seed posts. Please seed users first.');
            return;
        }

        const admin = users.find(u => u.role === 'admin') || users[0];
        const student = users.find(u => u.role === 'student') || users[0];

        // 3. Create initial posts
        const post1 = await Post.create({
            content: 'Welcome to the new Community Feed! Share your thoughts, events, or just say hi. 👋',
            category: 'general',
            userId: admin.id
        });

        const post2 = await Post.create({
            content: 'Anybody up for a quick cricket match this evening? 🏏 Ground 2, 5 PM.',
            category: 'event',
            userId: student.id,
            circleId: circles[1].id
        });

        const post3 = await Post.create({
            content: 'Lost my keys near the mess yesterday. If found, please drop them at the reception. 🗝️',
            category: 'lost_found',
            userId: student.id
        });

        // 4. Add some comments
        await Comment.create({
            content: 'Great initiative! This will help us stay connected.',
            userId: student.id,
            postId: post1.id
        });

        await Comment.create({
            content: 'I am in! See you there.',
            userId: admin.id,
            postId: post2.id
        });

        // 5. Add some likes
        await Like.create({ userId: admin.id, postId: post2.id });
        await Like.create({ userId: student.id, postId: post1.id });

        // 6. Join some circles
        await admin.addJoinedCircle(circles[0]);
        await admin.addJoinedCircle(circles[2]);
        await student.addJoinedCircle(circles[0]);
        await student.addJoinedCircle(circles[3]);

        console.log('Community seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding community:', error);
    }
}

// Check if this script is being run directly
if (require.main === module) {
    sequelize.sync().then(() => {
        seedCommunity().then(() => process.exit(0));
    });
}

module.exports = seedCommunity;
