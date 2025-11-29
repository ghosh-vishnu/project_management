"""
Script to remove unwanted files from the project
- __pycache__ directories
- .pyc files
- db.sqlite3 (if using PostgreSQL)
- node_modules in backend
- Temporary scripts
- Unused app directories
"""
import os
import shutil
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Files and directories to remove
UNWANTED_ITEMS = [
    # Cache directories
    '__pycache__',
    '.pytest_cache',
    '.mypy_cache',
    '.ruff_cache',
    
    # Database files (if using PostgreSQL)
    'db.sqlite3',
    
    # Node modules in backend (shouldn't be here)
    'node_modules',
    'package.json',
    'package-lock.json',
    
    # Temporary scripts
    'cleanup_unused_apps.py',
    'fix_designation_format.py',
    'clean_all_notifications.py',  # Keep this one, it's useful
    
    # Unused app directories (not in INSTALLED_APPS)
    'announcements',
    'companies',
    'deals',
    'documentation',
    'login',
    'reports',
    'reset_password',
    'roles_permission',
    'timesheet',
]

def remove_item(item_path):
    """Remove a file or directory"""
    try:
        if item_path.is_file():
            item_path.unlink()
            print(f"✅ Removed file: {item_path.name}")
            return True
        elif item_path.is_dir():
            shutil.rmtree(item_path)
            print(f"✅ Removed directory: {item_path.name}")
            return True
    except Exception as e:
        print(f"❌ Failed to remove {item_path.name}: {e}")
        return False

def find_and_remove_pycache():
    """Find and remove all __pycache__ directories"""
    removed_count = 0
    for root, dirs, files in os.walk(BASE_DIR):
        if '__pycache__' in dirs:
            pycache_path = Path(root) / '__pycache__'
            if remove_item(pycache_path):
                removed_count += 1
                dirs.remove('__pycache__')  # Don't walk into removed dir
    return removed_count

def find_and_remove_pyc_files():
    """Find and remove all .pyc files"""
    removed_count = 0
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.pyc'):
                pyc_path = Path(root) / file
                if remove_item(pyc_path):
                    removed_count += 1
    return removed_count

def main():
    print("🧹 Cleaning up unwanted files...\n")
    
    total_removed = 0
    
    # Remove __pycache__ directories
    print("📁 Removing __pycache__ directories...")
    pycache_count = find_and_remove_pycache()
    print(f"   Removed {pycache_count} __pycache__ directories\n")
    total_removed += pycache_count
    
    # Remove .pyc files
    print("📄 Removing .pyc files...")
    pyc_count = find_and_remove_pyc_files()
    print(f"   Removed {pyc_count} .pyc files\n")
    total_removed += pyc_count
    
    # Remove other unwanted items
    print("🗑️  Removing other unwanted files/directories...")
    for item_name in UNWANTED_ITEMS:
        item_path = BASE_DIR / item_name
        if item_path.exists():
            if remove_item(item_path):
                total_removed += 1
        else:
            # Check in subdirectories
            for root, dirs, files in os.walk(BASE_DIR):
                if item_name in dirs or item_name in files:
                    full_path = Path(root) / item_name
                    if full_path.exists():
                        if remove_item(full_path):
                            total_removed += 1
    
    print(f"\n✅ Cleanup completed! Removed {total_removed} items.")
    print("\n💡 Note: Some files might be in use. If removal failed, close any running processes.")
    
    # Remove this script itself (optional - comment out if you want to keep it)
    # script_path = Path(__file__)
    # if script_path.exists():
    #     print(f"\n🗑️  Removing cleanup script: {script_path.name}")
    #     script_path.unlink()

if __name__ == '__main__':
    main()

