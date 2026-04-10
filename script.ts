// ================================
// GLOBAL VARIABLES
// ================================
let mainLists: any[] = [];
let subLists: any[] = [];
let tasks: any[] = [];
let subtasks: any[] = [];
const columnConfig = [
   { key: 'taskName', label: 'Task Name', visible: true, mandatory: true, forSubtask: true },
    { key: 'taskNumber', label: 'Task #', visible: false, mandatory: false, forSubtask: true },
    { key: 'taskOwner', label: 'Task Owner', visible: true, mandatory: false, forSubtask: true },
    { key: 'taskStatus', label: 'Task Status', visible: false, mandatory: false, forSubtask: true },
    { key: 'reviewer', label: 'Reviewer', visible: true, mandatory: false, forSubtask: true },
    { key: 'tdoc', label: 'Task Doc', visible: true, mandatory: false, forSubtask: true },
    { key: 'approver', label: 'Approver', visible: true, mandatory: false, forSubtask: true },
    { key: 'recurrenceType', label: 'Recurrence Type', visible: false, mandatory: false, forSubtask: false },
    { key: 'cdoc', label: 'Completion Doc', visible: true, mandatory: false, forSubtask: false },
    { key: 'createdBy', label: 'Created By', visible: true, mandatory: false, forSubtask: true },
    { key: 'comment', label: 'Comment', visible: false, mandatory: false, forSubtask: true },
    { key: 'assigneeDueDate', label: 'Assignee Due Date', visible: false, mandatory: false, forSubtask: true },
    { key: 'customField1', label: 'Custom Field #1', visible: false, mandatory: false, forSubtask: false },
    { key: 'reviewerDueDate', label: 'Reviewer Due Date', visible: false, mandatory: false, forSubtask: true },
    { key: 'customField2', label: 'Custom Field #2', visible: false, mandatory: false, forSubtask: false },
    { key: 'dueDate', label: 'Due Date', visible: true, mandatory: false, forSubtask: true },
    { key: 'linkedAccounts', label: 'Linked Account(s)', visible: false, mandatory: false, forSubtask: false },
    { key: 'completionDate', label: 'Completion Date', visible: false, mandatory: false, forSubtask: true },
    { key: 'days', label: '+/- Days', visible: true, mandatory: false, forSubtask: false },
    { key: 'notifier', label: 'Notifier', visible: false, mandatory: false, forSubtask: true }
];
const taskDocuments = new Map();
const taskTDocDocuments = new Map();
const taskAccounts = new Map();
const taskComments: any = {};
let draggedItem: any = null;
let currentTaskForStatus: any = null;
let currentSubtaskForStatus: any = null;
let activeCommentRowId: any = null;
let activeCommentType: any = null;
let editingCommentId: any = null;
const availableUsers = [
    { id: '1', name: 'Palakh Khanna', email: 'palakh@skystem.com', initials: 'PK', role: 'Owner' },
    { id: '2', name: 'Sarah Miller', email: 'sarah@skystem.com', initials: 'SM', role: 'Reviewer' },
    { id: '3', name: 'Mel Preparer', email: 'mel@skystem.com', initials: 'MP', role: 'Preparer' },
    { id: '4', name: 'Poppy Pan', email: 'poppy@skystem.com', initials: 'PP', role: 'Approver' },
    { id: '5', name: 'John Smith', email: 'john@skystem.com', initials: 'JS', role: 'Reviewer' },
    { id: '6', name: 'Emma Watson', email: 'emma@skystem.com', initials: 'EW', role: 'Owner' },
    { id: '7', name: 'David Brown', email: 'david@skystem.com', initials: 'DB', role: 'Reviewer' }
];

function addSeparateTableStyles(): void {
    const link = document.createElement('link');
    link.id = 'separate-table-styles';
    link.rel = 'stylesheet';
    link.href = 'separate-table-styles.css';
    document.head.appendChild(link);
}

// ================================
// INITIALIZE DATA
// ================================
function initializeData(): void {
    console.log('Initializing data...');
    tasks = [];
    subtasks = [];
    
    const rows = document.querySelectorAll("tbody tr");
    console.log('Total rows found:', rows.length);
    
    rows.forEach((row, index) => {
        console.log(`Row ${index}:`, row.className);
        const firstCell = row.cells[0];
        const isSubtask = firstCell && firstCell.colSpan > 1;
        
        if (isSubtask) {
            const checkbox = row.querySelector('input[type="checkbox"]');
            const statusBadge = row.querySelector('.skystemtaskmaster-status-badge');
            const taskNameCell = row.cells[0];
            
            if (checkbox && statusBadge && taskNameCell) {
                let ownerCell = null;
                let reviewerCell = null;
                
                for (let i = 0; i < row.cells.length; i++) {
                    const cell = row.cells[i];
                    const badge = cell.querySelector('.skystemtaskmaster-badge');
                    if (badge) {
                        if (!ownerCell) ownerCell = cell;
                        else if (!reviewerCell) reviewerCell = cell;
                    }
                }
                
                subtasks.push({
                    row,
                    checkbox,
                    statusBadge,
                    taskNameCell,
                    ownerCell: ownerCell || row.cells[row.cells.length - 2],
                    reviewerCell: reviewerCell || row.cells[row.cells.length - 1]
                });
                console.log('Subtask added:', taskNameCell.innerText);
            }
        } else if (!row.classList.contains('main-list-row') && 
                   !row.classList.contains('sub-list-row') && 
                   !row.classList.contains('skystemtaskmaster-subtask-header')) {
            const checkbox = row.querySelector('input[type="checkbox"]');
            const statusBadge = row.querySelector('.skystemtaskmaster-status-badge');
            const dueDateCell = row.cells[3];
            const daysCell = row.cells[8];
            const taskNameCell = row.cells[0];
            
            if (checkbox && statusBadge && dueDateCell && daysCell && taskNameCell) {
                tasks.push({
                    row,
                    checkbox,
                    statusBadge,
                    dueDateCell,
                    daysCell,
                    taskNameCell
                });
                console.log('Task added:', taskNameCell.innerText);
            }
        }
    });
    
    console.log('Final tasks count:', tasks.length);
    console.log('Final subtasks count:', subtasks.length);
    updateCounts(); 
}

function addSublistStyles(): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'sublist-styles.css';
    document.head.appendChild(link);
}

// ================================
// SIMPLIFIED FIX: OWNER, APPROVER, CREATED BY POPUP
// ================================

(function ensureColumnsVisible() {
    const ownerCol = columnConfig.find(c => c.key === 'taskOwner');
    const createdByCol = columnConfig.find(c => c.key === 'createdBy');
    const approverCol = columnConfig.find(c => c.key === 'approver');
    
    if (ownerCol) ownerCol.visible = true;
    if (createdByCol) createdByCol.visible = true;
    if (approverCol) approverCol.visible = true;
    
    console.log('User columns visibility set to true');
})();

function makeCellClickableForPopup(cell: HTMLElement, item: any, columnKey: string, columnLabel: string): HTMLElement {
    if (!cell) return cell;
    
    cell.classList.add('cell-clickable-for-popup');
    cell.setAttribute('title', `Click to change ${columnLabel}`);
    
    cell.addEventListener('mouseenter', () => {
        cell.classList.add('cell-clickable-hover');
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.classList.remove('cell-clickable-hover');
    });
    
    const newCell = cell.cloneNode(true) as HTMLElement;
    cell.parentNode?.replaceChild(newCell, cell);
    
    newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        console.log(`${columnKey} clicked`);
        
        const currentValue = newCell.textContent?.trim() || '—';
        
        showSimpleUserModal(item, newCell, columnKey, columnLabel, currentValue);
    });
    
    return newCell;
}

function showSimpleUserModal(item: any, cell: HTMLElement, columnKey: string, columnLabel: string, currentValue: string): void {
    removeExistingModal();

    const modal = createModal(item, columnLabel, currentValue);
    document.body.appendChild(modal);

    // Store global references
    (window as any).simpleItem = item;
    (window as any).simpleCell = cell;
    (window as any).simpleColumnKey = columnKey;
    (window as any).simpleColumnLabel = columnLabel;

    // Load list
    updateSimpleUserList('', currentValue);

    bindModalEvents(modal, columnLabel, currentValue);
}

/* ------------------ HELPERS ------------------ */

function removeExistingModal(): void {
    const existingModal = document.getElementById('simpleUserModal');
    if (existingModal) existingModal.remove();
}

function createModal(item: any, columnLabel: string, currentValue: string): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'simpleUserModal';
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>

            <h3 class="modal-title">Select ${columnLabel}</h3>

            <div class="modal-card">
                <div><strong>${item.name || 'Task'}</strong></div>
            </div>

            <div>
                <label class="modal-label">Current ${columnLabel}</label>
                <div class="modal-current">${currentValue}</div>
            </div>

            <input type="text" id="simpleUserSearch" 
                   class="modal-input" 
                   placeholder="Search...">

            <div id="simpleUserList" class="modal-list"></div>

            <div class="modal-footer">
                <button id="simpleUnassignBtn" class="btn btn-gray">Unassign</button>
                <button id="simpleCloseBtn" class="btn btn-primary">Close</button>
            </div>
        </div>
    `;

    return modal;
}

function bindModalEvents(modal: HTMLDivElement, columnLabel: string, currentValue: string): void {
    // Close
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    document.getElementById('simpleCloseBtn')?.addEventListener('click', () => modal.remove());

    // Unassign
    document.getElementById('simpleUnassignBtn')?.addEventListener('click', () => {
        if ((window as any).simpleCell) {
            (window as any).simpleCell.textContent = '—';
            updateSimpleField((window as any).simpleItem, (window as any).simpleColumnKey, '—');
            showNotification(`${columnLabel} unassigned`);
        }
        modal.remove();
    });

    // Search
    document.getElementById('simpleUserSearch')?.addEventListener('keyup', (e) => {
        updateSimpleUserList((e.target as HTMLInputElement).value, currentValue);
    });
}

function updateSimpleUserList(search: string, currentValue: string): void {
    const list = document.getElementById('simpleUserList');
    if (!list) return;

    const filtered = availableUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.initials.toLowerCase().includes(search.toLowerCase())
    );

    list.innerHTML = filtered.map(user => {
        const isCurrent = user.initials === currentValue;

        return `
            <div class="user-item ${isCurrent ? 'active' : ''}" 
                 data-initials="${user.initials}" 
                 data-name="${user.name}">
                 
                <span class="user-avatar" 
                      style="background: ${getUserColor(user.initials)}">
                    ${user.initials}
                </span>

                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-meta">${user.email} • ${user.role}</div>
                </div>

                ${isCurrent ? '<span class="user-check">✓</span>' : ''}
            </div>
        `;
    }).join('');

    bindUserClickEvents();
}

/* ---------------- CLICK EVENTS ---------------- */

function bindUserClickEvents(): void {
    document.querySelectorAll('.user-item').forEach(el => {
        el.addEventListener('click', () => {
            const initials = (el as HTMLElement).dataset.initials;
            const name = (el as HTMLElement).dataset.name;

            if ((window as any).simpleCell) {
                (window as any).simpleCell.textContent = initials;
                updateSimpleField((window as any).simpleItem, (window as any).simpleColumnKey, initials);
                showNotification(`${(window as any).simpleColumnLabel} set to ${name}`);
            }

            document.getElementById('simpleUserModal')?.remove();
        });
    });
}

function updateSimpleField(item: any, columnKey: string, value: string): void {
    if (!item) return;
    
    if (columnKey === 'taskOwner') {
        item.taskOwner = value;
        if (item.owner !== undefined) item.owner = value;
    } else if (columnKey === 'createdBy') {
        item.createdBy = value;
    } else if (columnKey === 'approver') {
        item.approver = value;
    }
    
    setTimeout(() => saveAllData(), 100);
}

function initializeSimpleUserColumns(): void {
    console.log('Initializing user columns...');
    
    setTimeout(() => {
        document.querySelectorAll('.task-row, .subtask-row').forEach(row => {
            const task = tasks.find(t => t.row === row);
            const subtask = subtasks.find(s => s.row === row);
            const item = task || subtask;
            
            if (!item) return;
            
            row.querySelectorAll('.extra-cell').forEach(cell => {
                const colKey = (cell as HTMLElement).getAttribute('data-column');
                
                if (colKey === 'taskOwner') {
                    makeCellClickableForPopup(cell as HTMLElement, item, 'taskOwner', 'Owner');
                }
                else if (colKey === 'createdBy') {
                    makeCellClickableForPopup(cell as HTMLElement, item, 'createdBy', 'Created By');
                }
                else if (colKey === 'approver') {
                    makeCellClickableForPopup(cell as HTMLElement, item, 'approver', 'Approver');
                }
            });
        });
        
        console.log('User columns initialized');
    }, 1000);
}

function addExtraColumns(): void {
    const mainHeader = document.getElementById('mainHeader');
    const subtaskHeader = document.getElementById('subtaskHeader');
    if (!mainHeader) return;
    
    document.querySelectorAll('.extra-column, .extra-header-column').forEach(el => el.remove());
    
    const baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    
    columnConfig.forEach(col => {
        if (baseColumns.indexOf(col.key) === -1) {
            const th = document.createElement('th');
            th.className = 'extra-column';
            th.setAttribute('data-column', col.key);
            th.textContent = col.label;
            th.style.display = col.visible ? '' : 'none';
            mainHeader.appendChild(th);
        }
    });
    
    if (subtaskHeader) {
        const subtaskRow = subtaskHeader.closest('tr');
        if (subtaskRow) {
            columnConfig.forEach(col => {
                if (col.forSubtask && baseColumns.indexOf(col.key) === -1) {
                    const td = document.createElement('td');
                    td.className = 'extra-header-column';
                    td.setAttribute('data-header-column', col.key);
                    td.textContent = col.label;
                    td.style.display = col.visible ? '' : 'none';
                    subtaskHeader.appendChild(td);
                }
            });
        }
    }
    
    setTimeout(() => {
        updateSublistRowsColspan();
    }, 100);
}

function addDataCells(): void {
    document.querySelectorAll('.task-row').forEach(row => {
        const taskId = (row as HTMLElement).dataset.taskId || '1';
        
        row.querySelectorAll('.extra-cell').forEach(cell => cell.remove());
        
        const task = tasks.find(t => t.row === row);
        
        columnConfig.forEach(col => {
            const baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
            if (baseColumns.indexOf(col.key) === -1) {
                const cell = document.createElement('td');
                cell.className = 'extra-cell';
                cell.setAttribute('data-column', col.key);
                
                let value = '—';
                if (task) {
                    value = getTaskColumnValue(task, col.key);
                } else {
                    if (col.key === 'taskNumber') value = 'TSK-00' + taskId;
                    else if (col.key === 'taskStatus') value = task?.status || 'Not Started';
                    else if (col.key === 'createdBy') value = 'PK';
                    else if (col.key === 'approver') value = '—';
                    else if (col.key === 'recurrenceType') value = 'None';
                }
                
                cell.textContent = value;
                cell.style.display = col.visible ? '' : 'none';
                
                row.appendChild(cell);
            }
        });
        if (task) {
            setTimeout(() => {
                makeExtraCellsEditable(row as HTMLElement, task);
            }, 50);
        }
    });
    
    document.querySelectorAll('.subtask-row').forEach(row => {
    });
}

function reinitializeUI(): void {
    console.log('Reinitializing UI...');
    updateTDocColumn();
    updateCDocColumn();
    refreshLinkedAccountsColumn();
    updateCommentColumn();
    tasks.forEach(task => {
        if (task.row && task) {
            makeExtraCellsEditable(task.row, task);
            makeTaskStatusClickable(task);
            makeUserColumnsClickable(task.row, task);
            makeRecurrenceCellClickable(task.row, task);
        }
    });
    subtasks.forEach(subtask => {
    });
    
    console.log('UI reinitialized');
}

function makeExtraUserCellClickable(cell: HTMLElement, item: any, columnKey: string): HTMLElement {
    cell.classList.add('extra-user-cell-clickable');
    
    let titleText = 'Click to change ';
    if (columnKey === 'taskOwner') titleText += 'Task Owner';
    else if (columnKey === 'createdBy') titleText += 'Created By';
    else if (columnKey === 'approver') titleText += 'Approver';
    cell.title = titleText;
    
    cell.addEventListener('mouseenter', () => {
        cell.classList.add('extra-user-cell-hover');
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.classList.remove('extra-user-cell-hover');
    });
    
    const newCell = cell.cloneNode(true) as HTMLElement;
    cell.parentNode?.replaceChild(newCell, cell);
    
    newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        console.log(`${columnKey} cell clicked!`);
        
        if (item && item.row) {
            const currentValue = newCell.textContent?.trim() || '';
            
            let columnDisplayName = '';
            if (columnKey === 'taskOwner') columnDisplayName = 'Owner';
            else if (columnKey === 'createdBy') columnDisplayName = 'Created By';
            else if (columnKey === 'approver') columnDisplayName = 'Approver';
            
            showExtraUserSelectionModal(item, newCell, columnKey, columnDisplayName, currentValue);
        }
    });
    
    return newCell;
}

function showExtraUserSelectionModal(item: any, cell: HTMLElement, columnKey: string, columnDisplayName: string, currentValue: string): void {
    console.log('Opening user modal for:', columnDisplayName, 'Current:', currentValue);
    
    const existingModal = document.getElementById('extraUserSelectionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div id="extraUserSelectionModal" class="modal" style="display: block; z-index: 10000;">
            <div class="modal-content" style="width: 400px; position: relative; z-index: 10001;">
                <span class="close" style="position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer; color: #999;">&times;</span>
                <h3 style="color: #ff0080; margin-bottom: 15px;">Select ${columnDisplayName}</h3>
                
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 6px;">
                        <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Task:</div>
                        <div style="font-weight: 500;">${item.name || item.taskNameCell?.querySelector('span')?.textContent || 'Task'}</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Current ${columnDisplayName}</label>
                        <div id="currentUserDisplay" style="padding: 8px; background: #f0f0f0; border-radius: 4px; margin-bottom: 15px; ${currentValue !== '—' ? 'color: #ff0080; font-weight: 500;' : 'color: #999;'}">
                            ${currentValue || '—'}
                        </div>
                    </div>
                    
                    <div style="position: relative; margin-bottom: 15px;">
                        <input type="text" id="userSearchInput" placeholder="Search by name or initials..." 
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>
                    
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px;" id="userListContainer"></div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                    <button id="unassignUserBtn" style="padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Unassign</button>
                    <button id="closeUserModalBtn" style="padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('extraUserSelectionModal');
    
    (window as any).currentExtraItem = item;
    (window as any).currentExtraCell = cell;
    (window as any).currentExtraColumnKey = columnKey;
    (window as any).currentExtraColumnName = columnDisplayName;
    (window as any).currentExtraValue = currentValue;
    
    updateUserListInModal('', currentValue);
    
    modal?.querySelector('.close')?.addEventListener('click', () => {
        modal.remove();
        clearExtraUserReferences();
    });
    
    document.getElementById('closeUserModalBtn')?.addEventListener('click', () => {
        modal?.remove();
        clearExtraUserReferences();
    });
    
    document.getElementById('unassignUserBtn')?.addEventListener('click', () => {
        if ((window as any).currentExtraCell) {
            (window as any).currentExtraCell.textContent = '—';
            updateExtraUserField((window as any).currentExtraItem, (window as any).currentExtraColumnKey, '—');
            showNotification(`${(window as any).currentExtraColumnName} unassigned`);
        }
        modal?.remove();
        clearExtraUserReferences();
    });
    
    const searchInput = document.getElementById('userSearchInput') as HTMLInputElement;
    searchInput?.addEventListener('keyup', () => {
        updateUserListInModal(searchInput.value, (window as any).currentExtraValue);
    });
    
    setTimeout(() => {
        if (searchInput) {
            searchInput.focus();
        }
    }, 100);
    
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            clearExtraUserReferences();
        }
    });
}

function updateUserListInModal(searchText: string, currentValue: string): void {
    const userList = document.getElementById('userListContainer');
    if (!userList) return;
    
    const filtered = availableUsers.filter(user => {
        const searchLower = searchText.toLowerCase();
        return user.name.toLowerCase().includes(searchLower) ||
               user.initials.toLowerCase().includes(searchLower) ||
               user.email.toLowerCase().includes(searchLower);
    });
    
    if (filtered.length === 0) {
        userList.innerHTML = '<div class="user-list-empty">No users found</div>';
        return;
    }
    
    userList.innerHTML = filtered.map(user => {
        const isCurrent = user.initials === currentValue;
        return `
            <div class="user-item" data-user='${JSON.stringify(user)}' 
                 style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; ${isCurrent ? 'background-color: #fff0f5;' : ''}">
                <span class="skystemtaskmaster-badge skystemtaskmaster-badge-${user.initials.toLowerCase()}" 
                      style="width: 32px; height: 32px; line-height: 32px; display: inline-block; border-radius: 50%; color: white; text-align: center; font-weight: bold; background: ${getUserColor(user.initials)};">${user.initials}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${user.name}</div>
                    <div style="font-size: 12px; color: #666;">${user.email} • ${user.role}</div>
                </div>
                ${isCurrent ? '<span style="color: #ff0080; font-weight: bold;">✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    userList.querySelectorAll('.user-item').forEach(el => {
        el.addEventListener('click', () => {
            const userData = el.getAttribute('data-user');
            if (userData) {
                const user = JSON.parse(userData);
                assignExtraUserFromModal(user);
            }
        });
    });
}

function assignExtraUserFromModal(user: any): void {
    if (!(window as any).currentExtraCell || !(window as any).currentExtraItem) return;
    
    const cell = (window as any).currentExtraCell;
    const item = (window as any).currentExtraItem;
    const columnKey = (window as any).currentExtraColumnKey;
    const columnName = (window as any).currentExtraColumnName;
    
    cell.textContent = user.initials;
    
    cell.classList.add('user-assigned-flash');
    setTimeout(() => {
        cell.classList.remove('user-assigned-flash');
    }, 500);
    
    updateExtraUserField(item, columnKey, user.initials);
    
    document.getElementById('extraUserSelectionModal')?.remove();
    
    showNotification(`${columnName} set to ${user.name}`);
    
    clearExtraUserReferences();
}

function updateExtraUserField(item: any, columnKey: string, value: string): void {
    if (!item) return;
    
    if (columnKey === 'taskOwner') {
        item.taskOwner = value;
        if (item.owner !== undefined) item.owner = value;
    } else if (columnKey === 'createdBy') {
        item.createdBy = value;
    } else if (columnKey === 'approver') {
        item.approver = value;
    }
    
    if (item.id) {
        const taskIndex = tasks.findIndex(t => t.id === item.id);
        if (taskIndex !== -1) {
            tasks[taskIndex][columnKey] = value;
            if (columnKey === 'taskOwner') {
                tasks[taskIndex].owner = value;
            }
        }
        
        const subtaskIndex = subtasks.findIndex(s => s.id === item.id);
        if (subtaskIndex !== -1) {
            subtasks[subtaskIndex][columnKey] = value;
        }
    }
    
    setTimeout(() => saveAllData(), 100);
}

function clearExtraUserReferences(): void {
    (window as any).currentExtraItem = null;
    (window as any).currentExtraCell = null;
    (window as any).currentExtraColumnKey = null;
    (window as any).currentExtraColumnName = null;
    (window as any).currentExtraValue = null;
}

function initializeExtraUserColumns(): void {
    console.log('Initializing extra user columns (Owner, Created By, Approver)...');
    
    const style = document.createElement('style');
    style.id = 'extra-user-styles';
    style.textContent = `
        .extra-cell[data-column="taskOwner"],
        .extra-cell[data-column="createdBy"],
        .extra-cell[data-column="approver"] {
            cursor: pointer !important;
            transition: all 0.2s ease !important;
        }
        
        .extra-cell[data-column="taskOwner"]:hover,
        .extra-cell[data-column="createdBy"]:hover,
        .extra-cell[data-column="approver"]:hover {
            background-color: #fff0f5 !important;
            transform: scale(1.02);
        }
        
        .user-item {
            transition: all 0.2s;
        }
        
        .user-item:hover {
            background-color: #f5f5f5;
        }
    `;
    document.head.appendChild(style);
    
    const ownerCol = columnConfig.find(c => c.key === 'taskOwner');
    const createdByCol = columnConfig.find(c => c.key === 'createdBy');
    const approverCol = columnConfig.find(c => c.key === 'approver');
    
    if (ownerCol) ownerCol.visible = true;
    if (createdByCol) createdByCol.visible = true;
    if (approverCol) approverCol.visible = true;
    
    setTimeout(() => {
        addExtraColumns();
        addDataCells();
        applyVisibility();
    }, 100);
}

function makeStatusCellClickable(cell: HTMLElement, item: any): HTMLElement {
    cell.classList.add('task-status-cell');
    cell.title = 'Click to change status';
    cell.replaceWith(cell.cloneNode(true));
    const newCell = document.querySelector(`[data-id="${item.id}"][data-column="taskStatus"]`) as HTMLElement || cell;
    newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        console.log('Task Status cell clicked!');

        if (item && item.row) {
            if (item.taskNameCell && item.dueDateCell) {
                showStatusChangeModal(item);
            } else {
                showSubtaskStatusChangeModal(item);
            }
        }
    });

    return newCell;
}

function getTaskColumnValue(task: any, columnKey: string): string {
    if (!task) return '—';
    
    switch(columnKey) {
        case 'taskNumber':
            return task.taskNumber || task.id || '—';
            
        case 'taskOwner':
            return task.taskOwner || task.owner || '—';
            
        case 'taskStatus':
            if (task.statusBadge) {
                return task.statusBadge.innerText;
            }
            return task.taskStatus || task.status || 'Not Started';
            
        case 'reviewer':
            return task.reviewer || '—';
            
        case 'tdoc':
            return task.tdoc || '0';
            
        case 'approver':
            return task.approver || '—';
            
        case 'recurrenceType':
            return task.recurrenceType || 'None';
            
        case 'cdoc':
        case 'completionDoc':
            return task.completionDoc || task.cdoc || '0';
            
        case 'createdBy':
            return task.createdBy || 'PK';
            
        case 'comment':
            return task.comment || '—';
            
        case 'assigneeDueDate':
            if (task.assigneeDueDate) {
                try {
                    const date = new Date(task.assigneeDueDate);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                } catch(e) {
                    return task.assigneeDueDate;
                }
            }
            return task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
            
        case 'customField1':
            return task.customField1 || '—';
            
        case 'reviewerDueDate':
            if (task.reviewerDueDate) {
                try {
                    const date = new Date(task.reviewerDueDate);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                } catch(e) {
                    return task.reviewerDueDate;
                }
            }
            return '—';
            
        case 'customField2':
            return task.customField2 || '—';
            
        case 'dueDate':
            if (task.dueDate) {
                try {
                    const date = new Date(task.dueDate);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                } catch(e) {
                    return task.dueDate;
                }
            }
            return 'Set due date';
            
        case 'linkedAccounts':
            return task.linkedAccounts || '—';
            
        case 'completionDate':
            if (task.completionDate) {
                try {
                    const date = new Date(task.completionDate);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                } catch(e) {
                    return task.completionDate;
                }
            }
            return '—';
            
        case 'days':
            if (task.dueDate) {
                const today = new Date();
                const due = new Date(task.dueDate);
                const diffTime = due.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 ? '+' + diffDays : diffDays.toString();
            }
            return '0';
            
        case 'notifier':
            return task.notifier || '—';
            
        default:
            return '—';
    }
}

function makeAllStatusClickable(): void {
    tasks.forEach(task => {
        if (task.statusBadge) {
            task.statusBadge.style.cursor = 'pointer';
            task.statusBadge.title = 'Click to change status';
            
            const newBadge = task.statusBadge.cloneNode(true);
            task.statusBadge.parentNode?.replaceChild(newBadge, task.statusBadge);
            
            newBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                showStatusChangeModal(task);
            });
            
            task.statusBadge = newBadge;
        }
    });
    
    subtasks.forEach(subtask => {
        if (subtask.statusBadge) {
            subtask.statusBadge.style.cursor = 'pointer';
            subtask.statusBadge.title = 'Click to change status';
            
            const newBadge = subtask.statusBadge.cloneNode(true);
            subtask.statusBadge.parentNode?.replaceChild(newBadge, subtask.statusBadge);
            
            newBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                showSubtaskStatusChangeModal(subtask);
            });
            
            subtask.statusBadge = newBadge;
        }
    });
    setTimeout(() => {
        document.querySelectorAll('.extra-cell[data-column="taskStatus"]').forEach(cell => {
            const row = cell.closest('tr');
            if (!row) return;
            
            const task = tasks.find(t => t.row === row);
            const subtask = subtasks.find(s => s.row === row);
            
            if (task || subtask) {
                makeStatusCellClickable(cell as HTMLElement, task || subtask);
            }
        });
    }, 200);
}

function initializeTaskStatus(): void {
    console.log('Initializing Task Status column...');

    setTimeout(() => {
        makeAllStatusClickable();
    }, 1000);
}

function applyVisibility(): void {
    const mainHeader = document.getElementById('mainHeader');
    const subtaskHeader = document.getElementById('subtaskHeader');
    if (!mainHeader) return;
    const visibleColumns = columnConfig.filter(col => col.visible).map(col => col.key);
    console.log('Visible columns:', visibleColumns);
    const baseIndices: any = {
        taskName: 0, 
        acc: 1, 
        tdoc: 2, 
        dueDate: 3, 
        status: 4,
        owner: 5, 
        reviewer: 6, 
        cdoc: 7, 
        days: 8
    };
    for (let i = 0; i < mainHeader.children.length; i++) {
        if (mainHeader.children[i]) {
            (mainHeader.children[i] as HTMLElement).style.display = 'none';
        }
    }
    
    visibleColumns.forEach(key => {
        if (baseIndices[key] !== undefined) {
            if (mainHeader.children[baseIndices[key]]) {
                (mainHeader.children[baseIndices[key]] as HTMLElement).style.display = '';
            }
        }
    });
    
    document.querySelectorAll('.extra-column').forEach(th => {
        const key = th.getAttribute('data-column');
        if (visibleColumns.includes(key as string)) {
            (th as HTMLElement).style.display = '';
        } else {
            (th as HTMLElement).style.display = 'none';
        }
    });
    
    document.querySelectorAll('.task-row').forEach(row => {
        for (let i = 0; i < row.cells.length; i++) {
            if (row.cells[i]) {
                row.cells[i].style.display = 'none';
            }
        }
        
        visibleColumns.forEach(key => {
            if (baseIndices[key] !== undefined) {
                if (row.cells[baseIndices[key]]) {
                    row.cells[baseIndices[key]].style.display = '';
                }
            }
        });
        
        row.querySelectorAll('.extra-cell').forEach(cell => {
            const key = cell.getAttribute('data-column');
            if (visibleColumns.includes(key as string)) {
                (cell as HTMLElement).style.display = '';
            } else {
                (cell as HTMLElement).style.display = 'none';
            }
        });
    });
    
    document.querySelectorAll('.subtask-row').forEach(row => {
        for (let i = 0; i < row.cells.length; i++) {
            if (row.cells[i]) {
                row.cells[i].style.display = 'none';
            }
        }
        if (row.cells[0]) {
            row.cells[0].style.display = '';
        }
        
        visibleColumns.forEach(key => {
            const col = columnConfig.find(c => c.key === key);
            if (col && col.forSubtask) {
                const subtaskIndices: any = {
                    tdoc: 2,
                    dueDate: 3,
                    status: 4,
                    owner: 5,
                    reviewer: 6
                };
                
                if (subtaskIndices[key] !== undefined) {
                    if (row.cells[subtaskIndices[key]]) {
                        row.cells[subtaskIndices[key]].style.display = '';
                    }
                }
            }
        });
        
        row.querySelectorAll('.extra-cell').forEach(cell => {
            const key = cell.getAttribute('data-column');
            const col = columnConfig.find(c => c.key === key);
            if (col && col.forSubtask && visibleColumns.includes(key as string)) {
                (cell as HTMLElement).style.display = '';
            } else {
                (cell as HTMLElement).style.display = 'none';
            }
        });
    });
    
    setTimeout(() => {
        updateSublistRowsColspan();
    }, 50);
}

function updateSublistRowsColspan(): void {
    let visibleCount = 0;
    
    const baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    baseColumns.forEach(key => {
        const col = columnConfig.find(c => c.key === key);
        if (col && col.visible) {
            visibleCount++;
        }
    });
    
    columnConfig.forEach(col => {
        if (!baseColumns.includes(col.key) && col.visible) {
            visibleCount++;
        }
    });
    
    console.log('Total visible columns:', visibleCount);
    
    document.querySelectorAll('.main-list-row').forEach(row => {
        const td = row.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
            td.classList.add('main-list-row-td');
        }
    });
    
    document.querySelectorAll('.sub-list-row').forEach(row => {
        const td = row.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
            td.classList.add('sub-list-row-td');
            
            const sublistHeader = td.querySelector('.sublist-header');
            if (sublistHeader) {
                sublistHeader.classList.add('sublist-header-full');
            }
        }
    });
    
    const subtaskHeader = document.querySelector('.skystemtaskmaster-subtask-header');
    if (subtaskHeader) {
        const td = subtaskHeader.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
        }
    }
}

function initializeColumnSorting(): void {
    console.log('Initializing column sorting with icons...');
    const allHeaders = document.querySelectorAll('.main-list-table-container th');
    
    allHeaders.forEach((header, index) => {
        if (header.querySelector('.sort-icon')) return;
        
        (header as HTMLElement).style.cursor = 'pointer';
        header.setAttribute('title', 'Click to sort');
        
        const columnKey = header.getAttribute('data-column') || getColumnKeyFromText(header.textContent || '');
        
        const sortIcon = document.createElement('span');
        sortIcon.className = 'sort-icon';
        sortIcon.innerHTML = ' ↕️';
        header.appendChild(sortIcon);
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSortForTable(header as HTMLElement, columnKey);
        });
        
        header.addEventListener('mouseenter', () => {
            (header as HTMLElement).classList.add('sort-header-hover');
        });
        
        header.addEventListener('mouseleave', () => {
            (header as HTMLElement).classList.remove('sort-header-hover');
        });
    });
    
    console.log('Sort icons added to', allHeaders.length, 'headers');
}

function getColumnKeyFromText(text: string): string {
    const columnMap: any = {
        'Task Name': 'taskName',
        'Acc': 'acc',
        'Task Doc': 'tdoc',
        'Due Date': 'dueDate',
        'Task Status': 'status',
        'Task Owner': 'owner',
        'Reviewer': 'reviewer',
        'Completion Doc': 'cdoc',
        '+/- Days': 'days'
    };
    
    return columnMap[text.trim()] || text.toLowerCase().replace(/[^a-z]/g, '');
}

