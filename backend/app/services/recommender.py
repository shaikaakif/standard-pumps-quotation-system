from typing import List, Optional
from .app.core.config_loader import settings
from .app.schemas.enums import MaterialMode
from .app.schemas.quotation import MotorRecommendation


class RecommendationService:
    """
    Recommendation Engine selecting the best submersible motor options
    matching borewell depth, phase compatibility, and active material mode.
    Includes rich context reasoning metadata.
    """

    @staticmethod
    def recommend_motors(
        feet: int,
        phase: str,
        preferred_brand: Optional[str] = None,
        mode: MaterialMode = MaterialMode.REGULAR,
    ) -> List[MotorRecommendation]:
        recommendations: List[MotorRecommendation] = []

        # Normalize inputs
        norm_brand = preferred_brand.lower().strip() if preferred_brand else None

        # Enforce premium only in STANDARD mode
        is_standard = mode == MaterialMode.STANDARD

        # Determine if we should recommend budget
        recommend_budget = False
        if not is_standard:
            if norm_brand == "budget" or norm_brand in [
                "jai kissan",
                "orient",
                "godavari",
            ]:
                recommend_budget = True
            elif norm_brand is None:
                # Default regular mode recommendations include both budget and premium
                recommend_budget = True

        # 1. Load Budget options if allowed
        if recommend_budget:
            budget_config = settings.get("motors/budget_options", {})
            models = budget_config.get("models", [])
            brands = budget_config.get("brands", ["Jai Kissan"])

            # Select default brand based on preferred_brand input
            default_brand = "Jai Kissan"
            if preferred_brand and preferred_brand in brands:
                default_brand = preferred_brand

            for m in models:
                if m.get("min_feet", 0) <= feet < m.get("max_feet", 2000):
                    # Check electrical phase compatibility
                    if phase in m.get("phase_compatibility", []):
                        reasoning = (
                            f"Regular Mode with Budget preference. Recommends highly affordable {default_brand} "
                            f"{m.get('spec')} designed for economical installations up to {m.get('max_feet')} FT."
                        )
                        recommendations.append(
                            MotorRecommendation(
                                brand=default_brand,
                                spec=m.get("spec", ""),
                                price=float(m.get("price", 8500)),
                                hp=float(m.get("hp", 1.0)),
                                stage=int(m.get("stage", 10)),
                                is_premium=False,
                                is_primary_recommendation=(
                                    norm_brand == "budget"
                                    or norm_brand
                                    in ["jai kissan", "orient", "godavari"]
                                    or norm_brand is None
                                ),
                                reasoning=reasoning,
                            )
                        )
                        break  # Found best fit budget model

        # 2. Load Premium options (Crompton, Aqua Texmo, CRI)
        premium_keys = ["crompton", "aqua_texmo", "cri"]

        # If standard mode or premium brand is preferred, select primary brand
        primary_premium_brand = "Crompton"
        if norm_brand in premium_keys:
            if norm_brand == "crompton":
                primary_premium_brand = "Crompton"
            elif norm_brand == "aqua_texmo":
                primary_premium_brand = "Aqua Texmo"
            elif norm_brand == "cri":
                primary_premium_brand = "CRI Pumps"

        for pk in premium_keys:
            config = settings.get(f"motors/{pk}", {})
            brand_name = config.get("brand", pk.capitalize())
            models = config.get("models", [])

            for m in models:
                if m.get("min_feet", 0) <= feet < m.get("max_feet", 2000):
                    if phase in m.get("phase_compatibility", []):
                        # Determine if this brand is the primary recommendation
                        is_primary = False
                        if is_standard:
                            is_primary = brand_name == primary_premium_brand
                        else:
                            # In regular mode, if a premium brand was explicitly requested
                            is_primary = norm_brand == pk or (
                                norm_brand in premium_keys
                                and brand_name == primary_premium_brand
                            )

                        spec_display = m.get("spec_display", m.get("spec", ""))
                        reasoning = (
                            f"Premium {brand_name} {spec_display} recommended. Features robust structural stages "
                            f"optimized for reliability, trust, and motor longevity at {feet} FT."
                        )

                        recommendations.append(
                            MotorRecommendation(
                                brand=brand_name,
                                spec=spec_display,
                                price=float(m.get("price", 16500)),
                                hp=float(m.get("hp", 1.5)),
                                stage=int(m.get("stage", 18)),
                                is_premium=True,
                                is_primary_recommendation=is_primary,
                                reasoning=reasoning,
                            )
                        )
                        break

        # If no recommendations are marked primary, default the first one
        if recommendations and not any(
            r.is_primary_recommendation for r in recommendations
        ):
            recommendations[0].is_primary_recommendation = True

        return recommendations
