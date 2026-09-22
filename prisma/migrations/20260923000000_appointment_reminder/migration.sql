-- Add once-only appointment reminder flag (lazy reminders in /api/state)
ALTER TABLE "Appointment" ADD COLUMN "reminderSent" BOOLEAN NOT NULL DEFAULT false;
