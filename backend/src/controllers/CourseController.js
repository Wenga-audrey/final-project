import { z } from "zod";
import { BaseController } from "./BaseController.js";
import { CourseModel } from "../models/CourseModel.js";

const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  thumbnail: z.string().url().optional(),
  examType: z.string().min(1, "Exam type is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
});

const updateCourseSchema = createCourseSchema.partial();

const enrollSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

export class CourseController extends BaseController {
  getAllCourses = this.asyncHandler(async (req, res) => {
    try {
      const { examType, level, search, published } = req.query;

      const filters = {};
      if (examType) filters.examType = examType;
      if (level) filters.level = level;
      if (search) filters.search = search;
      if (published !== undefined) filters.isPublished = published === "true";

      const courses = await CourseModel.findAll(filters);

      return this.handleSuccess(res, { courses });
    } catch (error) {
      return this.handleServerError(res, error);
    }
  });

  getCourseById = this.asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const includeUnpublished =
        req.user?.role === "SUPER_ADMIN" ||
        req.user?.role === "SUPER_ADMIN";

      const course = await CourseModel.findById(id, includeUnpublished);

      if (!course) {
        return this.handleError(res, "Course not found", 404);
      }

      return this.handleSuccess(res, { course });
    } catch (error) {
      return this.handleServerError(res, error);
    }
  });

  createCourse = this.asyncHandler(async (req, res) => {
    try {
      const validatedData = this.validateRequest(createCourseSchema, req.body);

      const course = await CourseModel.create(validatedData);

      return this.handleSuccess(
        res,
        { course },
        "Course created successfully",
        201,
      );
    } catch (error) {
      return this.handleError(res, error.message);
    }
  });

  updateCourse = this.asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = this.validateRequest(updateCourseSchema, req.body);

      const course = await CourseModel.update(id, validatedData);

      return this.handleSuccess(res, { course }, "Course updated successfully");
    } catch (error) {
      if (error.code === "P2025") {
        return this.handleError(res, "Course not found", 404);
      }
      return this.handleError(res, error.message);
    }
  });

  deleteCourse = this.asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      await CourseModel.delete(id);

      return this.handleSuccess(res, null, "Course deleted successfully");
    } catch (error) {
      if (error.code === "P2025") {
        return this.handleError(res, "Course not found", 404);
      }
      return this.handleError(res, error.message);
    }
  });

  enrollInCourse = this.asyncHandler(
    async (req, res) => {
      try {
        const { id: courseId } = req.params;
        const userId = req.user.id;

        const trial =
          req.query.trial === "true" ||
          (req.body && req.body.trial === true);
        const trialDays = req.body?.trialDays
          ? Number(req.body.trialDays)
          : undefined;

        const enrollment = await CourseModel.enroll(userId, courseId, {
          trial,
          trialDays,
        });

        return this.handleSuccess(
          res,
          { enrollment },
          "Successfully enrolled in course",
          201,
        );
      } catch (error) {
        if (error.message === "Already enrolled in this course") {
          return this.handleError(res, error.message, 409);
        }
        return this.handleError(res, error.message);
      }
    },
  );

  getUserCourses = this.asyncHandler(
    async (req, res) => {
      try {
        const userId = req.user.id;

        const enrollments = await CourseModel.getUserCourses(userId);

        return this.handleSuccess(res, { enrollments });
      } catch (error) {
        return this.handleServerError(res, error);
      }
    },
  );

  getCourseProgress = this.asyncHandler(
    async (req, res) => {
      try {
        const { id: courseId } = req.params;
        const userId = req.user.id;

        const enrollment = await CourseModel.getEnrollment(userId, courseId);

        if (!enrollment) {
          return this.handleError(res, "Not enrolled in this course", 404);
        }

        return this.handleSuccess(res, { enrollment });
      } catch (error) {
        return this.handleServerError(res, error);
      }
    },
  );

  updateCourseProgress = this.asyncHandler(
    async (req, res) => {
      try {
        const { id: courseId } = req.params;
        const userId = req.user.id;

        const progressSchema = z.object({
          progress: z.number().min(0).max(100),
        });

        const { progress } = this.validateRequest(progressSchema, req.body);

        const enrollment = await CourseModel.updateProgress(
          userId,
          courseId,
          progress,
        );

        return this.handleSuccess(
          res,
          { enrollment },
          "Progress updated successfully",
        );
      } catch (error) {
        if (error.code === "P2025") {
          return this.handleError(res, "Enrollment not found", 404);
        }
        return this.handleError(res, error.message);
      }
    },
  );

  getPopularCourses = this.asyncHandler(async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const courses = await CourseModel.getPopularCourses(limit);

      return this.handleSuccess(res, { courses });
    } catch (error) {
      return this.handleServerError(res, error);
    }
  });

  getRecommendedCourses = this.asyncHandler(
    async (req, res) => {
      try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;

        const courses = await CourseModel.getRecommendedCourses(userId, limit);

        return this.handleSuccess(res, { courses });
      } catch (error) {
        return this.handleServerError(res, error);
      }
    },
  );
}
