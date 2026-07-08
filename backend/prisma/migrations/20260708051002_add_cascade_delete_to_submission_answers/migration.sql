-- DropForeignKey
ALTER TABLE "submission_answers" DROP CONSTRAINT "submission_answers_field_id_fkey";

-- AddForeignKey
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
