-- MySQL Schema for Problem Statements Table
-- This table stores all problem statement submissions from organizations

CREATE TABLE IF NOT EXISTS `problem_statements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'draft') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT NULL,
  `reviewed_by` INT NULL,
  `reviewed_at` DATETIME NULL,
  
  -- Section A: Basic Organisation Details - Public
  `organisation_name` VARCHAR(255) NOT NULL,
  `organisation_type` ENUM('NGO', 'Government', 'Startup', 'Community Group', 'Individual', 'Other') NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `city_region` VARCHAR(100) NOT NULL,
  `website` VARCHAR(255) NULL,
  `primary_contact_name` VARCHAR(255) NOT NULL,
  `contact_email` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(20) NOT NULL,
  `short_description` TEXT NOT NULL,
  `key_focus_areas` TEXT NULL,
  
  -- Section A: Confidential
  `registration_number` VARCHAR(100) NULL,
  `years_of_operation` VARCHAR(50) NULL,
  `team_size` VARCHAR(50) NULL,
  `funding_sources` TEXT NULL,
  `previous_collaborations` TEXT NULL,
  `sensitivities` TEXT NULL,
  
  -- Section B: Problem Statement Overview - Public
  `problem_title` VARCHAR(255) NOT NULL,
  `one_line_summary` VARCHAR(500) NOT NULL,
  `detailed_description` TEXT NOT NULL,
  `who_is_affected` TEXT NOT NULL,
  `geographic_context` ENUM('Rural', 'Urban', 'Tribal', 'Coastal', 'Forest', 'Industrial') NOT NULL,
  `why_important_now` TEXT NOT NULL,
  `expected_impact` TEXT NOT NULL,
  
  -- Section B: Confidential
  `root_causes` TEXT NULL,
  `previous_attempts` TEXT NULL,
  `hidden_constraints` TEXT NULL,
  `stakeholder_conflicts` TEXT NULL,
  `risks` TEXT NULL,
  
  -- Section C: SDG and Thematic Alignment - Public
  `relevant_sdgs` JSON NOT NULL,
  `sector_category` VARCHAR(255) NOT NULL,
  `beneficiary_groups` TEXT NOT NULL,
  
  -- Section C: Confidential
  `real_priority` TEXT NULL,
  `political_alignment` TEXT NULL,
  
  -- Section D: Field Context and Access - Public
  `field_locations` TEXT NULL,
  `site_visits_available` ENUM('Yes', 'No') NULL,
  `local_coordinator_available` ENUM('Yes', 'No') NULL,
  `languages_spoken` VARCHAR(255) NULL,
  `number_of_beneficiaries` VARCHAR(100) NULL,
  
  -- Section D: Confidential
  `safety_considerations` TEXT NULL,
  `cultural_protocols` TEXT NULL,
  `local_power_structures` TEXT NULL,
  `restricted_areas` TEXT NULL,
  
  -- Section E: Data and Resources - Public
  `data_types_available` TEXT NULL,
  `tools_infrastructure` TEXT NULL,
  `long_term_collaboration` ENUM('Yes', 'No') NULL,
  
  -- Section E: Confidential
  `data_sensitivity_level` ENUM('Low', 'Moderate', 'High') NULL,
  `nda_required` TEXT NULL,
  `internal_datasets` TEXT NULL,
  
  -- Section F: Expectations from REACT - Public
  `support_type` JSON NOT NULL,
  `expected_outcomes` TEXT NOT NULL,
  `preferred_timeline` VARCHAR(255) NOT NULL,
  
  -- Section F: Confidential
  `budget_expectations` TEXT NULL,
  `decision_making_authority` TEXT NULL,
  `internal_expectations` TEXT NULL,
  
  -- Section G: Ethics and Consent - Public
  `consent_share_with_students` ENUM('Yes', 'No') NOT NULL,
  `consent_publish_outcomes` ENUM('Yes', 'No') NOT NULL,
  
  -- Section G: Confidential
  `legal_ethical_approvals` TEXT NULL,
  `sensitive_communities` TEXT NULL,
  
  -- Section H: Supporting Materials - Public
  `media_links` TEXT NULL,
  
  -- Section H: Confidential
  `internal_reports` TEXT NULL,
  `field_notes` TEXT NULL,
  
  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewed_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
  
  -- Indexes for better query performance
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_organisation_type` (`organisation_type`),
  INDEX `idx_geographic_context` (`geographic_context`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_reviewed_at` (`reviewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing uploaded images (separate table for better normalization)
CREATE TABLE IF NOT EXISTS `problem_statement_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `problem_statement_id` INT NOT NULL,
  `image_path` VARCHAR(500) NOT NULL,
  `image_name` VARCHAR(255) NOT NULL,
  `image_size` INT NULL,
  `image_type` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`problem_statement_id`) REFERENCES `problem_statements`(`id`) ON DELETE CASCADE,
  INDEX `idx_problem_statement_id` (`problem_statement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing uploaded documents/reports
CREATE TABLE IF NOT EXISTS `problem_statement_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `problem_statement_id` INT NOT NULL,
  `document_path` VARCHAR(500) NOT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `document_size` INT NULL,
  `document_type` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`problem_statement_id`) REFERENCES `problem_statements`(`id`) ON DELETE CASCADE,
  INDEX `idx_problem_statement_id` (`problem_statement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
