-- 003_item_claims_allow_multi_per_item.sql
--
-- Drops the legacy uniqueness on (submission_id, item_id) so a submission can
-- hold multiple claim rows for the same item — one per default_qty unit. Each
-- row keeps its own claim_token (still globally unique), so the QR for one
-- unit is independent of the QR for the next.
--
-- Replaces the unique key with a plain index so existing lookups stay fast.
--
-- Idempotent: safe to run more than once.

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
