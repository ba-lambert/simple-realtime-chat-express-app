import userModel from "../model/user.model";
import {hash,compare} from 'bcrypt';
import { Request,Response } from "express";
import jwt from "jsonwebtoken";
export const signup = async (req:Request,res:Response)=>{
    try{
        const userData = req.body
    const salt = 10;
    const hashedPassword = await hash(userData.password,salt)
    const newUser = new userModel({...userData,password:hashedPassword})
    await newUser.save();
    return res.status(201).json({user:newUser});
    }catch(err){
        throw new Error('err'+err);
    }    
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.password) {
            return res.status(500).json({ error: 'Something went wrong' });
        }
        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = jwt.sign({ userId: user._id,username:user.username }, 'secretKey', { expiresIn: '1h' });

        return res.status(200).json({ token });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}