function toggleSortForTable(header: HTMLElement, columnKey: string): void {
    const table = header.closest('.skystemtaskmaster-table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    let sortState = table.getAttribute('data-sort-state');
    let currentDirection = 'asc';
    let currentColumn = null;
    
    if (sortState) {
        try {
            const state = JSON.parse(sortState);
            currentColumn = state.column;
            currentDirection = state.direction;
        } catch(e) {}
    }
    let newDirection = 'asc';
    if (currentColumn === columnKey) {
        newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    }
    
    updateSortIconsInTable(table, header, newDirection);
    
    table.setAttribute('data-sort-state', JSON.stringify({
        column: columnKey,
        direction: newDirection
    }));
    
    sortTableByColumnPreservingHierarchy(columnKey, newDirection);
}

function updateSortIconsInTable(table: Element, activeHeader: HTMLElement, direction: string): void {
    table.querySelectorAll('.sort-icon').forEach(icon => {
        icon.classList.remove('sort-asc', 'sort-desc', 'sort-active');
    });

    const activeIcon = activeHeader.querySelector('.sort-icon');
    if (activeIcon) {
        activeIcon.classList.add('sort-active');
        activeIcon.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
    }
}

function sortTableByColumnPreservingHierarchy(columnKey: string, direction: string): void {
    console.log('Sorting by', columnKey, direction);
    const tables = document.querySelectorAll('.main-list-table-container .skystemtaskmaster-table');
    
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const allRows = Array.from(tbody.querySelectorAll('tr'));
        
        const mainListRows = allRows.filter(row => row.classList.contains('main-list-title-row'));
        const subListRows = allRows.filter(row => row.classList.contains('sub-list-row'));
        const taskRows = allRows.filter(row => row.classList.contains('task-row'));
        
        const tasksBySublist: any = {};
        taskRows.forEach(row => {
            const sublistId = row.getAttribute('data-sublist-id');
            if (!tasksBySublist[sublistId]) {
                tasksBySublist[sublistId] = [];
            }
            tasksBySublist[sublistId].push(row);
        });
        
        Object.keys(tasksBySublist).forEach(sublistId => {
            tasksBySublist[sublistId].sort((a: Element, b: Element) => {
                const aVal = getCellValueForSort(a, columnKey);
                const bVal = getCellValueForSort(b, columnKey);
                return compareValues(aVal, bVal, direction);
            });
        });
        const fragment = document.createDocumentFragment();
            mainListRows.forEach(row => {
            fragment.appendChild(row);
            const mainListId = row.getAttribute('data-mainlist-id');
            const sublistRowsForMain = subListRows.filter(sr => sr.getAttribute('data-mainlist-id') === mainListId);
            sublistRowsForMain.forEach(sublistRow => {
                fragment.appendChild(sublistRow);
                
                const sublistId = sublistRow.getAttribute('data-sublist-id');
                const sortedTasks = tasksBySublist[sublistId] || [];
                sortedTasks.forEach(taskRow => fragment.appendChild(taskRow));
            });
        });
        
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        tbody.appendChild(fragment);
    });
    
    showNotification(`Sorted by ${columnKey} (${direction === 'asc' ? 'Ascending' : 'Descending'})`);
}

function getCellValueForSort(row: Element, columnKey: string): any {
    const baseIndices: any = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    
    if (baseIndices[columnKey] !== undefined) {
        const cell = row.cells[baseIndices[columnKey]];
        if (!cell) return '';
        
        if (columnKey === 'status' || columnKey === 'owner' || columnKey === 'reviewer') {
            const badge = cell.querySelector('.skystemtaskmaster-status-badge, .skystemtaskmaster-badge');
            return badge ? badge.textContent?.trim() || '' : cell.textContent?.trim() || '';
        }
        
        if (columnKey === 'days') {
            const val = cell.textContent?.trim() || '0';
            return parseInt(val.replace('+', '')) || 0;
        }
        
        if (columnKey === 'dueDate') {
            const val = cell.textContent?.trim() || '';
            if (val === 'Set due date') return new Date(0).getTime();
            return new Date(val).getTime() || 0;
        }
        
        return cell.textContent?.trim() || '';
    }
    
    const extraCell = Array.from(row.querySelectorAll('.extra-cell')).find(
        cell => cell.getAttribute('data-column') === columnKey
    );
    return extraCell ? extraCell.textContent?.trim() || '' : '';
}

function compareValues(a: any, b: any, direction: string): number {
    const multiplier = direction === 'asc' ? 1 : -1;
    
    if (typeof a === 'number' && typeof b === 'number') {
        return (a - b) * multiplier;
    }
    
    const aStr = String(a || '').toLowerCase();
    const bStr = String(b || '').toLowerCase();
    
    if (aStr < bStr) return -1 * multiplier;
    if (aStr > bStr) return 1 * multiplier;
    return 0;
}

function initializeSortingWithIcons(): void {
    console.log('Initializing sorting with icons...');
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'sorting-styles.css';
    document.head.appendChild(link);
    
    setTimeout(() => {
        initializeColumnSorting();
    }, 500);
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                setTimeout(() => {
                    initializeColumnSorting();
                }, 100);
            }
        });
    });
    
    const container = document.getElementById('mainTableContainer');
    if (container) {
        observer.observe(container, { childList: true, subtree: true });
    }
}

function initializeCleanStructure(): void {
    const container = document.getElementById('mainTableContainer');
    if (container) container.innerHTML = '';
    const oldTable = document.getElementById('mainTable');
    if (oldTable) oldTable.style.display = 'none';
    
    const sidebar = document.getElementById('mainSidebar');
    if (sidebar) sidebar.innerHTML = '';
    
    mainLists = [];
    subLists = [];
    tasks = [];
    subtasks = [];
    
    updateCounts();
    console.log('Clean structure initialized with separate tables');
}

function createMainList(listName: string): any {
    const mainList = {
        id: 'main_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: listName,
        subLists: [],
        row: null,
        tableContainer: null,
        tableElement: null,
        tbody: null,
        titleRow: null,
        plusIcon: null,
        dropdownContent: null,
        isExpanded: true
    };
    
    mainLists.push(mainList);
    
    createMainListTable(mainList);
    
    showNotification(`List "${listName}" created`);
    return mainList;
}

function createMainListTable(mainList: any): HTMLDivElement {
    let container = document.getElementById('mainTableContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mainTableContainer';
        container.className = 'main-table-container';
        const actionBar = document.querySelector('.skystemtaskmaster-action-bar');
        if (actionBar && actionBar.parentNode) {
            actionBar.parentNode.insertBefore(container, actionBar.nextSibling);
        } else {
            const mainWrapper = document.querySelector('.skystemtaskmaster-main-wrapper');
            if (mainWrapper) mainWrapper.appendChild(container);
        }
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'main-list-outer-wrapper';
    wrapper.setAttribute('data-mainlist-id', mainList.id);
    wrapper.classList.add('main-list-wrapper-bottom-margin');
    
    const listHeading = document.createElement('div');
    listHeading.className = 'main-list-heading-outside';
    
    const outsideCheckbox = document.createElement('input');
    outsideCheckbox.type = 'checkbox';
    outsideCheckbox.className = 'list-checkbox-outside';
    outsideCheckbox.setAttribute('title', 'Select this list');
    outsideCheckbox.addEventListener('change', (e) => {
        e.stopPropagation();
        handleMainListCheckbox(mainList, outsideCheckbox.checked);
        if (mainList.insideCheckbox) {
            mainList.insideCheckbox.checked = outsideCheckbox.checked;
        }
    });
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'list-name-outside';
    nameSpan.textContent = mainList.name;
    
    listHeading.appendChild(outsideCheckbox);
    listHeading.appendChild(nameSpan);
    
    const tableContainer = document.createElement('div');
    tableContainer.className = 'main-list-table-container';
    
    const table = document.createElement('table');
    table.className = 'skystemtaskmaster-table';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'main-header-row';
    const baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    
    baseColumns.forEach(colKey => {
        const col = columnConfig.find(c => c.key === colKey);
        if (col && col.visible !== false) {
            const th = document.createElement('th');
            th.textContent = col.label;
            th.setAttribute('data-column', col.key);
            th.classList.add('main-header-cell');
            headerRow.appendChild(th);
        }
    });
    
    columnConfig.forEach(col => {
        if (!baseColumns.includes(col.key) && col.visible !== false) {
            const th = document.createElement('th');
            th.textContent = col.label;
            th.className = 'extra-column';
            th.setAttribute('data-column', col.key);
            th.classList.add('main-header-cell');
            headerRow.appendChild(th);
        }
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    tbody.id = `mainTableBody_${mainList.id}`;
    tbody.className = 'main-list-tbody';
    
    const titleRow = document.createElement('tr');
    titleRow.className = 'main-list-title-row';
    
    const visibleCols = getVisibleColumnCount();
    const titleCell = document.createElement('td');
    titleCell.colSpan = visibleCols;
    titleCell.classList.add('title-cell-padding');
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'list-header-inside';
    
    const insideCheckbox = document.createElement('input');
    insideCheckbox.type = 'checkbox';
    insideCheckbox.className = 'list-checkbox-inside';
    insideCheckbox.setAttribute('title', 'Select this list');
    insideCheckbox.addEventListener('change', (e) => {
        e.stopPropagation();
        handleMainListCheckbox(mainList, insideCheckbox.checked);
        outsideCheckbox.checked = insideCheckbox.checked;
    });
    
    const insideIcon = document.createElement('span');
    insideIcon.className = 'list-icon-inside';
    insideIcon.innerHTML = '<i class="fa-solid fa-clipboard-list"></i>';
    
    const insideNameSpan = document.createElement('span');
    insideNameSpan.className = 'list-name-inside';
    insideNameSpan.textContent = mainList.name;
    
    const insidePlusDropdown = document.createElement('div');
    insidePlusDropdown.className = 'plus-dropdown-wrapper';
    
    const insidePlusIcon = document.createElement('span');
    insidePlusIcon.innerHTML = '<i class="fa-solid fa-plus-circle"></i>';
    insidePlusIcon.classList.add('plus-icon-inside');
    
    const insideDropdownContent = document.createElement('div');
    insideDropdownContent.className = 'plus-dropdown-content-inside';
    
    const insideAddSublistOption = document.createElement('div');
    insideAddSublistOption.className = 'plus-dropdown-item';
    insideAddSublistOption.innerHTML = '<i class="fa-solid fa-folder-plus icon-sublist"></i><span>Add Sub List</span>';
    insideAddSublistOption.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateSubListModal(mainList);
        insideDropdownContent.style.display = 'none';
    });
    
    const insideAddTaskOption = document.createElement('div');
    insideAddTaskOption.className = 'plus-dropdown-item';
    insideAddTaskOption.innerHTML = '<i class="fa-solid fa-tasks icon-task"></i><span>Add List</span>';
    insideAddTaskOption.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateTaskForMainList(mainList);
        insideDropdownContent.style.display = 'none';
    });
    
    insideAddSublistOption.addEventListener('mouseenter', () => {
        insideAddSublistOption.classList.add('dropdown-item-hover');
    });
    insideAddSublistOption.addEventListener('mouseleave', () => {
        insideAddSublistOption.classList.remove('dropdown-item-hover');
    });
    
    insideAddTaskOption.addEventListener('mouseenter', () => {
        insideAddTaskOption.classList.add('dropdown-item-hover');
    });
    insideAddTaskOption.addEventListener('mouseleave', () => {
        insideAddTaskOption.classList.remove('dropdown-item-hover');
    });
    
    insideDropdownContent.appendChild(insideAddSublistOption);
    insideDropdownContent.appendChild(insideAddTaskOption);
    insidePlusDropdown.appendChild(insidePlusIcon);
    insidePlusDropdown.appendChild(insideDropdownContent);
    
    insidePlusIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        
        document.querySelectorAll('.plus-dropdown-content-inside, .plus-dropdown-content').forEach(d => {
            if (d !== insideDropdownContent) (d as HTMLElement).style.display = 'none';
        });
        
        const isVisible = insideDropdownContent.style.display === 'block';
        insideDropdownContent.style.display = isVisible ? 'none' : 'block';
    });
    
    insidePlusIcon.addEventListener('mouseenter', () => {
        insidePlusIcon.classList.add('plus-icon-hover');
    });
    insidePlusIcon.addEventListener('mouseleave', () => {
        insidePlusIcon.classList.remove('plus-icon-hover');
    });
    
    const insideCollapseIcon = document.createElement('span');
    insideCollapseIcon.className = 'collapse-icon-inside';
    insideCollapseIcon.innerHTML = '';
    insideCollapseIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMainList(mainList);
    });
    
    insideCollapseIcon.addEventListener('mouseenter', () => {
        insideCollapseIcon.classList.add('collapse-icon-hover');
    });
    insideCollapseIcon.addEventListener('mouseleave', () => {
        insideCollapseIcon.classList.remove('collapse-icon-hover');
    });
    
    titleDiv.appendChild(insideCheckbox);
    titleDiv.appendChild(insideIcon);
    titleDiv.appendChild(insideNameSpan);
    titleDiv.appendChild(insidePlusDropdown);
    titleDiv.appendChild(insideCollapseIcon);
    titleCell.appendChild(titleDiv);
    titleRow.appendChild(titleCell);
    tbody.appendChild(titleRow);
    
    table.appendChild(tbody);
    
    tableContainer.appendChild(table);
    
    wrapper.appendChild(listHeading);
    wrapper.appendChild(tableContainer);
    container.appendChild(wrapper);
    
    document.addEventListener('click', (e) => {
        if (insidePlusIcon && insideDropdownContent && 
            !insidePlusIcon.contains(e.target as Node) && 
            !insideDropdownContent.contains(e.target as Node)) {
            insideDropdownContent.style.display = 'none';
        }
    });
    
    mainList.tableElement = table;
    mainList.tableContainer = tableContainer;
    mainList.tbody = tbody;
    mainList.thead = thead;
    mainList.titleRow = titleRow;
    mainList.listHeading = listHeading;
    mainList.outsideCheckbox = outsideCheckbox;
    mainList.insideCheckbox = insideCheckbox;
    mainList.insideCollapseIcon = insideCollapseIcon;
    mainList.insidePlusIcon = insidePlusIcon;
    mainList.insideDropdownContent = insideDropdownContent;
    mainList.isExpanded = true;
    
    return wrapper;
}

function getVisibleColumnCount(): number {
    let count = 0;
    columnConfig.forEach(col => {
        if (col.visible !== false) count++;
    });
    return count;
}

function createMainListRow(mainList: any): HTMLTableRowElement | null {
    const tbody = document.getElementById('mainTableBody');
    if (!tbody) return null;

    const row = document.createElement('tr');
    row.className = 'main-list-row';
    row.setAttribute('data-list-id', mainList.id);

    row.innerHTML = `
        <td colspan="9">
            <div class="list-header">
                <input type="checkbox" class="list-checkbox" title="Select this list">
                <span class="list-icon">
                    <i class="fa-solid fa-clipboard-list"></i>
                </span>
                <span class="list-name">
                    ${mainList.name}
                </span>
                <div class="main-list-plus-dropdown">
                    <span class="plus-icon" title="Quick Actions">
                        <i class="fa-solid fa-plus-circle"></i>
                    </span>
                    <div class="plus-dropdown-content">
                        <div class="plus-dropdown-item add-sublist-option">
                            <i class="fa-solid fa-folder-plus icon-sublist"></i>
                            <span>Add Sub List</span>
                        </div>
                        <div class="plus-dropdown-item add-task-option">
                            <i class="fa-solid fa-tasks icon-task"></i>
                            <span>Add Task</span>
                        </div>
                    </div>
                </div>
                <span class="collapse-icon">
                    <i class="fas fa-angle-down"></i>
                </span>
            </div>
        </td>
    `;

    mainList.row = row;
    tbody.appendChild(row);

    attachMainRowEvents(row, mainList);

    return row;
}

function attachMainRowEvents(row: HTMLTableRowElement, mainList: any): void {
    const plusIcon = row.querySelector('.plus-icon') as HTMLElement;
    const dropdown = row.querySelector('.plus-dropdown-content') as HTMLElement;
    const checkbox = row.querySelector('.list-checkbox') as HTMLInputElement;
    const collapseIcon = row.querySelector('.collapse-icon') as HTMLElement;

    plusIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.plus-dropdown-content').forEach(d => {
            if (d !== dropdown) d.classList.remove('show-dropdown');
        });
        dropdown.classList.toggle('show-dropdown');
    });

    row.querySelector('.add-sublist-option')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateSubListModal(mainList);
        dropdown.classList.remove('show-dropdown');
    });

    row.querySelector('.add-task-option')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateTaskModalForList(mainList); 
        dropdown.classList.remove('show-dropdown');
    });

    const closeOnOutsideClick = (e: MouseEvent) => {
        if (!plusIcon.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
            dropdown.classList.remove('show-dropdown');
        }
    };
    document.addEventListener('click', closeOnOutsideClick);

    collapseIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMainList(mainList);
    });

    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        handleMainListCheckbox(mainList, checkbox.checked);
    });
}

function showCreateTaskModalForList(mainList: any, subList: any = null): void {
    const existingModal = document.getElementById('createTaskCompleteModal');
    if (existingModal) existingModal.remove();

    const randomID = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const brandColor = "#ff0080";
    const modal = document.createElement('div');
    modal.id = 'createTaskCompleteModal';
    modal.className = 'modal';
    modal.style.display = 'block';

    const path = subList ? `${mainList.name} > ${subList.name}` : mainList.name;

    const userOptions = `
        <option value="">None</option>
        <option value="PK">PK - Palakh Khanna </option>
        <option value="SM">SM - Sarah Miller </option>
        <option value="MP">MP - Mel Preparer </option>
        <option value="PP">PP - Poppy Pan </option>
        <option value="JS">JS - John Smith </option>
        <option value="EW">EW - Emma Watson</option>
        <option value="DB">DB - David Brown </option>
    `;

    modal.innerHTML = `
        <div class="modal-content animate-slide-down create-task-modal-content">
            <div class="create-task-modal-header">
                <div class="create-task-header-flex">
                    <h3 class="create-task-title"><i class="fa-solid fa-circle-plus"></i> Create Task</h3>
                    <span class="close create-task-close">&times;</span>
                </div>
                <p class="create-task-path">Path: ${path}</p>
            </div>
            
            <div class="create-task-modal-body">
                
                <div class="form-section-basic">
                    <h4 class="section-title-pink">Basic Details</h4>
                    <div class="form-grid-2-col">
                        <div class="form-group">
                            <label class="form-label-required">Task Name *</label>
                            <input type="text" id="createTaskName" class="task-input" placeholder="Task Name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Task ID</label>
                            <input type="text" id="createTaskNumber" class="task-input task-id-input" placeholder="Enter a ID">
                        </div>
                    </div>
                    
                    <div class="form-grid-3-col">
                        <div class="form-group">
                            <label class="form-label">Task Owner</label>
                            <select id="createTaskOwner" class="task-input">${userOptions}</select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Reviewer</label>
                            <select id="createTaskReviewer" class="task-input">${userOptions}</select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Approver</label>
                            <select id="createTaskApprover" class="task-input">${userOptions}</select>
                        </div>
                    </div>
                </div>

                <div class="form-section-logistics">
                    <h4 class="section-title-pink">Logistics & Recurrence</h4>
                    <div class="form-grid-3-col">
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select id="createTaskStatus" class="task-input">
                                <option>Not Started</option>
                                <option>In Progress</option>
                                <option>Review</option>
                                <option>Completed</option>
                                <option>Approved</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Recurrence</label>
                            <select id="createTaskRecurrence" class="task-input">
                                <optgroup label="Recurring Tasks">
                                    <option>Every Period</option>
                                    <option>Quarterly</option>
                                    <option>Annual</option>
                                </optgroup>
                                <optgroup label="Non-Recurring Tasks">
                                    <option>Multiple</option>
                                    <option>Custom</option>
                                    <option selected>None</option>
                                </optgroup>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dependency</label>
                            <select id="createTaskDependent" class="task-input">
                                <option value="">None</option>
                                <option>TSK-883</option><option>TSK-470</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-section-timeline">
                    <h4 class="section-title-pink">Timeline</h4>
                    <div class="form-grid-3-col">
                        <div class="form-group">
                            <label class="form-label">Assignee Due</label>
                            <input type="date" id="createAssigneeDate" class="task-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Reviewer Due</label>
                            <input type="date" id="createReviewerDate" class="task-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Completion Date</label>
                            <input type="date" id="createCompletionDate" class="task-input">
                        </div>
                    </div>
                </div>

                <div class="form-section-documents">
                    <div class="form-grid-2-col">
                        <div class="form-group">
                            <label class="form-label-pink">Task Doc (TDoc) <i class="fa-solid fa-upload"></i></label>
                            <input type="file" id="uploadTDoc" class="task-input file-input-dashed">
                        </div>
                        <div class="form-group">
                            <label class="form-label-pink">Completion Doc (CDoc) <i class="fa-solid fa-upload"></i></label>
                            <input type="file" id="uploadCDoc" class="task-input file-input-dashed">
                        </div>
                    </div>
                    <div class="form-grid-3-col">
                        <div class="form-group">
                            <label class="form-label">Created By</label>
                            <select id="createTaskCreator" class="task-input">${userOptions}</select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notifier</label>
                            <select id="createTaskNotifier" class="task-input">${userOptions}</select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Linked Accounts</label>
                            <input type="text" id="createLinkedAccounts" class="task-input" placeholder="Account IDs...">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Comment</label>
                    <textarea id="createTaskComment" class="task-input comment-textarea" rows="2"></textarea>
                </div>

                <div class="create-task-modal-footer">
                    <button class="btn-secondary" id="cancelCreateTaskBtn">Cancel</button>
                    <button class="btn-primary" id="submitCreateTaskBtn">
                        <i class="fa-solid fa-check"></i> Create Task
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    setTimeout(() => document.getElementById('createTaskName')?.focus(), 150);
    const close = () => modal.remove();
    modal.querySelector('.close')?.addEventListener('click', close);
    document.getElementById('cancelCreateTaskBtn')?.addEventListener('click', close);
    modal.onclick = (e) => { if(e.target === modal) close(); };

    document.getElementById('submitCreateTaskBtn')?.addEventListener('click', () => {
        const name = (document.getElementById('createTaskName') as HTMLInputElement).value.trim();
        if (!name) {
            alert('A Task Name is required to proceed.');
            return;
        }

        const taskData = {
            name: name,
            tDoc: (document.getElementById('uploadTDoc') as HTMLInputElement).files?.[0],
            cDoc: (document.getElementById('uploadCDoc') as HTMLInputElement).files?.[0],
            owner: (document.getElementById('createTaskOwner') as HTMLSelectElement).value,
            reviewer: (document.getElementById('createTaskReviewer') as HTMLSelectElement).value,
            approver: (document.getElementById('createTaskApprover') as HTMLSelectElement).value,
            status: (document.getElementById('createTaskStatus') as HTMLSelectElement).value,
            recurrence: (document.getElementById('createTaskRecurrence') as HTMLSelectElement).value
        };

        console.log("Task Submitted:", taskData);
        if (typeof handleTaskCreation === "function") {
            handleTaskCreation(mainList, subList, taskData);
        }
        close();
    });
}

function collectTaskFormData(): any {
    return {
        name: (document.getElementById('createTaskName') as HTMLInputElement).value,
        taskNumber: (document.getElementById('createTaskNumber') as HTMLInputElement).value,
        owner: (document.getElementById('createTaskOwner') as HTMLSelectElement).value,
        status: 'Not Started', 
        tdoc: (document.getElementById('createTaskTdoc') as HTMLInputElement).value || '0',
        cdoc: (document.getElementById('createTaskCdoc') as HTMLInputElement).value || '0',
        dueDate: (document.getElementById('createTaskDueDate') as HTMLInputElement).value,
        recurrenceType: (document.getElementById('createTaskRecurrenceType') as HTMLSelectElement).value,
        comment: (document.getElementById('createTaskComment') as HTMLTextAreaElement).value,
        dependentTask: (document.getElementById('createTaskDependent') as HTMLSelectElement).value
    };
}

function handleTaskCreation(mainList: any, subList: any, data: any): void {
    let targetSubList = subList;

    if (!targetSubList) {
        targetSubList = mainList.subLists.length > 0 
            ? mainList.subLists[0] 
            : createSubList(mainList, 'Tasks');
    }

    const newTask = createTask(targetSubList, data);

    if (data.dependentTask) {
        (window as any).dependentTasks?.set(newTask.id, data.dependentTask);
        if (typeof refreshDependentTaskUI === 'function') {
            refreshDependentTaskUI();
            saveDependentTasks();
        }
    }

    showNotification(`Task "${data.name}" added to ${targetSubList.name}`);
}

function getTaskOptionsForDropdown(): string {
    if (!tasks || tasks.length === 0) return '';
    
    let options = '';
    tasks.forEach(task => {
        const displayText = task.taskNumber || task.name || `Task ${task.id}`;
        options += `<option value="${task.id}">${displayText}</option>`;
    });
    
    return options;
}

function showCreateTaskForMainList(mainList: any): void {
    showCreateTaskModalForList(mainList, null);
}

function showCreateTaskModal(subList: any): void {
    const mainList = mainLists.find(m => m.id === subList.mainListId);
    if (mainList) {
        showCreateTaskModalForList(mainList, subList);
    } else {
        showCreateTaskModalForList({ name: 'Tasks', subLists: [subList] }, subList);
    }
}

function removeGlobalAddTaskButton(): void {
    const addTaskRows = document.querySelectorAll('.add-task-row');
    addTaskRows.forEach(row => row.remove());
    
    const addTaskButtons = document.querySelectorAll('button');
    addTaskButtons.forEach(button => {
        if (button.textContent && button.textContent.includes('+ Add Task')) {
            if (!button.closest('.plus-dropdown-content')) {
                button.remove();
            }
        }
    });
    
    const addTaskSpans = document.querySelectorAll('span, div');
    addTaskSpans.forEach(el => {
        if (el.textContent && el.textContent.trim() === '+ Add Task') {
            if (!el.closest('.plus-dropdown-content')) {
                el.remove();
            }
        }
    });
    
    console.log('Global Add Task buttons removed');
}

function createSubListRow(subList: any, mainList: any): HTMLTableRowElement | null {
    const tbody = mainList.tbody;
    if (!tbody) return null;
    
    const row = document.createElement('tr');
    row.className = 'sub-list-row';
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-mainlist-id', mainList.id);
    
    const visibleCols = getVisibleColumnCount();
    row.innerHTML = `
        <td colspan="${visibleCols}">
            <div class="sublist-header">
                <input type="checkbox" class="sublist-checkbox" title="Select this sublist">
                <span class="sublist-icon"><i class="fa-solid fa-folder"></i></span>
                <span class="sublist-name">${escapeHtml(subList.name)}</span>
                <span class="collapse-sublist-icon"><i class="fas fa-angle-down"></i></span>
            </div>
        </td>
    `;
    
    subList.row = row;
    
    let insertAfter = mainList.titleRow;
    if (insertAfter && insertAfter.nextSibling) {
        tbody.insertBefore(row, insertAfter.nextSibling);
    } else {
        tbody.appendChild(row);
    }
    
    const collapseIcon = row.querySelector('.collapse-sublist-icon');
    if (collapseIcon) {
        collapseIcon.addEventListener('click', () => toggleSubList(subList, mainList));
    }
    
    const checkbox = row.querySelector('.sublist-checkbox') as HTMLInputElement;
    if (checkbox) {
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            handleSublistCheckbox(subList, checkbox.checked);
        });
    }
    
    return row;
}

function handleSublistCheckbox(subList: any, checked: boolean): void {
    console.log(`Sublist ${subList.name} checkbox: ${checked}`);
    subList.tasks.forEach((task: any) => {
        if (task.row) {
            const taskCheckbox = task.row.querySelector('.task-checkbox') as HTMLInputElement;
            if (taskCheckbox) {
                taskCheckbox.checked = checked;
            }
        }
    });
    
    const mainList = mainLists.find(m => m.id === subList.mainListId);
    if (mainList && mainList.row) {
        const mainCheckbox = mainList.row.querySelector('.list-checkbox') as HTMLInputElement;
        if (mainCheckbox) {
            const allSublistsChecked = mainList.subLists.every((s: any) => {
                const cb = s.row?.querySelector('.sublist-checkbox') as HTMLInputElement;
                return cb ? cb.checked : false;
            });
            
            const anySublistChecked = mainList.subLists.some((s: any) => {
                const cb = s.row?.querySelector('.sublist-checkbox') as HTMLInputElement;
                return cb ? cb.checked : false;
            });
            
            if (allSublistsChecked) {
                mainCheckbox.checked = true;
                mainCheckbox.indeterminate = false;
            } else if (anySublistChecked) {
                mainCheckbox.checked = false;
                mainCheckbox.indeterminate = true;
            } else {
                mainCheckbox.checked = false;
                mainCheckbox.indeterminate = false;
            }
        }
    }
    
    updateSelectedCount();
}

function handleMainListCheckbox(mainList: any, checked: boolean): void {
    console.log(`Main list ${mainList.name} checkbox: ${checked}`);
    
    mainList.subLists.forEach((subList: any) => {
        if (subList.row) {
            const sublistCheckbox = subList.row.querySelector('.sublist-checkbox') as HTMLInputElement;
            if (sublistCheckbox) {
                sublistCheckbox.checked = checked;
            }
        }
        
        subList.tasks.forEach((task: any) => {
            if (task.row) {
                const taskCheckbox = task.row.querySelector('.task-checkbox') as HTMLInputElement;
                if (taskCheckbox) {
                    taskCheckbox.checked = checked;
                }
            }
        });
    });
    
    if (checked) {
        
    }
    
    updateSelectedCount();
}

function updateSelectedCount(): number {
    let selected = 0;
    tasks.forEach(task => {
        const checkbox = task.row.querySelector('.task-checkbox') as HTMLInputElement;
        if (checkbox && checkbox.checked) selected++;
    });
    subtasks.forEach(subtask => {
        const checkbox = subtask.row.querySelector('.subtask-checkbox') as HTMLInputElement;
        if (checkbox && checkbox.checked) selected++;
    });
    
    const selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = selected.toString();
    }
    
    console.log('Selected items:', selected);
    return selected;
}

function showCreateSubListModal(mainList: any): void {
    let modal = document.getElementById('createSubListModal') as HTMLDivElement;
    
    if (!modal) {
        modal = createSubListModalHTML();
        document.body.appendChild(modal);
        attachSubListEvents(modal);
    }
    
    modal.setAttribute('data-current-mainlist-id', mainList.id);
    const titleEl = modal.querySelector('.sublist-modal-title');
    if (titleEl) titleEl.textContent = `New Sub List for "${mainList.name}"`;
    
    modal.style.display = 'block';
    
    setTimeout(() => document.getElementById('subListNameInput')?.focus(), 100);
}

function createSubListModalHTML(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'createSubListModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content modal-content-small">
            <span class="close">&times;</span>
            <h3 class="cdoc-header sublist-modal-title">Create Sub List</h3>
            
            <div class="modal-body-spacing">
                <label class="form-label">Sub List Name</label>
                <input type="text" id="subListNameInput" class="task-input" 
                       placeholder="e.g. Phase 1, Q1 Review...">
                
                <button id="createSubListBtn" class="btn-primary full-width-btn">
                    Create Sub List
                </button>
            </div>
        </div>
    `;
    return modal;
}

function attachSubListEvents(modal: HTMLDivElement): void {
    const input = document.getElementById('subListNameInput') as HTMLInputElement;
    const close = () => {
        modal.style.display = 'none';
        if (input) input.value = '';
    };

    modal.querySelector('.close')?.addEventListener('click', close);

    const handleSubmit = () => {
        const mainListId = modal.getAttribute('data-current-mainlist-id');
        const mainList = mainLists.find(m => m.id === mainListId);
        
        if (!mainList) {
            showNotification('Error: Main list context lost', 'error');
            return;
        }
        
        const subListName = input?.value.trim() || '';
        
        if (subListName) {
            createSubList(mainList, subListName);
            close();
        } else {
            showNotification('Please enter a name for the sub list', 'info');
            input?.focus();
        }
    };

    document.getElementById('createSubListBtn')?.addEventListener('click', handleSubmit);

    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
}

function debugComments(): void {
    console.log('=== Comment Debug ===');
    console.log('Saved comments in localStorage:', localStorage.getItem('taskViewerData') ? JSON.parse(localStorage.getItem('taskViewerData') || '{}').taskComments : 'None');
    console.log('Current taskComments object:', taskComments);
    console.log('Tasks with IDs:', tasks.map(t => ({ id: t.id, name: t.name, commentKey: `task_${t.id}` })));
    console.log('Subtasks with IDs:', subtasks.map(s => ({ id: s.id, name: s.name, commentKey: `subtask_${s.id}` })));
    console.log('===================');
}

// ================================
// PERSISTENCE FUNCTIONS
// ================================
function saveAllData(): boolean {
    try {
        const tasksData = tasks.map((task: any) => ({
            id: task.id, 
            subListId: task.subListId,
            name: task.name,
            acc: task.acc,
            tdoc: task.tdoc,
            owner: task.owner,
            reviewer: task.reviewer,
            dueDate: task.dueDate,
            status: task.status,
            taskNumber: task.taskNumber,
            taskOwner: task.taskOwner,
            taskStatus: task.taskStatus,
            approver: task.approver,
            recurrenceType: task.recurrenceType,
            completionDoc: task.completionDoc,
            createdBy: task.createdBy,
            comment: task.comment,
            assigneeDueDate: task.assigneeDueDate,
            customField1: task.customField1,
            reviewerDueDate: task.reviewerDueDate,
            customField2: task.customField2,
            linkedAccounts: task.linkedAccounts,
            completionDate: task.completionDate,
            notifier: task.notifier
        }));
        
        const subtasksData = subtasks.map((subtask: any) => ({
            id: subtask.id, 
            subListId: subtask.subListId,
            name: subtask.name,
            tdoc: subtask.tdoc,
            owner: subtask.owner,
            reviewer: subtask.reviewer,
            dueDate: subtask.dueDate,
            status: subtask.status,
            taskNumber: subtask.taskNumber,
            taskOwner: subtask.taskOwner,
            taskStatus: subtask.taskStatus,
            approver: subtask.approver,
            recurrenceType: subtask.recurrenceType,
            createdBy: subtask.createdBy,
            comment: subtask.comment
        }));
        
        const data = {
            mainLists: mainLists.map(mainList => ({
                id: mainList.id,
                name: mainList.name,
                isExpanded: mainList.isExpanded,
                subLists: mainList.subLists.map((sub: any) => sub.id)
            })),
            subLists: subLists.map((subList: any) => ({
                id: subList.id,
                name: subList.name,
                mainListId: subList.mainListId,
                isExpanded: subList.isExpanded,
                tasks: subList.tasks.map((task: any) => task.id)
            })),
            tasks: tasksData,
            subtasks: subtasksData,
            taskComments: taskComments, 
            cdocDocuments: {},
            tdocDocuments: {},
            linkedAccountsMap: {}
        };
        
        // Save CDoc documents
        tasks.forEach((task: any) => {
            if (task.id) {
                const docs = taskDocuments.get(task.row);
                if (docs && docs.length > 0) {
                    data.cdocDocuments[task.id] = docs;
                }
                const tdocs = taskTDocDocuments.get(task.row);
                if (tdocs && tdocs.length > 0) {
                    data.tdocDocuments[task.id] = tdocs;
                }
                const accounts = taskAccounts.get(task.row);
                if (accounts && accounts.length > 0) {
                    data.linkedAccountsMap[task.id] = accounts;
                }
            }
        });
        
        subtasks.forEach((subtask: any) => {
            if (subtask.id) {
                const docs = taskDocuments.get(subtask.row);
                if (docs && docs.length > 0) {
                    data.cdocDocuments[subtask.id] = docs;
                }
                const tdocs = taskTDocDocuments.get(subtask.row);
                if (tdocs && tdocs.length > 0) {
                    data.tdocDocuments[subtask.id] = tdocs;
                }
            }
        });
        
        localStorage.setItem('taskViewerData', JSON.stringify(data));
        console.log('All data saved to localStorage. Tasks:', tasksData.length, 'Subtasks:', subtasksData.length, 'Comment threads:', Object.keys(taskComments).length);
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        return false;
    }
}

