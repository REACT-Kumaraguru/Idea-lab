import Equipment from "../models/EquipmentModel.js";
import { Op } from "sequelize";

export const LAB_EQUIPMENTS = [
  // ==========================================
  // Group 1: Quote 230 (22 Major Prototyping Equipment Items)
  // Bookable (isAvailable: true, pricePerHour: null)
  // ==========================================
  {
    equipmentName: "Laser Cutter (CO2 100W, 1200x900mm)",
    brandName: "Lakshmi International",
    quantity: 1,
    equipmentDetails: "Model SPL07. 100W CO2 Glass Laser Tube, marking area 1200x900mm, laser cutting software, water cooling chiller, 5KVA stabilizer.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Vinyl Cutter (24\" Plotter)",
    brandName: "Myprint",
    quantity: 1,
    equipmentDetails: "24 inch Plotter with stand. Max cut size 11.5\" x 23.5\", cut speed up to 14.1 ips with precision blade carriage.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Prusa 3D Printer (FDM)",
    brandName: "Prusa",
    quantity: 2,
    equipmentDetails: "Model Mini Plus. FDM open type 3D printer, build volume 180x180x180mm, print speed 200mm/s, supports PLA, TPU, PETG, ABS, auto-leveling.",
    isAvailable: true,
    pricePerHour: null,
  },
  {
    equipmentName: "Bambu Lab 3D Printer (P1S)",
    brandName: "Bambu Lab",
    quantity: 1,
    equipmentDetails: "Model P1S. CoreXY high-speed fully enclosed 3D printer, build volume 256x256x256mm, multi-material/color printing compatible.",
    isAvailable: true,
    pricePerHour: null,
  },
  {
    equipmentName: "3D Scanner (Stereo Structured Light)",
    brandName: "MAF",
    quantity: 1,
    equipmentDetails: "Model Three. Stereo camera structured light 3D scanner, Sony 13MP sensor, 0.2mm accuracy, working distance 160-1400mm. Output: OBJ, STL, PLY.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "CNC Router (3KW Spindle)",
    brandName: "Lakshmi International",
    quantity: 1,
    equipmentDetails: "Model SP12. Working area 1300x2500mm, Z axis 200mm, 3KW spindle up to 18000 RPM, dust collector and stabilizer.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Filament Making Machine (Extruder)",
    brandName: "RP3D",
    quantity: 1,
    equipmentDetails: "Model FMM 1. Extrudes ABS, PLA, Nylon into 1.75mm/3.00mm 3D printing filament, max temp 300°C, auto winder.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Mini Desktop Lathe cum Milling Machine",
    brandName: "ETS",
    quantity: 1,
    equipmentDetails: "Model LM 500. Swing over bed 100mm, distance between centres 100mm, 230W motor, spindle speed 100-1000 RPM.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Pillar / Heavy Drilling Machine (1 HP)",
    brandName: "Perfect Machines",
    quantity: 1,
    equipmentDetails: "Model 1 HP. 1 HP motor, 0-630 RPM, 11 Nm torque, drill depth 160mm, max drilling diameter 25mm.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Handheld High Speed Drill",
    brandName: "Bosch",
    quantity: 1,
    equipmentDetails: "Model GSB500RE. 450W rated input power corded impact drill.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Benchtop Grinder Machine",
    brandName: "Stanley",
    quantity: 1,
    equipmentDetails: "Model STGB3715. Grinding wheel diameter 150mm, 350W input power, no-load speed up to 3000 RPM.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Soldering Station (Digital)",
    brandName: "Soldron",
    quantity: 5,
    equipmentDetails: "Model Soldron 878D. 60W digital temperature-controlled soldering station (200°C - 480°C).",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Desoldering Station (SMD Rework)",
    brandName: "Vartech",
    quantity: 3,
    equipmentDetails: "Model 850A SMD. Hot air SMD rework station, airflow up to 24L/min, temp range 100°C - 420°C.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Advanced Motorized Sewing Machine",
    brandName: "Usha",
    quantity: 1,
    equipmentDetails: "Model Dream Maker 120. Computerised sewing machine, 120 built-in stitches, LCD display, 7 buttonhole styles.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Wood Lathe Machine",
    brandName: "Voltz",
    quantity: 1,
    equipmentDetails: "Model MCS 450. Wood lathe machine with chuck and accessories, 580W, speed 5000 RPM.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Corded Electric Drill Tool Kit",
    brandName: "Bosch",
    quantity: 1,
    equipmentDetails: "Model 10 RE Professional. Corded electric drill tool kit with 100 pcs accessories.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Portable Inverter Welding Machine",
    brandName: "Cheston",
    quantity: 1,
    equipmentDetails: "Model 120A. Inverter arc welding machine, 15-200A DC range, single phase 240V.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Laboratory Refrigerator (184L)",
    brandName: "Whirlpool",
    quantity: 1,
    equipmentDetails: "184L direct-cool single door refrigerator with voltage stabilizer for laboratory chemical and material storage.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Microwave Oven (20L)",
    brandName: "Panasonic",
    quantity: 1,
    equipmentDetails: "20L stainless steel cavity solo microwave oven for materials and lab heating.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Magnifying Glass with Stand & Lamp",
    brandName: "Generic",
    quantity: 2,
    equipmentDetails: "Optical desktop magnifying glass with adjustable arm and built-in lighting for precision assembly and PCB inspection.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Digital Microscope (USB 500X)",
    brandName: "Generic",
    quantity: 1,
    equipmentDetails: "Model S2 USB. 8-LED 500X digital microscope video inspection camera with stand.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Mixed Signal Oscilloscope (4-Channel 100MHz)",
    brandName: "SIGLENT",
    quantity: 1,
    equipmentDetails: "Model SDS 814X HD+. 4-channel 100MHz 1 GSa/s high-definition mixed signal oscilloscope, 16 logic analyzer channels, 25MHz AWG.",
    isAvailable: false,
    pricePerHour: null,
  },

  // ==========================================
  // Group 2: Quote 231 (6 Additional Instruments - No Projector / Smart Board)
  // Bookable (isAvailable: true, pricePerHour: null)
  // ==========================================
  {
    equipmentName: "Digital Storage Oscilloscope (2-Channel 100MHz)",
    brandName: "SIGLENT",
    quantity: 1,
    equipmentDetails: "Model SDS 1102 CML. Dual-channel 100MHz, 1 GSa/s real-time sampling rate, 7-inch TFT color display, hardware frequency counter.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Signal Generator (60MHz Arbitrary Waveform)",
    brandName: "SIGLENT",
    quantity: 1,
    equipmentDetails: "Model SDG 1062X. 60MHz dual-channel function/arbitrary waveform generator, 150 MSa/s, EasyPulse technology.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Variable DC Power Supply (4-Channel)",
    brandName: "Vartech",
    quantity: 1,
    equipmentDetails: "Model 3005-4. 4-channel isolated output (CH1 & CH2: 0-32V/3A, CH3: 0-5V/1A, CH4: 0-15V/1A).",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Benchtop Digital Multimeter (5.5 Digit)",
    brandName: "SIGLENT",
    quantity: 1,
    equipmentDetails: "Model SDM 3055X. 5.5 digit dual-display true-RMS digital bench multimeter.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Heavy Duty Laser Printer",
    brandName: "HP",
    quantity: 1,
    equipmentDetails: "Model LaserJet Pro MFP. Heavy-duty all-in-one multifunction monochrome laser printer with auto duplex and Wi-Fi.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "PCB Milling & Prototyping Machine",
    brandName: "Enthu Technology Solutions",
    quantity: 1,
    equipmentDetails: "Model PCBMATE 300W. CNC PCB prototyping machine, 1.2KW 25000 RPM spindle, working area 300x200mm, PC cabinet.",
    isAvailable: true,
    pricePerHour: null,
  },

  // ==========================================
  // Group 3: PO2526A Mandatory Mechanical Tools
  // Listed as Facility / Non-Bookable (isAvailable: false, pricePerHour: null)
  // ==========================================
  {
    equipmentName: "Manual PCB Drilling Machine",
    brandName: "Zeekers",
    quantity: 3,
    equipmentDetails: "Manual micro PCB drilling machine for prototype circuit boards.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "PCB Power Drilling Machine",
    brandName: "Zeekers",
    quantity: 3,
    equipmentDetails: "Motorized high-precision PCB power drilling machine.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Cordless Drilling Machine",
    brandName: "Bosch",
    quantity: 2,
    equipmentDetails: "Portable battery-powered cordless drill driver.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Jigsaw Machine",
    brandName: "Bosch",
    quantity: 2,
    equipmentDetails: "Electric handheld jigsaw for intricate curves and sheet cutting.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Power Circular Saw",
    brandName: "Bosch",
    quantity: 2,
    equipmentDetails: "Heavy-duty circular saw for rapid straight wood and acrylic cutting.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Mini Hacksaw Set",
    brandName: "Stanley",
    quantity: 5,
    equipmentDetails: "Compact handheld hacksaws for precision metal and plastic cutting.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Belt and Disc Sanding Machine",
    brandName: "Zeekers",
    quantity: 1,
    equipmentDetails: "Stationary combination belt and disc sander for surface finishing.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Scroll Saw Machine",
    brandName: "Zeekers",
    quantity: 1,
    equipmentDetails: "Benchtop electric scroll saw for delicate wooden crafts and curves.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Moto Saw Machine",
    brandName: "Dremel",
    quantity: 1,
    equipmentDetails: "Compact multi-material scroll saw for stationary and handheld cutting.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Bench Grinding Machine (Mechanical)",
    brandName: "Stanley",
    quantity: 1,
    equipmentDetails: "Stationary double-wheel bench grinder for tool sharpening and deburring.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Impact Drill",
    brandName: "Black & Decker",
    quantity: 3,
    equipmentDetails: "High-torque impact drill for tough materials and masonry.",
    isAvailable: false,
    pricePerHour: null,
  },

  // ==========================================
  // Group 4: PO2526A Mandatory Electrical Tools
  // Listed as Facility / Non-Bookable (isAvailable: false, pricePerHour: null)
  // ==========================================
  {
    equipmentName: "Hot Air Blower with Soldering Iron",
    brandName: "Zeekers",
    quantity: 5,
    equipmentDetails: "2-in-1 hot air rework gun and soldering iron station for electronics work.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Centrifugal Blower",
    brandName: "Zeekers",
    quantity: 1,
    equipmentDetails: "High-velocity centrifugal air blower for workshop cleaning and ventilation.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Laboratory Vacuum Cleaner",
    brandName: "Eureka Forbes",
    quantity: 2,
    equipmentDetails: "Dry vacuum cleaner with 24 kPa suction for lab dust collection.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Industrial Air Compressor",
    brandName: "Zeekers",
    quantity: 1,
    equipmentDetails: "Pressurized air compressor for pneumatic tools and workshop cleaning.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "DC Regulated Power Supply Unit",
    brandName: "Zeekers",
    quantity: 3,
    equipmentDetails: "Benchtop regulated DC power supply unit with digital display.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "3D Printing Filament Dehydrator",
    brandName: "Zeekers",
    quantity: 1,
    equipmentDetails: "Controlled heating chamber to eliminate moisture from 3D printing filaments.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "SMD Reflow Oven",
    brandName: "Zeekers",
    quantity: 1,
    equipmentDetails: "Desktop infrared reflow soldering oven for surface mount PCB assembly.",
    isAvailable: false,
    pricePerHour: null,
  },
  {
    equipmentName: "Digital Storage Oscilloscope (Electrical Workbench)",
    brandName: "Zeekers",
    quantity: 4,
    equipmentDetails: "Dedicated benchtop digital oscilloscope for electrical circuit testing.",
    isAvailable: false,
    pricePerHour: null,
  },

  // ==========================================
  // Group 5: PO2526A Optional Equipment & Consumables (IoT / Embedded, Items 1 to 122)
  // Listed as Facility / Non-Bookable (isAvailable: false, pricePerHour: null)
  // ==========================================
  { equipmentName: "GPIO Power Router", brandName: "Zeekers", quantity: 1, equipmentDetails: "High-current GPIO power distribution and routing unit for embedded IoT clusters.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Raspberry Pi 4 Kit", brandName: "Raspberry Pi", quantity: 12, equipmentDetails: "Raspberry Pi 4 Model B complete development kit with power adapter and case.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Raspberry Pi 5 Kit", brandName: "Raspberry Pi", quantity: 5, equipmentDetails: "Raspberry Pi 5 high-performance quad-core 64-bit Arm development computer kit.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Arduino Mega 2560", brandName: "Arduino", quantity: 5, equipmentDetails: "ATmega2560 microcontroller board with 54 digital I/O pins and 16 analog inputs.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Arduino Nano", brandName: "Arduino", quantity: 5, equipmentDetails: "Compact ATmega328P breadboard-friendly microcontroller board.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Arduino UNO R3", brandName: "Arduino", quantity: 25, equipmentDetails: "Standard ATmega328P microcontroller prototyping board for student lab projects.", isAvailable: false, pricePerHour: null },
  { equipmentName: "ESP32 Wroom 32E Dev Board", brandName: "Espressif", quantity: 10, equipmentDetails: "Dual-core 240MHz Wi-Fi and Bluetooth BLE IoT development board.", isAvailable: false, pricePerHour: null },
  { equipmentName: "NodeMCU ESP8266", brandName: "NodeMCU", quantity: 10, equipmentDetails: "Wi-Fi enabled IoT development board based on ESP8266 microcontroller.", isAvailable: false, pricePerHour: null },
  { equipmentName: "NRF52840 EBYTE Module", brandName: "EBYTE", quantity: 10, equipmentDetails: "Multi-protocol 2.4GHz Bluetooth 5, Thread, Zigbee transceiver module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "ESP8266 Development Board", brandName: "Espressif", quantity: 5, equipmentDetails: "Standalone ESP8266 IoT prototyping module with integrated TCP/IP stack.", isAvailable: false, pricePerHour: null },
  { equipmentName: "NVIDIA Jetson Nano Board", brandName: "NVIDIA", quantity: 2, equipmentDetails: "AI edge computing development board with 128-core Maxwell GPU for computer vision.", isAvailable: false, pricePerHour: null },
  { equipmentName: "STM32F103C6T6 Blue Pill Board", brandName: "STMicroelectronics", quantity: 10, equipmentDetails: "ARM Cortex-M3 32-bit minimum system microcontroller development board.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Sipeed Maix 2 Dock with Camera", brandName: "Sipeed", quantity: 5, equipmentDetails: "Edge AI & vision processing development kit for embedded deep learning.", isAvailable: false, pricePerHour: null },
  { equipmentName: "ESP32-S3 AIoT Development Kit", brandName: "Espressif", quantity: 5, equipmentDetails: "Xtensa dual-core 32-bit LX7 MCU with vector instructions for AI acceleration.", isAvailable: false, pricePerHour: null },
  { equipmentName: "ESP32 LCD Development Kit", brandName: "Espressif", quantity: 3, equipmentDetails: "Integrated ESP32 development board with built-in color TFT LCD display.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Raspberry Pi Extension Board", brandName: "Waveshare / Zeekers", quantity: 6, equipmentDetails: "GPIO breakout and expansion HAT for Raspberry Pi peripherals.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Raspberry Pi 5MP Camera Module", brandName: "Raspberry Pi", quantity: 12, equipmentDetails: "5-megapixel native camera sensor for Raspberry Pi image capture.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Raspberry Pi 3 Night Vision Camera", brandName: "Waveshare", quantity: 5, equipmentDetails: "Infrared night vision camera module with dual IR LED spotlights.", isAvailable: false, pricePerHour: null },
  { equipmentName: "ESP32-S3-EYE Development Board", brandName: "Espressif", quantity: 5, equipmentDetails: "AI vision board with 2MP camera, digital microphone, LCD, and face recognition.", isAvailable: false, pricePerHour: null },
  { equipmentName: "DHT22 Temperature & Humidity Sensor", brandName: "Aosong", quantity: 25, equipmentDetails: "High-precision digital temperature and humidity sensor module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Flex Sensor 2.2\"", brandName: "Spectra Symbol", quantity: 10, equipmentDetails: "2.2-inch bi-directional variable resistance flex/bend sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "BME180 Barometric Pressure Sensor", brandName: "Bosch", quantity: 10, equipmentDetails: "Digital barometric pressure, altitude, and temperature sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Analog LDR Module", brandName: "Generic", quantity: 25, equipmentDetails: "Light dependent resistor module with adjustable analog and digital comparator output.", isAvailable: false, pricePerHour: null },
  { equipmentName: "LDR Photoresistor Sensor", brandName: "Generic", quantity: 50, equipmentDetails: "Light-sensitive photoresistor component for optical intensity sensing.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Gyroscope Sensor Module", brandName: "InvenSense", quantity: 5, equipmentDetails: "Multi-axis angular velocity gyroscope motion sensor module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Oxygen Gas Sensor Module", brandName: "Generic", quantity: 10, equipmentDetails: "Electrochemical / catalytic oxygen (O2) concentration sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Hydrogen Gas Sensor Module", brandName: "Winsen", quantity: 10, equipmentDetails: "High-sensitivity hydrogen (H2) gas detection sensor module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Alcohol Sensor (MQ-3)", brandName: "Winsen", quantity: 25, equipmentDetails: "Ethanol and alcohol vapor detection gas sensor module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "PM2.5 Air Quality Sensor", brandName: "Plantower", quantity: 1, equipmentDetails: "Laser optical particulate matter PM2.5 / PM10 air quality monitoring sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Methane Gas Sensor (MQ-4)", brandName: "Winsen", quantity: 10, equipmentDetails: "Natural gas and methane (CH4) monitoring sensor module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "LPG Gas Sensor (MQ-6)", brandName: "Winsen", quantity: 10, equipmentDetails: "Liquefied petroleum gas (LPG) and butane leakage detection sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Carbon Monoxide Sensor (MQ-7)", brandName: "Winsen", quantity: 10, equipmentDetails: "Carbon monoxide (CO) ambient gas monitoring sensor module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Carbon Dioxide Sensor (CO2)", brandName: "Winsen", quantity: 1, equipmentDetails: "NDIR / chemical carbon dioxide concentration measurement sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "SeeedStudio Grove Starter Module", brandName: "Seeed Studio", quantity: 1, equipmentDetails: "Modular, standardized connector-based sensor and actuator system.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Pulse Sensor Heart Rate Module", brandName: "World Famous Electronics", quantity: 10, equipmentDetails: "Photoplethysmogram (PPG) heart rate and optical pulse detection sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "LM35 Analog Temperature Sensor", brandName: "Texas Instruments", quantity: 25, equipmentDetails: "Precision centigrade temperature sensor with linear 10mV/°C scale factor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "K-Type Thermocouple Sensor", brandName: "Generic", quantity: 5, equipmentDetails: "High-temperature industrial probe thermocouple with MAX6675 interface.", isAvailable: false, pricePerHour: null },
  { equipmentName: "DS1302 Real-Time Clock (RTC)", brandName: "Maxim Integrated", quantity: 10, equipmentDetails: "Trickle-charge real-time clock module with calendar and RAM.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Analog Soil Moisture Sensor", brandName: "Generic", quantity: 10, equipmentDetails: "Capacitive/resistive soil moisture detection sensor for agricultural IoT.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Sound Detection Sensor Module", brandName: "Generic", quantity: 25, equipmentDetails: "High-sensitivity acoustic sound detector with microphone and comparator.", isAvailable: false, pricePerHour: null },
  { equipmentName: "TCS3200 4-in-1 Color Sensor", brandName: "AMS / TAOS", quantity: 25, equipmentDetails: "Programmable RGB color light-to-frequency converter sensor module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "PIR Motion Sensor (HC-SR501)", brandName: "Generic", quantity: 25, equipmentDetails: "Pyroelectric passive infrared human body motion detection module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Ultrasonic Distance Sensor (HC-SR04)", brandName: "Generic", quantity: 25, equipmentDetails: "Non-contact 2cm to 400cm ultrasonic sonar distance ranging sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Inductive Proximity Sensor", brandName: "Omron", quantity: 5, equipmentDetails: "Electromagnetic non-contact metallic object proximity detector.", isAvailable: false, pricePerHour: null },
  { equipmentName: "IR Infrared Obstacle Sensor Module", brandName: "Generic", quantity: 50, equipmentDetails: "Reflective infrared obstacle detection sensor with distance trimmer.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Optical Fingerprint Sensor Module", brandName: "Grow", quantity: 8, equipmentDetails: "Biometric optical fingerprint scanner with DSP image processing and memory.", isAvailable: false, pricePerHour: null },
  { equipmentName: "LIDAR Time-of-Flight (2m)", brandName: "Benewake", quantity: 5, equipmentDetails: "Laser distance ranging LiDAR module up to 2 meters range.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Non-Invasive AC Current Sensor (20A)", brandName: "YHDC", quantity: 5, equipmentDetails: "Split-core current transformer sensor SCT-013-020 (0-20A AC).", isAvailable: false, pricePerHour: null },
  { equipmentName: "Non-Invasive AC Current Sensor (5A)", brandName: "YHDC", quantity: 5, equipmentDetails: "Split-core current transformer sensor SCT-013-005 (0-5A AC).", isAvailable: false, pricePerHour: null },
  { equipmentName: "Invasive Hall Current Sensor (ACS712)", brandName: "Allegro MicroSystems", quantity: 5, equipmentDetails: "Linear Hall effect-based AC/DC current sensor IC module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "AC Voltage Transformer Sensor (ZMPT101B)", brandName: "Generic", quantity: 5, equipmentDetails: "Precision micro voltage transformer module for AC mains monitoring.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Hall Effect Magnetic Sensor", brandName: "Generic", quantity: 10, equipmentDetails: "Magnetic field detection switch sensor for RPM and position tracking.", isAvailable: false, pricePerHour: null },
  { equipmentName: "AI-Thinker Voice Recognition Module", brandName: "AI-Thinker", quantity: 2, equipmentDetails: "Offline speech recognition module with built-in voice commands.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Momentary Capacitive Touch Sensor (TTP223)", brandName: "Tontek", quantity: 25, equipmentDetails: "Single-channel capacitive touch switch sensor detector.", isAvailable: false, pricePerHour: null },
  { equipmentName: "4-Channel Capacitive Touch Sensor", brandName: "Generic", quantity: 5, equipmentDetails: "4-key capacitive digital touch sensor breakout module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "8-Channel Capacitive Touch Sensor", brandName: "Generic", quantity: 5, equipmentDetails: "8-key capacitive digital touch sensor breakout module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "pH Sensor Kit with Electrode Probe", brandName: "DFRobot", quantity: 10, equipmentDetails: "Liquid pH measurement sensor with glass electrode probe and signal board.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Liquid Flow Meter (YF-S201)", brandName: "Generic", quantity: 10, equipmentDetails: "Hall effect water flow sensor, 1-30 L/min measurement range.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Load Cell Weight Sensor", brandName: "Generic", quantity: 10, equipmentDetails: "Strain gauge load cell sensor for mechanical weight and force measurement.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Load Cell Amplifier (HX711)", brandName: "Avia Semiconductor", quantity: 10, equipmentDetails: "24-bit analog-to-digital converter (ADC) module for weigh scales.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Force Sensitive Resistor (FSR) Square", brandName: "Interlink Electronics", quantity: 5, equipmentDetails: "Polymer thick film device exhibiting decrease in resistance with pressure.", isAvailable: false, pricePerHour: null },
  { equipmentName: "T-Slot Optical IR Sensor Module", brandName: "Generic", quantity: 10, equipmentDetails: "Slotted optical interrupter switch for speed measurement and encoders.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Sharp Optical Distance Sensor", brandName: "Sharp", quantity: 25, equipmentDetails: "Analog triangulation infrared distance measuring sensor.", isAvailable: false, pricePerHour: null },
  { equipmentName: "433MHz RF Wireless Remote Control", brandName: "Generic", quantity: 5, equipmentDetails: "433MHz amplitude shift keying RF wireless transmitter and receiver kit.", isAvailable: false, pricePerHour: null },
  { equipmentName: "BO Motor Straight (60 RPM)", brandName: "Generic", quantity: 30, equipmentDetails: "Battery-operated straight DC geared motor 3-6V, 60 RPM.", isAvailable: false, pricePerHour: null },
  { equipmentName: "BO Motor Straight (100 RPM)", brandName: "Generic", quantity: 30, equipmentDetails: "Battery-operated straight DC geared motor 3-6V, 100 RPM.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Rubber Wheel for BO DC Motor", brandName: "Generic", quantity: 60, equipmentDetails: "Rubber treaded wheel compatible with BO geared motors for robot chassis.", isAvailable: false, pricePerHour: null },
  { equipmentName: "130 DIY Toy DC Motor", brandName: "Generic", quantity: 60, equipmentDetails: "Miniature micro 130 hobby DC motor 3-6V for mechanical prototypes.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Metal Gear High-Torque Servo (MG995)", brandName: "TowerPro", quantity: 20, equipmentDetails: "Heavy-duty 180-degree metal gear servo motor with 10kg-cm torque.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Micro Servo Motor (SG90)", brandName: "TowerPro", quantity: 40, equipmentDetails: "Ultra-compact 9g plastic gear micro servo motor for robotics.", isAvailable: false, pricePerHour: null },
  { equipmentName: "5V Stepper Motor with ULN2003 Driver", brandName: "Generic", quantity: 20, equipmentDetails: "28BYJ-48 5V 4-phase geared stepper motor with Darlington driver board.", isAvailable: false, pricePerHour: null },
  { equipmentName: "NEMA 17 Stepper Motor", brandName: "Generic", quantity: 6, equipmentDetails: "High-precision bipolar stepper motor 1.8° step angle for 3D printers and CNC.", isAvailable: false, pricePerHour: null },
  { equipmentName: "NEMA 23 Stepper Motor", brandName: "Generic", quantity: 6, equipmentDetails: "High-torque industrial bipolar stepper motor for heavy CNC milling axes.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Dual H-Bridge Motor Driver (L298N)", brandName: "STMicroelectronics", quantity: 60, equipmentDetails: "Dual full-bridge motor driver module for controlling 2 DC motors or 1 stepper.", isAvailable: false, pricePerHour: null },
  { equipmentName: "CNC Shield with A4988 Stepper Drivers", brandName: "Generic", quantity: 3, equipmentDetails: "Arduino Uno compatible CNC shield board with 4 A4988 microstepping drivers.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Multi-Channel Servo Motor Driver (PCA9685)", brandName: "NXP", quantity: 5, equipmentDetails: "16-channel 12-bit PWM I2C bus servo motor controller driver.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Robotic Multi-Wheel Chassis Kit", brandName: "Generic", quantity: 5, equipmentDetails: "Multi-wheel robot platform chassis with hardware mounting brackets.", isAvailable: false, pricePerHour: null },
  { equipmentName: "16x2 Character LCD with I2C Backpack", brandName: "Generic", quantity: 25, equipmentDetails: "Alphanumeric 16x2 backlit LCD display with PCF8574 I2C adapter.", isAvailable: false, pricePerHour: null },
  { equipmentName: "4-Channel 5V Relay Module with Optocoupler", brandName: "Songle", quantity: 10, equipmentDetails: "Optoisolated 4-channel 250V/10A mains switching relay module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "1-Channel 5V Relay Module with Optocoupler", brandName: "Songle", quantity: 25, equipmentDetails: "Optoisolated single-channel 250V/10A mains switching relay module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "5V Cube Relay Component", brandName: "Songle", quantity: 5, equipmentDetails: "Standalone 5V DC miniature sugar cube relay for PCB soldering.", isAvailable: false, pricePerHour: null },
  { equipmentName: "2-Channel 5V Relay Module with Optocoupler", brandName: "Songle", quantity: 10, equipmentDetails: "Optoisolated dual-channel 250V/10A mains switching relay module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "12V Cube Relay Component", brandName: "Songle", quantity: 5, equipmentDetails: "Standalone 12V DC miniature sugar cube relay for PCB soldering.", isAvailable: false, pricePerHour: null },
  { equipmentName: "2-Channel 12V Relay Module with Optocoupler", brandName: "Songle", quantity: 10, equipmentDetails: "Optoisolated dual-channel 12V DC relay control board.", isAvailable: false, pricePerHour: null },
  { equipmentName: "4-Channel 12V Relay Module with Optocoupler", brandName: "Songle", quantity: 10, equipmentDetails: "Optoisolated 4-channel 12V DC relay control board.", isAvailable: false, pricePerHour: null },
  { equipmentName: "0.96\" Monochrome OLED Display (I2C)", brandName: "Generic", quantity: 10, equipmentDetails: "128x64 high-contrast blue/white graphic I2C OLED display module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Active Piezo Buzzer 5V", brandName: "Generic", quantity: 60, equipmentDetails: "Continuous tone active electromagnetic audio buzzer alarm module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "GPS Module with EEPROM (GP-02)", brandName: "AT6558R", quantity: 10, equipmentDetails: "Multi-GNSS satellite positioning receiver module with active patch antenna.", isAvailable: false, pricePerHour: null },
  { equipmentName: "SIMCOM 4G/LTE NB-IoT Module (SIM7020G)", brandName: "SIMCom", quantity: 10, equipmentDetails: "Cellular multi-band NB-IoT wireless communication module with SIM slot.", isAvailable: false, pricePerHour: null },
  { equipmentName: "High-Gain GSM/LTE Antenna", brandName: "Generic", quantity: 10, equipmentDetails: "Omnidirectional external antenna with SMA/IPEX connector.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Zigbee Wireless Breakout Board", brandName: "Digi", quantity: 3, equipmentDetails: "IEEE 802.15.4 Zigbee mesh networking RF transceiver module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "HC-05 Bluetooth Serial Module", brandName: "Generic", quantity: 25, equipmentDetails: "Master/slave SPP Bluetooth 2.0 serial transceiver board with button.", isAvailable: false, pricePerHour: null },
  { equipmentName: "NRF24L01+ 2.4GHz RF Transceiver", brandName: "Nordic Semiconductor", quantity: 10, equipmentDetails: "Ultra-low power 2.4GHz ISM band wireless data transceiver module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "RC522 RFID Reader / Writer Module", brandName: "NXP", quantity: 25, equipmentDetails: "13.56MHz contactless SPI/I2C RFID reader with card and key fob.", isAvailable: false, pricePerHour: null },
  { equipmentName: "RFID Key Fob Tag (13.56MHz)", brandName: "Generic", quantity: 25, equipmentDetails: "Passive contactless proximity RFID key chain tag.", isAvailable: false, pricePerHour: null },
  { equipmentName: "RFID Smart Card (13.56MHz)", brandName: "Generic", quantity: 25, equipmentDetails: "White printable PVC contactless RFID proximity smart card.", isAvailable: false, pricePerHour: null },
  { equipmentName: "LoRaWAN Industrial Gateway (RG-01)", brandName: "Ai-Thinker", quantity: 1, equipmentDetails: "Multi-channel long-range LoRaWAN 868/915MHz base station gateway.", isAvailable: false, pricePerHour: null },
  { equipmentName: "LoRaWAN Node RA-08 Dev Board (470MHz)", brandName: "Ai-Thinker", quantity: 10, equipmentDetails: "Low-power LoRa development node with SMA antenna interface.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Bi-Directional Logic Level Converter (5V to 3.3V)", brandName: "Generic", quantity: 10, equipmentDetails: "4-channel I2C/SPI safe bidirectional voltage level shifter.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Industrial USB to RS485 Converter", brandName: "FTDI", quantity: 10, equipmentDetails: "Protected USB to 2-wire half-duplex RS485 serial industrial adapter.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Industrial USB to RS232 Serial Cable", brandName: "Prolific", quantity: 10, equipmentDetails: "DB9 male USB to RS232 COM port serial communication converter.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Ethernet Network Module (ENC28J60 / W5500)", brandName: "Microchip", quantity: 5, equipmentDetails: "SPI-to-Ethernet hardware TCP/IP network controller module.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Solderless Breadboard (830 Points)", brandName: "MB-102", quantity: 25, equipmentDetails: "Full-size prototyping breadboard with power distribution rails.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Solderless Breadboard (400 Points)", brandName: "Generic", quantity: 10, equipmentDetails: "Half-size compact prototyping breadboard for bench experiments.", isAvailable: false, pricePerHour: null },
  { equipmentName: "9V Heavy Duty Battery with Snap Clip", brandName: "Hi-Watt", quantity: 25, equipmentDetails: "9V alkaline battery with wire lead snap connector clip.", isAvailable: false, pricePerHour: null },
  { equipmentName: "3.7V 1000mAh LiPo Rechargeable Battery", brandName: "Generic", quantity: 25, equipmentDetails: "Single-cell lithium-polymer battery with JST-PH protection circuit.", isAvailable: false, pricePerHour: null },
  { equipmentName: "11.1V 3S LiPo High-Discharge Battery", brandName: "Generic", quantity: 3, equipmentDetails: "3-cell 11.1V lithium-polymer battery pack with XT60 connector for drones.", isAvailable: false, pricePerHour: null },
  { equipmentName: "18650 Li-Ion Rechargeable Battery Cell", brandName: "LG / Samsung", quantity: 10, equipmentDetails: "High-capacity 3.7V cylindrical lithium-ion rechargeable battery cell.", isAvailable: false, pricePerHour: null },
  { equipmentName: "2-Axis Analog Thumb Joystick Module", brandName: "Generic", quantity: 25, equipmentDetails: "Dual-potentiometer analog thumb joystick with center push-button.", isAvailable: false, pricePerHour: null },
  { equipmentName: "433MHz Wireless RF Transmitter & Receiver Set", brandName: "Generic", quantity: 10, equipmentDetails: "Short-range wireless serial RF transmitter and receiver pair.", isAvailable: false, pricePerHour: null },
  { equipmentName: "F450 Quadcopter Drone Kit with DJI Naza", brandName: "DJI", quantity: 1, equipmentDetails: "Complete F450 multirotor drone kit with brushless motors, ESCs, and Naza flight controller.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Play Computer Educational Starter Kit", brandName: "Generic", quantity: 1, equipmentDetails: "Interactive educational computing and electronics exploration kit.", isAvailable: false, pricePerHour: null },
  { equipmentName: "Audio Power Amplifier Module", brandName: "Generic", quantity: 1, equipmentDetails: "Digital audio stereo power amplifier board with thermal protection.", isAvailable: false, pricePerHour: null },
  { equipmentName: "TTGO T-Beam V1.2 LoRa GPS Dev Board", brandName: "LilyGO", quantity: 5, equipmentDetails: "ESP32 IoT board with SX1262 LoRa transceiver, NEO-6M GPS, and 18650 holder.", isAvailable: false, pricePerHour: null, category: "Computing", image: "/uploads/equipment/equipment_169.jpg" },
];

/**
 * Ensures all IDEA Lab hardware equipment, prototyping assets, and IoT inventory items
 * exist in the Equipments table without creating duplicates.
 */
export async function ensureLabEquipments() {
  try {
    // Remove unwanted non-bookable / auxiliary media/mounting items
    const REMOVED_EQUIPMENT_NAMES = [
      "Wall-Mounted Audio Lab Speakers",
      "Portable Bluetooth Audio Speaker",
      "High-Definition USB Webcam (1080p)",
      "Professional Digital SLR / 4K Camera",
      "Large Format Display / Lab Monitor",
      "Wireless Presentation Slide Changer",
      "Hardware Mounting Accessories Assortment",
      "Perforated Tool Wall Board & Hooks"
    ];
    await Equipment.destroy({
      where: {
        equipmentName: REMOVED_EQUIPMENT_NAMES
      }
    });

    let createdCount = 0;
    let existingCount = 0;

    for (let index = 0; index < LAB_EQUIPMENTS.length; index++) {
      const item = LAB_EQUIPMENTS[index];
      const defaultImg = item.image || `/uploads/equipment/equipment_${index + 1}.jpg`;
      const itemId = index + 1;
      
      const computingIds = [49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,111,135,136,137,138,139,140,141,142,143,144,145,147,148,149,158,159,160,169];
      const electronicIds = [12,13,22,23,24,25,26,40,44,46,47,48,146,150,151,152,153,154,155,156,157];
      const mechanicalIds = [29,30,31,32,33,34,35,36,37,38,39,41,42,43,45];
      
      let itemCategory = item.category;
      if (!itemCategory) {
        if (computingIds.includes(itemId)) itemCategory = 'Computing';
        else if (electronicIds.includes(itemId) || (itemId >= 67 && itemId <= 110) || (itemId >= 112 && itemId <= 134)) itemCategory = 'Electronic Tools';
        else if (mechanicalIds.includes(itemId)) itemCategory = 'Mechanical Tools';
        else itemCategory = 'Mandatory Machines';
      }

      const [record, created] = await Equipment.findOrCreate({
        where: { equipmentName: item.equipmentName },
        defaults: { ...item, category: itemCategory, image: defaultImg, kctPricePerHour: 0.00 },
      });

      if (created) {
        createdCount++;
      } else {
        existingCount++;
        const updates = {};
        if (!record.image || record.image !== defaultImg) {
          updates.image = defaultImg;
        }
        if (!record.category) {
          updates.category = itemCategory;
        }
        if (Object.keys(updates).length > 0) {
          await record.update(updates);
        }
      }
    }

    
    // Strictly ensure only 3D printers and PCB Milling machine are bookable by default
    const bookableNames = [
      "Prusa 3D Printer (FDM)",
      "Bambu Lab 3D Printer (P1S)",
      "PCB Milling & Prototyping Machine",
    ];
    await Equipment.update(
      { isAvailable: false },
      {
        where: {
          equipmentName: {
            [Op.notIn]: bookableNames,
          },
        },
      }
    );
    await Equipment.update(
      { isAvailable: true },
      {
        where: {
          equipmentName: {
            [Op.in]: bookableNames,
          },
        },
      }
    );

    console.log(`[LabEquipments] Seeding complete: ${createdCount} created, ${existingCount} already present. Total catalog size: ${LAB_EQUIPMENTS.length}.`);
    return { createdCount, existingCount, total: LAB_EQUIPMENTS.length };
  } catch (error) {
    console.error("[LabEquipments] Error seeding lab equipment:", error.message);
    throw error;
  }
}

// Standalone execution support: `node src/scripts/ensureLabEquipments.js`
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("ensureLabEquipments.js")) {
  import("../lib/db.js").then(async ({ connectDB, sequelize }) => {
    await connectDB();
    await ensureLabEquipments();
    await sequelize.close();
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
