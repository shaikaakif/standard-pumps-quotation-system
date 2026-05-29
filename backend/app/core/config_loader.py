import os
import json
from typing import Dict, Any, Optional


class ConfigLoader:
    """
    Singleton config loader that reads and caches shared JSON configurations
    from the root config/ directory.
    """

    _instance: Optional["ConfigLoader"] = None
    _configs: Dict[str, Any] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigLoader, cls).__new__(cls)
            cls._instance._init_loader()
        return cls._instance

    def _init_loader(self):
        # Locate the shared config directory relative to this file
        # backend/app/core/config_loader.py -> app/core -> app -> backend -> root
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.config_dir = os.path.abspath(
            os.path.join(current_dir, "..", "..", "config")
        )
        self.load_all_configs()

    def load_all_configs(self) -> None:
        """
        Walks through the config folder, reading all json files recursively and
        storing them in the cache using their sub-path keys (e.g., 'cables/local_cables').
        """
        if not os.path.exists(self.config_dir):
            raise FileNotFoundError(
                f"Shared config folder not found at: {self.config_dir}"
            )

        for root, _, files in os.walk(self.config_dir):
            for file in files:
                if file.endswith(".json"):
                    file_path = os.path.join(root, file)

                    # Calculate the relative path key (e.g., 'cables/local_cables')
                    rel_path = os.path.relpath(file_path, self.config_dir)
                    rel_key = os.path.splitext(rel_path)[0].replace(os.sep, "/")

                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            self._configs[rel_key] = json.load(f)
                    except Exception as e:
                        print(f"Error loading config file {file_path}: {e}")

    def get(self, key: str, default: Any = None) -> Any:
        """
        Retrieves a loaded config by key (e.g., 'cables/local_cables').
        Re-loads if the cache is empty.
        """
        if not self._configs:
            self.load_all_configs()
        return self._configs.get(key, default)

    def reload(self) -> None:
        """Clears cache and reloads all configs from disk."""
        self._configs.clear()
        self.load_all_configs()


# Global Singleton Instance for clean imports
settings = ConfigLoader()
