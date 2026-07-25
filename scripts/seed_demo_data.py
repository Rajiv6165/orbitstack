#!/usr/bin/env python3
"""
Seed Demo Data Script for OrbitStack Catalog Service.

Populates the catalog-service database with 20 realistic product items across
multiple categories (Compute, Displays, Peripherals & Audio, Networking & Storage,
Smart Office & Gear).

Idempotent: Safe to re-run multiple times without creating duplicate items.
"""

import json
import os
import sys
import urllib.error
import urllib.request

# Ensure UTF-8 output encoding on Windows terminals if possible
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Default to local catalog-service port 8002 if not specified
CATALOG_SERVICE_URL = os.getenv("CATALOG_SERVICE_URL", "http://localhost:8002").rstrip("/")

DEMO_PRODUCTS = [
    # ─── Category 1: Compute & Workstations ─────────────────────
    {
        "name": "Quantum Pro 16 Laptop",
        "description": "High-performance workstation featuring a 16-inch Retina display, 64GB Unified RAM, and 2TB NVMe SSD.",
        "price": 2499.99,
        "stock": 25,
        "sku": "LAP-QP16-001",
    },
    {
        "name": "OrbitBook Air 14",
        "description": "Ultra-thin magnesium alloy laptop powered by ARM architecture with 18-hour battery life and 16GB RAM.",
        "price": 1099.00,
        "stock": 40,
        "sku": "LAP-OBA14-002",
    },
    {
        "name": "HyperStation X AI Workstation",
        "description": "Enterprise AI workstation equipped with liquid-cooled dual RTX GPUs and 128GB DDR5 memory.",
        "price": 4899.50,
        "stock": 10,
        "sku": "SYS-HSX-003",
    },
    {
        "name": "Starlight Mini Desktop PC",
        "description": "Silent, compact form-factor mini desktop for home office productivity and media streaming.",
        "price": 699.99,
        "stock": 50,
        "sku": "SYS-SMD-004",
    },
    # ─── Category 2: Displays & Visuals ─────────────────────────
    {
        "name": 'Curved Horizon 34" OLED Monitor',
        "description": "Ultra-wide 34-inch curved OLED monitor with 240Hz refresh rate and 0.03ms response time.",
        "price": 999.99,
        "stock": 15,
        "sku": "MON-CH34-005",
    },
    {
        "name": "VisionPro 4K Studio Display",
        "description": "27-inch 4K IPS display calibrated for color-critical creative work with 99% DCI-P3 gamut.",
        "price": 749.00,
        "stock": 30,
        "sku": "MON-VP4K-006",
    },
    {
        "name": "CyberFrame Dual Monitor Arm",
        "description": "Full-motion heavy-duty gas spring dual monitor mount with built-in USB 3.0 passthrough ports.",
        "price": 129.99,
        "stock": 75,
        "sku": "ACC-CFMA-007",
    },
    # ─── Category 3: Peripherals & Audio ────────────────────────
    {
        "name": "AeroGlide Wireless Gaming Mouse",
        "description": "Ultra-lightweight 49g wireless mouse with 30K DPI optical sensor and 80-hour battery capacity.",
        "price": 89.99,
        "stock": 100,
        "sku": "PER-AGM-008",
    },
    {
        "name": "MechForge Pro RGB Keyboard",
        "description": "Hot-swappable mechanical keyboard featuring CNC aluminum chassis and custom linear switches.",
        "price": 159.50,
        "stock": 60,
        "sku": "PER-MFK-009",
    },
    {
        "name": "SonicBuds Pro Wireless Earbuds",
        "description": "Noise-canceling spatial audio earbuds with wireless charging case and IPX5 water resistance.",
        "price": 179.99,
        "stock": 85,
        "sku": "AUD-SBP-010",
    },
    {
        "name": "StudioCraft Hi-Fi Audiophile Headphones",
        "description": "Open-back planar magnetic headphones engineered for reference studio listening and pristine audio.",
        "price": 349.00,
        "stock": 20,
        "sku": "AUD-SCH-011",
    },
    {
        "name": "StreamMic Pro USB Condenser Microphone",
        "description": "Studio-grade cardioid condenser USB-C microphone with internal pop filter and zero-latency monitoring.",
        "price": 119.99,
        "stock": 45,
        "sku": "AUD-SMP-012",
    },
    # ─── Category 4: Networking & Storage ───────────────────────
    {
        "name": "OrbitMesh Wi-Fi 7 Router System",
        "description": "Tri-band Wi-Fi 7 mesh router system covering up to 6,000 sq ft with speeds up to 19 Gbps.",
        "price": 429.99,
        "stock": 35,
        "sku": "NET-OM7-013",
    },
    {
        "name": "NetGate 8-Port 10GbE Switch",
        "description": "Fanless, silent 8-port 10 Gigabit managed switch with SFP+ uplink options.",
        "price": 289.00,
        "stock": 25,
        "sku": "NET-NG8-014",
    },
    {
        "name": "DataVault 4-Bay NAS Server",
        "description": "4-bay network storage enclosure supporting hardware RAID 0/1/5/10 and dual 2.5GbE LAN ports.",
        "price": 499.99,
        "stock": 18,
        "sku": "STO-DV4-015",
    },
    # ─── Category 5: Smart Office & Gear ────────────────────────
    {
        "name": "PulseWatch Ultra Smartwatch",
        "description": "Rugged titanium smartwatch with multi-band GPS, ECG heart monitor, and 5-day continuous battery.",
        "price": 399.99,
        "stock": 50,
        "sku": "WR-PWU-016",
    },
    {
        "name": "ErgoLift Motorized Standing Desk",
        "description": "Dual-motor height-adjustable desk with solid walnut top, digital memory presets, and cable rack.",
        "price": 549.00,
        "stock": 12,
        "sku": "FUR-ESD-017",
    },
    {
        "name": "Lumino Monitor Light Bar",
        "description": "Eye-care LED monitor light bar with auto-dimming ambient light sensor and wireless controller.",
        "price": 69.99,
        "stock": 90,
        "sku": "ACC-LDL-018",
    },
    {
        "name": "CyberShield Smart Power Strip",
        "description": "Wi-Fi enabled surge protector with 8 individually controlled smart outlets and energy monitoring.",
        "price": 49.99,
        "stock": 110,
        "sku": "ACC-SPS-019",
    },
    {
        "name": "OrbitKey Hardware Security Key",
        "description": "FIDO2 / U2F cryptographic security key featuring NFC and USB-C for secure multi-factor login.",
        "price": 39.99,
        "stock": 150,
        "sku": "SEC-OKK-020",
    },
]


