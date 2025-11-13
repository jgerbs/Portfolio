// This is a worker script for attempting to brute-force a 4-digit PIN in parallel
onmessage = function(e) {
  const { correctPIN, start, end, id } = e.data;

  // for loop to attempt each PIN in the assigned range
  for (let i = start; i <= end; i++) {
    const pin = i.toString().padStart(4, "0");

    // Send attempt back to main thread
    postMessage({ type: "attempt", pin, id });

    // Check if the attempted PIN matches the correct PIN
    if (pin === correctPIN) {
      postMessage({ type: "found", id, pin });
      return;
    }
  }

  // Notify main thread that this worker has completed its range
  postMessage({ type: "done", id });
};
