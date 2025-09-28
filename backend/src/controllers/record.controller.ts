import type { Request, Response } from "express";
import { RecordService } from "../services/record.service";
import { sendSuccess, sendCreated } from "../utils/response";

export class RecordController {
  private recordService = new RecordService();

  getAll = async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      classId,
      paymentType,
      page = 1,
      limit = 10,
    } = req.query;

    const result = await this.recordService.getAllRecords({
      startDate: startDate as string,
      endDate: endDate as string,
      classId: classId as string,
      paymentType: paymentType as string,
      page: Number(page),
      limit: Number(limit),
    });

    sendSuccess(
      res,
      "Records retrieved successfully",
      result.records,
      result.pagination
    );
  };

  getOverallRecords = async (req: Request, res: Response) => {
    const result = await this.recordService.getOverallRecords();
    res.json(result);
  };

  getUnpaidStudents = async (req: Request, res: Response) => {
    const { date, classId } = req.query;

    const records = await this.recordService.getUnpaidStudents({
      date: date as string,
      classId: classId as string,
    });

    sendSuccess(res, "Unpaid students retrieved successfully", records);
  };
  getSubmittedRecordsByDate = async (req: Request, res: Response) => {
    const { date } = req.query;

    const records = await this.recordService.getSubmittedRecordsByDate(
      date as string
    );
    sendSuccess(res, "Submitted records retrieved successfully", records);
  };

  async getRecordDetails(req: Request, res: Response) {
    const { id } = req.query;

    const records = await this.recordService.getRecordDetails(id as string);
    sendSuccess(res, "Record details retrieved successfully", records);
  }

  getStudentRecordsByClassAndDate = async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { date } = req.query;

    const records = await this.recordService.getStudentRecordsByClassAndDate(
      Number(classId),
      date as string
    );

    sendSuccess(res, "Student records retrieved successfully", records);
  };

  generateDailyRecords = async (req: Request, res: Response) => {
    const { date, classId, id } = req.query;

    const result = await this.recordService.generateDailyRecords({
      date: date as string,
      classId: classId as string,
      adminId: id as string,
    });

    sendSuccess(res, "Daily records generated successfully", result);
  };

  submitRecord = async (req: Request, res: Response) => {
    const recordData = req.body;

    const records = await this.recordService.submitRecord(recordData);
    sendCreated(res, "Records submitted successfully", records);
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const record = await this.recordService.updateRecord(
      Number(id),
      updateData
    );
    sendSuccess(res, "Record updated successfully", record);
  };

  updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { hasPaid, isAbsent } = req.body;

    const record = await this.recordService.updateStudentStatus(Number(id), {
      hasPaid,
      isAbsent,
    });
    sendSuccess(res, "Student status updated successfully", record);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    await this.recordService.deleteRecord(Number(id));
    sendSuccess(res, "Record deleted successfully");
  };
}
