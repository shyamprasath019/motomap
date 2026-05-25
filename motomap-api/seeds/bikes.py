"""Phase 1 bike definitions — Bajaj Pulsar 150, TVS Apache RTR 160 4V, Royal Enfield Classic 350."""

from seeds.types import BikeDef

BIKES: list[BikeDef] = [
    BikeDef(
        slug="pulsar_150",
        make="Bajaj",
        model="Pulsar 150",
        year_start=2018,
        year_end=2023,
        variant=None,
        metadata={
            "engine_cc": 149,
            "fuel_system": "carburetor",
            "abs": False,
            "segment": "commuter_sport",
            "cooling": "air_cooled",
            "gearbox": "5_speed",
        },
    ),
    BikeDef(
        slug="apache_rtr_160_4v",
        make="TVS",
        model="Apache RTR 160 4V",
        year_start=2018,
        year_end=2023,
        variant="4V",
        metadata={
            "engine_cc": 159,
            "fuel_system": "fuel_injection",
            "abs": "dual_channel",
            "segment": "sport_commuter",
            "cooling": "oil_cooled",
            "gearbox": "5_speed",
        },
    ),
    BikeDef(
        slug="re_classic_350",
        make="Royal Enfield",
        model="Classic 350",
        year_start=2021,
        year_end=2023,
        variant="J-platform",
        metadata={
            "engine_cc": 349,
            "fuel_system": "fuel_injection",
            "abs": "dual_channel",
            "segment": "cruiser",
            "cooling": "air_oil_cooled",
            "gearbox": "5_speed",
            "platform": "J1D",
        },
    ),
]
