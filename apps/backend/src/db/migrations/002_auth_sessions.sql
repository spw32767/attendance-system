-- Migration 002 — auth_sessions
-- Server-side session storage for cookie-based authentication.
-- Session ids are random 32-byte tokens stored hex-encoded.

CREATE TABLE IF NOT EXISTS `auth_sessions` (
  `session_id` varchar(64) NOT NULL COMMENT 'Random session token; hex-encoded 32 bytes.',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'FK to auth_users.user_id',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `idx_auth_sessions_user_id` (`user_id`),
  KEY `idx_auth_sessions_expires_at` (`expires_at`),
  CONSTRAINT `fk_auth_sessions_user`
    FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Server-side session storage for cookie-based admin auth.';
