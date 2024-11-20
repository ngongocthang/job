import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

const validateFields = (fields) => {
    const missingFields = fields.filter(field => !field.value).map(field => field.name);
    return missingFields.length > 0 ? missingFields : null;
}

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        // Validate required fields
        const missingFields = validateFields([
            { name: "fullname", value: fullname },
            { name: "email", value: email },
            { name: "phoneNumber", value: phoneNumber },
            { name: "password", value: password },
            { name: "role", value: role },
        ]);

        if (missingFields) {
            return res.status(400).json({
                message: `Missing fields: ${missingFields.join(', ')}`,
                success: false
            });
        }

        const file = req.file;

        let profilePhotoUrl = null;
        // Check if a file was uploaded
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email.',
                success: false,
            });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl, // Can be null if no file was uploaded
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}


export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const missingFields = validateFields([
            { name: "email", value: email },
            { name: "password", value: password },
            { name: "role", value: role },
        ]);

        if (missingFields) {
            return res.status(400).json({
                message: `Missing fields: ${missingFields.join(', ')}`,
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            });
        }

        const tokenData = { userId: user._id };
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });

        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200)
            .cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
            .json({
                message: `Welcome back ${userResponse.fullname}`,
                user: userResponse,
                success: true
            });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200)
            .cookie("token", "", { maxAge: 0 })
            .json({
                message: "Logged out successfully.",
                success: true
            });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const userId = req.id; // middleware authentication
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;

        if (skills) {
            user.profile.skills = skills.split(",");
        }

        const file = req.file;
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            user.profile.resume = cloudResponse.secure_url; // Save the cloudinary URL
            user.profile.resumeOriginalName = file.originalname; // Save the original file name
        }

        await user.save();

        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: userResponse,
            success: true
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}
