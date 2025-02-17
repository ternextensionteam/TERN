import "./base.css";

document.addEventListener("DOMContentLoaded", function () {
  // Create the tooltip element
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  let showTimeout;
  let hideTimeout;

  // Function to position tooltip correctly after it knows its size
  const positionTooltip = (target) => {
    const tooltipText = target.getAttribute("data-tooltip");
    const position = target.getAttribute("data-tooltip-position") || "top"; // Default to "top"

    console.log("Tooltip detected for element:", target);
    console.log("Tooltip text:", tooltipText);

    // Set tooltip text but keep it invisible off-screen first
    tooltip.textContent = tooltipText;
    tooltip.style.opacity = "0"; // Hide initially
    tooltip.style.top = "-9999px"; // Place off-screen initially
    tooltip.style.left = "-9999px";

    // Use setTimeout(0) to let the browser update the tooltip's dimensions
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      let tooltipTop;
      let tooltipLeft = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;

      // ✅ Ensure 5px spacing between tooltip and element
      const spacing = 2;

      if (position === "bottom") {
        tooltipTop = rect.bottom + spacing;
      } else {
        tooltipTop = rect.top - tooltip.offsetHeight - spacing;
      }

      // Prevent tooltip from being too close to the edges
      const padding = 10;
      const maxLeft = window.innerWidth - tooltip.offsetWidth - padding;
      const minLeft = padding;
      const maxTop = window.innerHeight - tooltip.offsetHeight - padding;
      const minTop = padding;

      if (tooltipLeft < minLeft) tooltipLeft = minLeft;
      if (tooltipLeft > maxLeft) tooltipLeft = maxLeft;
      if (tooltipTop < minTop) tooltipTop = minTop;
      if (tooltipTop > maxTop) tooltipTop = maxTop;

      // Apply correct positions
      tooltip.style.top = `${tooltipTop}px`;
      tooltip.style.left = `${tooltipLeft}px`;

      // Fade in smoothly
      tooltip.style.opacity = "1";
      tooltip.classList.add("show");
    }, 10); // Small delay ensures dimensions are known before positioning
  };

  // Show the tooltip when hovering over elements with "data-tooltip"
  document.addEventListener("mouseover", function (event) {
    const target = event.target.closest("[data-tooltip]");
    if (target) {
      clearTimeout(hideTimeout);
      showTimeout = setTimeout(() => {
        positionTooltip(target);
      }, 150); // Delay prevents flickering
    }
  });

  // Hide the tooltip when the mouse leaves the element
  document.addEventListener("mouseout", function (event) {
    const target = event.target.closest("[data-tooltip]");
    if (target) {
      clearTimeout(showTimeout);
      hideTimeout = setTimeout(() => {
        tooltip.classList.remove("show");
        tooltip.style.opacity = "0"; // Hide smoothly
      }, 100);
    }
  });
});
