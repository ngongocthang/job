import { Job } from "../models/job.model.js";

// admin post krega job
// export const postJob = async (req, res) => {
//     try {
//         const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
//         const userId = req.id;

//         // Check for missing fields
//         const missingFields = [];
//         if (!title) missingFields.push("title");
//         if (!description) missingFields.push("description");
//         if (!requirements) missingFields.push("requirements");
//         if (!salary) missingFields.push("salary");
//         if (!location) missingFields.push("location");
//         if (!jobType) missingFields.push("jobType");
//         if (!experience) missingFields.push("experience");
//         if (!position) missingFields.push("position");
//         if (!companyId) missingFields.push("companyId");

//         if (missingFields.length > 0) {
//             return res.status(400).json({
//                 message: `Missing required fields: ${missingFields.join(", ")}`,
//                 success: false
//             });
//         }

//         const job = await Job.create({
//             title,
//             description,
//             requirements: requirements.split(","),
//             salary: Number(salary),
//             location,
//             jobType,
//             experienceLevel: experience,
//             position,
//             company: companyId,
//             created_by: userId
//         });
//         return res.status(201).json({
//             message: "New job created successfully.",
//             job,
//             success: true
//         });
//     } catch (error) {
//         console.error(error); // Use console.error for better error logging
//         return res.status(500).json({
//             message: "An error occurred while creating the job.",
//             success: false
//         });
//     }
// }
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}

// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}


export const deleteJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        // Validate the job ID
        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false
            });
        }

        // Find and delete the job
        const deletedJob = await Job.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job deleted successfully.",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while deleting the job.",
            success: false
        });
    }
};



export const editJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        console.log("Received job ID:", jobId); // Log ID nhận được

        // Kiểm tra tính hợp lệ của jobId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID.",
                success: false
            });
        }

        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;

        // Kiểm tra xem tất cả các trường có hợp lệ không
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }

        // Chuyển đổi yêu cầu thành một mảng
        const requirementsArray = requirements.split(",").map(req => req.trim());

        const updatedJobData = {
            title,
            description,
            requirements: requirementsArray,
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId
        };

        // Cập nhật công việc trong cơ sở dữ liệu
        const updatedJob = await Job.findByIdAndUpdate(jobId, updatedJobData, { new: true });

        if (!updatedJob) {
            console.log("Job not found for ID:", jobId); // Log nếu không tìm thấy công việc
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        console.log("Job updated successfully:", updatedJob); // Log thông tin công việc đã cập nhật
        return res.status(200).json({
            message: "Job updated successfully.",
            job: updatedJob,
            success: true
        });

    } catch (error) {
        console.error("Error updating job:", error.message, error.stack); // Log lỗi chi tiết
        return res.status(500).json({
            message: "An error occurred while updating the job.",
            error: error.message,
            success: false
        });
    }
};

export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // Kiểm tra tính hợp lệ của jobId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            console.log("Invalid job ID:", jobId);
            return res.status(400).json({
                message: "Invalid job ID.",
                success: false
            });
        }

        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;

        // Kiểm tra dữ liệu truyền vào
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            console.log("Missing fields:", req.body);  // Log dữ liệu nếu thiếu trường
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }

        // Chuyển đổi yêu cầu thành mảng
        const requirementsArray = requirements.split(",").map(req => req.trim());

        const updatedJobData = {
            title,
            description,
            requirements: requirementsArray,
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId
        };

        // Cập nhật công việc trong cơ sở dữ liệu
        const updatedJob = await Job.findByIdAndUpdate(jobId, updatedJobData, { new: true });

        if (!updatedJob) {
            console.log("Job not found:", jobId); // Log nếu không tìm thấy công việc
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job updated successfully.",
            job: updatedJob,
            success: true
        });

    } catch (error) {
        console.error("Error updating job:", error.message, error.stack); // Log lỗi chi tiết
        return res.status(500).json({
            message: "An error occurred while updating the job.",
            error: error.message,
            success: false
        });
    }
};

