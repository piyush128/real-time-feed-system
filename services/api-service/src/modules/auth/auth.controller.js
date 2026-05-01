import { register, login } from "./auth.service.js";

export async function registerController(req, res) {
    try {
        const { username, email, password } = req.body;
        const token = await register(username, email, password);
        res.status(201).json({token});
    } catch (error) {
        res.status(409).json({message: error.message});
    }
}

export async function loginController(req, res) {
    try {
        const {identifier, password} = req.body;
        const token = await login(identifier, password);
        res.status(200).json({token});
    } catch (error) {
        res.status(401).json({message: error.message});
    }
}