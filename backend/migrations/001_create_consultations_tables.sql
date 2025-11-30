-- Migration pour créer les tables de consultations et ordonnances médicales
-- Créée le: 2025-11-07

-- Table des consultations médicales
CREATE TABLE IF NOT EXISTS `consultations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_name` varchar(255) NOT NULL COMMENT 'Nom du patient',
  `patient_phone` varchar(20) DEFAULT NULL COMMENT 'Téléphone du patient',
  `patient_age` int(11) DEFAULT NULL COMMENT 'Âge du patient',
  `patient_gender` enum('M','F','OTHER') DEFAULT NULL COMMENT 'Genre du patient',
  `consultation_date` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Date de la consultation',
  `symptoms` text DEFAULT NULL COMMENT 'Symptômes du patient',
  `diagnosis` text DEFAULT NULL COMMENT 'Diagnostic',
  `notes` text DEFAULT NULL COMMENT 'Notes médicales',
  `doctor_id` int(11) NOT NULL COMMENT 'ID du médecin',
  `site_id` int(11) DEFAULT NULL COMMENT 'ID du site',
  `status` enum('COMPLETED','CANCELLED') DEFAULT 'COMPLETED' COMMENT 'Statut de la consultation',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_doctor_id` (`doctor_id`),
  KEY `idx_site_id` (`site_id`),
  KEY `idx_consultation_date` (`consultation_date`),
  KEY `idx_patient_name` (`patient_name`),
  CONSTRAINT `consultations_doctor_fk` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultations_site_fk` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table des consultations médicales';

-- Table des ordonnances médicales (créées par les docteurs)
CREATE TABLE IF NOT EXISTS `medical_prescriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consultation_id` int(11) DEFAULT NULL COMMENT 'ID de la consultation associée',
  `patient_name` varchar(255) NOT NULL COMMENT 'Nom du patient',
  `patient_phone` varchar(20) DEFAULT NULL COMMENT 'Téléphone du patient',
  `prescribed_date` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Date de prescription',
  `doctor_id` int(11) NOT NULL COMMENT 'ID du médecin prescripteur',
  `site_id` int(11) DEFAULT NULL COMMENT 'ID du site',
  `notes` text DEFAULT NULL COMMENT 'Notes de prescription',
  `status` enum('ACTIVE','FULFILLED','CANCELLED') DEFAULT 'ACTIVE' COMMENT 'Statut de l''ordonnance',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_consultation_id` (`consultation_id`),
  KEY `idx_doctor_id` (`doctor_id`),
  KEY `idx_site_id` (`site_id`),
  KEY `idx_prescribed_date` (`prescribed_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `medical_prescriptions_consultation_fk` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `medical_prescriptions_doctor_fk` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medical_prescriptions_site_fk` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table des ordonnances médicales créées par les docteurs';

-- Table des éléments d'ordonnances médicales
CREATE TABLE IF NOT EXISTS `medical_prescription_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `medical_prescription_id` int(11) NOT NULL COMMENT 'ID de l''ordonnance médicale',
  `medication_id` int(11) NOT NULL COMMENT 'ID du médicament',
  `quantity` int(11) NOT NULL COMMENT 'Quantité prescrite',
  `dosage` varchar(500) DEFAULT NULL COMMENT 'Posologie',
  `duration` varchar(100) DEFAULT NULL COMMENT 'Durée du traitement',
  `instructions` text DEFAULT NULL COMMENT 'Instructions de prise',
  `notes` text DEFAULT NULL COMMENT 'Notes additionnelles',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_medical_prescription_id` (`medical_prescription_id`),
  KEY `idx_medication_id` (`medication_id`),
  CONSTRAINT `medical_prescription_items_prescription_fk` FOREIGN KEY (`medical_prescription_id`) REFERENCES `medical_prescriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medical_prescription_items_medication_fk` FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table des éléments d''ordonnances médicales';

