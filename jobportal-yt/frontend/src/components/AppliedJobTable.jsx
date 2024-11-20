import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useSelector } from 'react-redux';

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);

    if (!allAppliedJobs || allAppliedJobs.length === 0) {
        return <div>You haven't applied for any jobs yet.</div>;
    }

    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Interview Date</TableHead>
                        <TableHead>Interview Time</TableHead>
                        <TableHead>Interview Location</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allAppliedJobs.map((appliedJob) => (
                        <TableRow key={appliedJob._id}>
                            {/* Date */}
                            <TableCell>{appliedJob?.createdAt ? appliedJob.createdAt.split("T")[0] : 'N/A'}</TableCell>
                            
                            {/* Job Role */}
                            <TableCell>{appliedJob?.job?.title || 'N/A'}</TableCell>
                            
                            {/* Company */}
                            <TableCell>{appliedJob?.job?.company?.name || 'N/A'}</TableCell>

                            {/* Interview Date */}
                            <TableCell>{appliedJob?.interviewDetails?.date || ''}</TableCell>

                            {/* Interview Time */}
                            <TableCell>{appliedJob?.interviewDetails?.time || ''}</TableCell>

                            {/* Interview Location */}
                            <TableCell>{appliedJob?.interviewDetails?.location || ''}</TableCell>

                            {/* Status */}
                            <TableCell className="text-right">
                                <Badge
                                    className={`${
                                        appliedJob?.status === 'rejected'
                                            ? 'bg-red-400'
                                            : appliedJob?.status === 'pending'
                                            ? 'bg-gray-400'
                                            : 'bg-green-400'
                                    }`}
                                >
                                    {appliedJob?.status ? appliedJob.status.toUpperCase() : 'N/A'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AppliedJobTable;