function loadAllData(): boolean {
    try {
        const savedData = localStorage.getItem('taskViewerData');
        if (!savedData) {
            console.log('No saved data found');
            return false;
        }
        
        const data = JSON.parse(savedData);
        console.log('Loading data:', data);
        const container = document.getElementById('mainTableContainer');
        if (container) container.innerHTML = '';
        
        mainLists = [];
        subLists = [];
        tasks = [];
        subtasks = [];
        taskDocuments.clear();
        taskTDocDocuments.clear();
        taskAccounts.clear();
        Object.keys(taskComments).forEach(key => {
            delete taskComments[key];
        });
        
        if (data.taskComments) {
            Object.assign(taskComments, data.taskComments);
            console.log('Loaded comments from localStorage:', Object.keys(taskComments).length, 'comment threads');
            
            Object.entries(taskComments).forEach(([key, comments]) => {
                console.log(`Comment thread ${key}: ${(comments as any[]).length} comments`);
            });
        }
        
        if (data.mainLists) {
            data.mainLists.forEach((mainListData: any) => {
                const mainList = {
                    id: mainListData.id,
                    name: mainListData.name,
                    subLists: [],
                    row: null,
                    tableContainer: null,
                    tableElement: null,
                    tbody: null,
                    titleRow: null,
                    isExpanded: mainListData.isExpanded !== undefined ? mainListData.isExpanded : true
                };
                mainLists.push(mainList);
                createMainListTable(mainList);
            });
        }
        
        if (data.subLists) {
            data.subLists.forEach((subListData: any) => {
                const mainList = mainLists.find(m => m.id === subListData.mainListId);
                if (mainList) {
                    const subList = {
                        id: subListData.id,
                        name: subListData.name,
                        mainListId: subListData.mainListId,
                        tasks: [],
                        row: null,
                        isExpanded: subListData.isExpanded !== undefined ? subListData.isExpanded : true
                    };
                    subLists.push(subList);
                    mainList.subLists.push(subList);
                    createSubListRow(subList, mainList);
                }
            });
        }
        
        if (data.tasks) {
            data.tasks.forEach((taskData: any) => {
                const subList = subLists.find(s => s.id === taskData.subListId);
                if (subList) {
                    const task = {
                        id: taskData.id, 
                        subListId: taskData.subListId,
                        name: taskData.name,
                        acc: taskData.acc || '+',
                        tdoc: taskData.tdoc || '0',
                        owner: taskData.owner || 'PK',
                        reviewer: taskData.reviewer || 'SM',
                        dueDate: taskData.dueDate || '',
                        status: taskData.status || 'Not Started',
                        taskNumber: taskData.taskNumber || 'TSK-' + Math.floor(Math.random() * 1000),
                        taskOwner: taskData.taskOwner || taskData.owner || 'PK',
                        taskStatus: taskData.taskStatus || taskData.status || 'Not Started',
                        approver: taskData.approver || '—',
                        recurrenceType: taskData.recurrenceType || 'None',
                        completionDoc: taskData.completionDoc || '0',
                        createdBy: taskData.createdBy || 'PK',
                        comment: taskData.comment || '',
                        assigneeDueDate: taskData.assigneeDueDate || taskData.dueDate || '',
                        customField1: taskData.customField1 || '',
                        reviewerDueDate: taskData.reviewerDueDate || '',
                        customField2: taskData.customField2 || '',
                        linkedAccounts: taskData.linkedAccounts || '',
                        completionDate: taskData.completionDate || '',
                        notifier: taskData.notifier || '',
                        row: null
                    };
                    
                    subList.tasks.push(task);
                    tasks.push(task);
                    createTaskRow(task, subList);
                } else {
                    console.warn('SubList not found for task:', taskData.id, taskData.subListId);
                }
            });
        }
        
        if (data.subtasks) {
            data.subtasks.forEach((subtaskData: any) => {
                const subList = subLists.find(s => s.id === subtaskData.subListId);
                if (subList) {
                    const subtask = {
                        id: subtaskData.id, // CRITICAL: Keep the original ID
                        subListId: subtaskData.subListId,
                        name: subtaskData.name,
                        tdoc: subtaskData.tdoc || '0',
                        owner: subtaskData.owner || 'PK',
                        reviewer: subtaskData.reviewer || 'SM',
                        dueDate: subtaskData.dueDate || '',
                        status: subtaskData.status || 'Not Started',
                        taskNumber: subtaskData.taskNumber || 'SUB-' + Math.floor(Math.random() * 1000),
                        taskOwner: subtaskData.taskOwner || subtaskData.owner || 'PK',
                        taskStatus: subtaskData.taskStatus || subtaskData.status || 'Not Started',
                        approver: subtaskData.approver || '—',
                        recurrenceType: subtaskData.recurrenceType || 'None',
                        createdBy: subtaskData.createdBy || 'PK',
                        comment: subtaskData.comment || '',
                        row: null
                    };
                    
                    subtasks.push(subtask);
                    createSubtaskRow(subtask, subList);
                }
            });
        }
        
        setTimeout(() => {
            tasks.forEach((task: any) => {
                if (task.row && task.id) {
                    task.row.dataset.taskId = task.id;
                    
                    const commentKey = `task_${task.id}`;
                    if (taskComments[commentKey] && taskComments[commentKey].length > 0) {
                        console.log(`Task ${task.id} has ${taskComments[commentKey].length} comments to restore`);
                    }
                }
            });
            
            subtasks.forEach((subtask: any) => {
                if (subtask.row && subtask.id) {
                    subtask.row.dataset.subtaskId = subtask.id;
                    
                    const commentKey = `subtask_${subtask.id}`;
                    if (taskComments[commentKey] && taskComments[commentKey].length > 0) {
                        console.log(`Subtask ${subtask.id} has ${taskComments[commentKey].length} comments to restore`);
                    }
                }
            });
            
            if (data.cdocDocuments) {
                tasks.forEach((task: any) => {
                    if (task.id && data.cdocDocuments[task.id]) {
                        taskDocuments.set(task.row, data.cdocDocuments[task.id]);
                    }
                });
                subtasks.forEach((subtask: any) => {
                    if (subtask.id && data.cdocDocuments[subtask.id]) {
                        taskDocuments.set(subtask.row, data.cdocDocuments[subtask.id]);
                    }
                });
            }
            
            if (data.tdocDocuments) {
                tasks.forEach((task: any) => {
                    if (task.id && data.tdocDocuments[task.id]) {
                        taskTDocDocuments.set(task.row, data.tdocDocuments[task.id]);
                    }
                });
                subtasks.forEach((subtask: any) => {
                    if (subtask.id && data.tdocDocuments[subtask.id]) {
                        taskTDocDocuments.set(subtask.row, data.tdocDocuments[subtask.id]);
                    }
                });
            }
            
            if (data.linkedAccountsMap) {
                tasks.forEach((task: any) => {
                    if (task.id && data.linkedAccountsMap[task.id]) {
                        taskAccounts.set(task.row, data.linkedAccountsMap[task.id]);
                    }
                });
            }
            
            updateTDocColumn();
            updateCDocColumn();
            refreshLinkedAccountsColumn();
            
            updateCommentColumn();
            
            setTimeout(() => {
                initializeSimpleUserColumns();
                makeOwnerReviewerClickable();
                makeRecurrenceCellsClickable();
            }, 200);
            
            showNotification('Data restored successfully');
            console.log('All data loaded from localStorage. Tasks:', tasks.length, 'Subtasks:', subtasks.length, 'Comments:', Object.keys(taskComments).length);
        }, 500);
        
        return true;
    } catch (e) {
        console.error('Error loading data:', e);
        return false;
    }
}

function findRowById(id: string): HTMLElement | null {
    const task = tasks.find(t => t.id === id);
    if (task && task.row) return task.row;
    
    const row = document.querySelector(`[data-task-id="${id}"], [data-subtask-id="${id}"]`);
    if (row) return row as HTMLElement;
    
    return null;
}

let dependentTasks = new Map(); 

function populateDependentTaskDropdown(selectElement: HTMLSelectElement): void {
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">None</option>';
    
    const allTasks = [...tasks];
    
    if (allTasks.length === 0) {
        selectElement.innerHTML = '<option value="">No tasks available</option>';
        return;
    }
    
    allTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        
        const displayText = task.taskNumber || `Task ${task.id.slice(-4)}`;
        option.textContent = displayText;
        
        option.title = task.name || displayText;
        
        selectElement.appendChild(option);
    });
    
    console.log(`Dependent task dropdown populated with ${allTasks.length} tasks`);
}

function refreshAllDependentTaskDropdowns(): void {
    const allDropdowns = document.querySelectorAll('.dependent-task-dropdown');
    allDropdowns.forEach(dropdown => {
        const currentValue = (dropdown as HTMLSelectElement).value;
        populateDependentTaskDropdown(dropdown as HTMLSelectElement);
        if (currentValue && dropdown.querySelector(`option[value="${currentValue}"]`)) {
            (dropdown as HTMLSelectElement).value = currentValue;
        }
    });
}

function getDependentTasks(taskId: string): any[] {
    const dependents = [];
    for (let [dependentId, parentId] of dependentTasks.entries()) {
        if (parentId === taskId) {
            const task = tasks.find(t => t.id === dependentId);
            if (task) dependents.push(task);
        }
    }
    return dependents;
}

function hasDependents(taskId: string): boolean {
    return getDependentTasks(taskId).length > 0;
}

function addDependentTaskFieldStyles(): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'dependent-task-styles.css';
    document.head.appendChild(link);
}

function addDependentTaskFieldToModal(): void {
    addDependentTaskFieldStyles();
    
    const modal = document.getElementById('createTaskCompleteModal');
    if (!modal) return;
    
    const taskNumberDiv = document.getElementById('createTaskNumber')?.closest('div');
    if (!taskNumberDiv) return;
    
    if (modal.querySelector('.dependent-task-container')) return;
    
    const dependentContainer = document.createElement('div');
    dependentContainer.className = 'dependent-task-container';
    
    const label = document.createElement('label');
    label.htmlFor = 'createTaskDependent';
    label.textContent = 'Dependent Task';
    
    const select = document.createElement('select');
    select.id = 'createTaskDependent';
    select.className = 'dependent-task-dropdown';
    
    const helpText = document.createElement('div');
    helpText.className = 'dependent-task-help';
    helpText.innerHTML = '<i class="fa-solid fa-info-circle"></i> Select a task that this task depends on';
    
    dependentContainer.appendChild(label);
    dependentContainer.appendChild(select);
    dependentContainer.appendChild(helpText);
    
    if (taskNumberDiv.parentNode) {
        taskNumberDiv.parentNode.insertBefore(dependentContainer, taskNumberDiv.nextSibling);
    }
    
    populateDependentTaskDropdown(select);
}

function updateCreateTaskWithDependency(): void {
    const originalCreateTask = (window as any).createTask;
    
    (window as any).createTask = function(subList: any, taskData: any) {
        const dependentTaskId = (document.getElementById('createTaskDependent') as HTMLSelectElement)?.value;
        
        const newTask = originalCreateTask.call(this, subList, taskData);
        
        if (dependentTaskId && dependentTaskId !== '' && newTask && newTask.id) {
            dependentTasks.set(newTask.id, dependentTaskId);
            console.log(`Task ${newTask.id} depends on ${dependentTaskId}`);
        }
        
        setTimeout(() => {
            refreshAllDependentTaskDropdowns();
        }, 100);
        
        return newTask;
    };
}

function showDependentTasks(task: any): void {
    const dependents = getDependentTasks(task.id);
    
    if (dependents.length === 0) {
        showNotification('No tasks depend on this task');
        return;
    }
    const existingModal = document.getElementById('dependentTasksModal');
    if (existingModal) existingModal.remove();
    
    const modal = createDependencyModalHTML(task, dependents);
    document.body.appendChild(modal);
    
    attachDependencyEvents(modal);
}

function createDependencyModalHTML(task: any, dependents: any[]): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'dependentTasksModal';
    modal.className = 'modal modal-open modal-high-z';

    const taskTitle = task.taskNumber || task.name;

    modal.innerHTML = `
        <div class="modal-content modal-sm">
            <span class="close">&times;</span>

            <h3 class="cdoc-header">
                <i class="fa-solid fa-link"></i> Dependent Tasks
            </h3>

            <p class="modal-subtext">
                The following tasks are blocked by <strong>${taskTitle}</strong>
            </p>

            <div class="dependency-list">
                ${dependents.map(dep => renderDependencyItem(dep)).join('')}
            </div>

            <div class="modal-footer">
                <button id="closeDependentModal" class="btn-secondary">Close</button>
            </div>
        </div>
    `;

    return modal;
}

function renderDependencyItem(dep: any): string {
    const status = dep.status || 'Not Started';
    const statusClass = status.toLowerCase().replace(/\s+/g, '-');

    return `
        <div class="dependency-item">
            <div class="dependency-info">
                <div class="dependency-title">
                    ${dep.taskNumber || 'Task'}
                </div>

                <div class="dependency-name">
                    ${dep.name}
                </div>

                <div class="dependency-meta">
                    <span class="skystemtaskmaster-status-badge skystemtaskmaster-status-${statusClass}">
                        ${status}
                    </span>
                </div>
            </div>

            <button class="btn-primary view-dependent-task" data-task-id="${dep.id}">
                View Task
            </button>
        </div>
    `;
}

function attachDependencyEvents(modal: HTMLDivElement): void {
    const close = () => modal.remove();

    modal.querySelector('.close')?.addEventListener('click', close);
    document.getElementById('closeDependentModal')?.addEventListener('click', close);
    modal.onclick = (e) => { if (e.target === modal) close(); };
    modal.querySelectorAll('.view-dependent-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = (btn as HTMLElement).dataset.taskId;
            const targetTask = tasks.find(t => t.id === taskId);
            
            if (targetTask && targetTask.row) {
                targetTask.row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                targetTask.row.classList.add('task-row-highlight');
                setTimeout(() => targetTask.row.classList.remove('task-row-highlight'), 2000);
                
                close();
            }
        });
    });
}

function addDependentIndicatorToTaskRow(task: any): void {
    if (!task.row) return;
    
    const taskNameDiv = task.row.cells[0]?.querySelector('.skystemtaskmaster-task-name');
    if (!taskNameDiv) return;
    
    if (taskNameDiv.querySelector('.dependent-indicator')) return;
    
    const dependents = getDependentTasks(task.id);
    if (dependents.length > 0) {
        const indicator = document.createElement('span');
        indicator.className = 'dependent-indicator';
        indicator.innerHTML = '🔗';
        indicator.title = `${dependents.length} task(s) depend on this`;
        
        indicator.addEventListener('mouseenter', () => {
            indicator.classList.add('dependent-indicator-hover');
        });
        
        indicator.addEventListener('mouseleave', () => {
            indicator.classList.remove('dependent-indicator-hover');
        });
        
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            showDependentTasks(task);
        });
        
        taskNameDiv.appendChild(indicator);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    addDependentTaskStyles();
    setTimeout(() => {
        initializeDependentTasks();
    }, 2000);
});

