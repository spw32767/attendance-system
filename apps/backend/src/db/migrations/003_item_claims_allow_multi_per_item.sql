-- 003_item_claims_allow_multi_per_item.sql
--
-- Drops the legacy uniqueness on (submission_id, item_id) so a submission can
-- hold multiple claim rows for the same item — one per default_qty unit. Each
-- row keeps its own claim_token (still globally unique), so the QR for one
-- unit is independent of the QR for the next.
--
-- IMPORTANT: the FK fk_item_claims_submission_id relies on an index covering
-- `submission_id`. The legacy unique key (submission_id, item_id) is currently
-- that index — dropping it directly errors with #1553. So we add a plain
-- replacement index FIRST, then drop the unique key. The new plain index also
-- starts with submission_id and so satisfies the FK constraint requirement.
--
-- Idempotent: safe to run more than once.

-- 1) Ensure a non-unique index on (submission_id, item_id) exists so MySQL
--    has something to back the foreign key against.
SET @add_index := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.STATISTICS
      WHERE table_schema = DATABASE()
        AND table_name = 'item_claims'
        AND index_name = 'idx_item_claims_submission_id_item_id'
    ),
    'SELECT 1',
    'ALTER TABLE `item_claims` ADD INDEX `idx_item_claims_submission_id_item_id` (`submission_id`, `item_id`)'
  )
);
PREPARE stmt FROM @add_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Now drop the legacy unique key. The FK falls back to the plain index
--    created above.
SET @drop_unique := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.STATISTICS
      WHERE table_schema = DATABASE()
        AND table_name = 'item_claims'
        AND index_name = 'uq_item_claims_submission_id_item_id'
    ),
    'ALTER TABLE `item_claims` DROP INDEX `uq_item_claims_submission_id_item_id`',
    'SELECT 1'
  )
);
PREPARE stmt FROM @drop_unique;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
