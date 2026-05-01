import { createUser, findUserByEmail, findUserByUsername } from "./auth.repository.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function register(username, email, password){
    const usernameFound = await findUserByUsername(username);
    if(usernameFound){
        throw new Error('username Already Exist, Please use Different one');
    } 

    const emailFound = await findUserByEmail(email);
    if(emailFound){
        throw new Error('Email Already Exist, Please use Different one');
    } 
    
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser(username, email, hashPassword);

    const jwtToken = jwt.sign({ user_id: newUser.user_id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return jwtToken;
}

export async function login(identifier, password) {
    const isEmail = identifier.includes('@')
    const user = isEmail ? await findUserByEmail(identifier): await findUserByUsername(identifier);

    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if(!isMatch){
        throw new Error('Invalid credentials');
    }

    const jwtToken = jwt.sign({ user_id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return jwtToken;
}
