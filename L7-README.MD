
- Level 7: Sampling Strategies
================================
The Concept: In a high-traffic production system (e.g., 1,000 requests per second), storing every single trace is expensive (storage costs) and slow (network congestion).

 1.  Without Sampling: You record 100% of requests.
 2.  With Sampling: You record a percentage (e.g., 10%) of "normal" requests, while trying to keep errors.
 3.  The Golden Rule: Sampling affects Traces, but NOT Metrics.

Even if you only save 1% of your traces, your Prometheus counters (items_sold) must still count 100% of the sales. We will prove this works.


- Step 1: Update Instrumentation for Sampling
================================================
- We will modify your instrumentation-l5.ts to use a Sampler.
- We will use the ParentBasedSampler with a TraceIdRatioBasedSampler.
- Ratio: 0.5 (50%). This means we will randomly drop half the traces.

- ParentBased: This is smart. If a request comes in from a Frontend that already decided to record the trace, the Backend respects
               that decision (it doesn't drop it).
