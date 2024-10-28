document.addEventListener('DOMContentLoaded', function() {
    const dueDateInput = document.getElementById('dueDate');
    const errorDiv = document.getElementById('error');
    const countdownSpan = document.getElementById('countdown');
    
    let countdownInterval;
  
    function parseDueDate(dueDateStr) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      // Remove "Due " prefix if present
      dueDateStr = dueDateStr.replace(/^Due\s+/, '');
  
      if (dueDateStr.toLowerCase().startsWith('today')) {
        // Handle "Today, HH:MM AM/PM" format
        const timeStr = dueDateStr.split(',')[1].trim();
        const dueDate = new Date(today.toDateString() + ' ' + timeStr);
        return dueDate;
      } else if (dueDateStr.toLowerCase().startsWith('tomorrow')) {
        // Handle "Tomorrow, HH:MM AM/PM" format
        const timeStr = dueDateStr.split(',')[1].trim();
        const dueDate = new Date(tomorrow.toDateString() + ' ' + timeStr);
        return dueDate;
      } else {
        // Handle "Month Day, HH:MM AM/PM" format
        const dueDate = new Date(dueDateStr);
        if (isNaN(dueDate.getTime())) {
          throw new Error('Invalid date format');
        }
        return dueDate;
      }
    }
  
    function updateCountdown(dueDate) {
      const now = new Date();
      const diff = dueDate - now;
  
      if (diff < 0) {
        countdownSpan.textContent = 'Past due!';
        countdownSpan.style.color = '#dc3545';
        return false;
      }
  
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
      let countdown = '';
      if (days > 0) countdown += `${days}d `;
      countdown += `${hours.toString().padStart(2, '0')}:`;
      countdown += `${minutes.toString().padStart(2, '0')}:`;
      countdown += `${seconds.toString().padStart(2, '0')}`;
  
      countdownSpan.textContent = countdown;
      countdownSpan.style.color = '#2196F3';
      return true;
    }
  
    dueDateInput.addEventListener('input', function() {
      clearInterval(countdownInterval);
      errorDiv.style.display = 'none';
  
      try {
        const dueDate = parseDueDate(this.value);
        updateCountdown(dueDate);
        countdownInterval = setInterval(() => {
          if (!updateCountdown(dueDate)) {
            clearInterval(countdownInterval);
          }
        }, 1000);
      } catch (error) {
        errorDiv.textContent = 'Invalid date format. Please use one of the following formats:\n' +
          '- Due Today, HH:MM AM/PM\n' +
          '- Due Tomorrow, HH:MM AM/PM\n' +
          '- Due Month Day, HH:MM AM/PM';
        errorDiv.style.display = 'block';
        countdownSpan.textContent = '--:--:--';
      }
    });
  });