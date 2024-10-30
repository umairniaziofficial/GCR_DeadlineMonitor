class ClassroomTimer {
  constructor() {
    this.timers = new Map();
    this.init();
  }

  init() {
    this.convertDueDates();
    const observer = new MutationObserver(() => this.convertDueDates());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  parseDueDate(dueDateStr) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    dueDateStr = dueDateStr.replace(/^Due\s+/, "");

    if (dueDateStr.toLowerCase().startsWith("today")) {
      return new Date(today.toDateString() + " 23:59:00");
    }

    if (dueDateStr.toLowerCase().startsWith("tomorrow")) {
      return new Date(tomorrow.toDateString() + " 23:59:00");
    }

    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const weekdayMatch = weekdays.find((day) =>
      dueDateStr.toLowerCase().startsWith(day)
    );
    if (weekdayMatch) {
      const timeStr = dueDateStr.split(",")[1].trim();
      const targetDay = weekdays.indexOf(weekdayMatch);
      const currentDay = today.getDay();

      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }

      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      return new Date(dueDate.toDateString() + " " + timeStr);
    }

    try {
      const currentYear = today.getFullYear();
      const dueDateWithYear = `${dueDateStr}, ${currentYear}`;
      const dueDate = new Date(dueDateWithYear);

      if (!isNaN(dueDate.getTime())) {
        if (dueDate < today) {
          dueDate.setFullYear(currentYear + 1);
        }
        return dueDate;
      }
    } catch (error) {
      console.warn("Error parsing date with current year:", error);
    }

    const dueDate = new Date(dueDateStr);
    if (!isNaN(dueDate.getTime())) {
      return dueDate;
    }

    throw new Error(`Unsupported date format: ${dueDateStr}`);
  }

  formatCountdown(diff) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 300) {
      return "Due Date Passed :(";
    }

    if (diff < 0) {
      return "Past due";
    }

    let countdown = "";

    if (days > 0) {
      countdown += `${days}d ${hours.toString().padStart(2, "0")}:`;
      countdown += `${minutes.toString().padStart(2, "0")}:`;
      countdown += `${seconds.toString().padStart(2, "0")}`;
    } else if (hours > 0) {
      countdown += `${hours.toString().padStart(2, "0")}:`;
      countdown += `${minutes.toString().padStart(2, "0")}:`;
      countdown += `${seconds.toString().padStart(2, "0")}`;
    } else {
      countdown += `${minutes.toString().padStart(2, "0")}:`;
      countdown += `${seconds.toString().padStart(2, "0")}`;
    }

    return countdown;
  }

  updateTimer(timerElement, dueDate) {
    const now = new Date();
    const diff = dueDate - now;
    const countdown = this.formatCountdown(diff);

    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    const formattedDueDate = dueDate.toLocaleDateString("en-US", options);

    timerElement.innerHTML = `
      <span class="countdown-text">${countdown}</span>
      <span class="original-date">(${formattedDueDate})</span>
    `;

    timerElement.classList.toggle("past-due", diff < 0);
    timerElement.classList.toggle("red", diff / (1000 * 60 * 60 * 24) > 300);
    return diff > 0;
  }

  convertDueDates() {
    const dueDateElements = document.querySelectorAll(
      ".asQXV.BjHIWe:not([data-timer-converted])"
    );

    dueDateElements.forEach((element) => {
      try {
        const originalText = element.textContent;
        const dueDate = this.parseDueDate(originalText);

        const timerElement = document.createElement("div");
        timerElement.className = "countdown-timer";
        element.after(timerElement);

        element.setAttribute("data-timer-converted", "true");
        element.classList.add("hide-original");

        const intervalId = setInterval(() => {
          const shouldContinue = this.updateTimer(timerElement, dueDate);
          if (!shouldContinue) {
            clearInterval(intervalId);
          }
        }, 1000);

        this.timers.set(timerElement, intervalId);
        this.updateTimer(timerElement, dueDate);
      } catch (error) {
        console.warn("Error converting due date:", error);

        element.classList.remove("hide-original");
      }
    });
  }
}

window.addEventListener("load", () => {
  new ClassroomTimer();
});
