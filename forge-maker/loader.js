(() => {
  const STYLE_PARTS = 7;
  const SCRIPT_PARTS = 10;

  const partNames = (prefix, count) =>
    Array.from({ length: count }, (_, index) =>
      `${prefix}-${String(index).padStart(2, "0")}.part`
    );

  const fetchCombinedText = async (names) => {
    const responses = await Promise.all(names.map((name) => fetch(name)));
    responses.forEach((response, index) => {
      if (!response.ok) {
        throw new Error(`${names[index]} 파일을 불러오지 못했습니다.`);
      }
    });

    const buffers = await Promise.all(responses.map((response) => response.arrayBuffer()));
    const totalLength = buffers.reduce((total, buffer) => total + buffer.byteLength, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    buffers.forEach((buffer) => {
      merged.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    });
    return new TextDecoder("utf-8").decode(merged);
  };

  Promise.all([
    fetchCombinedText(partNames("style", STYLE_PARTS)),
    fetchCombinedText(partNames("app", SCRIPT_PARTS)),
  ])
    .then(([css, gameCode]) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);

      const script = document.createElement("script");
      script.textContent = gameCode;
      document.body.appendChild(script);
    })
    .catch((error) => {
      const message = document.getElementById("boot-copy");
      if (message) message.textContent = `로딩 실패: ${error.message}`;
      console.error(error);
    });
})();
