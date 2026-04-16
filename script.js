// Human comment: small script to wire up the card behaviour — time calculations, checkbox toggle, and button stubs.

(function(){
  // Set due date to April 16, 2026, 11:59 PM GMT+1
  // Note: JS Date months are 0-based (April = 3)
  const dueDate = new Date(Date.UTC(2026, 3, 17, 22, 59, 0)); // 22:59 UTC = 23:59 GMT+1

  // DOM refs
  const dueEl = document.getElementById('due-date');
  const remainingEl = document.getElementById('time-remaining');
  const statusEl = document.querySelector('[data-testid="test-todo-status"]');
  const badgePriority = document.querySelector('[data-testid="test-todo-priority"]');
  const priorityIndicator = document.querySelector('[data-testid="test-todo-priority-indicator"]');
  const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]');
  const card = document.querySelector('[data-testid="test-todo-card"]');
  const editBtn = document.querySelector('[data-testid="test-todo-edit-button"]');
  const deleteBtn = document.querySelector('[data-testid="test-todo-delete-button"]');
  const statusControl = document.querySelector('select.status-control[data-testid="test-todo-status-control"]');
  const overdueIndicator = document.querySelector('[data-testid="test-todo-overdue-indicator"]');
  const expandToggle = document.querySelector('[data-testid="test-todo-expand-toggle"]');
  const collapsibleSection = document.querySelector('[data-testid="test-todo-collapsible-section"]');
  const descPara = document.querySelector('[data-testid="test-todo-description"]');
  const editForm = document.querySelector('[data-testid="test-todo-edit-form"]');
  const editTitleInput = document.querySelector('[data-testid="test-todo-edit-title-input"]');
  const editDescInput = document.querySelector('[data-testid="test-todo-edit-description-input"]');
  const editPrioritySelect = document.querySelector('[data-testid="test-todo-edit-priority-select"]');
  const editStatusSelect = document.querySelector('form [data-testid="test-todo-status-control"]');
  const editDueDateInput = document.querySelector('[data-testid="test-todo-edit-due-date-input"]');
  const saveBtn = document.querySelector('[data-testid="test-todo-save-button"]');
  const cancelBtn = document.querySelector('[data-testid="test-todo-cancel-button"]');

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
    // Overdue indicator
    if(rem.tense === 'past' && statusControl.value !== 'Done'){
      overdueIndicator.style.display = '';
      overdueIndicator.textContent = 'Overdue';
      overdueIndicator.setAttribute('aria-live','polite');
      dueEl.classList.add('overdue');
      remainingEl.classList.add('overdue');
    } else {
      overdueIndicator.style.display = 'none';
      dueEl.classList.remove('overdue');
      remainingEl.classList.remove('overdue');
    }
    // If done, show completed
    if(statusControl.value === 'Done'){
      remainingEl.textContent = 'Completed';
    }
  }

  // Toggle behaviour when checkbox changes
  function setStatus(status) {
    statusEl.textContent = status;
    statusEl.setAttribute('aria-label', 'Status: ' + status);
    statusControl.value = status;
    editStatusSelect.value = status;
    if(status === 'Done'){
      card.classList.add('done');
      checkbox.checked = true;
    } else {
      card.classList.remove('done');
      checkbox.checked = false;
    }
    if(status === 'In Progress'){
      card.classList.add('in-progress');
    } else {
      card.classList.remove('in-progress');
    }
    renderTime();
  }

  function onToggle(e){
    const checked = e.target.checked;
    if(checked){
      setStatus('Done');
    } else {
      setStatus('Pending');
    }
  }

  // Hook up buttons (simple stubs)
  // Store previous state for cancel
  let prevState = {};
  function onEdit(){
    // Save current state
    prevState = {
      title: document.querySelector('[data-testid="test-todo-title"]').textContent,
      desc: descPara.textContent,
      priority: badgePriority.textContent,
      status: statusControl.value,
      due: dueDate.toISOString()
    };
    // Fill form
    editTitleInput.value = prevState.title;
    editDescInput.value = prevState.desc;
    editPrioritySelect.value = prevState.priority;
    editStatusSelect.value = prevState.status;
    editDueDateInput.value = prevState.due.slice(0,16); // yyyy-MM-ddTHH:mm
    // Show form, hide card content
    editForm.style.display = '';
    card.classList.add('editing');
    // Trap focus (optional, bonus)
    editTitleInput.focus();
  }

  function onDelete(){
    if(confirm('Are you sure you want to delete this task?')){
      card.remove();
    }
  }

  function onSave(e){
    e.preventDefault();
    // Update card
    document.querySelector('[data-testid="test-todo-title"]').textContent = editTitleInput.value;
    descPara.textContent = editDescInput.value;
    badgePriority.textContent = editPrioritySelect.value;
    setPriorityIndicator(editPrioritySelect.value);
    setStatus(editStatusSelect.value);
    // Update due date
    let newDue = editDueDateInput.value;
    if(newDue){
      let d = new Date(newDue);
      if(!isNaN(d)){
        dueDate.setTime(d.getTime());
      }
    }
    renderTime();
    // Hide form
    editForm.style.display = 'none';
    card.classList.remove('editing');
    editBtn.focus();
  }

  function onCancel(e){
    e.preventDefault();
    // Restore previous state
    document.querySelector('[data-testid="test-todo-title"]').textContent = prevState.title;
    descPara.textContent = prevState.desc;
    badgePriority.textContent = prevState.priority;
    setPriorityIndicator(prevState.priority);
    setStatus(prevState.status);
    dueDate.setTime(new Date(prevState.due).getTime());
    renderTime();
    editForm.style.display = 'none';
    card.classList.remove('editing');
    editBtn.focus();
  }

  // Priority indicator visual
  function setPriorityIndicator(priority){
    priorityIndicator.classList.remove('low','medium','high');
    if(priority === 'High'){
      priorityIndicator.classList.add('high');
    } else if(priority === 'Medium'){
      priorityIndicator.classList.add('medium');
    } else {
      priorityIndicator.classList.add('low');
    }
    badgePriority.textContent = priority;
  }

  // Status control dropdown (footer)
  function onStatusControlChange(e){
    setStatus(e.target.value);
  }

  // Edit form status control
  function onEditStatusChange(e){
    setStatus(e.target.value);
  }

  // Expand/collapse logic
  let isCollapsed = false;
  function updateCollapse(){
    const desc = descPara.textContent;
    if(desc.length > 80){
      isCollapsed = true;
      collapsibleSection.style.maxHeight = '2.5em';
      collapsibleSection.setAttribute('aria-hidden','true');
      expandToggle.style.display = '';
      expandToggle.setAttribute('aria-expanded','false');
    } else {
      isCollapsed = false;
      collapsibleSection.style.maxHeight = '';
      collapsibleSection.setAttribute('aria-hidden','false');
      expandToggle.style.display = 'none';
    }
  }
  function onExpandToggle(){
    if(isCollapsed){
      collapsibleSection.style.maxHeight = '';
      collapsibleSection.setAttribute('aria-hidden','false');
      expandToggle.setAttribute('aria-expanded','true');
      expandToggle.textContent = 'Collapse';
      isCollapsed = false;
    } else {
      collapsibleSection.style.maxHeight = '2.5em';
      collapsibleSection.setAttribute('aria-hidden','true');
      expandToggle.setAttribute('aria-expanded','false');
      expandToggle.textContent = 'Expand';
      isCollapsed = true;
    }
  }

  // Keyboard accessibility: ensure Enter/Space on buttons works (native buttons already handle it).

  // initial render
  setPriorityIndicator(badgePriority.textContent);
  renderTime();
  updateCollapse();

  // Update every 30s for time
  const updateInterval = setInterval(renderTime, 30 * 1000);

  // Event listeners
  checkbox.addEventListener('change', onToggle);
  editBtn.addEventListener('click', onEdit);
  deleteBtn.addEventListener('click', onDelete);
  statusControl.addEventListener('change', onStatusControlChange);
  expandToggle.addEventListener('click', onExpandToggle);
  expandToggle.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      onExpandToggle();
    }
  });
  saveBtn.addEventListener('click', onSave);
  cancelBtn.addEventListener('click', onCancel);
  editForm.addEventListener('submit', onSave);
  editStatusSelect.addEventListener('change', onEditStatusChange);

  // Keyboard flow: Tab order is set by DOM order; focus returns to editBtn after edit

  // Expose a tiny API for tests or debugging
  window.__todoCard = { renderTime, dueDate };

})();
