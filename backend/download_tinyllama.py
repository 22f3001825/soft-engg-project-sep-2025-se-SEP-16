"""
Pre-download TinyLlama model to avoid delays on first use
This script will download and cache the model properly
"""

import os
import shutil
from pathlib import Path

def clear_model_cache():
    """Clear existing TinyLlama cache if corrupted"""
    cache_dir = Path.home() / ".cache" / "huggingface" / "hub"
    
    if cache_dir.exists():
        print(f"Checking cache directory: {cache_dir}")
        
        # Find TinyLlama cache folders
        tinyllama_folders = list(cache_dir.glob("*TinyLlama*"))
        
        if tinyllama_folders:
            print(f"\nFound {len(tinyllama_folders)} TinyLlama cache folder(s):")
            for folder in tinyllama_folders:
                print(f"  - {folder.name}")
            
            response = input("\nDelete these cached files? (yes/no): ").strip().lower()
            if response == 'yes':
                for folder in tinyllama_folders:
                    print(f"Deleting {folder.name}...")
                    shutil.rmtree(folder)
                print("✓ Cache cleared!")
            else:
                print("Keeping existing cache.")
        else:
            print("No TinyLlama cache found.")
    else:
        print("Cache directory doesn't exist yet.")

def download_model():
    """Download TinyLlama model"""
    print("\n" + "="*80)
    print("DOWNLOADING TINYLLAMA-1.1B-CHAT MODEL")
    print("="*80)
    print("\nThis will download ~2.2 GB of model files.")
    print("Download time depends on your internet speed (5-15 minutes typical).\n")
    
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        import torch
        
        model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
        
        print(f"Model: {model_name}")
        print("Device: CPU")
        print("\nStep 1/2: Downloading tokenizer...")
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        print("✓ Tokenizer downloaded successfully!")
        
        print("\nStep 2/2: Downloading model weights...")
        print("(This is the large download - please be patient)")
        
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        
        print("✓ Model downloaded successfully!")
        
        # Test generation
        print("\nStep 3/3: Testing model...")
        test_prompt = "<|user|>\nHello</s>\n<|assistant|>\n"
        inputs = tokenizer(test_prompt, return_tensors="pt")
        
        outputs = model.generate(
            **inputs,
            max_new_tokens=10,
            do_sample=False
        )
        
        response = tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
        print(f"✓ Model test successful! Response: {response[:50]}")
        
        print("\n" + "="*80)
        print("SUCCESS! TinyLlama is ready to use.")
        print("="*80)
        print("\nThe model is now cached and will load quickly on backend startup.")
        print("First generation will still take 20-30 seconds (model initialization).")
        print("Subsequent generations will be 3-10 seconds.\n")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error downloading model: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("TinyLlama Model Download & Cache Management")
    print("="*80)
    
    # Step 1: Clear cache if needed
    clear_model_cache()
    
    # Step 2: Download model
    print("\n")
    response = input("Proceed with download? (yes/no): ").strip().lower()
    
    if response == 'yes':
        success = download_model()
        if success:
            print("\n✓ All done! You can now start the backend server.")
        else:
            print("\n✗ Download failed. Please check your internet connection and try again.")
    else:
        print("Download cancelled.")
