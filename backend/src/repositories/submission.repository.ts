import prisma from '../config/prisma';
import { SubmitAnswerDto } from '../types';

export class SubmissionRepository {
  async create(formId: string, submittedBy: string | null, answers: SubmitAnswerDto[]) {
    return prisma.$transaction(async (tx) => {
      // Create the submission record
      const submission = await tx.submission.create({
        data: {
          formId,
          submittedBy,
        },
      });

      // Create all submission answers
      if (answers.length > 0) {
        await tx.submissionAnswer.createMany({
          data: answers.map((ans) => ({
            submissionId: submission.id,
            fieldId: ans.fieldId,
            value: ans.value,
          })),
        });
      }

      return tx.submission.findUnique({
        where: { id: submission.id },
        include: {
          answers: true,
        },
      });
    });
  }

  async findAll(skip?: number, take?: number, submittedBy?: string) {
    const whereClause = submittedBy ? { submittedBy } : {};
    return prisma.submission.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        form: {
          select: {
            title: true,
          },
        },
        answers: {
          include: {
            field: {
              select: {
                label: true,
                type: true,
              },
            },
          },
        },
      },
      skip,
      take,
    });
  }

  async countAll(submittedBy?: string): Promise<number> {
    const whereClause = submittedBy ? { submittedBy } : {};
    return prisma.submission.count({
      where: whereClause,
    });
  }

  async findById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        form: true,
        answers: {
          include: {
            field: true,
          },
        },
      },
    });
  }
}
