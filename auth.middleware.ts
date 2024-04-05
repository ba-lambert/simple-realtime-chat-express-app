import { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decodedToken = verify(token, 'secretKey');
        req.userId = (decodedToken as any).userId;
        next();
    } catch (err) {
        console.error('Error:', err);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
