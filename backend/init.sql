-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 07 nov. 2025 à 14:13
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `db_funtoasmie`
--

-- --------------------------------------------------------

--
-- Structure de la table `company`
--

CREATE TABLE `company` (
  `id` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `address` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mail` varchar(200) NOT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `company`
--

INSERT INTO `company` (`id`, `name`, `address`, `city`, `phone`, `mail`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'GALANA RAFFINERIE TERMINAL SA', 'Galana Ra', 'Toamasina', NULL, 'contact.gr@gr.com', 0, '2025-10-27 12:43:39', '2025-10-27 13:43:37'),
(2, 'CONCENTRIX', 'Concentrix', 'Toamasina', '0378676609', 'contact@concetrix.com', 1, '2025-10-27 12:53:58', '2025-10-27 12:53:58');

-- --------------------------------------------------------

--
-- Structure de la table `distributions`
--

CREATE TABLE `distributions` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `distribution_date` timestamp NULL DEFAULT NULL,
  `status` enum('PENDING','DISTRIBUTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `user_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `distributions`
--

INSERT INTO `distributions` (`id`, `site_id`, `distribution_date`, `status`, `user_id`, `notes`, `created_at`, `updated_at`) VALUES
(34, 1, '2025-10-08 12:13:10', 'DISTRIBUTED', 16, NULL, '2025-10-08 12:13:00', '2025-10-08 12:13:10'),
(35, 2, '2025-10-08 13:14:55', 'DISTRIBUTED', 16, NULL, '2025-10-08 13:14:46', '2025-10-08 13:14:55'),
(36, 2, '2025-10-08 14:09:07', 'DISTRIBUTED', 16, NULL, '2025-10-08 14:08:59', '2025-10-08 14:09:07'),
(37, 1, '2025-10-09 08:58:10', 'DISTRIBUTED', 16, NULL, '2025-10-09 08:57:53', '2025-10-09 08:58:10'),
(38, 5, '2025-10-09 08:59:22', 'DISTRIBUTED', 16, NULL, '2025-10-09 08:59:14', '2025-10-09 08:59:22'),
(39, 2, '2025-10-13 08:59:20', 'DISTRIBUTED', 16, NULL, '2025-10-13 08:59:05', '2025-10-13 08:59:20'),
(40, 2, '2025-10-13 09:00:01', 'DISTRIBUTED', 16, NULL, '2025-10-13 08:59:55', '2025-10-13 09:00:01'),
(41, 2, '2025-10-13 09:00:50', 'DISTRIBUTED', 16, NULL, '2025-10-13 09:00:45', '2025-10-13 09:00:50');

-- --------------------------------------------------------

--
-- Structure de la table `distribution_items`
--

CREATE TABLE `distribution_items` (
  `id` int(11) NOT NULL,
  `distribution_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `distribution_items`
--

INSERT INTO `distribution_items` (`id`, `distribution_id`, `medication_id`, `quantity`, `created_at`, `updated_at`) VALUES
(42, 34, 25, 100, '2025-10-08 12:13:00', '2025-10-08 12:13:00'),
(43, 35, 23, 15, '2025-10-08 13:14:46', '2025-10-08 13:14:46'),
(44, 35, 5, 15, '2025-10-08 13:14:46', '2025-10-08 13:14:46'),
(45, 35, 22, 147, '2025-10-08 13:14:46', '2025-10-08 13:14:46'),
(46, 36, 17, 122, '2025-10-08 14:08:59', '2025-10-08 14:08:59'),
(47, 37, 25, 100, '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
(48, 37, 2, 100, '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
(49, 37, 24, 100, '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
(50, 37, 19, 100, '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
(51, 37, 23, 100, '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
(52, 37, 18, 100, '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
(53, 37, 7, 100, '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
(54, 38, 25, 100, '2025-10-09 08:59:14', '2025-10-09 08:59:14'),
(55, 38, 7, 110, '2025-10-09 08:59:14', '2025-10-09 08:59:14'),
(56, 39, 17, 1000, '2025-10-13 08:59:05', '2025-10-13 08:59:05'),
(57, 39, 22, 150, '2025-10-13 08:59:05', '2025-10-13 08:59:05'),
(58, 40, 23, 1000, '2025-10-13 08:59:55', '2025-10-13 08:59:55'),
(59, 41, 5, 100, '2025-10-13 09:00:45', '2025-10-13 09:00:45');

-- --------------------------------------------------------

--
-- Structure de la table `medications`
--

CREATE TABLE `medications` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Nom du médicament',
  `description` text DEFAULT NULL COMMENT 'Description du médicament',
  `quantity` int(11) NOT NULL DEFAULT 0 COMMENT 'Quantité en stock',
  `min_stock` int(11) NOT NULL DEFAULT 10 COMMENT 'Stock minimum requis',
  `unit_name` varchar(50) DEFAULT 'unités' COMMENT 'Unité de mesure (unités, boîtes, etc.)',
  `category_id` int(11) DEFAULT NULL COMMENT 'ID de la catégorie',
  `category_name` varchar(100) DEFAULT NULL COMMENT 'Nom de la catégorie',
  `price` decimal(10,2) DEFAULT NULL COMMENT 'Prix unitaire',
  `supplier` varchar(255) DEFAULT NULL COMMENT 'Fournisseur',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('ACTIVE','INACTIVE','DISCONTINUED') DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `medications`
--

INSERT INTO `medications` (`id`, `name`, `description`, `quantity`, `min_stock`, `unit_name`, `category_id`, `category_name`, `price`, `supplier`, `created_at`, `updated_at`, `status`) VALUES
(1, 'Paracétamol 500mg', 'Antalgique et antipyrétique', 7000, 20, 'comprimés', 2, 'Analgésiques', 200.00, '', '2025-09-25 11:45:00', '2025-10-06 09:07:43', 'ACTIVE'),
(2, 'Amoxicilline 1g', 'Antibiotique à large spectre', 3400, 15, 'gélules', 1, 'Antibiotiques', 200.00, '', '2025-09-25 11:45:00', '2025-10-09 08:57:53', 'ACTIVE'),
(3, 'Vitamine D3', 'Complément vitaminique', 860, 30, 'flacons', 4, 'Vitamines', 12000.00, '', '2025-09-25 11:45:00', '2025-10-27 08:43:34', 'ACTIVE'),
(4, 'Aspirine 100mg', 'Anti-inflammatoire', 1360, 25, 'boîtes', 0, 'Analgésiques', 320.00, '', '2025-09-25 11:45:00', '2025-10-09 08:56:31', 'ACTIVE'),
(5, 'Loratadine 10mg', 'Antihistaminique', 2635, 18, 'plaquettes', 3, 'Antihistaminiques', 15000.00, '', '2025-09-25 11:45:00', '2025-10-13 09:00:45', 'ACTIVE'),
(6, 'Oméprazole 20mg', 'Inhibiteur de la pompe à protons', 100, 22, 'gélules', 7, 'Gastro-entérologie', 200.00, '', '2025-09-25 11:45:00', '2025-10-07 06:51:03', 'ACTIVE'),
(7, 'Atorvastatine 20mg', 'Statine pour le cholestérol', 10290, 15, 'boîtes', 5, 'Cardiovasculaires', 150.00, '', '2025-09-25 11:45:00', '2025-10-09 08:59:14', 'ACTIVE'),
(8, 'Crème Hydrocortisone', 'Corticoïde topique', 1100, 12, 'tubes', 6, 'Dermatologiques', 4400.00, '', '2025-09-25 11:45:00', '2025-10-06 09:21:49', 'ACTIVE'),
(17, 'Amaday 10 mg', NULL, 18718, 10, 'comprimés', 2, 'Analgésiques', 1000.00, '', '2025-09-25 13:58:03', '2025-10-13 08:59:05', 'ACTIVE'),
(18, 'Prédinisolone 25 mg', NULL, 1400, 10, 'comprimés', 2, 'Analgésiques', 100.00, '', '2025-09-25 18:51:58', '2025-10-09 08:57:53', 'ACTIVE'),
(19, 'Paracetamol 250 mg', NULL, 15291, 10, 'comprimés', 2, 'Analgésiques', 200.00, '', '2025-09-25 18:52:46', '2025-10-09 08:57:53', 'ACTIVE'),
(22, 'Pertamol', NULL, 21463, 10, 'unités', 2, 'Analgésiques', 15000.00, NULL, '2025-10-01 07:09:14', '2025-10-13 08:59:05', 'ACTIVE'),
(23, 'Magné B6', NULL, 3000, 10, 'ampoules', 4, 'Vitamines', 1500.00, NULL, '2025-10-01 10:42:35', '2025-10-27 08:43:34', 'ACTIVE'),
(24, 'CA C1000', NULL, 12400, 10, 'unités', 4, 'Vitamines', 1500.00, NULL, '2025-10-06 06:53:09', '2025-10-09 08:57:53', 'ACTIVE'),
(25, 'ACIVIR ACICLOVIR 5% CREME', NULL, 19800, 10, 'tubes', 6, 'Dermatologiques', 2500.00, '', '2025-10-06 08:53:27', '2025-10-09 08:59:14', 'ACTIVE');

-- --------------------------------------------------------

--
-- Structure de la table `medication_categories`
--

CREATE TABLE `medication_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Nom de la catégorie',
  `description` text DEFAULT NULL COMMENT 'Description de la catégorie',
  `color` varchar(7) DEFAULT '#007bff' COMMENT 'Couleur hexadécimale pour l''affichage',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `medication_categories`
--

INSERT INTO `medication_categories` (`id`, `name`, `description`, `color`, `created_at`, `updated_at`) VALUES
(1, 'Antibiotiques', 'Médicaments antibactériens', '#dc3545', '2025-09-25 11:51:49', '2025-09-25 11:51:49'),
(2, 'Analgésiques', 'Médicaments contre la douleur', '#28a745', '2025-09-25 11:51:49', '2025-09-25 11:51:49'),
(3, 'Antihistaminiques', 'Médicaments contre les allergies', '#ffc107', '2025-09-25 11:51:49', '2025-09-25 11:51:49'),
(4, 'Vitamines', 'Compléments vitaminiques', '#17a2b8', '2025-09-25 11:51:49', '2025-09-25 11:51:49'),
(5, 'Cardiovasculaires', 'Médicaments pour le cœur', '#6f42c1', '2025-09-25 11:51:49', '2025-09-25 11:51:49'),
(6, 'Dermatologiques', 'Médicaments pour la peau', '#fd7e14', '2025-09-25 11:51:49', '2025-09-25 11:51:49'),
(7, 'Gastro-entérologie', 'Médicaments digestifs', '#20c997', '2025-09-25 11:51:49', '2025-09-25 11:51:49'),
(8, 'Neurologie', 'Médicaments neurologiques', '#6c757d', '2025-09-25 11:51:49', '2025-09-25 11:51:49');

-- --------------------------------------------------------

--
-- Structure de la table `migrations_history`
--

CREATE TABLE `migrations_history` (
  `id` int(11) NOT NULL,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `migrations_history`
--

INSERT INTO `migrations_history` (`id`, `migration_name`, `executed_at`) VALUES
(1, '006_modify_distributions_for_grouped.sql', '2025-09-30 14:19:28');

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `status` enum('PENDING','APPROVED','IN_TRANSIT','DELIVERED','CANCELLED') DEFAULT 'PENDING',
  `order_date` datetime DEFAULT current_timestamp(),
  `delivery_date` datetime DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`id`, `supplier_id`, `order_number`, `status`, `order_date`, `delivery_date`, `user_id`, `notes`, `created_at`, `updated_at`) VALUES
(46, 1, 'CMD-20251007-809', 'DELIVERED', '2025-10-07 09:47:45', '2025-10-07 09:49:17', 16, NULL, '2025-10-07 06:47:45', '2025-10-07 06:49:17'),
(47, 1, 'CMD-20251008-902', 'DELIVERED', '2025-10-08 15:14:21', '2025-10-08 15:14:48', 16, NULL, '2025-10-08 12:14:21', '2025-10-08 12:14:48'),
(48, 1, 'CMD-20251009-583', 'DELIVERED', '2025-10-09 11:55:14', '2025-10-09 11:56:31', 16, NULL, '2025-10-09 08:55:14', '2025-10-09 08:56:31'),
(49, 1, 'CMD-20251027-599', 'DELIVERED', '2025-10-27 11:41:05', '2025-10-27 11:43:34', 16, NULL, '2025-10-27 08:41:05', '2025-10-27 08:43:34');

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `medication_id`, `quantity`, `created_at`) VALUES
(66, 46, 2, 1500, '2025-10-07 06:47:59'),
(67, 46, 24, 1500, '2025-10-07 06:48:12'),
(68, 46, 18, 1310, '2025-10-07 06:48:40'),
(69, 46, 22, 799, '2025-10-07 06:49:06'),
(70, 47, 25, 10000, '2025-10-08 12:14:33'),
(71, 48, 25, 10000, '2025-10-09 08:55:22'),
(72, 48, 17, 100, '2025-10-09 08:55:30'),
(73, 48, 2, 1000, '2025-10-09 08:55:37'),
(74, 48, 7, 10000, '2025-10-09 08:55:46'),
(75, 48, 4, 1000, '2025-10-09 08:55:54'),
(76, 48, 24, 10000, '2025-10-09 08:56:02'),
(77, 48, 5, 1000, '2025-10-09 08:56:10'),
(78, 48, 22, 1000, '2025-10-09 08:56:21'),
(79, 49, 3, 100, '2025-10-27 08:41:40'),
(80, 49, 23, 105, '2025-10-27 08:42:28');

-- --------------------------------------------------------

--
-- Structure de la table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` int(11) NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_phone` varchar(20) DEFAULT NULL,
  `medication_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `dosage` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('PENDING','PREPARING','PREPARED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `site_id` int(11) NOT NULL,
  `pharmacist_id` int(11) NOT NULL,
  `prescribed_date` datetime DEFAULT current_timestamp(),
  `prepared_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `patient_name`, `patient_phone`, `medication_id`, `quantity`, `dosage`, `notes`, `status`, `site_id`, `pharmacist_id`, `prescribed_date`, `prepared_date`, `created_at`, `updated_at`) VALUES
