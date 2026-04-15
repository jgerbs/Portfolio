/* ============================================================
   parallel/worker.js
   Web Worker — searches an assigned chunk of the heuristic PIN list.

   Responsibilities:
   - Receives a list of { type, pin } items and the target PIN from the main thread
   - Iterates the list, posting "attempt" messages every N items for UI updates
   - Posts a "found" message and returns immediately when the PIN matches
   - Posts a "done" message when the chunk is exhausted without a match
   ============================================================ */

onmessage = function (e) {
    const { correctPIN, id, list, reportEvery = 50 } = e.data;

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const pin  = item.pin;

        /* Report progress periodically so the UI can display live updates */
        if (i % reportEvery === 0) {
            postMessage({ type: "attempt", pin, id, category: item.type });
        }

        if (pin === correctPIN) {
            postMessage({ type: "found", id, pin, category: item.type });
            return;
        }
    }

    postMessage({ type: "done", id });
};
