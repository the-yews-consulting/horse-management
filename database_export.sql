-- Database Export from Supabase
-- Generated: 2026-01-06
-- IMPORTANT: Run all migrations first before importing this data

-- =============================================================================
-- PROFILES TABLE (3 rows)
-- =============================================================================
INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at, account_status) VALUES
('c1aa5f68-b087-47de-a388-2ef8f597f2a5', 'guido666@gmail.com', NULL, 'super_admin', true, '2025-12-24 12:37:13.048684+00', '2025-12-24 17:09:54.357327+00', 'enabled'),
('8051d92e-c555-4df2-a42e-00e811fb482d', 'sharonball58@gmail.com', '', 'admin', true, '2025-12-24 14:21:36.556984+00', '2025-12-24 14:22:12.157915+00', 'pending'),
('4dbb089d-3b1c-4ab9-ae79-609c2e846055', 'guido666+test@gmail.com', '', 'user', true, '2025-12-24 16:43:52.48915+00', '2025-12-24 16:43:52.48915+00', 'pending');

-- =============================================================================
-- TEAM_MEMBERS TABLE (1 row)
-- =============================================================================
INSERT INTO team_members (id, user_id, first_name, last_name, email, phone, role, is_active, hire_date, notes, created_at, updated_at, created_by) VALUES
('24e23894-9bfe-4558-83f2-e0ee2faee338', NULL, 'sharon', 'Ball', 'sharonball58@gmail.com', '01327342460', 'manager', true, '2010-01-24', '', '2025-12-24 12:18:07.620513+00', '2025-12-24 12:18:07.620513+00', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5');

-- =============================================================================
-- HORSE_BREEDS TABLE (5 rows)
-- =============================================================================
INSERT INTO horse_breeds (id, name, abbreviation, is_default, created_at, updated_at) VALUES
('2da154b0-5922-45a7-81e0-04beaee5ec1b', 'Pony', 'PNY', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('82dd0dc7-6b46-4840-9257-0e2b52a6829a', 'Standardbred', 'STD', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('e663ff73-1bc3-4ca4-b5ca-8c91263b9397', 'Thoroughbred', 'TB', true, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('7d97711b-5d26-4d95-8baa-6ed032cdba5c', 'Purebred Arabian', 'PA', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('68554b35-bbd8-406f-a87d-39b0c6968609', 'Quarter Horse', 'QTR1', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00');

-- =============================================================================
-- HORSE_COLOURS TABLE (5 rows)
-- =============================================================================
INSERT INTO horse_colours (id, name, abbreviation, is_default, created_at, updated_at) VALUES
('1a9c5bad-6317-42db-a649-6ef4f4116fc7', 'Brown', 'BR', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('1445a3ff-bd16-4170-9aca-f48453fd3b67', 'Bay', 'BAY', true, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('5be59339-4eb6-4a72-8d2e-ad3216699ca7', 'Chesnut', 'CH', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('3fe51740-a18f-4652-b18f-315bd85a7c54', 'Grey', 'GR', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('6ad51140-bc84-4669-83ea-66ab4cd59435', 'Black', 'BL', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00');

-- =============================================================================
-- HORSE_GENDERS TABLE (5 rows)
-- =============================================================================
INSERT INTO horse_genders (id, name, abbreviation, is_default, created_at, updated_at) VALUES
('ee3f494e-3ce7-4073-a580-e67d95d4cb88', 'Colt', 'C', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('db3a095f-9b9e-4941-931e-4b3793e16d21', 'Gelding', 'G', true, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('16e12b0d-9bcf-44d6-846a-908a4580294e', 'Stallion', 'S', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('864fc559-7b79-41ef-a2d5-8086ccce8da6', 'Filly', 'F', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00'),
('c8e4d5d7-e477-4d38-bded-687b6a97364e', 'Mare', 'M', false, '2026-01-03 17:53:45.7847+00', '2026-01-03 17:53:45.7847+00');

-- =============================================================================
-- HORSE_STATUSES TABLE (4 rows)
-- =============================================================================
INSERT INTO horse_statuses (id, description, is_default, is_dead, selected_by_default, created_at, updated_at) VALUES
('d6605b7d-0ccb-49a6-947f-a96bbb03bb81', 'Active', true, false, true, '2026-01-04 15:05:49.002726+00', '2026-01-04 15:05:49.002726+00'),
('21f03514-5e5f-484e-a0b6-c08fc763ce34', 'Retired', false, false, true, '2026-01-04 15:05:49.002726+00', '2026-01-04 15:05:49.002726+00'),
('2443ae53-60e3-467a-b192-764032c31a4a', 'Injured', false, false, true, '2026-01-04 15:05:49.002726+00', '2026-01-04 15:05:49.002726+00'),
('d80ba707-1d88-498d-9d7f-290a0281bea4', 'Deceased', false, true, false, '2026-01-04 15:05:49.002726+00', '2026-01-04 15:05:49.002726+00');

-- =============================================================================
-- FARMS TABLE (2 rows)
-- =============================================================================
INSERT INTO farms (id, name, type, manager_trainer_name, address, country, office_no, mobile_no, fax_no, email, registration_number, billing_centre, active, note, media_urls, map_location, created_at, updated_at) VALUES
('5db4ae52-7fe6-4ea8-bc17-17bdd6c59c9b', 'My Farm', 'General', '', '12 Church Street', 'England', '', '', '', 'guido666+obsbot@gmail.com', '1234567890', '', true, '', '[]', NULL, '2026-01-04 16:36:18.484196+00', '2026-01-04 21:40:17.313+00'),
('f26916fa-e746-4669-8f21-429a8797969f', 'Another Farm', 'Training', '', '', 'England', '', '', '', '', '', '', true, '', '[]', NULL, '2026-01-05 09:40:40.974676+00', '2026-01-05 09:40:40.974676+00');

-- =============================================================================
-- YARDS TABLE (2 rows)
-- =============================================================================
INSERT INTO yards (id, name, farm_id, active, note, media_urls, map_location, created_at, updated_at) VALUES
('b928ed15-57ed-4ebc-b0dc-35711db3e258', 'Yard1', '5db4ae52-7fe6-4ea8-bc17-17bdd6c59c9b', true, '', '[]', NULL, '2026-01-04 16:36:33.209494+00', '2026-01-04 16:36:33.209494+00'),
('f1cd5783-bf7d-4354-8468-e9759d356654', 'yard 2', '5db4ae52-7fe6-4ea8-bc17-17bdd6c59c9b', true, '', '[]', NULL, '2026-01-05 09:40:21.589642+00', '2026-01-05 09:40:21.589642+00');

-- =============================================================================
-- BARNS TABLE (2 rows)
-- =============================================================================
INSERT INTO barns (id, name, yard_id, active, note, media_urls, map_location, created_at, updated_at) VALUES
('b4867e8c-5e66-4b12-bac0-b36f48fa0f84', 'Main Barn', 'b928ed15-57ed-4ebc-b0dc-35711db3e258', true, '', '[]', NULL, '2026-01-04 19:31:39.290799+00', '2026-01-04 19:31:39.290799+00'),
('5061f36a-b4aa-4297-a329-56ddae53438f', 'barn 2', 'b928ed15-57ed-4ebc-b0dc-35711db3e258', true, '', '[]', NULL, '2026-01-05 09:40:10.317705+00', '2026-01-05 09:40:10.317705+00');

-- =============================================================================
-- OWNERS TABLE (6 rows)
-- =============================================================================
INSERT INTO owners (id, name, email, phone, address, notes, user_id, created_at, updated_at, first_name, last_name, emergency_contact_name, emergency_contact_phone, billing_info) VALUES
('e103c60e-d3b1-462f-854c-b03666c7b8e9', 'Sharon Ball', 'russell@theyewsconsulting.com', '07527006240', '12 CHURCH ST, Weedon Bec, Weedon Bec\nWeedon Bec', NULL, 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2025-12-23 12:19:05.652388+00', '2025-12-23 12:19:05.652388+00', NULL, NULL, NULL, NULL, NULL),
('a7958db4-0340-41ae-88a7-165f63d298b2', 'John Smith', 'john.smith@email.com', '555-0101', '123 Oak Lane, Countryside', 'Prefers morning communication', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:46:47.789017+00', '2026-01-05 09:46:47.789017+00', 'John', 'Smith', 'Jane Smith', '555-0102', NULL),
('53dcb3da-3d48-486e-b558-d102546be75b', 'Emma Thompson', 'emma.t@email.com', '555-0201', '456 Maple Drive, Hillside', 'New owner, started January 2026', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:46:47.789017+00', '2026-01-05 09:46:47.789017+00', 'Emma', 'Thompson', 'Tom Thompson', '555-0202', NULL),
('e3c8082c-0c38-4e13-af28-df94540dd572', 'Michael Brown', 'mbrown@email.com', '555-0301', '789 Pine Road, Meadowville', 'Has two horses', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:46:47.789017+00', '2026-01-05 09:46:47.789017+00', 'Michael', 'Brown', 'Sarah Brown', '555-0302', NULL),
('5b7ebb1b-2d4e-4683-b45c-d4091b6ceb31', 'Sarah Williams', 'sarah.w@email.com', '555-0401', '321 Birch Street, Valley View', 'Experienced rider', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:46:47.789017+00', '2026-01-05 09:46:47.789017+00', 'Sarah', 'Williams', 'David Williams', '555-0402', NULL),
('8185e9ad-b4c3-441c-8264-8e80ce3d0add', 'David Johnson', 'djohnson@email.com', '555-0501', '654 Cedar Avenue, Riverside', 'Competitive showjumper', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:46:47.789017+00', '2026-01-05 09:46:47.789017+00', 'David', 'Johnson', 'Lisa Johnson', '555-0502', NULL);

-- =============================================================================
-- VETS TABLE (6 rows)
-- =============================================================================
INSERT INTO vets (id, name, address, mobile_phone, office_phone, bank_account_name, bank_account_number, bank_routing_number, notes, user_id, created_at, updated_at, clinic_name, email, phone, emergency_phone, banking_details, specialties) VALUES
('ffdbc331-eaca-41e8-9ed9-edb24d94be3c', 'Made up Vet', '12 CHURCH ST, Weedon Bec, Weedon Bec\nWeedon Bec', '07527006240', NULL, NULL, NULL, NULL, NULL, 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2025-12-24 11:58:37.668336+00', '2025-12-24 11:58:37.668336+00', NULL, NULL, NULL, NULL, NULL, NULL),
('d857bad1-fd5c-4d4b-9447-90f0ea690d7d', 'Dr. Sarah Mitchell', '100 Veterinary Drive, Hillside', NULL, NULL, NULL, NULL, NULL, 'Available for emergency calls 24/7', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:30.225416+00', '2026-01-05 09:57:30.225416+00', 'Equine Care Veterinary Hospital', 'sarah.mitchell@equinecare.com', '555-1001', '555-1002', NULL, 'Lameness, Internal Medicine'),
('8ace627f-a480-4331-9abc-ceba6bd2d5d6', 'Dr. James Peterson', '250 Valley Road, Meadowville', NULL, NULL, NULL, NULL, NULL, 'Specializes in advanced surgical procedures', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:30.225416+00', '2026-01-05 09:57:30.225416+00', 'Valley View Equine Clinic', 'james.peterson@valleyview.com', '555-1101', '555-1102', NULL, 'Surgery, Reproduction'),
('38df8bf7-c906-4a55-a2af-d62b339bc0f4', 'Dr. Emily Rodriguez', '45 Rural Route 3, Countryside', NULL, NULL, NULL, NULL, NULL, 'Also treats small animals', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:30.225416+00', '2026-01-05 09:57:30.225416+00', 'Countryside Animal Hospital', 'emily.r@countryside.com', '555-1201', '555-1202', NULL, 'General Practice, Dentistry'),
('bdd35ba7-5bee-4ef6-b686-24a0af87cfe8', 'Dr. Michael Chen', '789 Medical Plaza, Riverside', NULL, NULL, NULL, NULL, NULL, 'Works with performance horses', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:30.225416+00', '2026-01-05 09:57:30.225416+00', 'Premier Equine Veterinary Services', 'michael.chen@premierequine.com', '555-1301', '555-1302', NULL, 'Sports Medicine, Rehabilitation'),
('db90df14-4b77-4e83-be46-f145031fb0dc', 'Dr. Amanda Brooks', '321 Wellness Way, Valley View', NULL, NULL, NULL, NULL, NULL, 'Offers acupuncture and chiropractic services', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:30.225416+00', '2026-01-05 09:57:30.225416+00', 'Holistic Horse Health Center', 'amanda.brooks@holistichorse.com', '555-1401', '555-1402', NULL, 'Alternative Medicine, Nutrition');

-- =============================================================================
-- FARRIERS TABLE (6 rows)
-- =============================================================================
INSERT INTO farriers (id, name, address, mobile_phone, office_phone, bank_account_name, bank_account_number, bank_routing_number, notes, user_id, created_at, updated_at, email, phone, banking_details, service_areas) VALUES
('29e9e377-ea16-4728-8c20-031013db5c47', 'Farrier mad up', '12 CHURCH ST, Weedon Bec, Weedon Bec\nWeedon Bec', '07527006240', NULL, '12345677', NULL, NULL, NULL, 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2025-12-24 11:58:55.444609+00', '2025-12-24 11:58:55.444609+00', NULL, NULL, NULL, NULL),
('f919c0e1-057a-499b-921f-1bbf1199c4e0', 'Tom Harrison', '123 Forge Lane, Hillside', NULL, NULL, NULL, NULL, NULL, 'Certified Master Farrier, 20 years experience', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:45.655154+00', '2026-01-05 09:57:45.655154+00', 'tom.harrison@email.com', '555-2001', NULL, 'Hillside, Meadowville, Countryside'),
('7cf2b360-21ca-48da-8f1b-036ebe3f92cd', 'Rebecca Stone', '456 Blacksmith Road, Valley View', NULL, NULL, NULL, NULL, NULL, 'Specializes in corrective shoeing', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:45.655154+00', '2026-01-05 09:57:45.655154+00', 'rebecca.stone@email.com', '555-2101', NULL, 'Valley View, Riverside'),
('0d3d44ef-c36d-4cd8-84e2-13df034adcc2', 'Marcus Williams', '789 Horseshoe Drive, Riverside', NULL, NULL, NULL, NULL, NULL, 'Performance horse specialist', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:45.655154+00', '2026-01-05 09:57:45.655154+00', 'marcus.w@email.com', '555-2201', NULL, 'Riverside, Countryside, Hillside'),
('6d0b616d-fbc1-45d1-879e-37dee18a4938', 'Jennifer Martinez', '321 Anvil Street, Meadowville', NULL, NULL, NULL, NULL, NULL, 'Natural hoof care and traditional shoeing', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:45.655154+00', '2026-01-05 09:57:45.655154+00', 'jennifer.martinez@email.com', '555-2301', NULL, 'Meadowville, Valley View'),
('6fd7d857-4c38-4681-a505-b8328f9bc860', 'Robert Taylor', '654 Iron Works Avenue, Countryside', NULL, NULL, NULL, NULL, NULL, 'Mobile forge service available, competition shoeing', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:57:45.655154+00', '2026-01-05 09:57:45.655154+00', 'robert.taylor@email.com', '555-2401', NULL, 'All areas within 50 miles');

-- =============================================================================
-- STALLS TABLE (10 rows)
-- =============================================================================
INSERT INTO stalls (id, name, building, size, has_paddock_access, notes, user_id, created_at, updated_at, size_sqm, features, status, barn_id, paddock_id) VALUES
('f5e9dc8e-6d14-4a15-89d0-5ece77215f6e', 'Stable 1', 'Main Barn', '14', false, 'Automatic feeder\nAutomatic Water Trough', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2025-12-23 12:29:57.463483+00', '2026-01-04 16:40:17.242005+00', 14, NULL, 'available', NULL, NULL),
('a79ca109-d685-4c1a-9cd0-84bc8cb5a918', 'Stable 2', 'Main Barn', '12x12', true, 'Corner stall with good ventilation', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 12, 'Automatic waterer', 'available', NULL, NULL),
('e2ab0182-507c-4c23-bc16-f99a34204418', 'Stable 3', 'Main Barn', '14x14', true, 'Large stall suitable for bigger horses', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 14, 'Automatic waterer, rubber matting', 'available', NULL, NULL),
('e456e474-edb2-44d5-ae8c-7e85fd7c32ce', 'Stable 4', 'Main Barn', '12x12', false, 'Interior stall', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 12, 'Standard fixtures', 'available', NULL, NULL),
('2b2dc7e5-b385-4dff-97e8-82ad88bfd35d', 'Stable 5', 'South Barn', '14x14', true, 'Premium stall with paddock access', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 14, 'Automatic waterer, rubber matting, heated', 'available', NULL, NULL),
('e228b0bb-c944-4156-b16c-420b87ff69c7', 'Stable 6', 'South Barn', '12x14', true, 'Direct paddock access', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 13, 'Automatic waterer', 'available', NULL, NULL),
('fbeeb33f-d601-4bf3-a26c-1222d128099a', 'Stable 7', 'South Barn', '12x12', false, 'Quiet location', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 12, 'Standard fixtures', 'available', NULL, NULL),
('4f4fe4ab-dd7c-4b87-89a8-7722b964b45e', 'Stable 8', 'North Barn', '14x14', true, 'Large corner stall', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 14, 'Automatic waterer, rubber matting', 'available', NULL, NULL),
('130833a6-133a-4631-82f1-7acec1be2b5d', 'Stable 9', 'North Barn', '12x12', true, 'Good natural light', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 12, 'Automatic waterer', 'available', NULL, NULL),
('695d0a15-3034-45e1-9bfe-b8ab2d437856', 'Stable 10', 'North Barn', '12x12', false, 'Close to tack room', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', '2026-01-05 09:47:00.012881+00', '2026-01-05 09:47:00.012881+00', 12, 'Standard fixtures', 'maintenance', NULL, NULL);

-- =============================================================================
-- HORSES TABLE (9 rows)
-- =============================================================================
INSERT INTO horses (id, name, breed, color, date_of_birth, microchip_id, registration_number, medical_notes, dietary_requirements, owner_id, created_at, updated_at, vet_id, farrier_id, age, gender, passport_number, behavioral_notes, photo_url, status, colour, height, clipped, fei_id, pet_name, rfid, rug_name, sire, dam, bloodline_info, breeding_status, breeding_notes, inquiry_notes, competition_record, training_notes, video_urls, related_links, markings_image) VALUES
('e5ff0683-1f0f-45ba-94cf-5872e6bb36bd', 'Tango', 'Thorughbreed', 'Chestnut', '2000-01-01', '1234512345', NULL, NULL, NULL, 'e103c60e-d3b1-462f-854c-b03666c7b8e9', '2025-12-23 12:31:35.301138+00', '2026-01-04 21:39:34.800557+00', 'ffdbc331-eaca-41e8-9ed9-edb24d94be3c', '29e9e377-ea16-4728-8c20-031013db5c47', NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('56ba5443-021b-45a6-b571-c257dc0a305c', 'ssss', 'Purebred Arabian', 'Bay', NULL, NULL, '', NULL, NULL, NULL, '2026-01-05 09:39:30.323959+00', '2026-01-05 09:39:30.323959+00', NULL, NULL, NULL, 'gelding', NULL, NULL, NULL, 'active', 'Bay', NULL, false, '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL),
('361291fd-ed04-40b3-9d03-ed8e118bb979', 'Starlight', 'Hanoverian', 'Dapple Gray', NULL, NULL, NULL, NULL, NULL, '8185e9ad-b4c3-441c-8264-8e80ce3d0add', '2026-01-05 09:47:15.985446+00', '2026-01-05 09:47:15.985446+00', NULL, NULL, 9, 'mare', NULL, NULL, NULL, 'active', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('f9254ea6-3842-439d-a97a-6f6303189b1e', 'Luna', 'Warmblood', 'Gray', NULL, NULL, NULL, NULL, NULL, '53dcb3da-3d48-486e-b558-d102546be75b', '2026-01-05 09:47:15.985446+00', '2026-01-05 09:58:18.668284+00', '8ace627f-a480-4331-9abc-ceba6bd2d5d6', '7cf2b360-21ca-48da-8f1b-036ebe3f92cd', 6, 'mare', NULL, NULL, NULL, 'active', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('91cdd095-33e7-4d77-ac0c-cbc130be76a7', 'Thunder', 'Quarter Horse', 'Chestnut', NULL, NULL, NULL, NULL, NULL, 'e3c8082c-0c38-4e13-af28-df94540dd572', '2026-01-05 09:47:15.985446+00', '2026-01-05 09:58:18.668284+00', 'bdd35ba7-5bee-4ef6-b686-24a0af87cfe8', '0d3d44ef-c36d-4cd8-84e2-13df034adcc2', 10, 'stallion', NULL, NULL, NULL, 'active', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('a323c4e6-4d44-4b98-ba5f-8a21e468ac5a', 'Shadow', 'Thoroughbred', 'Black', NULL, NULL, NULL, NULL, NULL, '5b7ebb1b-2d4e-4683-b45c-d4091b6ceb31', '2026-01-05 09:47:15.985446+00', '2026-01-05 09:58:18.668284+00', '38df8bf7-c906-4a55-a2af-d62b339bc0f4', '6d0b616d-fbc1-45d1-879e-37dee18a4938', 7, 'gelding', NULL, NULL, NULL, 'active', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ba5fd677-0546-4962-8c31-b5871430496c', 'Apollo', 'Thoroughbred', 'Bay', NULL, NULL, NULL, NULL, NULL, 'a7958db4-0340-41ae-88a7-165f63d298b2', '2026-01-05 09:47:15.985446+00', '2026-01-05 18:46:47.794725+00', 'd857bad1-fd5c-4d4b-9447-90f0ea690d7d', 'f919c0e1-057a-499b-921f-1bbf1199c4e0', 8, 'gelding', NULL, NULL, NULL, 'active', NULL, NULL, false, NULL, 'lolly', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('d14f64d0-5d20-436a-8740-cca2b1442b9d', 'Misty', 'Arabian', 'White', NULL, NULL, NULL, NULL, NULL, 'e3c8082c-0c38-4e13-af28-df94540dd572', '2026-01-05 09:47:15.985446+00', '2026-01-05 09:47:15.985446+00', NULL, NULL, 5, 'mare', NULL, NULL, NULL, 'active', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('f0299903-49ec-47b2-8544-363e0a8448e7', 'test1', 'Purebred Arabian', 'Black', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-05 18:30:43.263213+00', '2026-01-05 18:31:33.707071+00', NULL, NULL, NULL, 'gelding', '', NULL, NULL, 'active', 'Black', NULL, false, '', 'test', '', '', '', '', '', '', '', '', '', '', '', '', NULL);

-- =============================================================================
-- BOARDING_ASSIGNMENTS TABLE (6 rows)
-- =============================================================================
INSERT INTO boarding_assignments (id, horse_id, stall_id, boarding_type, monthly_rate, start_date, end_date, notes, created_at, updated_at) VALUES
('a153824a-b7c9-4e37-854b-6581cba8cdff', 'e5ff0683-1f0f-45ba-94cf-5872e6bb36bd', 'f5e9dc8e-6d14-4a15-89d0-5ece77215f6e', 'full', '250.00', '2025-12-23', NULL, NULL, '2025-12-23 13:24:01.82632+00', '2025-12-23 13:24:01.82632+00'),
('0240ea9c-8042-46da-b8ea-524531542c48', 'ba5fd677-0546-4962-8c31-b5871430496c', 'a79ca109-d685-4c1a-9cd0-84bc8cb5a918', 'full', '300.00', '2026-01-01', NULL, NULL, '2026-01-05 09:47:30.775908+00', '2026-01-05 09:47:30.775908+00'),
('4a57998d-1a7f-42e6-99fe-1044c35ca380', 'f9254ea6-3842-439d-a97a-6f6303189b1e', 'e2ab0182-507c-4c23-bc16-f99a34204418', 'full', '350.00', '2026-01-01', NULL, NULL, '2026-01-05 09:47:30.775908+00', '2026-01-05 09:47:30.775908+00'),
('f2d0a556-3273-47bc-956c-7b02940ec94e', '91cdd095-33e7-4d77-ac0c-cbc130be76a7', 'e456e474-edb2-44d5-ae8c-7e85fd7c32ce', 'partial', '200.00', '2025-12-15', NULL, NULL, '2026-01-05 09:47:30.775908+00', '2026-01-05 09:47:30.775908+00'),
('c3a73078-d4b4-41cf-a4f8-a49cf6816088', 'd14f64d0-5d20-436a-8740-cca2b1442b9d', '2b2dc7e5-b385-4dff-97e8-82ad88bfd35d', 'full', '400.00', '2025-12-20', NULL, NULL, '2026-01-05 09:47:30.775908+00', '2026-01-05 09:47:30.775908+00'),
('860bc05d-1d7a-47bb-aabe-82107ee2f350', 'a323c4e6-4d44-4b98-ba5f-8a21e468ac5a', 'e228b0bb-c944-4156-b16c-420b87ff69c7', 'training', '500.00', '2026-01-05', NULL, NULL, '2026-01-05 09:47:30.775908+00', '2026-01-05 09:47:30.775908+00');

-- =============================================================================
-- ACTIVITIES TABLE (1 row)
-- =============================================================================
INSERT INTO activities (id, horse_id, user_id, title, description, activity_type, scheduled_date, scheduled_time, duration_minutes, assigned_to, status, notes, completed_at, created_at, updated_at) VALUES
('edadf62b-dc54-4c05-9206-97326b406d23', 'e5ff0683-1f0f-45ba-94cf-5872e6bb36bd', 'c1aa5f68-b087-47de-a388-2ef8f597f2a5', 'This is a training schedule', 'some training', 'training', '2025-12-23', '12:11:00', 30, 'Sharon', 'completed', '', '2025-12-24 14:43:24.141+00', '2025-12-24 12:12:09.844436+00', '2025-12-24 14:43:43.396994+00');

-- =============================================================================
-- CONFIG TABLE (2 rows) - Home Assistant Configuration
-- =============================================================================
INSERT INTO config (id, key, value, created_at, updated_at) VALUES
('717aae90-cd6f-4390-8c18-a61844df5b46', 'ha_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4OWNkMTJhZDdjMmU0MDc0YTc2ZDg2ODM1NzQ2OGQzMCIsImlhdCI6MTc2NzIzMzY0OSwiZXhwIjoyMDgyNTkzNjQ5fQ.BxGsLdwOmhzklOSbBavFQOU681VaT3um7qZ0x1sRMyo', '2026-01-04 14:52:46.713312+00', '2026-01-04 14:52:46.713312+00'),
('18311737-ffbe-40a4-b5a5-241dd2b41d93', 'ha_url', 'https://ubijd9zvct3uaenhmtl4xihltxgk8bo8.ui.nabu.casa', '2026-01-04 14:52:46.713312+00', '2026-01-04 14:52:46.713312+00');

-- =============================================================================
-- NOTES:
-- =============================================================================
-- Total rows exported: 73
--
-- Empty tables (not exported):
-- - horse_media (0 rows)
-- - floorplans (0 rows)
-- - alerts (0 rows)
-- - alert_history (0 rows)
-- - activity_history (5 rows exported separately below)
--
-- activity_history data is complex and stored in JSONB format
-- Import this carefully after all other tables are imported
-- =============================================================================

-- ACTIVITY_HISTORY TABLE (5 rows with complex JSON data)
-- Note: This data contains JSONB columns with complex nested data
-- You may need to adjust formatting depending on your import method