function setupAutoSave(): void {
    const originalCreateMainList = createMainList;
    const originalCreateSubList = createSubList;
    const originalCreateTask = createTask;
    const originalDeleteSelectedItems = deleteSelectedItems;
    
    (window as any).createMainList = function(listName: string) {
        const result = originalCreateMainList(listName);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    (window as any).createSubList = function(mainList: any, subListName: string) {
        const result = originalCreateSubList(mainList, subListName);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    (window as any).createTask = function(subList: any, taskData: any) {
        const result = originalCreateTask(subList, taskData);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    (window as any).deleteSelectedItems = function() {
        const result = originalDeleteSelectedItems();
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    document.addEventListener('click', function(e) {
        if (e.target instanceof Element && (e.target.closest('.skystemtaskmaster-status-badge') || 
            e.target.closest('.skystemtaskmaster-badge'))) {
            setTimeout(() => saveAllData(), 200);
        }
    });
}

function createSubList(mainList: any, subListName: string): any {
    const subList = {
        id: 'sublist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: subListName,
        mainListId: mainList.id,
        tasks: [],
        row: null,
        isExpanded: true
    };
    
    subLists.push(subList);
    mainList.subLists.push(subList);
    createSubListRow(subList, mainList);
    showNotification(`Sub list "${subListName}" created`);
    return subList;
}

function showCreateTaskModal(subList: any): void {
    let modal = document.getElementById('createTaskModal') as HTMLDivElement;
    
    if (!modal) {
        modal = createCreateTaskModalHTML();
        document.body.appendChild(modal);
        attachTaskCreationEvents(modal);
    }
    modal.setAttribute('data-current-sublist-id', subList.id);
    const titleEl = modal.querySelector('.task-modal-title');
    if (titleEl) titleEl.textContent = `Create Task for "${subList.name}"`;
    const taskNumberInput = document.getElementById('taskNumberInput') as HTMLInputElement;
    if (taskNumberInput) taskNumberInput.value = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    
    modal.style.display = 'block';
}

function createCreateTaskModalHTML(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'createTaskModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content create-task-modal-large">
            <span class="close">&times;</span>
            <h3 class="cdoc-header task-modal-title">Create Task</h3>
            
            <div class="sort-body">
                <div class="task-form-section">
                    <h4 class="section-title">Basic Information</h4>
                    <div class="form-group-mb">
                        <label class="form-label required-label">Task Name</label>
                        <input type="text" id="taskNameInput" class="task-input" placeholder="What needs to be done?">
                    </div>
                    
                    <div class="form-grid-2">
                        <div>
                            <label class="form-label">Task Number</label>
                            <input type="text" id="taskNumberInput" class="task-input">
                        </div>
                        <div>
                            <label class="form-label">Task Owner</label>
                            ${renderUserSelect('taskOwnerInput')}
                        </div>
                    </div>
                    
                    <div class="form-grid-2">
                        <div>
                            <label class="form-label">Task Status</label>
                            <select id="taskStatusInput" class="task-input">
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Review">Review</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Reviewer</label>
                            ${renderUserSelect('taskReviewerInput')}
                        </div>
                    </div>
                </div>

                <div class="task-form-section">
                    <h4 class="section-title">Timeline</h4>
                    <div class="form-grid-3">
                        <div>
                            <label class="form-label">Due Date</label>
                            <input type="date" id="taskDueDateInput" class="task-input">
                        </div>
                        <div>
                            <label class="form-label">Assignee Due</label>
                            <input type="date" id="taskAssigneeDueDateInput" class="task-input">
                        </div>
                        <div>
                            <label class="form-label">Reviewer Due</label>
                            <input type="date" id="taskReviewerDueDateInput" class="task-input">
                        </div>
                    </div>
                    <div class="form-grid-2">
                        <div>
                            <label class="form-label">Recurrence</label>
                            <select id="taskRecurrenceTypeInput" class="task-input">
                                <option value="None">None</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="task-form-section">
                    <h4 class="section-title">Comments & Notes</h4>
                    <textarea id="taskCommentInput" class="task-input comment-textarea" rows="3" placeholder="Additional details..."></textarea>
                </div>

                <button id="createTaskBtn" class="btn-primary full-width-btn">Create Task</button>
            </div>
        </div>
    `;
    return modal;
}

function attachTaskCreationEvents(modal: HTMLDivElement): void {
    const close = () => { modal.style.display = 'none'; };
    modal.querySelector('.close')?.addEventListener('click', close);

    document.getElementById('createTaskBtn')?.addEventListener('click', () => {
        const subListId = modal.getAttribute('data-current-sublist-id');
        const subList = subLists.find(s => s.id === subListId);
        const taskName = (document.getElementById('taskNameInput') as HTMLInputElement).value.trim();

        if (!taskName) {
            showNotification('Task Name is required!', 'error');
            return;
        }

        const taskData = {
            name: taskName,
            taskNumber: (document.getElementById('taskNumberInput') as HTMLInputElement).value,
            owner: (document.getElementById('taskOwnerInput') as HTMLSelectElement).value,
            status: (document.getElementById('taskStatusInput') as HTMLSelectElement).value,
            reviewer: (document.getElementById('taskReviewerInput') as HTMLSelectElement).value,
            dueDate: (document.getElementById('taskDueDateInput') as HTMLInputElement).value,
            assigneeDueDate: (document.getElementById('taskAssigneeDueDateInput') as HTMLInputElement).value,
            recurrenceType: (document.getElementById('taskRecurrenceTypeInput') as HTMLSelectElement).value,
            comment: (document.getElementById('taskCommentInput') as HTMLTextAreaElement).value,
            acc: '+',
            days: '0'
        };

        createTask(subList, taskData);
        close();
        resetTaskForm();
        showNotification('Task created successfully');
    });
}

function resetTaskForm(): void {
    const inputs = ['taskNameInput', 'taskDueDateInput', 'taskCommentInput'];
    inputs.forEach(id => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (el) el.value = '';
    });
}

function renderUserSelect(id: string): string {
    const users = ['PK - Palakh Khanna', 'SM - Sarah Miller', 'MP - Mel Preparer', 'JS - John Smith'];
    return `
        <select id="${id}" class="task-input">
            ${users.map(u => `<option value="${u.split(' - ')[0]}">${u}</option>`).join('')}
        </select>
    `;
}

function setupUploadHandlers(modal: HTMLDivElement, taskRow: HTMLElement): void {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const filesContainer = document.getElementById('filesContainer');
    const selectedFilesList = document.getElementById('selectedFilesList');
    const uploadBtn = document.getElementById('uploadSelectedBtn');
    const browseBtn = document.getElementById('browseFileBtn');
    
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;
    
    let selectedFiles: File[] = [];
    
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(fileInput.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-active');
    });
    
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-active');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-active');
        const files = Array.from(e.dataTransfer?.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    function updateSelectedFilesList(): void {
        if (selectedFiles.length === 0) {
            (selectedFilesList as HTMLElement).style.display = 'none';
            (uploadBtn as HTMLElement).style.display = 'none';
            return;
        }
        
        (selectedFilesList as HTMLElement).style.display = 'block';
        (uploadBtn as HTMLElement).style.display = 'inline-block';
        
        filesContainer.innerHTML = selectedFiles.map((file, index) => `
            <div class="file-item">
                <span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button class="remove-file" data-index="${index}">✕</button>
            </div>
        `).join('');
        
        filesContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
                selectedFiles.splice(index, 1);
                updateSelectedFilesList();
                fileInput.value = '';
            });
        });
    }
    
    uploadBtn.addEventListener('click', () => {
        if (selectedFiles.length === 0) {
            alert('Please select files to upload');
            return;
        }
        
        const currentTaskRow = (window as any).currentTaskRow || taskRow; 
        if (!currentTaskRow) {
            alert('Error: Task not found');
            return;
        }
        const taskId = currentTaskRow.dataset.taskId || currentTaskRow.dataset.subtaskId;
        if (!taskId) {
            console.error('No ID found for row, generating one...');
            const newId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            if (currentTaskRow.classList.contains('task-row')) {
                currentTaskRow.dataset.taskId = newId;
                const task = tasks.find(t => t.row === currentTaskRow);
                if (task) task.id = newId;
            } else {
                currentTaskRow.dataset.subtaskId = newId;
                const subtask = subtasks.find(s => s.row === currentTaskRow);
                if (subtask) subtask.id = newId;
            }
        }
        
        const docs = selectedFiles.map(file => ({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date()
        }));
        
        console.log('Uploading documents:', docs.length, 'to row:', currentTaskRow);
        
        const existingDocs = taskDocuments.get(currentTaskRow) || [];
        taskDocuments.set(currentTaskRow, [...existingDocs, ...docs]);
        
        updateCDocColumn();
        
        selectedFiles = [];
        updateSelectedFilesList();
        fileInput.value = '';
        
        const listContainer = document.getElementById('documentsListContainer');
        if (listContainer) {
            listContainer.innerHTML = renderDocumentsList(taskDocuments.get(currentTaskRow) || [], currentTaskRow);
            attachDocumentEventListeners(currentTaskRow);
        }
        
        const header = modal.querySelector('h4');
        if (header) header.innerHTML = `Attached Documents (${(taskDocuments.get(currentTaskRow) || []).length})`;
        
        showNotification(`${docs.length} file(s) uploaded successfully`);
        
        setTimeout(() => {
            console.log('Auto-saving after document upload...');
            saveAllData();
        }, 100);
    });
}

function addExtraColumnsForRow(row: HTMLElement, task: any): void {
    row.querySelectorAll('.extra-cell').forEach(cell => cell.remove());
    
    const baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    
    columnConfig.forEach(col => {
        if (!baseColumns.includes(col.key) && col.visible !== false) {
            const cell = document.createElement('td');
            cell.className = 'extra-cell';
            cell.setAttribute('data-column', col.key);
            
            let value = getTaskColumnValue(task, col.key);
            cell.textContent = value;
            cell.style.display = col.visible !== false ? '' : 'none';
            
            row.appendChild(cell);
        }
    });
}

function applyVisibilityForMainList(mainList: any): void {
    if (!mainList || !mainList.tableElement) return;
    
    const visibleColumns = columnConfig.filter(col => col.visible !== false).map(col => col.key);
    const baseIndices: any = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    
    const headerRow = mainList.tableElement.querySelector('thead tr');
    if (headerRow) {
        Array.from(headerRow.children).forEach((th, idx) => {
            const colKey = th.getAttribute('data-column');
            if (colKey) {
                (th as HTMLElement).style.display = visibleColumns.includes(colKey) ? '' : 'none';
            } else {
                const baseKey = Object.keys(baseIndices)[idx];
                if (baseKey) {
                    (th as HTMLElement).style.display = visibleColumns.includes(baseKey) ? '' : 'none';
                }
            }
        });
    }
    
    const tbody = mainList.tbody;
    if (tbody) {
        Array.from(tbody.querySelectorAll('.task-row, .subtask-row')).forEach(row => {
            Array.from(row.children).forEach((cell, idx) => {
                if (idx < 9) {
                    const baseKey = Object.keys(baseIndices)[idx];
                    if (baseKey) {
                        (cell as HTMLElement).style.display = visibleColumns.includes(baseKey) ? '' : 'none';
                    }
                }
            });
            
            row.querySelectorAll('.extra-cell').forEach(cell => {
                const colKey = cell.getAttribute('data-column');
                if (colKey) {
                    (cell as HTMLElement).style.display = visibleColumns.includes(colKey) ? '' : 'none';
                }
            });
        });
        
        const sublistRows = tbody.querySelectorAll('.sub-list-row td');
        sublistRows.forEach(td => {
            td.colSpan = visibleColumns.length;
        });
    }
}

function createTaskRow(task: any, subList: any): void {
    const mainList = mainLists.find(m => m.id === subList.mainListId);
    if (!mainList || !mainList.tbody) return;
    
    const tbody = mainList.tbody;
    
    let formattedDueDate = 'Set due date';
    let daysText = '0';
    let daysClass = 'skystemtaskmaster-days-positive';
    
    if (task.dueDate) {
        const date = new Date(task.dueDate);
        formattedDueDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const today = new Date();
        const due = new Date(task.dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
            daysText = '+' + diffDays;
        } else {
            daysText = diffDays.toString();
            daysClass = 'skystemtaskmaster-days-negative';
        }
    }
    
    const row = document.createElement('tr');
    row.className = 'task-row';
    const isRecurring = task.recurrenceType && task.recurrenceType !== 'None';
    if (isRecurring) {
        row.classList.add('recurring-task');
    } else {
        row.classList.add('non-recurring-task');
    }
    
    row.setAttribute('data-task-id', task.id);
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-recurrence-type', task.recurrenceType || 'None');
    
    let rowHTML = `
        <td>
            <div class="skystemtaskmaster-task-name task-name-with-padding">
                <input type="checkbox" class="task-checkbox">
                <span>${escapeHtml(task.name)}</span>
            </div>
        </td>
        <td><span class="task-acc">${task.acc}</span></td>
        <td class="tdoc-cell">${task.tdoc}</td>
        <td class="skystemtaskmaster-editable due-date">${formattedDueDate}</td>
        <td><span class="skystemtaskmaster-status-badge skystemtaskmaster-status-not-started">${task.status}</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${task.owner.toLowerCase()}">${task.owner}</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${task.reviewer.toLowerCase()}">${task.reviewer}</span></td>
        <td class="cdoc-cell">0</td>
        <td class="days-cell ${daysClass}">${daysText}</td>
    `;
    
    row.innerHTML = rowHTML;
    task.row = row;
    
    let insertAfter = subList.row;
    if (insertAfter && insertAfter.nextSibling) {
        tbody.insertBefore(row, insertAfter.nextSibling);
    } else {
        tbody.appendChild(row);
    }
    
    taskDocuments.set(row, []);
    taskTDocDocuments.set(row, []);
    
    addTaskEventListeners(task);
    
    setTimeout(() => {
        addExtraColumnsForRow(row, task);
        applyVisibilityForMainList(mainList);
    }, 100);
}

function addRecurrenceStyles(): void {
    if (document.getElementById('recurrence-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'recurrence-styles';
    link.rel = 'stylesheet';
    link.href = 'recurrence-styles.css';
    document.head.appendChild(link);
}

function toggleSubList(subList: any, mainList: any): void {
    subList.isExpanded = !subList.isExpanded;
    
    const icon = subList.row.querySelector('.collapse-sublist-icon i');
    if (icon) {
        icon.className = subList.isExpanded ? 'fas fa-angle-down' : 'fas fa-angle-right';
    }
    
    const tbody = mainList.tbody;
    if (tbody) {
        let nextRow = subList.row.nextSibling;
        while (nextRow && nextRow.classList && !nextRow.classList.contains('sub-list-row')) {
            if (nextRow.classList && nextRow.classList.contains('task-row')) {
                (nextRow as HTMLElement).style.display = subList.isExpanded ? '' : 'none';
            }
            nextRow = nextRow.nextSibling;
        }
    }
}

function createNewTask(taskName: string, acc: string, tdoc: string, owner: string, reviewer: string, dueDate: string = ''): void {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    const subtaskHeader = document.querySelector('.skystemtaskmaster-subtask-header');
    
    let formattedDueDate = 'Set due date';
    if (dueDate) {
        const date = new Date(dueDate);
        formattedDueDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    let daysDiff = 0;
    let daysClass = 'skystemtaskmaster-days-positive';
    let daysText = '+0';
    
    if (dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0) {
            daysText = '+' + daysDiff;
        } else {
            daysText = daysDiff.toString();
            daysClass = 'skystemtaskmaster-days-negative';
        }
    }
    
    const newRow = document.createElement('tr');
    newRow.className = 'task-row';
    newRow.setAttribute('data-task-id', String(tasks.length + 1));
    
    newRow.innerHTML = `
        <td>
            <div class="skystemtaskmaster-task-name">
                <input type="checkbox" class="task-checkbox">
                <span>${taskName}</span>
            </div>
        </td>
        <td><span class="task-acc">${acc}</span></td>
        <td class="tdoc-cell">${tdoc}</td>
        <td class="skystemtaskmaster-editable due-date" contenteditable="true">${formattedDueDate}</td>
        <td><span class="skystemtaskmaster-status-badge skystemtaskmaster-status-not-started">Not Started</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${owner.toLowerCase()}">${owner}</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${reviewer.toLowerCase()}">${reviewer}</span></td>
        <td class="cdoc-cell">0</td>
        <td class="days-cell ${daysClass}">${daysText}</td>
    `;
    
    if (subtaskHeader) {
        tbody.insertBefore(newRow, subtaskHeader);
    } else {
        tbody.appendChild(newRow);
    }
    
    taskDocuments.set(newRow, []);
    taskTDocDocuments.set(newRow, []);
    
    const checkbox = newRow.querySelector('.task-checkbox') as HTMLInputElement;
    const statusBadge = newRow.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
    const dueDateCell = newRow.cells[3];
    const daysCell = newRow.cells[8];
    const taskNameCell = newRow.cells[0];
    
    if (checkbox && statusBadge && dueDateCell && daysCell && taskNameCell) {
        const newTask = {
            row: newRow,
            checkbox,
            statusBadge,
            dueDateCell,
            daysCell,
            taskNameCell
        };
        
        tasks.push(newTask);
        
        const statusCell = statusBadge.parentElement;
        if (statusCell) {
            statusCell.style.cursor = 'pointer';
            statusCell.title = 'Click to change status';
            statusCell.addEventListener('click', (e) => {
                e.stopPropagation();
                showStatusChangeModal(newTask);
            });
        }
        
        const ownerCell = newRow.cells[5];
        const reviewerCell = newRow.cells[6];
        if (ownerCell) makeCellClickable(ownerCell, 'owner', newTask);
        if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', newTask);
        
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                statusBadge.innerText = "Completed";
                statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-completed";
            } else {
                statusBadge.innerText = "Not Started";
                statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-not-started";
            }
            updateCounts();
        });
        
        dueDateCell.addEventListener('blur', () => calculateDays());
        
        setTimeout(() => addCommentIcons(), 100);
        makeRowDraggable(newRow, 'task');
        
        setTimeout(() => {
            taskAccounts.set(newRow, []);
            addAccountColumnToTasks();
        }, 100);
    }
    
    const editableCells = [newRow.cells[1], newRow.cells[3], newRow.cells[7]];
    editableCells.forEach(cell => {
        if (cell) {
            cell.classList.add('skystemtaskmaster-editable');
            cell.setAttribute('contenteditable', 'true');
        }
    });
    
    updateCounts();
    addDataCells();
    applyVisibility();
    
    setTimeout(() => {
        updateCDocColumn();
        if (typeof updateTDocColumn !== 'undefined') updateTDocColumn();
    }, 100);
    
    showNotification(`Task "${taskName}" added successfully`);
}

function createNewSubtask(): void {
    const subtaskName = (document.getElementById('subtaskName') as HTMLInputElement).value.trim();
    if (!subtaskName) {
        alert('Please enter a subtask name');
        return;
    }
    
    const owner = (document.getElementById('subtaskOwner') as HTMLSelectElement).value;
    const reviewer = (document.getElementById('subtaskReviewer') as HTMLSelectElement).value;
    const tdoc = (document.getElementById('subtaskTdoc') as HTMLInputElement).value;
    const subtaskHeader = document.querySelector('.skystemtaskmaster-subtask-header');
    
    if (subtaskHeader && subtaskHeader.parentNode) {
        const tbody = subtaskHeader.parentNode;
        const newRow = document.createElement('tr');
        newRow.className = 'subtask-row';
        const subtaskId = 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        newRow.setAttribute('data-subtask-id', subtaskId);
        
        const defaultStatus = "Not Started";
        const statusClass = 'skystemtaskmaster-status-not-started';
        
        newRow.innerHTML = `
            <td colspan="3">
                <div class="skystemtaskmaster-task-name">
                    <input type="checkbox" class="subtask-checkbox">
                    <span>${subtaskName}</span>
                </div>
            </td>
            <td></td>
            <td class="tdoc-cell">${tdoc}</td>
            <td>Set due date</td>
            <td><span class="skystemtaskmaster-status-badge ${statusClass}">${defaultStatus}</span></td>
            <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${owner.toLowerCase()}">${owner}</span></td>
            <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${reviewer.toLowerCase()}">${reviewer}</span></td>
        `;
        
        const dueDateCell = newRow.cells[3];
        if (dueDateCell) {
            dueDateCell.classList.add('skystemtaskmaster-editable');
            dueDateCell.setAttribute('contenteditable', 'true');
        }
        
        if (subtaskHeader.nextSibling) {
            tbody.insertBefore(newRow, subtaskHeader.nextSibling);
        } else {
            tbody.appendChild(newRow);
        }
        
        taskDocuments.set(newRow, []);
        taskTDocDocuments.set(newRow, []);
        
        const checkbox = newRow.querySelector('.subtask-checkbox') as HTMLInputElement;
        const statusBadge = newRow.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
        const taskNameCell = newRow.cells[0];
        
        if (checkbox && statusBadge && taskNameCell) {
            let ownerCell: HTMLElement | null = null;
            let reviewerCell: HTMLElement | null = null;
            
            for (let i = 0; i < newRow.cells.length; i++) {
                const cell = newRow.cells[i];
                const badge = cell.querySelector('.skystemtaskmaster-badge');
                if (badge) {
                    if (!ownerCell) ownerCell = cell;
                    else if (!reviewerCell) reviewerCell = cell;
                }
            }
            
            const newSubtask = {
                id: subtaskId, 
                row: newRow,
                checkbox,
                statusBadge,
                taskNameCell,
                ownerCell: ownerCell || newRow.cells[newRow.cells.length - 2],
                reviewerCell: reviewerCell || newRow.cells[newRow.cells.length - 1]
            };
            
            subtasks.push(newSubtask);
            
            const statusCell = statusBadge.parentElement;
            if (statusCell) {
                statusCell.style.cursor = 'pointer';
                statusCell.title = 'Click to change status';
                statusCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showSubtaskStatusChangeModal(newSubtask);
                });
            }
            
            if (ownerCell) makeCellClickable(ownerCell, 'owner', newSubtask);
            if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', newSubtask);
            
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    statusBadge.innerText = "Completed";
                    statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-completed";
                } else {
                    statusBadge.innerText = "Not Started";
                    statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-not-started";
                }
                updateCounts();
            });
            
            if (dueDateCell) {
                dueDateCell.addEventListener('blur', () => {
                    console.log('Due date updated for subtask');
                });
            }
            
            setTimeout(() => addCommentIcons(), 100);
            makeRowDraggable(newRow, 'subtask');
        }
        
        updateCounts();
        addDataCells();
        applyVisibility();
        
        setTimeout(() => {
            if (typeof updateCDocColumn !== 'undefined') updateCDocColumn();
            if (typeof updateTDocColumn !== 'undefined') updateTDocColumn();
        }, 100);
        
        const addSubtaskModal = document.getElementById('addSubtaskModal');
        if (addSubtaskModal) addSubtaskModal.style.display = 'none';
        
        const subtaskNameInput = document.getElementById('subtaskName') as HTMLInputElement;
        if (subtaskNameInput) subtaskNameInput.value = '';
        const subtaskOwnerSelect = document.getElementById('subtaskOwner') as HTMLSelectElement;
        if (subtaskOwnerSelect) subtaskOwnerSelect.value = 'PK';
        const subtaskReviewerSelect = document.getElementById('subtaskReviewer') as HTMLSelectElement;
        if (subtaskReviewerSelect) subtaskReviewerSelect.value = 'SM';
        const subtaskTdocInput = document.getElementById('subtaskTdoc') as HTMLInputElement;
        if (subtaskTdocInput) subtaskTdocInput.value = '';
        
        showNotification(`Subtask "${subtaskName}" added successfully`);
        
        setTimeout(() => saveAllData(), 100);
    }
}

function initializeDragAndDrop(): void {
    console.log('Initializing Drag and Drop...');
    tasks.forEach((task: any) => {
        makeRowDraggable(task.row, 'task');
    });
    subtasks.forEach((subtask: any) => {
        makeRowDraggable(subtask.row, 'subtask');
    });
    const subtaskHeader = document.getElementById('subtaskHeader');
    if (subtaskHeader) {
    }
    addDragStyles();
}

function initializeThreeDotsMenu(): void {
    const threeDotsBtn = document.getElementById('threeDotsBtn');
    const dropdown = document.getElementById('threeDotsDropdown');
    
    if (!threeDotsBtn || !dropdown) return;
    
    threeDotsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', (e) => {
        if (!threeDotsBtn.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
            dropdown.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const format = (item as HTMLElement).dataset.format;
            if (format) handleDownload(format);
            dropdown.classList.remove('show');
        });
    });
    
    const filterOption = document.getElementById('dropdownFilter');
    if (filterOption) {
        filterOption.addEventListener('click', (e) => {
            e.stopPropagation();
            showFilterPanel();
            dropdown.classList.remove('show');
        });
    } else {
        const filterItem = Array.from(document.querySelectorAll('.dropdown-item')).find(
            item => item.textContent?.includes('Filter')
        );
        if (filterItem) {
            filterItem.addEventListener('click', (e) => {
                e.stopPropagation();
                showFilterPanel();
                dropdown.classList.remove('show');
            });
        }
    }
    
    document.getElementById('dropdownDelete')?.addEventListener('click', () => {
        deleteSelectedItems();
        dropdown.classList.remove('show');
    });
    
    document.getElementById('dropdownCustomGrid')?.addEventListener('click', () => {
        showCustomizeGridModal();
        dropdown.classList.remove('show');
    });
}

function handleDownload(format: string): void {
    switch(format) {
        case 'excel':
            downloadAsExcel();
            break;
        case 'csv':
            downloadAsCsv();
            break;
        case 'json':
            downloadAsJson();
            break;
        default:
            showNotification('Unknown format');
    }
}

function deleteSelectedItems(): void {
    let deleted = 0;
    
    for (let i = mainLists.length - 1; i >= 0; i--) {
        const mainList = mainLists[i];
        
        const outsideCheckbox = mainList.outsideCheckbox as HTMLInputElement;
        const insideCheckbox = mainList.insideCheckbox as HTMLInputElement;
        const isChecked = (outsideCheckbox && outsideCheckbox.checked) || (insideCheckbox && insideCheckbox.checked);
        
        if (isChecked) {
            console.log('Deleting main list:', mainList.name);
            
            mainList.subLists.forEach((subList: any) => {
                for (let j = tasks.length - 1; j >= 0; j--) {
                    if (tasks[j].subListId === subList.id) {
                        tasks[j].row?.remove();
                        tasks.splice(j, 1);
                        deleted++;
                    }
                }
                
                const subIndex = subLists.findIndex((s: any) => s.id === subList.id);
                if (subIndex !== -1) {
                    subLists.splice(subIndex, 1);
                    deleted++;
                }
            });
            
            if (mainList.tableContainer && mainList.tableContainer.parentElement) {
                const wrapper = mainList.tableContainer.parentElement;
                if (wrapper && wrapper.classList.contains('main-list-outer-wrapper')) {
                    wrapper.remove();
                    deleted++;
                } else if (mainList.tableContainer) {
                    mainList.tableContainer.remove();
                    deleted++;
                }
            }
            
            if (mainList.listHeading && mainList.listHeading.parentElement) {
                mainList.listHeading.remove();
            }
            
            mainLists.splice(i, 1);
            continue;
        }
    }
    
    for (let i = subLists.length - 1; i >= 0; i--) {
        const subList = subLists[i];
        const checkbox = subList.row?.querySelector('.sublist-checkbox') as HTMLInputElement;
        
        if (checkbox && checkbox.checked) {
            for (let j = tasks.length - 1; j >= 0; j--) {
                if (tasks[j].subListId === subList.id) {
                    tasks[j].row?.remove();
                    tasks.splice(j, 1);
                    deleted++;
                }
            }
            
            const mainList = mainLists.find(m => m.id === subList.mainListId);
            if (mainList) {
                const subIndex = mainList.subLists.findIndex((s: any) => s.id === subList.id);
                if (subIndex !== -1) mainList.subLists.splice(subIndex, 1);
            }
            
            subList.row?.remove();
            subLists.splice(i, 1);
            deleted++;
        }
    }
    
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        const checkbox = task.row.querySelector('.task-checkbox') as HTMLInputElement;
        
        if (checkbox && checkbox.checked) {
            const subList = subLists.find(s => s.id === task.subListId);
            if (subList) {
                const taskIndex = subList.tasks.findIndex((t: any) => t.id === task.id);
                if (taskIndex !== -1) subList.tasks.splice(taskIndex, 1);
            }
            
            task.row.remove();
            tasks.splice(i, 1);
            deleted++;
        }
    }
    
    for (let i = subtasks.length - 1; i >= 0; i--) {
        const subtask = subtasks[i];
        const checkbox = subtask.row.querySelector('.subtask-checkbox') as HTMLInputElement;
        
        if (checkbox && checkbox.checked) {
            subtask.row.remove();
            subtasks.splice(i, 1);
            deleted++;
        }
    }
    
    if (deleted > 0) {
        updateCounts();
        saveAllData();
        showNotification(`${deleted} item(s) deleted successfully`);
    } else {
        showNotification('No items selected');
    }
}

function downloadAsJson(): void {
    const table = document.getElementById('mainTable');
    if (!table) return;
    
    const data = [];
    const rows = table.querySelectorAll('tr');
    
    const headers = [];
    const headerRow = rows[0].querySelectorAll('th');
    headerRow.forEach(th => {
        if ((th as HTMLElement).style.display !== 'none') {
            headers.push(th.textContent?.trim() || '');
        }
    });
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        const rowData: any = {};
        
        let cellIndex = 0;
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if ((cell as HTMLElement).style.display !== 'none' && cellIndex < headers.length) {
                let value = cell.textContent?.trim() || '';
                value = value.replace(/[☑⬇]/g, '').trim();
                rowData[headers[cellIndex]] = value;
                cellIndex++;
            }
        }
        
        if (Object.keys(rowData).length > 0) {
            data.push(rowData);
        }
    }
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.json';
    a.click();
    
    showNotification('Downloaded as JSON');
}

function makeCellsEditable(row: HTMLTableRowElement): void {
    const cells = [row.cells[1], row.cells[3], row.cells[7]];
    cells.forEach(cell => {
        if (cell) {
            cell.classList.add('skystemtaskmaster-editable');
            cell.setAttribute('contenteditable', 'true');
        }
    });
}

function makeExistingTasksEditable(): void {
    tasks.forEach((task: any) => makeCellsEditable(task.row));
}

function showNotification(message: string, type: string = 'info'): void {
    let notification = document.querySelector('.skystemtaskmaster-notification') as HTMLElement;
    if (notification) notification.remove();

    notification = document.createElement('div');
    notification.className = 'skystemtaskmaster-notification notification-show';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-hide');

        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateCounts(): void {
    console.log('updateCounts called');
    
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    
    if (tasks && tasks.length > 0) {
        tasks.forEach((task: any, index: number) => {
            if (task && task.statusBadge) {
                const statusText = task.statusBadge.innerText.trim();
                console.log(`Task ${index} status:`, statusText);
                
                if (statusText === "Completed" || statusText === "✅ Completed") completed++;
                else if (statusText === "In Progress" || statusText === "⏳ In Progress") inProgress++;
                else if (statusText === "Not Started" || statusText === "⏹ Not Started") notStarted++;
            }
        });
    }
    
    if (completed === 0 && inProgress === 0 && notStarted === 0) {
        console.log('Checking DOM directly for status badges...');
        document.querySelectorAll('.skystemtaskmaster-status-badge').forEach(badge => {
            const statusText = badge.textContent?.trim() || '';
            if (statusText === "Completed" || statusText === "✅ Completed") completed++;
            else if (statusText === "In Progress" || statusText === "⏳ In Progress") inProgress++;
            else if (statusText === "Not Started" || statusText === "⏹ Not Started") notStarted++;
        });
    }
    
    console.log('Counts calculated - Completed:', completed, 'In Progress:', inProgress, 'Not Started:', notStarted);
    
    const completedEl = document.getElementById("completedCount");
    const inProgressEl = document.getElementById("inProgressCount");
    const notStartedEl = document.getElementById("notStartedCount");
    
    console.log('DOM elements found:', {
        completed: completedEl,
        inProgress: inProgressEl,
        notStarted: notStartedEl
    });
    
    if (completedEl) {
        completedEl.innerText = completed.toString();
        completedEl.classList.add('count-update-animation');
        setTimeout(() => completedEl.classList.remove('count-update-animation'), 200);
    }
    
    if (inProgressEl) {
        inProgressEl.innerText = inProgress.toString();
        inProgressEl.classList.add('count-update-animation');
        setTimeout(() => inProgressEl.classList.remove('count-update-animation'), 200);
    }
    
    if (notStartedEl) {
        notStartedEl.innerText = notStarted.toString();
        notStartedEl.classList.add('count-update-animation');
        setTimeout(() => notStartedEl.classList.remove('count-update-animation'), 200);
    }
}

function testStats(): void {
    const completed = document.getElementById("completedCount");
    const inProgress = document.getElementById("inProgressCount");
    const notStarted = document.getElementById("notStartedCount");
    
    console.log('Completed element:', completed);
    console.log('In Progress element:', inProgress);
    console.log('Not Started element:', notStarted);
    
    if (completed) completed.innerText = "5";
    if (inProgress) inProgress.innerText = "3";
    if (notStarted) notStarted.innerText = "2";
    
    console.log('Test values set!');
}

testStats();

function calculateDays(): void {
    const today = new Date();
    
    tasks.forEach((task: any) => {
        const dueText = task.dueDateCell.innerText;
        if (dueText === 'Set due date') return;
        
        const dueDate = new Date(dueText);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (!isNaN(diffDays)) {
            if (diffDays >= 0) {
                task.daysCell.innerText = "+" + diffDays;
                task.daysCell.className = "skystemtaskmaster-days-positive";
            } else {
                task.daysCell.innerText = diffDays.toString();
                task.daysCell.className = "skystemtaskmaster-days-negative";
            }
        }
    });
}

function initializeDeleteButton(): void {
    const buttons = document.querySelectorAll('.skystemtaskmaster-action-btn');
    buttons.forEach(button => {
        const text = button.textContent || '';
        if (text.indexOf('🗑') !== -1 || text.indexOf('Delete') !== -1) {
            button.addEventListener('click', () => {
                deleteSelectedItems();
            });
        }
    });
}

function showCustomizeGridModal(): void {
    let modal = document.getElementById('customizeGridModal') as HTMLDivElement;
    
    if (!modal) {
        modal = createGridModalHTML();
        document.body.appendChild(modal);
        attachGridEventListeners(modal);
    }
    syncCheckboxesToConfig();
    modal.style.display = 'block';
}

function createGridModalHTML(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'customizeGridModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content grid-modal-content">
            <span class="close">&times;</span>
            <h3 class="cdoc-header">Customize Grid Columns</h3>
            
            <div class="grid-config-container">
                <div class="grid-selection-layout" id="columnChecklist">
                    ${columnConfig.map(col => renderColumnCheckbox(col)).join('')}
                </div>
            </div>
            
            <div class="modal-footer">
                <button id="resetGridBtn" class="btn-secondary">Reset to Default</button>
                <button id="saveGridBtn" class="btn-primary">Save Changes</button>
            </div>
        </div>
    `;
    return modal;
}

function renderColumnCheckbox(col: any): string {
    const disabled = col.mandatory ? 'disabled' : '';
    const checked = col.visible ? 'checked' : '';
    const tag = !col.forSubtask ? '<span class="column-tag-small"> (tasks only)</span>' : '';
    
    return `
        <div class="column-option">
            <input type="checkbox" id="col_${col.key}" ${checked} ${disabled}>
            <label for="col_${col.key}">${col.label}${tag}</label>
        </div>
    `;
}

function attachGridEventListeners(modal: HTMLDivElement): void {
    const close = () => { modal.style.display = 'none'; };

    modal.querySelector('.close')?.addEventListener('click', close);
    
    document.getElementById('saveGridBtn')?.addEventListener('click', () => {
        columnConfig.forEach(col => {
            const checkbox = document.getElementById(`col_${col.key}`) as HTMLInputElement;
            if (checkbox && !col.mandatory) {
                col.visible = checkbox.checked;
            }
        });
        
        saveColumnVisibility();
        refreshGridUI(); 
        
        close();
        showNotification('Grid layout updated successfully!');
    });

    document.getElementById('resetGridBtn')?.addEventListener('click', () => {
        const defaults = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
        columnConfig.forEach(col => {
            col.visible = defaults.includes(col.key);
        });
        syncCheckboxesToConfig();
    });
}

function syncCheckboxesToConfig(): void {
    columnConfig.forEach(col => {
        const cb = document.getElementById(`col_${col.key}`) as HTMLInputElement;
        if (cb && !col.mandatory) cb.checked = col.visible;
    });
}

function refreshGridUI(): void {
    addExtraColumns();
    addDataCells();
    applyVisibility();
    updateSublistRowsColspan();
}

function addTDocStyles(): void {
    if (document.getElementById('tdoc-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'tdoc-styles';
    link.rel = 'stylesheet';
    link.href = 'tdoc-styles.css';
    document.head.appendChild(link);
}

function updateTDocColumn(): void {
    console.log('Updating TDoc column with Font Awesome icons...');
    
    addTDocStyles();
    
    function createTDocIcon(row: HTMLElement, docs: any[]): HTMLSpanElement {
        const iconContainer = document.createElement('span');
        iconContainer.className = 'tdoc-icon-container';
        if (docs.length > 0) {
            iconContainer.classList.add('has-docs');
        }
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-alt';
        icon.title = docs.length > 0 ? `${docs.length} document(s) attached` : 'Click to upload documents';
        
        iconContainer.appendChild(icon);
        
        if (docs.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'tdoc-badge';
            badge.textContent = docs.length.toString();
            iconContainer.appendChild(badge);
        } else {
            const plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle tdoc-plus-icon';
            iconContainer.appendChild(plusIcon);
        }
        
        iconContainer.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('TDoc icon clicked');
            showTDocDocumentManager(row);
        };
        
        return iconContainer;
    }
    
    tasks.forEach((task: any) => {
        if (!task.row) return;
        const tdocCell = task.row.cells[2];
        if (!tdocCell) return;
        
        tdocCell.innerHTML = '';
        const docs = taskTDocDocuments.get(task.row) || [];
        const iconContainer = createTDocIcon(task.row, docs);
        tdocCell.appendChild(iconContainer);
    });
    
    subtasks.forEach((subtask: any) => {
        if (!subtask.row) return;
        const tdocCell = subtask.row.cells[2];
        if (!tdocCell) return;
        
        tdocCell.innerHTML = '';
        const docs = taskTDocDocuments.get(subtask.row) || [];
        const iconContainer = createTDocIcon(subtask.row, docs);
        tdocCell.appendChild(iconContainer);
    });
}

function addDocumentStyles(): void {
    if (document.getElementById('document-icon-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'document-icon-styles';
    link.rel = 'stylesheet';
    link.href = 'document-styles.css';
    document.head.appendChild(link);
}

function showTDocDocumentManager(taskRow: HTMLElement): void {
    const docs = taskTDocDocuments.get(taskRow) || [];
    let modal = document.getElementById('tdocDocumentManagerModal') as HTMLDivElement;

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tdocDocumentManagerModal';
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-content tdoc-modal">
                <span class="close">&times;</span>

                <h3 class="tdoc-title">📄 TDoc Document Manager</h3>

                <div class="tdoc-upload-section">
                    <h4 class="tdoc-section-title">Upload New Documents</h4>

                    <div id="tdocDropArea" class="tdoc-drop-area">
                        <div class="tdoc-drop-icon">
                            <i class="fa-solid fa-folder-open"></i>
                        </div>
                        <div class="tdoc-drop-text">Drag files here or</div>

                        <button id="tdocBrowseFileBtn" class="btn-primary-small">
                            Browse
                        </button>

                        <input type="file" id="tdocFileInput" class="hidden" multiple>
                    </div>

                    <div id="tdocSelectedFilesList" class="tdoc-selected-files hidden">
                        <div class="tdoc-selected-title">Selected Files:</div>
                        <div id="tdocFilesContainer"></div>
                    </div>

                    <div class="tdoc-upload-actions">
                        <button id="tdocUploadSelectedBtn" class="btn-upload hidden">
                            Upload Files
                        </button>
                    </div>
                </div>

                <div>
                    <h4 class="tdoc-section-title">
                        Attached Documents 
                        (<span id="tdocDocCount">${docs.length}</span>)
                    </h4>

                    <div id="tdocDocumentsListContainer" class="tdoc-doc-list"></div>
                </div>

                <div class="tdoc-footer">
                    <button id="tdocCloseManagerBtn" class="btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.getElementById('tdocCloseManagerBtn')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    modal.setAttribute('data-current-task-row', taskRow.id || Math.random().toString(36));
    (window as any).currentTDocTaskRow = taskRow;

    const listContainer = document.getElementById('tdocDocumentsListContainer');
    if (listContainer) {
        listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
    }

    const countSpan = document.getElementById('tdocDocCount');
    if (countSpan) {
        countSpan.textContent = docs.length.toString();
    }

    setupTDocUploadHandlers(modal, taskRow);
    modal.style.display = 'block';
}

function renderTDocDocumentsList(docs: any[], taskRow: HTMLElement): string {
    if (docs.length === 0) {
        return renderTDocEmptyState();
    }
    
    return `
        <table class="tdoc-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Upload Date</th>
                    <th class="actions-cell">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${docs.map((doc, index) => renderTDocRow(doc, index)).join('')}
            </tbody>
        </table>
    `;
}

function renderTDocRow(doc: any, index: number): string {
    const fileSize = (doc.size / 1024).toFixed(1);
    const dateStr = doc.uploadDate.toLocaleDateString();
    const timeStr = doc.uploadDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    return `
        <tr data-tdoc-doc-index="${index}">
            <td>
                <div class="tdoc-file-info">
                    <span class="tdoc-file-icon">📄</span>
                    <span class="tdoc-file-name">${doc.name}</span>
                </div>
            </td>

            <td>${fileSize} KB</td>

            <td>
                ${dateStr}
                <span class="tdoc-time">${timeStr}</span>
            </td>

            <td class="tdoc-actions-cell">
                <button class="tdoc-action-btn tdoc-view-btn tdoc-view-doc-btn" data-index="${index}" title="View">👁️</button>
                <button class="tdoc-action-btn tdoc-delete-btn tdoc-delete-doc-btn" data-index="${index}" title="Delete">🗑</button>
            </td>
        </tr>
    `;
}

function renderTDocEmptyState(): string {
    return `
        <div class="tdoc-empty-state">
            <div class="tdoc-empty-icon">📄</div>
            <div>No documents attached</div>
            <div class="tdoc-empty-subtext">Click upload area above to add documents</div>
        </div>
    `;
}

function setupTDocUploadHandlers(modal: HTMLDivElement, taskRow: HTMLElement): void {
    const dropArea = document.getElementById('tdocDropArea');
    const fileInput = document.getElementById('tdocFileInput') as HTMLInputElement;
    const filesContainer = document.getElementById('tdocFilesContainer');
    const selectedFilesList = document.getElementById('tdocSelectedFilesList');
    const uploadBtn = document.getElementById('tdocUploadSelectedBtn');
    const browseBtn = document.getElementById('tdocBrowseFileBtn');
    
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;
    
    let selectedFiles: File[] = [];
    
    browseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(fileInput.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-active');
    });
    
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-active');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-active');
        const files = Array.from(e.dataTransfer?.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    function updateSelectedFilesList(): void {
        if (selectedFiles.length === 0) {
            (selectedFilesList as HTMLElement).style.display = 'none';
            (uploadBtn as HTMLElement).style.display = 'none';
            return;
        }
        
        (selectedFilesList as HTMLElement).style.display = 'block';
        (uploadBtn as HTMLElement).style.display = 'inline-block';
        
        filesContainer.innerHTML = selectedFiles.map((file, index) => `
            <div class="file-item">
                <span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button class="remove-file" data-index="${index}">✕</button>
            </div>
        `).join('');
        
        filesContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
                selectedFiles.splice(index, 1);
                updateSelectedFilesList();
                fileInput.value = '';
            });
        });
    }
    
    uploadBtn.addEventListener('click', () => {
        if (selectedFiles.length === 0) {
            alert('Please select files to upload');
            return;
        }
        
        const currentTaskRow = (window as any).currentTDocTaskRow || taskRow;
        if (!currentTaskRow) {
            alert('Error: Task not found');
            return;
        }
        
        // Get or generate ID
        const taskId = currentTaskRow.dataset.taskId || currentTaskRow.dataset.subtaskId;
        if (!taskId) {
            const newId = currentTaskRow.classList.contains('task-row') ? 
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) :
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            if (currentTaskRow.classList.contains('task-row')) {
                currentTaskRow.dataset.taskId = newId;
                const task = tasks.find(t => t.row === currentTaskRow);
                if (task) task.id = newId;
            } else {
                currentTaskRow.dataset.subtaskId = newId;
                const subtask = subtasks.find(s => s.row === currentTaskRow);
                if (subtask) subtask.id = newId;
            }
        }
        
        const docs = selectedFiles.map(file => ({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date()
        }));
        
        console.log('Uploading TDoc documents:', docs.length, 'to row:', currentTaskRow);
        
        const existingDocs = taskTDocDocuments.get(currentTaskRow) || [];
        taskTDocDocuments.set(currentTaskRow, [...existingDocs, ...docs]);
        
        updateTDocColumn();
        
        selectedFiles = [];
        updateSelectedFilesList();
        fileInput.value = '';
        
        const listContainer = document.getElementById('tdocDocumentsListContainer');
        if (listContainer) {
            listContainer.innerHTML = renderTDocDocumentsList(taskTDocDocuments.get(currentTaskRow) || [], currentTaskRow);
            attachTDocDocumentEventListeners(currentTaskRow);
        }
        
        const countSpan = document.getElementById('tdocDocCount');
        if (countSpan) countSpan.textContent = (taskTDocDocuments.get(currentTaskRow) || []).length.toString();
        
        showNotification(`${docs.length} file(s) uploaded successfully`);
        
        setTimeout(() => {
            console.log('Auto-saving after TDoc upload...');
            saveAllData();
        }, 100);
    });
}

function attachTDocDocumentEventListeners(taskRow: HTMLElement): void {
    document.querySelectorAll('.tdoc-view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((e.target as HTMLElement).dataset.index || '0');
            const docs = taskTDocDocuments.get(taskRow) || [];
            if (docs[index]) previewDocument(docs[index]);
        });
    });
    
    document.querySelectorAll('.tdoc-delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((e.target as HTMLElement).dataset.index || '0');
            showTDocDeleteConfirmation(taskRow, index);
        });
    });
}

function showTDocDeleteConfirmation(taskRow: HTMLElement, index: number): void {
    const docs = taskTDocDocuments.get(taskRow) || [];
    const doc = docs[index];
    if (!doc) return;

    let confirmModal = document.getElementById('tdocDeleteConfirmModal') as HTMLDivElement;

    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'tdocDeleteConfirmModal';
        confirmModal.className = 'modal';

        confirmModal.innerHTML = `
            <div class="modal-content modal-small">
                <span class="close">&times;</span>

                <h3 class="delete-title">Confirm Delete</h3>

                <div class="delete-body">
                    <div class="delete-icon">⚠️</div>
                    <p class="delete-text">Are you sure you want to delete this document?</p>
                    <p class="delete-doc-name" id="tdocDocNameDisplay"></p>
                </div>

                <div class="delete-actions">
                    <button id="tdocCancelDeleteBtn" class="btn-cancel">Cancel</button>
                    <button id="tdocConfirmDeleteBtn" class="btn-delete">Delete</button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmModal);

        // Close button
        confirmModal.querySelector('.close')?.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });

        // Cancel button
        document.getElementById('tdocCancelDeleteBtn')?.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });

        // Confirm delete
        document.getElementById('tdocConfirmDeleteBtn')?.addEventListener('click', () => {
            const row = (window as any).currentTDocDeleteTaskRow;
            const idx = (window as any).currentTDocDeleteIndex;

            if (row && idx !== undefined) {
                deleteTDocDocument(row, idx);
            }

            confirmModal.style.display = 'none';
        });
    }

    const docNameDisplay = document.getElementById('tdocDocNameDisplay');
    if (docNameDisplay) {
        docNameDisplay.textContent = `"${doc.name}"`;
    }

    (window as any).currentTDocDeleteTaskRow = taskRow;
    (window as any).currentTDocDeleteIndex = index;

    confirmModal.style.display = 'block';
}

function deleteTDocDocument(taskRow: HTMLElement, index: number): void {
    const docs = taskTDocDocuments.get(taskRow) || [];
    if (index >= 0 && index < docs.length) {
        const docName = docs[index].name;
        docs.splice(index, 1);
        
        if (docs.length === 0) {
            taskTDocDocuments.delete(taskRow);
        } else {
            taskTDocDocuments.set(taskRow, docs);
        }
        
        updateTDocColumn();
        
        const managerModal = document.getElementById('tdocDocumentManagerModal');
        if (managerModal && managerModal.style.display === 'block') {
            const listContainer = document.getElementById('tdocDocumentsListContainer');
            if (listContainer) {
                listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
                attachTDocDocumentEventListeners(taskRow);
            }
            
            const header = managerModal.querySelector('h4');
            if (header) header.innerHTML = `Attached Documents (${docs.length})`;
        }
        
        showNotification(`Document "${docName}" deleted successfully`);
    }
}

function initializeTDocManager(): void {
    addTDocStyles();
    updateTDocColumn();
}

function initializeDownloadButton(): void {
    const downloadBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return btn.textContent?.indexOf('Download') !== -1 || btn.innerHTML.indexOf('download') !== -1;
    });
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', showDownloadOptions);
    }
}

function showDownloadOptions(): void {
    let downloadModal = document.getElementById('downloadModal') as HTMLDivElement;
    
    if (!downloadModal) {
        downloadModal = createDownloadModalHTML();
        document.body.appendChild(downloadModal);
        attachDownloadEventListeners(downloadModal);
    }
    
    downloadModal.style.display = 'block';
}

function createDownloadModalHTML(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'downloadModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content modal-download">
            <span class="close">&times;</span>
            <h3 class="cdoc-header">Download As</h3>
            
            <div class="download-button-list">
                <button id="downloadExcelBtn" class="btn-download btn-excel">
                    <i class="fas fa-file-excel"></i> Excel (XLSX)
                </button>
                <button id="downloadCsvBtn" class="btn-download btn-csv">
                    <i class="fas fa-file-csv"></i> CSV (Flat File)
                </button>
                <button id="downloadJsonBtn" class="btn-download btn-json">
                    <i class="fas fa-code"></i> JSON (Raw Data)
                </button>
            </div>
        </div>
    `;
    return modal;
}

function attachDownloadEventListeners(modal: HTMLDivElement): void {
    const close = () => { modal.style.display = 'none'; };

    modal.querySelector('.close')?.addEventListener('click', close);
    window.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    const executeAction = (actionFn: any) => {
        if (typeof actionFn === 'function') actionFn();
        close();
    };

    document.getElementById('downloadExcelBtn')?.addEventListener('click', () => executeAction(downloadAsExcel));
    document.getElementById('downloadCsvBtn')?.addEventListener('click', () => executeAction(downloadAsCsv));
    document.getElementById('downloadJsonBtn')?.addEventListener('click', () => executeAction(downloadAsJson));
}

function downloadAsExcel(): void {
    const table = document.getElementById('mainTable');
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('th, td');
        const rowData = [];
        
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j] as HTMLElement;
            if (cell.style.display === 'none') continue;
            let text = cell.textContent?.trim() || '';
            text = text.replace(/[☑⬇]/g, '').trim();
            rowData.push('"' + text + '"');
        }
        
        if (rowData.length > 0) csv.push(rowData.join(','));
    }
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.csv';
    a.click();
    showNotification('Downloaded as Excel format');
}

function downloadAsCsv(): void {
    downloadAsExcel();
    showNotification('Downloaded as CSV');
}

function initializeFilterButton(): void {
    const filterBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return (btn.textContent && btn.textContent.indexOf('Filter') !== -1) || 
               (btn.innerHTML && btn.innerHTML.indexOf('filter') !== -1);
    });
    
    if (filterBtn) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showFilterPanel();
        });
    } else {
        const filterOption = document.getElementById('dropdownFilter');
        if (filterOption) {
            filterOption.addEventListener('click', (e) => {
                e.stopPropagation();
                showFilterPanel();
            });
        }
    }
}

let currentFilters: any = {
    status: 'all',
    owner: 'all',
    reviewer: 'all',
    dueDate: 'all'
};

function showFilterPanel(): void {
    const existingModal = document.getElementById('filterModal');
    if (existingModal) existingModal.remove();
    
    const filterModal = createFilterModalHTML();
    document.body.appendChild(filterModal);
    syncModalToState();
    attachFilterEvents(filterModal);
    filterModal.style.display = 'block';
}

