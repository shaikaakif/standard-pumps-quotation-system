import os
import unittest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database.db import Base
from backend.app.database.models import Customer, Quotation
from backend.app.services.history_service import HistoryService


class TestDatabasePersistence(unittest.TestCase):
    """
    TestDatabasePersistence: Executes comprehensive database operations validation,
    asserting normalization, saves, search joins, pagination, and soft deletion.
    """

    @classmethod
    def setUpClass(cls):
        # Configure local test temporary database
        cls.db_url = "sqlite:///./test_temp.db"
        cls.engine = create_engine(
            cls.db_url, connect_args={"check_same_thread": False}
        )
        cls.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=cls.engine
        )

        # Create all tables
        Base.metadata.create_all(bind=cls.engine)

    @classmethod
    def tearDownClass(cls):
        # Tear down temp database files
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()  # Close active SQLite connection pool and file handles
        if os.path.exists("./test_temp.db"):
            os.remove("./test_temp.db")

    def setUp(self):
        self.db = self.SessionLocal()

    def tearDown(self):
        self.db.query(Quotation).delete()
        self.db.query(Customer).delete()
        self.db.commit()
        self.db.close()

    def test_strict_phone_normalization(self):
        """
        Verify that raw phone numbers from different platforms and text inputs
        are strictly normalized to exactly 10 numeric digits.
        """
        test_cases = [
            ("+91 98765 43210", "9876543210"),
            ("919876543210", "9876543210"),
            ("98765-43210", "9876543210"),
            ("(987) 654-3210", "9876543210"),
            ("   98765 43210   ", "9876543210"),
            ("9876543210", "9876543210"),
        ]

        for raw, expected in test_cases:
            normalized = HistoryService.normalize_phone(raw)
            self.assertEqual(normalized, expected, f"Failed for raw input: {raw}")

    def test_auto_save_and_customer_get_or_create(self):
        """
        Asserts that save_quotation inserts records into SQLite correctly
        and hooks them up to the right Customer without duplicating rows.
        """
        mock_uuid = str(uuid.uuid4())
        mock_payload_1 = {
            "quotation_id": mock_uuid,
            "customer_name": "Ramesh Reddy",
            "phone": "+91 98765 43210",
            "feet": 500,
            "mode": "REGULAR",
            "totals": {"grand_total": 65432.50},
        }

        # 1. First save
        q1 = HistoryService.save_quotation(self.db, mock_payload_1)
        self.assertIsNotNone(q1)
        self.assertEqual(q1.id, mock_uuid)
        self.assertEqual(q1.customer.name, "Ramesh Reddy")
        self.assertEqual(q1.phone, "9876543210")
        self.assertEqual(q1.grand_total, 65432.50)

        # Verify Customer row created
        customer_count = self.db.query(Customer).count()
        self.assertEqual(customer_count, 1)

        # 2. Second save with the same phone number (should reuse Customer record)
        mock_uuid_2 = str(uuid.uuid4())
        mock_payload_2 = {
            "quotation_id": mock_uuid_2,
            "customer_name": "Ramesh Reddy",
            "phone": "98765-43210",
            "feet": 600,
            "mode": "STANDARD",
            "totals": {"grand_total": 85000.00},
        }

        q2 = HistoryService.save_quotation(self.db, mock_payload_2)
        self.assertIsNotNone(q2)
        self.assertEqual(q2.id, mock_uuid_2)
        self.assertEqual(q2.customer_id, q1.customer_id)  # Same customer FK!

        # Verify Customer row is NOT duplicated
        customer_count = self.db.query(Customer).count()
        self.assertEqual(customer_count, 1)

    def test_history_search_and_pagination(self):
        """
        Asserts that search substring matching works instantly,
        pagination parameters slice lists correctly, and returns counts.
        """
        # Save three mock estimates
        HistoryService.save_quotation(
            self.db,
            {
                "quotation_id": str(uuid.uuid4()),
                "customer_name": "Ramesh Reddy",
                "phone": "9876543210",
                "feet": 500,
                "mode": "REGULAR",
                "totals": {"grand_total": 60000.00},
            },
        )
        HistoryService.save_quotation(
            self.db,
            {
                "quotation_id": str(uuid.uuid4()),
                "customer_name": "Suresh Kumar",
                "phone": "9123456789",
                "feet": 300,
                "mode": "REGULAR",
                "totals": {"grand_total": 45000.00},
            },
        )
        HistoryService.save_quotation(
            self.db,
            {
                "quotation_id": str(uuid.uuid4()),
                "customer_name": "Amith Patel",
                "phone": "9876512345",
                "feet": 450,
                "mode": "STANDARD",
                "totals": {"grand_total": 75000.00},
            },
        )

        # 1. Search Name Substring
        results, count = HistoryService.get_history(self.db, search_query="Ramesh")
        self.assertEqual(len(results), 1)
        self.assertEqual(count, 1)
        self.assertEqual(results[0].customer_name, "Ramesh Reddy")

        # 2. Search Phone Substring
        results, count = HistoryService.get_history(self.db, search_query="98765")
        self.assertEqual(count, 2)  # Ramesh and Amith match

        # 3. Test Pagination (limit and offset)
        results, count = HistoryService.get_history(self.db, limit=2, offset=0)
        self.assertEqual(len(results), 2)
        self.assertEqual(count, 3)

        results_page2, count_page2 = HistoryService.get_history(
            self.db, limit=2, offset=2
        )
        self.assertEqual(len(results_page2), 1)
        self.assertEqual(count_page2, 3)

    def test_soft_delete_and_workflow_status(self):
        """
        Verifies that deleting an item updates status to DELETED
        and keeps backing logs intact but hidden from search outputs.
        """
        mock_id = str(uuid.uuid4())
        HistoryService.save_quotation(
            self.db,
            {
                "quotation_id": mock_id,
                "customer_name": "Lokesh Kumar",
                "phone": "9898989898",
                "feet": 400,
                "mode": "REGULAR",
                "totals": {"grand_total": 52000.00},
            },
        )

        # Check in history
        items, count = HistoryService.get_history(self.db)
        self.assertEqual(count, 1)

        # Soft Delete
        success = HistoryService.soft_delete_quotation(self.db, mock_id)
        self.assertTrue(success)

        # Check history again (should hide the deleted record)
        items, count = HistoryService.get_history(self.db)
        self.assertEqual(count, 0)

        # Check backing database (record must still exist under soft-deleted state)
        record = self.db.query(Quotation).filter_by(id=mock_id).first()
        self.assertIsNotNone(record)
        self.assertEqual(record.status, "DELETED")


if __name__ == "__main__":
    unittest.main()