(1, 'HTEFF', NULL, 17, 10, NULL, NULL, 'PREPARED', 2, 1, '2025-10-10 18:03:45', '2025-10-27 14:40:45', '2025-10-10 18:03:45', '2025-10-27 14:40:45'),
(2, 'Funtest', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 2, 1, '2025-10-13 09:41:47', '2025-10-13 11:32:14', '2025-10-13 09:41:47', '2025-10-13 11:32:14'),
(3, 'Kiagra', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 2, 19, '2025-10-13 09:54:41', '2025-10-13 12:01:54', '2025-10-13 09:54:41', '2025-10-13 12:01:54'),
(4, 'tiana', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 2, 1, '2025-10-13 11:11:41', '2025-10-13 11:26:26', '2025-10-13 11:11:41', '2025-10-13 11:26:26'),
(5, 'Lolito', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-13 11:38:55', '2025-10-13 11:39:53', '2025-10-13 11:38:55', '2025-10-13 11:39:53'),
(6, 'TAHINA', '0321545666', NULL, NULL, NULL, NULL, 'PREPARED', 1, 19, '2025-10-13 19:28:30', '2025-10-13 19:28:40', '2025-10-13 19:28:30', '2025-10-13 19:28:40'),
(7, 'gdd', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-15 09:17:03', '2025-10-15 09:17:31', '2025-10-15 09:17:03', '2025-10-15 09:17:31'),
(8, 'Lolito', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-15 09:17:25', '2025-10-15 09:17:29', '2025-10-15 09:17:25', '2025-10-15 09:17:29'),
(9, 'Lolito', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-15 09:17:50', '2025-10-15 09:17:52', '2025-10-15 09:17:50', '2025-10-15 09:17:52'),
(10, 'Lolito', '0386739173', NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-15 09:21:50', '2025-10-15 09:21:57', '2025-10-15 09:21:50', '2025-10-15 09:21:57'),
(11, 'Jean Dupont', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-15 09:32:45', '2025-10-15 09:32:51', '2025-10-15 09:32:45', '2025-10-15 09:32:51'),
(12, 'Jean Dupont', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-15 09:43:16', '2025-10-15 09:43:49', '2025-10-15 09:43:16', '2025-10-15 09:43:49'),
(13, 'Vola', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-20 08:56:12', '2025-10-20 08:56:25', '2025-10-20 08:56:12', '2025-10-20 08:56:25'),
(14, 'Jean Jacques', '0321514556', NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-20 10:48:33', '2025-10-20 10:48:36', '2025-10-20 10:48:33', '2025-10-20 10:48:36'),
(15, 'tahina', NULL, NULL, NULL, NULL, NULL, 'PREPARED', 1, 1, '2025-10-22 10:15:24', '2025-10-22 10:15:31', '2025-10-22 10:15:24', '2025-10-22 10:15:31');

-- --------------------------------------------------------

--
-- Structure de la table `prescription_items`
--

CREATE TABLE `prescription_items` (
  `id` int(11) NOT NULL,
  `prescription_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `dosage` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `prescription_items`
--

INSERT INTO `prescription_items` (`id`, `prescription_id`, `medication_id`, `quantity`, `dosage`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 17, 12, NULL, NULL, '2025-10-13 09:41:47', '2025-10-13 09:41:47'),
(2, 2, 23, 15, NULL, NULL, '2025-10-13 09:41:47', '2025-10-13 09:41:47'),
(3, 3, 17, 112, NULL, NULL, '2025-10-13 09:54:41', '2025-10-13 09:54:41'),
(4, 3, 23, 5, NULL, NULL, '2025-10-13 09:54:41', '2025-10-13 09:54:41'),
(5, 4, 17, 12, NULL, NULL, '2025-10-13 11:11:41', '2025-10-13 11:11:41'),
(6, 5, 25, 10, NULL, NULL, '2025-10-13 11:38:55', '2025-10-13 11:38:55'),
(7, 6, 7, 10, NULL, NULL, '2025-10-13 19:28:30', '2025-10-13 19:28:30'),
(8, 6, 23, 10, NULL, NULL, '2025-10-13 19:28:30', '2025-10-13 19:28:30'),
(9, 7, 25, 10, NULL, NULL, '2025-10-15 09:17:03', '2025-10-15 09:17:03'),
(10, 8, 25, 10, NULL, NULL, '2025-10-15 09:17:25', '2025-10-15 09:17:25'),
(11, 9, 25, 100, NULL, NULL, '2025-10-15 09:17:50', '2025-10-15 09:17:50'),
(12, 10, 25, 1000, NULL, NULL, '2025-10-15 09:21:50', '2025-10-15 09:21:50'),
(13, 11, 25, 10, '1x nuit', NULL, '2025-10-15 09:32:45', '2025-10-15 09:32:45'),
(14, 11, 18, 10, '2 x3/j', NULL, '2025-10-15 09:32:45', '2025-10-15 09:32:45'),
(15, 12, 25, 10, NULL, NULL, '2025-10-15 09:43:16', '2025-10-15 09:43:16'),
(16, 12, 2, 10, NULL, NULL, '2025-10-15 09:43:16', '2025-10-15 09:43:16'),
(17, 12, 19, 10, NULL, NULL, '2025-10-15 09:43:16', '2025-10-15 09:43:16'),
(18, 13, 23, 10, NULL, NULL, '2025-10-20 08:56:12', '2025-10-20 08:56:12'),
(19, 13, 19, 10, NULL, NULL, '2025-10-20 08:56:12', '2025-10-20 08:56:12'),
(20, 13, 19, 10, NULL, NULL, '2025-10-20 08:56:12', '2025-10-20 08:56:12'),
(21, 14, 25, 10, NULL, NULL, '2025-10-20 10:48:33', '2025-10-20 10:48:33'),
(22, 14, 25, 10, NULL, NULL, '2025-10-20 10:48:33', '2025-10-20 10:48:33'),
(23, 14, 25, 10, NULL, NULL, '2025-10-20 10:48:33', '2025-10-20 10:48:33'),
(24, 14, 25, 10, NULL, NULL, '2025-10-20 10:48:33', '2025-10-20 10:48:33'),
(25, 14, 25, 11, NULL, NULL, '2025-10-20 10:48:33', '2025-10-20 10:48:33'),
(26, 15, 18, 10, NULL, NULL, '2025-10-22 10:15:24', '2025-10-22 10:15:24'),
(27, 15, 7, 10, NULL, NULL, '2025-10-22 10:15:24', '2025-10-22 10:15:24');

-- --------------------------------------------------------

--
-- Structure de la table `sites`
--

CREATE TABLE `sites` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sites`
--

INSERT INTO `sites` (`id`, `name`, `address`, `contact_person`, `phone`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CONCENTRIX', 'CONCENTRIX', 'Flotte CONCENTRIXX', '+261 34 78 788 78', 1, '2025-09-30 05:30:40', '2025-10-27 08:39:26'),
(2, 'Pharamacie Garde Bazar be', 'Bazar be', 'Flotte Bazar Be', '+020 22 555 55', 1, '2025-09-30 05:30:40', '2025-10-06 07:22:07'),
(5, 'Galana Ra', 'Galana', 'Flotte Galana', '+261 32 75 789 78', 1, '2025-09-30 05:30:40', '2025-10-06 07:21:23'),
(8, 'Site Principale', 'Bazar Be', 'SF Aina', NULL, 1, '2025-10-06 07:23:06', '2025-10-27 08:39:40');

-- --------------------------------------------------------

--
-- Structure de la table `site_requests`
--

CREATE TABLE `site_requests` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','FULFILLED') DEFAULT 'PENDING',
  `request_type` enum('STOCK_REQUEST','EMERGENCY_REQUEST') DEFAULT 'STOCK_REQUEST',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM',
  `requested_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `site_request_items`
--

CREATE TABLE `site_request_items` (
  `id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `requested_quantity` int(11) NOT NULL,
  `approved_quantity` int(11) DEFAULT NULL,
  `distributed_quantity` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `site_stocks`
--

CREATE TABLE `site_stocks` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `min_stock` int(11) DEFAULT 0,
  `max_stock` int(11) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `site_stocks`
--

INSERT INTO `site_stocks` (`id`, `site_id`, `medication_id`, `quantity`, `min_stock`, `max_stock`, `last_updated`, `created_at`, `updated_at`) VALUES
(26, 1, 25, 8899, 10, 0, '2025-10-20 07:48:36', '2025-10-08 12:13:00', '2025-10-20 07:48:36'),
(27, 2, 23, 995, 10, 0, '2025-10-13 09:01:54', '2025-10-08 13:14:47', '2025-10-13 09:01:54'),
(28, 2, 5, 105, 18, 0, '2025-10-13 09:00:45', '2025-10-08 13:14:47', '2025-10-13 09:00:45'),
(29, 2, 22, 290, 10, 0, '2025-10-13 08:59:05', '2025-10-08 13:14:47', '2025-10-13 08:59:05'),
(30, 2, 17, 976, 10, 0, '2025-10-13 09:01:54', '2025-10-08 14:08:59', '2025-10-13 09:01:54'),
(31, 1, 2, 90, 15, 0, '2025-10-15 06:43:49', '2025-10-09 08:57:53', '2025-10-15 06:43:49'),
(32, 1, 24, 100, 10, 0, '2025-10-09 08:57:53', '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
(33, 1, 19, 70, 10, 0, '2025-10-20 05:56:25', '2025-10-09 08:57:53', '2025-10-20 05:56:25'),
(34, 1, 23, 80, 10, 0, '2025-10-20 05:56:25', '2025-10-09 08:57:53', '2025-10-20 05:56:25'),
(35, 1, 18, 80, 10, 0, '2025-10-22 07:15:31', '2025-10-09 08:57:53', '2025-10-22 07:15:31'),
(36, 1, 7, 80, 15, 0, '2025-10-22 07:15:31', '2025-10-09 08:57:53', '2025-10-22 07:15:31'),
(37, 5, 25, 100, 10, 0, '2025-10-09 08:59:14', '2025-10-09 08:59:14', '2025-10-09 08:59:14'),
(38, 5, 7, 110, 15, 0, '2025-10-09 08:59:14', '2025-10-09 08:59:14', '2025-10-09 08:59:14');

-- --------------------------------------------------------

--
-- Structure de la table `stock_alerts`
--

CREATE TABLE `stock_alerts` (
  `id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `site_id` int(11) DEFAULT NULL,
  `alert_type` enum('LOW_STOCK','OUT_OF_STOCK','EXPIRED','NEAR_EXPIRY') NOT NULL,
  `current_quantity` int(11) NOT NULL,
  `threshold_quantity` int(11) NOT NULL,
  `status` enum('ACTIVE','RESOLVED','IGNORED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `movement_type` enum('IN','OUT','TRANSFER_IN','TRANSFER_OUT','ADJUSTMENT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference_type` enum('DISTRIBUTION','ORDER','ADJUSTMENT','TRANSFER') NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `site_id` int(11) DEFAULT NULL,
  `from_site_id` int(11) DEFAULT NULL,
  `to_site_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `medication_id`, `movement_type`, `quantity`, `reference_type`, `reference_id`, `site_id`, `from_site_id`, `to_site_id`, `user_id`, `notes`, `created_at`) VALUES
(128, 2, 'IN', 1500, 'ORDER', 46, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251007-809 - Amoxicilline 1g', '2025-10-07 06:49:17'),
(129, 24, 'IN', 1500, 'ORDER', 46, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251007-809 - CA C1000', '2025-10-07 06:49:17'),
(130, 18, 'IN', 1310, 'ORDER', 46, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251007-809 - Prédinisolone 25 mg', '2025-10-07 06:49:17'),
(131, 22, 'IN', 799, 'ORDER', 46, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251007-809 - Pertamol', '2025-10-07 06:49:17'),
(132, 17, 'OUT', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Distribution vers site 7: ', '2025-10-07 06:51:03'),
(133, 17, 'TRANSFER_IN', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Réception depuis stock global: ', '2025-10-07 06:51:03'),
(134, 5, 'OUT', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Distribution vers site 7: ', '2025-10-07 06:51:03'),
(135, 5, 'TRANSFER_IN', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Réception depuis stock global: ', '2025-10-07 06:51:03'),
(136, 22, 'OUT', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Distribution vers site 7: ', '2025-10-07 06:51:03'),
(137, 22, 'TRANSFER_IN', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Réception depuis stock global: ', '2025-10-07 06:51:03'),
(138, 3, 'OUT', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Distribution vers site 7: ', '2025-10-07 06:51:03'),
(139, 3, 'TRANSFER_IN', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Réception depuis stock global: ', '2025-10-07 06:51:03'),
(140, 6, 'OUT', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Distribution vers site 7: ', '2025-10-07 06:51:03'),
(141, 6, 'TRANSFER_IN', 250, 'DISTRIBUTION', 33, NULL, NULL, NULL, 16, 'Réception depuis stock global: ', '2025-10-07 06:51:03'),
(142, 25, 'OUT', 100, 'DISTRIBUTION', 34, NULL, NULL, NULL, 16, 'Distribution vers site 1: ', '2025-10-08 12:13:00'),
(143, 25, 'TRANSFER_IN', 100, 'DISTRIBUTION', 34, 1, NULL, 1, 16, 'Réception depuis stock global: ', '2025-10-08 12:13:00'),
(144, 25, 'IN', 10000, 'ORDER', 47, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251008-902 - ACIVIR ACICLOVIR 5% CREME', '2025-10-08 12:14:48'),
(145, 23, 'OUT', 15, 'DISTRIBUTION', 35, NULL, NULL, NULL, 16, 'Distribution vers site 2: ', '2025-10-08 13:14:47'),
(146, 23, 'TRANSFER_IN', 15, 'DISTRIBUTION', 35, 2, NULL, 2, 16, 'Réception depuis stock global: ', '2025-10-08 13:14:47'),
(147, 5, 'OUT', 15, 'DISTRIBUTION', 35, NULL, NULL, NULL, 16, 'Distribution vers site 2: ', '2025-10-08 13:14:47'),
(148, 5, 'TRANSFER_IN', 15, 'DISTRIBUTION', 35, 2, NULL, 2, 16, 'Réception depuis stock global: ', '2025-10-08 13:14:47'),
(149, 22, 'OUT', 147, 'DISTRIBUTION', 35, NULL, NULL, NULL, 16, 'Distribution vers site 2: ', '2025-10-08 13:14:47'),
(150, 22, 'TRANSFER_IN', 147, 'DISTRIBUTION', 35, 2, NULL, 2, 16, 'Réception depuis stock global: ', '2025-10-08 13:14:47'),
(151, 17, 'OUT', 122, 'DISTRIBUTION', 36, NULL, NULL, NULL, 16, 'Distribution vers site 2: ', '2025-10-08 14:08:59'),
(152, 17, 'TRANSFER_IN', 122, 'DISTRIBUTION', 36, 2, NULL, 2, 16, 'Réception depuis stock global: ', '2025-10-08 14:08:59'),
(153, 17, 'OUT', 10, '', 2, 2, 2, NULL, 1, 'Dispensation prescription - Patient: Karim Abdoul', '2025-10-08 14:14:17'),
(154, 5, 'OUT', 10, '', 4, 2, 2, NULL, 1, 'Dispensation prescription - Patient: bathh', '2025-10-08 14:14:44'),
(155, 5, 'OUT', 10, '', 4, 2, 2, NULL, 1, 'Dispensation prescription - Patient: bathh', '2025-10-08 14:16:20'),
(156, 17, 'OUT', 10, '', 2, 2, 2, NULL, 1, 'Dispensation prescription - Patient: Karim Abdoul', '2025-10-08 14:16:33'),
(157, 22, 'OUT', 7, '', 5, 2, 2, NULL, 1, 'Dispensation prescription - Patient: Unllskf', '2025-10-08 14:17:31'),
(158, 25, 'ADJUSTMENT', 9900, 'ADJUSTMENT', NULL, 1, NULL, NULL, 16, 'Synchronisation automatique avec stock global', '2025-10-09 05:40:31'),
(159, 25, 'IN', 10000, 'ORDER', 48, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251009-583 - ACIVIR ACICLOVIR 5% CREME', '2025-10-09 08:56:31'),
(160, 17, 'IN', 100, 'ORDER', 48, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251009-583 - Amaday 10 mg', '2025-10-09 08:56:31'),
(161, 2, 'IN', 1000, 'ORDER', 48, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251009-583 - Amoxicilline 1g', '2025-10-09 08:56:31'),
(162, 7, 'IN', 10000, 'ORDER', 48, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251009-583 - Atorvastatine 20mg', '2025-10-09 08:56:31'),
(163, 4, 'IN', 1000, 'ORDER', 48, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251009-583 - Aspirine 100mg', '2025-10-09 08:56:31'),
(164, 24, 'IN', 10000, 'ORDER', 48, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251009-583 - CA C1000', '2025-10-09 08:56:31'),
(165, 5, 'IN', 1000, 'ORDER', 48, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251009-583 - Loratadine 10mg', '2025-10-09 08:56:31'),
(166, 22, 'IN', 1000, 'ORDER', 48, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251009-583 - Pertamol', '2025-10-09 08:56:31'),
(167, 25, 'OUT', 100, 'DISTRIBUTION', 37, NULL, NULL, NULL, 16, 'Distribution vers site 1: ', '2025-10-09 08:57:53'),
(168, 25, 'TRANSFER_IN', 100, 'DISTRIBUTION', 37, 1, NULL, 1, 16, 'Réception depuis stock global: ', '2025-10-09 08:57:53'),
(169, 2, 'OUT', 100, 'DISTRIBUTION', 37, NULL, NULL, NULL, 16, 'Distribution vers site 1: ', '2025-10-09 08:57:53'),
(170, 2, 'TRANSFER_IN', 100, 'DISTRIBUTION', 37, 1, NULL, 1, 16, 'Réception depuis stock global: ', '2025-10-09 08:57:53'),
(171, 24, 'OUT', 100, 'DISTRIBUTION', 37, NULL, NULL, NULL, 16, 'Distribution vers site 1: ', '2025-10-09 08:57:53'),
(172, 24, 'TRANSFER_IN', 100, 'DISTRIBUTION', 37, 1, NULL, 1, 16, 'Réception depuis stock global: ', '2025-10-09 08:57:53'),
(173, 19, 'OUT', 100, 'DISTRIBUTION', 37, NULL, NULL, NULL, 16, 'Distribution vers site 1: ', '2025-10-09 08:57:53'),
(174, 19, 'TRANSFER_IN', 100, 'DISTRIBUTION', 37, 1, NULL, 1, 16, 'Réception depuis stock global: ', '2025-10-09 08:57:53'),
(175, 23, 'OUT', 100, 'DISTRIBUTION', 37, NULL, NULL, NULL, 16, 'Distribution vers site 1: ', '2025-10-09 08:57:53'),
(176, 23, 'TRANSFER_IN', 100, 'DISTRIBUTION', 37, 1, NULL, 1, 16, 'Réception depuis stock global: ', '2025-10-09 08:57:53'),
(177, 18, 'OUT', 100, 'DISTRIBUTION', 37, NULL, NULL, NULL, 16, 'Distribution vers site 1: ', '2025-10-09 08:57:53'),
(178, 18, 'TRANSFER_IN', 100, 'DISTRIBUTION', 37, 1, NULL, 1, 16, 'Réception depuis stock global: ', '2025-10-09 08:57:53'),
(179, 7, 'OUT', 100, 'DISTRIBUTION', 37, NULL, NULL, NULL, 16, 'Distribution vers site 1: ', '2025-10-09 08:57:53'),
(180, 7, 'TRANSFER_IN', 100, 'DISTRIBUTION', 37, 1, NULL, 1, 16, 'Réception depuis stock global: ', '2025-10-09 08:57:53'),
(181, 25, 'OUT', 100, 'DISTRIBUTION', 38, NULL, NULL, NULL, 16, 'Distribution vers site 5: ', '2025-10-09 08:59:14'),
(182, 25, 'TRANSFER_IN', 100, 'DISTRIBUTION', 38, 5, NULL, 5, 16, 'Réception depuis stock global: ', '2025-10-09 08:59:14'),
(183, 7, 'OUT', 110, 'DISTRIBUTION', 38, NULL, NULL, NULL, 16, 'Distribution vers site 5: ', '2025-10-09 08:59:14'),
(184, 7, 'TRANSFER_IN', 110, 'DISTRIBUTION', 38, 5, NULL, 5, 16, 'Réception depuis stock global: ', '2025-10-09 08:59:14'),
(185, 17, 'OUT', 12, '', 4, 2, 2, NULL, 1, 'Dispensation prescription - Patient: tiana - Amaday 10 mg', '2025-10-13 08:19:38'),
(186, 17, 'OUT', 12, '', 2, 2, 2, NULL, 1, 'Dispensation prescription - Patient: Funtest - Amaday 10 mg', '2025-10-13 08:19:57'),
(187, 17, 'OUT', 12, '', 4, 2, 2, NULL, 1, 'Dispensation prescription - Patient: tiana - Amaday 10 mg', '2025-10-13 08:26:02'),
(188, 17, 'OUT', 12, '', 4, 2, 2, NULL, 1, 'Dispensation prescription - Patient: tiana - Amaday 10 mg', '2025-10-13 08:26:26'),
(189, 17, 'OUT', 12, '', 2, 2, 2, NULL, 1, 'Dispensation prescription - Patient: Funtest - Amaday 10 mg', '2025-10-13 08:32:14'),
(190, 23, 'OUT', 15, '', 2, 2, 2, NULL, 1, 'Dispensation prescription - Patient: Funtest - Magné B6', '2025-10-13 08:32:14'),
(191, 25, 'OUT', 10, '', 5, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Lolito - ACIVIR ACICLOVIR 5% CREME', '2025-10-13 08:39:53'),
(192, 17, 'OUT', 1000, 'DISTRIBUTION', 39, NULL, NULL, NULL, 16, 'Distribution vers site 2: ', '2025-10-13 08:59:05'),
(193, 17, 'TRANSFER_IN', 1000, 'DISTRIBUTION', 39, 2, NULL, 2, 16, 'Réception depuis stock global: ', '2025-10-13 08:59:05'),
(194, 22, 'OUT', 150, 'DISTRIBUTION', 39, NULL, NULL, NULL, 16, 'Distribution vers site 2: ', '2025-10-13 08:59:05'),
(195, 22, 'TRANSFER_IN', 150, 'DISTRIBUTION', 39, 2, NULL, 2, 16, 'Réception depuis stock global: ', '2025-10-13 08:59:05'),
(196, 23, 'OUT', 1000, 'DISTRIBUTION', 40, NULL, NULL, NULL, 16, 'Distribution vers site 2: ', '2025-10-13 08:59:55'),
(197, 23, 'TRANSFER_IN', 1000, 'DISTRIBUTION', 40, 2, NULL, 2, 16, 'Réception depuis stock global: ', '2025-10-13 08:59:55'),
(198, 5, 'OUT', 100, 'DISTRIBUTION', 41, NULL, NULL, NULL, 16, 'Distribution vers site 2: ', '2025-10-13 09:00:45'),
(199, 5, 'TRANSFER_IN', 100, 'DISTRIBUTION', 41, 2, NULL, 2, 16, 'Réception depuis stock global: ', '2025-10-13 09:00:45'),
(200, 17, 'OUT', 112, '', 3, 2, 2, NULL, 19, 'Dispensation prescription - Patient: Kiagra - Amaday 10 mg', '2025-10-13 09:01:54'),
(201, 23, 'OUT', 5, '', 3, 2, 2, NULL, 19, 'Dispensation prescription - Patient: Kiagra - Magné B6', '2025-10-13 09:01:54'),
(202, 7, 'OUT', 10, '', 6, 1, 1, NULL, 19, 'Dispensation prescription - Patient: TAHINA - Atorvastatine 20mg', '2025-10-13 16:28:40'),
(203, 23, 'OUT', 10, '', 6, 1, 1, NULL, 19, 'Dispensation prescription - Patient: TAHINA - Magné B6', '2025-10-13 16:28:40'),
(204, 25, 'OUT', 10, '', 8, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Lolito - ACIVIR ACICLOVIR 5% CREME', '2025-10-15 06:17:29'),
(205, 25, 'OUT', 10, '', 7, 1, 1, NULL, 1, 'Dispensation prescription - Patient: gdd - ACIVIR ACICLOVIR 5% CREME', '2025-10-15 06:17:31'),
(206, 25, 'OUT', 100, '', 9, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Lolito - ACIVIR ACICLOVIR 5% CREME', '2025-10-15 06:17:52'),
(207, 25, 'OUT', 1000, '', 10, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Lolito - ACIVIR ACICLOVIR 5% CREME', '2025-10-15 06:21:57'),
(208, 25, 'OUT', 10, '', 11, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Dupont - ACIVIR ACICLOVIR 5% CREME', '2025-10-15 06:32:51'),
(209, 18, 'OUT', 10, '', 11, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Dupont - Prédinisolone 25 mg', '2025-10-15 06:32:51'),
(210, 25, 'OUT', 10, '', 12, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Dupont - ACIVIR ACICLOVIR 5% CREME', '2025-10-15 06:43:49'),
(211, 2, 'OUT', 10, '', 12, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Dupont - Amoxicilline 1g', '2025-10-15 06:43:49'),
(212, 19, 'OUT', 10, '', 12, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Dupont - Paracetamol 250 mg', '2025-10-15 06:43:49'),
(213, 23, 'OUT', 10, '', 13, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Vola - Magné B6', '2025-10-20 05:56:25'),
(214, 19, 'OUT', 10, '', 13, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Vola - Paracetamol 250 mg', '2025-10-20 05:56:25'),
(215, 19, 'OUT', 10, '', 13, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Vola - Paracetamol 250 mg', '2025-10-20 05:56:25'),
(216, 25, 'OUT', 10, '', 14, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Jacques - ACIVIR ACICLOVIR 5% CREME', '2025-10-20 07:48:36'),
(217, 25, 'OUT', 10, '', 14, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Jacques - ACIVIR ACICLOVIR 5% CREME', '2025-10-20 07:48:36'),
(218, 25, 'OUT', 10, '', 14, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Jacques - ACIVIR ACICLOVIR 5% CREME', '2025-10-20 07:48:36'),
(219, 25, 'OUT', 10, '', 14, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Jacques - ACIVIR ACICLOVIR 5% CREME', '2025-10-20 07:48:36'),
(220, 25, 'OUT', 11, '', 14, 1, 1, NULL, 1, 'Dispensation prescription - Patient: Jean Jacques - ACIVIR ACICLOVIR 5% CREME', '2025-10-20 07:48:36'),
(221, 18, 'OUT', 10, '', 15, 1, 1, NULL, 1, 'Dispensation prescription - Patient: tahina - Prédinisolone 25 mg', '2025-10-22 07:15:31'),
(222, 7, 'OUT', 10, '', 15, 1, 1, NULL, 1, 'Dispensation prescription - Patient: tahina - Atorvastatine 20mg', '2025-10-22 07:15:31'),
(223, 3, 'IN', 100, 'ORDER', 49, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251027-599 - Vitamine D3', '2025-10-27 08:43:34'),
(224, 23, 'IN', 105, 'ORDER', 49, NULL, NULL, NULL, 16, 'Livraison commande CMD-20251027-599 - Magné B6', '2025-10-27 08:43:34');

-- --------------------------------------------------------

--
-- Structure de la table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'PharmaTek', NULL, NULL, NULL, NULL, 1, '2025-10-01 14:00:23', '2025-10-01 14:00:23');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `passwrd` varchar(255) NOT NULL,
  `role` enum('admin','admin personnel','user','admin pharmacist','pharmacist','head doctor','doctor','receptionist','nurse') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `passwrd`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Katty', 'Nomena', 'katty@funtoa.com', '0337674155', '$2b$14$lUc.Od3c4iyaLzlBD9EB/ecZVwpiXgIj/VllZMtVwhGdgzQfuLHGi', 'pharmacist', 1, '2025-09-15', '2025-09-22'),
(4, 'Super', 'Admin', 'superadmin@funtoa.com', '+243 999 888 777', '$2b$14$lUc.Od3c4iyaLzlBD9EB/ecZVwpiXgIj/VllZMtVwhGdgzQfuLHGi', 'admin', 1, '2025-09-15', '2025-09-15'),
(16, 'Pharmacy', 'Administrateur', 'pcieadmin@funtoa.com', NULL, '$2b$12$AZPBhnzqAsjSZ5X/Ur8fs.FNKIhdFwTtDDHXQ6ri1flf5yWU.xP0K', 'admin pharmacist', 1, '2025-09-22', '2025-09-22'),
(17, 'Lolito', 'Mamy', 'lolito@funtoa.com', NULL, '$2b$12$IlxiW62HbkouDKpGAfdGPeJN2DoJUPr3Hjo09blQUI7SqQR8/7WLK', 'head doctor', 1, '2025-09-22', '2025-10-27'),
(18, 'Admin', 'Funtoa', 'admin@funtoa.com', NULL, '$2b$10$e.dtoR.qYXEKjL2fEIyAjeIdUut0lJ5csESqh0DOfdk8sS7KEefF6', 'admin', 1, '2025-09-23', '2025-09-23'),
(19, 'Karim', 'ABDOUL', 'karim@funtoa.com', '032 78 899 06', '$2b$12$qk4t.Jys21wpAOV0PCjgEu4T0tAMGess28S7DDtL1GTyuSSNqja2a', 'pharmacist', 1, '2025-10-06', '2025-10-27'),
(20, 'TEDDY', 'TEDDY', 'teddy@funtoa.com', '032222522', '$2b$12$kt3ByrlmV155nfi8gFLyZubkUr9pTiRN8P/vInIXGa5iT1XbYVrmS', 'admin personnel', 1, '2025-10-21', '2025-10-27');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `distributions`
--
ALTER TABLE `distributions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`),
  ADD KEY `distribution_date` (`distribution_date`);

--
-- Index pour la table `distribution_items`
--
ALTER TABLE `distribution_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_distribution_id` (`distribution_id`),
  ADD KEY `idx_medication_id` (`medication_id`),
  ADD KEY `idx_distribution_medication` (`distribution_id`,`medication_id`);

--
-- Index pour la table `medications`
--
ALTER TABLE `medications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_quantity` (`quantity`),
  ADD KEY `idx_min_stock` (`min_stock`);

--
-- Index pour la table `medication_categories`
--
ALTER TABLE `medication_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_name` (`name`);

--
-- Index pour la table `migrations_history`
--
ALTER TABLE `migrations_history`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `migration_name` (`migration_name`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_supplier` (`supplier_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_order_date` (`order_date`),
  ADD KEY `idx_user` (`user_id`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_medication` (`medication_id`);

--
-- Index pour la table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `pharmacist_id` (`pharmacist_id`),
  ADD KEY `medication_id` (`medication_id`);

--
-- Index pour la table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescription_id` (`prescription_id`),
  ADD KEY `medication_id` (`medication_id`);

--
-- Index pour la table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `site_requests`
--
ALTER TABLE `site_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Index pour la table `site_request_items`
--
ALTER TABLE `site_request_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `medication_id` (`medication_id`);

--
-- Index pour la table `site_stocks`
--
ALTER TABLE `site_stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_site_medication` (`site_id`,`medication_id`),
  ADD KEY `medication_id` (`medication_id`);

--
-- Index pour la table `stock_alerts`
--
ALTER TABLE `stock_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medication_id` (`medication_id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medication_id` (`medication_id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `from_site_id` (`from_site_id`),
  ADD KEY `to_site_id` (`to_site_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_active` (`is_active`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_active` (`is_active`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `company`
--
ALTER TABLE `company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `distributions`
--
ALTER TABLE `distributions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT pour la table `distribution_items`
--
ALTER TABLE `distribution_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT pour la table `medications`
--
ALTER TABLE `medications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT pour la table `medication_categories`
--
ALTER TABLE `medication_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `migrations_history`
--
ALTER TABLE `migrations_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT pour la table `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `prescription_items`
--
ALTER TABLE `prescription_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT pour la table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `site_requests`
--
ALTER TABLE `site_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `site_request_items`
--
ALTER TABLE `site_request_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `site_stocks`
--
ALTER TABLE `site_stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT pour la table `stock_alerts`
--
ALTER TABLE `stock_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=225;

--
-- AUTO_INCREMENT pour la table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `distributions`
--
ALTER TABLE `distributions`
  ADD CONSTRAINT `distributions_site_fk` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `distributions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `distribution_items`
--
ALTER TABLE `distribution_items`
  ADD CONSTRAINT `distribution_items_ibfk_1` FOREIGN KEY (`distribution_id`) REFERENCES `distributions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `distribution_items_ibfk_2` FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `site_requests`
--
ALTER TABLE `site_requests`
  ADD CONSTRAINT `site_requests_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `site_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `site_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `site_request_items`
--
ALTER TABLE `site_request_items`
  ADD CONSTRAINT `site_request_items_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `site_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `site_request_items_ibfk_2` FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `site_stocks`
--
ALTER TABLE `site_stocks`
  ADD CONSTRAINT `site_stocks_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `site_stocks_ibfk_2` FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `stock_alerts`
--
ALTER TABLE `stock_alerts`
  ADD CONSTRAINT `stock_alerts_ibfk_1` FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_alerts_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_alerts_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_3` FOREIGN KEY (`from_site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_4` FOREIGN KEY (`to_site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