def fetch_existing_skus(base_url: str) -> set:
    """Fetch all existing product SKUs from catalog-service."""
    url = f"{base_url}/products/"
    req = urllib.request.Request(url, headers={"accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                return {item.get("sku") for item in data if isinstance(item, dict) and "sku" in item}
    except Exception as err:
        print(f"Notice: Could not fetch existing SKUs from {url} ({err}). Will check each product individually.")
    return set()


def seed_product(base_url: str, product: dict) -> str:
    """
    POST a single product payload to catalog-service.
    Returns status: 'CREATED', 'EXISTS', or 'FAILED'.
    """
    url = f"{base_url}/products/"
    payload = json.dumps(product).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "accept": "application/json",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 201:
                return "CREATED"
    except urllib.error.HTTPError as err:
        if err.code == 400:
            body = err.read().decode("utf-8")
            if "already exists" in body or "SKU" in body:
                return "EXISTS"
            print(f"  [ERROR] Bad Request for {product['sku']}: {body}")
            return "FAILED"
        print(f"  [ERROR] HTTP {err.code} for {product['sku']}: {err.reason}")
        return "FAILED"
    except urllib.error.URLError as err:
        print(f"  [ERROR] Connection error connecting to {url}: {err.reason}")
        raise err

    return "FAILED"


def main():
    print("=" * 60)
    print("  OrbitStack Demo Catalog Data Seeder")
    print("=" * 60)
    print(f"Target Catalog Service URL: {CATALOG_SERVICE_URL}")

    # Step 1: Pre-fetch existing SKUs for fast check
    existing_skus = fetch_existing_skus(CATALOG_SERVICE_URL)
    if existing_skus:
        print(f"Found {len(existing_skus)} existing product(s) in catalog database.\n")

    created_count = 0
    skipped_count = 0
    failed_count = 0

    # Step 2: Iterate over demo products
    for idx, product in enumerate(DEMO_PRODUCTS, start=1):
        sku = product["sku"]
        name = product["name"]
        price = product["price"]

        if sku in existing_skus:
            print(f"[{idx:02d}/20] [EXISTS] {sku} - {name}")
            skipped_count += 1
            continue

        try:
            res = seed_product(CATALOG_SERVICE_URL, product)
            if res == "CREATED":
                print(f"[{idx:02d}/20] [CREATED] {sku} - {name} (${price:.2f})")
                created_count += 1
            elif res == "EXISTS":
                print(f"[{idx:02d}/20] [EXISTS] {sku} - {name}")
                skipped_count += 1
            else:
                print(f"[{idx:02d}/20] [FAILED] {sku} - {name}")
                failed_count += 1
        except urllib.error.URLError:
            print("\n[ERROR] Could not connect to catalog-service.")
            print("Please ensure OrbitStack microservices are running via:")
            print("   docker-compose up -d")
            sys.exit(1)

    print("\n" + "=" * 60)
    print("  Seeding Summary")
    print("=" * 60)
    print(f"Total Products Processed : {len(DEMO_PRODUCTS)}")
    print(f"Newly Created            : {created_count}")
    print(f"Already Existed          : {skipped_count}")
    print(f"Failed                   : {failed_count}")

    if failed_count == 0:
        print("\nCatalog demo data successfully seeded!")
    else:
        print("\nSeeding finished with some errors.")
        sys.exit(1)


if __name__ == "__main__":
    main()