function createFilterModalHTML(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'filterModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content filter-modal-content">
            <span class="close">&times;</span>
            <h3 class="cdoc-header"><i class="fas fa-filter"></i> Filter Tasks</h3>
            
            <div class="sort-body">
                ${renderFilterSelect('Status', 'filterStatus', [
                    'all', 'Not Started', 'In Progress', 'Completed', 'Review', 'Approved', 'Rejected', 'Hold', 'Overdue'
                ])}
                
                ${renderFilterSelect('Task Owner', 'filterOwner', ['all', 'PK', 'SM', 'MP', 'PP', 'JS', 'EW', 'DB'])}
                
                ${renderFilterSelect('Due Date', 'filterDueDate', ['all', 'overdue', 'today', 'week', 'month', 'future'])}

                <div class="form-group">
                    <label class="form-label">Recurrence Type</label>
                    <select id="filterRecurrence" class="sort-select">
                        <option value="all">All</option>
                        <option value="none">Non-Recurring (None)</option>
                        <option value="recurring">Recurring (All Types)</option>
                        <option value="Every Period">Every Period</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annual">Annual</option>
                    </select>
                </div>

                <div class="filter-options-container">
                    <label class="filter-checkbox-group">
                        <input type="checkbox" id="hideEmptyLists">
                        <span>Hide empty lists/sublists</span>
                    </label>
                    <label class="filter-checkbox-group">
                        <input type="checkbox" id="showTaskCount">
                        <span>Show filtered task count in lists</span>
                    </label>
                </div>
            </div>
            
            <div class="modal-footer">
                <button id="clearFilterBtn" class="btn-secondary">🗑 Clear All</button>
                <button id="applyFilterBtn" class="btn-primary">Apply Filter</button>
            </div>
        </div>
    `;
    return modal;
}

function syncModalToState(): void {
    const statusSelect = document.getElementById('filterStatus') as HTMLSelectElement;
    if (statusSelect) statusSelect.value = currentFilters.status;
    const ownerSelect = document.getElementById('filterOwner') as HTMLSelectElement;
    if (ownerSelect) ownerSelect.value = currentFilters.owner;
    const dueDateSelect = document.getElementById('filterDueDate') as HTMLSelectElement;
    if (dueDateSelect) dueDateSelect.value = currentFilters.dueDate;
    const recurrenceSelect = document.getElementById('filterRecurrence') as HTMLSelectElement;
    if (recurrenceSelect) recurrenceSelect.value = currentFilters.recurrence || 'all';
    const hideEmptyListsCheckbox = document.getElementById('hideEmptyLists') as HTMLInputElement;
    if (hideEmptyListsCheckbox) hideEmptyListsCheckbox.checked = currentFilters.hideEmptyLists;
    const showTaskCountCheckbox = document.getElementById('showTaskCount') as HTMLInputElement;
    if (showTaskCountCheckbox) showTaskCountCheckbox.checked = currentFilters.showTaskCount;
}

function attachFilterEvents(modal: HTMLDivElement): void {
    const close = () => modal.remove();

    modal.querySelector('.close')?.addEventListener('click', close);
    window.onclick = (e) => { if (e.target === modal) close(); };

    document.getElementById('applyFilterBtn')?.addEventListener('click', () => {
        currentFilters = {
            status: (document.getElementById('filterStatus') as HTMLSelectElement).value,
            owner: (document.getElementById('filterOwner') as HTMLSelectElement).value,
            dueDate: (document.getElementById('filterDueDate') as HTMLSelectElement).value,
            recurrence: (document.getElementById('filterRecurrence') as HTMLSelectElement).value,
            hideEmptyLists: (document.getElementById('hideEmptyLists') as HTMLInputElement).checked,
            showTaskCount: (document.getElementById('showTaskCount') as HTMLInputElement).checked
        };
        
        applyHierarchicalFilters();
        close();
        showNotification('Filters applied');
    });

    document.getElementById('clearFilterBtn')?.addEventListener('click', () => {
        currentFilters = Object.assign({}, defaultFilters); // Assuming you have a defaultFilters object
        clearAllFilters();
        close();
        showNotification('Filters cleared');
    });
}

function renderFilterSelect(label: string, id: string, options: string[]): string {
    return `
        <div class="form-group">
            <label class="form-label">${label}</label>
            <select id="${id}" class="sort-select">
                ${options.map(opt => `<option value="${opt}">${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`).join('')}
            </select>
        </div>
    `;
}

function applyHierarchicalFilters(): void {
    console.log('Applying hierarchical filters:', currentFilters);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    const taskMatches = new Map();
    
    tasks.forEach((task: any) => {
        let matches = true;
        
        if (currentFilters.status !== 'all') {
            const taskStatus = task.statusBadge?.innerText?.trim() || task.status || 'Not Started';
            if (taskStatus !== currentFilters.status) matches = false;
        }
        
        if (matches && currentFilters.owner !== 'all') {
            const ownerBadge = task.row.cells[5]?.querySelector('.skystemtaskmaster-badge');
            const ownerText = ownerBadge?.textContent?.trim() || task.taskOwner || task.owner || '';
            if (ownerText !== currentFilters.owner) matches = false;
        }
        
        if (matches && currentFilters.reviewer !== 'all') {
            const reviewerBadge = task.row.cells[6]?.querySelector('.skystemtaskmaster-badge');
            const reviewerText = reviewerBadge?.textContent?.trim() || task.reviewer || '';
            if (reviewerText !== currentFilters.reviewer) matches = false;
        }
        
        if (matches && currentFilters.dueDate !== 'all') {
            const dueText = task.dueDateCell?.innerText || task.dueDate || '';
            
            if (dueText !== 'Set due date' && dueText !== '') {
                try {
                    const dueDate = new Date(dueText);
                    dueDate.setHours(0, 0, 0, 0);
                    
                    if (currentFilters.dueDate === 'overdue') {
                        if (dueDate >= today) matches = false;
                    } else if (currentFilters.dueDate === 'today') {
                        if (dueDate.getTime() !== today.getTime()) matches = false;
                    } else if (currentFilters.dueDate === 'week') {
                        if (dueDate < today || dueDate > oneWeekLater) matches = false;
                    } else if (currentFilters.dueDate === 'month') {
                        if (dueDate < today || dueDate > oneMonthLater) matches = false;
                    } else if (currentFilters.dueDate === 'future') {
                        if (dueDate <= oneMonthLater) matches = false;
                    }
                } catch(e) {
                    console.log('Error parsing due date:', dueText);
                }
            } else if (currentFilters.dueDate !== 'all') {
                matches = false;
            }
        }
        
        if (matches && currentFilters.recurrence && currentFilters.recurrence !== 'all') {
            const recurrenceType = task.recurrenceType || 'None';
            
            if (currentFilters.recurrence === 'none') {
                if (recurrenceType !== 'None') matches = false;
            } else if (currentFilters.recurrence === 'recurring') {
                const recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
                if (!recurringOptions.includes(recurrenceType)) matches = false;
            } else {
                if (recurrenceType !== currentFilters.recurrence) matches = false;
            }
        }
        
        taskMatches.set(task.id, matches);
        
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach((subtask: any) => {
                const subtaskMatches = checkSubtaskMatches(subtask);
                taskMatches.set(subtask.id, subtaskMatches);
            });
        }
    });
    
    const visibleTasksCount = new Map(); 
    
    tasks.forEach((task: any) => {
        const matches = taskMatches.get(task.id) || false;
        task.row.style.display = matches ? '' : 'none';
        
        if (matches) {
            const sublistId = task.subListId;
            visibleTasksCount.set(sublistId, (visibleTasksCount.get(sublistId) || 0) + 1);
        }
    });
    
    subtasks.forEach((subtask: any) => {
        const matches = checkSubtaskMatches(subtask);
        subtask.row.style.display = matches ? '' : 'none';
        
        if (matches && subtask.sublistId) {
            visibleTasksCount.set(subtask.sublistId, (visibleTasksCount.get(subtask.sublistId) || 0) + 1);
        }
    });
    
    updateListVisibility(visibleTasksCount);
    
    if (currentFilters.showTaskCount) {
        updateListCountDisplays(visibleTasksCount);
    }
    
    let totalVisible = 0;
    tasks.forEach((task: any) => {
        if (task.row.style.display !== 'none') totalVisible++;
    });
    subtasks.forEach((subtask: any) => {
        if (subtask.row.style.display !== 'none') totalVisible++;
    });
    
    console.log(`Filter applied: ${totalVisible} items visible`);
}

function checkSubtaskMatches(subtask: any): boolean {
    let matches = true;
    
    if (currentFilters.status !== 'all') {
        const taskStatus = subtask.statusBadge?.innerText?.trim() || '';
        if (taskStatus !== currentFilters.status) matches = false;
    }
    
    if (matches && currentFilters.owner !== 'all') {
        const ownerBadge = subtask.ownerCell?.querySelector('.skystemtaskmaster-badge');
        const ownerText = ownerBadge?.textContent?.trim() || '';
        if (ownerText !== currentFilters.owner) matches = false;
    }
    
    if (matches && currentFilters.reviewer !== 'all') {
        const reviewerBadge = subtask.reviewerCell?.querySelector('.skystemtaskmaster-badge');
        const reviewerText = reviewerBadge?.textContent?.trim() || '';
        if (reviewerText !== currentFilters.reviewer) matches = false;
    }
    
    if (matches && currentFilters.dueDate !== 'all') {
        const dueDateCell = subtask.row.cells[3];
        if (dueDateCell) {
            const dueText = dueDateCell.innerText;
            if (dueText !== 'Set due date') {
                try {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dueDate = new Date(dueText);
                    dueDate.setHours(0, 0, 0, 0);
                    
                    if (currentFilters.dueDate === 'overdue' && dueDate >= today) matches = false;
                    else if (currentFilters.dueDate === 'today' && dueDate.getTime() !== today.getTime()) matches = false;
                    else if (currentFilters.dueDate === 'week') {
                        const oneWeekLater = new Date(today);
                        oneWeekLater.setDate(today.getDate() + 7);
                        if (dueDate < today || dueDate > oneWeekLater) matches = false;
                    }
                    else if (currentFilters.dueDate === 'month') {
                        const oneMonthLater = new Date(today);
                        oneMonthLater.setMonth(today.getMonth() + 1);
                        if (dueDate < today || dueDate > oneMonthLater) matches = false;
                    }
                    else if (currentFilters.dueDate === 'future') {
                        const oneMonthLater = new Date(today);
                        oneMonthLater.setMonth(today.getMonth() + 1);
                        if (dueDate <= oneMonthLater) matches = false;
                    }
                } catch(e) {
                    console.log('Error parsing subtask date:', dueText);
                }
            } else if (currentFilters.dueDate !== 'all') {
                matches = false;
            }
        }
    }
    
    return matches;
}

function updateListVisibility(visibleTasksCount: Map<any, any>): void {
    const sublistsWithVisibleTasks = new Set();
    const mainListsWithVisibleTasks = new Set();
    
    subLists.forEach((subList: any) => {
        const taskCount = visibleTasksCount.get(subList.id) || 0;
        const hasVisibleTasks = taskCount > 0;
        
        if (hasVisibleTasks) {
            sublistsWithVisibleTasks.add(subList.id);
            if (subList.mainListId) {
                mainListsWithVisibleTasks.add(subList.mainListId);
            }
        }
        
        if (currentFilters.hideEmptyLists && subList.row) {
            subList.row.style.display = hasVisibleTasks ? '' : 'none';
        } else if (subList.row) {
            subList.row.style.display = '';
        }
    });
    
    mainLists.forEach((mainList: any) => {
        const hasVisibleSublists = mainList.subLists.some((subList: any) => 
            sublistsWithVisibleTasks.has(subList.id)
        );
        
        if (currentFilters.hideEmptyLists && mainList.row) {
            mainList.row.style.display = hasVisibleSublists ? '' : 'none';
        } else if (mainList.row) {
            mainList.row.style.display = '';
        }
    });
}

function updateListCountDisplays(visibleTasksCount: Map<any, any>): void {
    subLists.forEach((subList: any) => {
        if (!subList.row) return;
        
        const count = visibleTasksCount.get(subList.id) || 0;
        const header = subList.row.querySelector('.sublist-header');
        
        if (header) {
            const label = `${count} task${count !== 1 ? 's' : ''}`;
            updateOrCreateBadge(header as HTMLElement, 'task-count-badge', count, label);
        }
    });

    mainLists.forEach((mainList: any) => {
        if (!mainList.row) return;
        const totalCount = mainList.subLists.reduce((sum: number, sub: any) => {
            return sum + (visibleTasksCount.get(sub.id) || 0);
        }, 0);

        const header = mainList.row.querySelector('.list-header');
        if (header) {
            const label = `${totalCount} total task${totalCount !== 1 ? 's' : ''}`;
            updateOrCreateBadge(header as HTMLElement, 'list-count-badge', totalCount, label);
        }
    });
}

function updateOrCreateBadge(container: HTMLElement, className: string, count: number, text: string): void {
    let badge = container.querySelector(`.${className}`) as HTMLElement;
    
    if (!badge) {
        badge = document.createElement('span');
        badge.className = className;
        container.appendChild(badge);
    }
    
    badge.textContent = text;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
}

function clearAllFilters(): void {
    currentFilters = {
        status: 'all',
        owner: 'all',
        reviewer: 'all',
        dueDate: 'all',
        recurrence: 'all',
        hideEmptyLists: false,
        showTaskCount: false
    };
    
    tasks.forEach((task: any) => {
        task.row.style.display = '';
    });
    
    subtasks.forEach((subtask: any) => {
        subtask.row.style.display = '';
    });
    
    mainLists.forEach((mainList: any) => {
        if (mainList.row) mainList.row.style.display = '';
    });
    
    subLists.forEach((subList: any) => {
        if (subList.row) subList.row.style.display = '';
    });
    
    document.querySelectorAll('.task-count-badge, .list-count-badge').forEach(badge => {
        badge.remove();
    });
    
    console.log('All filters cleared');
}

function initializeEnhancedFilterButton(): void {
    const filterBtn = document.querySelector('#threeDotsDropdown .dropdown-item') || 
                     Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
                        return (btn.textContent && btn.textContent.indexOf('Filter') !== -1) || 
                               (btn.innerHTML && btn.innerHTML.indexOf('filter') !== -1);
                     });
    
    if (filterBtn) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showFilterPanel();
        });
    } else {
        const filterOption = document.getElementById('dropdownFilter');
        if (filterOption) {
            filterOption.addEventListener('click', (e) => {
                e.stopPropagation();
                showFilterPanel();
            });
        }
    }
    
    console.log('Enhanced filter button initialized');
}

function initializeEnhancedFilter(): void {
    console.log('Initializing enhanced filter system...');
    addFilterStyles();
    initializeEnhancedFilterButton();
    
    (window as any).showFilterPanel = showFilterPanel;
}

document.addEventListener('DOMContentLoaded', () => {
    
    setTimeout(() => {
        initializeEnhancedFilter();
    }, 1000);
});

function applyFilters(): void {
    const statusFilter = (document.getElementById('filterStatus') as HTMLSelectElement)?.value || 'all';
    const ownerFilter = (document.getElementById('filterOwner') as HTMLSelectElement)?.value || 'all';
    const reviewerFilter = (document.getElementById('filterReviewer') as HTMLSelectElement)?.value || 'all';
    const dueDateFilter = (document.getElementById('filterDueDate') as HTMLSelectElement)?.value || 'all';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    let visibleCount = 0;
    tasks.forEach((task: any) => {
        let show = true;
        if (show && statusFilter !== 'all') {
            const taskStatus = task.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter) show = false;
        }
        if (show && ownerFilter !== 'all') {
            const ownerBadge = task.row.cells[5]?.querySelector('.skystemtaskmaster-badge');
            const ownerText = ownerBadge?.textContent?.trim() || '';
            if (ownerText !== ownerFilter) show = false;
        }
        if (show && reviewerFilter !== 'all') {
            const reviewerBadge = task.row.cells[6]?.querySelector('.skystemtaskmaster-badge');
            const reviewerText = reviewerBadge?.textContent?.trim() || '';
            if (reviewerText !== reviewerFilter) show = false;
        }
        if (show && dueDateFilter !== 'all') {
            const dueText = task.dueDateCell.innerText;
            if (dueText !== 'Set due date') {
                try {
                    const dueDate = new Date(dueText);
                    dueDate.setHours(0, 0, 0, 0);
                    
                    if (dueDateFilter === 'overdue' && dueDate >= today) show = false;
                    else if (dueDateFilter === 'today' && dueDate.getTime() !== today.getTime()) show = false;
                    else if (dueDateFilter === 'week' && (dueDate < today || dueDate > oneWeekLater)) show = false;
                    else if (dueDateFilter === 'month' && (dueDate < today || dueDate > oneMonthLater)) show = false;
                    else if (dueDateFilter === 'future' && dueDate <= oneMonthLater) show = false;
                } catch(e) {
                    console.log('Error parsing date:', dueText);
                }
            } else if (dueDateFilter !== 'all') {
                show = false;
            }
        }
        
        task.row.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });
    subtasks.forEach((subtask: any) => {
        let show = true;
        if (show && statusFilter !== 'all') {
            const taskStatus = subtask.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter) show = false;
        }
        if (show && ownerFilter !== 'all') {
            const ownerBadge = subtask.ownerCell?.querySelector('.skystemtaskmaster-badge');
            const ownerText = ownerBadge?.textContent?.trim() || '';
            if (ownerText !== ownerFilter) show = false;
        }
        if (show && reviewerFilter !== 'all') {
            const reviewerBadge = subtask.reviewerCell?.querySelector('.skystemtaskmaster-badge');
            const reviewerText = reviewerBadge?.textContent?.trim() || '';
            if (reviewerText !== reviewerFilter) show = false;
        }
        
        if (show && dueDateFilter !== 'all') {
            const dueDateCell = subtask.row.cells[3];
            if (dueDateCell) {
                const dueText = dueDateCell.innerText;
                if (dueText !== 'Set due date') {
                    try {
                        const dueDate = new Date(dueText);
                        dueDate.setHours(0, 0, 0, 0);
                        
                        if (dueDateFilter === 'overdue' && dueDate >= today) show = false;
                        else if (dueDateFilter === 'today' && dueDate.getTime() !== today.getTime()) show = false;
                        else if (dueDateFilter === 'week' && (dueDate < today || dueDate > oneWeekLater)) show = false;
                        else if (dueDateFilter === 'month' && (dueDate < today || dueDate > oneMonthLater)) show = false;
                        else if (dueDateFilter === 'future' && dueDate <= oneMonthLater) show = false;
                    } catch(e) {
                        console.log('Error parsing subtask date:', dueText);
                    }
                } else if (dueDateFilter !== 'all') {
                    show = false;
                }
            }
        }
        
        subtask.row.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });
    
    console.log(`Filter applied: ${visibleCount} items visible`);
}

function clearFilters(): void {
    tasks.forEach((task: any) => {
        task.row.style.display = '';
    });
    subtasks.forEach((subtask: any) => {
        subtask.row.style.display = '';
    });
    console.log('Filters cleared');
}

function initializeTaskDropdown(): void {
    const taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown") as HTMLSelectElement;
    if (!taskDropdown) return;
    const newDropdown = taskDropdown.cloneNode(true) as HTMLSelectElement;
    taskDropdown.parentNode?.replaceChild(newDropdown, taskDropdown);
    
    newDropdown.addEventListener("change", (e) => {
        const filter = (e.target as HTMLSelectElement).value;
        const currentUser = 'PK'; 
        
        console.log('Dropdown filter changed to:', filter);
        tasks.forEach((task: any) => {
            if (task.row) task.row.style.display = '';
        });
        
        subtasks.forEach((subtask: any) => {
            if (subtask.row) subtask.row.style.display = '';
        });
        
        if (filter !== "all") {
            tasks.forEach((task: any) => {
                const ownerBadge = task.row.cells[5]?.querySelector('.skystemtaskmaster-badge');
                const reviewerBadge = task.row.cells[6]?.querySelector('.skystemtaskmaster-badge');
                const ownerText = ownerBadge?.textContent?.trim() || '';
                const reviewerText = reviewerBadge?.textContent?.trim() || '';
                
                let show = true;
                
                switch(filter) {
                    case "assigned-to-me":
                        show = (reviewerText === currentUser);
                        break;
                    case "self-assigned":
                        show = (ownerText === currentUser && reviewerText === currentUser);
                        break;
                    case "created-by-me":
                        show = (ownerText === currentUser);
                        break;
                    default:
                        show = true;
                }
                
                task.row.style.display = show ? '' : 'none';
            });
            
            subtasks.forEach((subtask: any) => {
                const ownerBadge = subtask.ownerCell?.querySelector('.skystemtaskmaster-badge');
                const reviewerBadge = subtask.reviewerCell?.querySelector('.skystemtaskmaster-badge');
                const ownerText = ownerBadge?.textContent?.trim() || '';
                const reviewerText = reviewerBadge?.textContent?.trim() || '';
                
                let show = true;
                
                switch(filter) {
                    case "assigned-to-me":
                        show = (reviewerText === currentUser);
                        break;
                    case "self-assigned":
                        show = (ownerText === currentUser && reviewerText === currentUser);
                        break;
                    case "created-by-me":
                        show = (ownerText === currentUser);
                        break;
                    default:
                        show = true;
                }
                
                subtask.row.style.display = show ? '' : 'none';
            });
        }
        let visibleTasks = 0;
        tasks.forEach((task: any) => {
            if (task.row.style.display !== 'none') visibleTasks++;
        });
        subtasks.forEach((subtask: any) => {
            if (subtask.row.style.display !== 'none') visibleTasks++;
        });
        
        showNotification(`Filter: ${filter.replace(/-/g, ' ')} - ${visibleTasks} items visible`);
    });
}

function initializeSortButton(): void {
    const sortBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return btn.textContent?.indexOf('Sort') !== -1 || btn.innerHTML.indexOf('sort') !== -1;
    });
    
    if (sortBtn) {
        sortBtn.addEventListener('click', showSortOptions);
    }
}

function showSortOptions(): void {
    let sortModal = document.getElementById('sortModal') as HTMLDivElement;
    if (!sortModal) {
        sortModal = createSortModalHTML();
        document.body.appendChild(sortModal);
        attachSortEventListeners(sortModal);
    }
    
    sortModal.style.display = 'block';
}

function createSortModalHTML(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'sortModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content modal-sort">
            <span class="close">&times;</span>
            <h3 class="cdoc-header">Sort Tasks</h3>
            
            <div class="sort-body">
                <div class="form-group">
                    <label class="form-label">Sort By</label>
                    <select id="sortBy" class="sort-select">
                        <option value="taskName">Task Name</option>
                        <option value="dueDate">Due Date</option>
                        <option value="status">Status</option>
                        <option value="owner">Owner</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="days">+/- Days</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Order</label>
                    <select id="sortOrder" class="sort-select">
                        <option value="asc">Ascending (A-Z)</option>
                        <option value="desc">Descending (Z-A)</option>
                    </select>
                </div>
            </div>
            
            <div class="modal-footer">
                <button id="applySortBtn" class="btn-primary">Apply Sort</button>
            </div>
        </div>
    `;
    return modal;
}

function attachSortEventListeners(modal: HTMLDivElement): void {
    const close = () => { modal.style.display = 'none'; };

    modal.querySelector('.close')?.addEventListener('click', close);
    window.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    document.getElementById('applySortBtn')?.addEventListener('click', () => {
        const sortBy = (document.getElementById('sortBy') as HTMLSelectElement).value;
        const sortOrder = (document.getElementById('sortOrder') as HTMLSelectElement).value;
        
        if (typeof applySort === 'function') {
            applySort(sortBy, sortOrder);
        }
        
        close();
    });
}

function applySort(sortBy: string, sortOrder: string): void {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const headerRows = allRows.filter(row => 
        row.classList.contains('main-list-row') || 
        row.classList.contains('sub-list-row') ||
        row.classList.contains('skystemtaskmaster-subtask-header')
    );
    const taskRows = allRows.filter(row => row.classList.contains('task-row'));
    const subtaskRows = allRows.filter(row => row.classList.contains('subtask-row'));
    const tasksBySublist: any = {};
    taskRows.forEach(row => {
        const sublistId = (row as HTMLElement).dataset.sublistId;
        if (!tasksBySublist[sublistId]) {
            tasksBySublist[sublistId] = [];
        }
        tasksBySublist[sublistId].push(row);
    });
    Object.keys(tasksBySublist).forEach(sublistId => {
        tasksBySublist[sublistId].sort((a: Element, b: Element) => {
            let aVal = getSortValue(a, sortBy);
            let bVal = getSortValue(b, sortBy);
            
            if (sortBy === 'dueDate' || sortBy === 'days') {
                aVal = parseSortValue(aVal, sortBy);
                bVal = parseSortValue(bVal, sortBy);
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            } else {
                return sortOrder === 'asc' 
                    ? aVal.localeCompare(bVal) 
                    : bVal.localeCompare(aVal);
            }
        });
    });
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    headerRows.forEach(row => tbody.appendChild(row));
    headerRows.forEach(headerRow => {
        if (headerRow.classList.contains('sub-list-row')) {
            const sublistId = (headerRow as HTMLElement).dataset.sublistId;
            const tasksForThisSublist = tasksBySublist[sublistId] || [];
            tasksForThisSublist.forEach(taskRow => tbody.appendChild(taskRow));
        }
    });
    const remainingTasks = taskRows.filter(row => {
        return !Array.from(tbody.children).includes(row);
    });
    remainingTasks.forEach(row => tbody.appendChild(row));
    subtaskRows.forEach(row => tbody.appendChild(row));
    showNotification(`Sorted by ${sortBy} (${sortOrder === 'asc' ? 'Ascending' : 'Descending'})`);
}

function toggleSort(columnKey: string, headerElement: HTMLElement): void {
    if (currentSort.column === columnKey) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnKey;
        currentSort.direction = 'asc';
    }
    updateSortIcons(headerElement);
    sortTableByColumnPreservingHierarchy(columnKey, currentSort.direction);
}

function sortTableByColumnPreservingHierarchy(columnKey: string, direction: string): void {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const mainListRows = allRows.filter(row => row.classList.contains('main-list-row'));
    const subListRows = allRows.filter(row => row.classList.contains('sub-list-row'));
    const taskRows = allRows.filter(row => row.classList.contains('task-row'));
    const subtaskHeader = allRows.find(row => row.classList.contains('skystemtaskmaster-subtask-header'));
    const subtaskRows = allRows.filter(row => row.classList.contains('subtask-row'));
    const tasksBySublist: any = {};
    taskRows.forEach(row => {
        const sublistId = (row as HTMLElement).dataset.sublistId;
        if (!tasksBySublist[sublistId]) {
            tasksBySublist[sublistId] = [];
        }
        tasksBySublist[sublistId].push(row);
    });
    
    Object.keys(tasksBySublist).forEach(sublistId => {
        tasksBySublist[sublistId].sort((a: Element, b: Element) => {
            const aVal = getCellValueForSort(a, columnKey);
            const bVal = getCellValueForSort(b, columnKey);
            return compareValues(aVal, bVal, direction);
        });
    });
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    mainListRows.forEach(mainListRow => {
        tbody.appendChild(mainListRow);
        
        const mainListId = (mainListRow as HTMLElement).dataset.listId;
        subListRows.forEach(subListRow => {
            if ((subListRow as HTMLElement).dataset.mainlistId === mainListId) {
                tbody.appendChild(subListRow);
                const sublistId = (subListRow as HTMLElement).dataset.sublistId;
                const tasksForSublist = tasksBySublist[sublistId] || [];
                tasksForSublist.forEach(taskRow => tbody.appendChild(taskRow));
            }
        });
    });
    subListRows.forEach(subListRow => {
        if (!tbody.contains(subListRow)) {
            tbody.appendChild(subListRow);
            const sublistId = (subListRow as HTMLElement).dataset.sublistId;
            const tasksForSublist = tasksBySublist[sublistId] || [];
            tasksForSublist.forEach(taskRow => tbody.appendChild(taskRow));
        }
    });
    taskRows.forEach(taskRow => {
        if (!tbody.contains(taskRow)) {
            tbody.appendChild(taskRow);
        }
    });
    if (subtaskHeader) tbody.appendChild(subtaskHeader);
    subtaskRows.forEach(row => tbody.appendChild(row));
    
    showNotification(`Sorted by ${columnKey} (${direction === 'asc' ? 'Ascending' : 'Descending'})`);
}

function getSortValue(row: Element, sortBy: string): string {
    switch (sortBy) {
        case 'taskName':
            return row.cells[0]?.querySelector('span')?.textContent?.trim() || '';
        case 'dueDate':
            return row.cells[3]?.textContent?.trim() || '';
        case 'status':
            return row.cells[4]?.querySelector('.skystemtaskmaster-status-badge')?.textContent?.trim() || '';
        case 'owner':
            return row.cells[5]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '';
        case 'reviewer':
            return row.cells[6]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '';
        case 'days':
            return row.cells[8]?.textContent?.trim() || '0';
        default:
            return '';
    }
}

function getSubtaskSortValue(row: Element, sortBy: string): string {
    switch (sortBy) {
        case 'taskName':
            return row.cells[0]?.querySelector('span')?.textContent?.trim() || '';
        case 'dueDate':
            return row.cells[3]?.textContent?.trim() || '';
        case 'status':
            return row.cells[4]?.querySelector('.skystemtaskmaster-status-badge')?.textContent?.trim() || '';
        case 'owner':
            return row.cells[5]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '';
        case 'reviewer':
            return row.cells[6]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '';
        default:
            return '';
    }
}

function parseSortValue(val: string, sortBy: string): number {
    if (sortBy === 'days') return parseInt(val.replace('+', '')) || 0;
    if (sortBy === 'dueDate') return new Date(val).getTime() || 0;
    return 0;
}

function addAccountColumnToTasks(): void {
    tasks.forEach((task: any) => {
        const accountCell = task.row.cells[1]; 
        if (accountCell) {
            renderAccountCell(task, accountCell);
        }
    });
}

function renderAccountCell(task: any, cell: HTMLTableCellElement): void {
    cell.innerHTML = '';
    
    const accountDisplay = document.createElement('div');
    accountDisplay.className = 'account-display';
    
    const taskId = task.id || task.row.dataset.taskId;
    const accounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];

    if (accounts.length > 0) {
        accounts.forEach((account: any) => {
            const badge = document.createElement('span');
            badge.className = 'account-badge';
            badge.textContent = account.accountNumber;
            badge.title = account.accountName || `Account ${account.accountNumber}`;
            
            badge.onclick = (e) => {
                e.stopPropagation();
                showAccountDetails(account, task.row, task);
            };
            
            accountDisplay.appendChild(badge);
        });
    } else {
        const addIcon = document.createElement('span');
        addIcon.className = 'add-account-icon';
        addIcon.innerHTML = '+';
        addIcon.title = 'Link account';
        
        addIcon.onclick = (e) => {
            e.stopPropagation();
            showAccountLinkingModal(task.row, task);
        };
        
        accountDisplay.appendChild(addIcon);
    }

    cell.appendChild(accountDisplay);
}

function showAccountDetails(account: any, taskRow: HTMLElement, task: any): void {
    document.querySelectorAll('.account-tooltip').forEach(el => el.remove());

    const tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';

    tooltip.innerHTML = `
        <div class="tooltip-header">
            ${account.accountNumber}
        </div>

        <div class="tooltip-body">
            <div class="account-name">
                ${account.accountName || 'Account'}
            </div>

            ${account.accountType ? `
                <div class="account-meta">Type: ${account.accountType}</div>
            ` : ''}

            ${account.riskRating ? `
                <div class="account-meta">Risk: ${account.riskRating}</div>
            ` : ''}
        </div>

        <div class="tooltip-actions">
            <button class="close-tooltip-btn">Close</button>
            <button class="remove-account-btn">Remove</button>
        </div>
    `;

    document.body.appendChild(tooltip);

    const rect = taskRow.getBoundingClientRect();
    tooltip.style.left = (rect.left + window.scrollX + 50) + 'px';
    tooltip.style.top = (rect.top + window.scrollY - 50) + 'px';

    tooltip.querySelector('.close-tooltip-btn')?.addEventListener('click', () => {
        tooltip.remove();
    });

    tooltip.querySelector('.remove-account-btn')?.addEventListener('click', () => {
        const taskId = task.id || task.row.dataset.taskId;
        const accounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];

        const updatedAccounts = accounts.filter((a: any) => a.accountNumber !== account.accountNumber);

        if (updatedAccounts.length === 0) {
            taskAccounts.delete(task.row);
            taskAccounts.delete(taskId);
        } else {
            taskAccounts.set(task.row, updatedAccounts);
            taskAccounts.set(taskId, updatedAccounts);
        }

        tooltip.remove();
        addAccountColumnToTasks();
        showNotification(`Account ${account.accountNumber} removed`);
    });

    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e) {
            if (!tooltip.contains(e.target as Node)) {
                tooltip.remove();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 100);
}

function showAccountLinkingModal(taskRow: HTMLElement, task: any): void {
    const existingModal = document.getElementById('accountLinkingModal');
    if (existingModal) existingModal.remove();
    const taskName = task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task';
    const modal = createLinkingModalHTML(taskName);
    document.body.appendChild(modal);

    attachLinkingEventListeners(modal, task, taskRow);
}

