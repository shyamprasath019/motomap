"""Engine oil change DIY guides for all three Phase 1 bikes."""

from seeds.seed_types import GuideDef, StepDef

GUIDES: list[GuideDef] = [
    # ── BAJAJ PULSAR 150 ─────────────────────────────────────────────────────
    GuideDef(
        bike_slug="pulsar_150",
        part_name="Oil Filter",
        title="Engine Oil Change — Bajaj Pulsar 150",
        difficulty="BEGINNER",
        estimated_minutes=30,
        tools_required=[
            "17mm ring spanner (drain plug)",
            "Oil filter wrench or rubber strap",
            "Oil drain pan (2L minimum)",
            "Funnel",
            "Clean rags",
            "Torque wrench (optional but recommended)",
        ],
        steps=[
            StepDef(
                step_number=1,
                title="Warm up the engine",
                description="Start the bike and let it idle for 3-5 minutes. Warm oil flows faster and carries more suspended particles out with it. Do not ride — just idle.",
                warning="Engine and exhaust will be hot. Wear gloves for all subsequent steps. Do NOT drain cold oil — it leaves 20-30% more sludge in the engine.",
            ),
            StepDef(
                step_number=2,
                title="Position the drain pan",
                description="Place a drain pan under the engine sump. The drain plug on the Pulsar 150 is on the bottom-left of the engine crankcase. Use the centre stand to keep the bike level for accurate oil level checks later.",
                warning=None,
            ),
            StepDef(
                step_number=3,
                title="Remove the drain plug",
                description="Use a 17mm ring spanner to turn the drain plug counter-clockwise. Once loose, unscrew by hand while holding the pan under — hot oil will flow suddenly when the plug releases. Allow oil to drain completely (5-7 minutes).",
                warning="Hot oil can cause burns. Hold the spanner firmly — if the plug is overtightened, use a breaker bar, not a longer spanner extension which can strip the threads.",
            ),
            StepDef(
                step_number=4,
                title="Remove the oil filter",
                description="The oil filter is on the left side of the engine, just above the drain plug position. Turn counter-clockwise to remove. Hold a rag below it — some oil will spill when it releases. Allow remaining oil to drain.",
                warning="The filter may be hot. Use a rubber strap filter wrench if hand-tight removal isn't possible. Never use pliers — they crush the filter canister.",
            ),
            StepDef(
                step_number=5,
                title="Inspect and clean the drain plug",
                description="Wipe the drain plug clean and inspect the magnetic tip — a small amount of fine grey metallic dust is normal wear. Large metal chips (silver or brass-coloured) indicate engine wear and require mechanic inspection. Replace the copper sealing washer — reusing old washers causes weeping leaks.",
                warning=None,
            ),
            StepDef(
                step_number=6,
                title="Install the new oil filter",
                description="Lightly oil the new filter's rubber gasket with fresh engine oil using your finger. Thread the filter by hand until the gasket contacts the sealing surface, then turn an additional 3/4 turn — hand tight only, do NOT use a wrench to tighten.",
                warning="A dry filter gasket can stick and cause a false seal that leaks. Never overtighten — the gasket provides the seal, not torque.",
            ),
            StepDef(
                step_number=7,
                title="Reinstall the drain plug",
                description="Thread the drain plug in by hand first to avoid cross-threading. Once hand-tight, use the 17mm spanner to tighten to 20-25 Nm (approximately hand-tight plus 1/4 turn with a spanner). Do not overtighten.",
                warning="Cross-threading the drain plug destroys the aluminium sump threads. If the plug doesn't thread smoothly by hand, STOP and check alignment.",
            ),
            StepDef(
                step_number=8,
                title="Add fresh engine oil",
                description="Open the oil fill cap (top of engine, marked with an oil-can symbol). Insert funnel and pour in 1.0 litre of fresh 10W-30 mineral engine oil. For 2021+ BS6 Pulsar 150, use 10W-30 semi-synthetic. Do not overfill.",
                warning=None,
            ),
            StepDef(
                step_number=9,
                title="Start and check for leaks",
                description="Start the engine and let it idle for 2 minutes. Watch the drain plug area and oil filter for drips. The oil pressure warning light (red oil can icon) should go out within 3 seconds of starting.",
                warning="If the oil pressure light stays on after 5 seconds, STOP the engine immediately. Check oil level and inspect for leaks before restarting.",
            ),
            StepDef(
                step_number=10,
                title="Check the oil level",
                description="Stop the engine. Wait 2 minutes for oil to settle in the sump. Pull out the dipstick (same cap as fill hole on Pulsar 150 — integrated dipstick), wipe clean, reinsert fully, and pull out again to read. Level must be between MIN and MAX marks. Top up if needed.",
                warning=None,
            ),
        ],
    ),

    # ── TVS APACHE RTR 160 4V ────────────────────────────────────────────────
    GuideDef(
        bike_slug="apache_rtr_160_4v",
        part_name="Oil Filter",
        title="Engine Oil Change — TVS Apache RTR 160 4V",
        difficulty="BEGINNER",
        estimated_minutes=35,
        tools_required=[
            "14mm socket and ratchet (drain plug)",
            "Oil filter wrench",
            "Oil drain pan (2L minimum)",
            "Funnel",
            "Clean rags",
            "Torque wrench (recommended — aluminium sump)",
        ],
        steps=[
            StepDef(
                step_number=1,
                title="Warm up the engine",
                description="Run the Apache RTR 160 4V for 3-5 minutes at idle. The oil-cooled 4V engine benefits more from warm oil draining than air-cooled engines — the external oil cooler needs to be warm for complete drainage.",
                warning="Do not ride hard before an oil change — extremely hot oil (above 100°C) is dangerous to drain. Idling for 5 minutes is sufficient.",
            ),
            StepDef(
                step_number=2,
                title="Position the drain pan under the sump",
                description="The Apache RTR 160 4V drain plug is on the bottom of the engine, accessible from the right side. Use the centre stand. The external oil cooler lines run on the right — ensure the pan is positioned to catch oil from both the drain plug and any drips from the cooler circuit.",
                warning=None,
            ),
            StepDef(
                step_number=3,
                title="Remove the drain plug",
                description="Use a 14mm socket to loosen the drain plug counter-clockwise. Once loose, unscrew by hand and pull away quickly as oil flows. The RTR produces 15.6 Nm torque — its oil is worked harder and may appear darker than commuter bikes. Let drain for 5-7 minutes.",
                warning="The Apache RTR aluminium sump is softer than steel sumps — overtightening on reassembly is the primary cause of thread damage. Torque is critical.",
            ),
            StepDef(
                step_number=4,
                title="Remove the oil filter",
                description="The oil filter on the Apache RTR 160 4V is located on the left side of the engine below the gear shift lever. Use an oil filter wrench to break it loose, then unscrew by hand. Position rag below — the filter holds approximately 100ml of oil.",
                warning=None,
            ),
            StepDef(
                step_number=5,
                title="Inspect magnetic drain plug tip",
                description="The RTR's high-revving 4V head generates more fine metal particles than single-cam engines. A thin layer of fine grey paste on the magnetic tip is normal. Visible metal shavings require inspection — book a service to check valve clearances and cam chain tension.",
                warning=None,
            ),
            StepDef(
                step_number=6,
                title="Install new oil filter",
                description="Apply a film of fresh oil to the new filter's rubber gasket. Thread by hand until gasket seats, then 3/4 turn additional — do not use the wrench to tighten. TVS genuine filters (₹180-₹300) or Bosch equivalents are recommended. Avoid unknown brand filters on the 4V engine.",
                warning=None,
            ),
            StepDef(
                step_number=7,
                title="Reinstall drain plug with new washer",
                description="Always use a new copper crush washer. Thread plug in by hand to confirm no cross-threading. Torque to exactly 20 Nm with a torque wrench — the aluminium sump thread strips very easily if overtightened.",
                warning="This is the most critical step. Overtightening is irreversible damage. If you don't have a torque wrench: hand-tight + 1/4 turn maximum on this bike.",
            ),
            StepDef(
                step_number=8,
                title="Add fresh engine oil",
                description="The RTR 160 4V uses 1.1 litres capacity. Pour in 900ml of 15W-50 semi-synthetic first, then check level before adding the remaining 200ml. TVS recommends semi-synthetic for the 4V engine's high-revving nature and oil-cooling circuit.",
                warning="Do NOT use mineral oil in the Apache RTR 160 4V — the oil-cooled engine runs oil temperatures higher than air-cooled bikes, and mineral oil degrades faster under these conditions.",
            ),
            StepDef(
                step_number=9,
                title="Check oil level via sight glass",
                description="The RTR uses a sight glass window on the right side of the engine crankcase (not a dipstick). With the bike on the centre stand and engine cold, view the glass from the right side — oil must be between the two engraved lines.",
                warning="The sight glass must be read with the bike perfectly vertical on the centre stand. Tilting the bike affects the reading by up to 20%.",
            ),
            StepDef(
                step_number=10,
                title="Start, inspect for leaks, and record service",
                description="Start the engine. Watch oil pressure warning light — must extinguish within 3 seconds. Inspect filter and drain plug for seeping. Note the odometer reading and schedule next change at 4,000 km for semi-synthetic oil.",
                warning="If oil pressure light stays on: engine off immediately. Check oil level and leaks. Do not ride.",
            ),
        ],
    ),

    # ── ROYAL ENFIELD CLASSIC 350 ────────────────────────────────────────────
    GuideDef(
        bike_slug="re_classic_350",
        part_name="Engine Oil Filter",
        title="Engine Oil Change — Royal Enfield Classic 350 (J-platform)",
        difficulty="BEGINNER",
        estimated_minutes=40,
        tools_required=[
            "17mm socket and ratchet (drain plug)",
            "Oil filter wrench (filter is tighter than other bikes)",
            "Oil drain pan (2L minimum)",
            "Funnel",
            "Clean rags",
            "Torque wrench",
            "Motul 3000 10W-40 mineral or 15W-50 semi-synthetic (1.5L)",
        ],
        steps=[
            StepDef(
                step_number=1,
                title="Warm up the engine",
                description="Idle the Classic 350 for 5 minutes. The 349cc long-stroke engine has 1.5L oil capacity — warm oil drains more completely. RE recommends 3,000 km or 3-month oil change intervals. Check which applies first.",
                warning="RE's long-stroke engine generates more heat per displacement unit than short-stroke engines. Always use the warm-up step — cold oil changes leave significant residue.",
            ),
            StepDef(
                step_number=2,
                title="Position drain pan — note two drain points",
                description="Position the drain pan below the engine. The Classic 350 J-platform has the main sump drain plug at the bottom of the crankcase. Use the centre stand for a level bike.",
                warning=None,
            ),
            StepDef(
                step_number=3,
                title="Remove the main drain plug",
                description="Use 17mm socket to loosen the main drain plug at the engine sump bottom. Remove by hand once loose. Allow oil to drain fully — the 1.5L capacity takes 7-10 minutes to drain completely. Do not rush.",
                warning="Watch for oil dripping from the frame underside — the RE Classic's frame design can channel spilled oil forward. Protect the front tyre from contamination.",
            ),
            StepDef(
                step_number=4,
                title="Remove the oil filter (left side)",
                description="The J-platform Classic 350 oil filter is on the LEFT side of the engine, behind the left engine cover. Access requires reaching behind the cover. The filter is vertical — wrap a rag around it before removing to contain spillage. Turn counter-clockwise.",
                warning="The left-side filter location is commonly missed by riders used to right-side or bottom-mount filters on other bikes. Do NOT confuse the engine oil filter with the oil strainer mesh (separate component under the right cover — clean at 10,000 km service).",
            ),
            StepDef(
                step_number=5,
                title="Inspect drain plug magnetic tip",
                description="Wipe the magnetic drain plug and inspect particles: fine grey ferrous dust = normal wear. Larger metallic flakes on the J-platform Classic 350 may indicate cam chain wear (early J-platform had cam chain tensioner issues in 2021 models). Note for mechanic if found.",
                warning=None,
            ),
            StepDef(
                step_number=6,
                title="Install new oil filter",
                description="Apply fresh oil to new filter gasket. Thread by hand until gasket touches the seating surface. Give exactly 3/4 additional turn — the left-side filter on the Classic 350 tends to be overtightened by mechanics because of its awkward access. Mark the filter with a permanent marker at seating point to track 3/4 turn accurately.",
                warning=None,
            ),
            StepDef(
                step_number=7,
                title="Reinstall drain plug",
                description="New copper washer mandatory. Thread by hand, then torque to 20-25 Nm. Inspect washer seating surface on sump — if it shows grooves from previous overtightening, inform your mechanic at next service for sump thread inspection.",
                warning=None,
            ),
            StepDef(
                step_number=8,
                title="Add fresh engine oil — 1.5L total",
                description="Open oil fill cap (right side of engine near the cylinder). Pour 1.3L first via funnel. Wait for oil to settle (1 minute), check sight glass. If below MAX, add remaining oil in 100ml increments. Total capacity is 1.5L — do NOT overfill.",
                warning="Overfilling the Classic 350 causes oil to enter the breather system and airbox. Symptoms: white smoke from airbox drain, oil-fouled air filter. If overfilled, drain excess via drain plug.",
            ),
            StepDef(
                step_number=9,
                title="Check level via sight glass",
                description="The Classic 350 J-platform uses a sight glass on the RIGHT side of the engine, below the gear shift. With the bike vertical on the centre stand and oil cold (engine off 1 minute), view the glass — oil must show between the two horizontal lines.",
                warning="The sight glass reading is highly sensitive to bike angle. Always check with bike on centre stand, perfectly vertical. Have someone hold the bike straight or use a spirit level on the seat.",
            ),
            StepDef(
                step_number=10,
                title="Start, inspect for leaks, and update service record",
                description="Start the engine. Oil pressure warning light (if equipped) must extinguish within 3 seconds. Inspect filter and drain plug for drips. Note: RE Classic 350 engines are vocal — a slight ticking for 30 seconds post oil change is normal as oil pressure builds in the valve train.",
                warning="RE Classic 350 has a known tendency to tick on startup if oil film on cam lobes dries between services spaced more than 3 months apart. Shorter service intervals resolve this.",
            ),
        ],
    ),
]
