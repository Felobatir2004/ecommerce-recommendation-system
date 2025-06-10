import { asyncHandler } from "../utils/error handling/asyncHandler.js";
import { verifyToken } from "../utils/token/token.js";
import * as dbService from "../DB/dbService.js";
import { UserModel } from "../DB/Models/user.model.js";

export const tokenTypes = {
    access: "access",
    refresh: "refresh"
};

export const decodedToken = async ({ authorization = "", tokenType = tokenTypes.access, next = {} }) => {
    if (!authorization) {
        return next(new Error("Token is required", { cause: 401 }));
    }

    // Try verifying with all possible secrets
    let decoded;
    try {
        decoded = verifyToken({
            token: authorization,
            signature: process.env.ADMIN_ACCESS_TOKEN,
        });

        decoded.role = "Admin";
    } catch {
        try {
            decoded = verifyToken({
                token: authorization,
                signature: process.env.USER_ACCESS_TOKEN,
            });

            decoded.role = "User";
        } catch {
            return next(new Error("Invalid token", { cause: 401 }));
        }
    }

    // Get user from DB
    const user = await dbService.findOne({ model: UserModel, filter: { _id: decoded.id, isDeleted: false } });
    if (!user) return next(new Error("User Not Found", { cause: 404 }));

    if (user.changeCredentials?.getTime >= decoded.iat * 1000)
        return next(new Error("Token expired due to credentials change", { cause: 400 }));

    return user;
};

export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers;

        req.user = await decodedToken({
            authorization,
            tokenType: tokenTypes.access,
            next,
        });

        return next();
    });
};

export const allowTo = (role = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!role.includes(req.user.role)) {
            return next(new Error("Unauthorized", { cause: 403 }));
        }
        return next();
    });
};
