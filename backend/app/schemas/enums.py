from enum import Enum


class MaterialMode(str, Enum):
    STANDARD = "STANDARD"
    REGULAR = "REGULAR"


class StarterType(str, Enum):
    MANUAL = "manual"
    AUTO = "auto"
    TIMER = "timer"


class ElectricalPhase(str, Enum):
    SINGLE = "single"
    THREE = "three"
