import "./base.css";

document.addEventListener("DOMContentLoaded", function () {
  // Create the tooltip element
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  let showTimeout;
  let hideTimeout;

  // Show the tooltip when hovering over elements with the "data-tooltip" attribute
  document.addEventListener("mouseover", function (event) {
    const target = event.target.closest("[data-tooltip]");
    if (target) {
      const tooltipText = target.getAttribute("data-tooltip");
      const position = target.getAttribute("data-tooltip-position") || "top"; // Default to "top"

      console.log("Tooltip detected for element:", target);
      console.log("Tooltip text:", tooltipText);

      // Set the tooltip text
      tooltip.textContent = tooltipText;

      // Calculate the tooltip position
      const rect = target.getBoundingClientRect();
      let tooltipTop;
      let tooltipLeft = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;

      if (position === "bottom") {
        tooltipTop = rect.bottom + 5;
      } else {
        tooltipTop = rect.top - tooltip.offsetHeight - 5; 
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

      // Apply positions to the tooltip
      tooltip.style.top = `${tooltipTop}px`;
      tooltip.style.left = `${tooltipLeft}px`;

      clearTimeout(hideTimeout); 
      showTimeout = setTimeout(() => {
        tooltip.classList.add("show");
      }, 300); 
    }
  });

  // Hide the tooltip when the mouse leaves the element
  document.addEventListener("mouseout", function (event) {
    const target = event.target.closest("[data-tooltip]");
    if (target) {
      console.log("Mouse out from element:", target);

      clearTimeout(showTimeout);
      hideTimeout = setTimeout(() => {
        tooltip.classList.remove("show");
      }, 200); 
    }
  });
});
