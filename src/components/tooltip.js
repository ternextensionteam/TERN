import "./base.css";

document.addEventListener("DOMContentLoaded", function () {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  let showTimeout;
  let hideTimeout;

  const positionTooltip = (target) => {
    const tooltipText = target.getAttribute("data-tooltip");
    const position = target.getAttribute("data-tooltip-position") || "top";

    console.log("Tooltip detected for element:", target);
    console.log("Tooltip text:", tooltipText);

    tooltip.textContent = tooltipText;
    tooltip.style.opacity = "0";
    tooltip.style.top = "-9999px";
    tooltip.style.left = "-9999px";

    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      let tooltipTop;
      let tooltipLeft = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;

      const spacing = 2;

      if (position === "bottom") {
        tooltipTop = rect.bottom + spacing;
      } else {
        tooltipTop = rect.top - tooltip.offsetHeight - spacing;
      }

      const padding = 10;
      const maxLeft = window.innerWidth - tooltip.offsetWidth - padding;
      const minLeft = padding;
      const maxTop = window.innerHeight - tooltip.offsetHeight - padding;
      const minTop = padding;

      if (tooltipLeft < minLeft) tooltipLeft = minLeft;
      if (tooltipLeft > maxLeft) tooltipLeft = maxLeft;
      if (tooltipTop < minTop) tooltipTop = minTop;
      if (tooltipTop > maxTop) tooltipTop = maxTop;

      tooltip.style.top = `${tooltipTop}px`;
      tooltip.style.left = `${tooltipLeft}px`;

      tooltip.style.opacity = "1";
      tooltip.classList.add("show");
    }, 10);
  };

  document.addEventListener("mouseover", function (event) {
    const target = event.target.closest("[data-tooltip]");
    if (target) {
      clearTimeout(hideTimeout);
      showTimeout = setTimeout(() => {
        positionTooltip(target);
      }, 150);
    }
  });

  document.addEventListener("mouseout", function (event) {
    const target = event.target.closest("[data-tooltip]");
    if (target) {
      clearTimeout(showTimeout);
      hideTimeout = setTimeout(() => {
        tooltip.classList.remove("show");
        tooltip.style.opacity = "0";
        tooltip.style.top = "-9999px";
        tooltip.style.left = "-9999px";
      }, 100);
    }
  });
});