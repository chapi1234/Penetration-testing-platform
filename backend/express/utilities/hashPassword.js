// this file is used to hash your admin password and store it in the .env file

const bcrypt = require('bcryptjs');

const hashPassword = async () => {
    const password = process.env.ADMIN_PASSWORD; // Replace with the password you want to hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed Password:", hashedPassword);
};

hashPassword();