function createLinkingModalHTML(taskName: string): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'accountLinkingModal';
    modal.className = 'modal modal-visible';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <span class="close">&times;</span>

            <h3 class="cdoc-header">📊 Link Account to Task</h3>

            <div class="account-info-box account-highlight">
                <div class="info-label">Task:</div>
                <div class="info-value">${taskName}</div>
            </div>

            <div class="link-modal-grid">
                <div>
                    <h4 class="section-title">Account Details</h4>

                    <div class="form-group">
                        <label class="form-label">Organizational Hierarchy</label>
                        <select id="orgHierarchy" class="form-input-full">
                            <option value="">Select Hierarchy...</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Division">Division</option>
                            <option value="Department">Department</option>
                            <option value="Subsidiary">Subsidiary</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">FS Caption</label>
                        <input type="text" id="fsCaption" class="form-input-full" placeholder="e.g., Cash & Equivalents">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Account Name *</label>
                        <input type="text" id="accountName" class="form-input-full" placeholder="e.g., Cash & Cash Equivalents">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Account Owners</label>
                        <select id="accountOwners" class="form-input-full" multiple size="3">
                            <option value="PK">Palakh Khanna</option>
                            <option value="SM">Sarah Miller</option>
                            <option value="MP">Mel Preparer</option>
                            <option value="PP">Poppy Pan</option>
                            <option value="JS">John Smith</option>
                            <option value="EW">Emma Watson</option>
                            <option value="DB">David Brown</option>
                        </select>
                        <div class="form-helper-text">Ctrl+Click to select multiple</div>
                    </div>
                </div>

                <div>
                    <h4 class="section-title">Account Range & Settings</h4>

                    <div class="input-grid">
                        <div class="form-group">
                            <label class="form-label">Account # From</label>
                            <input type="text" id="accountFrom" class="form-input-full" placeholder="e.g., 1000">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Account # To</label>
                            <input type="text" id="accountTo" class="form-input-full" placeholder="e.g., 1999">
                        </div>
                    </div>

                    <div class="input-grid">
                        <div class="form-group">
                            <label class="form-label">Due Days From</label>
                            <input type="number" id="dueDaysFrom" class="form-input-full" placeholder="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Due Days To</label>
                            <input type="number" id="dueDaysTo" class="form-input-full" placeholder="30">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Is Key Account</label>
                        <select id="isKeyAccount" class="form-input-full">
                            <option value="All">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Risk Rating</label>
                        <select id="riskRating" class="form-input-full">
                            <option value="All">All</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button id="cancelAccountBtn" class="btn-secondary">Cancel</button>
                <button id="linkAccountBtn" class="btn-primary">Link Account</button>
            </div>
        </div>
    `;

    return modal;
}

function attachLinkingEventListeners(modal: HTMLDivElement, task: any, taskRow: HTMLElement): void {
    const close = () => modal.remove();

    modal.querySelector('.close')?.addEventListener('click', close);
    document.getElementById('cancelAccountBtn')?.addEventListener('click', close);

    modal.onclick = (e) => { if (e.target === modal) close(); };

    document.getElementById('linkAccountBtn')?.addEventListener('click', () => {
        const accountData = getAccountFormData();
        
        if (!accountData.accountName) {
            alert('Please enter Account Name');
            return;
        }

        const taskId = task.id || task.row.dataset.taskId;
        const current = taskAccounts.get(taskRow) || taskAccounts.get(taskId) || [];
        const updated = [...current, accountData];
        
        taskAccounts.set(taskRow, updated);
        if (taskId) taskAccounts.set(taskId, updated);
        task.linkedAccounts = updated;

        refreshLinkedAccountsColumn();
        close();
        showNotification(`Account "${accountData.accountName}" linked`);
        if (typeof saveAllData === 'function') setTimeout(saveAllData, 100);
    });
}

function getAccountFormData(): any {
    const ownersSelect = document.getElementById('accountOwners') as HTMLSelectElement;
    return {
        orgHierarchy: (document.getElementById('orgHierarchy') as HTMLSelectElement).value,
        fsCaption: (document.getElementById('fsCaption') as HTMLInputElement).value.trim(),
        accountName: (document.getElementById('accountName') as HTMLInputElement).value.trim(),
        accountOwners: Array.from(ownersSelect.selectedOptions).map(opt => opt.value),
        accountFrom: (document.getElementById('accountFrom') as HTMLInputElement).value.trim(),
        accountTo: (document.getElementById('accountTo') as HTMLInputElement).value.trim(),
        dueDaysFrom: (document.getElementById('dueDaysFrom') as HTMLInputElement).value,
        dueDaysTo: (document.getElementById('dueDaysTo') as HTMLInputElement).value,
        isKeyAccount: (document.getElementById('isKeyAccount') as HTMLSelectElement).value,
        riskRating: (document.getElementById('riskRating') as HTMLSelectElement).value,
        linkedDate: new Date().toISOString(),
        linkedBy: 'PK' 
    };
}

function addAccountStyles(): void {
    if (document.getElementById('account-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'account-styles';
    link.rel = 'stylesheet';
    link.href = 'account-styles.css';
    document.head.appendChild(link);
}

function initializeAccountColumn(): void {
    console.log('Initializing Account Column...');
    addAccountStyles();
    addAccountColumnToTasks();
}

function refreshLinkedAccountsColumn(): void {
    document.querySelectorAll('.extra-cell[data-column="linkedAccounts"]').forEach(cell => {
        const row = cell.closest('tr');
        if (!row) return;
        
        const task = tasks.find(t => t.row === row);
        if (!task) return;
        
        const taskId = task.id || (row as HTMLElement).dataset.taskId;
        const accounts = taskAccounts.get(row) || taskAccounts.get(taskId) || [];
        
        cell.innerHTML = '';
        cell.classList.add('extra-cell');
        
        if (accounts.length > 0) {
            accounts.forEach((account: any) => {
                const badge = document.createElement('span');
                badge.className = 'account-badge';
                badge.textContent = account.accountName.substring(0, 12) + (account.accountName.length > 12 ? '...' : '');
                badge.title = account.accountName;
                
                badge.onclick = (e) => {
                    e.stopPropagation();
                    showAccountDetails(account, row as HTMLElement, task);
                };
                
                cell.appendChild(badge);
            });
            
            const addMore = document.createElement('span');
            addMore.className = 'add-more-icon';
            addMore.textContent = '+';
            addMore.onclick = (e) => {
                e.stopPropagation();
                showAccountLinkingModal(row as HTMLElement, task);
            };
            cell.appendChild(addMore);
            
        } else {
            const addIcon = document.createElement('span');
            addIcon.className = 'add-link-btn';
            addIcon.textContent = '+ Link Account';
            addIcon.onclick = (e) => {
                e.stopPropagation();
                showAccountLinkingModal(row as HTMLElement, task);
            };
            cell.appendChild(addIcon);
        }
    });
}

function showLinkedAccountModal(task: any, cell: HTMLElement): void {
    const existingModal = document.getElementById('linkedAccountModal');
    if (existingModal) existingModal.remove();
    const taskId = task.id || task.row.dataset.taskId;
    const currentAccounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];
    const taskDisplayName = task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task';
    const modal = createAccountModalHTML(taskDisplayName, currentAccounts);
    document.body.appendChild(modal);
    (window as any).currentAccountTask = task;
    (window as any).currentAccountCell = cell;
    attachAccountEventListeners(modal, task, taskId);
}

function createAccountModalHTML(taskName: string, currentAccounts: any[], modalId: string = 'linkedAccountModal'): HTMLDivElement {
    const modal = document.createElement('div');

    modal.id = modalId;
    modal.className = 'modal show'; 

    const safeTaskName = escapeHtml(taskName);
    const accountsHtml = getAccountsHTML(currentAccounts);

    modal.innerHTML = `
        <div class="modal-content modal-md">
            <span class="close">&times;</span>

            <h3 class="modal-title">Manage Linked Accounts</h3>
            
            <div class="account-info-box">
                <div class="label">Task:</div>
                <div class="value">${safeTaskName}</div>
            </div>
            
            <div class="section">
                <h4 class="section-title">Current Linked Accounts</h4>
                <div id="currentAccountsList" class="account-badge-container">
                    ${accountsHtml}
                </div>
            </div>
            
            <div class="section">
                <h4 class="section-title">Add New Account</h4>
                
                <div class="input-grid">
                    <input type="text" id="newAccountNumber" class="form-control" placeholder="Account Number (e.g., ACC-101)">
                    <input type="text" id="newAccountName" class="form-control" placeholder="Account Name">
                </div>

                <div class="input-grid">
                    <select id="newAccountType" class="form-control">
                        <option value="">Account Type</option>
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <button id="addAccountBtn" class="btn-primary">Add Account</button>
                </div>
            </div>
            
            <div class="modal-footer">
                <button id="closeAccountModalBtn" class="btn-secondary">Close</button>
                <button id="saveAccountsBtn" class="btn-upload">Save Changes</button>
            </div>
        </div>
    `;

    return modal;
}

function renderAccountBadge(acc: any): string {
    return `
        <span class="account-badge" data-acc="${acc.accountNumber}">
            ${acc.accountNumber}
            <span class="remove-acc">✕</span>
        </span>
    `;
}

function attachAccountEventListeners(modal: HTMLDivElement, task: any, taskId: string): void {
    const list = modal.querySelector('#currentAccountsList') as HTMLElement;

    const accNum = modal.querySelector('#newAccountNumber') as HTMLInputElement;
    const accName = modal.querySelector('#newAccountName') as HTMLInputElement;
    const accType = modal.querySelector('#newAccountType') as HTMLSelectElement;

    const closeBtn = modal.querySelector('.close');
    const closeFooterBtn = modal.querySelector('#closeAccountModalBtn');
    const saveBtn = modal.querySelector('#saveAccountsBtn');
    const addBtn = modal.querySelector('#addAccountBtn');

    const close = () => modal.remove();

    closeBtn?.addEventListener('click', close);
    closeFooterBtn?.addEventListener('click', close);

    saveBtn?.addEventListener('click', () => {
        refreshLinkedAccountsColumn();
        close();
        showNotification('Linked accounts updated');
        setTimeout(saveAllData, 100);
    });

    addBtn?.addEventListener('click', () => {
        const number = accNum.value.trim();
        const name = accName.value.trim();

        if (!number || !name) {
            alert('Please enter both account number and name');
            return;
        }

        const newAcc = {
            accountNumber: number,
            accountName: name,
            accountType: accType.value,
            linkedDate: new Date().toISOString()
        };

        const current = getTaskAccounts(task, taskId);
        const updated = [...current, newAcc];

        setTaskAccounts(task, taskId, updated);

        accNum.value = '';
        accName.value = '';
        accType.value = '';

        renderAccounts(list, updated);

        setTimeout(saveAllData, 100);
    });

    list.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains('remove-acc')) return;

        const badge = target.closest('.account-badge') as HTMLElement;
        const accNumValue = badge?.dataset.acc;

        const current = getTaskAccounts(task, taskId);
        const updated = current.filter((a: any) => a.accountNumber !== accNumValue);

        setTaskAccounts(task, taskId, updated);

        renderAccounts(list, updated);

        setTimeout(saveAllData, 100);
    });
}

(function ensureLinkedAccountsVisible() {
    const linkedAccountsCol = columnConfig.find(c => c.key === 'linkedAccounts');
    if (linkedAccountsCol) {
        linkedAccountsCol.visible = true;
        console.log('Linked Accounts column set to visible');
    }
})();

const originalAddDataCells = addDataCells;
(addDataCells as any) = function() {
    originalAddDataCells();
    setTimeout(() => {
        refreshLinkedAccountsColumn();
    }, 100);
};

function updateCDocColumn(): void {
    console.log('Updating CDoc column with Font Awesome icons...');
    
    tasks.forEach((task: any) => {
        if (!task.row) return;
        const cdocCell = task.row.cells[7];
        if (!cdocCell) return;
        
        cdocCell.innerHTML = '';
        cdocCell.classList.add('cdoc-cell');
        
        const docs = taskDocuments.get(task.row) || [];
        console.log(`Task ${task.id} has ${docs.length} CDoc documents`);
        
        const iconContainer = createCDocIcon(docs, task.row);
        cdocCell.appendChild(iconContainer);
    });
    
    subtasks.forEach((subtask: any) => {
        if (!subtask.row) return;
        const cdocCell = subtask.row.cells[7];
        if (!cdocCell) return;
        
        cdocCell.innerHTML = '';
        cdocCell.classList.add('cdoc-cell');
        
        const docs = taskDocuments.get(subtask.row) || [];
        console.log(`Subtask ${subtask.id} has ${docs.length} CDoc documents`);
        
        const iconContainer = createCDocIcon(docs, subtask.row);
        cdocCell.appendChild(iconContainer);
    });
}

function createCDocIcon(docs: any[], row: HTMLElement): HTMLSpanElement {
    const iconContainer = document.createElement('span');
    iconContainer.className = 'cdoc-icon-container';
    
    const icon = document.createElement('i');
    icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
    
    if (docs.length === 0) {
        icon.title = 'Click to upload documents';
    } else {
        icon.title = `${docs.length} document(s) attached`;
    }
    
    iconContainer.appendChild(icon);
    
    if (docs.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'cdoc-badge';
        badge.textContent = docs.length.toString();
        iconContainer.appendChild(badge);
    } else {
        const plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle cdoc-plus-icon';
        iconContainer.appendChild(plusIcon);
    }
    
    iconContainer.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        showDocumentManager(row);
    };
    
    return iconContainer;
}

function showDocumentManager(taskRow: HTMLElement): void {
    const docs = taskDocuments.get(taskRow) || [];
    let modal = document.getElementById('documentManagerModal') as HTMLDivElement;

    if (!modal) {
        modal = createDocumentModalHTML();
        document.body.appendChild(modal);
        setupBaseEventListeners(modal, taskRow);
    }

    (window as any).currentTaskRow = taskRow;
    updateDocumentsUI(docs, taskRow);

    modal.style.display = 'block';
}

function createDocumentModalHTML(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.id = 'documentManagerModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3 class="cdoc-header">📄 CDoc Document Manager</h3>
            
            <div class="upload-section">
                <h4 class="section-title">Upload New Documents</h4>
                
                <div id="dropArea" class="drop-area">
                    <div class="drop-icon"><i class="fa-solid fa-folder-open"></i></div>
                    <div class="drop-text">Drag files here or</div>
                    <button id="browseFileBtn" class="btn-primary">Browse</button>
                    <input type="file" id="fileInput" style="display: none;" multiple>
                </div>
                
                <div id="selectedFilesList" class="file-list-container" style="display: none;">
                    <div class="selected-title">Selected Files:</div>
                    <div id="filesContainer"></div>
                </div>
                
                <div class="upload-actions">
                    <button id="uploadSelectedBtn" class="btn-upload" style="display: none;">Upload Files</button>
                </div>
            </div>
            
            <div>
                <h4 class="section-title">Attached Documents (<span id="docCount">0</span>)</h4>
                <div id="documentsListContainer" class="docs-list"></div>
            </div>
            
            <div class="modal-footer">
                <button id="closeManagerBtn" class="btn-secondary">Close</button>
            </div>
        </div>
    `;
    return modal;
}

function updateDocumentsUI(docs: any[], taskRow: HTMLElement): void {
    const listContainer = document.getElementById('documentsListContainer');
    const countSpan = document.getElementById('docCount');

    if (listContainer) {
        listContainer.innerHTML = renderDocumentsList(docs, taskRow);
        attachDocumentEventListeners(taskRow);
    }
    
    if (countSpan) {
        countSpan.textContent = docs.length.toString();
    }
}

function setupBaseEventListeners(modal: HTMLDivElement, taskRow: HTMLElement): void {
    const closeModal = () => modal.style.display = 'none';

    modal.querySelector('.close')?.addEventListener('click', closeModal);
    document.getElementById('closeManagerBtn')?.addEventListener('click', closeModal);
    
    setupUploadHandlers(modal, taskRow);
}

function renderDocumentsList(docs: any[], taskRow: HTMLElement): string {
    if (docs.length === 0) {
        return `
            <div class="tdoc-empty-state">
                <div class="tdoc-empty-icon">📄</div>
                <div>No documents attached</div>
                <div class="tdoc-empty-subtext">Click upload area above to add documents</div>
            </div>
        `;
    }
    
    return `
        <table class="tdoc-table">
            <thead>
                <tr>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Upload Date</th>
                    <th class="actions-cell">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${docs.map((doc, index) => {
                    const date = new Date(doc.uploadDate);
                    return `
                        <tr data-doc-index="${index}">
                            <td>
                                <div class="tdoc-file-info">
                                    <span class="tdoc-file-icon">📄</span>
                                    <span class="tdoc-file-name">${doc.name}</span>
                                </div>
                            </td>
                            <td>${(doc.size / 1024).toFixed(1)} KB</td>
                            <td>
                                ${date.toLocaleDateString()} 
                                <span class="tdoc-timestamp">${date.toLocaleTimeString()}</span>
                            </td>
                            <td class="actions-cell">
                                <button class="view-doc-btn tdoc-action-btn btn-view" data-index="${index}" title="View File">👁️</button>
                                <button class="delete-doc-btn tdoc-action-btn btn-delete" data-index="${index}" title="Delete File">🗑</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function attachDocumentEventListeners(taskRow: HTMLElement): void {
    document.querySelectorAll('.view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((e.target as HTMLElement).dataset.index || '0');
            const docs = taskDocuments.get(taskRow) || [];
            if (docs[index]) {
                showFilePreview(docs[index]);
            }
        });
    });
    
    document.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((e.target as HTMLElement).dataset.index || '0');
            showDeleteConfirmation(taskRow, index);
        });
    });
}

function showFilePreview(doc: any): void {
    let previewModal = document.getElementById('filePreviewModal') as HTMLDivElement;
    
    if (!previewModal) {
        previewModal = document.createElement('div');
        previewModal.id = 'filePreviewModal';
        previewModal.className = 'preview-modal';
        previewModal.innerHTML = `
            <div class="preview-modal-content">
                <span class="tdoc-close">&times;</span>
                <h3 class="preview-header">File Details</h3>
                <div id="filePreviewContent"></div>
            </div>
        `;
        document.body.appendChild(previewModal);
        
        previewModal.querySelector('.tdoc-close')?.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
    }
    
    const content = previewModal.querySelector('#filePreviewContent') as HTMLElement;
    const fileSize = (doc.size / 1024).toFixed(1);
    const uploadDate = new Date(doc.uploadDate).toLocaleString();

    content.innerHTML = `
        <div class="file-preview-container">
            <div class="file-icon-large">📄</div>
            <h4 class="file-name">${doc.name}</h4>
            
            <table class="preview-table">
                <tr>
                    <td class="preview-label">File Size:</td>
                    <td>${fileSize} KB</td>
                </tr>
                <tr>
                    <td class="preview-label">Upload Date:</td>
                    <td>${uploadDate}</td>
                </tr>
                <tr>
                    <td class="preview-label">File Type:</td>
                    <td>${doc.type || 'Unknown'}</td>
                </tr>
            </table>
            
            <p class="preview-info-box">
                <i class="fa-solid fa-info-circle"></i> 
                Preview not available. The file would open in its native application.
            </p>
        </div>
    `;
    
    previewModal.style.display = 'block';
}

function renderDocumentsList(docs: any[], taskRow: HTMLElement): string {
    if (!docs || docs.length === 0) {
        return `
            <div class="documents-list-empty">
                <div class="documents-list-empty-icon">📄</div>
                <div class="documents-list-empty-text">No documents attached</div>
                <div class="documents-list-empty-hint">Click upload area above to add documents</div>
            </div>
        `;
    }
    
    return `
        <table class="documents-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${docs.map((doc, index) => `
                    <tr data-doc-index="${index}">
                        <td>
                            <div class="doc-info">
                                <span class="doc-icon">📄</span>
                                <span class="doc-name">${escapeHtml(doc.name)}</span>
                            </div>
                        </td>
                        <td>${formatFileSize(doc.size)}</td>
                        <td>
                            ${formatDate(doc.uploadDate)} 
                            <span class="upload-time">${formatTime(doc.uploadDate)}</span>
                        </td>
                        <td>
                            <button class="action-btn view-btn" data-action="view" data-index="${index}" title="View">👁️</button>
                            <button class="action-btn delete-btn" data-action="delete" data-index="${index}" title="Delete">🗑</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(date: any): string {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleDateString();
}

function formatTime(date: any): string {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleTimeString();
}

function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderDocumentsList, formatFileSize, formatDate, formatTime, escapeHtml };
}

const DeleteModal = (function () {
    let modalInstance: HTMLDivElement | null = null;

    function createModal(): HTMLDivElement {
        const modal = document.createElement('div');
        modal.id = 'deleteConfirmModal';
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-content modal-sm">
                <span class="modal-close">&times;</span>

                <h3 class="modal-title">Confirm Delete</h3>

                <div class="modal-body">
                    <div class="modal-icon">⚠️</div>
                    <p class="modal-text">Are you sure you want to delete this document?</p>
                    <p class="modal-subtext" id="docNameDisplay"></p>
                </div>

                <div class="modal-actions">
                    <button id="cancelDeleteBtn" class="modal-cancel-btn">Cancel</button>
                    <button id="confirmDeleteBtn" class="modal-confirm-btn">Delete</button>
                </div>
            </div>
        `;

        return modal;
    }

    function setupEventListeners(modal: HTMLDivElement, onConfirm: () => void): void {
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancelDeleteBtn');
        const confirmBtn = modal.querySelector('#confirmDeleteBtn');

        function closeModal() {
            modal.classList.remove('show');
        }

        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);

        confirmBtn?.addEventListener('click', () => {
            onConfirm?.();
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
    }

    function show(config: any): void {
        const { documentName, onConfirm, taskRow, index } = config;

        if (!modalInstance) {
            modalInstance = createModal();
            document.body.appendChild(modalInstance);
        }

        const docNameDisplay = modalInstance.querySelector('#docNameDisplay');
        if (docNameDisplay && documentName) {
            docNameDisplay.textContent = `"${documentName}"`;
        }

        if (taskRow !== undefined && index !== undefined) {
            (window as any).currentDeleteTaskRow = taskRow;
            (window as any).currentDeleteIndex = index;
        }

        setupEventListeners(modalInstance, onConfirm);

        modalInstance.classList.add('show');
    }

    function hide(): void {
        modalInstance?.classList.remove('show');
    }

    return { show, hide };
})();

function showDeleteConfirmation(taskRow: HTMLElement, index: number): void {
    const docs = taskDocuments.get(taskRow) || [];
    const doc = docs[index];
    
    if (!doc) return;
    
    DeleteModal.show({
        documentName: doc.name,
        taskRow: taskRow,
        index: index,
        onConfirm: () => {
            deleteDocument(taskRow, index);
        }
    });
}

function deleteDocument(taskRow: HTMLElement, index: number): void {
    const docs = taskDocuments.get(taskRow) || [];
    if (index >= 0 && index < docs.length) {
        const docName = docs[index].name;
        docs.splice(index, 1);
        
        if (docs.length === 0) {
            taskDocuments.delete(taskRow);
        } else {
            taskDocuments.set(taskRow, docs);
        }
        
        updateCDocColumn();
        
        const managerModal = document.getElementById('documentManagerModal');
        if (managerModal && managerModal.style.display === 'block') {
            const listContainer = document.getElementById('documentsListContainer');
            if (listContainer) {
                listContainer.innerHTML = renderDocumentsList(docs, taskRow);
                attachDocumentEventListeners(taskRow);
            }
            
            const header = managerModal.querySelector('h4');
            if (header) header.innerHTML = `Attached Documents (${docs.length})`;
        }
        
        showNotification(`Document "${docName}" deleted successfully`);
    }
}

function saveColumnVisibility(): void {
    const visibilityState: any = {};
    columnConfig.forEach(col => {
        visibilityState[col.key] = col.visible;
    });
    localStorage.setItem('columnVisibility', JSON.stringify(visibilityState));
    console.log('Column visibility saved:', visibilityState);
}

function loadColumnVisibility(): void {
    const saved = localStorage.getItem('columnVisibility');
    if (saved) {
        try {
            const visibilityState = JSON.parse(saved);
            columnConfig.forEach(col => {
                if (visibilityState[col.key] !== undefined && !col.mandatory) {
                    col.visible = visibilityState[col.key];
                }
            });
            console.log('Column visibility loaded:', visibilityState);
        } catch (e) {
            console.error('Failed to load column visibility', e);
        }
    }
}

function previewDocument(doc: any): void {
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (!previewWindow) return;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${doc.name}</title>
            <link rel="stylesheet" href="preview.css">
        </head>
        <body>
            <div class="container">
                <div class="doc-header">
                    <div class="doc-icon">📄</div>
                    <div class="doc-title">${doc.name}</div>
                </div>

                <div class="doc-meta">
                    <div class="meta-row">
                        <span class="meta-label">Size:</span>
                        <span class="meta-value">${(doc.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Type:</span>
                        <span class="meta-value">${doc.type || 'Unknown'}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Uploaded:</span>
                        <span class="meta-value">${new Date(doc.uploadDate).toLocaleString()}</span>
                    </div>
                </div>

                <div class="preview-placeholder">
                    <div class="preview-icon">📋</div>
                    <div class="preview-text">Preview not available for this file type</div>
                    <div class="preview-note">The file would open in its native application</div>
                </div>
            </div>

            <script src="preview.js"></script>
        </body>
        </html>
    `;

    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
}

function addDocumentManagerStyles(): void {
    if (document.getElementById('document-manager-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'document-manager-styles';
    style.textContent = `/* Paste the entire CSS above here */`;
    document.head.appendChild(style);
}

function initializeDocumentManager(): void {
    addDocumentManagerStyles();
    updateCDocColumn();
}

function makeStatusEditable(): void {
    tasks.forEach((task: any) => {
        const statusCell = task.statusBadge.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        statusCell.addEventListener('click', (e) => {
            e.stopPropagation();
            showStatusChangeModal(task);
        });
    });
    
    subtasks.forEach((subtask: any) => {
        const statusCell = subtask.statusBadge.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        statusCell.addEventListener('click', (e) => {
            e.stopPropagation();
            showSubtaskStatusChangeModal(subtask);
        });
    });
}

function showStatusChangeModal(task: any): void {
    console.log('Opening status modal for task:', task);
    (window as any).currentTaskForStatus = task;
    
    const currentStatus = task.statusBadge ? task.statusBadge.innerText : (task.status || 'Not Started');
    
    const modalHtml = `
        <div id="statusChangeModal" class="modal status-modal">
            <div class="modal-content status-modal-content">
                <span class="close">&times;</span>
                <h3 class="status-modal-title">Change Status</h3>
                
                <div class="status-modal-body">
                    <div class="status-field">
                        <label class="status-label">Current Status</label>
                        <div id="currentStatusDisplay" class="current-status-display" data-status="${escapeHtml(currentStatus)}">
                            ${escapeHtml(currentStatus)}
                        </div>
                    </div>
                    
                    <div class="status-field">
                        <label class="status-label">New Status</label>
                        <select id="newStatusSelect" class="status-select">
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Review">Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hold">Hold</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                    
                    <div class="status-field">
                        <label class="status-label">Comment (Optional)</label>
                        <textarea id="statusComment" class="status-comment" rows="3" placeholder="Add comment..."></textarea>
                        <div class="status-comment-count">0/500</div>
                    </div>
                </div>
                
                <div class="status-modal-buttons">
                    <button id="cancelStatusBtn" class="btn-cancel-status">Cancel</button>
                    <button id="updateStatusBtn" class="btn-update-status">Update Status</button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('statusChangeModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('statusChangeModal') as HTMLDivElement;
    const select = document.getElementById('newStatusSelect') as HTMLSelectElement;
    
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    
    const commentTextarea = document.getElementById('statusComment') as HTMLTextAreaElement;
    const charCounter = modal.querySelector('.status-comment-count') as HTMLElement;
    
    if (commentTextarea && charCounter) {
        commentTextarea.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = `${length}/500`;
            if (length > 500) {
                charCounter.classList.add('status-comment-count-exceed');
                this.classList.add('status-comment-error');
            } else {
                charCounter.classList.remove('status-comment-count-exceed');
                this.classList.remove('status-comment-error');
            }
        });
    }
    
    const closeBtn = modal.querySelector('.close') as HTMLElement;
    closeBtn.onclick = function() {
        modal.remove();
        (window as any).currentTaskForStatus = null;
    };
    
    const cancelBtn = document.getElementById('cancelStatusBtn') as HTMLElement;
    cancelBtn.onclick = function() {
        modal.remove();
        (window as any).currentTaskForStatus = null;
    };
    
    const updateBtn = document.getElementById('updateStatusBtn') as HTMLElement;
    updateBtn.onclick = function() {
        const newStatus = (document.getElementById('newStatusSelect') as HTMLSelectElement).value;
        const comment = (document.getElementById('statusComment') as HTMLTextAreaElement).value;
        
        if ((window as any).currentTaskForStatus) {
            const task = (window as any).currentTaskForStatus;
            const oldStatus = task.statusBadge ? task.statusBadge.innerText : (task.status || 'Not Started');
            updateBtn.classList.add('loading');
            (updateBtn as HTMLButtonElement).disabled = true;
            
            setTimeout(() => {
                if (typeof updateTaskStatusUniversal === 'function') {
                    updateTaskStatusUniversal(task, newStatus);
                } else {
                    console.error('updateTaskStatusUniversal function not found');
                }
                
                if (comment && comment.trim()) {
                    if (typeof addStatusChangeComment === 'function') {
                        addStatusChangeComment(task.row, oldStatus, newStatus, comment);
                    } else {
                        console.log('Status change comment:', comment);
                    }
                }
                
                if (typeof showNotification === 'function') {
                    showNotification(`Status changed from ${oldStatus} to ${newStatus}`);
                }
                
                console.log('Status updated successfully');
                
                updateBtn.classList.remove('loading');
                updateBtn.classList.add('success');
                
                setTimeout(() => {
                    updateBtn.classList.remove('success');
                    modal.remove();
                    (window as any).currentTaskForStatus = null;
                }, 300);
            }, 300);
        } else {
            modal.remove();
            (window as any).currentTaskForStatus = null;
        }
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
            (window as any).currentTaskForStatus = null;
        }
    };
    
    setTimeout(() => {
        select.focus();
    }, 100);
}

function updateTaskStatusUniversal(task: any, newStatus: string): void {
    console.log('Universal status update called for task:', task.name, 'New status:', newStatus);
    
    if (task.statusBadge) {
        task.statusBadge.innerText = newStatus;
        task.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
    }
    
    if (task.row) {
        const allStatusBadges = task.row.querySelectorAll('.skystemtaskmaster-status-badge');
        allStatusBadges.forEach(badge => {
            badge.innerText = newStatus;
            badge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
        });
    }
    
    if (task.row && task.row.cells[4]) {
        const statusBaseCell = task.row.cells[4];
        const badge = statusBaseCell.querySelector('.skystemtaskmaster-status-badge');
        if (badge) {
            badge.innerText = newStatus;
            badge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
        } else {
            statusBaseCell.innerHTML = `<span class="skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}">${newStatus}</span>`;
        }
    }
    
    if (task.row) {
        let extraStatusCells = task.row.querySelectorAll('.extra-cell[data-column="taskStatus"]');
        
        if (extraStatusCells.length === 0) {
            extraStatusCells = task.row.querySelectorAll('td.extra-cell');
            extraStatusCells = Array.from(extraStatusCells).filter(cell => {
                const colKey = cell.getAttribute('data-column');
                return colKey === 'taskStatus';
            });
        }
        
        console.log('Found extra status cells:', extraStatusCells.length);
        
        if (extraStatusCells.length > 0) {
            extraStatusCells.forEach(cell => {
                cell.textContent = newStatus;
                cell.classList.add('status-updated-flash');
                setTimeout(() => {
                    cell.classList.remove('status-updated-flash');
                }, 500);
                (cell as HTMLElement).style.cursor = 'pointer';
                cell.setAttribute('title', 'Click to change status');
                makeStatusCellClickable(cell as HTMLElement, task);
                console.log('Updated existing extra status cell to:', newStatus);
            });
        } else {
            console.log('Creating new extra status cell...');
            const newCell = document.createElement('td');
            newCell.className = 'extra-cell';
            newCell.setAttribute('data-column', 'taskStatus');
            newCell.textContent = newStatus;
            newCell.style.cursor = 'pointer';
            
            task.row.appendChild(newCell);
            makeStatusCellClickable(newCell, task);
            console.log('Created new status cell with value:', newStatus);
        }
    }
    
    task.status = newStatus;
    task.taskStatus = newStatus;
    
    const taskIndex = tasks.findIndex((t: any) => t.id === task.id || t.row === task.row);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        tasks[taskIndex].taskStatus = newStatus;
        if (tasks[taskIndex].statusBadge) {
            tasks[taskIndex].statusBadge.innerText = newStatus;
        }
    }
    
    setTimeout(() => {
        if (task.row) {
            const allStatusElements = task.row.querySelectorAll('.skystemtaskmaster-status-badge, .extra-cell[data-column="taskStatus"], td[data-column="taskStatus"]');
            allStatusElements.forEach(el => {
                if (el.innerText !== newStatus) {
                    el.innerText = newStatus;
                    console.log('Final correction - updated element:', el);
                }
            });
            
            const finalCheck = task.row.querySelectorAll('.extra-cell[data-column="taskStatus"]');
            if (finalCheck.length === 0) {
                console.log('Final check: No status cell found, creating one more time');
                const finalCell = document.createElement('td');
                finalCell.className = 'extra-cell';
                finalCell.setAttribute('data-column', 'taskStatus');
                finalCell.textContent = newStatus;
                finalCell.style.cursor = 'pointer';
                task.row.appendChild(finalCell);
                makeStatusCellClickable(finalCell, task);
            }
        }
    }, 100);
    
    updateCounts();
    
    setTimeout(() => saveAllData(), 200);
    
    console.log('Status update complete for task, new status:', newStatus);
}

function makeStatusCellClickable(cell: HTMLElement, item: any): HTMLElement {
    if (!cell) return cell;
    
    const newCell = cell.cloneNode(true) as HTMLElement;
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    
    newCell.style.cursor = 'pointer';
    newCell.classList.add('clickable-status-cell');
    newCell.title = 'Click to change status';
    
    newCell.addEventListener('mouseenter', () => {
        newCell.classList.add('status-cell-hover');
    });
    
    newCell.addEventListener('mouseleave', () => {
        newCell.classList.remove('status-cell-hover');
    });
    
    newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Task Status cell clicked!');
        showStatusChangeModal(item);
    });
    
    return newCell;
}

function initializeStatusCells(): void {
    console.log('Initializing all status cells...');
    
    tasks.forEach((task: any) => {
        if (task.row) {
            const statusBadge = task.row.querySelector('.skystemtaskmaster-status-badge');
            if (statusBadge) {
                const newBadge = statusBadge.cloneNode(true) as HTMLElement;
                statusBadge.parentNode?.replaceChild(newBadge, statusBadge);
                newBadge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    showStatusChangeModal(task);
                });
                task.statusBadge = newBadge;
            }
            
            const extraStatusCells = task.row.querySelectorAll('.extra-cell[data-column="taskStatus"]');
            extraStatusCells.forEach(cell => {
                makeStatusCellClickable(cell as HTMLElement, task);
            });
        }
    });
    
    console.log('Status cells initialized for', tasks.length, 'tasks');
}

function ensureTaskStatusColumnVisible(): void {
    const statusCol = columnConfig.find(c => c.key === 'taskStatus');
    if (statusCol) {
        statusCol.visible = true;
        console.log('Task Status column visibility ensured');
    }
    
    setTimeout(() => {
        tasks.forEach((task: any) => {
            const extraStatusCell = task.row.querySelector('.extra-cell[data-column="taskStatus"]');
            if (!extraStatusCell) {
                const newCell = document.createElement('td');
                newCell.className = 'extra-cell';
                newCell.setAttribute('data-column', 'taskStatus');
                newCell.textContent = task.status || 'Not Started';
                task.row.appendChild(newCell);
                makeStatusCellClickable(newCell, task);
            }
        });
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    
    setTimeout(() => {
        initializeStatusCells();
        
        const statusCol = columnConfig.find(c => c.key === 'taskStatus');
        if (statusCol) {
            statusCol.visible = true;
        }
        
        console.log('Task status column fix applied');
    }, 1000);
});

function addStatusChangeComment(row: HTMLElement, oldStatus: string, newStatus: string, comment: string): void {
    const statusHistory = row.getAttribute('data-status-history') || '';
    const newEntry = `${new Date().toLocaleString()}: ${oldStatus} → ${newStatus}${comment ? ' - ' + comment : ''}`;
    row.setAttribute('data-status-history', statusHistory ? statusHistory + '|' + newEntry : newEntry);
}

function updateTaskStatusExtraColumn(row: HTMLElement, newStatus: string): void {
    if (!row) return;
    
    const extraCells = row.querySelectorAll('.extra-cell');
    extraCells.forEach(cell => {
        const columnKey = cell.getAttribute('data-column');
        if (columnKey === 'taskStatus') {
            cell.textContent = newStatus;
            
            cell.classList.add('status-updated-flash');
            setTimeout(() => {
                cell.classList.remove('status-updated-flash');
            }, 500);
            
            console.log('Task Status column updated to:', newStatus);
        }
    });
}

function showSubtaskStatusChangeModal(subtask: any): void {
    console.log('Opening status modal for subtask:', subtask);
    (window as any).currentSubtaskForStatus = subtask;
    
    const modalHtml = `
        <div id="statusChangeModal" class="modal status-modal">
            <div class="modal-content status-modal-content">
                <span class="close">&times;</span>
                <h3 class="status-modal-title">Change Subtask Status</h3>
                
                <div class="status-modal-body">
                    <div class="status-field">
                        <label class="status-label">Current Status</label>
                        <div id="currentStatusDisplay" class="current-status-display" data-status="${escapeHtml(subtask.statusBadge.innerText)}">
                            ${escapeHtml(subtask.statusBadge.innerText)}
                        </div>
                    </div>
                    
                    <div class="status-field">
                        <label class="status-label">New Status</label>
                        <select id="newStatusSelect" class="status-select">
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Review">Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hold">Hold</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                    
                    <div class="status-field">
                        <label class="status-label">Comment (Optional)</label>
                        <textarea id="statusComment" class="status-comment" rows="3" placeholder="Add comment..."></textarea>
                        <div class="status-comment-count">0/500</div>
                    </div>
                </div>
                
                <div class="status-modal-buttons">
                    <button id="cancelStatusBtn" class="btn-cancel-status">Cancel</button>
                    <button id="updateStatusBtn" class="btn-update-status">Update Status</button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('statusChangeModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('statusChangeModal') as HTMLDivElement;
    const select = document.getElementById('newStatusSelect') as HTMLSelectElement;
    const currentStatus = subtask.statusBadge.innerText;
    
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    
    const commentTextarea = document.getElementById('statusComment') as HTMLTextAreaElement;
    const charCounter = modal.querySelector('.status-comment-count') as HTMLElement;
    
    if (commentTextarea && charCounter) {
        commentTextarea.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = `${length}/500`;
            if (length > 500) {
                charCounter.style.color = '#f44336';
                this.style.borderColor = '#f44336';
            } else {
                charCounter.style.color = '#999';
                this.style.borderColor = '';
            }
        });
    }
    
    const closeBtn = modal.querySelector('.close') as HTMLElement;
    closeBtn.onclick = function() {
        modal.remove();
        (window as any).currentSubtaskForStatus = null;
    };
    
    const cancelBtn = document.getElementById('cancelStatusBtn') as HTMLElement;
    cancelBtn.onclick = function() {
        modal.remove();
        (window as any).currentSubtaskForStatus = null;
    };
    
    const updateBtn = document.getElementById('updateStatusBtn') as HTMLElement;
    updateBtn.onclick = function() {
        console.log('Update subtask button clicked!');
        
        const newStatus = (document.getElementById('newStatusSelect') as HTMLSelectElement).value;
        const comment = (document.getElementById('statusComment') as HTMLTextAreaElement).value;
        
        if ((window as any).currentSubtaskForStatus) {
            const subtask = (window as any).currentSubtaskForStatus;
            const oldStatus = subtask.statusBadge.innerText;
            
            updateBtn.classList.add('loading');
            (updateBtn as HTMLButtonElement).disabled = true;
            
            setTimeout(() => {
                subtask.statusBadge.innerText = newStatus;
                subtask.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
                
                if (subtask.taskStatus !== undefined) {
                    subtask.taskStatus = newStatus;
                }
                
                if (typeof updateTaskStatusExtraColumn === 'function') {
                    updateTaskStatusExtraColumn(subtask.row, newStatus);
                }
                
                if (typeof updateCounts === 'function') {
                    updateCounts();
                }
                
                if (typeof showNotification === 'function') {
                    showNotification(`Subtask status changed from ${oldStatus} to ${newStatus}`);
                }
                
                updateBtn.classList.remove('loading');
                updateBtn.classList.add('success');
                
                setTimeout(() => {
                    updateBtn.classList.remove('success');
                    modal.remove();
                    (window as any).currentSubtaskForStatus = null;
                }, 300);
            }, 300);
        } else {
            modal.remove();
            (window as any).currentSubtaskForStatus = null;
        }
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
            (window as any).currentSubtaskForStatus = null;
        }
    };
    
    setTimeout(() => {
        select.focus();
    }, 100);
}

function syncAllTaskStatusColumns(): void {
    console.log('Syncing all task status columns...');
    tasks.forEach((task: any) => {
        if (task.row && task.statusBadge) {
            const currentStatus = task.statusBadge.innerText;
            updateTaskStatusExtraColumn(task.row, currentStatus);
            
            if (task.status !== undefined) {
                task.status = currentStatus;
            }
            if (task.taskStatus !== undefined) {
                task.taskStatus = currentStatus;
            }
        }
    });
    
    subtasks.forEach((subtask: any) => {
        if (subtask.row && subtask.statusBadge) {
            const currentStatus = subtask.statusBadge.innerText;
            updateTaskStatusExtraColumn(subtask.row, currentStatus);
            
            if (subtask.taskStatus !== undefined) {
                subtask.taskStatus = currentStatus;
            }
        }
    });
    
    console.log('Status sync complete');
}

function initializeStatusSync(): void {
    setTimeout(() => {
        syncAllTaskStatusColumns();
    }, 1000);
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                clearTimeout((window as any).statusSyncTimeout);
                (window as any).statusSyncTimeout = setTimeout(() => {
                    syncAllTaskStatusColumns();
                }, 200);
            }
        });
    });
    const tbody = document.getElementById('mainTableBody');
    if (tbody) {
        observer.observe(tbody, { 
            childList: true, 
            subtree: true,
            characterData: true,
            attributes: true 
        });
    }
}

