from .app.core.config_loader import settings
from .app.schemas.enums import MaterialMode, StarterType
from .app.schemas.quotation import (
    PipeDetail,
    CableDetail,
    BrandDetail,
    StarterDetail,
    AccessoryDetail,
    FittingDetail,
    TotalsDetail,
)


class CalculationService:
    """
    Service executing dynamic config-driven calculations for quotation lines,
    incorporating material mode enums and trust-preserving brand display maps.
    """

    @staticmethod
    def convert_feet_to_meters(feet: int) -> float:
        """Converts feet depth to meters using ratios from business rules."""
        rules = settings.get("business/business_rules", {})
        ratio = rules.get("feet_to_meter_ratio", 3.28)
        return round(feet / ratio, 2)

    @staticmethod
    def calculate_cable_length(meters: float) -> float:
        """Adds standard cable installation slack to calculated length."""
        rules = settings.get("business/business_rules", {})
        extra = rules.get("cable_extra_meters", 10.0)
        return round(meters + extra, 2)

    @staticmethod
    def select_pipe(feet: int, mode: MaterialMode) -> PipeDetail:
        """
        Dynamically selects pipe based on mode guidelines and depth rules.
        Prepares REGULAR mode for future dynamic brands.
        """
        rules = settings.get("pipes/pipe_rules", {})
        mode_rules = rules.get("modes", {}).get(mode.value, {})
        selected_brand_name = mode_rules.get("default_brand", "Sudhakar Pipes")

        # Resolve config key from brand name
        brand_key = selected_brand_name.lower().replace(" ", "_")
        brand_config = settings.get(f"pipes/{brand_key}", {})
        rates = brand_config.get("rates", [])

        pipe_type = "12.5 KG"
        price_per_meter = 70.0

        for rate in rates:
            if rate.get("min_feet", 0) <= feet < rate.get("max_feet", 2000):
                pipe_type = rate.get("type", "12.5 KG")
                price_per_meter = rate.get("price_per_meter", 70.0)
                break

        meters = CalculationService.convert_feet_to_meters(feet)
        total_cost = round(meters * price_per_meter, 2)

        reasoning = ""
        if feet < rules.get("durability_recommendation_feet", 200):
            reasoning = rules.get("durability_recommendation_notice", "")

        return PipeDetail(
            brand=BrandDetail(
                internal_brand=selected_brand_name,
                display_brand=selected_brand_name,  # Pipe names map cleanly
            ),
            type=pipe_type,
            length_meters=meters,
            price_per_meter=price_per_meter,
            total_cost=total_cost,
            reasoning=reasoning if reasoning else None,
        )

    @staticmethod
    def select_cable(feet: int, mode: MaterialMode) -> CableDetail:
        """
        Calculates and recommends cables dynamically.
        STANDARD: Enforces premium Sudhakar company cable.
        REGULAR: Employs 350 FT cutoff; uses economical local cable for <= 350 FT,
                 and company cable for > 350 FT.

        Verdict: Replaces the display name of local cable with 'Cable WIRE'
        to protect customer trust on final estimations.
        """
        rules = settings.get("cables/cable_rules", {})
        cutoff = rules.get("local_cable_cutoff_feet", 350)

        meters = CalculationService.convert_feet_to_meters(feet)
        cable_len = CalculationService.calculate_cable_length(meters)

        internal_brand = ""
        display_brand = ""
        cable_spec = ""
        price_per_meter = 0.0
        reasoning = ""

        if mode == MaterialMode.STANDARD:
            internal_brand = rules.get("standard_mode_brand", "Sudhakar Company")
            display_brand = "Sudhakar Company Cable"
            brand_config = settings.get("cables/sudhakar_cables", {})
            rates = brand_config.get("rates", [])
            reasoning = rules.get("rules_description", {}).get(
                "standard_mode_behavior", ""
            )

            for rate in rates:
                if rate.get("min_feet", 0) <= feet < rate.get("max_feet", 2000):
                    cable_spec = rate.get("spec", "2.5 SQMM")
                    price_per_meter = rate.get("price_per_meter", 125.0)
                    break
        else:  # REGULAR MODE
            if feet <= cutoff:
                internal_brand = rules.get(
                    "regular_mode_brand_under_cutoff", "Local / Normal"
                )
                display_brand = (
                    "Cable WIRE"  # Verdict: Do not print 'local' to the client
                )
                brand_config = settings.get("cables/local_cables", {})
                rates = brand_config.get("rates", [])
                reasoning = rules.get("rules_description", {}).get(
                    "regular_mode_behavior", ""
                )

                for rate in rates:
                    if rate.get("spec") == "2.5 SQMM":
                        cable_spec = "2.5 SQMM"
                        price_per_meter = rate.get("price_per_meter", 90.0)
                        break
            else:  # Over cutoff -> elevate to Company Cable
                internal_brand = rules.get(
                    "regular_mode_brand_over_cutoff", "Sudhakar Company"
                )
                display_brand = "Sudhakar Company Cable"
                brand_config = settings.get("cables/sudhakar_cables", {})
                rates = brand_config.get("rates", [])
                reasoning = "Borewell depth exceeds 350 feet cutoff. Branded company cable recommended for safety."

                for rate in rates:
                    if rate.get("min_feet", 0) <= feet < rate.get("max_feet", 2000):
                        cable_spec = rate.get("spec", "2.5 SQMM")
                        price_per_meter = rate.get("price_per_meter", 125.0)
                        break

        total_cost = round(cable_len * price_per_meter, 2)

        return CableDetail(
            brand=BrandDetail(
                internal_brand=internal_brand, display_brand=display_brand
            ),
            spec=cable_spec,
            length_meters=cable_len,
            price_per_meter=price_per_meter,
            total_cost=total_cost,
            reasoning=reasoning,
        )

    @staticmethod
    def select_starter(
        phase: str, starter_type: StarterType, motor_hp: float
    ) -> StarterDetail:
        """Recommends and prices control panel starters based on phase & motor HP."""
        if phase == "three":
            config = settings.get("starters/three_phase", {})
            timer_cfg = config.get("timer", {})
            return StarterDetail(
                brand=timer_cfg.get("brand", "Standard 3-Phase Timer"),
                type="timer",
                price=float(timer_cfg.get("price", 3000)),
            )
        else:  # SINGLE PHASE
            config = settings.get("starters/single_phase", {})
            type_key = (
                "auto"
                if starter_type == StarterType.AUTO or starter_type == StarterType.TIMER
                else "manual"
            )
            type_cfg = config.get(type_key, {})

            brands = type_cfg.get("brands", ["Sunshine"])
            brand_name = brands[0]
            rates = type_cfg.get("rates", [])

            price = 2000.0
            for rate in rates:
                if rate.get("hp") == motor_hp:
                    price = float(rate.get("price", 2000))
                    break
            if type_key == "manual" and len(brands) > 1:
                brand_name = f"{brands[0]} / {brands[1]}"

            return StarterDetail(brand=brand_name, type=type_key, price=price)

    @staticmethod
    def get_accessories() -> AccessoryDetail:
        """Retrieves default accessories pricing."""
        config = settings.get("fittings/accessories", {})
        return AccessoryDetail(
            name=config.get("name", "Standard Accessories Set"),
            price=float(config.get("price", 1200)),
        )

    @staticmethod
    def select_fitting_charges(feet: int) -> FittingDetail:
        """Calculates fitting charge ranges dynamically based on depth rules."""
        config = settings.get("fittings/fitting_charges", {})
        ranges = config.get("ranges", [])

        label = "Fitting Charge"
        charge = 1500.0
        method = "manual"

        for r in ranges:
            if r.get("min_feet", 0) <= feet < r.get("max_feet", 5000):
                label = r.get("label", "Fitting Charge")
                charge = float(r.get("charge", 1500.0))
                method = r.get("method", "manual")
                break

        return FittingDetail(label=label, price=charge, method=method)

    @staticmethod
    def calculate_totals(
        subtotal: float, discount_override: float = None
    ) -> TotalsDetail:
        """Calculates subtotals, default or custom discounts, and grand totals."""
        discounts_cfg = settings.get("business/discounts", {})
        default_pct = discounts_cfg.get("default_discount_percentage", 2.5)

        discount_percentage = (
            default_pct if discount_override is None else discount_override
        )
        discount_amount = round(subtotal * (discount_percentage / 100.0), 2)
        grand_total = round(subtotal - discount_amount, 2)

        return TotalsDetail(
            subtotal=subtotal,
            discount_percentage=discount_percentage,
            discount_amount=discount_amount,
            grand_total=grand_total,
        )
