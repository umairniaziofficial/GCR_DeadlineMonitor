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
      subtree: true
    });
  }

  parseDueDate(dueDateStr) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Remove "Due " prefix if present
    dueDateStr = dueDateStr.replace(/^Due\s+/, '');

    // Case 1: Today format
    if (dueDateStr.toLowerCase().startsWith('today')) {
      const timeStr = dueDateStr.split(',')[1].trim();
      return new Date(today.toDateString() + ' ' + timeStr);
    }

    // Case 2: Tomorrow format
    if (dueDateStr.toLowerCase().startsWith('tomorrow')) {
      const timeStr = dueDateStr.split(',')[1].trim();
      return new Date(tomorrow.toDateString() + ' ' + timeStr);
    }

    // Case 3: Weekday format (e.g., "Wednesday, 11:59 PM")
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const weekdayMatch = weekdays.find(day => dueDateStr.toLowerCase().startsWith(day));
    if (weekdayMatch) {
      const timeStr = dueDateStr.split(',')[1].trim();
      const targetDay = weekdays.indexOf(weekdayMatch);
      const currentDay = today.getDay();
      
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) { // If the day has passed this week, look to next week
        daysToAdd += 7;
      }

      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      return new Date(dueDate.toDateString() + ' ' + timeStr);
    }

    // Case 4: Month Day format (e.g., "October 30, 11:59 PM")
    try {
      // First, try parsing with current year
      const currentYear = today.getFullYear();
      const dueDateWithYear = `${dueDateStr}, ${currentYear}`;
      const dueDate = new Date(dueDateWithYear);

      if (!isNaN(dueDate.getTime())) {
        // If the date is in the past, try next year
        if (dueDate < today) {
          dueDate.setFullYear(currentYear + 1);
        }
        return dueDate;
      }
    } catch (error) {
      console.warn('Error parsing date with current year:', error);
    }

    // If all else fails, try direct parsing
    const dueDate = new Date(dueDateStr);
    if (!isNaN(dueDate.getTime())) {
      return dueDate;
    }

    throw new Error(`Unsupported date format: ${dueDateStr}`);
  }

  formatCountdown(diff) {
    if (diff < 0) {
      return 'Past due';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let countdown = '';
    
    // Always show seconds, regardless of time remaining
    if (days > 0) {
      countdown += `${days}d ${hours.toString().padStart(2, '0')}:`;
      countdown += `${minutes.toString().padStart(2, '0')}:`;
      countdown += `${seconds.toString().padStart(2, '0')}`;
    } else if (hours > 0) {
      countdown += `${hours.toString().padStart(2, '0')}:`;
      countdown += `${minutes.toString().padStart(2, '0')}:`;
      countdown += `${seconds.toString().padStart(2, '0')}`;
    } else {
      countdown += `${minutes.toString().padStart(2, '0')}:`;
      countdown += `${seconds.toString().padStart(2, '0')}`;
    }

    return countdown;
  }

  updateTimer(timerElement, dueDate) {
    const now = new Date();
    const diff = dueDate - now;
    const countdown = this.formatCountdown(diff);
    
    // Format the due date in a readable format
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };
    const formattedDueDate = dueDate.toLocaleDateString('en-US', options);
    
    timerElement.innerHTML = `
      <span class="countdown-text">${countdown}</span>
      <span class="original-date">(${formattedDueDate})</span>
    `;
    
    timerElement.classList.toggle('past-due', diff < 0);
    return diff > 0;
  }

  convertDueDates() {
    const dueDateElements = document.querySelectorAll('.asQXV.BjHIWe:not([data-timer-converted])');

    dueDateElements.forEach(element => {
      try {
        const originalText = element.textContent;
        const dueDate = this.parseDueDate(originalText);
        
        // Create timer element
        const timerElement = document.createElement('div');
        timerElement.className = 'countdown-timer';
        element.after(timerElement);
        
        // Mark original element
        element.setAttribute('data-timer-converted', 'true');
        element.classList.add('hide-original');

        // Set up interval
        const intervalId = setInterval(() => {
          const shouldContinue = this.updateTimer(timerElement, dueDate);
          if (!shouldContinue) {
            clearInterval(intervalId);
          }
        }, 1000);

        this.timers.set(timerElement, intervalId);
        this.updateTimer(timerElement, dueDate);

      } catch (error) {
        console.warn('Error converting due date:', error);
        // If there's an error, show the original text
        element.classList.remove('hide-original');
      }
    });
  }
}

// Initialize
window.addEventListener('load', () => {
  new ClassroomTimer();
});