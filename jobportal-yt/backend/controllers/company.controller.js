import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }
        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "You can't register same company.",
                success: false
            })
        };
        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const getCompany = async (req, res) => {
    try {
        const userId = req.id; // logged in user id
        const companies = await Company.find({ userId });
        if (!companies) {
            return res.status(404).json({
                message: "Companies not found.",
                success: false
            })
        }
        return res.status(200).json({
            companies,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;

        const updateData = { name, description, website, location };

        // Kiểm tra xem có file không
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            updateData.logo = cloudResponse.secure_url; // Thêm logo vào updateData
        }

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company information updated.",
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred.",
            success: false
        });
    }
}

export const deleteCompany = async (req, res) => {
    try {
        const companyId = req.params.id;

        // Find the company by ID and remove it
        const company = await Company.findByIdAndDelete(companyId);

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company deleted successfully.",
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while deleting the company.",
            success: false
        });
    }
};
export const editCompany = async (req, res) => {
    try {
        const { field, value } = req.body; // Trường cần chỉnh sửa và giá trị mới

        if (!field || value === undefined) {
            return res.status(400).json({
                message: "Invalid request. 'field' and 'value' are required.",
                success: false
            });
        }

        const allowedFields = ["name", "description", "website", "location", "logo"]; // Danh sách trường cho phép chỉnh sửa
        if (!allowedFields.includes(field)) {
            return res.status(400).json({
                message: `Field '${field}' is not allowed to update.`,
                success: false
            });
        }

        const updateData = { [field]: value };

        // Nếu trường là "logo" và cần xử lý file upload
        if (field === "logo" && req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            updateData.logo = cloudResponse.secure_url;
        }

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: `Company's ${field} updated successfully.`,
            success: true,
            data: company // Trả về thông tin mới của công ty
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred.",
            success: false
        });
    }
};
