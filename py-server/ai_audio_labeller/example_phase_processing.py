"""
Example script demonstrating phase-based processing usage.

This script shows how to use the new phase-based processing feature
to efficiently classify communication constructs in healthcare simulation data.
"""

import pandas as pd
from autolabeller import (
    process_csv_by_phases,
    slice_dataframe_by_phases,
    process_phase_with_genai,
    combine_genai_results_with_dataframe
)


def example_basic_usage():
    """
    Basic example: Process a CSV file by phases
    """
    print("=" * 60)
    print("Example 1: Basic Phase-Based Processing")
    print("=" * 60)
    
    # Define your phase timestamps
    # These represent: [start, phase1_end, phase2_end, phase3_end, end]
    phase_timestamps = [0, 100, 200, 300, 400]
    
    # Process the CSV file
    result_df = process_csv_by_phases(
        csv_file='original-filtered.csv',
        phase_timestamps=phase_timestamps,
        classification_type='multilabel'  # or 'binary'
    )
    
    # Save results
    output_file = 'results_with_phases.csv'
    result_df.to_csv(output_file, index=False)
    print(f"\nResults saved to: {output_file}")
    print(f"Total rows processed: {len(result_df)}")
    
    # Display sample of results
    print("\nSample of results:")
    print(result_df[['utterance_id', 'text', 'task_allocation', 'handover', 
                     'sharing_information', 'escalation']].head())


def example_custom_phases():
    """
    Example with custom phase definitions based on your simulation structure
    """
    print("\n" + "=" * 60)
    print("Example 2: Custom Phase Timestamps")
    print("=" * 60)
    
    # Example: 3 phases with different durations
    # Phase 1: Initial assessment (0-120 seconds)
    # Phase 2: Treatment (120-350 seconds)
    # Phase 3: Handover (350-500 seconds)
    phase_timestamps = [0, 120, 350, 500]
    
    result_df = process_csv_by_phases(
        csv_file='original-filtered.csv',
        phase_timestamps=phase_timestamps,
        classification_type='multilabel'
    )
    
    # Analyze results by phase
    df = pd.read_csv('original-filtered.csv')
    phase_slices = slice_dataframe_by_phases(df, phase_timestamps)
    
    print("\nPhase breakdown:")
    for i, phase_df in enumerate(phase_slices, 1):
        print(f"  Phase {i}: {len(phase_df)} utterances")


def example_programmatic_usage():
    """
    Example: Process phases programmatically with more control
    """
    print("\n" + "=" * 60)
    print("Example 3: Programmatic Phase Processing")
    print("=" * 60)
    
    # Load data
    df = pd.read_csv('original-filtered.csv')
    phase_timestamps = [0, 100, 200, 300, 400]
    
    # Slice into phases
    phase_slices = slice_dataframe_by_phases(df, phase_timestamps)
    print(f"Created {len(phase_slices)} phases")
    
    # Process each phase individually with custom logic
    all_results = []
    for i, phase_df in enumerate(phase_slices, 1):
        print(f"\nProcessing Phase {i}...")
        
        # You can add custom pre-processing here
        # For example, filter or transform the phase data
        
        # Process with GenAI
        phase_results = process_phase_with_genai(
            phase_df=phase_df,
            phase_num=i,
            classification_type='multilabel'
        )
        
        all_results.append(phase_results)
        
        # You can add custom post-processing here
        # For example, analyze phase-specific patterns
        constructs_sum = phase_results[['task_allocation', 'handover', 
                                        'sharing_information', 'escalation']].sum()
        print(f"Phase {i} summary:")
        print(constructs_sum)
    
    # Combine all results
    combined_results = pd.concat(all_results, ignore_index=True)
    
    # Merge with original data
    final_df = combine_genai_results_with_dataframe(df, combined_results)
    
    # Save
    final_df.to_csv('results_programmatic.csv', index=False)
    print(f"\nFinal results saved with {len(final_df)} rows")


def example_analysis():
    """
    Example: Analyze results after processing
    """
    print("\n" + "=" * 60)
    print("Example 4: Analyzing Phase-Based Results")
    print("=" * 60)
    
    # Assuming you've already processed the data
    df = pd.read_csv('results_with_phases.csv')
    
    # Calculate statistics
    construct_columns = ['task_allocation', 'handover', 'sharing_information',
                        'escalation', 'questioning', 'responding', 'acknowledging']
    
    print("\nOverall construct frequencies:")
    for construct in construct_columns:
        if construct in df.columns:
            frequency = df[construct].sum()
            percentage = (frequency / len(df)) * 100
            print(f"  {construct}: {frequency} ({percentage:.1f}%)")
    
    # Analyze by conversation
    if 'conversation_id' in df.columns:
        print("\nConstructs by conversation:")
        for construct in construct_columns[:3]:  # Show first 3
            if construct in df.columns:
                by_conversation = df.groupby('conversation_id')[construct].sum()
                print(f"\n  {construct}:")
                print(by_conversation)


if __name__ == "__main__":
    """
    Run examples - uncomment the one you want to try
    """
    
    # Example 1: Basic usage
    # example_basic_usage()
    
    # Example 2: Custom phases
    # example_custom_phases()
    
    # Example 3: Programmatic control
    # example_programmatic_usage()
    
    # Example 4: Analysis
    # example_analysis()
    
    print("\n" + "=" * 60)
    print("To run an example, uncomment it in the __main__ section")
    print("=" * 60)
    print("\nAvailable examples:")
    print("1. example_basic_usage() - Simple phase-based processing")
    print("2. example_custom_phases() - Custom phase definitions")
    print("3. example_programmatic_usage() - Full programmatic control")
    print("4. example_analysis() - Analyze processed results")