function addTaskEventListeners(task: any): void {
    const row = task.row;
    if (!row) return;
    const statusBadge = row.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
    if (statusBadge) {
        statusBadge.style.cursor = 'pointer';
        statusBadge.title = 'Click to change status';
        const newBadge = statusBadge.cloneNode(true) as HTMLElement;
        statusBadge.parentNode?.replaceChild(newBadge, statusBadge);
        newBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Status badge clicked');
            showStatusChangeModal(task);
        });
        task.statusBadge = newBadge;
    }
}

function initializeStatus(): void {
    addStatusStyles();
    makeStatusEditable();
}

function addStatusStyles(): void {
    if (document.getElementById('status-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'status-styles';
    style.textContent = `/* Paste the entire CSS above here */`;
    document.head.appendChild(style);
}

function updateTaskStatus(task: any, newStatus: string, comment: string): void {
    const oldStatus = task.statusBadge.innerText;
    
    task.statusBadge.innerText = newStatus;
    task.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
    
    addStatusChangeComment(task.row, oldStatus, newStatus, comment);
    updateCounts();
    showNotification(`Status changed from ${oldStatus} to ${newStatus}`);
}

function updateSubtaskStatus(subtask: any, newStatus: string, comment: string): void {
    const oldStatus = subtask.statusBadge.innerText;
    
    subtask.statusBadge.innerText = newStatus;
    subtask.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
    
    addStatusChangeComment(subtask.row, oldStatus, newStatus, comment);
    updateCounts();
    showNotification(`Subtask status changed from ${oldStatus} to ${newStatus}`);
}

function initializeDragAndDrop(): void {
    console.log('Initializing Drag and Drop...');
    
    tasks.forEach((task: any) => makeRowDraggable(task.row, 'task'));
    subtasks.forEach((subtask: any) => makeRowDraggable(subtask.row, 'subtask'));
    
    addDragStyles();
}

function makeRowDraggable(row: HTMLElement, type: string): void {
    if (row.getAttribute('draggable') === 'true') return;
    
    row.setAttribute('draggable', 'true');
    row.classList.add('skystemtaskmaster-draggable');
    
    const existingHandle = row.querySelector('.skystemtaskmaster-drag-handle');
    if (existingHandle) existingHandle.remove();
    
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragend', handleDragEnd);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragleave', handleDragLeave);
    row.addEventListener('drop', handleDrop);
}

function handleDragStart(e: DragEvent): void {
    const row = e.currentTarget as HTMLElement;
    
    if (row.classList.contains('skystemtaskmaster-subtask-header')) {
        e.preventDefault();
        return;
    }
    
    const type = row.classList.contains('subtask-row') ? 'subtask' : 'task';
    draggedItem = {
        element: row,
        type: type,
        originalIndex: getItemIndex(row, type)
    };
    
    e.dataTransfer?.setData('text/plain', '');
    row.classList.add('skystemtaskmaster-dragging');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e: DragEvent): void {
    const row = e.currentTarget as HTMLElement;
    row.classList.remove('skystemtaskmaster-dragging');
    
    document.querySelectorAll('tr').forEach(tr => {
        tr.classList.remove('skystemtaskmaster-drag-over', 'skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
    });
    
    draggedItem = null;
}

function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    
    const targetRow = e.currentTarget as HTMLElement;
    if (!draggedItem || draggedItem.element === targetRow) return;
    
    const isDraggedTask = draggedItem.type === 'task';
    const isTargetTask = !targetRow.classList.contains('subtask-row') &&
        !targetRow.classList.contains('skystemtaskmaster-subtask-header') &&
        !targetRow.classList.contains('main-list-row') &&
        !targetRow.classList.contains('sub-list-row');
    
    if (isDraggedTask !== isTargetTask) return;
    
    document.querySelectorAll('tr').forEach(tr => {
        tr.classList.remove('skystemtaskmaster-drag-over', 'skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
    });
    
    const rect = targetRow.getBoundingClientRect();
    const mouseY = e.clientY;
    const midpoint = rect.top + rect.height / 2;
    
    if (mouseY < midpoint) {
        targetRow.classList.add('skystemtaskmaster-drag-over-top');
    } else {
        targetRow.classList.add('skystemtaskmaster-drag-over-bottom');
    }
}

function handleDragLeave(e: DragEvent): void {
    const targetRow = e.currentTarget as HTMLElement;
    targetRow.classList.remove('skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
}

function handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    
    const targetRow = e.currentTarget as HTMLElement;
    targetRow.classList.remove('skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
    
    if (!draggedItem || draggedItem.element === targetRow) return;
    
    const isDraggedTask = draggedItem.type === 'task';
    const isTargetTask = !targetRow.classList.contains('subtask-row') &&
        !targetRow.classList.contains('skystemtaskmaster-subtask-header') &&
        !targetRow.classList.contains('main-list-row') &&
        !targetRow.classList.contains('sub-list-row');
    
    if (isDraggedTask !== isTargetTask) {
        alert(`Cannot move ${isDraggedTask ? 'tasks' : 'subtasks'} into ${isTargetTask ? 'tasks' : 'subtasks'} section`);
        return;
    }
    
    const tbody = targetRow.parentNode;
    const isDropAbove = targetRow.classList.contains('skystemtaskmaster-drag-over-top');
    
    if (isDropAbove) {
        tbody?.insertBefore(draggedItem.element, targetRow);
    } else {
        tbody?.insertBefore(draggedItem.element, targetRow.nextSibling);
    }
    
    if (draggedItem.type === 'task') {
        updateTasksOrder();
    } else {
        updateSubtasksOrder();
    }
    
    saveTaskOrder();
}

function getItemIndex(row: HTMLElement, type: string): number {
    if (type === 'task') {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].row === row) return i;
        }
        return -1;
    } else {
        for (let i = 0; i < subtasks.length; i++) {
            if (subtasks[i].row === row) return i;
        }
        return -1;
    }
}

function updateTasksOrder(): void {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const taskRows = allRows.filter(row => 
        !row.classList.contains('skystemtaskmaster-subtask-header') &&
        !row.classList.contains('subtask-row') &&
        !row.classList.contains('main-list-row') &&
        !row.classList.contains('sub-list-row')
    );
    
    tasks.sort((a: any, b: any) => {
        const aIndex = taskRows.indexOf(a.row);
        const bIndex = taskRows.indexOf(b.row);
        return aIndex - bIndex;
    });
}

function updateSubtasksOrder(): void {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const subtaskRows = allRows.filter(row => row.classList.contains('subtask-row'));
    
    subtasks.sort((a: any, b: any) => {
        const aIndex = subtaskRows.indexOf(a.row);
        const bIndex = subtaskRows.indexOf(b.row);
        return aIndex - bIndex;
    });
}

function saveTaskOrder(): void {
    const order = {
        tasks: tasks.map((t: any) => ({
            taskName: t.taskNameCell.querySelector('span')?.textContent?.trim() || '',
            dueDate: t.dueDateCell.textContent?.trim() || '',
            status: t.statusBadge.textContent?.trim() || '',
            owner: t.row.cells[5]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            reviewer: t.row.cells[6]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            cdoc: t.row.cells[7]?.textContent?.trim() || ''
        })),
        subtasks: subtasks.map((s: any) => ({
            taskName: s.taskNameCell.querySelector('span')?.textContent?.trim() || '',
            status: s.statusBadge.textContent?.trim() || '',
            owner: s.ownerCell.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            reviewer: s.reviewerCell.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || ''
        }))
    };
    localStorage.setItem('taskOrder', JSON.stringify(order));
}

function loadTaskOrder(): void {
    const savedOrder = localStorage.getItem('taskOrder');
    if (!savedOrder) return;
    try {
        const order = JSON.parse(savedOrder);
        console.log('Loaded saved order', order);
    } catch (e) {
        console.error('Failed to load saved order', e);
    }
}

function addDragStyles(): void {
    if (document.getElementById('skystemtaskmaster-drag-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'skystemtaskmaster-drag-styles';
    style.textContent = `/* Paste Drag Styles CSS here */`;
    document.head.appendChild(style);
}

function addUserStyles(): void {
    if (document.getElementById('skystemtaskmaster-user-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'skystemtaskmaster-user-styles';
    style.textContent = `/* Paste User Styles CSS here */`;
    document.head.appendChild(style);
}

function makeOwnerReviewerClickable(): void {
    tasks.forEach((task: any) => {
        const ownerCell = task.row.cells[5];
        const reviewerCell = task.row.cells[6];
        if (ownerCell) makeCellClickable(ownerCell, 'owner', task);
        if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', task);
    });
    
    subtasks.forEach((subtask: any) => {
        const ownerCell = subtask.ownerCell;
        const reviewerCell = subtask.reviewerCell;
        if (ownerCell) makeCellClickable(ownerCell, 'owner', subtask);
        if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', subtask);
    });
}

function makeCellClickable(cell: HTMLElement, type: string, item: any): void {
    const oldCell = cell.cloneNode(true) as HTMLElement;

    if (cell.parentNode) {
        cell.parentNode.replaceChild(oldCell, cell);
        cell = oldCell;
    }
    cell.classList.add('cell-clickable');
    cell.title = `Click to change ${type}`;

    cell.addEventListener('click', (e) => {
        e.stopPropagation();
        showUserModal(cell, type, item);
    });
}

function showUserModal(cell: HTMLElement, type: string, item: any): void {
    const badge = cell.querySelector('.skystemtaskmaster-badge');
    const currentInitials = badge ? badge.textContent?.trim() || '' : '';
    
    let modal = document.getElementById('userSelectionModal') as HTMLDivElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'userSelectionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-user-select">
                <span class="close">&times;</span>
                <h3 class="modal-title">Select ${type === 'owner' ? 'Owner' : 'Reviewer'}</h3>
                
                <div class="user-search-container">
                    <input type="text" id="userSearch" class="user-search-input" 
                           placeholder="Search by name or initials...">
                </div>
                
                <div class="user-list-container" id="userList"></div>
                
                <div class="user-modal-buttons">
                    <button id="unassignUserBtn" class="btn-unassign">Unassign</button>
                    <button id="closeUserModal" class="btn-close-modal">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('closeUserModal')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        const searchInput = document.getElementById('userSearch') as HTMLInputElement;
        searchInput?.addEventListener('keyup', () => {
            updateUserList(searchInput.value, currentInitials, type, cell, item);
        });
        
        document.getElementById('unassignUserBtn')?.addEventListener('click', () => {
            unassignUser(cell, type, item);
            modal.style.display = 'none';
        });
    }
    
    updateUserList('', currentInitials, type, cell, item);
    modal.style.display = 'block';
    
    setTimeout(() => {
        const searchInput = document.getElementById('userSearch') as HTMLInputElement;
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
    }, 100);
}

function updateUserList(searchText: string, currentInitials: string, type: string, cell: HTMLElement, item: any): void {
    const userList = document.getElementById('userList');
    if (!userList) return;
    
    const filtered = availableUsers.filter(user => {
        const searchLower = searchText.toLowerCase();
        return user.name.toLowerCase().indexOf(searchLower) !== -1 ||
               user.initials.toLowerCase().indexOf(searchLower) !== -1 ||
               user.email.toLowerCase().indexOf(searchLower) !== -1;
    });
    
    if (filtered.length === 0) {
        userList.innerHTML = '<div class="user-list-empty">No users found</div>';
        return;
    }
    
    userList.innerHTML = filtered.map(user => {
        const isCurrent = user.initials === currentInitials;
        return `
            <div class="user-item ${isCurrent ? 'user-item-current' : ''}" data-user='${JSON.stringify(user)}'>
                <span class="skystemtaskmaster-badge skystemtaskmaster-badge-${user.initials.toLowerCase()} user-badge">
                    ${user.initials}
                </span>
                <div class="user-info">
                    <div class="user-name">${escapeHtml(user.name)}</div>
                    <div class="user-details">${escapeHtml(user.email)} • ${escapeHtml(user.role)}</div>
                </div>
                ${isCurrent ? '<span class="user-checkmark">✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    userList.querySelectorAll('.user-item').forEach(el => {
        el.addEventListener('click', () => {
            const userData = el.getAttribute('data-user');
            if (userData) {
                const user = JSON.parse(userData);
                assignUser(cell, user, type, item);
                const modal = document.getElementById('userSelectionModal');
                if (modal) modal.style.display = 'none';
            }
        });
    });
}

function assignUser(cell: HTMLElement, user: any, type: string, item: any): void {
    cell.innerHTML = '';
    
    const badge = document.createElement('span');
    badge.className = `skystemtaskmaster-badge skystemtaskmaster-badge-${user.initials.toLowerCase()}`;
    badge.textContent = user.initials;
    badge.title = `${user.name} (${user.role})`;
    cell.appendChild(badge);
    
    makeCellClickable(cell, type, item);
    
    if ('dueDateCell' in item) {
        if (type === 'owner') {
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].row === item.row) {
                    const row = tasks[i].row;
                    const oldCell = row.cells[5];
                    const newCell = document.createElement('td');
                    newCell.innerHTML = cell.innerHTML;
                    newCell.className = oldCell.className;
                    newCell.style.cssText = oldCell.style.cssText;
                    row.replaceChild(newCell, oldCell);
                    tasks[i].row.cells[5] = newCell;
                    makeCellClickable(newCell, type, item);
                    break;
                }
            }
        } else {
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].row === item.row) {
                    const row = tasks[i].row;
                    const oldCell = row.cells[6];
                    const newCell = document.createElement('td');
                    newCell.innerHTML = cell.innerHTML;
                    newCell.className = oldCell.className;
                    newCell.style.cssText = oldCell.style.cssText;
                    row.replaceChild(newCell, oldCell);
                    tasks[i].row.cells[6] = newCell;
                    makeCellClickable(newCell, type, item);
                    break;
                }
            }
        }
    } else {
        if (type === 'owner') {
            for (let i = 0; i < subtasks.length; i++) {
                if (subtasks[i].row === item.row) {
                    subtasks[i].ownerCell = cell;
                    break;
                }
            }
        } else {
            for (let i = 0; i < subtasks.length; i++) {
                if (subtasks[i].row === item.row) {
                    subtasks[i].reviewerCell = cell;
                    break;
                }
            }
        }
    }
    
    showNotification(`Assigned ${user.name} as ${type}`);
}

function unassignUser(cell: HTMLElement, type: string, item: any): void {
    cell.innerHTML = '';
    
    const emptySpan = document.createElement('span');
    emptySpan.className = 'empty-assignee';
    emptySpan.textContent = '?';
    emptySpan.title = 'Click to assign';
    cell.appendChild(emptySpan);
    
    makeCellClickable(cell, type, item);
    showNotification(`${type} unassigned`);
}

function updateExistingBadges(): void {
    tasks.forEach((task: any) => {
        const ownerBadge = task.row.cells[5]?.querySelector('.skystemtaskmaster-badge');
        const reviewerBadge = task.row.cells[6]?.querySelector('.skystemtaskmaster-badge');
        
        if (ownerBadge) {
            const text = ownerBadge.textContent?.trim() || '';
            ownerBadge.className = `skystemtaskmaster-badge skystemtaskmaster-badge-${text.toLowerCase()}`;
        }
        
        if (reviewerBadge) {
            const text = reviewerBadge.textContent?.trim() || '';
            reviewerBadge.className = `skystemtaskmaster-badge skystemtaskmaster-badge-${text.toLowerCase()}`;
        }
    });
    
    subtasks.forEach((subtask: any) => {
        const ownerBadge = subtask.ownerCell?.querySelector('.skystemtaskmaster-badge');
        const reviewerBadge = subtask.reviewerCell?.querySelector('.skystemtaskmaster-badge');
        
        if (ownerBadge) {
            const text = ownerBadge.textContent?.trim() || '';
            ownerBadge.className = `skystemtaskmaster-badge skystemtaskmaster-badge-${text.toLowerCase()}`;
        }
        
        if (reviewerBadge) {
            const text = reviewerBadge.textContent?.trim() || '';
            reviewerBadge.className = `skystemtaskmaster-badge skystemtaskmaster-badge-${text.toLowerCase()}`;
        }
    });
}

function initializeUserSystem(): void {
    console.log('Initializing user system...');
    addUserStyles();
    updateExistingBadges();
    setTimeout(() => {
        makeOwnerReviewerClickable();
        console.log('User system ready');
    }, 500);
}

function initializeComments(): void {
    console.log('Initializing comments...');
    addCommentStyles();
    
    setTimeout(() => {
        updateCommentColumn();
    }, 500);
}

function updateCommentColumn(): void {
    console.log('Updating comment column...');
    tasks.forEach((task: any) => {
        if (task.row) {
            updateCommentCellForRow(task.row, task, 'task');
        }
    });
    subtasks.forEach((subtask: any) => {
        if (subtask.row) {
            updateCommentCellForRow(subtask.row, subtask, 'subtask');
        }
    });
}

function updateCommentCellForRow(row: HTMLElement, item: any, type: string): void {
    if (!row) return;
    const commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    
    commentCells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.add('comment-cell');
        let rowId = null;
        if (type === 'task') {
            rowId = (row as HTMLElement).dataset.taskId || item.id;
            if (!rowId && item.id) rowId = item.id;
        } else {
            rowId = (row as HTMLElement).dataset.subtaskId || item.id;
            if (!rowId && item.id) rowId = item.id;
        }
        
        if (!rowId) {
            rowId = type === 'task' ? 
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) : 
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            if (type === 'task') {
                (row as HTMLElement).dataset.taskId = rowId;
                if (item) item.id = rowId;
            } else {
                (row as HTMLElement).dataset.subtaskId = rowId;
                if (item) item.id = rowId;
            }
        }
        
        const finalRowId = rowId;
        const commentKey = getCommentKey(finalRowId, type);
        const comments = taskComments[commentKey] || [];
        const count = comments.length;
        
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('comment-icon-container');
        
        const icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = count > 0 ? `${count} comment${count > 1 ? 's' : ''}` : 'Add comment';
        
        if (count === 0) {
            icon.classList.add('comment-icon-empty');
        }
        
        iconContainer.appendChild(icon);
        
        if (count > 0) {
            iconContainer.classList.add('has-comments');
            const badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            badge.textContent = count.toString();
            iconContainer.appendChild(badge);
        }
        
        cell.appendChild(iconContainer);
        iconContainer.addEventListener('mouseenter', () => {
            icon.classList.add('comment-icon-hover');
            if (count === 0) {
                icon.classList.add('comment-icon-empty-hover');
            }
        });
        
        iconContainer.addEventListener('mouseleave', () => {
            icon.classList.remove('comment-icon-hover');
            icon.classList.remove('comment-icon-empty-hover');
        });
        
        iconContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openCommentPanel(finalRowId, type);
        });
    });
}

function createCommentPanel(): HTMLDivElement {
    let panel = document.getElementById('commentPanel') as HTMLDivElement;
    if (panel) return panel;
    
    panel = document.createElement('div');
    panel.id = 'commentPanel';
    panel.className = 'comment-panel';
    panel.innerHTML = `
        <div class="comment-panel-header">
            <span>Comments</span>
            <button class="close-panel">&times;</button>
        </div>
        <div class="comment-list"></div>
        <div class="comment-input-area">
            <textarea placeholder="Add a comment..." rows="2"></textarea>
            <button class="add-comment-btn">Post</button>
        </div>
    `;
    document.body.appendChild(panel);
    panel.querySelector('.close-panel')?.addEventListener('click', () => {
        panel.classList.remove('open');
        activeCommentRowId = null;
        activeCommentType = null;
        cancelEdit();
    });
    const postBtn = panel.querySelector('.add-comment-btn') as HTMLButtonElement;
    const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
    postBtn.addEventListener('click', () => {
        if (!activeCommentRowId || !activeCommentType) {
            alert('No active task selected');
            return;
        }
        
        const text = textarea.value.trim();
        if (!text) {
            alert('Please enter a comment');
            return;
        }
        
        const commentKey = getCommentKey(activeCommentRowId, activeCommentType);
        
        if (editingCommentId) {
            updateComment(commentKey, editingCommentId, text);
        } else {
            const comments = taskComments[commentKey] || [];
            
            const newComment = {
                id: 'c' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                author: 'PK',
                authorName: 'Palakh Khanna',
                text: text,
                timestamp: new Date().toISOString(),
                edited: false
            };
            
            comments.push(newComment);
            taskComments[commentKey] = comments;
        }
        
        textarea.value = '';
        renderComments(commentKey);
        updateCommentColumn();
    });
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            postBtn.click();
        } else if (e.key === 'Escape' && editingCommentId) {
            cancelEdit();
        }
    });
    
    return panel;
}

function openCommentPanel(rowId: string, type: string): void {
    const panel = createCommentPanel();
    activeCommentRowId = rowId;
    activeCommentType = type;
    
    const commentKey = getCommentKey(rowId, type);
    cancelEdit();
    renderComments(commentKey);
    
    panel.classList.add('open');
    
    setTimeout(() => {
        const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea) textarea.focus();
    }, 300);
}

function getCommentKey(rowId: string, type: string): string {
    return `${type}_${rowId}`;
}

function formatCommentDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatCommentTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
}

function getAuthorFullName(initials: string): string {
    const names: any = {
        'PK': 'Palakh Khanna',
        'SM': 'Sarah Miller',
        'MP': 'Mel Preparer',
        'PP': 'Poppy Pan',
        'JS': 'John Smith',
        'EW': 'Emma Watson',
        'DB': 'David Brown'
    };
    return names[initials] || initials;
}

function cancelEdit(): void {
    editingCommentId = null;
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
        const postBtn = panel.querySelector('.add-comment-btn') as HTMLButtonElement;
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
}

function startEditComment(commentKey: string, commentId: string): void {
    const comments = taskComments[commentKey] || [];
    const comment = comments.find((c: any) => c.id === commentId);
    if (!comment) return;
    
    editingCommentId = commentId;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
        const postBtn = panel.querySelector('.add-comment-btn') as HTMLButtonElement;
        textarea.value = comment.text;
        textarea.placeholder = 'Edit comment...';
        textarea.focus();
        postBtn.textContent = 'Update';
    }
    
    renderComments(commentKey);
}

function updateComment(commentKey: string, commentId: string, newText: string): void {
    const comments = taskComments[commentKey] || [];
    const comment = comments.find((c: any) => c.id === commentId);
    if (!comment) return;
    
    comment.text = newText;
    comment.edited = true;
    comment.timestamp = new Date().toISOString();
    
    taskComments[commentKey] = comments;
    editingCommentId = null;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
        const postBtn = panel.querySelector('.add-comment-btn') as HTMLButtonElement;
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
    
    renderComments(commentKey);
}

function deleteComment(commentKey: string, commentId: string): void {
    if (!confirm('Delete this comment?')) return;
    
    const comments = taskComments[commentKey] || [];
    const filtered = comments.filter((c: any) => c.id !== commentId);
    
    if (filtered.length === 0) {
        delete taskComments[commentKey];
    } else {
        taskComments[commentKey] = filtered;
    }
    
    if (editingCommentId === commentId) {
        cancelEdit();
    }
    
    renderComments(commentKey);
    updateCommentColumn();
}

function addCommentStyles(): void {
    if (document.getElementById('comment-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'comment-styles';
    style.textContent = `/* Paste the CSS from above here */`;
    document.head.appendChild(style);
}

function ensureAllTasksHaveIds(): void {
    console.log('Ensuring all tasks and subtasks have IDs...');
    tasks.forEach((task: any, index: number) => {
        if (!task.id) {
            task.id = 'task_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5);
        }
        
        if (task.row && !task.row.dataset.taskId) {
            task.row.dataset.taskId = task.id;
        }
    });
    subtasks.forEach((subtask: any, index: number) => {
        if (!subtask.id) {
            subtask.id = 'subtask_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5);
        }
        
        if (subtask.row && !subtask.row.dataset.subtaskId) {
            subtask.row.dataset.subtaskId = subtask.id;
        }
    });
    
    console.log('Tasks IDs ensured:', tasks.length, 'subtasks:', subtasks.length);
}

function attachCommentEventListeners(list: HTMLElement, commentKey: string): void {
    list.querySelectorAll('.edit-comment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = (btn as HTMLElement).dataset.id;
            if (commentId) startEditComment(commentKey, commentId);
        });
    });
    list.querySelectorAll('.delete-comment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = (btn as HTMLElement).dataset.id;
            if (commentId) deleteComment(commentKey, commentId);
        });
    });
}

function updateCommentIcon(rowId: string, type: string): void {
    const commentKey = getCommentKey(rowId, type);
    const comments = taskComments[commentKey] || [];
    const count = comments.length;
    let selector = '';
    if (type === 'task') {
        selector = `tr[data-task-id="${rowId}"] .comment-icon`;
    } else {
        selector = `tr[data-subtask-id="${rowId}"] .comment-icon`;
    }
    
    const icon = document.querySelector(selector);
    if (icon) {
        if (count > 0) {
            icon.setAttribute('data-count', count.toString());
            icon.classList.add('has-comments');
            icon.setAttribute('title', `${count} comment${count > 1 ? 's' : ''}`);
        } else {
            icon.removeAttribute('data-count');
            icon.classList.remove('has-comments');
            icon.setAttribute('title', 'Add comment');
        }
    }
}

function addCommentIcons(): void {
    document.querySelectorAll('.comment-icon').forEach(icon => icon.remove());
    updateCommentColumn();
}

function renderComments(commentKey: string): void {
    const panel = document.getElementById('commentPanel');
    if (!panel) return;
    
    const list = panel.querySelector('.comment-list') as HTMLElement;
    if (!list) return;
    
    const comments = taskComments[commentKey] || [];
    console.log('Rendering comments for key:', commentKey, 'Count:', comments.length);
    
    if (comments.length === 0) {
        list.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        return;
    }
    
    const sortedComments = [...comments].sort((a: any, b: any) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
    });
    
    list.innerHTML = sortedComments.map((c: any) => {
        const timestamp = new Date(c.timestamp);
        const formattedDate = formatCommentDate(timestamp);
        const formattedTime = formatCommentTime(timestamp);
        const isEditing = c.id === editingCommentId;
        
        return `
            <div class="comment-item ${isEditing ? 'editing' : ''}" data-comment-id="${c.id}">
                <div class="comment-header">
                    <span class="comment-author" style="background: ${getUserColor(c.author)}">${c.author}</span>
                    <div class="comment-meta">
                        <span class="comment-author-name">${getAuthorFullName(c.author)}</span>
                        <div class="comment-datetime">
                            <span class="comment-date">${formattedDate}</span>
                            <span class="comment-time">${formattedTime}</span>
                        </div>
                    </div>
                    ${c.edited ? '<span class="edited-badge">(edited)</span>' : ''}
                </div>
                <div class="comment-text">${escapeHtml(c.text)}</div>
                <div class="comment-actions">
                    <button class="edit-comment-btn" data-comment-id="${c.id}">Edit</button>
                    <button class="delete-comment-btn" data-comment-id="${c.id}">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    attachCommentEventListeners(list, commentKey);
}

function makeRecurrenceEditable(): void {
    console.log('Making recurrence cells editable...');

    document.querySelectorAll('.extra-cell[data-column="recurrenceType"]').forEach(cell => {
        const newCell = cell.cloneNode(true) as HTMLElement;
        cell.parentNode?.replaceChild(newCell, cell);

        newCell.classList.add('recurrence-editable');
        newCell.title = 'Click to change recurrence type';

        newCell.addEventListener('mouseenter', () => {
            newCell.classList.add('hovered');
        });

        newCell.addEventListener('mouseleave', () => {
            newCell.classList.remove('hovered');
        });

        newCell.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const row = newCell.closest('tr');
            if (!row) return;

            const task = tasks.find((t: any) => t.row === row);
            if (!task) return;

            const currentValue = newCell.textContent?.trim() || 'None';

            showRecurrenceTypeModal(task, newCell, currentValue);
        });
    });
}

function showRecurrenceTypeModal(task: any, cell: HTMLElement, currentValue: string): void {
    let modal = document.getElementById('recurrenceTypeModal') as HTMLDivElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recurrenceTypeModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Set Recurrence Type</h3>
                
                <div class="task-info-wrapper">
                    <div class="task-info">
                        <div class="task-info-label">Task:</div>
                        <div class="task-info-name">${task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task'}</div>
                    </div>
                    
                    <div class="current-recurrence-wrapper">
                        <label class="current-recurrence-label">Current Recurrence</label>
                        <div id="currentRecurrenceDisplay" class="current-recurrence-value">
                            ${currentValue || 'None'}
                        </div>
                    </div>
                    
                    <div class="select-recurrence-wrapper">
                        <label class="select-recurrence-label">Select Recurrence Type</label>
                        <select id="recurrenceTypeSelect" class="recurrence-select">
                            <option value="None">None</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                    
                    <div class="note-wrapper">
                        <strong>Note:</strong> Recurrence type determines the task's border color:
                        <span class="color-indicator gray"></span> Gray = Recurring
                        <span class="color-indicator blue"></span> Blue = Non-recurring
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button id="cancelRecurrenceTypeBtn" class="btn-cancel">Cancel</button>
                    <button id="saveRecurrenceTypeBtn" class="btn-save">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('cancelRecurrenceTypeBtn')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('saveRecurrenceTypeBtn')?.addEventListener('click', () => {
            const select = document.getElementById('recurrenceTypeSelect') as HTMLSelectElement;
            const newValue = select.value;
            const taskId = modal.getAttribute('data-current-task-id');
            const cellId = modal.getAttribute('data-current-cell-id');
            const targetCell = document.querySelector(`.extra-cell[data-recurrence-cell-id="${cellId}"]`) as HTMLElement;
            
            if (targetCell) {
                targetCell.textContent = newValue;
            } else if ((window as any).currentRecurrenceCell) {
                (window as any).currentRecurrenceCell.textContent = newValue;
            }
            
            if ((window as any).currentRecurrenceTask) {
                (window as any).currentRecurrenceTask.recurrenceType = newValue;
                const row = (window as any).currentRecurrenceTask.row;
                row.classList.remove('recurring-task', 'non-recurring-task');
                
                if (newValue !== 'None') {
                    row.classList.add('recurring-task');
                } else {
                    row.classList.add('non-recurring-task');
                }
                
                row.setAttribute('data-recurrence-type', newValue);
            }
            
            modal.style.display = 'none';
            showNotification(`Recurrence type set to: ${newValue}`);
            setTimeout(() => saveAllData(), 100);
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    const select = document.getElementById('recurrenceTypeSelect') as HTMLSelectElement;
    select.value = currentValue;
    
    const currentDisplay = document.getElementById('currentRecurrenceDisplay') as HTMLElement;
    if (currentDisplay) {
        currentDisplay.textContent = currentValue;
        if (currentValue !== 'None') {
            currentDisplay.classList.add('recurring');
            currentDisplay.classList.remove('non-recurring');
        } else {
            currentDisplay.classList.add('non-recurring');
            currentDisplay.classList.remove('recurring');
        }
    }
    
    (window as any).currentRecurrenceTask = task;
    (window as any).currentRecurrenceCell = cell;
    
    if (!cell.hasAttribute('data-recurrence-cell-id')) {
        const cellId = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        cell.setAttribute('data-recurrence-cell-id', cellId);
    }
    
    modal.setAttribute('data-current-task-id', task.id || task.row.dataset.taskId);
    modal.setAttribute('data-current-cell-id', cell.getAttribute('data-recurrence-cell-id') || '');
    
    modal.style.display = 'block';
}

function updateRecurrenceFromCell(cell: HTMLElement, newValue: string): void {
    const row = cell.closest('tr');
    if (!row) return;
    
    const task = tasks.find((t: any) => t.row === row);
    if (!task) return;

    task.recurrenceType = newValue;

    row.classList.remove('recurring-task', 'non-recurring-task');

    if (newValue !== 'None') {
        row.classList.add('recurring-task');
    } else {
        row.classList.add('non-recurring-task');
    }

    row.setAttribute('data-recurrence-type', newValue);

    const nameDiv = row.cells[0]?.querySelector('.skystemtaskmaster-task-name') as HTMLElement;

    if (nameDiv) {
        let indicator = nameDiv.querySelector('.recurrence-indicator') as HTMLElement;

        if (indicator) {
            indicator.textContent = newValue;
            indicator.title = `Recurrence: ${newValue} (Click to change)`;

            indicator.classList.remove('recurring', 'non-recurring');

            if (newValue !== 'None') {
                indicator.classList.add('recurring');
            } else {
                indicator.classList.add('non-recurring');
            }
        }
    }
}

function addRecurrenceEditorStyles(): void {
    if (document.querySelector('link[href*="recurrence-editor-styles.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'recurrence-editor-styles.css';
    document.head.appendChild(link);
}

function initializeRecurrenceEditor(): void {
    console.log('Initializing Recurrence Type Editor with new options...');
    addRecurrenceStyles();
    addRecurrenceEditorStyles();
    makeRecurrenceCellsClickable();
    setTimeout(() => {
        console.log('Retry 1: Making recurrence cells clickable');
        makeRecurrenceCellsClickable();
    }, 500);
    
    setTimeout(() => {
        console.log('Retry 2: Making recurrence cells clickable');
        makeRecurrenceCellsClickable();
    }, 1000);
    
    setTimeout(() => {
        console.log('Retry 3: Making recurrence cells clickable');
        makeRecurrenceCellsClickable();
    }, 2000);
    
    const observer = new MutationObserver((mutations) => {
        let shouldRetry = false;
        
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                shouldRetry = true;
            }
        });
        
        if (shouldRetry) {
            setTimeout(() => {
                makeRecurrenceCellsClickable();
            }, 100);
        }
    });
    
    const tbody = document.getElementById('mainTableBody');
    if (tbody) {
        observer.observe(tbody, { childList: true, subtree: true });
        console.log('Observer attached to tbody');
    }
}

function makeRecurrenceCellsClickable(): void {
    console.log('Making recurrence cells clickable...');
    
    const recurrenceCells = document.querySelectorAll('.extra-cell[data-column="recurrenceType"]');
    console.log('Found recurrence cells:', recurrenceCells.length);

    recurrenceCells.forEach((cell, index) => {
        if (cell.classList.contains('recurrence-initialized')) {
            return;
        }

        cell.classList.add('recurrence-initialized');
        cell.classList.add('recurrence-cell');
        cell.setAttribute('title', 'Click to change recurrence type');

        const newCell = cell.cloneNode(true) as HTMLElement;
        cell.parentNode?.replaceChild(newCell, cell);

        newCell.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            console.log('Recurrence cell clicked!');

            const row = this.closest('tr');
            if (!row) {
                console.error('No parent row found');
                return;
            }

            const task = tasks.find((t: any) => t.row === row);
            if (!task) {
                console.error('No task found for row');
                return;
            }

            const currentValue = this.textContent?.trim() || 'None';
            console.log('Current value:', currentValue);

            showRecurrenceTypeModal(task, this, currentValue);
        });

        console.log(`Cell ${index} initialized with click handler`);
    });
}

function makeRecurrenceCellClickable(row: HTMLElement, task: any): void {
    const recurrenceCell = row.querySelector('.extra-cell[data-column="recurrenceType"]') as HTMLElement;
    if (recurrenceCell) {
        recurrenceCell.classList.add('recurrence-cell-clickable');
        recurrenceCell.title = 'Click to change recurrence type';
        
        recurrenceCell.addEventListener('mouseenter', () => {
            recurrenceCell.classList.add('recurrence-cell-hover');
        });
        
        recurrenceCell.addEventListener('mouseleave', () => {
            recurrenceCell.classList.remove('recurrence-cell-hover');
        });
        
        recurrenceCell.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showRecurrenceTypeModal(task, recurrenceCell, recurrenceCell.textContent?.trim() || 'None');
        });
    }
}

function makeExtraCellsEditable(row: HTMLElement, task: any): void {
    row.querySelectorAll('.extra-cell').forEach(cell => {
        const colKey = cell.getAttribute('data-column');
        
        if (colKey === 'taskOwner' || colKey === 'createdBy' || colKey === 'approver') {
            makeExtraUserCellClickable(cell as HTMLElement, task, colKey);
        }
        else if (colKey === 'taskStatus') {
            makeStatusCellClickable(cell as HTMLElement, task);
        }
        else if (colKey === 'recurrenceType') {
            makeRecurrenceCellClickable(row, task);
        }
        else {
            makeGenericCellEditable(cell as HTMLElement, task, colKey);
        }
    });
}

function makeTaskStatusClickable(task: any): void {
    if (task.statusBadge) {
        task.statusBadge.style.cursor = 'pointer';
        task.statusBadge.title = 'Click to change status';
        
        const newBadge = task.statusBadge.cloneNode(true) as HTMLElement;
        task.statusBadge.parentNode?.replaceChild(newBadge, task.statusBadge);
        
        newBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showStatusChangeModal(task);
        });
        
        task.statusBadge = newBadge;
    }
    
    if (task.row) {
        const extraStatusCell = task.row.querySelector('.extra-cell[data-column="taskStatus"]') as HTMLElement;
        if (extraStatusCell) {
            makeStatusCellClickable(extraStatusCell, task);
        }
    }
}

