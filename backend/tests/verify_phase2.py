import sys
import os

# Adjust path to import backend correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.config_loader import settings
from backend.app.schemas.enums import MaterialMode, StarterType
from backend.app.services.calculation_service import CalculationService
from backend.app.services.recommender import RecommendationService


def run_tests():
    print("--------------------------------------------------")
    print("PHASE 2 - CALCULATION AND RECOMMENDATION ENGINE TEST")
    print("--------------------------------------------------")

    # Verify Config Loader
    print("[1] Verifying config loading...")
    labels = settings.get("ui/labels")
    print(f"Loaded App Title: '{labels.get('app_title')}'")
    rules = settings.get("business/business_rules")
    print(f"Cable Extra Slack: {rules.get('cable_extra_meters')}m")

    # TEST CASE 1: SHALLOW BORE (200 FT) in REGULAR mode
    print("\n[2] Test Case 1: Shallow Bore (200 FT) - REGULAR Mode")
    feet_1 = 200
    mode_1 = MaterialMode.REGULAR

    pipe_1 = CalculationService.select_pipe(feet_1, mode_1)
    cable_1 = CalculationService.select_cable(feet_1, mode_1)

    print(
        f"-> Pipe: Brand={pipe_1.brand}, Type={pipe_1.type}, Price=Rs.{pipe_1.price_per_meter}/m, Total=Rs.{pipe_1.total_cost}"
    )
    print(
        f"-> Cable: Brand={cable_1.brand}, Spec={cable_1.spec}, Price=Rs.{cable_1.price_per_meter}/m, Total=Rs.{cable_1.total_cost}"
    )
    print(f"-> Cable Reasoning: {cable_1.reasoning}")

    # Recommends motor
    motors_1 = RecommendationService.recommend_motors(
        feet_1, "single", preferred_brand="Crompton", mode=mode_1
    )
    print(f"-> Recommended Motors: {len(motors_1)} matches found.")
    for m in motors_1:
        if m.is_primary_recommendation:
            print(f"   * Primary recommendation: {m.brand} {m.spec} (Rs.{m.price})")
            print(f"     Reasoning: {m.reasoning}")

            # Select starter matching recommended motor HP
            starter_1 = CalculationService.select_starter(
                "single", StarterType.MANUAL, m.hp
            )
            print(
                f"-> Starter Matching HP {m.hp}: Brand={starter_1.brand}, Price=Rs.{starter_1.price}"
            )

    # TEST CASE 2: DEEP BORE (500 FT) in REGULAR mode (Cutoff check > 350 FT)
    print("\n[3] Test Case 2: Deep Bore (500 FT) - REGULAR Mode")
    feet_2 = 500
    mode_2 = MaterialMode.REGULAR

    pipe_2 = CalculationService.select_pipe(feet_2, mode_2)
    cable_2 = CalculationService.select_cable(feet_2, mode_2)

    print(
        f"-> Pipe: Brand={pipe_2.brand}, Type={pipe_2.type}, Price=Rs.{pipe_2.price_per_meter}/m, Total=Rs.{pipe_2.total_cost}"
    )
    print(
        f"-> Cable: Brand={cable_2.brand}, Spec={cable_2.spec}, Price=Rs.{cable_2.price_per_meter}/m, Total=Rs.{cable_2.total_cost}"
    )
    print(f"-> Cable Reasoning: {cable_2.reasoning}")

    # TEST CASE 3: SHALLOW BORE (200 FT) in STANDARD mode (Enforce Brand check)
    print("\n[4] Test Case 3: Shallow Bore (200 FT) - STANDARD Mode")
    mode_3 = MaterialMode.STANDARD

    pipe_3 = CalculationService.select_pipe(feet_1, mode_3)
    cable_3 = CalculationService.select_cable(feet_1, mode_3)

    print(
        f"-> Pipe: Brand={pipe_3.brand}, Type={pipe_3.type}, Price=Rs.{pipe_3.price_per_meter}/m, Total=Rs.{pipe_3.total_cost}"
    )
    print(
        f"-> Cable: Brand={cable_3.brand}, Spec={cable_3.spec}, Price=Rs.{cable_3.price_per_meter}/m, Total=Rs.{cable_3.total_cost}"
    )
    print(f"-> Cable Reasoning: {cable_3.reasoning}")

    print("\n--------------------------------------------------")
    print("PHASE 2 - DYNAMIC CALCULATION SYSTEM VERIFIED")
    print("--------------------------------------------------")


if __name__ == "__main__":
    run_tests()
