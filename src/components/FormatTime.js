export const formatReminderTime = (time) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "Invalid Time";

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isWithinNextWeek = date <= nextWeek;
    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
        return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    } 
    
    if (isTomorrow || isWithinNextWeek) {
        return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    }

    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

    if (isThisYear) {
        return `${formattedDate} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    } else {
        return `${formattedDate}/${date.getFullYear().toString().slice(-2)} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    }
};

export const formatDueDate = (date) => {
    if (!date) return "No Due Date"; // Handle cases where no due date is selected

    const dueDate = new Date(date);
    if (isNaN(dueDate.getTime())) return "Invalid Date"; // Handle invalid dates

    const now = new Date();
    const isThisYear = dueDate.getFullYear() === now.getFullYear();

    return `${dueDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: isThisYear ? undefined : "numeric", // Hide year if it's the current year
    })}`;
};

  