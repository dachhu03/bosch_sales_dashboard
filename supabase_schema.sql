-- 1. Create auth_user Table (matches Django auth_user schema)
CREATE TABLE IF NOT EXISTS "auth_user" (
  "id" SERIAL PRIMARY KEY,
  "password" VARCHAR(128) NOT NULL,
  "last_login" TIMESTAMP WITH TIME ZONE,
  "is_superuser" SMALLINT NOT NULL DEFAULT 0,
  "username" VARCHAR(150) UNIQUE NOT NULL,
  "first_name" VARCHAR(150),
  "last_name" VARCHAR(150),
  "email" VARCHAR(254),
  "is_staff" SMALLINT NOT NULL DEFAULT 0,
  "is_active" SMALLINT NOT NULL DEFAULT 1,
  "date_joined" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Create exapp_totalsolutions Table
CREATE TABLE IF NOT EXISTS "exapp_totalsolutions" (
  "id" BIGSERIAL PRIMARY KEY,
  "application" VARCHAR(255) NOT NULL,
  "category" VARCHAR(50) NOT NULL,
  "product_name" VARCHAR(255) NOT NULL,
  "make" VARCHAR(255),
  "model" VARCHAR(255),
  "specification" TEXT,
  "uom" VARCHAR(300) NOT NULL,
  "buying_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "vendor" VARCHAR(255),
  "quotation_received_month" DATE,
  "lead_time" VARCHAR(50),
  "remarks" TEXT,
  "list_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "discount" INTEGER NOT NULL DEFAULT 0,
  "sales_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "sales_margin" INTEGER NOT NULL DEFAULT 0,
  "buying_price_updated_at" TIMESTAMP WITH TIME ZONE,
  "product_image" VARCHAR(100)
);

-- 3. Create exapp_boq Table
CREATE TABLE IF NOT EXISTS "exapp_boq" (
  "id" BIGSERIAL PRIMARY KEY,
  "project_name" VARCHAR(255) NOT NULL,
  "project_location" VARCHAR(255) NOT NULL,
  "quotation_number" VARCHAR(100) NOT NULL,
  "approach" VARCHAR(50) NOT NULL,
  "budget" VARCHAR(50) NOT NULL,
  "solution_title" VARCHAR(255) NOT NULL,
  "hardware" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "software" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "services" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "amc" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "totals" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- Enable Row Level Security (RLS) & Policies
-- ==========================================

ALTER TABLE "auth_user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exapp_totalsolutions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exapp_boq" ENABLE ROW LEVEL SECURITY;

-- 1. Policies for "auth_user" Table
CREATE POLICY "Enable all access for public" ON "auth_user" FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. Policies for "exapp_totalsolutions" Table
CREATE POLICY "Enable all access for public" ON "exapp_totalsolutions" FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Policies for "exapp_boq" Table
CREATE POLICY "Enable all access for public" ON "exapp_boq" FOR ALL TO public USING (true) WITH CHECK (true);


-- Dumping data for table "auth_user"
DELETE FROM "auth_user";
INSERT INTO "auth_user" (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES (3, 'pbkdf2_sha256$870000$csWtPmEoWY1d5qE21KAReC$VuFJAOoTwxoH5kdJD8cCvaNPBu4mlS5nV+eaG0V1QDA=', '2025-02-07 16:58:17.918731', 1, 'smart123', NULL, NULL, 'darshankm2003@gmail.com', 1, 1, '2025-01-30 12:06:05.904649');
INSERT INTO "auth_user" (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES (6, 'pbkdf2_sha256$870000$xW7crdhx1o8SXHi51rU6Nt$ov9dsJeALNxEFelLcVoQuL4+H75spH3MWqBCU6wISYg=', '2025-02-13 04:59:29.923987', 1, 'admin123', NULL, NULL, 'darshankm2003@gmail.com', 1, 1, '2025-02-13 04:58:47.759383');
INSERT INTO "auth_user" (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES (7, 'pbkdf2_sha256$870000$yqzvcYIDvtM8JIHBm6kHRH$NxIYzz8ob1BqKAJU3Ljr+Ec3huHt9IPUo2HCi9NGf4Q=', '2025-02-18 17:38:23.733330', 1, 'admin', NULL, NULL, 'darshankm2003@gmail.com', 1, 1, '2025-02-14 12:10:41.025722');
INSERT INTO "auth_user" (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES (8, 'pbkdf2_sha256$870000$mIfu7DgQqw1rBQPN0C0vzm$zhwBXHjrUrASWEqjr+RWKA6i3TSF/XgT91IxD25+z5g=', '2025-06-18 04:33:57.363218', 1, 'admin@123', NULL, NULL, 'darshankm2003@gmail.com', 1, 1, '2025-03-05 04:28:44.892881');
INSERT INTO "auth_user" (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES (9, 'pbkdf2_sha256$870000$3OImMV1wxQQ94F9Fq65ogC$tOzNKeh+AWojHs9JrB4uqhhc+J3sMIMPZ9hoSrBlGQA=', '2025-04-03 09:56:22.476305', 1, 'Bosch123', NULL, NULL, 'darshankm2003@gmail.com', 1, 1, '2025-04-02 09:00:12.192711');
INSERT INTO "auth_user" (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES (10, 'pbkdf2_sha256$870000$vqSTUfPJKkvteLPdhLjYcx$VvAt/ESNNgKgG2ftZvUTVdHpqi4Q8ZPiM2amtd7p1LU=', '2025-05-06 06:17:25.198078', 1, 'smart', NULL, NULL, 'smart123@gmail.com', 1, 1, '2025-05-06 06:16:58.809012');

-- Dumping data for table "exapp_totalsolutions"
DELETE FROM "exapp_totalsolutions";
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5716, 'Parking Access Control', 'hardware', 'Boom Barrier', 'Magnetic', 'Access PRO RA3500', 'Motorised Vehicle BarrierSide: Left Hand Version Controller: MGC Pro Control UnitLoop detector: integrated Two channel LoopDetectorBoom Type: Vario Boom of 3.5Meters lengthOpen / close time: 1.3 SecPower: Max 95 WattsLane Width: Up to 3.5 metersOpening/Closing Time: Adjustable from 1.3 seconds to 2.5 secondsCycles: Designed for 10 million opening and closing cycles (wear parts excluded)Drive Technology: MHTM™ (energy-efficient, maintenance-free, long service life)', 'Number', 197000.0, 'Magnetic', '2024-11-30 00:00:00', '45 - 60 days Standard', 'This price is negotiated for BNY Pune project, price may vary', 295500.0, 10, 265950.0, 25, '2025-06-18 04:42:48.143272', 'product_images/R.png');
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5717, 'Parking Access Control', 'hardware', 'Boom Barrier', 'Magnetic', 'Access PRO RA1500', 'Motorised Vehicle Barrier
Side: Left Hand Version 
Controller: MGC Pro Control Unit
Loop detector: integrated Two channel Loop
Detector
Boom Type: Vario Boom of 1.5
Meters length
Open / close time: 1.3 Sec
Power: Max 95 WattsLane Width: Up to 1.5 meters
Opening/Closing Time: Adjustable from 1.3 seconds to 2.5 seconds
Cycles: Designed for 10 million opening and closing cycles (wear parts excluded)
Drive Technology: MHTM™ (energy-efficient, maintenance-free, long service life)', 'Number', 197000.0, 'Magnetic', '2024-11-30 00:00:00', '45 - 60 days Standard', 'This price is negotiated for BNY Pune project, price may vary', 295500.0, 10, 265950.0, 25, '2025-04-14 03:53:04.647690', 'product_images/magnetic-boom-barrier-pedestrian-barriers-flap-barrier-turnstile.jpg');
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5718, 'Parking Access Control', 'hardware', 'Boom Barrier', 'Magnetic', 'Access  L 5000', 'Boom Arm Length: Up to 5 meters (16.40 feet)
Opening/Closing Time: Minimum 3 seconds (for 3-meter arm, adjustable up to 16 seconds)
Power Consumption: 120W maximum
Operating Temperature: -20°C to +55°C
Housing Protection: IP54
Control Unit: MGC Pro with programmable I/O, LCD screen, EN 13849 compliant', 'Number', 206000.0, 'Magnetic', NULL, '45 - 60 days Standard', NULL, 309000.0, 10, 278100.0, 25, '2025-02-14 04:09:33.498615', 'product_images/R_a4SCL1U.png');
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5719, 'Parking Access Control', 'hardware', 'RFID Reader', 'ID Tech', 'IDT-87I', 'Model: IDT-87 I
Operating Frequency: Standard ISM 865-867 MHz (IND),865-868 MHz (EU), 902-928 MHz (US)
Air Interface Protocol: ISO18000-6B, EPC Class 1 Gen2 (ISO18000-6C)
Read Range: Up to 14 meters
Output Power: 0 dBm to 30 dBm
Antenna: Built In Circular 9 dBi Antenna
External Antenna: 1 External Antenna Port Optional
RFID Module: Impinj R2000
Processor: Arm 9 (Linux OS)
Power Supply: Wide Voltage Input (+9V to +24V)
Power Over Ethernet (POE): Optional
Dimensions: 298mm x 298mm x 105mm
Weight: 2800 gm
Interfaces: Rs232, RS485, Weigand26/34 (TCP/IP & WIFI Optional)
Indicators: LED & Buzzer
Housing: Aluminium Housing with Engineering Plastic Cover
Temperature: -40°C to +60°C (Operating), -40°C to +60°C (Storage)
Protection Class: IP 66', 'Number', 42000.0, 'ID Tech', '2024-09-02 00:00:00', '45 - 60 days Standard', NULL, 63000.0, 10, 56700.0, 25, '2025-05-13 10:08:06.363039', 'product_images/rfid_reader.png');
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5720, 'Parking Access Control', 'hardware', 'RFID Reader', 'ID Tech', 'IDT-88L', 'Model: IDT-88L
Operating Frequency: Standard ISM 865-867 MHz (IND),865-868 MHz (EU), 902-928 MHz (US)
Air Interface Protocol: ISO18000-6B, EPC Class 1 Gen2 (ISO18000-6C)
Read Range: Up to 15 meters (tag and environment dependent)
Output Power: 0 dBm to 30 dBm (adjustable)
Antenna: Inbuilt 12 dBi Antenna
External Antenna: Optional
RFID Module: Impinj R2000
Processor: Arm 9 (Linux OS)
Power Supply: Wide Voltage Input (+9V to +24V)
Power Over Ethernet (POE): Optional
Dimensions: 298mm x 298mm x 105mm
Weight: 2800 gm
Interfaces: Rs232, RS485, Weigand26/34 (TCP/IP & WIFI Optional)
Indicators: LED & Buzzer
Housing: Aluminium Housing with Engineering Plastic Cover
Temperature: -40°C to +60°C (Operating), -40°C to +60°C (Storage)
Protection Class: IP 65', 'Number', 18500.0, 'ID Tech', '2024-09-26 00:00:00', '45 - 60 days Standard', NULL, 27750.0, 10, 24975.0, 25, '2025-05-13 10:08:06.369653', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5721, 'Parking Access Control', 'hardware', 'RFID Reader', 'Mivanta', 'RFG HR15T', 'Model: RFG-HR15T
Operating Frequency: Standard ISM 865-867 MHz (IND),865-868 MHz (EU), 902-928 MHz (US)
Air Interface Protocol: ISO18000-6B, 6C / EPC C1Gen2
Read Range: Up to 15 meters (According to Tag & Environment)
Output Power: 0dBm-30dBm
Antenna: 9dBi Built-in circular polarization
Processor: ARM9, 400MHz
Memory: Flash 128MB; DRAM 32 MB
Operating System: Linux 2.6
Firmware Upgrade Method: Demo software / Telnet
Dimensions: 290mm(L)*290mm(W)*55mm(H)
Weight: 1.6Kgs
Housing Material: Aluminium plate /ABS cover
Connectivity: RJ45, RS-232, RS-485, Wiegand
Power Supply: DC 24V/2.5A (DC 9V ~ 30V,60W)
Operating Temperature: -20 - +70°C
Storage Temperature: -40 - +85°C
Humidity: 5-95% non-condensing (+25°C)
Sealing: IP66', 'Number', 26500.0, 'Mivanta', '2024-11-27 00:00:00', '45 - 60 days Standard', NULL, 39750.0, 10, 35775.0, 25, '2025-05-13 10:08:06.376874', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5722, 'Parking Access Control', 'hardware', 'Camera', 'Bosch', 'NBE 3702 AL', 'Resolution: 2MP (1920 x 1080)
Lens: 3.3-10.2mm motorized varifocal lens
Field of View: 106° - 31°
IR Illumination: Up to 30m range
Video Compression: H.265, H.264, M-JPEG
Frame Rate: Up to 30 fps @ 1080p
HDR: 120 dB
Analytics: Intelligent Video Analytics, including line crossing, intrusion detection, and object counting
Housing: IP66 weatherproof, IK10 vandal-resistant
Operating Temperature: -30°C to +50°C', 'Number', 31000.0, 'Bosch Limited (BT)', '2024-04-25 00:00:00', '45 - 60 days Standard', NULL, 46500.0, 10, 41850.0, 25, '2025-05-13 10:08:06.384751', 'product_images/nbe-3702-al-bullet-2mp-3-3-10-2mm-ip66-ik10-ir.png');
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5723, 'Parking Access Control', 'hardware', 'Camera', 'Bosch', 'NDE - 5502 - AL - IN', 'Resolution: 2MP (1920 x 1080)
Lens: 3-9mm motorized varifocal lens
Field of View: 109° - 43°
IR Illumination: Up to 45m range
Video Compression: H.265, H.264, M-JPEG
Frame Rate: Up to 30 fps @ 1080p
Video Analytics: Built-in Essential Video Analytics
HDR: Yes
Starlight Technology: Yes
Hybrid Mode: Yes (analog video output)
Audio: Built-in microphone
Housing: IK10 vandal-resistant, IP66 weatherproof
Operating Temperature: -30°C to +60°C', 'Number', 57000.0, 'Bosch Limited (BT)', '2024-04-25 00:00:00', '45 - 60 days Standard', NULL, 85500.0, 10, 76950.0, 25, '2025-05-13 10:08:06.391036', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5724, 'Parking Access Control', 'hardware', 'Camera', 'CP Plus', 'CP-UNC-TB21ZL6S-VMDS', '-', 'Number', 6000.0, 'Aditya Infotech', '2024-06-14 00:00:00', '45 - 60 days Standard', 'This price is agreed based on airport projects for single quantity it may come across INR 7,500', 9000.0, 10, 8100.0, 25, '2025-05-13 10:08:06.398117', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5725, 'Parking Access Control', 'hardware', 'Ethernet control card', 'Magnetic', 'Ethernet (EM01)', 'Current consumption 50 mA
Baud rate 10 / 100 MBit/s
Max. cable length 98.5 ft
Cable type Cat-5, Twisted-Pair
Connector type RJ-45
Default IP-Adress 192.168.1.2
Supported protocols HTTP (Webserver)
                                     ICMP (Ping)
                                    TCP/IP (ModBus)
                                    DHCP Client
NetBios', 'Number', 25000.0, 'Magnetic', '2024-01-11 00:00:00', '45 - 60 days Standard', NULL, 37500.0, 10, 33750.0, 25, '2025-05-13 10:08:06.404263', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5726, 'Parking Access Control', 'hardware', 'Camera clamp', 'OEM', 'Suitable for Bosch 3702 AL', '-', 'Number', 2000.0, 'SeekHawk', '2024-08-28 00:00:00', '45 - 60 days Standard', NULL, 3000.0, 10, 2700.0, 25, '2025-05-13 10:08:06.411498', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5727, 'Parking Access Control', 'hardware', 'Loop detector', 'OEM', 'Single Channel-PD 132', '- **Supply Voltage**: 230V AC, 115V AC, 24V DC/AC, 12V DC/AC¹
- **Voltage Tolerance AC**: +10% / -15%¹
- **Voltage Tolerance DC**: ±15%¹
- **Power Consumption**: ≥5VA¹
- **Output Relays**: 240V/5A AC¹
- **Frequency Range**: 20 kHz to 170 kHz¹
- **Reaction Time**: 10ms¹
- **Sensitivity**: Adjustable in 4 increments¹
    - Higher: 0.02% ΔL/L¹
    - High: 0.05% ΔL/L¹
    - Low: 0.1% ΔL/L¹
    - Lower: 0.5%¹
- **Operating Temperature**: -20° C to +65° C¹
- **Storage Temperature**: -40° C to +85° C¹
- **Dimensions**: 78x40x108 mm (L x W x H)¹
- **Net Weight**: 265g¹', 'Number', 3600.0, 'ID Tech', NULL, '45 - 60 days Standard', NULL, 5400.0, 10, 4860.0, 25, '2025-05-13 10:08:06.418309', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5728, 'Parking Access Control', 'hardware', 'Loop detector', NULL, 'PD-232', '- **Supply Voltage**: 230V AC, 115V AC, 24V DC/AC, 12V DC/AC¹
- **Voltage Tolerance AC**: +10% / -15%¹
- **Voltage Tolerance DC**: ±15%¹
- **Power Consumption**: ≥5VA¹
- **Output Relays**: 240V/5A AC¹
- **Frequency Range**: 20 kHz to 170 kHz¹
- **Reaction Time**: 10ms¹
- **Sensitivity**: Adjustable in 4 increments¹
    - Higher: 0.02% ΔL/L¹
    - High: 0.05% ΔL/L¹
    - Low: 0.1% ΔL/L¹
    - Lower: 0.5%¹
- **Operating Temperature**: -20° C to +65° C¹
- **Storage Temperature**: -40° C to +85° C¹
- **Dimensions**: 78x40x108 mm (L x W x H)¹
- **Net Weight**: 265g¹', 'Number', 4500.0, 'Suyog Infra Solution', '2024-12-12 00:00:00', '14 Days Standard', NULL, 6750.0, 10, 6075.0, 25, '2025-05-13 10:08:06.424630', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5729, 'Parking Access Control', 'hardware', 'Card Reader', 'HID', 'ICLASS SER90', 'Dimensions**: 13.1" x 13.1" x 1.55" (33.3cm x 33.3cm x 3.9cm)¹.
- **Supported Contactless Smart Cards**: iCLASS Seos, iCLASS SE, standard iCLASS, MIFARE Classic, and MIFARE DESFire EV1¹.
- **Protocol**: Open Supervised Device Protocol (OSDP) mode, Wiegand or Clock & Data modes¹.
- **Warranty**: Limited lifetime warranty¹.', 'Number', 35000.0, 'HID', NULL, '45 - 60 days Standard', NULL, 52500.0, 10, 47250.0, 25, '2025-05-13 10:08:06.431505', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5730, 'Parking Access Control', 'hardware', 'Card Reader', 'HID', 'RP10', 'Dimensions**: 1.9" x 4.1" x 0.9" (4.8 cm x 10.3 cm x 2.3 cm)¹.
- **Supported Contactless Smart Cards**: iCLASS Seos, iCLASS SE, standard iCLASS, MIFARE Classic, and MIFARE DESFire EV1¹.
- **Protocol**: Open Supervised Device Protocol (OSDP) mode, Wiegand or Clock & Data modes¹.
- **Warranty**: Limited lifetime warranty¹.', 'Number', 11000.0, 'HID', NULL, '45 - 60 days Standard', NULL, 16500.0, 10, 14850.0, 25, '2025-05-13 10:08:06.438464', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5731, 'Parking Access Control', 'hardware', 'POS Device', 'Sunmi', 'V2 Pro', '**Operating System**: Android 7.1 / SUNMI Cloud OS⁴.
- **CPU**: Qualcomm Snapdragon quad-core 1.4 GHz⁴.
- **Memory**: 8GB ROM - 1GB RAM⁴.
- **Display**: 5.99 inches HD + 1440x720 pixels, IPS⁴.
- **Camera**: 5.0 MP with Flash and AF⁴.
- **NFC Compatibility**: ISO 14443 A/B, ISO 15693, Felica®, Mifare®⁴.
- **Professional Barcode Reader**⁴.
- **Built-in Printer**⁴.', 'Number', 14400.0, 'Areteinfo', '2024-08-09 00:00:00', '45 - 60 days Standard', NULL, 21600.0, 10, 19440.0, 25, '2025-05-13 10:08:06.445113', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5732, 'Parking Access Control', 'hardware', 'Photocell set', 'Centurion', 'i5 Infrared Beam Set I5V3', '* Power Supply: 	12 - 24V DC/AC
* Power Consumption Transmitter: 	21mA
* Receiver: 	43mA @ 12V
* Maximum Distance: 	40m
* Alignment 	Automatic - 9m² @ 10m (parallel - circular area)
* Output Contact Rating: 	5A @ 220V AC (non-inductive)
* Operating Temperature 	-15°C to +55°C
* Operating Humidity: 	0% - 90% (non-condensing)
* Degree of Protection: 	IP54', 'Number', 15000.0, 'Magnetic', NULL, '45 - 60 days Standard', NULL, 22500.0, 10, 20250.0, 25, '2025-05-13 10:08:06.452711', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5733, 'Parking Access Control', 'hardware', 'Remote for BB', 'Magnetic', 'RX2NV3433, Helix Receiver 2Ch RX2NHV2433', 'Output channels 	2
Compatible remotes 	1 Button, 2 Button, 4 Button
Operating frequency 	433.92MHz
Supply voltage 	12V to 24V DC
Quiescent current @ 12V DC 	11mA
Maximum current @ 12V DC 	40mA
Operating temperature 	Minus 15°C to Positive 50°C
Humidity 	0 to 90% (non condensing)
Sensitivity 	Minus 115dB
Self learning memory 	250 buttons
Receiver enclosure 	UV Stabilised ABS plastic
Receiver dimensions 	115mm(L) x 67mm(W) x 30mm(H)
Package dimensions 	117mm(l) x 69mm(w) x 35mm(h)
Package weight 	127g
Warranty 	24 Month carry in product Manufacturers warranty', 'Number', 9000.0, 'Magnetic', '2024-01-11 00:00:00', '45 - 60 days Standard', NULL, 13500.0, 10, 12150.0, 25, '2025-05-13 10:08:06.459351', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5734, 'Parking Guidance System', 'hardware', 'Slot Sensor', 'Bosch', 'V1.1_US_RS_Ultrasonic slot sensor', 'PZ Qube Sensor', 'Number', 4500.0, 'BGSW', NULL, '45 - 60 days Standard', NULL, 6750.0, 10, 6075.0, 25, '2025-05-13 10:08:06.465788', 'product_images/OIP.jpg');
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5735, 'Parking Guidance System', 'hardware', 'Zone Controller', 'Bosch', 'V1.1_ZC_TCP_Zone Controller', 'Upto 24 Slots in one', 'Number', 3500.0, 'BGSW', NULL, '45 - 60 days Standard', NULL, 5250.0, 10, 4725.0, 25, '2025-05-13 10:08:06.473317', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5736, 'Parking Guidance System', 'hardware', 'LED Indicator', 'OEM', 'Common Anode', 'Red and Green Led Lights
Binex 22.5 mm, Led Dual colour Busbar Indicating Lamp Red & Green. Dome shape, Thread type Available voltage:- 24V DC', 'Number', 268.0, 'Binex Controls', '2024-11-21 00:00:00', '45 - 60 days Standard', NULL, 402.0, 10, 361.8, 25, '2025-05-13 10:08:06.479555', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5737, 'Parking Guidance System', 'hardware', 'ZC Power Adapter', 'CUI inc.', 'SD150-18-U-P6 / SD150-18-U-P5', NULL, 'Number', 4000.0, 'KA Electronics', '2024-01-10 00:00:00', '45 - 60 days Standard', NULL, 6000.0, 10, 5400.0, 25, '2025-05-13 10:08:06.486574', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5738, 'Parking safety Feature', 'hardware', 'Camera clamp', 'Bosch', 'NDA-U-WMT (Pendant Wall mount suitable for Bosch 8503 RXT)', '*Pendant wall mount – NDA-U-WMT', 'Number', 6750.0, 'SeekHawk', NULL, '45 - 60 days Standard', NULL, 10125.0, 10, 9112.5, 25, '2025-05-13 10:08:06.493077', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5739, 'Parking safety Feature', 'hardware', 'Camera clamp', 'Bosch', 'NDA-8000-PIPW (Pendant interface plate , outdoor)', '*Pole mount adapter – NDA-U-PMAS', 'Number', 1900.0, 'SeekHawk', '2024-08-28 00:00:00', '45 - 60 days Standard', NULL, 2850.0, 10, 2565.0, 25, '2025-05-13 10:08:06.499517', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5740, 'Parking Access Control', 'hardware', 'Camera', 'CP Plus', 'CP-UNC-DA51L3C', NULL, 'number', 0.0, 'Aditya Infotech', NULL, '45 - 60 days Standard', NULL, 0.0, 10, 0.0, 0, NULL, NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5741, 'Parking Access Control', 'software', 'Anpr License', 'Bosch', 'ANPR License for access control per gate', 'License for ANPR ,Evidence captureand Analytics', 'Number', 37000.0, 'Uncanny', '2024-01-17 00:00:00', '45 - 60 days Standard', NULL, 55500.0, 10, 49950.0, 25, '2025-05-13 10:08:06.512726', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5742, 'Parking Access Control', 'software', 'Anpr License', 'Bosch', 'ANPR License for evidence capture', 'License for ANPR ,Evidence captureand Analytics', 'Number', 30000.0, 'Uncanny', '2024-01-17 00:00:00', '45 - 60 days Standard', NULL, 45000.0, 10, 40500.0, 25, '2025-05-13 10:08:06.519398', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5743, 'Parking Access Control', 'software', 'EPLD License', 'Bosch', 'EPLD  License', NULL, 'Number', 1800.0, NULL, NULL, '45 - 60 days Standard', NULL, 2700.0, 10, 2430.0, 25, '2025-05-13 10:08:06.526289', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5744, 'Parking Access Control', 'software', 'EPLD + ANPR License', 'Bosch', 'EPLD + ANPR  License', NULL, 'Number', 2850.0, NULL, NULL, '45 - 60 days Standard', NULL, 4275.0, 10, 3847.5, 25, '2025-05-13 10:08:06.532792', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5745, 'Parking Access Control', 'software', 'OSD License', 'Bosch', 'OSD  License for access control per gate', NULL, 'Number', 50000.0, 'Uncanny', '2023-12-20 00:00:00', '45 - 60 days Standard', NULL, 75000.0, 10, 67500.0, 25, '2025-05-13 10:08:06.539790', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5746, 'Parking Access Control', 'hardware', 'Filter', 'Bosch', 'NBE 5702  AL', 'Resolution: 2MP (1920 x 1080)
Lens: 3.2-10.5mm motorized varifocal lens
Field of View: 105° - 31°
IR Illumination: Up to 60m range
Video Compression: H.265, H.264, M-JPEG
Frame Rate: Up to 60 fps @ 1080p
HDR: 134dB
Analytics: Intelligent Video Analytics Pro (IVA Pro) with deep learning-based detection of people and vehicles
Housing: IP66/IP67 weatherproof, IK10 vandal-resistant
Operating Temperature: -40°C to +55°C', 'Number', 66900.0, 'Bosch Limited (BT)', '2024-05-10 00:00:00', '45 - 60 days Standard', NULL, 100350.0, 10, 90315.0, 25, '2025-05-13 10:08:06.545700', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5747, 'Parking Access Control', 'hardware', 'Push Button', 'OEM', '-', NULL, 'Number', 1000.0, 'ID Tech', NULL, '45 - 60 days Standard', NULL, 1500.0, 10, 1350.0, 25, '2025-05-13 10:08:06.552204', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5748, 'Parking Access Control', 'hardware', 'Binex Led Tower Lamp', 'Binex', NULL, 'Binex Two Tower Lamp, Led Type, Red-Green Colour, stand and mounting accessories. CE Approved. Available Voltage:-230 V AC
HSN Code : 85392990', 'Number', 1000.0, 'Binex Controls', '2024-04-12 00:00:00', '45 - 60 days Standard', NULL, 1500.0, 10, 1350.0, 25, '2025-05-13 10:08:06.559468', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5749, 'Parking Access Control', 'hardware', 'Boom Barrier', 'ZKTecho', 'BG1000', 'Motor Type: 24V brushless DC motor
Motor MCBF (Mean Cycles Between Failures): 5 million times
Boom Arm Length Options: 3 meters, 4.5 meters, or 6 meters
Opening/Closing Time: 1.5 seconds for 3m arm
Power Supply: AC 220V, 50Hz / AC 110V, 60Hz
Backup Battery: 24V backup battery for operation during power outages
Operating Temperature: -35°C to 70°C
Operating Humidity: <90%
Protection Level: IP54 (chassis), IP44 (boom arm)
Control Panel: Programmable control panel with LCD display
Remote Control: Wireless remote control with up to 30m range', 'Number', 40000.0, 'ZK Techo', NULL, '45 - 60 days Standard', NULL, 60000.0, 10, 54000.0, 25, '2025-05-13 10:08:06.566752', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5750, 'Parking Access Control', 'hardware', 'Remote for BB', 'ZKTecho', 'Accessories', 'Remote ,photcell, pushbutton', 'Number', 11750.0, 'ZK Techo', NULL, '45 - 60 days Standard', NULL, 17625.0, 10, 15862.5, 25, '2025-05-13 10:08:06.573597', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5751, 'Parking Access Control', 'hardware', 'RFID Reader', 'Zebra', 'FX 9600 -42325A50-IN', 'FX9600 Fixed RFID Reader -4port ,POE,India BIS', 'Number', 57250.0, 'Sato Global', '2024-07-29 00:00:00', '45 - 60 days Standard', NULL, 85875.0, 10, 77287.5, 25, '2025-05-13 10:08:06.580800', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5752, 'Parking Access Control', 'hardware', 'Clamp for reader', 'Zebra', 'Clamp for Zebra RFID Reader', NULL, 'Number', 4500.0, 'Sato Global', '2024-07-29 00:00:00', '45 - 60 days Standard', NULL, 6750.0, 10, 6075.0, 25, '2025-05-13 10:08:06.588677', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5753, 'Parking Access Control', 'hardware', 'Power Adapter', 'Zebra', 'Power Adapter for Zebra', 'Level VI AC/DC Power Supply brick w/captive DC Cable .AC input :100-240V,1.4ADC Output:24V,3.25A,78W,-20to +55 degreesC.Requires :Country specific grounded AC line Cord', 'Number', 4500.0, 'Sato Global', '2024-07-29 00:00:00', '45 - 60 days Standard', NULL, 6750.0, 10, 6075.0, 25, '2025-05-13 10:08:06.596664', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5754, 'Parking Access Control', 'hardware', 'Antenna', 'Zebra', 'AN440-CPDFQ915WR', 'High performance Dual Antenna for indoor and outdoor use ,white color, Size Inches :22.6 x 10.2 x 1.32', 'Number', 17600.0, 'Sato Global', '2024-07-29 00:00:00', '45 - 60 days Standard', NULL, 26400.0, 10, 23760.0, 25, '2025-05-13 10:08:06.604425', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5755, 'Parking Access Control', 'hardware', 'RF CABLE', 'Zebra', 'CBLRD-184003600R', 'RF Cable TNC TO N type 10 mtr', 'Number', 4300.0, 'Sato Global', '2024-07-29 00:00:00', '45 - 60 days Standard', NULL, 6450.0, 10, 5805.0, 25, '2025-05-13 10:08:06.611414', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5756, 'Parking Access Control', 'hardware', 'Camera', 'Bosch', 'NDE-8503-RXT', 'Resolution: 4MP (2560 x 1440)
Lens: 12-40mm motorized varifocal lens with PTRZ (Pan, Tilt, Roll, Zoom)
Field of View: 36.8° - 20.3°
Sensor: 1/1.8" CMOS
Frame Rate: Up to 60 fps @ 4MP
Video Compression: H.265, H.264, M-JPEG
HDR: HDR X for high dynamic range without motion artifacts
Starlight Technology: Starlight X for exceptional low-light performance
Intelligent Video Analytics: Built-in IVA with object detection and Camera Trainer for custom object recognition
Housing: IK10+ vandal-resistant, IP66/IP6K9K weatherproof
Remote Commissioning: Pan, tilt, roll, and zoom remotely using Bosch Project Assistant app', 'Number', 109000.0, 'Bosch Limited (BT)', '2023-12-20 00:00:00', '45 - 60 days Standard', NULL, 163500.0, 10, 147150.0, 25, '2025-05-13 10:08:06.619726', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5757, 'Parking Access Control', 'hardware', 'IR Illuminator', 'Bosch', 'IIR-50850-MR', 'Wavelength: 850 nm (invisible to the human eye)
Illumination Range: Medium range (up to 220 meters)
Beam Angle: Adjustable (10°, 20°, 30°, 60°, 80°, 95°)
IR Intensity: Adjustable (10% to 100%)
Day/Night Switching: Built-in photocell with adjustable sensitivity (20 lux to 70 lux)
Interchangeable Diffusers: For customizing the beam pattern to match the camera''s field of view
Self-cleaning Lens Coating: Helps maintain optimal performance in dusty environments
Telemetry Input: For external switching and monitoring
Housing: Robust anodized aluminum extrusion', 'Number', 34445.0, 'Bosch Limited (BT)', '2023-12-20 00:00:00', '45 - 60 days Standard', NULL, 51667.5, 10, 46500.75, 25, '2025-05-13 10:08:06.626700', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5758, 'Parking Access Control', 'hardware', 'Camera clamp', 'Bosch', '*Pendant wall mount – NDA-U-WMT 
*Pole mount adapter – NDA-U-PMAS', '*Pendant wall mount – NDA-U-WMT 
*Pole mount adapter – NDA-U-PMAS', 'Number', 5900.0, 'SeekHawk/Bosch Limited (BT)', '2023-12-20 00:00:00', '45 - 60 days Standard', NULL, 8850.0, 10, 7965.0, 25, '2025-05-13 10:08:06.633826', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5759, 'Parking Access Control', 'hardware', 'Camera', 'Bosch', 'NBE-7703-ALXT', 'Resolution: 4MP (2560 x 1440)
Lens: 10.5-47mm motorized varifocal lens
Field of View: 41.6° - 9.3°
Sensor: 1/1.8" CMOS
Frame Rate: Up to 60 fps @ 4MP
Video Compression: H.265, H.264, M-JPEG
HDR: HDR X for enhanced dynamic range without motion blur
Starlight X Technology: Superior low-light performance
Intelligent Video Analytics Pro (IVA Pro): Deep-learning-based object detection (people, vehicles)
Intelligent IR Illumination: Up to 80m range, adapts to zoom level
Housing: IP66/IP67 weatherproof, IK10 vandal resistant
Operating Temperature: -40°C to +60°C', 'Number', 162194.0, 'Bosch Limited (BT)', NULL, '45 - 60 days Standard', NULL, 243291.0, 10, 218961.9, 25, '2025-05-13 10:08:06.642040', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5760, 'Parking Access Control', 'hardware', 'Boom Barrier', 'Magnetic', 'ACCESSPRO-LRA06000', 'Boom Arm Length: Up to 6.0 meters (20 feet)
Opening/Closing Time: Minimum 4.0 seconds (adjustable to 6 or 8 seconds)
Power Consumption: 25W maximum
Operating Temperature: -20°C to +55°C
Housing Protection: IP54
Control Unit: MGC PRO with programmable I/O, LCD screen, and EN 13849 compliant', 'Number', 206000.0, 'Magnetic', NULL, '45 - 60 days Standard', NULL, 309000.0, 10, 278100.0, 25, '2025-05-13 10:08:06.650140', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5761, 'Parking Access Control', 'software', 'on cloud dashboard', 'Bosch', 'Dashboard Charges per camera on cloud', 'Dashboard charges per year (Annual Recurring )', 'Number', 10000.0, 'Bosch PZ', NULL, '45 - 60 days Standard', 'per camera cost cloud dashboard', 15000.0, 10, 13500.0, 25, '2025-05-13 10:08:06.657627', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5762, 'Parking Access Control', 'software', 'on premises dashboard', 'Bosch', 'Dashboard Charges per camera on Premises', 'Dashboard charges per year (One time )', 'Number', 50000.0, 'Bosch PZ', NULL, '45 - 60 days Standard', 'Per camera cost on premises', 75000.0, 10, 67500.0, 25, '2025-05-13 10:08:06.664933', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5763, 'Parking Guidance System', 'hardware', 'Led Display', 'Pixel Pro', 'P5 Outdoor SMD LED Video wall', 'Pixel Pitch(mm) 5mm
LED Lamp Kinglight
Pixel Density(pixel/m²) 40000pixels/m²
Brightness 4200-6500 (cd/m²)
Viewing Angle 140° from Centre
Gray Scale ≥14Bit
Refresh Rate(Hz) 3840Hz
Module Size(mm) 320mm x 160mm
Protection Level IP65
Module Resolution 64pixels x 32pixels
Working Voltage(v) DC5V±10%
Maximum Current 18A
Power Consumption (Max) ≥400W (W/m2)
Maintenance Method Front
Color temperature 3500° — 9500° K(adjustable)
Contrast ratio 5000:1(adjustable)
Operating Temperature -15℃～55℃
Storage Temperature -35℃～65℃
Working Humidity 10%-95%RH
Lifespan(hours) at 50% Brightness ≥100000
Certification BIS, CE,RoHS,EMC,ISO', 'Number', 5400.0, 'Pixel Pro Displays', '2024-10-03 00:00:00', '45 - 60 days Standard', 'Per sq ft', 8100.0, 10, 7290.0, 25, '2025-05-13 10:08:06.672439', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5764, 'Parking Access Control', 'hardware', 'Camera', 'Bosch', 'NUE_3702_F04', 'Frame rate (fps)	1 – 30 fps
Horizontal field of view (º)	106 °
Impact protection	IK10
IP rating	IP66
Lens focal length (mm)	3.2 mm
Operating temperature (°C)	-30 – 50 °C
Operating temperature (°F)	-22 – 122 °F
Sensor type	1/2.8 inch CMOS
Video compression	H.264 (ISO/IEC 14496-10); M-JPEG; H.265/HEVC', 'Number', 20000.0, 'Bosch Limited (BT)', '2024-10-01 00:00:00', '45 - 60 days Standard', 'Price may vary on quantity.
This price we received for 155 Qty', 30000.0, 10, 27000.0, 25, '2025-05-13 10:08:06.681361', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5765, 'Parking Access Control', 'hardware', 'Industrial Box PC', 'Mootek', 'MBOX-520-i3-6U-6C-3G', 'I3 3rd Gen Processor,
8GB RAM, 
512GB SDD,
 2*LAN/ 2COM RS232/4COM RS485/4USB*3.0/2USB*2.0/ HDMI/VGA/WIFI', 'Number', 32000.0, 'Mootek', '2024-10-15 00:00:00', '45 - 60 days Standard', 'This quote received for BNY Pune project', 48000.0, 10, 43200.0, 25, '2025-05-13 10:08:06.689320', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5766, 'Parking Access Control', 'hardware', '6U Network Rack wall mount (Outdoor)', 'Alpine', NULL, 'Size of Rack                        : 600w x 450d  (in mm)
Material                                : GI steel 1.2mm
Surface protection             : Polyester Epoxy powder coating
Color                                    : Light grey (RAL 7035)
Front Doo                            : Full Steel Door mounted with rubber  gasket, with lock & key
19” Rails                               : two pairs of 19” equipment mounting rails front & back adjustable.
Cable Entry glands & Fan exhaust will be provided at bottom of the rack.
Weather Protection:       IP 65 equivalent
Included Accessories:
1.       side mount cooling fan 4”, 90CFM, 230 VAC with 2 pin mains cord – 1 pc
2.       PDU: 5amp 4 sockets  – 1 pc
3.       Mounting Hardware: Pack of 10 sets of M6 Cage nut with washer head Screws – 1 packet', 'Number', 5900.0, 'Alpine Rack', '2024-08-02 00:00:00', '45 - 60 days Standard', NULL, 8850.0, 10, 7965.0, 25, '2025-05-13 10:08:06.696724', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5767, 'Parking Access Control', 'hardware', 'Pole Mount Bracket', 'Alpine', NULL, 'Pole Mount Bracket', 'Number', 850.0, 'Alpine Rack', '2024-08-02 00:00:00', '45 - 60 days Standard', NULL, 1275.0, 10, 1147.5, 25, '2025-05-13 10:08:06.705366', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5768, 'Parking Access Control', 'hardware', 'im sharing the rate crad', 'Bosch', 'NBE-3502 AL', 'Bullet 2MP HDR 3.2-10mm IP66 IK10 IR
Frame rate (fps)	25 – 30 fps
Horizontal field of view (º)	104 – 54 °
Impact protection	IK10
IP rating	IP66
Lens focal length (mm)	3.20 – 10 mm
Monochrome (lx)	0.02 lx
Operating temperature (°C)	-30 – 50 °C
Operating temperature (°F)	-22 – 122 °F
Resolution	1280 x 1024; 1280 x 720; 768 x 432; 640 x 480; 720 x 480
Sensor type	1/2.8 inch CMOS
Video compression	H.264 (ISO/IEC 14496-10); M-JPEG; H.265/HEVC', 'Number', 31500.0, 'CPK Fire and Security Systems Pvt Ltd', '2024-06-26 00:00:00', '45 - 60 days Standard', 'This price is agreed for Ador power Project 
Price varies per quantity INR 37,000', 47250.0, 10, 42525.0, 25, '2025-05-13 10:08:06.713891', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5769, 'Parking Access Control', 'software', 'Optiplex Tower', 'Dell', 'OptiPlex Tower Plus 7020', NULL, 'Number', 83595.0, 'Dell Technologies', '2024-09-06 00:00:00', '45 - 60 days Standard', 'Pricing as per latest quote received for Myciti supply', 125392.5, 10, 112853.25, 25, '2025-05-13 10:08:06.722937', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5770, 'Parking Access Control', 'hardware', 'LPU', 'Dell', 'Precision 3460 SFF CTO BASE', NULL, 'Number', 80000.0, 'Dell Technologies', '2024-11-06 00:00:00', '45 - 60 days Standard', 'Pricing as per latest quote received for Adugodi FCM project', 120000.0, 10, 108000.0, 25, '2025-05-13 10:08:06.736967', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5771, 'Parking Access Control', 'software', 'Precision Tower XCTO Base', 'Dell', 'Precision 5860 Tower XCTO Base', NULL, 'Number', 270000.0, 'Dell Technologies', '2024-04-23 00:00:00', '45 - 60 days Standard', NULL, 405000.0, 10, 364500.0, 25, '2025-05-13 10:08:06.743793', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5772, 'Parking Access Control', 'hardware', 'SSD Hardware', 'Crucial', 'T700 1TB PCIe Gen5 NVMe M.2 SSD with Heatsink', NULL, 'Number', 18900.0, 'KA Electronics', '2024-08-14 00:00:00', '45 - 60 days Standard', NULL, 28350.0, 10, 25515.0, 25, '2025-05-13 10:08:06.750578', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5773, 'Parking Access Control', 'hardware', 'SSD Hardware', 'Crucial', 'T700 1TB PCIe Gen5 NVMe M.2 SSD without Heatsink', NULL, 'Number', 17200.0, 'KA Electronics', '2024-08-14 00:00:00', '45 - 60 days Standard', NULL, 25800.0, 10, 23220.0, 25, '2025-05-13 10:08:06.758354', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5774, 'Parking Access Control', 'hardware', 'Ethernet Relay', 'Devantech', 'ETH002-B - 2 x 16A ethernet relay', NULL, 'Number', 8700.0, 'Kiran Computech', '2024-11-06 00:00:00', '45 - 60 days Standard', 'This pice is for 20 qty , Price may vary
Lastest quote received for BNY Pune project', 13050.0, 10, 11745.0, 25, '2025-05-13 10:08:06.766123', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5775, 'Parking Guidance System', 'hardware', 'Led Display', 'Process Care', 'P6 LED Pitch', 'Width – 0.6 m * Height – 0.4 m , 2 Line', 'Number', 34200.0, 'Proces Care', '2024-04-25 00:00:00', '45 - 60 days Standard', 'Price may vary on quantity.
This price we received for 6 Qty - Nayara', 51300.0, 10, 46170.0, 25, '2025-05-13 10:08:06.778702', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5776, 'Parking Guidance System', 'hardware', 'Led Display', 'Process Care', NULL, 'Dot Matrix, 13.3 mm Pitch
2 Pixes for Displaying Speed
Backlight for Header and Footer
Lan Based Communication MS Powder
Coated Enclosure', 'Number', 43200.0, 'Proces Care', '2024-02-21 00:00:00', '45 - 60 days Standard', NULL, 64800.0, 10, 58320.0, 25, '2025-05-13 10:08:06.787643', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5777, 'Parking Access Control', 'hardware', 'Traffic Lights', 'Vara', NULL, NULL, 'Number', 10000.0, 'Vara', '2024-09-13 00:00:00', '45 - 60 days Standard', NULL, 15000.0, 10, 13500.0, 25, '2025-05-13 10:08:06.795233', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5778, 'Parking Access Control', 'hardware', 'RFID reader Pole', 'Areteinfo', NULL, 'Dia: 3 inch  
Material: MS / GI 
Height: 9 feet 
Pipe Thickness: 2mm
Other Info: L Bend length of 2ft at the top
*Surface Treatment: Poweder Coated / Galvanization 
*Corss Section: Circular
*Base Plate Shape: Circular
*Pase Plate Thickness: 8mm to 10mm 
*Welding Type: MIG
*Stiffner: 4', 'Number', 7200.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & bareilly Airport project, Price will differ', 10800.0, 10, 9720.0, 25, '2025-05-13 10:08:06.802466', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5779, 'Parking Access Control', 'hardware', 'Power Cable', 'Polycab / Finolex', NULL, '3 Core, 1.5 Sq mm, Outdoor Cable', 'Number', 65.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', '65 / Mtr for total of 250 Mtr
This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 97.5, 10, 87.75, 25, '2025-05-13 10:08:06.809104', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5780, 'Parking Access Control', 'hardware', 'NON POE switch', 'Netgeat / Dlink / TP Link', NULL, 'Supply:
*Ports: 4 Port
*Type: NoN PoE
*Switch Category: Unmanaged
*Switch Speed: 10/100
*PoE budget: N.A.', 'Number', 1000.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly project, Price will differ', 1500.0, 10, 1350.0, 25, '2025-05-13 10:08:06.815693', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5781, 'Parking Access Control', 'hardware', 'CAT6 cable', 'Dlink / Molex / Equivalent', NULL, 'Outdoor Grade', 'Number', 32.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', '32 / Mtr for total of 225 Mtr
This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 48.0, 10, 43.2, 25, '2025-05-13 10:08:06.822869', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5782, 'Parking Access Control', 'hardware', 'LPU/ Fastag Controller', 'DELL / Lenovo / Equivalent', NULL, 'PC  (with Internet, Mouse, Display, Keypad)
Recommended Configuration:
*i5+
*16GB+ RAM
*500GB+ SSD
*Windows/Ubuntu OS', 'Number', 17000.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 25500.0, 10, 22950.0, 25, '2025-05-13 10:08:06.829238', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5783, 'Parking Access Control', 'hardware', 'Magnetic Loop Cable', 'Polycab / Finolex', NULL, '1 Core, 1.5 Sqmm', 'Number', 610.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 915.0, 10, 823.5, 25, '2025-05-13 10:08:06.840993', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5784, 'Parking Access Control', 'hardware', 'Loop Detector', 'OEM', NULL, 'Single Channel', 'Number', 3600.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 5400.0, 10, 4860.0, 25, '2025-05-13 10:08:06.847760', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5785, 'Parking Access Control', 'software', 'FasTag Software (Annual Recurring)', 'OEM', NULL, '*FASTag  SW License
*Reporting Module 
*Operator Module
*Configuration Module
*Email Alerts in case of Failures and to provide the device status
*Device Health Status
*Dashboard : user management, collection, reconciliation reports', 'Number', 17850.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 26775.0, 10, 24097.5, 25, '2025-05-13 10:08:06.853366', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5786, 'Parking Access Control', 'software', 'Cloud Charges (Annual Recurring)', 'OEM', NULL, '*Data Retention (with Camera Image)- 3 Months', 'Number', 15000.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 22500.0, 10, 20250.0, 25, '2025-05-13 10:08:06.859987', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5787, 'Parking Access Control', 'hardware', 'POS Machine', 'SUNMI / Equivalent', NULL, NULL, 'Number', 14400.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 21600.0, 10, 19440.0, 25, '2025-05-13 10:08:06.866375', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5788, 'Parking Access Control', 'hardware', '2 core cable for Triggering Boom Barrier', 'Dlink / Molex / Equivalent', NULL, 'Outdoor Grade', 'Number', 32.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', '32/mtr for a total of 75 Mtr
This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 48.0, 10, 43.2, 25, '2025-05-13 10:08:06.873407', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5789, 'Parking Access Control', 'hardware', 'HDPE / PVC Pipe & accessories', 'VIP / OEM', NULL, '*Diameter: 50mm 
*Material: HDPE
*Accessories: 90 Degree Elbow, Couplers, Glue Etc…', 'Number', 90.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', '90 / Mtr for total of 130 Mtr
This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 135.0, 10, 121.5, 25, '2025-05-13 10:08:06.879893', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5790, 'Parking Guidance System', 'hardware', 'Display', 'OEM', NULL, '*Protocol:  TCP/IP 
*2 Rows 12 Character
*Outdoor User Display(SMD P4 RGB 324mm x 164mm x 70mm, water & dust resistant, IP 65 Rating).', 'Number', 15500.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project, Price will differ', 23250.0, 10, 20925.0, 25, '2025-05-13 10:08:06.887079', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5791, 'Parking Access Control', 'hardware', 'RFID reader Pole', 'Park 360', NULL, 'Dia: 3 inch Material: MS / GI Height: 9 feet Pipe Thickness: 2mm
Other Info: L Bend length of 2ft at the top
*Surface Treatment: Poweder Coated / Galvanization
 *Corss Section: Circular 
*Base Plate Shape: Circular
 *Pase Plate Thickness: 8mm to 10mm
 *Welding Type: MIG
*Stiffner: 4', 'Number', 8000.0, 'Park 360', '2024-07-29 00:00:00', '45 - 60 days Standard', 'This price is taken from Surat Airport, Price will differ on quantity', 12000.0, 10, 10800.0, 25, '2025-05-13 10:08:06.894119', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5792, 'Parking Access Control', 'hardware', 'POE Switch', 'Netgeat / Dlink / TP Link', NULL, 'Supply: *Ports: 4 Port 
*Type: PoE 
*Switch Category: Unmanaged
*Switch Speed: 10/100
*PoE budget: Low Budget ( Min 30W)', 'Number', 3800.0, 'Park 360', '2024-07-29 00:00:00', '45 - 60 days Standard', 'This price is taken from Surat Airport, Price will differ on quantity', 5700.0, 10, 5130.0, 25, '2025-05-13 10:08:06.900631', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5793, 'Parking Access Control', 'hardware', 'Power cable', 'Polycab / Finolex /APAR', NULL, '3 Core, 1.5 Sq mm, Outdoor Cable', 'Number', 65.0, 'Park 360', '2024-07-29 00:00:00', '45 - 60 days Standard', '65/ Mtr for total of 200 Mtr 
This price is taken from Surat Airport, Price will differ on quantity
Please consider price at higher end', 97.5, 10, 87.75, 25, '2025-05-13 10:08:06.907224', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5794, 'Parking Access Control', 'hardware', 'Magnetic Loop Cable', 'Polycab / Finolex / APAR /Similar', NULL, '1 Core, 1.5 Sqmm', 'Number', 3500.0, 'Park 360', '2024-07-29 00:00:00', '45 - 60 days Standard', 'This price is taken from Surat Airport, Price will differ on quantity', 5250.0, 10, 4725.0, 25, '2025-05-13 10:08:06.914247', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5795, 'Parking Access Control', 'software', 'FasTag Software (Annual Recurring)', 'Areteinfo', NULL, '*FASTag SW License 
*Reporting Module
 *Operator Module
 *Configuration Module
 *Email Alerts in case of Failures and to provide the device status
 *Device Health Status
 *Dashboard : user management, collection,
reconciliation reports', 'Number', 25000.0, 'Park 360', '2024-07-29 00:00:00', '45 - 60 days Standard', 'This price is taken from Surat Airport, Price will differ on quantity', 37500.0, 10, 33750.0, 25, '2025-05-13 10:08:06.919924', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5796, 'Parking Access Control', 'software', 'Cloud Charges (Annual Recurring)', 'Areteinfo', NULL, '*Data Retention (with Camera Image)- 3 Months', 'Number', 10000.0, 'Park 360', '2024-07-29 00:00:00', '45 - 60 days Standard', 'This price is taken from Surat Airport, Price will differ on quantity', 15000.0, 10, 13500.0, 25, '2025-05-13 10:08:06.925986', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5797, 'Parking Access Control', 'hardware', 'ETH002-B - 2 x 16A ethernet relay', 'Devantech', 'ETH002-B', NULL, 'Number', 8300.0, 'Suyog', '2024-08-21 00:00:00', '45 - 60 days Standard', 'This Price is from Adobe project, Please consider price at higher end', 12450.0, 10, 11205.0, 25, '2025-05-13 10:08:06.933955', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5798, 'Parking Access Control', 'hardware', 'Relay Adaptor', NULL, NULL, NULL, 'Number', 2300.0, 'Suyog', '2024-08-21 00:00:00', '45 - 60 days Standard', 'This Price is from Adobe project, Please consider price at higher end', 3450.0, 10, 3105.0, 25, '2025-05-13 10:08:06.940397', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5799, 'Parking Access Control', 'hardware', 'Camera Pole', 'OEM', NULL, '* Material: MS 
* Surface Treatment:  Powder Coated
* Height: 2m 
* Thickness: 2mm 
* Corss Section: Circular
* Tube Diameter: 2 inch / 50 mm
* Base Plate Shape: Circular
* Pase Plate Thickness: 8mm to 10mm 
* Welding Type: MIG
* Stiffner: N.A', 'Number', 5000.0, 'Suyog', '2024-08-21 00:00:00', '45 - 60 days Standard', 'This Price is from Adobe project, Please consider price at higher end', 7500.0, 10, 6750.0, 25, '2025-05-13 10:08:06.945837', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5800, 'Parking Access Control', 'hardware', '4U  wall mounted rack (Indoor)', 'Alpine', NULL, '4U Indoor wall mounted rack 550x650
1x Cooling Fan
1x PDU 4skt 5amp
1x Stationery Tray
1x Mounting Hardware', 'Number', 4350.0, 'Alpine Rack', '2024-11-15 00:00:00', '45 - 60 days Standard', NULL, 6525.0, 10, 5872.5, 25, '2025-05-13 10:08:06.954805', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5801, 'Parking Access Control', 'hardware', '6U  wall mounted rack (Indoor)', 'Alpine', NULL, '6U Indoor wall mounted rack 550x650
1x Cooling Fan
1x PDU 4skt 5amp
1x Stationery Tray
1x Mounting Hardware', 'Number', 4840.0, 'Alpine Rack', '2024-11-15 00:00:00', '45 - 60 days Standard', NULL, 7260.0, 10, 6534.0, 25, '2025-05-13 10:08:06.960963', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5802, 'Parking Access Control', 'hardware', 'SMPS', 'Mean wall', 'RS-25-12', NULL, 'Number', 1800.0, 'Kiran Computech', '2024-11-06 00:00:00', '45 - 60 days Standard', 'This pice is for 20 qty , Price may vary
Lastest quote received for BNY Pune project', 2700.0, 10, 2430.0, 25, '2025-05-13 10:08:06.966068', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5803, 'Parking Access Control', 'hardware', 'SMPS', 'Mean wall', 'RS-25-24', NULL, 'Number', 1800.0, 'Kiran Computech', '2024-11-06 00:00:00', '45 - 60 days Standard', 'This pice is for 20 qty , Price may vary
Lastest quote received for BNY Pune project', 2700.0, 10, 2430.0, 25, '2025-05-13 10:08:06.971599', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5804, 'Parking Access Control', 'hardware', 'MCB', 'LEGRAND', '6A 230V', NULL, 'Number', 2300.0, 'Kiran Computech', '2024-11-06 00:00:00', '45 - 60 days Standard', 'This pice is for 20 qty , Price may vary
Lastest quote received for BNY Pune project', 3450.0, 10, 3105.0, 25, '2025-05-13 10:08:06.978525', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5805, 'Parking Access Control', 'hardware', 'Terminal Block', 'PHOENIX', NULL, NULL, 'Number', 150.0, 'Kiran Computech', '2024-11-06 00:00:00', '45 - 60 days Standard', 'This pice is for 20 qty , Price may vary
Lastest quote received for BNY Pune project', 225.0, 10, 202.5, 25, '2025-05-13 10:08:06.984982', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5806, 'Parking Access Control', 'hardware', 'Din Rail', NULL, NULL, NULL, 'Number', 250.0, 'Kiran Computech', '2024-11-06 00:00:00', '45 - 60 days Standard', 'This pice is for 20 qty , Price may vary
Lastest quote received for BNY Pune project', 375.0, 10, 337.5, 25, '2025-05-13 10:08:06.991650', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5807, 'Parking Access Control', 'hardware', 'Cable Manager', 'PHOENIX', 'CABLE DUCT, CD 25X40', NULL, 'Number', 1850.0, 'Kiran Computech', '2024-11-06 00:00:00', '45 - 60 days Standard', 'This pice is for 20 qty , Price may vary
Lastest quote received for BNY Pune project', 2775.0, 10, 2497.5, 25, '2025-05-13 10:08:06.998391', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5808, 'Parking Access Control', 'hardware', 'Relay casing', 'Hensel', 'Mi 9310', NULL, 'Number', 6800.0, 'Kiran Computech', '2024-11-06 00:00:00', '45 - 60 days Standard', 'This pice is for 20 qty , Price may vary
Lastest quote received for BNY Pune project', 10200.0, 10, 9180.0, 25, '2025-05-13 10:08:07.005900', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5809, 'Parking Access Control', 'hardware', 'Industrial Panel PC', 'Mootek', 'MIPC-1040T-R', 'Mini window PC 
RAM : 8GB
HDD: 500GB
PROCESSOR : i3 - 3rd GEN
2*COM,2*LAN,4*USB,HDMI,VGA', 'Number', 53000.0, 'Mootek', '2024-11-12 00:00:00', '45 - 60 days Standard', 'This quote received for Adugodi FCM Project', 79500.0, 10, 71550.0, 25, '2025-05-13 10:08:07.015213', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5810, 'Parking Access Control', 'hardware', 'Boom Barrier', 'Magnetic', 'B614', 'Standard
Power supply voltage : 220-240V ~ 50/60 Hz
Electric motor : With brushes 24V
Max. power : 165 W
Max. torque : 300 Nm
MTBF : 0.2 Million
Material type : Steel
Type of treatment : Pre-hot dip galvanized, 20μm thick + polyester powder coated
Encoder H116: Incremental integrated in the motor
Type of deceleration : Electronic + mechanic
Type of beam : Rectangular and round
Operating ambient temperature : -20°C ÷ +55°C
Protection class : IP55 (Electronic control unit) – IP44
Weight : 40 Kg
Dimensions (LxDxH) : 360 x 250 x 1163 mm ( installation base 305 x 230 mm)
Beam max length : 5 m
Opening time : < 2 s (80°- 3m)
Use frequency : Continuous use
Electronic equipment : E614', 'Number', 110775.0, 'Magnetic', NULL, '45 - 60 days Standard', NULL, 166162.5, 10, 149546.25, 25, '2025-05-13 10:08:07.022654', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5811, 'Parking Access Control', 'hardware', 'Boom Barrier', 'Magnetic', 'B680 H', 'Standard
Power supply voltage : Switching: 100 ÷ 240V~ 50/60 Hz
Electric motor : Brushless 36V 
Motor rotation speed : 1000 ÷ 6000 rpm
Max. power : 240 W
Motor-pump unit capacity : 3.2 lpm
MTBF : 2 Million
Material type : Steel
Type of treatment : 100 micron protective primer + polyester painting or stainless steel cabinet
Encoder : Magnetic absolute encoder
Type of deceleration : Electronic – via encoder
Type of beam : Round
Operating ambient temperature : -20°C ÷ +55°C
Protection class : IP56 (TÜV certified)
Weight : 85 Kg (65 Kg pillar + 20 Kg cabinet)
Type of oil : FAAC HP OIL
Dimensions (LxDxH) : 469 x 279 x 1100 mm
Beam max length : 2 ÷ 8 m
Opening time : 1.5 s (90° – 2m) – 6 s (90° – 8m)
Use frequency : 100%
Electronic equipment : E680', 'Number', 211440.0, 'Magnetic', NULL, '45 - 60 days Standard', NULL, 317160.0, 10, 285444.0, 25, '2025-05-13 10:08:07.030609', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5812, 'Parking Access Control', 'hardware', 'Boom Barrier', 'Zk Teco', 'BGM545', 'With Skirting
Operating speed : 2.5 sec
Boom Length : 4.5 m
Boom Type : Telescopic boom
Motor Type : DC 24V brushless motor
Output Power : 160W
Output Current : 10A
Operating Voltages : DC 24V
Power Supply : AC 220V/110V, 50Hz to 60Hz
MCBF : 2 million times
Remote Control Distance : ≥30m
Operating Temperature : -30°C to 75°C
Protection Level : IP54
Chassis Dimensions (mm) : 350*302*1020mm
Net Weight (excluding the barrier arm) : 43kg', 'Number', 59472.0, 'ZK Techo', NULL, '45 - 60 days Standard', 'cost will vary as per arm length, standard size of arm is 4.5meter', 89208.0, 10, 80287.2, 25, '2025-05-13 10:08:07.038993', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5813, 'Parking Access Control', 'hardware', 'Boom Barrier', 'Zk Teco', 'BG2000', 'With Swing Away
Operating Speed : 0.6s
Boom Arm Length : L≤3m
Boom Arm Type : Round straight boom
Chassis Dimension (L*W*H) : 350*306*1070mm
Chassis Weight : 45kg
Motor Type : 24V DC brushless motor
Motor MCBF : 5 million times
Output Power : 100W
Rated Current : 5A
Power Supply : Input - AC110V/220V ±10% 50/60Hz% , Output - DC24V 10A
Remote Control Distance : ≤30m
Operating Temperature : -30°C to 75°C
Operating Humidity : <90%
Chassis Housing Material : Powder coated cold rolled sheet
Protection level : IP54
Duty Cycle : 100%
Motor Rated Speed : 1500r/min', 'Number', 74341.0, 'ZK Techo', NULL, '45 - 60 days Standard', NULL, 111511.5, 10, 100360.35, 25, '2025-05-13 10:08:07.045881', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5814, 'Parking Access Control', 'hardware', 'Camera', 'Dahua', 'DH-IPC-HFW2241T-ZAS', 'Camera + Clamp', 'Number', 7500.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project', 11250.0, 10, 10125.0, 25, '2025-05-13 10:08:07.054258', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5815, 'Parking Access Control', 'software', 'ANPR OCR Software', 'Areteinfo', NULL, NULL, 'Number', 27500.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project', 41250.0, 10, 37125.0, 25, '2025-05-13 10:08:07.061564', NULL);
INSERT INTO "exapp_totalsolutions" (id, application, category, product_name, make, model, specification, uom, buying_price, vendor, quotation_received_month, lead_time, remarks, list_price, discount, sales_price, sales_margin, buying_price_updated_at, product_image) VALUES (5816, 'Parking Access Control', 'hardware', 'RFID Reader', 'Mivanta', 'RGF HR15', NULL, 'Number', 18500.0, 'Areteinfo', '2024-12-09 00:00:00', '45 - 60 days Standard', 'This Price is taken from Kolhapur & Bareilly Airport project', 27750.0, 10, 24975.0, 25, '2025-05-13 10:08:07.067157', NULL);

-- Reset sequence for tables
SELECT setval(pg_get_serial_sequence('auth_user', 'id'), COALESCE(MAX(id), 1)) FROM auth_user;
SELECT setval(pg_get_serial_sequence('exapp_totalsolutions', 'id'), COALESCE(MAX(id), 1)) FROM exapp_totalsolutions;

-- Dumping data for table "exapp_boq"
DELETE FROM "exapp_boq";
INSERT INTO "exapp_boq" (id, project_name, project_location, quotation_number, approach, budget, solution_title, hardware, software, services, amc, totals, created_at) VALUES (4, 'BLR_18', 'Banglore', 'A102', 'si', 'standard', 'Bosch', '[{"name": "Slot Sensor", "category": "camera", "make": "Bosch", "model": "V1.1_US_RS_Ultrasonic slot sensor", "uom": "Nos", "buy_price": 6750, "discount": 10, "sales_price": 7290, "margin": 20, "quantity": 1, "total_buy": 6750, "total_sales": 7290}, {"name": "Photocell set ", "category": "camera", "make": "Centurion", "model": " i5 Infrared Beam Set I5V3", "uom": "Nos", "buy_price": 22500, "discount": 0, "sales_price": 27000, "margin": 20, "quantity": 1, "total_buy": 22500, "total_sales": 27000}, {"name": "Slot Sensor", "category": "camera", "make": "Bosch", "model": "V1.1_US_RS_Ultrasonic slot sensor", "uom": "Nos", "buy_price": 6750, "discount": 0, "sales_price": 8100, "margin": 20, "quantity": 1, "total_buy": 6750, "total_sales": 8100}, {"name": "Zone Controller", "category": "camera", "make": "Bosch", "model": "V1.1_ZC_TCP_Zone Controller", "uom": "Nos", "buy_price": 5250, "discount": 0, "sales_price": 6300, "margin": 20, "quantity": 1, "total_buy": 5250, "total_sales": 6300}]'::jsonb, '[{"name": "FasTag Software (Annual Recurring)", "category": "vms", "make": "OEM", "version": "nan", "uom": "Nos", "buy_price": 26775, "discount": 10, "sales_price": 28917, "margin": 20, "quantity": 1, "total_buy": 26775, "total_sales": 28917}, {"name": "Anpr License ", "category": "vms", "make": "Bosch", "version": "ANPR License for access control per gate", "uom": "Nos", "buy_price": 55500, "discount": 0, "sales_price": 66600, "margin": 20, "quantity": 1, "total_buy": 55500, "total_sales": 66600}, {"name": "EPLD License ", "category": "vms", "make": "Bosch", "version": "EPLD  License ", "uom": "Nos", "buy_price": 2700, "discount": 0, "sales_price": 3240, "margin": 20, "quantity": 1, "total_buy": 2700, "total_sales": 3240}, {"name": "EPLD + ANPR License ", "category": "vms", "make": "Bosch", "version": "EPLD + ANPR  License ", "uom": "Nos", "buy_price": 4275, "discount": 0, "sales_price": 5130, "margin": 20, "quantity": 1, "total_buy": 4275, "total_sales": 5130}]'::jsonb, '[]'::jsonb, '{"plan": "enhanced", "duration": 1, "percentage": 10, "notes": "these amc works for one year time period ", "total": 7303.5}'::jsonb, '{"hardware_buy_total": 41250, "hardware_sales_total": 48690, "hardware_discount": 675, "software_buy_total": 89250, "software_sales_total": 103887, "software_discount": 2677.5, "service_buy_total": 0, "service_sales_total": 0, "service_discount": 0, "amc_total": 7303.5, "grand_buy_total": 130500, "grand_sales_total": 159880.5, "total_profit": 29380.5}'::jsonb, '2025-05-12 11:01:05.595030');
INSERT INTO "exapp_boq" (id, project_name, project_location, quotation_number, approach, budget, solution_title, hardware, software, services, amc, totals, created_at) VALUES (8, 'Adugodi', 'Banglore', 'A101', 'direct', 'premium', 'Bosch', '[{"name": "HD Camera 1080p", "category": "camera", "make": "Hikvision", "model": "DS-2CD2385G1-I", "uom": "Nos", "buy_price": 12000, "discount": 10, "sales_price": 12960, "margin": 20, "quantity": 1, "total_buy": 12000, "total_sales": 12960}, {"name": "Dome Camera 4MP", "category": "camera", "make": "Honeywell", "model": "H4D4PR1", "uom": "Nos", "buy_price": 15000, "discount": 10, "sales_price": 16200, "margin": 20, "quantity": 1, "total_buy": 15000, "total_sales": 16200}, {"name": "Ethernet control card", "category": "camera", "make": "Magnetic", "model": "Ethernet (EM01)", "uom": "Nos", "buy_price": 37500, "discount": 10, "sales_price": 40500, "margin": 20, "quantity": 1, "total_buy": 37500, "total_sales": 40500}, {"name": "Remote for BB", "category": "camera", "make": "Magnetic", "model": " RX2NV3433, Helix Receiver 2Ch RX2NHV2433", "uom": "Nos", "buy_price": 13500, "discount": 10, "sales_price": 14580, "margin": 20, "quantity": 1, "total_buy": 13500, "total_sales": 14580}, {"name": "POS Device", "category": "camera", "make": "Sunmi", "model": "V2 Pro", "uom": "Nos", "buy_price": 21600, "discount": 10, "sales_price": 23328, "margin": 20, "quantity": 1, "total_buy": 21600, "total_sales": 23328}]'::jsonb, '[{"name": "Video Management System", "category": "vms", "make": "Milestone", "version": "XProtect Express+", "uom": "Nos", "buy_price": 45000, "discount": 10, "sales_price": 48600, "margin": 20, "quantity": 1, "total_buy": 45000, "total_sales": 48600}, {"name": "Analytics Suite", "category": "analytics", "make": "Avigilon", "version": "7.2", "uom": "Nos", "buy_price": 30000, "discount": 10, "sales_price": 32400, "margin": 20, "quantity": 1, "total_buy": 30000, "total_sales": 32400}, {"name": "Anpr License ", "category": "vms", "make": "Bosch", "version": "ANPR License for evidence capture", "uom": "Nos", "buy_price": 45000, "discount": 10, "sales_price": 48600, "margin": 20, "quantity": 1, "total_buy": 45000, "total_sales": 48600}, {"name": "Cloud Charges (Annual Recurring)", "category": "vms", "make": "OEM", "version": "nan", "uom": "Nos", "buy_price": 22500, "discount": 10, "sales_price": 24300, "margin": 20, "quantity": 1, "total_buy": 22500, "total_sales": 24300}]'::jsonb, '[]'::jsonb, '{"plan": "enhanced", "duration": 1, "percentage": 10, "notes": "These AMC stands for One year time line \n\nthese for test the  pdf ", "total": 16135.2}'::jsonb, '{"hardware_buy_total": 99600, "hardware_sales_total": 107568, "hardware_discount": 9960, "software_buy_total": 142500, "software_sales_total": 153900, "software_discount": 14250, "service_buy_total": 0, "service_sales_total": 0, "service_discount": 0, "amc_total": 16135.2, "grand_buy_total": 242100, "grand_sales_total": 277603.2, "total_profit": 35503.2}'::jsonb, '2025-05-14 05:05:42.499700');
INSERT INTO "exapp_boq" (id, project_name, project_location, quotation_number, approach, budget, solution_title, hardware, software, services, amc, totals, created_at) VALUES (14, 'BLR_18', 'Banglore', 'A102', 'si', 'standard', 'Bosch_02', '[{"name": "Slot Sensor", "category": "camera", "make": "Bosch", "model": "V1.1_US_RS_Ultrasonic slot sensor", "uom": "Nos", "buy_price": 6750, "discount": 10, "sales_price": 7290, "margin": 20, "quantity": 1, "total_buy": 6750, "total_sales": 7290}, {"name": "Photocell set ", "category": "camera", "make": "Centurion", "model": " i5 Infrared Beam Set I5V3", "uom": "Nos", "buy_price": 22500, "discount": 0, "sales_price": 27000, "margin": 20, "quantity": 1, "total_buy": 22500, "total_sales": 27000}, {"name": "Slot Sensor", "category": "camera", "make": "Bosch", "model": "V1.1_US_RS_Ultrasonic slot sensor", "uom": "Nos", "buy_price": 6750, "discount": 0, "sales_price": 8100, "margin": 20, "quantity": 1, "total_buy": 6750, "total_sales": 8100}, {"name": "Zone Controller", "category": "camera", "make": "Bosch", "model": "V1.1_ZC_TCP_Zone Controller", "uom": "Nos", "buy_price": 5250, "discount": 0, "sales_price": 6300, "margin": 20, "quantity": 1, "total_buy": 5250, "total_sales": 6300}]'::jsonb, '[{"name": "FasTag Software (Annual Recurring)", "category": "vms", "make": "OEM", "version": "nan", "uom": "Nos", "buy_price": 26775, "discount": 10, "sales_price": 28917, "margin": 20, "quantity": 1, "total_buy": 26775, "total_sales": 28917}, {"name": "Anpr License ", "category": "vms", "make": "Bosch", "version": "ANPR License for access control per gate", "uom": "Nos", "buy_price": 55500, "discount": 0, "sales_price": 66600, "margin": 20, "quantity": 1, "total_buy": 55500, "total_sales": 66600}, {"name": "EPLD License ", "category": "vms", "make": "Bosch", "version": "EPLD  License ", "uom": "Nos", "buy_price": 2700, "discount": 0, "sales_price": 3240, "margin": 20, "quantity": 1, "total_buy": 2700, "total_sales": 3240}, {"name": "EPLD + ANPR License ", "category": "vms", "make": "Bosch", "version": "EPLD + ANPR  License ", "uom": "Nos", "buy_price": 4275, "discount": 0, "sales_price": 5130, "margin": 20, "quantity": 1, "total_buy": 4275, "total_sales": 5130}]'::jsonb, '[]'::jsonb, '{"plan": "enhanced", "duration": 1, "percentage": 10, "notes": "these amc works for one year time period ", "total": 7303.5}'::jsonb, '{"hardware_buy_total": 41250, "hardware_sales_total": 48690, "hardware_discount": 675, "software_buy_total": 89250, "software_sales_total": 103887, "software_discount": 2677.5, "service_buy_total": 0, "service_sales_total": 0, "service_discount": 0, "amc_total": 7303.5, "grand_buy_total": 130500, "grand_sales_total": 159880.5, "total_profit": 29380.5}'::jsonb, '2025-05-15 04:30:03.734364');
SELECT setval(pg_get_serial_sequence('exapp_boq', 'id'), COALESCE(MAX(id), 1)) FROM exapp_boq;
