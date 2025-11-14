onmessage = function (e) {
  const { correctPIN, id, list, reportEvery = 50 } = e.data;

  // Heuristic + full search in one list
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const pin = item.pin;

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
