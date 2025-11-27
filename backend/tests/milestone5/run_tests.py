"""
Test runner script for Milestone 5 API tests
Run this script to execute all test cases and generate reports
"""
import pytest
import sys
import os

def run_milestone5_tests():
    """Run all Milestone 5 test cases"""
    
    # Get paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(os.path.dirname(current_dir))
    
    # Add the backend directory to Python path
    sys.path.insert(0, backend_dir)
    
    # Change to backend directory for proper imports
    os.chdir(backend_dir)
    
    # Test configuration
    test_args = [
        current_dir,            # Test directory (absolute path)
        "-v",                   # Verbose output
        "--tb=short",           # Short traceback format
        "--strict-markers",     # Strict marker checking
        "-x",                   # Stop on first failure
        "--disable-warnings",   # Disable warnings for cleaner output
    ]
    
    print("=" * 60)
    print("MILESTONE 5 - API TESTING SUITE")
    print("Intellica Customer Support System")
    print("=" * 60)
    
    # Run the tests
    exit_code = pytest.main(test_args)
    
    print("\n" + "=" * 60)
    if exit_code == 0:
        print("[PASS] ALL TESTS PASSED SUCCESSFULLY!")
    else:
        print("[FAIL] SOME TESTS FAILED - CHECK OUTPUT ABOVE")
    print("=" * 60)
    
    return exit_code

if __name__ == "__main__":
    exit_code = run_milestone5_tests()
    sys.exit(exit_code)