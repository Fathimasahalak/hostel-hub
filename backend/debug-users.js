const { User } = require('./models');

async function checkUsers() {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}

checkUsers();