function makeUserColumnsClickable(row: HTMLElement, task: any): void {
    row.querySelectorAll('.extra-cell[data-column="taskOwner"], .extra-cell[data-column="createdBy"], .extra-cell[data-column="approver"]').forEach(cell => {
        const colKey = cell.getAttribute('data-column');
        if (colKey) makeExtraUserCellClickable(cell as HTMLElement, task, colKey);
    });
}

function makeGenericCellEditable(cell: HTMLElement, task: any, columnKey: string): void {
    cell.classList.add('editable-cell');
    cell.title = `Click to edit ${columnKey}`;

    cell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const currentValue = cell.textContent?.trim() || '';
        const newValue = prompt(`Enter ${columnKey}:`, currentValue);

        if (newValue !== null && newValue.trim() !== '') {
            cell.textContent = newValue.trim();
            task[columnKey] = newValue.trim();

            showNotification(`${columnKey} updated to: ${newValue}`);
            setTimeout(() => saveAllData(), 100);
        }
    });
}

function updateCDocColumnForRow(row: HTMLElement): void {
    if (!row) return;
    
    const cdocCell = row.cells[7];
    if (!cdocCell) return;
    
    cdocCell.innerHTML = '';
    cdocCell.classList.add('doc-cell');
    
    const docs = taskDocuments.get(row) || [];
    
    const iconContainer = document.createElement('span');
    iconContainer.className = 'cdoc-icon-container';
    
    const icon = document.createElement('i');
    icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
    
    if (docs.length === 0) {
        icon.title = 'Click to upload documents';
    } else {
        icon.title = `${docs.length} document(s) attached`;
    }
    
    iconContainer.appendChild(icon);
    
    if (docs.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'cdoc-badge';
        badge.textContent = docs.length.toString();
        iconContainer.appendChild(badge);
    } else {
        const plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle cdoc-plus-icon';
        iconContainer.appendChild(plusIcon);
    }
    
    iconContainer.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        showDocumentManager(row);
    };
    
    cdocCell.appendChild(iconContainer);
}

function updateTDocColumnForRow(row: HTMLElement): void {
    if (!row) return;
    
    const tdocCell = row.cells[2];
    if (!tdocCell) return;
    
    tdocCell.innerHTML = '';
    tdocCell.classList.add('doc-cell');
    
    const docs = taskTDocDocuments.get(row) || [];
    
    const iconContainer = document.createElement('span');
    iconContainer.className = 'tdoc-icon-container';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-file-alt';
    
    if (docs.length === 0) {
        icon.title = 'Click to upload documents';
    } else {
        icon.classList.add('has-docs');
        icon.title = `${docs.length} document(s) attached`;
    }
    
    iconContainer.appendChild(icon);
    
    if (docs.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'tdoc-badge';
        badge.textContent = docs.length.toString();
        iconContainer.appendChild(badge);
    } else {
        const plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle tdoc-plus-icon';
        iconContainer.appendChild(plusIcon);
    }
    
    iconContainer.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        showTDocDocumentManager(row);
    };
    
    tdocCell.appendChild(iconContainer);
}

function updateCommentColumnForRow(row: HTMLElement, item: any, type: string): void {
    if (!row) return;
    
    const commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    
    commentCells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.add('comment-cell');
        
        let rowId = type === 'task' ? 
            ((row as HTMLElement).dataset.taskId || item.id) : 
            ((row as HTMLElement).dataset.subtaskId || item.id);
        
        if (!rowId) {
            rowId = type === 'task' ? 
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) : 
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            if (type === 'task') {
                (row as HTMLElement).dataset.taskId = rowId;
                if (item) item.id = rowId;
            } else {
                (row as HTMLElement).dataset.subtaskId = rowId;
                if (item) item.id = rowId;
            }
        }
        
        const commentKey = getCommentKey(rowId, type);
        const comments = taskComments[commentKey] || [];
        const count = comments.length;
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'comment-icon-container';
        
        const icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = count > 0 ? `${count} comment${count > 1 ? 's' : ''}` : 'Add comment';
        
        if (count === 0) {
            icon.classList.add('comment-icon-empty');
        }
        
        iconContainer.appendChild(icon);
        
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            badge.textContent = count.toString();
            iconContainer.appendChild(badge);
        }
        
        cell.appendChild(iconContainer);
        
        iconContainer.addEventListener('mouseenter', () => {
            icon.classList.add('comment-icon-hover');
            if (count === 0) {
                icon.classList.add('comment-icon-empty-hover');
            }
        });
        
        iconContainer.addEventListener('mouseleave', () => {
            icon.classList.remove('comment-icon-hover');
            icon.classList.remove('comment-icon-empty-hover');
        });
        
        iconContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Comment icon clicked');
            openCommentPanel(rowId, type);
        });
    });
}

function updateRecurrenceClasses(): void {
    tasks.forEach((task: any) => {
        if (task.row) {
            const recurrenceType = task.recurrenceType || 'None';
            const recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
            const isRecurring = recurringOptions.includes(recurrenceType);
            task.row.classList.remove('recurring-task', 'non-recurring-task');
            if (isRecurring) {
                task.row.classList.add('recurring-task');
            } else {
                task.row.classList.add('non-recurring-task');
            }
            task.row.setAttribute('data-recurrence-type', recurrenceType);
        }
    });
    
    console.log('Recurrence classes updated for', tasks.length, 'tasks');
}

function updateTaskRecurrence(taskId: string, newRecurrenceType: string): void {
    const task = tasks.find((t: any) => t.id === taskId || t.row.dataset.taskId === taskId);

    if (task) {
        const oldType = task.recurrenceType || 'None';
        task.recurrenceType = newRecurrenceType;

        const isRecurring = newRecurrenceType !== 'None';

        task.row.classList.remove('recurring-task', 'non-recurring-task');
        task.row.classList.add(isRecurring ? 'recurring-task' : 'non-recurring-task');

        task.row.setAttribute('data-recurrence-type', newRecurrenceType);

        const nameDiv = task.row.cells[0].querySelector('.skystemtaskmaster-task-name') as HTMLElement;

        if (nameDiv) {
            let indicator = nameDiv.querySelector('.recurrence-indicator') as HTMLElement;

            if (indicator) {
                indicator.textContent = newRecurrenceType;
                indicator.title = `Recurrence: ${newRecurrenceType} (Click to change)`;

                indicator.classList.remove('recurring', 'non-recurring');
                indicator.classList.add(isRecurring ? 'recurring' : 'non-recurring');

            } else {
                addRecurrenceEditor();
            }
        }

        console.log(`Task ${taskId} recurrence updated from ${oldType} to ${newRecurrenceType}`);
        showNotification(`Recurrence set to: ${newRecurrenceType}`);

        setTimeout(() => saveAllData(), 100);
    }
}

function syncRecurrenceFromColumn(): void {
    tasks.forEach((task: any) => {
        const extraCells = task.row.querySelectorAll('.extra-cell');
        let recurrenceValue = 'None';
        
        extraCells.forEach(cell => {
            const colKey = cell.getAttribute('data-column');
            if (colKey === 'recurrenceType') {
                recurrenceValue = cell.textContent?.trim() || 'None';
            }
        });
        if (task.recurrenceType !== recurrenceValue) {
            task.recurrenceType = recurrenceValue;
            const nameDiv = task.row.cells[0].querySelector('.skystemtaskmaster-task-name') as HTMLElement;
            if (nameDiv) {
                let indicator = nameDiv.querySelector('.recurrence-indicator') as HTMLElement;
                if (indicator) {
                    indicator.textContent = recurrenceValue;
                    indicator.style.background = recurrenceValue !== 'None' ? '#808080' : '#00cfff';
                    indicator.title = `Recurrence: ${recurrenceValue} (Click to change)`;
                }
            }
            task.row.classList.remove('recurring-task', 'non-recurring-task');
            if (recurrenceValue !== 'None') {
                task.row.classList.add('recurring-task');
            } else {
                task.row.classList.add('non-recurring-task');
            }
            task.row.setAttribute('data-recurrence-type', recurrenceValue);
        }
    });
}

function showRecurrenceModal(task: any): void {
    let modal = document.getElementById('recurrenceModal') as HTMLDivElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recurrenceModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Set Recurrence</h3>
                
                <div class="recurrence-modal-body">
                    <div class="task-info-box">
                        <div class="task-info-label">Task:</div>
                        <div class="task-info-name">${escapeHtml(task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task')}</div>
                    </div>
                    
                    <div class="current-recurrence-box">
                        <label class="current-recurrence-label">Current Recurrence</label>
                        <div id="currentRecurrenceDisplay" class="current-recurrence-value">
                            ${task.recurrenceType || 'None'}
                        </div>
                    </div>
                    
                    <div class="new-recurrence-box">
                        <label class="new-recurrence-label">New Recurrence Type</label>
                        <select id="recurrenceTypeSelect" class="recurrence-select">
                            <option value="None">None (Non-recurring)</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                    
                    <div class="recurrence-note">
                        <strong>Note:</strong> Recurring tasks show a gray left border, non-recurring show blue.
                        The recurrence type will also appear next to the task name.
                    </div>
                </div>
                
                <div class="recurrence-modal-buttons">
                    <button id="cancelRecurrenceBtn" class="btn-cancel">Cancel</button>
                    <button id="saveRecurrenceBtn" class="btn-save">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('cancelRecurrenceBtn')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('saveRecurrenceBtn')?.addEventListener('click', () => {
            const newType = (document.getElementById('recurrenceTypeSelect') as HTMLSelectElement).value;
            const taskId = modal.getAttribute('data-current-task-id') as string;
            updateTaskRecurrence(taskId, newType);
            modal.style.display = 'none';
        });
    }
    
    const select = document.getElementById('recurrenceTypeSelect') as HTMLSelectElement;
    select.value = task.recurrenceType || 'None';
    
    const currentDisplay = document.getElementById('currentRecurrenceDisplay') as HTMLElement;
    if (currentDisplay) {
        currentDisplay.textContent = task.recurrenceType || 'None';
        if (task.recurrenceType && task.recurrenceType !== 'None') {
            currentDisplay.classList.add('recurring');
            currentDisplay.classList.remove('non-recurring');
        } else {
            currentDisplay.classList.add('non-recurring');
            currentDisplay.classList.remove('recurring');
        }
    }
    
    modal.setAttribute('data-current-task-id', task.id || task.row.dataset.taskId);
    modal.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {    
    setTimeout(() => {
        addRecurrenceStyles();
        updateRecurrenceClasses();
        addRecurrenceEditor();
        console.log('Recurrence indicators initialized');
    }, 600);
});

function createSampleData(): void {
    const mainList = createMainList('Yearly Report 2025');
    
    setTimeout(() => {
        const subList = createSubList(mainList, 'Monthly Report - January');
        
        setTimeout(() => {
            createTask(subList, {
                name: 'Generate A/R Aging Repository',
                acc: '☑',
                tdoc: '',
                owner: 'PK',
                reviewer: 'SM',
                dueDate: '2025-12-15'
            });
            
            createTask(subList, {
                name: 'Allowance for Bad Debt',
                acc: '☑',
                tdoc: '',
                owner: 'SM',
                reviewer: 'SM',
                dueDate: '2025-12-12'
            });
            
            createTask(subList, {
                name: 'Gather Foreign Bank Schedules',
                acc: '☑',
                tdoc: '',
                owner: 'PK',
                reviewer: 'SM',
                dueDate: '2025-12-05'
            });
        }, 100);
    }, 100);
}

function addSortStyles(): void {
    if (document.querySelector('link[href*="sort-styles.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'sort-styles.css';
    document.head.appendChild(link);
}

let importedTasksData: any[] = [];

function initializeFileImport(): void {
    console.log('Initializing file import...');
    
    const dropArea = document.getElementById('importDropArea');
    const fileInput = document.getElementById('importFileInput') as HTMLInputElement;
    const browseBtn = document.getElementById('importBrowseFileBtn');
    const cancelBtn = document.getElementById('cancelImportBtn');
    const processBtn = document.getElementById('processImportBtn');
    const previewArea = document.getElementById('importPreviewArea');
    const previewBody = document.getElementById('importPreviewBody');
    
    if (!dropArea || !fileInput || !browseBtn || !cancelBtn || !processBtn) return;
    
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = fileInput.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    });
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-over');
    });
    
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    });
    
    cancelBtn.addEventListener('click', () => {
        resetImportModal();
        const importTasksModal = document.getElementById('importTasksModal');
        if (importTasksModal) importTasksModal.style.display = 'none';
    });
    
    processBtn.addEventListener('click', () => {
        importTasks();
    });
    
    function processFile(file: File): void {
        console.log('Processing file:', file.name);
        
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (fileExtension === 'csv') {
            parseCSV(file);
        } else if (fileExtension === 'json') {
            parseJSON(file);
        } else if (fileExtension === 'txt') {
            parseTXT(file);
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            showNotification('Excel support coming soon! Please use CSV for now.');
            showSampleFormat();
        } else {
            alert('Unsupported file format. Please use CSV, JSON, or TXT.');
        }
    }
    
    function parseCSV(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            const taskNameIndex = headers.findIndex(h => h.includes('task') || h.includes('name'));
            const ownerIndex = headers.findIndex(h => h.includes('owner'));
            const reviewerIndex = headers.findIndex(h => h.includes('reviewer'));
            const dueDateIndex = headers.findIndex(h => h.includes('due') || h.includes('date'));
            
            importedTasksData = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',').map(v => v.trim());
                
                const task = {
                    name: values[taskNameIndex] || `Task ${i}`,
                    owner: values[ownerIndex] || 'PK',
                    reviewer: values[reviewerIndex] || 'SM',
                    dueDate: values[dueDateIndex] || '',
                    acc: '+',
                    tdoc: '0',
                    status: 'Not Started'
                };
                
                importedTasksData.push(task);
            }
            
            showPreview(importedTasksData);
        };
        reader.readAsText(file);
    }
    
    function parseJSON(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target?.result as string);
                
                if (Array.isArray(content)) {
                    importedTasksData = content.map((item: any) => ({
                        name: item.name || item.taskName || item.task || 'Unnamed Task',
                        owner: item.owner || item.taskOwner || 'PK',
                        reviewer: item.reviewer || 'SM',
                        dueDate: item.dueDate || item.due || '',
                        acc: item.acc || '+',
                        tdoc: item.tdoc || item.tDoc || '0',
                        status: item.status || item.taskStatus || 'Not Started'
                    }));
                } else if (content.tasks && Array.isArray(content.tasks)) {
                    importedTasksData = content.tasks.map((item: any) => ({
                        name: item.name || item.taskName || 'Unnamed Task',
                        owner: item.owner || 'PK',
                        reviewer: item.reviewer || 'SM',
                        dueDate: item.dueDate || '',
                        acc: item.acc || '+',
                        tdoc: item.tdoc || '0',
                        status: item.status || 'Not Started'
                    }));
                }
                
                showPreview(importedTasksData);
            } catch (error) {
                alert('Invalid JSON file: ' + (error as Error).message);
            }
        };
        reader.readAsText(file);
    }
    
    function parseTXT(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.split('\n');
            
            importedTasksData = lines
                .filter(line => line.trim())
                .map((line, index) => ({
                    name: line.trim(),
                    owner: 'PK',
                    reviewer: 'SM',
                    dueDate: '',
                    acc: '+',
                    tdoc: '0',
                    status: 'Not Started'
                }));
            
            showPreview(importedTasksData);
        };
        reader.readAsText(file);
    }
    
    function showSampleFormat(): void {
        importedTasksData = [
            { name: 'Sample Task 1', owner: 'PK', reviewer: 'SM', dueDate: '2025-12-31', acc: '+', tdoc: '0', status: 'Not Started' },
            { name: 'Sample Task 2', owner: 'SM', reviewer: 'PK', dueDate: '2025-12-15', acc: '+', tdoc: '0', status: 'Not Started' }
        ];
        showPreview(importedTasksData);
    }
    
    function showPreview(tasks: any[]): void {
        if (!previewBody || !previewArea) return;
        
        (previewArea as HTMLElement).style.display = 'block';
        (processBtn as HTMLButtonElement).disabled = false;
        
        const previewHtml = tasks.slice(0, 5).map(task => `
            <tr class="preview-row">
                <td class="preview-cell">${escapeHtml(task.name)}</td>
                <td class="preview-cell">${escapeHtml(task.owner)}</td>
                <td class="preview-cell">${escapeHtml(task.reviewer)}</td>
                <td class="preview-cell">${escapeHtml(task.dueDate || 'Not set')}</td>
            </tr>
        `).join('');
        
        if (tasks.length > 5) {
            previewBody.innerHTML = previewHtml + `
                <tr class="preview-more-row">
                    <td colspan="4" class="preview-more-cell">
                        ... and ${tasks.length - 5} more tasks
                    </td>
                </tr>
            `;
        } else {
            previewBody.innerHTML = previewHtml;
        }
        
        document.getElementById('importPreviewCount')?.remove();
        
        const countDisplay = document.createElement('div');
        countDisplay.id = 'importPreviewCount';
        countDisplay.className = 'preview-count';
        countDisplay.textContent = `Total ${tasks.length} task(s) ready to import`;
        
        previewArea.appendChild(countDisplay);
    }
    
    function importTasks(): void {
        if (importedTasksData.length === 0) {
            alert('No tasks to import');
            return;
        }
        
        const importTarget = (document.querySelector('input[name="importTarget"]:checked') as HTMLInputElement)?.value;
        const skipDuplicates = (document.getElementById('skipDuplicates') as HTMLInputElement).checked;
        
        let targetList = null;
        
        if (importTarget === 'newList') {
            const listName = prompt('Enter name for new list:', 'Imported Tasks ' + new Date().toLocaleDateString());
            if (!listName) return;
            
            targetList = createMainList(listName);
            setTimeout(() => {
                const subList = createSubList(targetList, 'Imported Tasks');
                importTasksToSublist(subList, importedTasksData, skipDuplicates);
            }, 100);
        } else {
            if (subLists.length === 0) {
                alert('Please create a list first');
                return;
            }
            
            const targetSublist = subLists[subLists.length - 1];
            importTasksToSublist(targetSublist, importedTasksData, skipDuplicates);
        }
        
        resetImportModal();
        const importTasksModal = document.getElementById('importTasksModal');
        if (importTasksModal) importTasksModal.style.display = 'none';
        showNotification(`Successfully imported ${importedTasksData.length} tasks!`);
    }
    
    function importTasksToSublist(sublist: any, tasks: any[], skipDuplicates: boolean): void {
        const existingTaskNames = sublist.tasks.map((t: any) => t.name.toLowerCase());
        
        tasks.forEach((taskData: any) => {
            if (skipDuplicates && existingTaskNames.includes(taskData.name.toLowerCase())) {
                console.log('Skipping duplicate task:', taskData.name);
                return;
            }
            createTask(sublist, {
                name: taskData.name,
                acc: taskData.acc || '+',
                tdoc: taskData.tdoc || '0',
                owner: taskData.owner || 'PK',
                reviewer: taskData.reviewer || 'SM',
                dueDate: taskData.dueDate || '',
                status: taskData.status || 'Not Started'
            });
        });
    }
    
    function resetImportModal(): void {
        importedTasksData = [];
        if (previewArea) (previewArea as HTMLElement).style.display = 'none';
        if (previewBody) previewBody.innerHTML = '';
        if (processBtn) (processBtn as HTMLButtonElement).disabled = true;
        if (fileInput) fileInput.value = '';
    }
}

function addRecurrenceEditor(): void {
    // Implementation needed
}

function addFilterStyles(): void {
    // Implementation needed
}

function toggleMainList(mainList: any): void {
    mainList.isExpanded = !mainList.isExpanded;
    
    const icon = mainList.insideCollapseIcon?.querySelector('i');
    if (icon) {
        icon.className = mainList.isExpanded ? 'fas fa-angle-down' : 'fas fa-angle-right';
    }
    
    const tbody = mainList.tbody;
    if (tbody) {
        let nextRow = mainList.titleRow.nextSibling;
        while (nextRow && nextRow.classList && !nextRow.classList.contains('main-list-title-row')) {
            (nextRow as HTMLElement).style.display = mainList.isExpanded ? '' : 'none';
            nextRow = nextRow.nextSibling;
        }
    }
}

function createTask(subList: any, taskData: any): any {
    const task = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        subListId: subList.id,
        name: taskData.name,
        acc: taskData.acc || '+',
        tdoc: taskData.tdoc || '0',
        owner: taskData.owner || 'PK',
        reviewer: taskData.reviewer || 'SM',
        dueDate: taskData.dueDate || '',
        status: taskData.status || 'Not Started',
        taskNumber: taskData.taskNumber || 'TSK-' + Math.floor(100 + Math.random() * 900),
        taskOwner: taskData.taskOwner || taskData.owner || 'PK',
        taskStatus: taskData.taskStatus || taskData.status || 'Not Started',
        approver: taskData.approver || '—',
        recurrenceType: taskData.recurrenceType || 'None',
        completionDoc: taskData.completionDoc || taskData.cdoc || '0',
        createdBy: taskData.createdBy || 'PK',
        comment: taskData.comment || '',
        assigneeDueDate: taskData.assigneeDueDate || taskData.dueDate || '',
        customField1: taskData.customField1 || '',
        reviewerDueDate: taskData.reviewerDueDate || '',
        customField2: taskData.customField2 || '',
        linkedAccounts: taskData.linkedAccounts || '',
        completionDate: taskData.completionDate || '',
        notifier: taskData.notifier || '',
        row: null
    };
    
    subList.tasks.push(task);
    tasks.push(task);
    createTaskRow(task, subList);
    
    setTimeout(() => {
        if (task.row) {
            taskDocuments.set(task.row, []);
            taskTDocDocuments.set(task.row, []);
            
            initializeAccountForRow(task.row, task);
            
            updateCommentColumn();
            
            updateCDocColumnForRow(task.row);
            updateTDocColumnForRow(task.row);
            
            makeExtraCellsEditable(task.row, task);
            
            console.log('Task fully initialized:', task.name);
        }
    }, 300);
    
    showNotification(`Task "${taskData.name}" created`);
    return task;
}

function initializeAccountForRow(row: HTMLElement, task: any): void {
    if (!row) return;
    
    const accountCells = row.querySelectorAll('.extra-cell[data-column="linkedAccounts"]');
    
    accountCells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.add('account-cell');
        
        const taskId = task.id || (row as HTMLElement).dataset.taskId;
        const accounts = taskAccounts.get(row) || taskAccounts.get(taskId) || [];
        
        if (accounts && accounts.length > 0) {
            accounts.forEach((account: any) => {
                const badge = document.createElement('span');
                badge.textContent = account.accountName ? 
                    (account.accountName.substring(0, 12) + (account.accountName.length > 12 ? '...' : '')) : 
                    (account.accountNumber || 'Account');
                badge.classList.add('account-badge');
                badge.title = account.accountName || account.accountNumber || 'Account';
                
                badge.onclick = (e) => {
                    e.stopPropagation();
                    showAccountDetails(account, row, task);
                };
                
                cell.appendChild(badge);
            });
            
            const addMore = document.createElement('span');
            addMore.textContent = '+';
            addMore.classList.add('account-add-more');
            addMore.onclick = (e) => {
                e.stopPropagation();
                showAccountLinkingModal(row, task);
            };
            cell.appendChild(addMore);
            
        } else {
            const addIcon = document.createElement('span');
            addIcon.textContent = '+ Link Account';
            addIcon.classList.add('account-link-button');
            addIcon.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('+ Link Account clicked');
                showAccountLinkingModal(row, task);
            };
            
            cell.appendChild(addIcon);
        }
        
        cell.onclick = (e) => {
            if (e.target === cell || (e.target as HTMLElement).classList.contains('account-cell')) {
                showAccountLinkingModal(row, task);
            }
        };
    });
}

function createSubtaskRow(subtask: any, subList: any): void {
    // Implementation needed
}

function addDependentTaskStyles(): void {
    // Implementation needed
}

function initializeDependentTasks(): void {
    // Implementation needed
}

function saveDependentTasks(): void {
    // Implementation needed
}

function refreshDependentTaskUI(): void {
    // Implementation needed
}

function getAccountsHTML(currentAccounts: any[]): string {
    return currentAccounts.map(acc => renderAccountBadge(acc)).join('');
}

function getTaskAccounts(task: any, taskId: string): any[] {
    return taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];
}

function setTaskAccounts(task: any, taskId: string, accounts: any[]): void {
    taskAccounts.set(task.row, accounts);
    if (taskId) taskAccounts.set(taskId, accounts);
}

function renderAccounts(container: HTMLElement, accounts: any[]): void {
    container.innerHTML = accounts.map(acc => renderAccountBadge(acc)).join('');
}

function getUserColor(initials: string): string {
    const colors: any = {
        'PK': '#ff0080',
        'SM': '#00cfff',
        'MP': '#9c27b0',
        'PP': '#ff9800',
        'JS': '#4caf50',
        'EW': '#f44336',
        'DB': '#795548'
    };
    return colors[initials] || '#999';
}

let currentSort: any = {
    column: '',
    direction: 'asc'
};

function updateSortIcons(headerElement: HTMLElement): void {
    // Implementation needed
}

function addStyles(): void {
    // Implementation needed
}

function addFilterStyles(): void {
    // Implementation needed
}

function addRecurrenceEditor(): void {
    // Implementation needed
}

const defaultFilters: any = {
    status: 'all',
    owner: 'all',
    reviewer: 'all',
    dueDate: 'all',
    recurrence: 'all',
    hideEmptyLists: false,
    showTaskCount: false
};

// ================================
// DOM CONTENT LOADED
// ================================
document.addEventListener('DOMContentLoaded', () => {
    addStyles();
    addSeparateTableStyles();
    addSortStyles();
    loadColumnVisibility();
    createModals();
    initializeData();
    initializeCleanStructure();
    initializeEventListeners();
    
    setTimeout(() => {
        addExtraColumns();
        addDataCells();
        updateCounts();
        calculateDays();
        initializeDeleteButton();
        makeExistingTasksEditable();
        initializeColumnSorting();
        const btn = document.getElementById('customGridBtn');
        if (btn) btn.addEventListener('click', showCustomizeGridModal);   
        initializeDownloadButton();
        initializeFilterButton();
        initializeTaskDropdown();
        initializeSortButton();
        addDocumentStyles();
        initializeTDocManager();    
        initializeDocumentManager(); 
        refreshLinkedAccountsColumn();
        initializeStatus();
        initializeDragAndDrop();
        loadTaskOrder();
        initializeStatusSync();
        initializeUserSystem();
        initializeComments();
        initializeTaskStatus();
        initializeRecurrenceEditor();
        initializeSimpleUserColumns();
        initializeFileImport();
        initializeSortingWithIcons();

        const linkedAccountsCol = columnConfig.find(c => c.key === 'linkedAccounts');
        if (linkedAccountsCol) linkedAccountsCol.visible = true;
        
        setTimeout(() => {
            refreshLinkedAccountsColumn();
        }, 100);
        
        const hasSavedData = loadAllData();
        if (!hasSavedData) {
            createSampleData();
        }
        
        setTimeout(() => {
            console.log('Force updating document columns...');
            updateTDocColumn();
            updateCDocColumn();
            refreshLinkedAccountsColumn();
        }, 200);
        
        setupAutoSave();
        setTimeout(() => saveAllData(), 500);
        
        console.log('Task Viewer fully initialized with separate tables');
    }, 500);
});
