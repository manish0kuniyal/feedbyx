(function () {
  const script = document.currentScript;
  const formId = script?.getAttribute("data-form-id");
  const containerId =
    script?.getAttribute("data-container-id") || "feedback-widget-container";

  if (!formId) {
    console.error("No formId provided.");
    return;
  }

  // 🔥 Dynamically detect base URL from script src
  const scriptSrc = script.src;
  const baseUrl = new URL(scriptSrc).origin;

  const iframe = document.createElement("iframe");
  iframe.src = `${baseUrl}/forms/${formId}`;
  iframe.width = "100%";
  iframe.height = "600";
  iframe.style.border = "none";
  iframe.style.maxWidth = "500px";
  iframe.style.display = "block";

  const mountPoint = document.getElementById(containerId);

  if (mountPoint) {
    mountPoint.appendChild(iframe);
  } else {
    console.warn("Container not found:", containerId);
  }
})();