// Human comment: small script to wire up the card behaviour — time calculations, checkbox toggle, and button stubs.

(function(){
  // Config: a due date that is a few days from now so the example shows "Due in X days" on first load.
  // Using an offset helps tests be tolerant regardless of current date.
  // Set due date to April 16, 2026, 11:59 PM GMT+1
  // Note: JS Date months are 0-based (April = 3)
  const dueDate = new Date(Date.UTC(2026, 3, 16, 22, 59, 0)); // 22:59 UTC = 23:59 GMT+1

  // DOM refs
  const dueEl = document.getElementById('due-date');
  const remainingEl = document.getElementById('time-remaining');
  const statusEl = document.querySelector('[data-testid="test-todo-status"]');
  const badgePriority = document.querySelector('[data-testid="test-todo-priority"]');
  const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]');
  const card = document.querySelector('[data-testid="test-todo-card"]');
  const editBtn = document.querySelector('[data-testid="test-todo-edit-button"]');
  const deleteBtn = document.querySelector('[data-testid="test-todo-delete-button"]');

  // Friendly date formatter
  function formatDueDate(d){
    // e.g., "Due Mar 1, 2026"
    const opts = { year:'numeric', month:'short', day:'numeric' };
    return `Due ${d.toLocaleDateString(undefined, opts)}`;
  }

  // Calculate friendly time remaining string
  function timeRemaining(d){
    const now = new Date();
    const diff = d - now; // ms
    const abs = Math.abs(diff);
    const mins = Math.floor(abs / (60*1000));
    const hours = Math.floor(abs / (60*60*1000));
    const days = Math.floor(abs / (24*60*60*1000));

    if(Math.abs(diff) < 60*1000){
      return { text: 'Due now!', tense: diff >= 0 ? 'future' : 'past' };
    }

    if(diff > 0){
      // due in future
      if(days >= 2) return { text: `Due in ${days} days`, tense:'future' };
      if(days === 1) return { text: 'Due tomorrow', tense:'future' };
      if(hours >= 1) return { text: `Due in ${hours} hours`, tense:'future' };
      return { text: `Due in ${mins} minutes`, tense:'future' };
    } else {
      // overdue
      if(days >= 1) return { text: `Overdue by ${days} days`, tense:'past' };
      if(hours >= 1) return { text: `Overdue by ${hours} hours`, tense:'past' };
      return { text: `Overdue by ${mins} minutes`, tense:'past' };
    }
  }

  // Initialize UI with due date and remaining time
  function renderTime(){
    dueEl.setAttribute('datetime', dueDate.toISOString());
    dueEl.textContent = formatDueDate(dueDate);

    const rem = timeRemaining(dueDate);
    remainingEl.textContent = rem.text;
  }

  // Toggle behaviour when checkbox changes
  function onToggle(e){
    const checked = e.target.checked;
    if(checked){
      // Mark done visually and update status
      card.classList.add('done');
      statusEl.textContent = 'Done';
      statusEl.setAttribute('aria-label','Status: Done');
    } else {
      card.classList.remove('done');
      statusEl.textContent = 'Pending';
      statusEl.setAttribute('aria-label','Status: Pending');
    }
  }

  // Hook up buttons (simple stubs)
  function onEdit(){
    console.log('edit clicked');
  }

  function onDelete(){
    // deletion should ask user for confirmation; keeping it simple for Stage 0
    alert('Delete clicked');
  }

  // Keyboard accessibility: ensure Enter/Space on buttons works (native buttons already handle it).

  // initial render
  renderTime();

  // Update roughly every 60s; store interval id so it could be cleared if needed
  const updateInterval = setInterval(renderTime, 60 * 1000);

  // Event listeners
  checkbox.addEventListener('change', onToggle);
  editBtn.addEventListener('click', onEdit);
  deleteBtn.addEventListener('click', onDelete);

  // Expose a tiny API for tests or debugging
  window.__todoCard = { renderTime, dueDate };

})();
