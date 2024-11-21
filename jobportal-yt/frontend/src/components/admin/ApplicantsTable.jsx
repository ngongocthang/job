import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [interviewDetails, setInterviewDetails] = useState({
        date: '',
        time: '',
        location: ''
    });
    const [isInterviewFormVisible, setIsInterviewFormVisible] = useState(false);

    // Function to handle status change ("Accepted" or "Rejected")
    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;

            if (status === "Accepted") {
                // Show interview scheduling form
                setSelectedApplicant(id);  // Store the applicant id
                setIsInterviewFormVisible(true);  // Show interview form
            } else {
                // Update the status directly for "Rejected" or other statuses
                const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
                if (res.data.success) {
                    toast.success(res.data.message);
                }
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    // View Applicant Details (opens the modal)
    const handleViewDetails = (applicant) => {
        setSelectedApplicant(applicant);
        setIsInterviewFormVisible(false); // Hide interview form if viewing details
    };

    // Close the Applicant Details modal
    const handleCloseModal = () => {
        setSelectedApplicant(null);
        setIsInterviewFormVisible(false); // Close both forms (details and interview)
    };

    // Submit interview details for an accepted applicant
    const handleInterviewSubmit = async (e) => {
        e.preventDefault();

        if (!interviewDetails.date || !interviewDetails.time || !interviewDetails.location) {
            toast.error("Please fill all interview details.");
            return;
        }

        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${selectedApplicant}/update`, {
                status: "Accepted",
                interviewDate: interviewDetails.date,
                interviewTime: interviewDetails.time,
                interviewLocation: interviewDetails.location,
            });

            if (res.data.success) {
                toast.success("Interview details saved successfully!");
                handleCloseModal();  // Close modal after saving
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    // Handle input changes in the interview scheduling form
    const handleInterviewInputChange = (e) => {
        const { name, value } = e.target;
        setInterviewDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    return (
        <div className="space-y-6 relative">
            <Table className="shadow-lg rounded-lg overflow-hidden">
                <TableCaption>A list of your recent applied users</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>FullName</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants && applicants?.applications?.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-100">
                            <TableCell>{item?.applicant?.fullname}</TableCell>
                            <TableCell>{item?.applicant?.email}</TableCell>
                            <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                            <TableCell>
                                {item.applicant?.profile?.resume ? (
                                    <a className="text-blue-600 hover:underline" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">
                                        {item?.applicant?.profile?.resumeOriginalName}
                                    </a>
                                ) : <span>NA</span>}
                            </TableCell>
                            <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                            <TableCell className="text-right">
                                <Popover>
                                    <PopoverTrigger>
                                        <MoreHorizontal className="cursor-pointer text-gray-500 hover:text-gray-700" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-32">
                                        {shortlistingStatus.map((status, index) => (
                                            <div
                                                onClick={() => statusHandler(status, item?._id)}
                                                key={index}
                                                className="flex items-center my-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                                            >
                                                <span>{status}</span>
                                            </div>
                                        ))}
                                        {/* View Details Button */}
                                        <div
                                            onClick={() => handleViewDetails(item?.applicant)}
                                            className="flex items-center my-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 text-black text-sm"
                                        >
                                            <span>View Details</span>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </tr>
                    ))}
                </TableBody>
            </Table>

            {/* Applicant Details Modal */}
            {selectedApplicant && !isInterviewFormVisible && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white shadow-lg rounded-lg p-6 w-96">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Applicant Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium text-gray-700">Full Name:</p>
                                <p className="text-gray-600">{selectedApplicant.fullname}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Email:</p>
                                <p className="text-gray-600">{selectedApplicant.email}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Phone:</p>
                                <p className="text-gray-600">{selectedApplicant.phoneNumber}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Bio:</p>
                                <p className="text-gray-600">{selectedApplicant?.profile?.bio || 'NA'}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Skills:</p>
                                <p className="text-gray-600">
                                    {selectedApplicant?.profile?.skills?.length > 0
                                        ? selectedApplicant?.profile?.skills.join(', ')
                                        : 'NA'}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Resume:</p>
                                <p className="text-gray-600">
                                    {selectedApplicant?.profile?.resume ? (
                                        <a
                                            className="text-blue-600 hover:underline"
                                            href={selectedApplicant?.profile?.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {selectedApplicant?.profile?.resumeOriginalName}
                                        </a>
                                    ) : (
                                        'NA'
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button type="button" onClick={handleCloseModal} className="text-red-500 hover:underline">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview Scheduling Form */}
            {isInterviewFormVisible && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white shadow-lg rounded-lg p-6 w-96">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Schedule Interview</h3>
                        <form onSubmit={handleInterviewSubmit} className="space-y-4">
                            <div>
                                <label className="font-medium text-gray-700">Interview Date:</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={interviewDetails.date}
                                    onChange={handleInterviewInputChange}
                                    className="w-full border rounded p-2 mt-1"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-gray-700">Interview Time:</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={interviewDetails.time}
                                    onChange={handleInterviewInputChange}
                                    className="w-full border rounded p-2 mt-1"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-gray-700">Interview Location:</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={interviewDetails.location}
                                    onChange={handleInterviewInputChange}
                                    className="w-full border rounded p-2 mt-1"
                                />
                            </div>

                            <div className="mt-4 flex justify-end space-x-2">
                                <button type="button" onClick={handleCloseModal} className="text-red-500 hover:underline">
                                    Close
                                </button>
                                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
                                    Save Interview
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApplicantsTable;