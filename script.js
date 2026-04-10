"use strict";

// ================================
// GLOBAL VARIABLES
// ================================
let mainLists = [];
let subLists = [];
let tasks = [];
let subtasks = [];
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
const taskComments = {};
let draggedItem = null;
let currentTaskForStatus = null;
let currentSubtaskForStatus = null;
let activeCommentRowId = null;
let activeCommentType = null;
let editingCommentId = null;
const availableUsers = [
    { id: '1', name: 'Palakh Khanna', email: 'palakh@skystem.com', initials: 'PK', role: 'Owner' },
    { id: '2', name: 'Sarah Miller', email: 'sarah@skystem.com', initials: 'SM', role: 'Reviewer' },
    { id: '3', name: 'Mel Preparer', email: 'mel@skystem.com', initials: 'MP', role: 'Preparer' },
    { id: '4', name: 'Poppy Pan', email: 'poppy@skystem.com', initials: 'PP', role: 'Approver' },
    { id: '5', name: 'John Smith', email: 'john@skystem.com', initials: 'JS', role: 'Reviewer' },
    { id: '6', name: 'Emma Watson', email: 'emma@skystem.com', initials: 'EW', role: 'Owner' },
    { id: '7', name: 'David Brown', email: 'david@skystem.com', initials: 'DB', role: 'Reviewer' }
];
function addSeparateTableStyles() {
    const link = document.createElement('link');
    link.id = 'separate-table-styles';
    link.rel = 'stylesheet';
    link.href = 'separate-table-styles.css';
    document.head.appendChild(link);
}
// ================================
// INITIALIZE DATA
// ================================
function initializeData() {
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
function addSublistStyles() {
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

function makeCellClickableForPopup(cell, item, columnKey, columnLabel) {
    if (!cell) return;
    
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    cell.title = `Click to change ${columnLabel}`;
    
    cell.addEventListener('mouseenter', () => {
        cell.style.backgroundColor = '#fff0f5';
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = '';
    });
    

    const newCell = cell.cloneNode(true);
    cell.parentNode.replaceChild(newCell, cell);
    
    
    newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        console.log(`${columnKey} clicked`);
        
        const currentValue = newCell.textContent.trim() || '—';
        
        showSimpleUserModal(item, newCell, columnKey, columnLabel, currentValue);
    });
    
    return newCell;
}
function showSimpleUserModal(item, cell, columnKey, columnLabel, currentValue) {
    removeExistingModal();

    const modal = createModal(item, columnLabel, currentValue);
    document.body.appendChild(modal);

    // Store global references
    window.simpleItem = item;
    window.simpleCell = cell;
    window.simpleColumnKey = columnKey;
    window.simpleColumnLabel = columnLabel;

    // Load list
    updateSimpleUserList('', currentValue);

    bindModalEvents(modal, columnLabel, currentValue);
}

/* ------------------ HELPERS ------------------ */

function removeExistingModal() {
    const existingModal = document.getElementById('simpleUserModal');
    if (existingModal) existingModal.remove();
}

function createModal(item, columnLabel, currentValue) {
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

function bindModalEvents(modal, columnLabel, currentValue) {
    // Close
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    document.getElementById('simpleCloseBtn').onclick = () => modal.remove();

    // Unassign
    document.getElementById('simpleUnassignBtn').onclick = () => {
        if (window.simpleCell) {
            window.simpleCell.textContent = '—';
            updateSimpleField(window.simpleItem, window.simpleColumnKey, '—');
            showNotification(`${columnLabel} unassigned`);
        }
        modal.remove();
    };

    // Search
    document.getElementById('simpleUserSearch').onkeyup = (e) => {
        updateSimpleUserList(e.target.value, currentValue);
    };
}
function updateSimpleUserList(search, currentValue) {
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

function bindUserClickEvents() {
    document.querySelectorAll('.user-item').forEach(el => {
        el.addEventListener('click', () => {
            const initials = el.dataset.initials;
            const name = el.dataset.name;

            if (window.simpleCell) {
                window.simpleCell.textContent = initials;
                updateSimpleField(window.simpleItem, window.simpleColumnKey, initials);
                showNotification(`${window.simpleColumnLabel} set to ${name}`);
            }

            document.getElementById('simpleUserModal')?.remove();
        });
    });
}


function updateSimpleField(item, columnKey, value) {
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

function initializeSimpleUserColumns() {
    console.log('Initializing user columns...');
    
    setTimeout(() => {
        document.querySelectorAll('.task-row, .subtask-row').forEach(row => {
            const task = tasks.find(t => t.row === row);
            const subtask = subtasks.find(s => s.row === row);
            const item = task || subtask;
            
            if (!item) return;
            
            row.querySelectorAll('.extra-cell').forEach(cell => {
                const colKey = cell.getAttribute('data-column');
                
                if (colKey === 'taskOwner') {
                    makeCellClickableForPopup(cell, item, 'taskOwner', 'Owner');
                }
                else if (colKey === 'createdBy') {
                    makeCellClickableForPopup(cell, item, 'createdBy', 'Created By');
                }
                else if (colKey === 'approver') {
                    makeCellClickableForPopup(cell, item, 'approver', 'Approver');
                }
            });
        });
        
        console.log('User columns initialized');
    }, 1000);
}
function addExtraColumns() {
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
function addDataCells() {
    document.querySelectorAll('.task-row').forEach(row => {
        const taskId = row.dataset.taskId || '1';
        
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
                makeExtraCellsEditable(row, task);
            }, 50);
        }
    });
    
    document.querySelectorAll('.subtask-row').forEach(row => {
    });
}
function reinitializeUI() {
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
function makeExtraUserCellClickable(cell, item, columnKey) {
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    
    let titleText = 'Click to change ';
    if (columnKey === 'taskOwner') titleText += 'Task Owner';
    else if (columnKey === 'createdBy') titleText += 'Created By';
    else if (columnKey === 'approver') titleText += 'Approver';
    cell.title = titleText;
    
    cell.addEventListener('mouseenter', () => {
        cell.style.backgroundColor = '#fff0f5';
        cell.style.transform = 'scale(1.02)';
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = '';
        cell.style.transform = 'scale(1)';
    });
    
    const newCell = cell.cloneNode(true);
    cell.parentNode.replaceChild(newCell, cell);
    
    newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        console.log(`${columnKey} cell clicked!`);
        
        if (item && item.row) {
            const currentValue = newCell.textContent.trim();
            
            let columnDisplayName = '';
            if (columnKey === 'taskOwner') columnDisplayName = 'Owner';
            else if (columnKey === 'createdBy') columnDisplayName = 'Created By';
            else if (columnKey === 'approver') columnDisplayName = 'Approver';
            
            showExtraUserSelectionModal(item, newCell, columnKey, columnDisplayName, currentValue);
        }
    });
    
    return newCell;
}

function showExtraUserSelectionModal(item, cell, columnKey, columnDisplayName, currentValue) {
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
    

    window.currentExtraItem = item;
    window.currentExtraCell = cell;
    window.currentExtraColumnKey = columnKey;
    window.currentExtraColumnName = columnDisplayName;
    window.currentExtraValue = currentValue;
    
    updateUserListInModal('', currentValue);
    

    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
        clearExtraUserReferences();
    });
    

    document.getElementById('closeUserModalBtn').addEventListener('click', () => {
        modal.remove();
        clearExtraUserReferences();
    });
    

    document.getElementById('unassignUserBtn').addEventListener('click', () => {
        if (window.currentExtraCell) {
            window.currentExtraCell.textContent = '—';
            updateExtraUserField(window.currentExtraItem, window.currentExtraColumnKey, '—');
            showNotification(`${window.currentExtraColumnName} unassigned`);
        }
        modal.remove();
        clearExtraUserReferences();
    });
    

    const searchInput = document.getElementById('userSearchInput');
    searchInput.addEventListener('keyup', () => {
        updateUserListInModal(searchInput.value, window.currentExtraValue);
    });
    

    setTimeout(() => {
        if (searchInput) {
            searchInput.focus();
        }
    }, 100);
    

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            clearExtraUserReferences();
        }
    });
}

function updateUserListInModal(searchText, currentValue) {
    const userList = document.getElementById('userListContainer');
    if (!userList) return;
    

    const filtered = availableUsers.filter(user => {
        const searchLower = searchText.toLowerCase();
        return user.name.toLowerCase().includes(searchLower) ||
               user.initials.toLowerCase().includes(searchLower) ||
               user.email.toLowerCase().includes(searchLower);
    });
    
    if (filtered.length === 0) {
        userList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No users found</div>';
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


function assignExtraUserFromModal(user) {
    if (!window.currentExtraCell || !window.currentExtraItem) return;
    
    const cell = window.currentExtraCell;
    const item = window.currentExtraItem;
    const columnKey = window.currentExtraColumnKey;
    const columnName = window.currentExtraColumnName;
    

    cell.textContent = user.initials;
    
    cell.style.backgroundColor = '#e8f5e9';
    setTimeout(() => {
        cell.style.backgroundColor = '';
    }, 500);
    
    updateExtraUserField(item, columnKey, user.initials);
    
    document.getElementById('extraUserSelectionModal').remove();
    
    showNotification(`${columnName} set to ${user.name}`);
    
    clearExtraUserReferences();
}

function updateExtraUserField(item, columnKey, value) {
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

function clearExtraUserReferences() {
    window.currentExtraItem = null;
    window.currentExtraCell = null;
    window.currentExtraColumnKey = null;
    window.currentExtraColumnName = null;
    window.currentExtraValue = null;
}


function initializeExtraUserColumns() {
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

function makeStatusCellClickable(cell, item) {
    cell.classList.add('task-status-cell');
    cell.title = 'Click to change status';
    cell.replaceWith(cell.cloneNode(true));
    const newCell = document.querySelector(`[data-id="${item.id}"][data-column="taskStatus"]`) || cell;
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

function getTaskColumnValue(task, columnKey) {
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

function makeAllStatusClickable() {
    tasks.forEach(task => {
        if (task.statusBadge) {
            task.statusBadge.style.cursor = 'pointer';
            task.statusBadge.title = 'Click to change status';
            
            const newBadge = task.statusBadge.cloneNode(true);
            task.statusBadge.parentNode.replaceChild(newBadge, task.statusBadge);
            
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
            subtask.statusBadge.parentNode.replaceChild(newBadge, subtask.statusBadge);
            
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
                makeStatusCellClickable(cell, task || subtask);
            }
        });
    }, 200);
}
function initializeTaskStatus() {
    console.log('Initializing Task Status column...');

    setTimeout(() => {
        makeAllStatusClickable();
    }, 1000);
}

function applyVisibility() {
    const mainHeader = document.getElementById('mainHeader');
    const subtaskHeader = document.getElementById('subtaskHeader');
    if (!mainHeader) return;
    const visibleColumns = columnConfig.filter(col => col.visible).map(col => col.key);
    console.log('Visible columns:', visibleColumns);
    const baseIndices = {
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
            mainHeader.children[i].style.display = 'none';
        }
    }
    
    visibleColumns.forEach(key => {
        if (baseIndices[key] !== undefined) {
            if (mainHeader.children[baseIndices[key]]) {
                mainHeader.children[baseIndices[key]].style.display = '';
            }
        }
    });
    
    document.querySelectorAll('.extra-column').forEach(th => {
        const key = th.getAttribute('data-column');
        if (visibleColumns.includes(key)) {
            th.style.display = '';
        } else {
            th.style.display = 'none';
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
            if (visibleColumns.includes(key)) {
                cell.style.display = '';
            } else {
                cell.style.display = 'none';
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
                const subtaskIndices = {
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
            if (col && col.forSubtask && visibleColumns.includes(key)) {
                cell.style.display = '';
            } else {
                cell.style.display = 'none';
            }
        });
    });
    
    setTimeout(() => {
        updateSublistRowsColspan();
    }, 50);
}
function updateSublistRowsColspan() {
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
            td.style.width = '100%';
        }
    });
    
    document.querySelectorAll('.sub-list-row').forEach(row => {
        const td = row.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
            td.style.width = '100%';
            
            const sublistHeader = td.querySelector('.sublist-header');
            if (sublistHeader) {
                sublistHeader.style.width = '100%';
                sublistHeader.style.display = 'flex';
                sublistHeader.style.justifyContent = 'space-between';
                sublistHeader.style.alignItems = 'center';
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
function initializeColumnSorting() {
    console.log('Initializing column sorting with icons...');
    const allHeaders = document.querySelectorAll('.main-list-table-container th');
    
    allHeaders.forEach((header, index) => {
        if (header.querySelector('.sort-icon')) return;
        
        header.style.cursor = 'pointer';
        header.title = 'Click to sort';
        
        const columnKey = header.getAttribute('data-column') || getColumnKeyFromText(header.textContent);
        
        const sortIcon = document.createElement('span');
        sortIcon.className = 'sort-icon';
        sortIcon.innerHTML = ' ↕️';
        sortIcon.style.cssText = `
            font-size: 12px;
            margin-left: 5px;
            opacity: 0.5;
            display: inline-block;
            transition: all 0.2s;
        `;
        header.appendChild(sortIcon);
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSortForTable(header, columnKey);
        });
        
        header.addEventListener('mouseenter', () => {
            header.style.backgroundColor = '#fff0f5';
        });
        
        header.addEventListener('mouseleave', () => {
            header.style.backgroundColor = '';
        });
    });
    
    console.log('Sort icons added to', allHeaders.length, 'headers');
}

function getColumnKeyFromText(text) {
    const columnMap = {
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

function toggleSortForTable(header, columnKey) {
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

function updateSortIconsInTable(table, activeHeader, direction) {
    table.querySelectorAll('.sort-icon').forEach(icon => {
        icon.classList.remove('sort-asc', 'sort-desc', 'sort-active');
    });

    const activeIcon = activeHeader.querySelector('.sort-icon');
    if (activeIcon) {
        activeIcon.classList.add('sort-active');
        activeIcon.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
    }
}

function sortTableByColumnPreservingHierarchy(columnKey, direction) {
    console.log('Sorting by', columnKey, direction);
    const tables = document.querySelectorAll('.main-list-table-container .skystemtaskmaster-table');
    
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const allRows = Array.from(tbody.querySelectorAll('tr'));
        
        const mainListRows = allRows.filter(row => row.classList.contains('main-list-title-row'));
        const subListRows = allRows.filter(row => row.classList.contains('sub-list-row'));
        const taskRows = allRows.filter(row => row.classList.contains('task-row'));
        
        const tasksBySublist = {};
        taskRows.forEach(row => {
            const sublistId = row.getAttribute('data-sublist-id');
            if (!tasksBySublist[sublistId]) {
                tasksBySublist[sublistId] = [];
            }
            tasksBySublist[sublistId].push(row);
        });
        
        Object.keys(tasksBySublist).forEach(sublistId => {
            tasksBySublist[sublistId].sort((a, b) => {
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

function getCellValueForSort(row, columnKey) {
    const baseIndices = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    
    if (baseIndices[columnKey] !== undefined) {
        const cell = row.cells[baseIndices[columnKey]];
        if (!cell) return '';
        
        if (columnKey === 'status' || columnKey === 'owner' || columnKey === 'reviewer') {
            const badge = cell.querySelector('.skystemtaskmaster-status-badge, .skystemtaskmaster-badge');
            return badge ? badge.textContent.trim() : cell.textContent.trim();
        }
        
        if (columnKey === 'days') {
            const val = cell.textContent.trim();
            return parseInt(val.replace('+', '')) || 0;
        }
        
        if (columnKey === 'dueDate') {
            const val = cell.textContent.trim();
            if (val === 'Set due date') return new Date(0).getTime();
            return new Date(val).getTime() || 0;
        }
        
        return cell.textContent.trim();
    }
    
    const extraCell = Array.from(row.querySelectorAll('.extra-cell')).find(
        cell => cell.getAttribute('data-column') === columnKey
    );
    return extraCell ? extraCell.textContent.trim() : '';
}

function compareValues(a, b, direction) {
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

function initializeSortingWithIcons() {
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
    
    observer.observe(document.getElementById('mainTableContainer'), { childList: true, subtree: true });
}
function initializeCleanStructure() {
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

function createMainList(listName) {
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

function createMainListTable(mainList) {
    let container = document.getElementById('mainTableContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mainTableContainer';
        container.className = 'main-table-container';
        const actionBar = document.querySelector('.skystemtaskmaster-action-bar');
        if (actionBar && actionBar.parentNode) {
            actionBar.parentNode.insertBefore(container, actionBar.nextSibling);
        } else {
            document.querySelector('.skystemtaskmaster-main-wrapper').appendChild(container);
        }
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'main-list-outer-wrapper';
    wrapper.setAttribute('data-mainlist-id', mainList.id);
    wrapper.style.marginBottom = '40px';
    
    const listHeading = document.createElement('div');
    listHeading.className = 'main-list-heading-outside';
    listHeading.style.cssText = `
        margin-bottom: 12px;
        padding: 8px 5px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const outsideCheckbox = document.createElement('input');
    outsideCheckbox.type = 'checkbox';
    outsideCheckbox.className = 'list-checkbox-outside';
    outsideCheckbox.style.cssText = `
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #ff0080;
    `;
    outsideCheckbox.title = 'Select this list';
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
    nameSpan.style.cssText = `
        font-weight: 600;
        font-size: 18px;
        color: #333;
    `;
    
    listHeading.appendChild(outsideCheckbox);
    listHeading.appendChild(nameSpan);
    const tableContainer = document.createElement('div');
    tableContainer.className = 'main-list-table-container';
    tableContainer.style.cssText = `
        background: white;
        border-radius: 8px;
        overflow: visible !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #e0e0e0;
    `;
    const table = document.createElement('table');
    table.className = 'skystemtaskmaster-table';
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        background-color: white;
        overflow: visible !important;
    `;
    
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
            th.style.cssText = `
                padding: 12px 8px;
                text-align: left;
                border-bottom: 2px solid #ff0080;
                background-color: #f8f8f8;
                font-weight: 600;
            `;
            headerRow.appendChild(th);
        }
    });
    
    columnConfig.forEach(col => {
        if (!baseColumns.includes(col.key) && col.visible !== false) {
            const th = document.createElement('th');
            th.textContent = col.label;
            th.className = 'extra-column';
            th.setAttribute('data-column', col.key);
            th.style.cssText = `
                padding: 12px 8px;
                text-align: left;
                border-bottom: 2px solid #ff0080;
                background-color: #f8f8f8;
            `;
            headerRow.appendChild(th);
        }
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    tbody.id = `mainTableBody_${mainList.id}`;
    tbody.className = 'main-list-tbody';
    tbody.style.cssText = 'overflow: visible !important;';
    const titleRow = document.createElement('tr');
    titleRow.className = 'main-list-title-row';
    titleRow.style.cssText = `
        background-color: #f0f0f0 !important;
        border-top: 2px solid #ff0080;
        border-bottom: 2px solid #ff0080;
        position: relative;
        z-index: 10;
    `;
    
    const visibleCols = getVisibleColumnCount();
    const titleCell = document.createElement('td');
    titleCell.colSpan = visibleCols;
    titleCell.style.padding = '0';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'list-header-inside';
    titleDiv.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 15px;
        width: 100%;
        box-sizing: border-box;
        position: relative;
    `;
    const insideCheckbox = document.createElement('input');
    insideCheckbox.type = 'checkbox';
    insideCheckbox.className = 'list-checkbox-inside';
    insideCheckbox.style.cssText = `
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #ff0080;
    `;
    insideCheckbox.title = 'Select this list';
    insideCheckbox.addEventListener('change', (e) => {
        e.stopPropagation();
        handleMainListCheckbox(mainList, insideCheckbox.checked);
        outsideCheckbox.checked = insideCheckbox.checked;
    });
    
    const insideIcon = document.createElement('span');
    insideIcon.className = 'list-icon-inside';
    insideIcon.innerHTML = '<i class="fa-solid fa-clipboard-list"></i>';
    insideIcon.style.cssText = `
        font-size: 20px;
        color: #ff0080;
    `;
    
    const insideNameSpan = document.createElement('span');
    insideNameSpan.className = 'list-name-inside';
    insideNameSpan.textContent = mainList.name;
    insideNameSpan.style.cssText = `
        flex: 1;
        font-weight: bold;
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;
    
    const insidePlusDropdown = document.createElement('div');
    insidePlusDropdown.style.cssText = `
        position: relative;
        display: inline-block;
        z-index: 100;
    `;
    
    const insidePlusIcon = document.createElement('span');
    insidePlusIcon.innerHTML = '<i class="fa-solid fa-plus-circle"></i>';
    insidePlusIcon.style.cssText = `
        font-size: 18px;
        cursor: pointer;
        color: #ff0080;
        margin: 0 8px;
        transition: transform 0.2s;
        display: inline-block;
    `;
    
    const insideDropdownContent = document.createElement('div');
    insideDropdownContent.className = 'plus-dropdown-content-inside';
    insideDropdownContent.style.cssText = `
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 150px;
        z-index: 1001;
        margin-top: 5px;
        overflow: hidden;
    `;
    
    const insideAddSublistOption = document.createElement('div');
    insideAddSublistOption.className = 'plus-dropdown-item';
    insideAddSublistOption.style.cssText = `
        padding: 10px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid #eee;
        color: #333;
        transition: background 0.2s;
    `;
    insideAddSublistOption.innerHTML = '<i class="fa-solid fa-folder-plus" style="color: #00cfff;"></i><span>Add Sub List</span>';
    insideAddSublistOption.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateSubListModal(mainList);
        insideDropdownContent.style.display = 'none';
    });
    
    const insideAddTaskOption = document.createElement('div');
    insideAddTaskOption.className = 'plus-dropdown-item';
    insideAddTaskOption.style.cssText = `
        padding: 10px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #333;
        transition: background 0.2s;
    `;
    insideAddTaskOption.innerHTML = '<i class="fa-solid fa-tasks" style="color: #ff0080;"></i><span>Add List</span>';
    insideAddTaskOption.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateTaskForMainList(mainList);
        insideDropdownContent.style.display = 'none';
    });
    
    insideAddSublistOption.addEventListener('mouseenter', () => {
        insideAddSublistOption.style.backgroundColor = '#f5f5f5';
    });
    insideAddSublistOption.addEventListener('mouseleave', () => {
        insideAddSublistOption.style.backgroundColor = '';
    });
    
    insideAddTaskOption.addEventListener('mouseenter', () => {
        insideAddTaskOption.style.backgroundColor = '#f5f5f5';
    });
    insideAddTaskOption.addEventListener('mouseleave', () => {
        insideAddTaskOption.style.backgroundColor = '';
    });
    
    insideDropdownContent.appendChild(insideAddSublistOption);
    insideDropdownContent.appendChild(insideAddTaskOption);
    insidePlusDropdown.appendChild(insidePlusIcon);
    insidePlusDropdown.appendChild(insideDropdownContent);
    
    insidePlusIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        
        document.querySelectorAll('.plus-dropdown-content-inside, .plus-dropdown-content').forEach(d => {
            if (d !== insideDropdownContent) d.style.display = 'none';
        });
        
        const isVisible = insideDropdownContent.style.display === 'block';
        insideDropdownContent.style.display = isVisible ? 'none' : 'block';
    });
    
    insidePlusIcon.addEventListener('mouseenter', () => {
        insidePlusIcon.style.transform = 'scale(1.1)';
    });
    insidePlusIcon.addEventListener('mouseleave', () => {
        insidePlusIcon.style.transform = 'scale(1)';
    });
    
    const insideCollapseIcon = document.createElement('span');
    insideCollapseIcon.className = 'collapse-icon-inside';
    insideCollapseIcon.innerHTML = '';
    insideCollapseIcon.style.cssText = `
        font-size: 16px;
        cursor: pointer;
        color: #666;
        transition: transform 0.2s;
    `;
    insideCollapseIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMainList(mainList);
    });
    
    insideCollapseIcon.addEventListener('mouseenter', () => {
        insideCollapseIcon.style.transform = 'scale(1.1)';
    });
    insideCollapseIcon.addEventListener('mouseleave', () => {
        insideCollapseIcon.style.transform = 'scale(1)';
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
            !insidePlusIcon.contains(e.target) && 
            !insideDropdownContent.contains(e.target)) {
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
function getVisibleColumnCount() {
    let count = 0;
    columnConfig.forEach(col => {
        if (col.visible !== false) count++;
    });
    return count;
}
function addSeparateTableStyles() {
    const link = document.createElement('link');
    link.id = 'separate-table-styles';
    link.rel = 'stylesheet';
    link.href = 'separate-table-styles.css';
    document.head.appendChild(link);
}
function createMainListRow(mainList) {
    const tbody = document.getElementById('mainTableBody');
    if (!tbody) return;

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
function attachMainRowEvents(row, mainList) {
    const plusIcon = row.querySelector('.plus-icon');
    const dropdown = row.querySelector('.plus-dropdown-content');
    const checkbox = row.querySelector('.list-checkbox');
    const collapseIcon = row.querySelector('.collapse-icon');

    plusIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.plus-dropdown-content').forEach(d => {
            if (d !== dropdown) d.classList.remove('show-dropdown');
        });
        dropdown.classList.toggle('show-dropdown');
    });

    row.querySelector('.add-sublist-option').addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateSubListModal(mainList);
        dropdown.classList.remove('show-dropdown');
    });

    row.querySelector('.add-task-option').addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateTaskModalForList(mainList); 
        dropdown.classList.remove('show-dropdown');
    });

    const closeOnOutsideClick = (e) => {
        if (!plusIcon.contains(e.target) && !dropdown.contains(e.target)) {
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

function showCreateTaskModalForList(mainList, subList = null) {
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
        <option value="PK">PK - Palakh Khanna 
        <option value="SM">SM - Sarah Miller 
        <option value="MP">MP - Mel Preparer 
        <option value="PP">PP - Poppy Pan
        <option value="JS">JS - John Smith 
        <option value="EW">EW - Emma Watson 
        <option value="DB">DB - David Brown 
    `;

    modal.innerHTML = `
        <div class="modal-content animate-slide-down" style="width: 850px; padding: 0; border-radius: 12px; background: #fff; border: 1px solid ${brandColor}; overflow: hidden; box-shadow: 0 10px 30px rgba(255, 0, 128, 0.1);">
            <div style="padding: 20px; background: linear-gradient(135deg, ${brandColor}, #cc0066); color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-weight: 600; font-size: 20px;"><i class="fa-solid fa-circle-plus"></i> Create Task</h3>
                    <span class="close" style="color: white; cursor: pointer; font-size: 28px;">&times;</span>
                </div>
                <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Path: ${path}</p>
            </div>
            
            <div style="padding: 25px; max-height: 75vh; overflow-y: auto;">
                
                <div style="margin-bottom: 25px; border-left: 4px solid ${brandColor}; padding-left: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: ${brandColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Basic Details</h4>
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Task Name *</label>
                            <input type="text" id="createTaskName" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px; border-radius: 6px;" placeholder="Task Name">
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Task ID</label>
                            <input type="text" id="createTaskNumber" class="task-input" style="width:100%; background: #fff0f6; border: 1px solid #ffd1e0; padding: 10px; border-radius: 6px; font-weight: bold; color: ${brandColor};" placeholder="Enter a ID">
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px;">
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Task Owner</label>
                            <select id="createTaskOwner" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;">${userOptions}</select>
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Reviewer</label>
                            <select id="createTaskReviewer" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;">${userOptions}</select>
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Approver</label>
                            <select id="createTaskApprover" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;">${userOptions}</select>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 25px; border-left: 4px solid ${brandColor}; padding-left: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: ${brandColor}; font-size: 14px; text-transform: uppercase;">Logistics & Recurrence</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Status</label>
                            <select id="createTaskStatus" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;">
                                <option>Not Started</option>
                                <option>In Progress</option>
                                <option>Review</option>
                                <option>Completed</option>
                                <option>Approved</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Recurrence</label>
                            <select id="createTaskRecurrence" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;">
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
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Dependentable</label>
                            <select id="createTaskDependent" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;">
                                <option value="">None</option>
                                <option>TSK-883</option><option>TSK-470</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 25px; border-left: 4px solid ${brandColor}; padding-left: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: ${brandColor}; font-size: 14px; text-transform: uppercase;">Timeline</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Assignee Due</label>
                            <input type="date" id="createAssigneeDate" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 8px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Reviewer Due</label>
                            <input type="date" id="createReviewerDate" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 8px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Completion Date</label>
                            <input type="date" id="createCompletionDate" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 8px;">
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 25px; background: #fffafd; padding: 20px; border-radius: 8px; border: 1px solid #ffd1e0;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: ${brandColor}; font-size: 12px;">Task Doc (TDoc) <i class="fa-solid fa-upload"></i></label>
                            <input type="file" id="uploadTDoc" class="task-input" style="width:100%; background: #fff; padding: 8px; border: 1px dashed ${brandColor}; border-radius: 4px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: ${brandColor}; font-size: 12px;">Completion Doc (CDoc) <i class="fa-solid fa-upload"></i></label>
                            <input type="file" id="uploadCDoc" class="task-input" style="width:100%; background: #fff; padding: 8px; border: 1px dashed ${brandColor}; border-radius: 4px;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px;">
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Created By</label>
                            <select id="createTaskCreator" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;">${userOptions}</select>
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Notifier</label>
                            <select id="createTaskNotifier" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;">${userOptions}</select>
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Linked Accounts</label>
                            <input type="text" id="createLinkedAccounts" class="task-input" style="width:100%; border: 1px solid #ddd; padding: 10px;" placeholder="Account IDs...">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">Comment</label>
                    <textarea id="createTaskComment" class="task-input" rows="2" style="width:100%; border: 1px solid #ddd; border-radius: 6px; padding: 10px;"></textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn-secondary" id="cancelCreateTaskBtn" style="padding: 10px 30px; background: #f8f9fa; border: 1px solid #ddd; color: #444; cursor: pointer; border-radius: 6px; font-weight: 600;">Cancel</button>
                    <button class="btn-primary" id="submitCreateTaskBtn" style="padding: 10px 35px; background: ${brandColor}; border: none; color: white; cursor: pointer; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 10px rgba(255, 0, 128, 0.2);">
                        <i class="fa-solid fa-check"></i> Create Task
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // UI Logic
    setTimeout(() => document.getElementById('createTaskName').focus(), 150);
    const close = () => modal.remove();
    modal.querySelector('.close').onclick = close;
    document.getElementById('cancelCreateTaskBtn').onclick = close;
    modal.onclick = (e) => { if(e.target === modal) close(); };

    document.getElementById('submitCreateTaskBtn').onclick = () => {
        const name = document.getElementById('createTaskName').value.trim();
        if (!name) {
            alert('A Task Name is required to proceed.');
            return;
        }

        const taskData = {
            name: name,
            tDoc: document.getElementById('uploadTDoc').files[0],
            cDoc: document.getElementById('uploadCDoc').files[0],
            owner: document.getElementById('createTaskOwner').value,
            reviewer: document.getElementById('createTaskReviewer').value,
            approver: document.getElementById('createTaskApprover').value,
            status: document.getElementById('createTaskStatus').value,
            recurrence: document.getElementById('createTaskRecurrence').value
        };

        console.log("Task Submitted:", taskData);
        if (typeof handleTaskCreation === "function") {
            handleTaskCreation(mainList, subList, taskData);
        }
        close();
    };
}

function collectTaskFormData() {
    return {
        name: document.getElementById('createTaskName').value,
        taskNumber: document.getElementById('createTaskNumber').value,
        owner: document.getElementById('createTaskOwner').value,
        status: 'Not Started', 
        tdoc: document.getElementById('createTaskTdoc').value || '0',
        cdoc: document.getElementById('createTaskCdoc').value || '0',
        dueDate: document.getElementById('createTaskDueDate').value,
        recurrenceType: document.getElementById('createTaskRecurrenceType').value,
        comment: document.getElementById('createTaskComment').value,
        dependentTask: document.getElementById('createTaskDependent').value
    };
}


function handleTaskCreation(mainList, subList, data) {
    let targetSubList = subList;

    if (!targetSubList) {
        targetSubList = mainList.subLists.length > 0 
            ? mainList.subLists[0] 
            : createSubList(mainList, 'Tasks');
    }

    const newTask = createTask(targetSubList, data);

    if (data.dependentTask) {
        dependentTasks.set(newTask.id, data.dependentTask);
        if (typeof refreshDependentTaskUI === 'function') {
            refreshDependentTaskUI();
            saveDependentTasks();
        }
    }

    showNotification(`Task "${data.name}" added to ${targetSubList.name}`);
}
function getTaskOptionsForDropdown() {
    if (!tasks || tasks.length === 0) return '';
    
    let options = '';
    tasks.forEach(task => {
        const displayText = task.taskNumber || task.name || `Task ${task.id}`;
        options += `<option value="${task.id}">${displayText}</option>`;
    });
    
    return options;
}
function showCreateTaskForMainList(mainList) {
    showCreateTaskModalForList(mainList, null);
}

function showCreateTaskModal(subList) {
    const mainList = mainLists.find(m => m.id === subList.mainListId);
    if (mainList) {
        showCreateTaskModalForList(mainList, subList);
    } else {
        showCreateTaskModalForList({ name: 'Tasks', subLists: [subList] }, subList);
    }
}
function removeGlobalAddTaskButton() {
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
function createSubListRow(subList, mainList) {
    const tbody = mainList.tbody;
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.className = 'sub-list-row';
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-mainlist-id', mainList.id);
    
    const visibleCols = getVisibleColumnCount();
    row.innerHTML = `
        <td colspan="${visibleCols}">
            <div class="sublist-header" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px 10px 40px; width: 100%; box-sizing: border-box;">
                <input type="checkbox" class="sublist-checkbox" title="Select this sublist">
                <span class="sublist-icon"><i class="fa-solid fa-folder"></i></span>
                <span class="sublist-name" style="flex: 1; font-weight: 500;">${escapeHtml(subList.name)}</span>
                <span class="collapse-sublist-icon" style="cursor: pointer;"><i class="fas fa-angle-down"></i></span>
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
    
    const checkbox = row.querySelector('.sublist-checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            handleSublistCheckbox(subList, checkbox.checked);
        });
    }
    
    return row;
}

function handleSublistCheckbox(subList, checked) {
    console.log(`Sublist ${subList.name} checkbox: ${checked}`);
    subList.tasks.forEach(task => {
        if (task.row) {
            const taskCheckbox = task.row.querySelector('.task-checkbox');
            if (taskCheckbox) {
                taskCheckbox.checked = checked;
            }
        }
    });
    
    const mainList = mainLists.find(m => m.id === subList.mainListId);
    if (mainList && mainList.row) {
        const mainCheckbox = mainList.row.querySelector('.list-checkbox');
        if (mainCheckbox) {
            const allSublistsChecked = mainList.subLists.every(s => {
                const cb = s.row?.querySelector('.sublist-checkbox');
                return cb ? cb.checked : false;
            });
            
            const anySublistChecked = mainList.subLists.some(s => {
                const cb = s.row?.querySelector('.sublist-checkbox');
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

function handleMainListCheckbox(mainList, checked) {
    console.log(`Main list ${mainList.name} checkbox: ${checked}`);
    
    mainList.subLists.forEach(subList => {
        if (subList.row) {
            const sublistCheckbox = subList.row.querySelector('.sublist-checkbox');
            if (sublistCheckbox) {
                sublistCheckbox.checked = checked;
            }
        }
        
        subList.tasks.forEach(task => {
            if (task.row) {
                const taskCheckbox = task.row.querySelector('.task-checkbox');
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

function updateSelectedCount() {
    let selected = 0;
    tasks.forEach(task => {
        const checkbox = task.row.querySelector('.task-checkbox');
        if (checkbox && checkbox.checked) selected++;
    });
    subtasks.forEach(subtask => {
        const checkbox = subtask.row.querySelector('.subtask-checkbox');
        if (checkbox && checkbox.checked) selected++;
    });
    
    const selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = selected;
    }
    
    console.log('Selected items:', selected);
    return selected;
}
function handleMainListCheckbox(mainList, checked) {
    console.log(`Main list ${mainList.name} checkbox: ${checked}`);
    mainList.subLists.forEach(subList => {
        if (subList.row) {
            const sublistCheckbox = subList.row.querySelector('.sublist-checkbox');
            if (sublistCheckbox) {
                sublistCheckbox.checked = checked;
            }
        }
        subList.tasks.forEach(task => {
            if (task.row) {
                const taskCheckbox = task.row.querySelector('.task-checkbox');
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

function handleSublistCheckbox(subList, checked) {
    console.log(`Sublist ${subList.name} checkbox: ${checked}`);
    
    subList.tasks.forEach(task => {
        if (task.row) {
            const taskCheckbox = task.row.querySelector('.task-checkbox');
            if (taskCheckbox) {
                taskCheckbox.checked = checked;
            }
        }
    });
    
    const mainList = mainLists.find(m => m.id === subList.mainListId);
    if (mainList && mainList.row) {
        const mainCheckbox = mainList.row.querySelector('.list-checkbox');
        if (mainCheckbox) {
            const allSublistsChecked = mainList.subLists.every(s => {
                const cb = s.row?.querySelector('.sublist-checkbox');
                return cb ? cb.checked : false;
            });
            
            const anySublistChecked = mainList.subLists.some(s => {
                const cb = s.row?.querySelector('.sublist-checkbox');
                return cb ? cb.checked : false;
            });
            
            if (allSublistsChecked) {
                mainCheckbox.checked = true;
                mainCheckbox.indeterminate = false;
            } else if (anySublistChecked) {
                mainCheckbox.indeterminate = true;
            } else {
                mainCheckbox.checked = false;
                mainCheckbox.indeterminate = false;
            }
        }
    }
    
    updateSelectedCount();
}

function updateSelectedCount() {
    let selected = 0;
    
    tasks.forEach(task => {
        const checkbox = task.row.querySelector('.task-checkbox');
        if (checkbox && checkbox.checked) selected++;
    });
    
    subtasks.forEach(subtask => {
        const checkbox = subtask.row.querySelector('.subtask-checkbox');
        if (checkbox && checkbox.checked) selected++;
    });
    
    const selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = selected;
    }
    
    console.log('Selected items:', selected);
    return selected;
}

function showCreateSubListModal(mainList) {
    let modal = document.getElementById('createSubListModal');
    
    if (!modal) {
        modal = createSubListModalHTML();
        document.body.appendChild(modal);
        attachSubListEvents(modal);
    }
    
    modal.setAttribute('data-current-mainlist-id', mainList.id);
    modal.querySelector('.sublist-modal-title').textContent = `New Sub List for "${mainList.name}"`;
    
    modal.style.display = 'block';
    
    setTimeout(() => document.getElementById('subListNameInput').focus(), 100);
}
function createSubListModalHTML() {
    const modal = document.createElement('div');
    modal.id = 'createSubListModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content modal-content-small">
            <span class="close">&times;</span>
            <h3 class="cdoc-header sublist-modal-title">Create Sub List</h3>
            
            <div style="margin: 20px 0;">
                <label class="form-label">Sub List Name</label>
                <input type="text" id="subListNameInput" class="task-input" 
                       placeholder="e.g. Phase 1, Q1 Review..." 
                       style="margin-bottom: 15px;">
                
                <button id="createSubListBtn" class="btn-primary" style="width: 100%;">
                    Create Sub List
                </button>
            </div>
        </div>
    `;
    return modal;
}
function attachSubListEvents(modal) {
    const input = document.getElementById('subListNameInput');
    const close = () => {
        modal.style.display = 'none';
        input.value = '';
    };

    modal.querySelector('.close').onclick = close;

    const handleSubmit = () => {
        const mainListId = modal.getAttribute('data-current-mainlist-id');
        const mainList = mainLists.find(m => m.id === mainListId);
        
        if (!mainList) {
            showNotification('Error: Main list context lost', 'error');
            return;
        }
        
        const subListName = input.value.trim();
        
        if (subListName) {
            createSubList(mainList, subListName);
            close();
        } else {
            showNotification('Please enter a name for the sub list', 'info');
            input.focus();
        }
    };

    document.getElementById('createSubListBtn').onclick = handleSubmit;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
}
function debugComments() {
    console.log('=== Comment Debug ===');
    console.log('Saved comments in localStorage:', localStorage.getItem('taskViewerData') ? JSON.parse(localStorage.getItem('taskViewerData')).taskComments : 'None');
    console.log('Current taskComments object:', taskComments);
    console.log('Tasks with IDs:', tasks.map(t => ({ id: t.id, name: t.name, commentKey: `task_${t.id}` })));
    console.log('Subtasks with IDs:', subtasks.map(s => ({ id: s.id, name: s.name, commentKey: `subtask_${s.id}` })));
    console.log('===================');
}
// ================================
// PERSISTENCE FUNCTIONS
// ================================
function saveAllData() {
    try {
        const tasksData = tasks.map(task => ({
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
        
        const subtasksData = subtasks.map(subtask => ({
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
                subLists: mainList.subLists.map(sub => sub.id)
            })),
            subLists: subLists.map(subList => ({
                id: subList.id,
                name: subList.name,
                mainListId: subList.mainListId,
                isExpanded: subList.isExpanded,
                tasks: subList.tasks.map(task => task.id)
            })),
            tasks: tasksData,
            subtasks: subtasksData,
            taskComments: taskComments, 
            cdocDocuments: {},
            tdocDocuments: {},
            linkedAccountsMap: {}
        };
        
        // Save CDoc documents
        tasks.forEach(task => {
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
        
        subtasks.forEach(subtask => {
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

function loadAllData() {
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
                console.log(`Comment thread ${key}: ${comments.length} comments`);
            });
        }
        
    
        if (data.mainLists) {
            data.mainLists.forEach(mainListData => {
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
            data.subLists.forEach(subListData => {
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
            data.tasks.forEach(taskData => {
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
            data.subtasks.forEach(subtaskData => {
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
            tasks.forEach(task => {
                if (task.row && task.id) {
                    task.row.dataset.taskId = task.id;
                    
                    const commentKey = `task_${task.id}`;
                    if (taskComments[commentKey] && taskComments[commentKey].length > 0) {
                        console.log(`Task ${task.id} has ${taskComments[commentKey].length} comments to restore`);
                    }
                }
            });
            
            subtasks.forEach(subtask => {
                if (subtask.row && subtask.id) {
                    subtask.row.dataset.subtaskId = subtask.id;
                    
                    const commentKey = `subtask_${subtask.id}`;
                    if (taskComments[commentKey] && taskComments[commentKey].length > 0) {
                        console.log(`Subtask ${subtask.id} has ${taskComments[commentKey].length} comments to restore`);
                    }
                }
            });
            
            if (data.cdocDocuments) {
                tasks.forEach(task => {
                    if (task.id && data.cdocDocuments[task.id]) {
                        taskDocuments.set(task.row, data.cdocDocuments[task.id]);
                    }
                });
                subtasks.forEach(subtask => {
                    if (subtask.id && data.cdocDocuments[subtask.id]) {
                        taskDocuments.set(subtask.row, data.cdocDocuments[subtask.id]);
                    }
                });
            }
            
            if (data.tdocDocuments) {
                tasks.forEach(task => {
                    if (task.id && data.tdocDocuments[task.id]) {
                        taskTDocDocuments.set(task.row, data.tdocDocuments[task.id]);
                    }
                });
                subtasks.forEach(subtask => {
                    if (subtask.id && data.tdocDocuments[subtask.id]) {
                        taskTDocDocuments.set(subtask.row, data.tdocDocuments[subtask.id]);
                    }
                });
            }
            
            if (data.linkedAccountsMap) {
                tasks.forEach(task => {
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


function findRowById(id) {
    const task = tasks.find(t => t.id === id);
    if (task && task.row) return task.row;
    
    const row = document.querySelector(`[data-task-id="${id}"], [data-subtask-id="${id}"]`);
    if (row) return row;
    
    return null;
}
let dependentTasks = new Map(); 

function populateDependentTaskDropdown(selectElement) {
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

function refreshAllDependentTaskDropdowns() {
    const allDropdowns = document.querySelectorAll('.dependent-task-dropdown');
    allDropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        populateDependentTaskDropdown(dropdown);
        if (currentValue && dropdown.querySelector(`option[value="${currentValue}"]`)) {
            dropdown.value = currentValue;
        }
    });
}

function getDependentTasks(taskId) {
    const dependents = [];
    for (let [dependentId, parentId] of dependentTasks.entries()) {
        if (parentId === taskId) {
            const task = tasks.find(t => t.id === dependentId);
            if (task) dependents.push(task);
        }
    }
    return dependents;
}

function hasDependents(taskId) {
    return getDependentTasks(taskId).length > 0;
}

function addDependentTaskFieldStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'dependent-task-styles.css';
    document.head.appendChild(link);
}

function addDependentTaskFieldToModal() {
    addDependentTaskFieldStyles();
    
    const modal = document.getElementById('createTaskCompleteModal');
    if (!modal) return;
    
    const taskNumberDiv = modal.querySelector('#createTaskNumber')?.closest('div');
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

function updateCreateTaskWithDependency() {
    const originalCreateTask = window.createTask;
    
    window.createTask = function(subList, taskData) {
        const dependentTaskId = document.getElementById('createTaskDependent')?.value;
        
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
function showDependentTasks(task) {
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
function createDependencyModalHTML(task, dependents) {
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
function renderDependencyItem(dep) {
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
function attachDependencyEvents(modal) {
    const close = () => modal.remove();

    modal.querySelector('.close').onclick = close;
    document.getElementById('closeDependentModal').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
    modal.querySelectorAll('.view-dependent-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = btn.dataset.taskId;
            const targetTask = tasks.find(t => t.id === taskId);
            
            if (targetTask && targetTask.row) {
                targetTask.row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Use CSS animation instead of manual timeout styling
                targetTask.row.classList.add('task-row-highlight');
                setTimeout(() => targetTask.row.classList.remove('task-row-highlight'), 2000);
                
                close();
            }
        });
    });
}

function addDependentIndicatorToTaskRow(task) {
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
        indicator.style.cssText = `
            margin-left: 8px;
            cursor: pointer;
            font-size: 14px;
            opacity: 0.7;
            transition: all 0.2s;
        `;
        
        indicator.addEventListener('mouseenter', () => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'scale(1.1)';
        });
        
        indicator.addEventListener('mouseleave', () => {
            indicator.style.opacity = '0.7';
            indicator.style.transform = 'scale(1)';
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
function setupAutoSave() {
    const originalCreateMainList = createMainList;
    const originalCreateSubList = createSubList;
    const originalCreateTask = createTask;
    const originalDeleteSelectedItems = deleteSelectedItems;
    
    window.createMainList = function(listName) {
        const result = originalCreateMainList(listName);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    window.createSubList = function(mainList, subListName) {
        const result = originalCreateSubList(mainList, subListName);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    window.createTask = function(subList, taskData) {
        const result = originalCreateTask(subList, taskData);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    window.deleteSelectedItems = function() {
        const result = originalDeleteSelectedItems();
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.skystemtaskmaster-status-badge') || 
            e.target.closest('.skystemtaskmaster-badge')) {
            setTimeout(() => saveAllData(), 200);
        }
    });
}


function createSubList(mainList, subListName) {
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
function showCreateTaskModal(subList) {
    let modal = document.getElementById('createTaskModal');
    
    if (!modal) {
        modal = createCreateTaskModalHTML();
        document.body.appendChild(modal);
        attachTaskCreationEvents(modal);
    }
    modal.setAttribute('data-current-sublist-id', subList.id);
    modal.querySelector('.task-modal-title').textContent = `Create Task for "${subList.name}"`;
    document.getElementById('taskNumberInput').value = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    
    modal.style.display = 'block';
}


function createCreateTaskModalHTML() {
    const modal = document.createElement('div');
    modal.id = 'createTaskModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content" style="width: 750px; max-height: 85vh; overflow-y: auto;">
            <span class="close">&times;</span>
            <h3 class="cdoc-header task-modal-title">Create Task</h3>
            
            <div class="sort-body">
                <div class="task-form-section">
                    <h4>Basic Information</h4>
                    <div style="margin-bottom: 15px;">
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
                    <h4>Timeline</h4>
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
                    <h4>Comments & Notes</h4>
                    <textarea id="taskCommentInput" class="task-input" rows="3" placeholder="Additional details..."></textarea>
                </div>

                <button id="createTaskBtn" class="btn-primary" style="width: 100%; padding: 14px;">Create Task</button>
            </div>
        </div>
    `;
    return modal;
}


function attachTaskCreationEvents(modal) {
    const close = () => { modal.style.display = 'none'; };
    modal.querySelector('.close').onclick = close;

    document.getElementById('createTaskBtn').onclick = () => {
        const subListId = modal.getAttribute('data-current-sublist-id');
        const subList = subLists.find(s => s.id === subListId);
        const taskName = document.getElementById('taskNameInput').value.trim();

        if (!taskName) {
            showNotification('Task Name is required!', 'error');
            return;
        }

        const taskData = {
            name: taskName,
            taskNumber: document.getElementById('taskNumberInput').value,
            owner: document.getElementById('taskOwnerInput').value,
            status: document.getElementById('taskStatusInput').value,
            reviewer: document.getElementById('taskReviewerInput').value,
            dueDate: document.getElementById('taskDueDateInput').value,
            assigneeDueDate: document.getElementById('taskAssigneeDueDateInput').value,
            recurrenceType: document.getElementById('taskRecurrenceTypeInput').value,
            comment: document.getElementById('taskCommentInput').value,
            acc: '+',
            days: '0'
        };

        createTask(subList, taskData);
        close();
        resetTaskForm();
        showNotification('Task created successfully');
    };
}
function resetTaskForm() {
    const inputs = ['taskNameInput', 'taskDueDateInput', 'taskCommentInput'];
    inputs.forEach(id => document.getElementById(id).value = '');
}

function renderUserSelect(id) {
    const users = ['PK - Palakh Khanna', 'SM - Sarah Miller', 'MP - Mel Preparer', 'JS - John Smith'];
    return `
        <select id="${id}" class="task-input">
            ${users.map(u => `<option value="${u.split(' - ')[0]}">${u}</option>`).join('')}
        </select>
    `;
}
function setupUploadHandlers(modal, taskRow) {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const filesContainer = document.getElementById('filesContainer');
    const selectedFilesList = document.getElementById('selectedFilesList');
    const uploadBtn = document.getElementById('uploadSelectedBtn');
    const browseBtn = document.getElementById('browseFileBtn');
    
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;
    
    let selectedFiles = [];
    
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ff0080';
        dropArea.style.backgroundColor = '#fff0f5';
    });
    
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
        const files = Array.from(e.dataTransfer?.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    function updateSelectedFilesList() {
        if (selectedFiles.length === 0) {
            selectedFilesList.style.display = 'none';
            uploadBtn.style.display = 'none';
            return;
        }
        
        selectedFilesList.style.display = 'block';
        uploadBtn.style.display = 'inline-block';
        
        filesContainer.innerHTML = selectedFiles.map((file, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;">
                <span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button class="remove-file" data-index="${index}" style="background:none; border:none; color:#dc3545; cursor:pointer;">✕</button>
            </div>
        `).join('');
        
        filesContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index') || '0');
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
        
        const currentTaskRow = window.currentTaskRow || taskRow; 
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
function addExtraColumnsForRow(row, task) {
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


function applyVisibilityForMainList(mainList) {
    if (!mainList || !mainList.tableElement) return;
    
    const visibleColumns = columnConfig.filter(col => col.visible !== false).map(col => col.key);
    const baseIndices = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    
    const headerRow = mainList.tableElement.querySelector('thead tr');
    if (headerRow) {
        Array.from(headerRow.children).forEach((th, idx) => {
            const colKey = th.getAttribute('data-column');
            if (colKey) {
                th.style.display = visibleColumns.includes(colKey) ? '' : 'none';
            } else {
                const baseKey = Object.keys(baseIndices)[idx];
                if (baseKey) {
                    th.style.display = visibleColumns.includes(baseKey) ? '' : 'none';
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
                        cell.style.display = visibleColumns.includes(baseKey) ? '' : 'none';
                    }
                }
            });
            
            row.querySelectorAll('.extra-cell').forEach(cell => {
                const colKey = cell.getAttribute('data-column');
                if (colKey) {
                    cell.style.display = visibleColumns.includes(colKey) ? '' : 'none';
                }
            });
        });
        
        const sublistRows = tbody.querySelectorAll('.sub-list-row td');
        sublistRows.forEach(td => {
            td.colSpan = visibleColumns.length;
        });
    }
}


function getTaskColumnValue(task, columnKey) {
    if (!task) return '—';
    
    switch(columnKey) {
        case 'taskNumber':
            return task.taskNumber || task.id || '—';
            
        case 'taskOwner':
            return task.taskOwner || task.owner || '—';
            
        case 'taskStatus':
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
function addDataCells() {
    document.querySelectorAll('.task-row').forEach(row => {
        const taskId = row.dataset.taskId || '1';
        
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
                    else if (col.key === 'taskStatus') value = 'Not Started';
                    else if (col.key === 'recurrenceType') value = 'None'; 
                }
                
                cell.textContent = value;
                cell.style.display = col.visible ? '' : 'none';
                row.appendChild(cell);
            }
        });
    });
    
    document.querySelectorAll('.subtask-row').forEach(row => {
        const subtaskId = row.dataset.subtaskId || '1';
        
        row.querySelectorAll('.extra-cell').forEach(cell => cell.remove());
        
        columnConfig.forEach(col => {
            if (col.forSubtask) {
                const subtaskBaseColumns = ['taskName', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer'];
                if (subtaskBaseColumns.indexOf(col.key) === -1) {
                    const cell = document.createElement('td');
                    cell.className = 'extra-cell';
                    cell.setAttribute('data-column', col.key);
                    
                    let value = '—';
                    if (col.key === 'taskNumber') value = 'SUB-00' + subtaskId;
                    else if (col.key === 'taskStatus') value = 'In Progress';
                    else if (col.key === 'recurrenceType') value = 'None';
                    
                    cell.textContent = value;
                    cell.style.display = col.visible ? '' : 'none';
                    row.appendChild(cell);
                }
            }
        });
    });
}
function createTaskRow(task, subList) {
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
            <div class="skystemtaskmaster-task-name" style="padding-left: 70px; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" class="task-checkbox">
                <span>${escapeHtml(task.name)}</span>
            </div>
        </td>
        <td><span style="color: #ff0080; font-weight: bold;">${task.acc}</span></td>
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


function addRecurrenceStyles() {
    if (document.getElementById('recurrence-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'recurrence-styles';
    link.rel = 'stylesheet';
    link.href = 'recurrence-styles.css';
    document.head.appendChild(link);
}

function toggleSubList(subList, mainList) {
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
                nextRow.style.display = subList.isExpanded ? '' : 'none';
            }
            nextRow = nextRow.nextSibling;
        }
    }
}
function createNewTask(taskName, acc, tdoc, owner, reviewer, dueDate = '') {
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
        <td><span style="color: #ff0080; font-weight: bold;">${acc}</span></td>
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
    
    const checkbox = newRow.querySelector('.task-checkbox');
    const statusBadge = newRow.querySelector('.skystemtaskmaster-status-badge');
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

function createNewSubtask() {
    const subtaskName = document.getElementById('subtaskName').value.trim();
    if (!subtaskName) {
        alert('Please enter a subtask name');
        return;
    }
    
    const owner = document.getElementById('subtaskOwner').value;
    const reviewer = document.getElementById('subtaskReviewer').value;
    const tdoc = document.getElementById('subtaskTdoc').value;
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
        
        const checkbox = newRow.querySelector('.subtask-checkbox');
        const statusBadge = newRow.querySelector('.skystemtaskmaster-status-badge');
        const taskNameCell = newRow.cells[0];
        
        if (checkbox && statusBadge && taskNameCell) {
            let ownerCell = null;
            let reviewerCell = null;
            
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
        
        addSubtaskModal.style.display = 'none';
        
        document.getElementById('subtaskName').value = '';
        document.getElementById('subtaskOwner').value = 'PK';
        document.getElementById('subtaskReviewer').value = 'SM';
        document.getElementById('subtaskTdoc').value = '';
        
        showNotification(`Subtask "${subtaskName}" added successfully`);
        
        setTimeout(() => saveAllData(), 100);
    }
}
function initializeDragAndDrop() {
    console.log('Initializing Drag and Drop...');
    tasks.forEach(task => {
        makeRowDraggable(task.row, 'task');
    });
    subtasks.forEach(subtask => {
        makeRowDraggable(subtask.row, 'subtask');
    });
    const subtaskHeader = document.getElementById('subtaskHeader');
    if (subtaskHeader) {
    }
    addDragStyles();
}

function initializeThreeDotsMenu() {
    const threeDotsBtn = document.getElementById('threeDotsBtn');
    const dropdown = document.getElementById('threeDotsDropdown');
    
    if (!threeDotsBtn || !dropdown) return;
    
    threeDotsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', (e) => {
        if (!threeDotsBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const format = item.dataset.format;
            handleDownload(format);
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
            item => item.textContent.includes('Filter')
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
function handleDownload(format) {
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
function deleteSelectedItems() {
    let deleted = 0;
    
    for (let i = mainLists.length - 1; i >= 0; i--) {
        const mainList = mainLists[i];
        
        const outsideCheckbox = mainList.outsideCheckbox;
        const insideCheckbox = mainList.insideCheckbox;
        const isChecked = (outsideCheckbox && outsideCheckbox.checked) || (insideCheckbox && insideCheckbox.checked);
        
        if (isChecked) {
            console.log('Deleting main list:', mainList.name);
            
            mainList.subLists.forEach(subList => {
                for (let j = tasks.length - 1; j >= 0; j--) {
                    if (tasks[j].subListId === subList.id) {
                        tasks[j].row?.remove();
                        tasks.splice(j, 1);
                        deleted++;
                    }
                }
                
                const subIndex = subLists.findIndex(s => s.id === subList.id);
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
        const checkbox = subList.row?.querySelector('.sublist-checkbox');
        
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
                const subIndex = mainList.subLists.findIndex(s => s.id === subList.id);
                if (subIndex !== -1) mainList.subLists.splice(subIndex, 1);
            }
            
            subList.row?.remove();
            subLists.splice(i, 1);
            deleted++;
        }
    }
    
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        const checkbox = task.row.querySelector('.task-checkbox');
        
        if (checkbox && checkbox.checked) {
            const subList = subLists.find(s => s.id === task.subListId);
            if (subList) {
                const taskIndex = subList.tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) subList.tasks.splice(taskIndex, 1);
            }
            
            task.row.remove();
            tasks.splice(i, 1);
            deleted++;
        }
    }
    
    for (let i = subtasks.length - 1; i >= 0; i--) {
        const subtask = subtasks[i];
        const checkbox = subtask.row.querySelector('.subtask-checkbox');
        
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
function downloadAsJson() {
    const table = document.getElementById('mainTable');
    if (!table) return;
    
    const data = [];
    const rows = table.querySelectorAll('tr');
    
    const headers = [];
    const headerRow = rows[0].querySelectorAll('th');
    headerRow.forEach(th => {
        if (th.style.display !== 'none') {
            headers.push(th.textContent.trim());
        }
    });
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        const rowData = {};
        
        let cellIndex = 0;
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if (cell.style.display !== 'none' && cellIndex < headers.length) {
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
function makeCellsEditable(row) {
    const cells = [row.cells[1], row.cells[3], row.cells[7]];
    cells.forEach(cell => {
        if (cell) {
            cell.classList.add('skystemtaskmaster-editable');
            cell.setAttribute('contenteditable', 'true');
        }
    });
}

function makeExistingTasksEditable() {
    tasks.forEach(task => makeCellsEditable(task.row));
}

function showNotification(message) {
    let notification = document.querySelector('.skystemtaskmaster-notification');
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

function updateCounts() {
    console.log('updateCounts called');
    
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    
    if (tasks && tasks.length > 0) {
        tasks.forEach((task, index) => {
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
            const statusText = badge.innerText.trim();
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
        completedEl.innerText = completed;
        completedEl.style.transform = 'scale(1.2)';
        setTimeout(() => completedEl.style.transform = 'scale(1)', 200);
    }
    
    if (inProgressEl) {
        inProgressEl.innerText = inProgress;
        inProgressEl.style.transform = 'scale(1.2)';
        setTimeout(() => inProgressEl.style.transform = 'scale(1)', 200);
    }
    
    if (notStartedEl) {
        notStartedEl.innerText = notStarted;
        notStartedEl.style.transform = 'scale(1.2)';
        setTimeout(() => notStartedEl.style.transform = 'scale(1)', 200);
    }
}
function testStats() {
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
function calculateDays() {
    const today = new Date();
    
    tasks.forEach(task => {
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

function initializeDeleteButton() {
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
function showCustomizeGridModal() {
    let modal = document.getElementById('customizeGridModal');
    
    if (!modal) {
        modal = createGridModalHTML();
        document.body.appendChild(modal);
        attachGridEventListeners(modal);
    }
    syncCheckboxesToConfig();
    modal.style.display = 'block';
}


function createGridModalHTML() {
    const modal = document.createElement('div');
    modal.id = 'customizeGridModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content" style="width: 500px;">
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


function renderColumnCheckbox(col) {
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


function attachGridEventListeners(modal) {
    const close = () => { modal.style.display = 'none'; };

    modal.querySelector('.close').onclick = close;
    
    document.getElementById('saveGridBtn').onclick = () => {
        columnConfig.forEach(col => {
            const checkbox = document.getElementById(`col_${col.key}`);
            if (checkbox && !col.mandatory) {
                col.visible = checkbox.checked;
            }
        });
        
        saveColumnVisibility();
        refreshGridUI(); 
        
        close();
        showNotification('Grid layout updated successfully!');
    };

    document.getElementById('resetGridBtn').onclick = () => {
        const defaults = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
        columnConfig.forEach(col => {
            col.visible = defaults.includes(col.key);
        });
        syncCheckboxesToConfig();
    };
}


function syncCheckboxesToConfig() {
    columnConfig.forEach(col => {
        const cb = document.getElementById(`col_${col.key}`);
        if (cb && !col.mandatory) cb.checked = col.visible;
    });
}


function refreshGridUI() {
    addExtraColumns();
    addDataCells();
    applyVisibility();
    updateSublistRowsColspan();
}

function addTDocStyles() {
    if (document.getElementById('tdoc-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'tdoc-styles';
    link.rel = 'stylesheet';
    link.href = 'tdoc-styles.css';
    document.head.appendChild(link);
}

function updateTDocColumn() {
    console.log('Updating TDoc column with Font Awesome icons...');
    
    addTDocStyles();
    
    function createTDocIcon(row, docs) {
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
            badge.textContent = docs.length;
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
    
    tasks.forEach(task => {
        if (!task.row) return;
        const tdocCell = task.row.cells[2];
        if (!tdocCell) return;
        
        tdocCell.innerHTML = '';
        const docs = taskTDocDocuments.get(task.row) || [];
        const iconContainer = createTDocIcon(task.row, docs);
        tdocCell.appendChild(iconContainer);
    });
    
    subtasks.forEach(subtask => {
        if (!subtask.row) return;
        const tdocCell = subtask.row.cells[2];
        if (!tdocCell) return;
        
        tdocCell.innerHTML = '';
        const docs = taskTDocDocuments.get(subtask.row) || [];
        const iconContainer = createTDocIcon(subtask.row, docs);
        tdocCell.appendChild(iconContainer);
    });
}
function addDocumentStyles() {
    if (document.getElementById('document-icon-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'document-icon-styles';
    link.rel = 'stylesheet';
    link.href = 'document-styles.css';
    document.head.appendChild(link);
}
function showTDocDocumentManager(taskRow) {
    const docs = taskTDocDocuments.get(taskRow) || [];
    let modal = document.getElementById('tdocDocumentManagerModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tdocDocumentManagerModal';
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-content tdoc-modal">
                <span class="close">&times;</span>

                <h3 class="tdoc-title">📄 TDoc Document Manager</h3>

                <!-- Upload Section -->
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

                <!-- Document List -->
                <div>
                    <h4 class="tdoc-section-title">
                        Attached Documents 
                        (<span id="tdocDocCount">${docs.length}</span>)
                    </h4>

                    <div id="tdocDocumentsListContainer" class="tdoc-doc-list"></div>
                </div>

                <!-- Footer -->
                <div class="tdoc-footer">
                    <button id="tdocCloseManagerBtn" class="btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.getElementById('tdocCloseManagerBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    modal.setAttribute('data-current-task-row', taskRow.id || Math.random().toString(36));
    window.currentTDocTaskRow = taskRow;

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


function renderTDocDocumentsList(docs, taskRow) {
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
                    <th style="text-align: center;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${docs.map((doc, index) => renderTDocRow(doc, index)).join('')}
            </tbody>
        </table>
    `;
}


function renderTDocRow(doc, index) {
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
                <button 
                    class="tdoc-action-btn tdoc-view-btn tdoc-view-doc-btn"
                    data-index="${index}" 
                    title="View"
                >👁️</button>

                <button 
                    class="tdoc-action-btn tdoc-delete-btn tdoc-delete-doc-btn"
                    data-index="${index}" 
                    title="Delete"
                >🗑</button>
            </td>
        </tr>
    `;
}


function renderTDocEmptyState() {
    return `
        <div class="tdoc-empty-state">
            <div class="tdoc-empty-icon">📄</div>
            <div>No documents attached</div>
            <div style="font-size: 13px; font-style: italic; margin-top: 5px;">
                Click upload area above to add documents
            </div>
        </div>
    `;
}
function setupTDocUploadHandlers(modal, taskRow) {
    const dropArea = document.getElementById('tdocDropArea');
    const fileInput = document.getElementById('tdocFileInput');
    const filesContainer = document.getElementById('tdocFilesContainer');
    const selectedFilesList = document.getElementById('tdocSelectedFilesList');
    const uploadBtn = document.getElementById('tdocUploadSelectedBtn');
    const browseBtn = document.getElementById('tdocBrowseFileBtn');
    
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;
    
    let selectedFiles = [];
    
    browseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ff0080';
        dropArea.style.backgroundColor = '#fff0f5';
    });
    
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
        const files = Array.from(e.dataTransfer?.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    function updateSelectedFilesList() {
        if (selectedFiles.length === 0) {
            selectedFilesList.style.display = 'none';
            uploadBtn.style.display = 'none';
            return;
        }
        
        selectedFilesList.style.display = 'block';
        uploadBtn.style.display = 'inline-block';
        
        filesContainer.innerHTML = selectedFiles.map((file, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;">
                <span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button class="remove-file" data-index="${index}" style="background:none; border:none; color:#dc3545; cursor:pointer;">✕</button>
            </div>
        `).join('');
        
        filesContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index') || '0');
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
        
        const currentTaskRow = window.currentTDocTaskRow || taskRow;
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

function attachTDocDocumentEventListeners(taskRow) {
    document.querySelectorAll('.tdoc-view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index || '0');
            const docs = taskTDocDocuments.get(taskRow) || [];
            if (docs[index]) previewDocument(docs[index]);
        });
    });
    
    document.querySelectorAll('.tdoc-delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index || '0');
            showTDocDeleteConfirmation(taskRow, index);
        });
    });
}

function showTDocDeleteConfirmation(taskRow, index) {
    const docs = taskTDocDocuments.get(taskRow) || [];
    const doc = docs[index];
    if (!doc) return;

    let confirmModal = document.getElementById('tdocDeleteConfirmModal');

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
        confirmModal.querySelector('.close').addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });

        // Cancel button
        document.getElementById('tdocCancelDeleteBtn').addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });

        // Confirm delete
        document.getElementById('tdocConfirmDeleteBtn').addEventListener('click', () => {
            const row = window.currentTDocDeleteTaskRow;
            const idx = window.currentTDocDeleteIndex;

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

    window.currentTDocDeleteTaskRow = taskRow;
    window.currentTDocDeleteIndex = index;

    confirmModal.style.display = 'block';
}

function deleteTDocDocument(taskRow, index) {
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

function initializeTDocManager() {
    addTDocStyles();
    updateTDocColumn();
}

function addTDocStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'tdoc-manager-styles.css';
    document.head.appendChild(link);
}
function initializeDownloadButton() {
    const downloadBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return btn.textContent?.indexOf('Download') !== -1 || btn.innerHTML.indexOf('download') !== -1;
    });
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', showDownloadOptions);
    }
}


function showDownloadOptions() {
    let downloadModal = document.getElementById('downloadModal');
    
    if (!downloadModal) {
        downloadModal = createDownloadModalHTML();
        document.body.appendChild(downloadModal);
        attachDownloadEventListeners(downloadModal);
    }
    
    downloadModal.style.display = 'block';
}


function createDownloadModalHTML() {
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


function attachDownloadEventListeners(modal) {
    const close = () => { modal.style.display = 'none'; };

    modal.querySelector('.close').onclick = close;
    window.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    const executeAction = (actionFn) => {
        if (typeof actionFn === 'function') actionFn();
        close();
    };

    document.getElementById('downloadExcelBtn').onclick = () => executeAction(downloadAsExcel);
    document.getElementById('downloadCsvBtn').onclick = () => executeAction(downloadAsCsv);
    document.getElementById('downloadJsonBtn').onclick = () => executeAction(downloadAsJson);
}

function downloadAsExcel() {
    const table = document.getElementById('mainTable');
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('th, td');
        const rowData = [];
        
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
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



function downloadAsCsv() {
    downloadAsExcel();
    showNotification('Downloaded as CSV');
}
function initializeFilterButton() {
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

let currentFilters = {
    status: 'all',
    owner: 'all',
    reviewer: 'all',
    dueDate: 'all'
};


function showFilterPanel() {
    const existingModal = document.getElementById('filterModal');
    if (existingModal) existingModal.remove();
    
    const filterModal = createFilterModalHTML();
    document.body.appendChild(filterModal);
    syncModalToState();
    attachFilterEvents(filterModal);
    filterModal.style.display = 'block';
}

function createFilterModalHTML() {
    const modal = document.createElement('div');
    modal.id = 'filterModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content" style="width: 450px;">
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


function syncModalToState() {
    document.getElementById('filterStatus').value = currentFilters.status;
    document.getElementById('filterOwner').value = currentFilters.owner;
    document.getElementById('filterDueDate').value = currentFilters.dueDate;
    document.getElementById('filterRecurrence').value = currentFilters.recurrence || 'all';
    document.getElementById('hideEmptyLists').checked = currentFilters.hideEmptyLists;
    document.getElementById('showTaskCount').checked = currentFilters.showTaskCount;
}


function attachFilterEvents(modal) {
    const close = () => modal.remove();

    modal.querySelector('.close').onclick = close;
    window.onclick = (e) => { if (e.target === modal) close(); };

    document.getElementById('applyFilterBtn').onclick = () => {
        currentFilters = {
            status: document.getElementById('filterStatus').value,
            owner: document.getElementById('filterOwner').value,
            dueDate: document.getElementById('filterDueDate').value,
            recurrence: document.getElementById('filterRecurrence').value,
            hideEmptyLists: document.getElementById('hideEmptyLists').checked,
            showTaskCount: document.getElementById('showTaskCount').checked
        };
        
        applyHierarchicalFilters();
        close();
        showNotification('Filters applied');
    };

    document.getElementById('clearFilterBtn').onclick = () => {
        currentFilters = Object.assign({}, defaultFilters); // Assuming you have a defaultFilters object
        clearAllFilters();
        close();
        showNotification('Filters cleared');
    };
}

function renderFilterSelect(label, id, options) {
    return `
        <div class="form-group">
            <label class="form-label">${label}</label>
            <select id="${id}" class="sort-select">
                ${options.map(opt => `<option value="${opt}">${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`).join('')}
            </select>
        </div>
    `;
}

function applyHierarchicalFilters() {
    console.log('Applying hierarchical filters:', currentFilters);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    const taskMatches = new Map();
    
    tasks.forEach(task => {
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
            task.subtasks.forEach(subtask => {
                const subtaskMatches = checkSubtaskMatches(subtask);
                taskMatches.set(subtask.id, subtaskMatches);
            });
        }
    });
    
    const visibleTasksCount = new Map(); 
    
    tasks.forEach(task => {
        const matches = taskMatches.get(task.id) || false;
        task.row.style.display = matches ? '' : 'none';
        
        if (matches) {
            const sublistId = task.subListId;
            visibleTasksCount.set(sublistId, (visibleTasksCount.get(sublistId) || 0) + 1);
        }
    });
    
    subtasks.forEach(subtask => {
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
    tasks.forEach(task => {
        if (task.row.style.display !== 'none') totalVisible++;
    });
    subtasks.forEach(subtask => {
        if (subtask.row.style.display !== 'none') totalVisible++;
    });
    
    console.log(`Filter applied: ${totalVisible} items visible`);
}

function checkSubtaskMatches(subtask) {
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

function updateListVisibility(visibleTasksCount) {
    const sublistsWithVisibleTasks = new Set();
    const mainListsWithVisibleTasks = new Set();
    
    subLists.forEach(subList => {
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
    
    mainLists.forEach(mainList => {
        const hasVisibleSublists = mainList.subLists.some(subList => 
            sublistsWithVisibleTasks.has(subList.id)
        );
        
        if (currentFilters.hideEmptyLists && mainList.row) {
            mainList.row.style.display = hasVisibleSublists ? '' : 'none';
        } else if (mainList.row) {
            mainList.row.style.display = '';
        }
    });
}


function updateListCountDisplays(visibleTasksCount) {
    subLists.forEach(subList => {
        if (!subList.row) return;
        
        const count = visibleTasksCount.get(subList.id) || 0;
        const header = subList.row.querySelector('.sublist-header');
        
        if (header) {
            const label = `${count} task${count !== 1 ? 's' : ''}`;
            updateOrCreateBadge(header, 'task-count-badge', count, label);
        }
    });

    mainLists.forEach(mainList => {
        if (!mainList.row) return;
        const totalCount = mainList.subLists.reduce((sum, sub) => {
            return sum + (visibleTasksCount.get(sub.id) || 0);
        }, 0);

        const header = mainList.row.querySelector('.list-header');
        if (header) {
            const label = `${totalCount} total task${totalCount !== 1 ? 's' : ''}`;
            updateOrCreateBadge(header, 'list-count-badge', totalCount, label);
        }
    });
}


function updateOrCreateBadge(container, className, count, text) {
    let badge = container.querySelector(`.${className}`);
    
    if (!badge) {
        badge = document.createElement('span');
        badge.className = className;
        container.appendChild(badge);
    }
    
    badge.textContent = text;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
}
function clearAllFilters() {
    currentFilters = {
        status: 'all',
        owner: 'all',
        reviewer: 'all',
        dueDate: 'all',
        recurrence: 'all',
        hideEmptyLists: false,
        showTaskCount: false
    };
    
    tasks.forEach(task => {
        task.row.style.display = '';
    });
    
    subtasks.forEach(subtask => {
        subtask.row.style.display = '';
    });
    
    mainLists.forEach(mainList => {
        if (mainList.row) mainList.row.style.display = '';
    });
    
    subLists.forEach(subList => {
        if (subList.row) subList.row.style.display = '';
    });
    
    document.querySelectorAll('.task-count-badge, .list-count-badge').forEach(badge => {
        badge.remove();
    });
    
    console.log('All filters cleared');
}

function initializeEnhancedFilterButton() {
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



function initializeEnhancedFilter() {
    console.log('Initializing enhanced filter system...');
    addFilterStyles();
    initializeEnhancedFilterButton();
    
    window.showFilterPanel = showFilterPanel;
}

document.addEventListener('DOMContentLoaded', () => {
    
    setTimeout(() => {
        initializeEnhancedFilter();
    }, 1000);
});

function applyFilters() {
    const statusFilter = document.getElementById('filterStatus')?.value || 'all';
    const ownerFilter = document.getElementById('filterOwner')?.value || 'all';
    const reviewerFilter = document.getElementById('filterReviewer')?.value || 'all';
    const dueDateFilter = document.getElementById('filterDueDate')?.value || 'all';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    let visibleCount = 0;
    tasks.forEach(task => {
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
    subtasks.forEach(subtask => {
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

function clearFilters() {
    tasks.forEach(task => {
        task.row.style.display = '';
    });
    subtasks.forEach(subtask => {
        subtask.row.style.display = '';
    });
    console.log('Filters cleared');
}

function applyFilters() {
    var _a, _b, _c, _d;
    const statusFilter = ((_a = document.getElementById('filterStatus')) === null || _a === void 0 ? void 0 : _a.value) || 'all';
    const ownerFilter = ((_b = document.getElementById('filterOwner')) === null || _b === void 0 ? void 0 : _b.value) || 'all';
    const reviewerFilter = ((_c = document.getElementById('filterReviewer')) === null || _c === void 0 ? void 0 : _c.value) || 'all';
    const dueDateFilter = ((_d = document.getElementById('filterDueDate')) === null || _d === void 0 ? void 0 : _d.value) || 'all';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    tasks.forEach(task => {
        var _a, _b, _c, _d;
        let show = true;
        if (statusFilter !== 'all') {
            const taskStatus = task.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter)
                show = false;
        }
        if (show && ownerFilter !== 'all') {
            const ownerBadge = (_a = task.row.cells[5]) === null || _a === void 0 ? void 0 : _a.querySelector('.skystemtaskmaster-badge');
            const ownerText = ((_b = ownerBadge === null || ownerBadge === void 0 ? void 0 : ownerBadge.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            if (ownerText !== ownerFilter)
                show = false;
        }
        if (show && reviewerFilter !== 'all') {
            const reviewerBadge = (_c = task.row.cells[6]) === null || _c === void 0 ? void 0 : _c.querySelector('.skystemtaskmaster-badge');
            const reviewerText = ((_d = reviewerBadge === null || reviewerBadge === void 0 ? void 0 : reviewerBadge.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            if (reviewerText !== reviewerFilter)
                show = false;
        }
        if (show && dueDateFilter !== 'all') {
            const dueText = task.dueDateCell.innerText;
            if (dueText !== 'Set due date') {
                const dueDate = new Date(dueText);
                dueDate.setHours(0, 0, 0, 0);
                if (dueDateFilter === 'overdue') {
                    if (dueDate >= today)
                        show = false;
                }
                else if (dueDateFilter === 'today') {
                    if (dueDate.getTime() !== today.getTime())
                        show = false;
                }
                else if (dueDateFilter === 'week') {
                    if (dueDate < today || dueDate > oneWeekLater)
                        show = false;
                }
                else if (dueDateFilter === 'month') {
                    if (dueDate < today || dueDate > oneMonthLater)
                        show = false;
                }
            }
        }
        task.row.style.display = show ? '' : 'none';
    });
    subtasks.forEach(subtask => {
        var _a, _b;
        let show = true;
        if (statusFilter !== 'all') {
            const taskStatus = subtask.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter)
                show = false;
        }
        if (show && ownerFilter !== 'all') {
            const ownerBadge = subtask.ownerCell.querySelector('.skystemtaskmaster-badge');
            const ownerText = ((_a = ownerBadge === null || ownerBadge === void 0 ? void 0 : ownerBadge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            if (ownerText !== ownerFilter)
                show = false;
        }
        if (show && reviewerFilter !== 'all') {
            const reviewerBadge = subtask.reviewerCell.querySelector('.skystemtaskmaster-badge');
            const reviewerText = ((_b = reviewerBadge === null || reviewerBadge === void 0 ? void 0 : reviewerBadge.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            if (reviewerText !== reviewerFilter)
                show = false;
        }
        subtask.row.style.display = show ? '' : 'none';
    });
    showNotification('Filters applied');
}
function clearFilters() {
    tasks.forEach(task => {
        task.row.style.display = '';
    });
    subtasks.forEach(subtask => {
        subtask.row.style.display = '';
    });
    showNotification('Filters cleared');
}

function initializeTaskDropdown() {
    const taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown");
    if (!taskDropdown) return;
    const newDropdown = taskDropdown.cloneNode(true);
    taskDropdown.parentNode.replaceChild(newDropdown, taskDropdown);
    
    newDropdown.addEventListener("change", (e) => {
        const filter = e.target.value;
        const currentUser = 'PK'; 
        
        console.log('Dropdown filter changed to:', filter);
        tasks.forEach(task => {
            if (task.row) task.row.style.display = '';
        });
        
        subtasks.forEach(subtask => {
            if (subtask.row) subtask.row.style.display = '';
        });
        
        if (filter !== "all") {
            tasks.forEach(task => {
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
            
            subtasks.forEach(subtask => {
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
        tasks.forEach(task => {
            if (task.row.style.display !== 'none') visibleTasks++;
        });
        subtasks.forEach(subtask => {
            if (subtask.row.style.display !== 'none') visibleTasks++;
        });
        
        showNotification(`Filter: ${filter.replace(/-/g, ' ')} - ${visibleTasks} items visible`);
    });
}
function applyFilters() {
    const statusFilter = document.getElementById('filterStatus')?.value || 'all';
    const ownerFilter = document.getElementById('filterOwner')?.value || 'all';
    const reviewerFilter = document.getElementById('filterReviewer')?.value || 'all';
    const dueDateFilter = document.getElementById('filterDueDate')?.value || 'all';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    tasks.forEach(task => {
        let show = true;
        
        if (statusFilter !== 'all') {
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
                const dueDate = new Date(dueText);
                dueDate.setHours(0, 0, 0, 0);
                
                if (dueDateFilter === 'overdue' && dueDate >= today) show = false;
                else if (dueDateFilter === 'today' && dueDate.getTime() !== today.getTime()) show = false;
                else if (dueDateFilter === 'week' && (dueDate < today || dueDate > oneWeekLater)) show = false;
                else if (dueDateFilter === 'month' && (dueDate < today || dueDate > oneMonthLater)) show = false;
            }
        }
        
        task.row.style.display = show ? '' : 'none';
    });
    
    subtasks.forEach(subtask => {
        let show = true;
        
        if (statusFilter !== 'all') {
            const taskStatus = subtask.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter) show = false;
        }
        
        if (show && ownerFilter !== 'all') {
            const ownerBadge = subtask.ownerCell.querySelector('.skystemtaskmaster-badge');
            const ownerText = ownerBadge?.textContent?.trim() || '';
            if (ownerText !== ownerFilter) show = false;
        }
        
        if (show && reviewerFilter !== 'all') {
            const reviewerBadge = subtask.reviewerCell.querySelector('.skystemtaskmaster-badge');
            const reviewerText = reviewerBadge?.textContent?.trim() || '';
            if (reviewerText !== reviewerFilter) show = false;
        }
        
        subtask.row.style.display = show ? '' : 'none';
    });
    
    showNotification('Filters applied');
}

function clearFilters() {
    tasks.forEach(task => task.row.style.display = '');
    subtasks.forEach(subtask => subtask.row.style.display = '');
    showNotification('Filters cleared');
}
function initializeSortButton() {
    const sortBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return btn.textContent?.indexOf('Sort') !== -1 || btn.innerHTML.indexOf('sort') !== -1;
    });
    
    if (sortBtn) {
        sortBtn.addEventListener('click', showSortOptions);
    }
}


function showSortOptions() {
    let sortModal = document.getElementById('sortModal');
    if (!sortModal) {
        sortModal = createSortModalHTML();
        document.body.appendChild(sortModal);
        attachSortEventListeners(sortModal);
    }
    
    sortModal.style.display = 'block';
}


function createSortModalHTML() {
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


function attachSortEventListeners(modal) {
    const close = () => { modal.style.display = 'none'; };

    modal.querySelector('.close').onclick = close;
    window.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    document.getElementById('applySortBtn').onclick = () => {
        const sortBy = document.getElementById('sortBy').value;
        const sortOrder = document.getElementById('sortOrder').value;
        
        if (typeof applySort === 'function') {
            applySort(sortBy, sortOrder);
        }
        
        close();
    };
}

function applySort(sortBy, sortOrder) {
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
    const tasksBySublist = {};
    taskRows.forEach(row => {
        const sublistId = row.dataset.sublistId;
        if (!tasksBySublist[sublistId]) {
            tasksBySublist[sublistId] = [];
        }
        tasksBySublist[sublistId].push(row);
    });
    Object.keys(tasksBySublist).forEach(sublistId => {
        tasksBySublist[sublistId].sort((a, b) => {
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
            const sublistId = headerRow.dataset.sublistId;
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
function toggleSort(columnKey, headerElement) {
    if (currentSort.column === columnKey) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnKey;
        currentSort.direction = 'asc';
    }
    updateSortIcons(headerElement);
    sortTableByColumnPreservingHierarchy(columnKey, currentSort.direction);
}

function sortTableByColumnPreservingHierarchy(columnKey, direction) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const mainListRows = allRows.filter(row => row.classList.contains('main-list-row'));
    const subListRows = allRows.filter(row => row.classList.contains('sub-list-row'));
    const taskRows = allRows.filter(row => row.classList.contains('task-row'));
    const subtaskHeader = allRows.find(row => row.classList.contains('skystemtaskmaster-subtask-header'));
    const subtaskRows = allRows.filter(row => row.classList.contains('subtask-row'));
    const tasksBySublist = {};
    taskRows.forEach(row => {
        const sublistId = row.dataset.sublistId;
        if (!tasksBySublist[sublistId]) {
            tasksBySublist[sublistId] = [];
        }
        tasksBySublist[sublistId].push(row);
    });
    
    Object.keys(tasksBySublist).forEach(sublistId => {
        tasksBySublist[sublistId].sort((a, b) => {
            const aVal = getCellValueForSort(a, columnKey);
            const bVal = getCellValueForSort(b, columnKey);
            return compareValues(aVal, bVal, direction);
        });
    });
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    mainListRows.forEach(mainListRow => {
        tbody.appendChild(mainListRow);
        
        const mainListId = mainListRow.dataset.listId;
        subListRows.forEach(subListRow => {
            if (subListRow.dataset.mainlistId === mainListId) {
                tbody.appendChild(subListRow);
                const sublistId = subListRow.dataset.sublistId;
                const tasksForSublist = tasksBySublist[sublistId] || [];
                tasksForSublist.forEach(taskRow => tbody.appendChild(taskRow));
            }
        });
    });
    subListRows.forEach(subListRow => {
        if (!tbody.contains(subListRow)) {
            tbody.appendChild(subListRow);
            const sublistId = subListRow.dataset.sublistId;
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

function getSortValue(row, sortBy) {
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

function getSubtaskSortValue(row, sortBy) {
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

function parseSortValue(val, sortBy) {
    if (sortBy === 'days') return parseInt(val.replace('+', '')) || 0;
    if (sortBy === 'dueDate') return new Date(val).getTime() || 0;
    return 0;
}

function addAccountColumnToTasks() {
    tasks.forEach(task => {
        const accountCell = task.row.cells[1]; 
        if (accountCell) {
            renderAccountCell(task, accountCell);
        }
    });
}


function renderAccountCell(task, cell) {
    cell.innerHTML = '';
    
    const accountDisplay = document.createElement('div');
    accountDisplay.className = 'account-display';
    
    const taskId = task.id || task.row.dataset.taskId;
    const accounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];

    if (accounts.length > 0) {
        accounts.forEach(account => {
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
function showAccountDetails(account, taskRow, task) {
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

    tooltip.querySelector('.close-tooltip-btn').addEventListener('click', () => {
        tooltip.remove();
    });

    tooltip.querySelector('.remove-account-btn').addEventListener('click', () => {
        const taskId = task.id || task.row.dataset.taskId;
        const accounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];

        const updatedAccounts = accounts.filter(a => a.accountNumber !== account.accountNumber);

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
            if (!tooltip.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 100);
}

function showAccountLinkingModal(taskRow, task) {
    const existingModal = document.getElementById('accountLinkingModal');
    if (existingModal) existingModal.remove();
    const taskName = task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task';
    const modal = createLinkingModalHTML(taskName);
    document.body.appendChild(modal);

    attachLinkingEventListeners(modal, task, taskRow);
}


function createLinkingModalHTML(taskName) {
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


function attachLinkingEventListeners(modal, task, taskRow) {
    const close = () => modal.remove();

    modal.querySelector('.close').onclick = close;
    document.getElementById('cancelAccountBtn').onclick = close;

    modal.onclick = (e) => { if (e.target === modal) close(); };

    document.getElementById('linkAccountBtn').onclick = () => {
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
    };
}


function getAccountFormData() {
    const ownersSelect = document.getElementById('accountOwners');
    return {
        orgHierarchy: document.getElementById('orgHierarchy').value,
        fsCaption: document.getElementById('fsCaption').value.trim(),
        accountName: document.getElementById('accountName').value.trim(),
        accountOwners: Array.from(ownersSelect.selectedOptions).map(opt => opt.value),
        accountFrom: document.getElementById('accountFrom').value.trim(),
        accountTo: document.getElementById('accountTo').value.trim(),
        dueDaysFrom: document.getElementById('dueDaysFrom').value,
        dueDaysTo: document.getElementById('dueDaysTo').value,
        isKeyAccount: document.getElementById('isKeyAccount').value,
        riskRating: document.getElementById('riskRating').value,
        linkedDate: new Date().toISOString(),
        linkedBy: 'PK' 
    };
}
function addAccountStyles() {
    if (document.getElementById('account-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'account-styles';
    link.rel = 'stylesheet';
    link.href = 'account-styles.css';
    document.head.appendChild(link);
}
function initializeAccountColumn() {
    console.log('Initializing Account Column...');
    addAccountStyles();
    addAccountColumnToTasks();
}

function addAccountColumnToTasks() {
    tasks.forEach(task => {
        const row = task.row;
        const accountCell = row.cells[1]; 
        if (!accountCell) return;
        
        accountCell.innerHTML = '';
        
        const accountDisplay = document.createElement('div');
        accountDisplay.className = 'account-display';
        
        const taskId = task.id || task.row.dataset.taskId;
        const accounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];
        
        if (accounts.length > 0) {
            accounts.forEach(account => {
                const accountBadge = document.createElement('span');
                accountBadge.className = 'account-badge';
                accountBadge.textContent = account.accountNumber;
                accountBadge.title = account.accountName || `Account ${account.accountNumber}`;
                
                accountBadge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showAccountDetails(account, task.row, task);
                });
                
                accountDisplay.appendChild(accountBadge);
            });
        } else {
            const addIcon = document.createElement('span');
            addIcon.className = 'add-account-icon';
            addIcon.innerHTML = '+';
            addIcon.title = 'Link account';
            
            addIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                showAccountLinkingModal(task.row, task);
            });
            
            accountDisplay.appendChild(addIcon);
        }
        
        accountCell.appendChild(accountDisplay);
    });
}
const USER_NAME_MAP = {
    'PK': 'Palakh Khanna',
    'SM': 'Sarah Miller',
    'MP': 'Mel Preparer',
    'PP': 'Poppy Pan',
    'JS': 'John Smith',
    'EW': 'Emma Watson',
    'DB': 'David Brown'
};


function showAccountDetails(account, taskRow, task) {
    document.querySelectorAll('.account-tooltip').forEach(el => el.remove());

    const tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';

    const ownerNames = account.accountOwners?.map(o => USER_NAME_MAP[o] || o).join(', ') || 'None';
    const linkedStr = account.linkedDate ? new Date(account.linkedDate).toLocaleString() : '—';

    tooltip.innerHTML = `
        <div class="tooltip-header">Account Details</div>
        
        <div style="margin: 10px 0;">
            <table class="tooltip-table">
                ${renderTooltipRow('Org Hierarchy', account.orgHierarchy)}
                ${renderTooltipRow('FS Caption', account.fsCaption)}
                ${renderTooltipRow('Account Name', account.accountName)}
                ${renderTooltipRow('Account Owners', ownerNames)}
                ${renderTooltipRow('Account Range', `${account.accountFrom || '0'} - ${account.accountTo || '∞'}`)}
                ${renderTooltipRow('Due Days Range', `${account.dueDaysFrom || '0'} - ${account.dueDaysTo || '∞'} days`)}
                ${renderTooltipRow('Key Account', account.isKeyAccount)}
                ${renderTooltipRow('Reconcilable', account.reconcilable)}
                ${renderTooltipRow('Risk Rating', account.riskRating)}
                ${renderTooltipRow('ZBA', account.zba)}
                ${renderTooltipRow('Linked', linkedStr)}
            </table>
        </div>
        
        <div class="tooltip-actions">
            <button class="btn-secondary close-tooltip-btn">Close</button>
            <button class="btn-danger remove-account-btn">Remove</button>
        </div>
    `;

    document.body.appendChild(tooltip);

    const rect = taskRow.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX + 50}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 100}px`;

    tooltip.querySelector('.close-tooltip-btn').onclick = () => tooltip.remove();
    
    tooltip.querySelector('.remove-account-btn').onclick = () => {
        handleRemoveAccount(account, task, tooltip);
    };
}
function renderTooltipRow(label, value) {
    return `
        <tr>
            <td class="label-cell">${label}:</td>
            <td class="value-cell">${value || '—'}</td>
        </tr>
    `;
}
function handleRemoveAccount(account, task, tooltip) {
    const taskId = task.id || task.row.dataset.taskId;
    const accounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];
    const updated = accounts.filter(a => a.accountName !== account.accountName);

    if (updated.length === 0) {
        taskAccounts.delete(task.row);
        taskAccounts.delete(taskId);
    } else {
        taskAccounts.set(task.row, updated);
        if (taskId) taskAccounts.set(taskId, updated);
    }

    tooltip.remove();
    refreshLinkedAccountsColumn();
    showNotification('Account removed');
    if (typeof saveAllData === 'function') saveAllData();
}
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeAccountColumn();
    }, 800);
});

function refreshLinkedAccountsColumn() {
    document.querySelectorAll('.extra-cell[data-column="linkedAccounts"]').forEach(cell => {
        const row = cell.closest('tr');
        if (!row) return;
        
        const task = tasks.find(t => t.row === row);
        if (!task) return;
        
        const taskId = task.id || row.dataset.taskId;
        const accounts = taskAccounts.get(row) || taskAccounts.get(taskId) || [];
        
        cell.innerHTML = '';
        cell.classList.add('extra-cell');
        
        if (accounts.length > 0) {
            accounts.forEach(account => {
                const badge = document.createElement('span');
                badge.className = 'account-badge';
                badge.textContent = account.accountName.substring(0, 12) + (account.accountName.length > 12 ? '...' : '');
                badge.title = account.accountName;
                
                badge.onclick = (e) => {
                    e.stopPropagation();
                    showAccountDetails(account, row, task);
                };
                
                cell.appendChild(badge);
            });
            
            const addMore = document.createElement('span');
            addMore.className = 'add-more-icon';
            addMore.textContent = '+';
            addMore.onclick = (e) => {
                e.stopPropagation();
                showAccountLinkingModal(task.row, task);
            };
            cell.appendChild(addMore);
            
        } else {
            const addIcon = document.createElement('span');
            addIcon.className = 'add-link-btn';
            addIcon.textContent = '+ Link Account';
            addIcon.onclick = (e) => {
                e.stopPropagation();
                showAccountLinkingModal(task.row, task);
            };
            cell.appendChild(addIcon);
        }
    });
}

function addAccountStyles() {
    if (document.getElementById('account-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'account-styles';
    style.textContent = `/* Paste the entire CSS here */`;
    
    document.head.appendChild(style);
}
function showLinkedAccountModal(task, cell) {
    const existingModal = document.getElementById('linkedAccountModal');
    if (existingModal) existingModal.remove();
    const taskId = task.id || task.row.dataset.taskId;
    const currentAccounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];
    const taskDisplayName = task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task';
    const modal = createAccountModalHTML(taskDisplayName, currentAccounts);
    document.body.appendChild(modal);
    window.currentAccountTask = task;
    window.currentAccountCell = cell;
    attachAccountEventListeners(modal, task, taskId);
}


function createAccountModalHTML(taskName, currentAccounts, modalId = 'linkedAccountModal') {
    const modal = document.createElement('div');

    modal.id = modalId;
    modal.className = 'modal show'; 

    const safeTaskName = escapeHTML(taskName);
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


function renderAccountBadge(acc) {
    return `
        <span class="account-badge" data-acc="${acc.accountNumber}">
            ${acc.accountNumber}
            <span class="remove-acc">✕</span>
        </span>
    `;
}


function attachAccountEventListeners(modal, task, taskId) {
    const list = modal.querySelector('#currentAccountsList');

    const accNum = modal.querySelector('#newAccountNumber');
    const accName = modal.querySelector('#newAccountName');
    const accType = modal.querySelector('#newAccountType');

    const closeBtn = modal.querySelector('.close');
    const closeFooterBtn = modal.querySelector('#closeAccountModalBtn');
    const saveBtn = modal.querySelector('#saveAccountsBtn');
    const addBtn = modal.querySelector('#addAccountBtn');

    const close = () => modal.remove();

    closeBtn.onclick = close;
    closeFooterBtn.onclick = close;

    saveBtn.onclick = () => {
        refreshLinkedAccountsColumn();
        close();
        showNotification('Linked accounts updated');
        setTimeout(saveAllData, 100);
    };

    addBtn.onclick = () => {
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
    };

    list.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-acc')) return;

        const badge = e.target.closest('.account-badge');
        const accNum = badge.dataset.acc;

        const current = getTaskAccounts(task, taskId);
        const updated = current.filter(a => a.accountNumber !== accNum);

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
addDataCells = function() {
    originalAddDataCells();
    setTimeout(() => {
        refreshLinkedAccountsColumn();
    }, 100);
};
function showAccountDetails(account, taskRow) {
    const tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';
    
    tooltip.innerHTML = `
        <div class="account-number">${account.accountNumber}</div>
        <div class="account-name">${account.accountName}</div>
        <div class="button-container">
            <button class="remove-account-btn">Remove</button>
            <button class="close-tooltip-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(tooltip);
    
    tooltip.style.left = '100px';
    tooltip.style.top = '100px';
    
    tooltip.querySelector('.remove-account-btn').addEventListener('click', () => {
        const accounts = taskAccounts.get(taskRow) || [];
        const updatedAccounts = accounts.filter(a => a.accountNumber !== account.accountNumber);
        taskAccounts.set(taskRow, updatedAccounts);
        tooltip.remove();
        addAccountColumnToTasks();
        showNotification(`Account ${account.accountNumber} removed`);
    });
    
    tooltip.querySelector('.close-tooltip-btn').addEventListener('click', () => {
        tooltip.remove();
    });
    
    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e) {
            if (!tooltip.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 100);
}

function addAccountStyles() {
    if (document.getElementById('account-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'account-styles';
    style.textContent = `/* Paste the entire CSS here */`;
    document.head.appendChild(style);
}
function updateCDocColumn() {
    console.log('Updating CDoc column with Font Awesome icons...');
    
    tasks.forEach(task => {
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
    
    subtasks.forEach(subtask => {
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

function createCDocIcon(docs, row) {
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
        badge.textContent = docs.length;
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

function showDocumentManager(taskRow) {
    const docs = taskDocuments.get(taskRow) || [];
    let modal = document.getElementById('documentManagerModal');

    if (!modal) {
        modal = createDocumentModalHTML();
        document.body.appendChild(modal);
        setupBaseEventListeners(modal, taskRow);
    }

    window.currentTaskRow = taskRow;
    updateDocumentsUI(docs, taskRow);

    modal.style.display = 'block';
}


function createDocumentModalHTML() {
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
                    <div style="color: #666; margin-bottom: 5px;">Drag files here or</div>
                    <button id="browseFileBtn" class="btn-primary">Browse</button>
                    <input type="file" id="fileInput" style="display: none;" multiple>
                </div>
                
                <div id="selectedFilesList" class="file-list-container" style="display: none;">
                    <div style="font-weight: 500; margin-bottom: 8px; color: #666;">Selected Files:</div>
                    <div id="filesContainer"></div>
                </div>
                
                <div style="display: flex; justify-content: flex-end;">
                    <button id="uploadSelectedBtn" class="btn-upload" style="display: none;">Upload Files</button>
                </div>
            </div>
            
            <div>
                <h4 class="section-title">Attached Documents (<span id="docCount">0</span>)</h4>
                <div id="documentsListContainer" class="docs-list"></div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <button id="closeManagerBtn" class="btn-secondary">Close</button>
            </div>
        </div>
    `;
    return modal;
}


function updateDocumentsUI(docs, taskRow) {
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


function setupBaseEventListeners(modal, taskRow) {
    const closeModal = () => modal.style.display = 'none';

    modal.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('closeManagerBtn').addEventListener('click', closeModal);
    
    setupUploadHandlers(modal, taskRow);
}

function renderDocumentsList(docs, taskRow) {
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
                    <th style="text-align: center;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${docs.map((doc, index) => {
                    const date = new Date(doc.uploadDate);
                    return `
                        <tr data-doc-index="${index}">
                            <td>
                                <div class="tdoc-file-info">
                                    <span style="font-size: 20px;">📄</span>
                                    <span class="tdoc-file-name">${doc.name}</span>
                                </div>
                            </td>
                            <td>${(doc.size / 1024).toFixed(1)} KB</td>
                            <td>
                                ${date.toLocaleDateString()} 
                                <span class="tdoc-timestamp">${date.toLocaleTimeString()}</span>
                            </td>
                            <td style="text-align: center;">
                                <button class="view-doc-btn tdoc-action-btn btn-view" 
                                        data-index="${index}" 
                                        title="View File">👁️</button>
                                <button class="delete-doc-btn tdoc-action-btn btn-delete" 
                                        data-index="${index}" 
                                        title="Delete File">🗑</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function attachDocumentEventListeners(taskRow) {
    document.querySelectorAll('.view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index || '0');
            const docs = taskDocuments.get(taskRow) || [];
            if (docs[index]) {
                showFilePreview(docs[index]);
            }
        });
    });
    
    document.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index || '0');
            showDeleteConfirmation(taskRow, index);
        });
    });
}

function showFilePreview(doc) {
    let previewModal = document.getElementById('filePreviewModal');
    
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
        
        previewModal.querySelector('.tdoc-close').addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
    }
    
    const content = previewModal.querySelector('#filePreviewContent');
    const fileSize = (doc.size / 1024).toFixed(1);
    const uploadDate = new Date(doc.uploadDate).toLocaleString();

    content.innerHTML = `
        <div style="padding: 10px;">
            <div class="file-icon-large">📄</div>
            <h4 style="text-align: center; margin-bottom: 10px; color: #333;">${doc.name}</h4>
            
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
function showTDocDocumentManager(taskRow) {
    const docs = taskTDocDocuments.get(taskRow) || [];
    let modal = document.getElementById('tdocDocumentManagerModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tdocDocumentManagerModal';
        modal.className = 'tdoc-modal';

        modal.innerHTML = `
            <div class="tdoc-modal-content">
                <span class="tdoc-close">&times;</span>
                <h3>📄 TDoc Document Manager</h3>
                
                <div class="tdoc-upload-section">
                    <h4>Upload New Documents</h4>
                    
                    <div id="tdocDropArea" class="tdoc-drop-area">
                        <div class="tdoc-drop-icon">
                            <i class="fa-solid fa-folder-open"></i>
                        </div>
                        <div class="tdoc-drop-text">Drag files here or</div>
                        <button id="tdocBrowseFileBtn" class="btn-browse">Browse</button>
                        <input type="file" id="tdocFileInput" class="hidden-input" multiple>
                    </div>
                    
                    <div id="tdocSelectedFilesList" class="tdoc-selected-list hidden">
                        <div class="tdoc-selected-title">Selected Files:</div>
                        <div id="tdocFilesContainer"></div>
                    </div>
                    
                    <div class="flex-end">
                        <button id="tdocUploadSelectedBtn" class="btn-upload hidden">Upload Files</button>
                    </div>
                </div>
                
                <div>
                    <h4>Attached Documents (<span id="tdocDocCount">${docs.length}</span>)</h4>
                    <div id="tdocDocumentsListContainer" class="tdoc-docs-list-container"></div>
                </div>
                
                <div class="flex-end margin-top">
                    <button id="tdocCloseManagerBtn" class="btn-close-footer">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeElements = [
            modal.querySelector('.tdoc-close'),
            modal.querySelector('#tdocCloseManagerBtn')
        ];

        closeElements.forEach(el => {
            el?.addEventListener('click', () => modal.classList.remove('show'));
        });
    }

    modal.setAttribute('data-current-task-row', taskRow.id || Math.random().toString(36));
    window.currentTDocTaskRow = taskRow;

    const listContainer = document.getElementById('tdocDocumentsListContainer');
    if (listContainer) {
        listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
        attachTDocDocumentEventListeners(taskRow);
    }

    const countSpan = document.getElementById('tdocDocCount');
    if (countSpan) countSpan.textContent = docs.length.toString();

    setupTDocUploadHandlers(modal, taskRow);

    // Show modal via class (not inline style)
    modal.classList.add('show');
}

function renderTDocDocumentsList(docs, taskRow) {
    if (docs.length === 0) {
        return `
            <div class="tdoc-empty">
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
                    <th class="center">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${docs.map((doc, index) => `
                    <tr data-tdoc-doc-index="${index}">
                        <td>
                            <div class="tdoc-file">
                                <span class="tdoc-file-icon">📄</span>
                                <span class="tdoc-file-name">${doc.name}</span>
                            </div>
                        </td>
                        <td>${(doc.size / 1024).toFixed(1)} KB</td>
                        <td>
                            ${new Date(doc.uploadDate).toLocaleDateString()} 
                            <span class="tdoc-time">${new Date(doc.uploadDate).toLocaleTimeString()}</span>
                        </td>
                        <td class="center">
                            <button class="tdoc-view-doc-btn" data-index="${index}" title="View File">👁️</button>
                            <button class="tdoc-delete-doc-btn" data-index="${index}" title="Delete File">🗑</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function attachTDocDocumentEventListeners(taskRow) {
    document.querySelectorAll('.tdoc-view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index || '0');
            const docs = taskTDocDocuments.get(taskRow) || [];
            if (docs[index]) {
                showFilePreview(docs[index]);
            }
        });
    });
    
    document.querySelectorAll('.tdoc-delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index || '0');
            showTDocDeleteConfirmation(taskRow, index);
        });
    });
}

function renderDocumentsList(docs, taskRow) {
    if (!docs || docs.length === 0) {
        return `
            <div class="documents-list-empty">
                <div class="documents-list-empty-icon">📄</div>
                <div class="documents-list-empty-text">No documents attached</div>
                <div class="documents-list-empty-hint">Click upload area above to add documents</div>
            </div>
        `;
    }
    
    // Generate table with documents
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


function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}


function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleDateString();
}
function formatTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleTimeString();
}


function escapeHtml(str) {
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

function attachDocumentEventListeners(taskRow) {
    document.querySelectorAll('.view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index || '0');
            const docs = taskDocuments.get(taskRow) || [];
            if (docs[index]) previewDocument(docs[index]);
        });
    });
    
    document.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index || '0');
            showDeleteConfirmation(taskRow, index);
        });
    });
}

const DeleteModal = (function () {
    let modalInstance = null;

    function createModal() {
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

    function setupEventListeners(modal, onConfirm) {
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

    function show(config) {
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
            window.currentDeleteTaskRow = taskRow;
            window.currentDeleteIndex = index;
        }

        setupEventListeners(modalInstance, onConfirm);

        modalInstance.classList.add('show');
    }

    function hide() {
        modalInstance?.classList.remove('show');
    }

    return { show, hide };
})();

function showDeleteConfirmation(taskRow, index) {
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



function deleteDocument(taskRow, index) {
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

function setupUploadHandlers(modal, taskRow) {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const filesContainer = document.getElementById('filesContainer');
    const selectedFilesList = document.getElementById('selectedFilesList');
    const uploadBtn = document.getElementById('uploadSelectedBtn');
    const browseBtn = document.getElementById('browseFileBtn');

    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;

    let selectedFiles = [];

    browseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
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

    function updateSelectedFilesList() {
        if (selectedFiles.length === 0) {
            selectedFilesList.classList.add('hidden');
            uploadBtn.classList.add('hidden');
            return;
        }

        selectedFilesList.classList.remove('hidden');
        uploadBtn.classList.remove('hidden');

        filesContainer.innerHTML = selectedFiles.map((file, index) => `
            <div class="file-item">
                <span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button class="remove-file" data-index="${index}">✕</button>
            </div>
        `).join('');

        filesContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index') || '0');
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

        const currentTaskRow = taskRow || window.currentTaskRow;
        if (!currentTaskRow) {
            alert('Error: Task not found');
            return;
        }

        let taskId = currentTaskRow.dataset.taskId || currentTaskRow.dataset.subtaskId;

        if (!taskId) {
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

            taskId = newId;
        }

        const docs = selectedFiles.map(file => ({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date()
        }));

        const existingDocs = taskDocuments.get(currentTaskRow) || [];
        const updatedDocs = [...existingDocs, ...docs];

        taskDocuments.set(currentTaskRow, updatedDocs);
        if (taskId) taskDocuments.set(taskId, updatedDocs);

        updateCDocColumn();

        selectedFiles = [];
        updateSelectedFilesList();
        fileInput.value = '';

        const listContainer = document.getElementById('documentsListContainer');
        if (listContainer) {
            listContainer.innerHTML = renderDocumentsList(updatedDocs, currentTaskRow);
            attachDocumentEventListeners(currentTaskRow);
        }

        const countSpan = document.getElementById('docCount');
        if (countSpan) countSpan.textContent = updatedDocs.length.toString();

        showNotification(`${docs.length} file(s) uploaded successfully`);
        saveAllData();
    });
}
function saveColumnVisibility() {
    const visibilityState = {};
    columnConfig.forEach(col => {
        visibilityState[col.key] = col.visible;
    });
    localStorage.setItem('columnVisibility', JSON.stringify(visibilityState));
    console.log('Column visibility saved:', visibilityState);
}

function loadColumnVisibility() {
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
function previewDocument(doc) {
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
function addDocumentManagerStyles() {
    if (document.getElementById('document-manager-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'document-manager-styles';
    style.textContent = `/* Paste the entire CSS above here */`;
    document.head.appendChild(style);
}

function initializeDocumentManager() {
    addDocumentManagerStyles();
    updateCDocColumn();
}
function makeStatusEditable() {
    tasks.forEach(task => {
        const statusCell = task.statusBadge.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        statusCell.addEventListener('click', (e) => {
            e.stopPropagation();
            showStatusChangeModal(task);
        });
    });
    
    subtasks.forEach(subtask => {
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
function showStatusChangeModal(task) {
    console.log('Opening status modal for task:', task);
    window.currentTaskForStatus = task;
    
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
    const modal = document.getElementById('statusChangeModal');
    const select = document.getElementById('newStatusSelect');
    
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    
    const commentTextarea = document.getElementById('statusComment');
    const charCounter = modal.querySelector('.status-comment-count');
    
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
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.remove();
        window.currentTaskForStatus = null;
    };
    
    const cancelBtn = document.getElementById('cancelStatusBtn');
    cancelBtn.onclick = function() {
        modal.remove();
        window.currentTaskForStatus = null;
    };
    
    const updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = function() {
        const newStatus = document.getElementById('newStatusSelect').value;
        const comment = document.getElementById('statusComment').value;
        
        if (window.currentTaskForStatus) {
            const task = window.currentTaskForStatus;
            const oldStatus = task.statusBadge ? task.statusBadge.innerText : (task.status || 'Not Started');
            updateBtn.classList.add('loading');
            updateBtn.disabled = true;
            
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
                    window.currentTaskForStatus = null;
                }, 300);
            }, 300);
        } else {
            modal.remove();
            window.currentTaskForStatus = null;
        }
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
            window.currentTaskForStatus = null;
        }
    };
    
    setTimeout(() => {
        select.focus();
    }, 100);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function updateTaskStatusUniversal(task, newStatus) {
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
                cell.style.backgroundColor = '#e8f5e9';
                cell.style.transition = 'background-color 0.3s';
                setTimeout(() => {
                    cell.style.backgroundColor = '';
                }, 500);
                cell.style.cursor = 'pointer';
                cell.setAttribute('title', 'Click to change status');
                makeStatusCellClickable(cell, task);
                console.log('Updated existing extra status cell to:', newStatus);
            });
        } else {
            console.log('Creating new extra status cell...');
            const newCell = document.createElement('td');
            newCell.className = 'extra-cell';
            newCell.setAttribute('data-column', 'taskStatus');
            newCell.textContent = newStatus;
            newCell.style.cursor = 'pointer';
            newCell.style.textAlign = 'center';
            newCell.style.padding = '12px 8px';
            
            task.row.appendChild(newCell);
            makeStatusCellClickable(newCell, task);
            console.log('Created new status cell with value:', newStatus);
        }
    }
    
    task.status = newStatus;
    task.taskStatus = newStatus;
    
    const taskIndex = tasks.findIndex(t => t.id === task.id || t.row === task.row);
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

function makeStatusCellClickable(cell, item) {
    if (!cell) return;
    
    const newCell = cell.cloneNode(true);
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    
    newCell.style.cursor = 'pointer';
    newCell.style.transition = 'all 0.2s';
    newCell.title = 'Click to change status';
    
    newCell.addEventListener('mouseenter', () => {
        newCell.style.backgroundColor = '#fff0f5';
        newCell.style.transform = 'scale(1.02)';
        newCell.style.fontWeight = 'bold';
    });
    
    newCell.addEventListener('mouseleave', () => {
        newCell.style.backgroundColor = '';
        newCell.style.transform = 'scale(1)';
        newCell.style.fontWeight = '';
    });
    
    newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Task Status cell clicked!');
        showStatusChangeModal(item);
    });
    
    return newCell;
}

function initializeStatusCells() {
    console.log('Initializing all status cells...');
    
    tasks.forEach(task => {
        if (task.row) {
            const statusBadge = task.row.querySelector('.skystemtaskmaster-status-badge');
            if (statusBadge) {
                const newBadge = statusBadge.cloneNode(true);
                statusBadge.parentNode.replaceChild(newBadge, statusBadge);
                newBadge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    showStatusChangeModal(task);
                });
                task.statusBadge = newBadge;
            }
            
            const extraStatusCells = task.row.querySelectorAll('.extra-cell[data-column="taskStatus"]');
            extraStatusCells.forEach(cell => {
                makeStatusCellClickable(cell, task);
            });
        }
    });
    
    console.log('Status cells initialized for', tasks.length, 'tasks');
}
function ensureTaskStatusColumnVisible() {
    const statusCol = columnConfig.find(c => c.key === 'taskStatus');
    if (statusCol) {
        statusCol.visible = true;
        console.log('Task Status column visibility ensured');
    }
    
    setTimeout(() => {
        tasks.forEach(task => {
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
function addStatusChangeComment(row, oldStatus, newStatus, comment) {
    const statusHistory = row.getAttribute('data-status-history') || '';
    const newEntry = `${new Date().toLocaleString()}: ${oldStatus} → ${newStatus}${comment ? ' - ' + comment : ''}`;
    row.setAttribute('data-status-history', statusHistory ? statusHistory + '|' + newEntry : newEntry);
}

function updateTaskStatusExtraColumn(row, newStatus) {
    if (!row) return;
    
    const extraCells = row.querySelectorAll('.extra-cell');
    extraCells.forEach(cell => {
        const columnKey = cell.getAttribute('data-column');
        if (columnKey === 'taskStatus') {
            cell.textContent = newStatus;
            
            cell.style.backgroundColor = '';
            cell.style.transition = '';
            setTimeout(() => {
                cell.style.backgroundColor = '';
            }, 500);
            
            console.log('Task Status column updated to:', newStatus);
        }
    });
}
function showSubtaskStatusChangeModal(subtask) {
    console.log('Opening status modal for subtask:', subtask);
    window.currentSubtaskForStatus = subtask;
    
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
    const modal = document.getElementById('statusChangeModal');
    const select = document.getElementById('newStatusSelect');
    const currentStatus = subtask.statusBadge.innerText;
    
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    
    const commentTextarea = document.getElementById('statusComment');
    const charCounter = modal.querySelector('.status-comment-count');
    
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
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    
    const cancelBtn = document.getElementById('cancelStatusBtn');
    cancelBtn.onclick = function() {
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    
    const updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = function() {
        console.log('Update subtask button clicked!');
        
        const newStatus = document.getElementById('newStatusSelect').value;
        const comment = document.getElementById('statusComment').value;
        
        if (window.currentSubtaskForStatus) {
            const subtask = window.currentSubtaskForStatus;
            const oldStatus = subtask.statusBadge.innerText;
            
            updateBtn.classList.add('loading');
            updateBtn.disabled = true;
            
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
                    window.currentSubtaskForStatus = null;
                }, 300);
            }, 300);
        } else {
            modal.remove();
            window.currentSubtaskForStatus = null;
        }
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
            window.currentSubtaskForStatus = null;
        }
    };
    
    setTimeout(() => {
        select.focus();
    }, 100);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function syncAllTaskStatusColumns() {
    console.log('Syncing all task status columns...');
    tasks.forEach(task => {
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
    
    subtasks.forEach(subtask => {
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
function initializeStatusSync() {
    setTimeout(() => {
        syncAllTaskStatusColumns();
    }, 1000);
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                clearTimeout(window.statusSyncTimeout);
                window.statusSyncTimeout = setTimeout(() => {
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
function showSubtaskStatusChangeModal(subtask) {
    console.log('Opening status modal for subtask:', subtask);
    window.currentSubtaskForStatus = subtask;
    
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
    const modal = document.getElementById('statusChangeModal');
    const select = document.getElementById('newStatusSelect');
    const currentStatus = subtask.statusBadge.innerText;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    
    const cancelBtn = document.getElementById('cancelStatusBtn');
    cancelBtn.onclick = function() {
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    
    const updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = function() {
        console.log('Update subtask button clicked!');
        
        const newStatus = document.getElementById('newStatusSelect').value;
        const comment = document.getElementById('statusComment').value;
        
        if (window.currentSubtaskForStatus) {
            const subtask = window.currentSubtaskForStatus;
            const oldStatus = subtask.statusBadge.innerText;
            
            subtask.statusBadge.innerText = newStatus;
            subtask.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
            
            updateCounts();
            showNotification(`Subtask status changed from ${oldStatus} to ${newStatus}`);
            
            if (comment && comment.trim()) {
                console.log('Status change comment:', comment);
            }
        }
        
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
            window.currentSubtaskForStatus = null;
        }
    };
    
    setTimeout(() => {
        select.focus();
    }, 100);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function makeStatusEditable() {
    tasks.forEach(task => {
        const statusCell = task.statusBadge.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        const newStatusCell = statusCell.cloneNode(true);
        statusCell.parentNode.replaceChild(newStatusCell, statusCell);
        newStatusCell.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showStatusChangeModal(task);
        });
    });
    
    subtasks.forEach(subtask => {
        const statusCell = subtask.statusBadge.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        const newStatusCell = statusCell.cloneNode(true);
        statusCell.parentNode.replaceChild(newStatusCell, statusCell);
        newStatusCell.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showSubtaskStatusChangeModal(subtask);
        });
    });
}
function addTaskEventListeners(task) {
    const row = task.row;
    if (!row) return;
    const statusBadge = row.querySelector('.skystemtaskmaster-status-badge');
    if (statusBadge) {
        statusBadge.style.cursor = 'pointer';
        statusBadge.title = 'Click to change status';
        const newBadge = statusBadge.cloneNode(true);
        statusBadge.parentNode.replaceChild(newBadge, statusBadge);
        newBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Status badge clicked');
            showStatusChangeModal(task);
        });
        task.statusBadge = newBadge;
    }
}
function initializeStatus() {
    addStatusStyles();
    makeStatusEditable();
}
function addStatusStyles() {
    if (document.getElementById('status-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'status-styles';
    style.textContent = `/* Paste the entire CSS above here */`;
    document.head.appendChild(style);
}
function showSubtaskStatusChangeModal(subtask) {
    console.log('Opening status modal for subtask:', subtask);
    window.currentSubtaskForStatus = subtask;
    
    const modalHtml = `
        <div id="statusChangeModal" class="modal status-modal">
            <div class="modal-content status-modal-content">
                <span class="close">&times;</span>
                <h3 class="status-modal-title">Change Subtask Status</h3>
                
                <div class="status-modal-body">
                    <div class="status-field">
                        <label class="status-label">Current Status</label>
                        <div id="currentStatusDisplay" class="current-status-display">${escapeHtml(subtask.statusBadge.innerText)}</div>
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
                        </select>
                    </div>
                    
                    <div class="status-field">
                        <label class="status-label">Comment (Optional)</label>
                        <textarea id="statusComment" class="status-comment" rows="3" placeholder="Add comment..."></textarea>
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
    const modal = document.getElementById('statusChangeModal');
    const select = document.getElementById('newStatusSelect');
    const currentStatus = subtask.statusBadge.innerText;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    
    const cancelBtn = document.getElementById('cancelStatusBtn');
    cancelBtn.onclick = function() {
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    
    const updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = function() {
        console.log('Update subtask button clicked!');
        
        const newStatus = document.getElementById('newStatusSelect').value;
        const comment = document.getElementById('statusComment').value;
        
        if (window.currentSubtaskForStatus) {
            const subtask = window.currentSubtaskForStatus;
            const oldStatus = subtask.statusBadge.innerText;
            
            subtask.statusBadge.innerText = newStatus;
            subtask.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
            
            updateCounts();
            showNotification(`Subtask status changed to ${newStatus}`);
            
            if (comment && comment.trim()) {
                console.log('Status change comment:', comment);
            }
        }
        
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
            window.currentSubtaskForStatus = null;
        }
    };
    setTimeout(() => {
        select.focus();
    }, 100);
}
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function updateTaskStatus(task, newStatus, comment) {
    const oldStatus = task.statusBadge.innerText;
    
    task.statusBadge.innerText = newStatus;
    task.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
    
    addStatusChangeComment(task.row, oldStatus, newStatus, comment);
    updateCounts();
    showNotification(`Status changed from ${oldStatus} to ${newStatus}`);
}

function updateSubtaskStatus(subtask, newStatus, comment) {
    const oldStatus = subtask.statusBadge.innerText;
    
    subtask.statusBadge.innerText = newStatus;
    subtask.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
    
    addStatusChangeComment(subtask.row, oldStatus, newStatus, comment);
    updateCounts();
    showNotification(`Subtask status changed from ${oldStatus} to ${newStatus}`);
}

function addStatusChangeComment(row, oldStatus, newStatus, comment) {
    const statusHistory = row.getAttribute('data-status-history') || '';
    const newEntry = `${new Date().toLocaleString()}: ${oldStatus} → ${newStatus}${comment ? ' - ' + comment : ''}`;
    row.setAttribute('data-status-history', statusHistory ? statusHistory + '|' + newEntry : newEntry);
}

function addStatusStyles() {
    if (document.getElementById('status-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'status-styles';
    style.textContent = `/* Paste the CSS above here */`;
    document.head.appendChild(style);
}

function initializeStatus() {
    addStatusStyles();
    makeStatusEditable();
}
function initializeDragAndDrop() {
    console.log('Initializing Drag and Drop...');
    
    tasks.forEach(task => makeRowDraggable(task.row, 'task'));
    subtasks.forEach(subtask => makeRowDraggable(subtask.row, 'subtask'));
    
    addDragStyles();
}

function makeRowDraggable(row, type) {
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

function handleDragStart(e) {
    const row = e.currentTarget;
    
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

function handleDragEnd(e) {
    const row = e.currentTarget;
    row.classList.remove('skystemtaskmaster-dragging');
    
    document.querySelectorAll('tr').forEach(tr => {
        tr.classList.remove('skystemtaskmaster-drag-over', 'skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
    });
    
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const targetRow = e.currentTarget;
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

function handleDragLeave(e) {
    const targetRow = e.currentTarget;
    targetRow.classList.remove('skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const targetRow = e.currentTarget;
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
        tbody.insertBefore(draggedItem.element, targetRow);
    } else {
        tbody.insertBefore(draggedItem.element, targetRow.nextSibling);
    }
    
    if (draggedItem.type === 'task') {
        updateTasksOrder();
    } else {
        updateSubtasksOrder();
    }
    
    saveTaskOrder();
}

function getItemIndex(row, type) {
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

function updateTasksOrder() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const taskRows = allRows.filter(row => 
        !row.classList.contains('skystemtaskmaster-subtask-header') &&
        !row.classList.contains('subtask-row') &&
        !row.classList.contains('main-list-row') &&
        !row.classList.contains('sub-list-row')
    );
    
    tasks.sort((a, b) => {
        const aIndex = taskRows.indexOf(a.row);
        const bIndex = taskRows.indexOf(b.row);
        return aIndex - bIndex;
    });
}

function updateSubtasksOrder() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const subtaskRows = allRows.filter(row => row.classList.contains('subtask-row'));
    
    subtasks.sort((a, b) => {
        const aIndex = subtaskRows.indexOf(a.row);
        const bIndex = subtaskRows.indexOf(b.row);
        return aIndex - bIndex;
    });
}

function saveTaskOrder() {
    const order = {
        tasks: tasks.map(t => ({
            taskName: t.taskNameCell.querySelector('span')?.textContent?.trim() || '',
            dueDate: t.dueDateCell.textContent?.trim() || '',
            status: t.statusBadge.textContent?.trim() || '',
            owner: t.row.cells[5]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            reviewer: t.row.cells[6]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            cdoc: t.row.cells[7]?.textContent?.trim() || ''
        })),
        subtasks: subtasks.map(s => ({
            taskName: s.taskNameCell.querySelector('span')?.textContent?.trim() || '',
            status: s.statusBadge.textContent?.trim() || '',
            owner: s.ownerCell.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            reviewer: s.reviewerCell.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || ''
        }))
    };
    localStorage.setItem('taskOrder', JSON.stringify(order));
}

function loadTaskOrder() {
    const savedOrder = localStorage.getItem('taskOrder');
    if (!savedOrder) return;
    try {
        const order = JSON.parse(savedOrder);
        console.log('Loaded saved order', order);
    } catch (e) {
        console.error('Failed to load saved order', e);
    }
}

function addDragStyles() {
    if (document.getElementById('skystemtaskmaster-drag-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'skystemtaskmaster-drag-styles';
    style.textContent = `/* Paste Drag Styles CSS here */`;
    document.head.appendChild(style);
}

function addUserStyles() {
    if (document.getElementById('skystemtaskmaster-user-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'skystemtaskmaster-user-styles';
    style.textContent = `/* Paste User Styles CSS here */`;
    document.head.appendChild(style);
}

function makeOwnerReviewerClickable() {
    tasks.forEach(task => {
        const ownerCell = task.row.cells[5];
        const reviewerCell = task.row.cells[6];
        if (ownerCell) makeCellClickable(ownerCell, 'owner', task);
        if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', task);
    });
    
    subtasks.forEach(subtask => {
        const ownerCell = subtask.ownerCell;
        const reviewerCell = subtask.reviewerCell;
        if (ownerCell) makeCellClickable(ownerCell, 'owner', subtask);
        if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', subtask);
    });
}

function makeCellClickable(cell, type, item) {
    const oldCell = cell.cloneNode(true);

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
function showUserModal(cell, type, item) {
    const badge = cell.querySelector('.skystemtaskmaster-badge');
    const currentInitials = badge ? badge.textContent?.trim() || '' : '';
    
    let modal = document.getElementById('userSelectionModal');
    
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
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('closeUserModal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        const searchInput = document.getElementById('userSearch');
        searchInput.addEventListener('keyup', () => {
            updateUserList(searchInput.value, currentInitials, type, cell, item);
        });
        
        document.getElementById('unassignUserBtn').addEventListener('click', () => {
            unassignUser(cell, type, item);
            modal.style.display = 'none';
        });
    }
    
    updateUserList('', currentInitials, type, cell, item);
    modal.style.display = 'block';
    
    setTimeout(() => {
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
    }, 100);
}
function updateUserList(searchText, currentInitials, type, cell, item) {
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
                document.getElementById('userSelectionModal').style.display = 'none';
            }
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function assignUser(cell, user, type, item) {
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

function unassignUser(cell, type, item) {
    cell.innerHTML = '';
    
    const emptySpan = document.createElement('span');
    emptySpan.className = 'empty-assignee';
    emptySpan.textContent = '?';
    emptySpan.title = 'Click to assign';
    cell.appendChild(emptySpan);
    
    makeCellClickable(cell, type, item);
    showNotification(`${type} unassigned`);
}
function updateExistingBadges() {
    tasks.forEach(task => {
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
    
    subtasks.forEach(subtask => {
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

function initializeUserSystem() {
    console.log('Initializing user system...');
    addUserStyles();
    updateExistingBadges();
    setTimeout(() => {
        makeOwnerReviewerClickable();
        console.log('User system ready');
    }, 500);
}
function initializeComments() {
    console.log('Initializing comments...');
    addCommentStyles();
    
    setTimeout(() => {
        updateCommentColumn();
    }, 500);
}
function updateCommentColumn() {
    console.log('Updating comment column...');
    tasks.forEach(task => {
        if (task.row) {
            updateCommentCellForRow(task.row, task, 'task');
        }
    });
    subtasks.forEach(subtask => {
        if (subtask.row) {
            updateCommentCellForRow(subtask.row, subtask, 'subtask');
        }
    });
}

function updateCommentCellForRow(row, item, type) {
    if (!row) return;
    const commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    
    commentCells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.add('comment-cell');
        let rowId = null;
        if (type === 'task') {
            rowId = row.dataset.taskId || item.id;
            if (!rowId && item.id) rowId = item.id;
        } else {
            rowId = row.dataset.subtaskId || item.id;
            if (!rowId && item.id) rowId = item.id;
        }
        
        if (!rowId) {
            rowId = type === 'task' ? 
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) : 
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            if (type === 'task') {
                row.dataset.taskId = rowId;
                if (item) item.id = rowId;
            } else {
                row.dataset.subtaskId = rowId;
                if (item) item.id = rowId;
            }
        }
        
        const finalRowId = rowId;
        const commentKey = getCommentKey(finalRowId, type);
        const comments = taskComments[commentKey] || [];
        const count = comments.length;
        
        // Create icon container with CSS classes
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
            badge.textContent = count;
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

function createCommentPanel() {
    let panel = document.getElementById('commentPanel');
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
    panel.querySelector('.close-panel').addEventListener('click', () => {
        panel.classList.remove('open');
        activeCommentRowId = null;
        activeCommentType = null;
        cancelEdit();
    });
    const postBtn = panel.querySelector('.add-comment-btn');
    const textarea = panel.querySelector('textarea');
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
function openCommentPanel(rowId, type) {
    const panel = createCommentPanel();
    activeCommentRowId = rowId;
    activeCommentType = type;
    
    const commentKey = getCommentKey(rowId, type);
    cancelEdit();
    renderComments(commentKey);
    
    panel.classList.add('open');
    
    setTimeout(() => {
        const textarea = panel.querySelector('textarea');
        if (textarea) textarea.focus();
    }, 300);
}

function getCommentKey(rowId, type) {
    return `${type}_${rowId}`;
}

function formatCommentDate(date) {
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

function formatCommentTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
}

function getAuthorFullName(initials) {
    const names = {
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



function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

function cancelEdit() {
    editingCommentId = null;
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
}

function startEditComment(commentKey, commentId) {
    const comments = taskComments[commentKey] || [];
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    editingCommentId = commentId;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = comment.text;
        textarea.placeholder = 'Edit comment...';
        textarea.focus();
        postBtn.textContent = 'Update';
    }
    
    renderComments(commentKey);
}

function updateComment(commentKey, commentId, newText) {
    const comments = taskComments[commentKey] || [];
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    comment.text = newText;
    comment.edited = true;
    comment.timestamp = new Date().toISOString();
    
    taskComments[commentKey] = comments;
    editingCommentId = null;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
    
    renderComments(commentKey);
}

function deleteComment(commentKey, commentId) {
    if (!confirm('Delete this comment?')) return;
    
    const comments = taskComments[commentKey] || [];
    const filtered = comments.filter(c => c.id !== commentId);
    
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

function addCommentStyles() {
    if (document.getElementById('comment-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'comment-styles';
    style.textContent = `/* Paste the CSS from above here */`;
    document.head.appendChild(style);
}
function createCommentPanel() {
    let panel = document.getElementById('commentPanel');
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
    panel.querySelector('.close-panel').addEventListener('click', () => {
        panel.classList.remove('open');
        activeCommentRowId = null;
        activeCommentType = null;
        cancelEdit();
    });
    const postBtn = panel.querySelector('.add-comment-btn');
    const textarea = panel.querySelector('textarea');
    
    postBtn.addEventListener('click', () => {
        if (!activeCommentRowId) {
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
            const now = new Date();
            console.log('Creating new comment at:', now);
            
            const newComment = {
                id: 'c' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                author: 'PK',
                authorName: 'Palakh Khanna',
                text: text,
                timestamp: now.toISOString(), 
                edited: false
            };
            
            comments.push(newComment);
            taskComments[commentKey] = comments;
            
            console.log('Comment saved:', newComment);
            console.log('All comments for this task:', comments);
        }
        textarea.value = '';
        renderComments(commentKey);
        updateCommentIcon(activeCommentRowId, activeCommentType);
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


function ensureAllTasksHaveIds() {
    console.log('Ensuring all tasks and subtasks have IDs...');
    tasks.forEach((task, index) => {
        if (!task.id) {
            task.id = 'task_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5);
        }
        
        if (task.row && !task.row.dataset.taskId) {
            task.row.dataset.taskId = task.id;
        }
    });
    subtasks.forEach((subtask, index) => {
        if (!subtask.id) {
            subtask.id = 'subtask_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5);
        }
        
        if (subtask.row && !subtask.row.dataset.subtaskId) {
            subtask.row.dataset.subtaskId = subtask.id;
        }
    });
    
    console.log('Tasks IDs ensured:', tasks.length, 'subtasks:', subtasks.length);
}
function attachCommentEventListeners(list, commentKey) {
    list.querySelectorAll('.edit-comment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = btn.dataset.id;
            startEditComment(commentKey, commentId);
        });
    });
    list.querySelectorAll('.delete-comment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = btn.dataset.id;
            deleteComment(commentKey, commentId);
        });
    });
}

function startEditComment(commentKey, commentId) {
    const comments = taskComments[commentKey] || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) return;
    
    editingCommentId = commentId;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = comment.text;
        textarea.placeholder = 'Edit comment...';
        textarea.focus();
        postBtn.textContent = 'Update';
    }
    
    renderComments(commentKey);
}

function deleteComment(commentKey, commentId) {
    if (!confirm('Delete this comment?')) return;
    
    const comments = taskComments[commentKey] || [];
    const filtered = comments.filter(c => c.id !== commentId);
    
    if (filtered.length === 0) {
        delete taskComments[commentKey];
    } else {
        taskComments[commentKey] = filtered;
    }
    
    if (editingCommentId === commentId) {
        cancelEdit();
    }
    
    renderComments(commentKey);
    const parts = commentKey.split('_');
    if (parts.length >= 2) {
        updateCommentIcon(parts[1], parts[0]);
    }
}

function updateComment(commentKey, commentId, newText) {
    const comments = taskComments[commentKey] || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) return;
    
    comment.text = newText;
    comment.edited = true;
    comment.timestamp = new Date().toISOString();
    
    taskComments[commentKey] = comments;
    editingCommentId = null;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
    
    renderComments(commentKey);
}
function cancelEdit() {
    editingCommentId = null;
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
}
function openCommentPanel(rowId, type) {
    const panel = createCommentPanel();
    activeCommentRowId = rowId;
    activeCommentType = type;
    
    const commentKey = getCommentKey(rowId, type);
    cancelEdit(); 
    renderComments(commentKey);
    panel.classList.add('open');
    setTimeout(() => {
        const textarea = panel.querySelector('textarea');
        if (textarea) textarea.focus();
    }, 300);
}

function updateCommentIcon(rowId, type) {
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
            icon.setAttribute('data-count', count);
            icon.classList.add('has-comments');
            icon.title = `${count} comment${count > 1 ? 's' : ''}`;
        } else {
            icon.removeAttribute('data-count');
            icon.classList.remove('has-comments');
            icon.title = 'Add comment';
        }
    }
}
function addCommentIcons() {
    document.querySelectorAll('.comment-icon').forEach(icon => icon.remove());
    updateCommentColumn();
}
function updateCommentCellForRow(row, item, type) {
    if (!row) return;
    const commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    
    commentCells.forEach(cell => {
        // Clear cell and set classes instead of inline styles
        cell.innerHTML = '';
        cell.classList.add('comment-cell');
        
        const rowId = type === 'task' ? 
            (row.dataset.taskId || item.id) : 
            (row.dataset.subtaskId || item.id);
        
        if (!rowId) {
            console.error('No ID found for row, generating one');
            const newId = type === 'task' ? 
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) : 
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            if (type === 'task') {
                row.dataset.taskId = newId;
                if (item) item.id = newId;
            } else {
                row.dataset.subtaskId = newId;
                if (item) item.id = newId;
            }
        }
        
        const finalRowId = type === 'task' ? 
            (row.dataset.taskId || item.id) : 
            (row.dataset.subtaskId || item.id);
        
        const commentKey = getCommentKey(finalRowId, type);
        const comments = taskComments[commentKey] || [];
        const count = comments.length;
        
        // Create icon container with CSS classes
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('comment-icon-container');
        
        const icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = count > 0 ? `${count} comment${count > 1 ? 's' : ''}` : 'Add comment';
        
        if (count === 0) {
            icon.classList.add('comment-icon-empty');
        }
        
        if (count > 0) {
            icon.setAttribute('data-count', count);
            iconContainer.classList.add('has-comments');
            
            const badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            badge.textContent = count;
            iconContainer.appendChild(icon);
            iconContainer.appendChild(badge);
        } else {
            iconContainer.appendChild(icon);
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
            
            console.log('Comment icon clicked in Comment column');
            
            const finalRowId = type === 'task' ? 
                (row.dataset.taskId || item.id) : 
                (row.dataset.subtaskId || item.id);
            
            if (!finalRowId) {
                console.error('No ID found for comment');
                return;
            }
            openCommentPanel(finalRowId, type);
        });
    });
}

function addCommentStyles() {
    if (document.getElementById('comment-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'comment-styles';
    style.textContent = `/* Paste the CSS from above here */`;
    document.head.appendChild(style);
}
function createCommentPanel() {
    let panel = document.getElementById('commentPanel');
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
    panel.querySelector('.close-panel').addEventListener('click', () => {
        panel.classList.remove('open');
        activeCommentRowId = null;
        activeCommentType = null;
        cancelEdit();
    });
    const postBtn = panel.querySelector('.add-comment-btn');
    const textarea = panel.querySelector('textarea');
    
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
            
            const now = new Date();
            const newComment = {
                id: 'c' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                author: 'PK',
                authorName: 'Palakh Khanna',
                text: text,
                timestamp: now.toISOString(),
                edited: false
            };
            
            comments.push(newComment);
            taskComments[commentKey] = comments;
            
            console.log('Comment saved:', newComment);
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
function getCommentKey(rowId, type) {
    return `${type}_${rowId}`;
}

function cancelEdit() {
    editingCommentId = null;
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
}

function updateComment(commentKey, commentId, newText) {
    const comments = taskComments[commentKey] || [];
    let comment = null;
    
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
            comment = comments[i];
            break;
        }
    }
    
    if (!comment) return;
    
    comment.text = newText;
    comment.edited = true;
    comment.timestamp = new Date();
    taskComments[commentKey] = comments;
    
    editingCommentId = null;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
    
    renderComments(commentKey);
}
function renderComments(commentKey) {
    const panel = document.getElementById('commentPanel');
    if (!panel) return;
    
    const list = panel.querySelector('.comment-list');
    if (!list) return;
    
    const comments = taskComments[commentKey] || [];
    console.log('Rendering comments for key:', commentKey, 'Count:', comments.length);
    
    if (comments.length === 0) {
        list.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        return;
    }
    
    const sortedComments = [...comments].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
    });
    
    list.innerHTML = sortedComments.map(c => {
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

function attachCommentEventListeners(list, commentKey) {
    if (!list) return;
    
    const editButtons = list.querySelectorAll('.edit-comment-btn');
    const deleteButtons = list.querySelectorAll('.delete-comment-btn');
    
    editButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = newBtn.getAttribute('data-comment-id');
            if (commentId) {
                startEditComment(commentKey, commentId);
            }
        });
    });
    
    deleteButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = newBtn.getAttribute('data-comment-id');
            if (commentId) {
                deleteComment(commentKey, commentId);
            }
        });
    });
}

function startEditComment(commentKey, commentId) {
    console.log('Starting edit for comment:', commentId);
    
    const comments = taskComments[commentKey] || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
        console.error('Comment not found:', commentId);
        return;
    }
    
    editingCommentId = commentId;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        
        if (textarea && postBtn) {
            textarea.value = comment.text;
            textarea.placeholder = 'Edit comment...';
            textarea.focus();
            postBtn.textContent = 'Update';
            
            textarea.setAttribute('data-editing', commentId);
        }
    }
    
    renderComments(commentKey);
}

function deleteComment(commentKey, commentId) {
    console.log('Deleting comment:', commentId);
    
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    const comments = taskComments[commentKey] || [];
    const filtered = comments.filter(c => c.id !== commentId);
    
    if (filtered.length === 0) {
        delete taskComments[commentKey];
    } else {
        taskComments[commentKey] = filtered;
    }
    
    if (editingCommentId === commentId) {
        cancelEdit();
    }
    
    renderComments(commentKey);
    
    const parts = commentKey.split('_');
    if (parts.length >= 2) {
        const type = parts[0];
        const rowId = parts.slice(1).join('_');
        updateCommentIcon(rowId, type);
    }
    
    setTimeout(() => saveAllData(), 100);
    
    showNotification('Comment deleted successfully');
}

function cancelEdit() {
    editingCommentId = null;
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        if (textarea && postBtn) {
            textarea.value = '';
            textarea.placeholder = 'Add a comment...';
            textarea.removeAttribute('data-editing');
            postBtn.textContent = 'Post';
        }
    }
}

function createCommentPanel() {
    let panel = document.getElementById('commentPanel');
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
    
    const closeBtn = panel.querySelector('.close-panel');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('open');
            activeCommentRowId = null;
            activeCommentType = null;
            cancelEdit();
        });
    }
    
    const postBtn = panel.querySelector('.add-comment-btn');
    const textarea = panel.querySelector('textarea');
    
    if (postBtn && textarea) {
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
                const now = new Date();
                
                const newComment = {
                    id: 'c' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    author: 'PK',
                    authorName: 'Palakh Khanna',
                    text: text,
                    timestamp: now.toISOString(),
                    edited: false
                };
                
                comments.push(newComment);
                taskComments[commentKey] = comments;
                
                console.log('New comment added:', newComment);
            }
            
            textarea.value = '';
            renderComments(commentKey);
            updateCommentColumn();
            
            setTimeout(() => saveAllData(), 100);
        });
        
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                postBtn.click();
            } else if (e.key === 'Escape' && editingCommentId) {
                cancelEdit();
                renderComments(getCommentKey(activeCommentRowId, activeCommentType));
            }
        });
    }
    
    return panel;
}

function updateCommentIcon(rowId, type) {
    const commentKey = getCommentKey(rowId, type);
    const comments = taskComments[commentKey] || [];
    const count = comments.length;
    
    let selector = '';
    if (type === 'task') {
        selector = `tr[data-task-id="${rowId}"] .extra-cell[data-column="comment"]`;
    } else {
        selector = `tr[data-subtask-id="${rowId}"] .extra-cell[data-column="comment"]`;
    }
    
    const commentCell = document.querySelector(selector);
    if (commentCell) {
        const row = commentCell.closest('tr');
        if (row) {
            if (type === 'task') {
                const task = tasks.find(t => t.row === row);
                if (task) updateCommentCellForRow(row, task, 'task');
            } else {
                const subtask = subtasks.find(s => s.row === row);
                if (subtask) updateCommentCellForRow(row, subtask, 'subtask');
            }
        }
    }
}
function formatCommentDate(date) {
    try {
        if (!date || isNaN(new Date(date).getTime())) {
            return 'Invalid date';
        }
        
        const commentDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        commentDate.setHours(0, 0, 0, 0);
        if (commentDate.getTime() === today.getTime()) {
            return 'Today';
        }
        else if (commentDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        }
        else {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                weekday: 'short' 
            };
            return commentDate.toLocaleDateString('en-US', options);
        }
    } catch (e) {
        console.error('Error formatting date:', e);
        return String(date);
    }
}

function formatCommentTime(date) {
    try {
        const commentDate = new Date(date);
        const options = { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        };
        return commentDate.toLocaleTimeString('en-US', options);
    } catch (e) {
        console.error('Error formatting time:', e);
        return '';
    }
}
function formatCommentTime(date) {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', options);
}

function getAuthorFullName(initials) {
    const userMap = {
        'PK': 'Palakh Khanna',
        'SM': 'Sarah Miller',
        'MP': 'Mel Preparer',
        'PP': 'Poppy Pan',
        'JS': 'John Smith',
        'EW': 'Emma Watson',
        'DB': 'David Brown'
    };
    return userMap[initials] || initials;
}
function startEditComment(commentKey, commentId) {
    const comments = taskComments[commentKey] || [];
    let comment = null;
    
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
            comment = comments[i];
            break;
        }
    }
    
    if (!comment) return;
    
    editingCommentId = commentId;
    
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea');
        const postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = comment.text;
        textarea.placeholder = 'Edit comment...';
        textarea.focus();
        postBtn.textContent = 'Update';
    }
    
    renderComments(commentKey);
}

function deleteComment(commentKey, commentId) {
    if (!confirm('Delete this comment?')) return;
    
    const comments = taskComments[commentKey] || [];
    const filtered = comments.filter(c => c.id !== commentId);
    taskComments[commentKey] = filtered;
    
    if (editingCommentId === commentId) cancelEdit();
    
    renderComments(commentKey);
}

function formatTime(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return minutes + 'm ago';
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    
    return date.toLocaleDateString();
}

function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

function getUserColor(initials) {
    const colors = {
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

function addCommentIcons() {
    tasks.forEach(task => {
        const firstCell = task.row.cells[0];
        if (!firstCell) return;
        
        const nameDiv = firstCell.querySelector('.skystemtaskmaster-task-name');
        if (!nameDiv) return;
        
        if (nameDiv.querySelector('.comment-icon')) return;
        
        const icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = 'Comments';
        icon.style.marginLeft = '8px';
        icon.style.cursor = 'pointer';
        icon.style.fontSize = '14px';
        icon.style.opacity = '0.6';
        
        icon.addEventListener('mouseenter', () => icon.style.opacity = '1');
        icon.addEventListener('mouseleave', () => icon.style.opacity = '0.6');
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const rowId = task.row.dataset.taskId || '';
            openCommentPanel(rowId, 'task');
        });
        
        nameDiv.appendChild(icon);
    });
    
    subtasks.forEach(subtask => {
        const firstCell = subtask.row.cells[0];
        if (!firstCell) return;
        
        const nameDiv = firstCell.querySelector('.skystemtaskmaster-task-name');
        if (!nameDiv) return;
        
        if (nameDiv.querySelector('.comment-icon')) return;
        
        const icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = 'Comments';
        icon.style.marginLeft = '8px';
        icon.style.cursor = 'pointer';
        icon.style.fontSize = '14px';
        icon.style.opacity = '0.6';
        
        icon.addEventListener('mouseenter', () => icon.style.opacity = '1');
        icon.addEventListener('mouseleave', () => icon.style.opacity = '0.6');
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const rowId = subtask.row.dataset.subtaskId || '';
            openCommentPanel(rowId, 'subtask');
        });
        
        nameDiv.appendChild(icon);
    });
}
function makeCellEditable(cell, task, fieldName) {
    if (!cell) return;
    if (cell.classList.contains('editable-field')) return;

    cell.classList.add('editable-field', 'cell-editable');
    cell.title = `Click to edit ${fieldName}`;

    let originalValue = cell.innerText.trim();

    cell.addEventListener('click', (e) => {
        e.stopPropagation();

        if (cell.classList.contains('editing-mode')) return;

        if (fieldName === 'owner' || fieldName === 'reviewer') {
            showUserSelector(cell, task, fieldName);
        }
        else if (fieldName === 'status') {
            showStatusSelector(cell, task);
        }
        else if (fieldName === 'dueDate') {
            showDatePicker(cell, task);
        }
        else if (fieldName === 'tdoc' || fieldName === 'cdoc' || fieldName === 'acc') {
            showTextEditor(cell, task, fieldName);
        }
        else if (fieldName === 'days') {
            showNotification('Days is auto-calculated from Due Date');
        }
        else {
            showInlineEditor(cell, task, fieldName);
        }
    });

    cell.addEventListener('mouseenter', () => {
        if (!cell.classList.contains('editing-mode')) {
            cell.classList.add('hovered');
        }
    });

    cell.addEventListener('mouseleave', () => {
        cell.classList.remove('hovered');
    });
}
function openCommentPanel(rowId, type) {
    console.log('Opening comment panel for:', type, rowId);
    
    const panel = createCommentPanel();
    activeCommentRowId = rowId;
    activeCommentType = type;
    
    const commentKey = getCommentKey(rowId, type);
    cancelEdit(); 
    renderComments(commentKey);
    panel.classList.add('open');
    setTimeout(() => {
        const textarea = panel.querySelector('textarea');
        if (textarea) textarea.focus();
    }, 300);
}

function addCommentStyles() {
    if (document.getElementById('comment-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'comment-styles';
    style.textContent = `/* Paste the CSS from above here */`;
    document.head.appendChild(style);
}
function addTaskEventListeners(task) {
    const row = task.row;
    if (!row) return;
    const statusCell = row.querySelector('.skystemtaskmaster-status-badge')?.parentElement;
    const statusBadge = row.querySelector('.skystemtaskmaster-status-badge');
if (statusBadge) {
    statusBadge.style.cursor = 'pointer';
    statusBadge.title = 'Click to change status';
    const newBadge = statusBadge.cloneNode(true);
    statusBadge.parentNode.replaceChild(newBadge, statusBadge);
    newBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Status badge clicked');
        showStatusChangeModal(task);
    });
    task.statusBadge = newBadge;
}
    const ownerCell = row.cells[5];
    if (ownerCell) {
        const ownerBadge = ownerCell.querySelector('.skystemtaskmaster-badge');
        if (ownerBadge) {
            ownerBadge.style.cursor = 'pointer';
            ownerCell.style.cursor = 'pointer';
            
            ownerCell.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                showUserModal(ownerCell, 'owner', task);
            });
        }
    }
    
    const reviewerCell = row.cells[6];
    if (reviewerCell) {
        const reviewerBadge = reviewerCell.querySelector('.skystemtaskmaster-badge');
        if (reviewerBadge) {
            reviewerBadge.style.cursor = 'pointer';
            reviewerCell.style.cursor = 'pointer';
            
            reviewerCell.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                showUserModal(reviewerCell, 'reviewer', task);
            });
        }
    }
    
    const checkbox = row.querySelector('.task-checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (statusBadge) {
                    statusBadge.innerText = "Completed";
                    statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-completed";
                }
            } else {
                if (statusBadge) {
                    statusBadge.innerText = "Not Started";
                    statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-not-started";
                }
            }
            updateCounts();
        });
    }
    
    const dueDateCell = row.querySelector('.due-date');
    if (dueDateCell) {
        dueDateCell.addEventListener('blur', calculateDays);
    }
    
    const commentIcon = row.querySelector('.comment-icon');
    if (commentIcon) {
        commentIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openCommentPanel(task.id, 'task');
        });
    }
    
    console.log('Event listeners added for task:', task.name);
}

function addStyles() {
    if (document.getElementById('skystemtaskmaster-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'skystemtaskmaster-styles';
    style.textContent = `/* Paste the CSS from above here */`;
    document.head.appendChild(style);
}
function createModals() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.innerHTML = `
        <div id="newTaskOptionsModal" class="modal">
            <div class="modal-content modal-sm">
                <span class="close">&times;</span>
                <h3>Create New</h3>
                <div class="modal-body">
                    <div class="dropdown-container">
                        <button id="newTaskMainButton" class="dropdown-main-btn">
                            <span>
                                <i class="fa-solid fa-clipboard-list"></i> New Checklist
                            </span>
                            <span class="dropdown-arrow">
                                <i class="fa-solid fa-angle-down"></i>
                            </span>
                        </button>
                        
                        <div id="newTaskDropdown" class="dropdown-menu">
                            <button id="newListOption" class="dropdown-item">
                                <span>
                                    <i class="fa-solid fa-list"></i> New List
                                </span>
                            </button>
                            <button id="importTasksOption" class="dropdown-item">
                                <span>
                                    <i class="fa-solid fa-file-import"></i> Import Tasks
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="enterListNameModal" class="modal">
            <div class="modal-content modal-sm">
                <span class="close">&times;</span>
                <h3>Enter List Name</h3>
                <div class="modal-body">
                    <input type="text" id="listNameInput" class="modal-input" placeholder="Enter list name">
                    <button id="createListBtn" class="modal-btn-primary">Create List</button>
                </div>
            </div>
        </div>
        
        <div id="importTasksModal" class="modal">
            <div class="modal-content modal-lg modal-full-height">
                <div class="modal-header">
                    <span class="close">&times;</span>
                    <h3 class="modal-title">📥 Import Tasks from File</h3>
                </div>
                
                <div class="modal-body-scrollable">
                    <div class="upload-section">
                        <h4 class="section-title">Upload File</h4>
                        
                        <div id="importDropArea" class="drop-area">
                            <div class="drop-area-icon"><i class="fa-solid fa-folder-open"></i></div>
                            <div class="drop-area-title">Drag & drop file here</div>
                            <div class="drop-area-or">or</div>
                            <button id="importBrowseFileBtn" class="btn-browse">Browse Files</button>
                            <input type="file" id="importFileInput" class="file-input" accept=".csv,.json,.txt,.xlsx,.xls">
                        </div>
                        
                        <div class="supported-formats">
                            <strong>Supported formats:</strong> CSV, JSON, TXT (one task per line), Excel (.xlsx, .xls)
                        </div>
                    </div>
                    
                    <div id="importPreviewArea" class="preview-area">
                        <h4 class="section-title">Preview Imported Tasks</h4>
                        <div class="preview-table-container">
                            <table class="preview-table">
                                <thead>
                                    <tr>
                                        <th>Task Name</th>
                                        <th>Owner</th>
                                        <th>Reviewer</th>
                                        <th>Due Date</th>
                                    </tr>
                                </thead>
                                <tbody id="importPreviewBody"></tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="options-section">
                        <h4 class="section-title">Import Options</h4>
                        
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="importTarget" value="newList" checked>
                                <span>Create New List with imported tasks</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="importTarget" value="currentList">
                                <span>Add to currently selected list</span>
                            </label>
                        </div>
                        
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="skipDuplicates" checked>
                                <span>Skip duplicate task names</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button id="cancelImportBtn" class="btn-secondary">Cancel</button>
                    <button id="processImportBtn" class="btn-primary" disabled>Import Tasks</button>
                </div>
            </div>
        </div>
        
        <div id="addTaskModal" class="modal">
            <div class="modal-content modal-md">
                <span class="close">&times;</span>
                <h3>Add New Task</h3>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Task Name *</label>
                        <input type="text" id="addTaskName" class="form-input" placeholder="Enter task name" autofocus>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Acc</label>
                            <input type="text" id="addTaskAcc" class="form-input" value="+">
                        </div>
                        <div class="form-group">
                            <label>TDoc</label>
                            <input type="text" id="addTaskTdoc" class="form-input" value="0">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Owner</label>
                            <select id="addTaskOwner" class="form-select">
                                <option value="PK">PK (Palakh Khanna)</option>
                                <option value="SM">SM (Sarah Miller)</option>
                                <option value="MP">MP (Mel Preparer)</option>
                                <option value="PP">PP (Poppy Pan)</option>
                                <option value="JS">JS (John Smith)</option>
                                <option value="EW">EW (Emma Watson)</option>
                                <option value="DB">DB (David Brown)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Reviewer</label>
                            <select id="addTaskReviewer" class="form-select">
                                <option value="PK">PK (Palakh Khanna)</option>
                                <option value="SM">SM (Sarah Miller)</option>
                                <option value="MP">MP (Mel Preparer)</option>
                                <option value="PP">PP (Poppy Pan)</option>
                                <option value="JS">JS (John Smith)</option>
                                <option value="EW">EW (Emma Watson)</option>
                                <option value="DB">DB (David Brown)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Due Date (optional)</label>
                        <input type="date" id="addTaskDueDate" class="form-input">
                    </div>
                    
                    <button id="addTaskBtn" class="modal-btn-primary">Add Task</button>
                </div>
            </div>
        </div>
        
        <div id="addSubtaskModal" class="modal">
            <div class="modal-content modal-md">
                <span class="close">&times;</span>
                <h3>Add Subtask</h3>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Subtask Name</label>
                        <input type="text" id="subtaskName" class="form-input" placeholder="Enter subtask name">
                    </div>
                    
                    <div class="form-group">
                        <label>Status</label>
                        <select id="subtaskStatus" class="form-select">
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Owner</label>
                            <select id="subtaskOwner" class="form-select">
                                <option value="PK">PK</option>
                                <option value="SM">SM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Reviewer</label>
                            <select id="subtaskReviewer" class="form-select">
                                <option value="PK">PK</option>
                                <option value="SM">SM</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>TDoc</label>
                        <input type="text" id="subtaskTdoc" class="form-input" value="">
                    </div>
                    
                    <button id="addSubtaskBtn" class="modal-btn-primary">Add Subtask</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
}

function initializeEventListeners() {
    const newTaskBtn = document.querySelector('.skystemtaskmaster-btn-new');
    const newTaskOptionsModal = document.getElementById('newTaskOptionsModal');
    const enterListNameModal = document.getElementById('enterListNameModal');
    const importTasksModal = document.getElementById('importTasksModal');
    const addTaskModal = document.getElementById('addTaskModal');
    const addSubtaskModal = document.getElementById('addSubtaskModal');
    
    if (newTaskBtn && newTaskOptionsModal) {
        newTaskBtn.addEventListener('click', () => {
            newTaskOptionsModal.style.display = 'block';
        });
    }
    
    const newTaskMainButton = document.getElementById('newTaskMainButton');
    const newTaskDropdown = document.getElementById('newTaskDropdown');
    
    if (newTaskMainButton && newTaskDropdown) {
        newTaskMainButton.addEventListener('click', function(e) {
            e.stopPropagation();
            newTaskDropdown.style.display = newTaskDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
    document.addEventListener('click', function() {
        if (newTaskDropdown) {
            newTaskDropdown.style.display = 'none';
        }
    });
    if (newTaskDropdown) {
        newTaskDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            newTaskOptionsModal.style.display = 'none';
            enterListNameModal.style.display = 'none';
            importTasksModal.style.display = 'none';
            addTaskModal.style.display = 'none';
            addSubtaskModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === newTaskOptionsModal) newTaskOptionsModal.style.display = 'none';
        if (event.target === enterListNameModal) enterListNameModal.style.display = 'none';
        if (event.target === importTasksModal) importTasksModal.style.display = 'none';
        if (event.target === addTaskModal) addTaskModal.style.display = 'none';
        if (event.target === addSubtaskModal) addSubtaskModal.style.display = 'none';
    });
    
    const newListOption = document.getElementById('newListOption');
    if (newListOption) {
        newListOption.addEventListener('click', () => {
            newTaskOptionsModal.style.display = 'none';
            enterListNameModal.style.display = 'block';
            if (newTaskDropdown) newTaskDropdown.style.display = 'none';
        });
    }
    
    const importTasksOption = document.getElementById('importTasksOption');
    if (importTasksOption) {
        importTasksOption.addEventListener('click', () => {
            newTaskOptionsModal.style.display = 'none';
            importTasksModal.style.display = 'block';
            if (newTaskDropdown) newTaskDropdown.style.display = 'none';
        });
    }
    
    const createListBtn = document.getElementById('createListBtn');
    const listNameInput = document.getElementById('listNameInput');
    
    if (createListBtn) {
        createListBtn.addEventListener('click', () => {
            const listName = listNameInput.value.trim();
            if (listName) {
                createMainList(listName);
                enterListNameModal.style.display = 'none';
                listNameInput.value = '';
            } else {
                alert('Please enter a list name');
            }
        });
    }
    
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            const taskName = document.getElementById('addTaskName').value.trim();
            if (!taskName) {
                alert('Please enter a task name');
                return;
            }
            
            if (subLists.length > 0) {
                createTask(subLists[subLists.length - 1], {
                    name: taskName,
                    acc: document.getElementById('addTaskAcc').value || '+',
                    tdoc: document.getElementById('addTaskTdoc').value || '0',
                    owner: document.getElementById('addTaskOwner').value,
                    reviewer: document.getElementById('addTaskReviewer').value,
                    dueDate: document.getElementById('addTaskDueDate').value
                });
            } else {
                createNewTask(taskName, 
                    document.getElementById('addTaskAcc').value || '+', 
                    document.getElementById('addTaskTdoc').value || '0', 
                    document.getElementById('addTaskOwner').value, 
                    document.getElementById('addTaskReviewer').value, 
                    document.getElementById('addTaskDueDate').value
                );
            }
            
            addTaskModal.style.display = 'none';
            document.getElementById('addTaskName').value = '';
        });
    }
    
    const addSubtaskBtn = document.getElementById('addSubtaskBtn');
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', createNewSubtask);
    }
    
    const taskPlus = document.querySelector('.task-plus');
    if (taskPlus) {
        taskPlus.addEventListener('click', () => {
            addTaskModal.style.display = 'block';
        });
    }
    
    const subtaskPlus = document.querySelector('.subtask-plus');
    if (subtaskPlus) {
        subtaskPlus.addEventListener('click', () => {
            addSubtaskModal.style.display = 'block';
        });
    }
    
    const importTaskBtn = document.getElementById('importTaskBtn');
    if (importTaskBtn) {
        importTaskBtn.addEventListener('click', function() {
            const taskName = document.getElementById('importTaskName').value;
            if (!taskName) {
                alert('Please enter task name');
                return;
            }
            
            if (subLists.length > 0) {
                createTask(subLists[subLists.length - 1], {
                    name: taskName,
                    acc: document.getElementById('importAcc').value || '+',
                    tdoc: document.getElementById('importTdoc').value || '0',
                    owner: document.getElementById('importOwner').value,
                    reviewer: document.getElementById('importReviewer').value,
                    dueDate: document.getElementById('importDueDate').value
                });
            } else {
                createNewTask(taskName, 
                    document.getElementById('importAcc').value || '+', 
                    document.getElementById('importTdoc').value || '0', 
                    document.getElementById('importOwner').value, 
                    document.getElementById('importReviewer').value, 
                    document.getElementById('importDueDate').value
                );
            }
            
            importTasksModal.style.display = 'none';
            showNotification('Task imported!');
        });
    }
    initializeThreeDotsMenu();
    
    const searchInput = document.querySelector(".skystemtaskmaster-search-bar");
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const value = searchInput.value.toLowerCase();
            tasks.forEach(task => {
                const text = task.row.innerText.toLowerCase();
                task.row.style.display = text.indexOf(value) !== -1 ? "" : "none";
            });
            subtasks.forEach(subtask => {
                const text = subtask.row.innerText.toLowerCase();
                subtask.row.style.display = text.indexOf(value) !== -1 ? "" : "none";
            });
        });
    }
    
    const taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown");
    if (taskDropdown) {
        taskDropdown.addEventListener("change", () => {
            const filter = taskDropdown.value;
            tasks.forEach(task => {
                var _a, _b;
                const ownerCell = task.row.cells[5];
                const reviewerCell = task.row.cells[6];
                const ownerBadge = ownerCell === null || ownerCell === void 0 ? void 0 : ownerCell.querySelector('.skystemtaskmaster-badge');
                const reviewerBadge = reviewerCell === null || reviewerCell === void 0 ? void 0 : reviewerCell.querySelector('.skystemtaskmaster-badge');
                const ownerText = ownerBadge ? ((_a = ownerBadge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '' : '';
                const reviewerText = reviewerBadge ? ((_b = reviewerBadge.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '' : '';
                switch (filter) {
                    case "all":
                        task.row.style.display = "";
                        break;
                    case "assigned-to-me":
                        task.row.style.display = (reviewerText === "PK") ? "" : "none";
                        break;
                    case "self-assigned":
                        task.row.style.display = (ownerText === "PK" && reviewerText === "PK") ? "" : "none";
                        break;
                    case "created-by-me":
                        task.row.style.display = (ownerText === "PK") ? "" : "none";
                        break;
                    default:
                        task.row.style.display = "";
                }
            });
            subtasks.forEach(subtask => {
                var _a, _b;
                const ownerBadge = subtask.ownerCell.querySelector('.skystemtaskmaster-badge');
                const reviewerBadge = subtask.reviewerCell.querySelector('.skystemtaskmaster-badge');
                const ownerText = ownerBadge ? ((_a = ownerBadge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '' : '';
                const reviewerText = reviewerBadge ? ((_b = reviewerBadge.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '' : '';
                switch (filter) {
                    case "all":
                        subtask.row.style.display = "";
                        break;
                    case "assigned-to-me":
                        subtask.row.style.display = (reviewerText === "PK") ? "" : "none";
                        break;
                    case "self-assigned":
                        subtask.row.style.display = (ownerText === "PK" && reviewerText === "PK") ? "" : "none";
                        break;
                    case "created-by-me":
                        subtask.row.style.display = (ownerText === "PK") ? "" : "none";
                        break;
                    default:
                        subtask.row.style.display = "";
                }
            });
        });
    }
}
function setRecurrenceTypeCell(cell, value) {
    cell.setAttribute('data-column', 'recurrenceType');
    cell.setAttribute('data-value', value);
    cell.textContent = value || 'None';
    
    cell.classList.add('recurrence-type-cell');
    
    if (value && value !== 'None') {
        cell.classList.add('recurrence-type-recurring');
        cell.classList.remove('recurrence-type-none');
    } else {
        cell.classList.add('recurrence-type-none');
        cell.classList.remove('recurrence-type-recurring');
    }
}

function createTask(subList, taskData) {
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
function initializeAccountForRow(row, task) {
    if (!row) return;
    
    const accountCells = row.querySelectorAll('.extra-cell[data-column="linkedAccounts"]');
    
    accountCells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.add('account-cell');
        
        const taskId = task.id || row.dataset.taskId;
        const accounts = taskAccounts.get(row) || taskAccounts.get(taskId) || [];
        
        if (accounts && accounts.length > 0) {
            accounts.forEach(account => {
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
            if (e.target === cell || e.target.classList.contains('account-cell')) {
                showAccountLinkingModal(row, task);
            }
        };
    });
}
function makeExtraCellsEditable(row, task) {
    row.querySelectorAll('.extra-cell').forEach(cell => {
        const colKey = cell.getAttribute('data-column');
        
        if (colKey === 'taskOwner' || colKey === 'createdBy' || colKey === 'approver') {
            makeExtraUserCellClickable(cell, task, colKey);
        }
        else if (colKey === 'taskStatus') {
            makeStatusCellClickable(cell, task);
        }
        else if (colKey === 'recurrenceType') {
            makeRecurrenceCellClickable(row, task);
        }
        else {
            makeGenericCellEditable(cell, task, colKey);
        }
    });
}

function makeTaskStatusClickable(task) {
    if (task.statusBadge) {
        task.statusBadge.style.cursor = 'pointer';
        task.statusBadge.title = 'Click to change status';
        
        const newBadge = task.statusBadge.cloneNode(true);
        task.statusBadge.parentNode.replaceChild(newBadge, task.statusBadge);
        
        newBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showStatusChangeModal(task);
        });
        
        task.statusBadge = newBadge;
    }
    
    if (task.row) {
        const extraStatusCell = task.row.querySelector('.extra-cell[data-column="taskStatus"]');
        if (extraStatusCell) {
            makeStatusCellClickable(extraStatusCell, task);
        }
    }
}

function makeUserColumnsClickable(row, task) {
    row.querySelectorAll('.extra-cell[data-column="taskOwner"], .extra-cell[data-column="createdBy"], .extra-cell[data-column="approver"]').forEach(cell => {
        const colKey = cell.getAttribute('data-column');
        makeExtraUserCellClickable(cell, task, colKey);
    });
}
function makeRecurrenceCellClickable(row, task) {
    const recurrenceCell = row.querySelector('.extra-cell[data-column="recurrenceType"]');
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
            showRecurrenceTypeModal(task, recurrenceCell, recurrenceCell.textContent.trim() || 'None');
        });
    }
}

function makeGenericCellEditable(cell, task, columnKey) {

    cell.classList.add('editable-cell');
    cell.title = `Click to edit ${columnKey}`;

    cell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const currentValue = cell.textContent.trim();
        const newValue = prompt(`Enter ${columnKey}:`, currentValue);

        if (newValue !== null && newValue.trim() !== '') {
            cell.textContent = newValue.trim();
            task[columnKey] = newValue.trim();

            showNotification(`${columnKey} updated to: ${newValue}`);
            setTimeout(() => saveAllData(), 100);
        }
    });
}

function updateCDocColumnForRow(row) {
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
        badge.textContent = docs.length;
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

function updateTDocColumnForRow(row) {
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
        badge.textContent = docs.length;
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

function updateCommentColumnForRow(row, item, type) {
    if (!row) return;
    
    const commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    
    commentCells.forEach(cell => {
        // Clear cell and set basic styles via CSS
        cell.innerHTML = '';
        cell.classList.add('comment-cell');
        
        let rowId = type === 'task' ? 
            (row.dataset.taskId || item.id) : 
            (row.dataset.subtaskId || item.id);
        
        if (!rowId) {
            rowId = type === 'task' ? 
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) : 
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            if (type === 'task') {
                row.dataset.taskId = rowId;
                if (item) item.id = rowId;
            } else {
                row.dataset.subtaskId = rowId;
                if (item) item.id = rowId;
            }
        }
        
        const commentKey = getCommentKey(rowId, type);
        const comments = taskComments[commentKey] || [];
        const count = comments.length;
        
        // Create icon container
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
            badge.textContent = count;
            iconContainer.appendChild(badge);
        }
        
        cell.appendChild(iconContainer);
        
        // Add event listeners
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


function updateRecurrenceClasses() {
    tasks.forEach(task => {
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
function updateTaskRecurrence(taskId, newRecurrenceType) {
    const task = tasks.find(t => t.id === taskId || t.row.dataset.taskId === taskId);

    if (task) {
        const oldType = task.recurrenceType || 'None';
        task.recurrenceType = newRecurrenceType;

        const isRecurring = newRecurrenceType !== 'None';

        // Row class update
        task.row.classList.remove('recurring-task', 'non-recurring-task');
        task.row.classList.add(isRecurring ? 'recurring-task' : 'non-recurring-task');

        task.row.setAttribute('data-recurrence-type', newRecurrenceType);

        const nameDiv = task.row.cells[0].querySelector('.skystemtaskmaster-task-name');

        if (nameDiv) {
            let indicator = nameDiv.querySelector('.recurrence-indicator');

            if (indicator) {
                indicator.textContent = newRecurrenceType;
                indicator.title = `Recurrence: ${newRecurrenceType} (Click to change)`;

                // ✅ remove inline style → use classes
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
function syncRecurrenceFromColumn() {
    tasks.forEach(task => {
        const extraCells = task.row.querySelectorAll('.extra-cell');
        let recurrenceValue = 'None';
        
        extraCells.forEach(cell => {
            const colKey = cell.getAttribute('data-column');
            if (colKey === 'recurrenceType') {
                recurrenceValue = cell.textContent.trim();
            }
        });
        if (task.recurrenceType !== recurrenceValue) {
            task.recurrenceType = recurrenceValue;
            const nameDiv = task.row.cells[0].querySelector('.skystemtaskmaster-task-name');
            if (nameDiv) {
                let indicator = nameDiv.querySelector('.recurrence-indicator');
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


function showRecurrenceModal(task) {
    let modal = document.getElementById('recurrenceModal');
    
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
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('cancelRecurrenceBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('saveRecurrenceBtn').addEventListener('click', () => {
            const newType = document.getElementById('recurrenceTypeSelect').value;
            const taskId = modal.getAttribute('data-current-task-id');
            updateTaskRecurrence(taskId, newType);
            modal.style.display = 'none';
        });
    }
    
    const select = document.getElementById('recurrenceTypeSelect');
    select.value = task.recurrenceType || 'None';
    
    const currentDisplay = document.getElementById('currentRecurrenceDisplay');
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
    
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
document.addEventListener('DOMContentLoaded', function() {    
    setTimeout(() => {
        addRecurrenceStyles();
        updateRecurrenceClasses();
        addRecurrenceEditor();
        console.log('Recurrence indicators initialized');
    }, 600);
});

function createSampleData() {
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
function addSortStyles() {
    if (document.querySelector('link[href*="sort-styles.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'sort-styles.css';
    document.head.appendChild(link);
}
let importedTasksData = []; 
function initializeFileImport() {
    console.log('Initializing file import...');
    
    const dropArea = document.getElementById('importDropArea');
    const fileInput = document.getElementById('importFileInput');
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
        const files = e.target.files;
        if (files.length > 0) {
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
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    });
    
    cancelBtn.addEventListener('click', () => {
        resetImportModal();
        document.getElementById('importTasksModal').style.display = 'none';
    });
    
    processBtn.addEventListener('click', () => {
        importTasks();
    });
    
    function processFile(file) {
        console.log('Processing file:', file.name);
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
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
    
    function parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
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
    
    function parseJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target.result);
                
                if (Array.isArray(content)) {
                    importedTasksData = content.map(item => ({
                        name: item.name || item.taskName || item.task || 'Unnamed Task',
                        owner: item.owner || item.taskOwner || 'PK',
                        reviewer: item.reviewer || 'SM',
                        dueDate: item.dueDate || item.due || '',
                        acc: item.acc || '+',
                        tdoc: item.tdoc || item.tDoc || '0',
                        status: item.status || item.taskStatus || 'Not Started'
                    }));
                } else if (content.tasks && Array.isArray(content.tasks)) {
                    importedTasksData = content.tasks.map(item => ({
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
                alert('Invalid JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    function parseTXT(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
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
    
    function showSampleFormat() {
        importedTasksData = [
            { name: 'Sample Task 1', owner: 'PK', reviewer: 'SM', dueDate: '2025-12-31', acc: '+', tdoc: '0', status: 'Not Started' },
            { name: 'Sample Task 2', owner: 'SM', reviewer: 'PK', dueDate: '2025-12-15', acc: '+', tdoc: '0', status: 'Not Started' }
        ];
        showPreview(importedTasksData);
    }
    
    function showPreview(tasks) {
        if (!previewBody || !previewArea) return;
        
        previewArea.style.display = 'block';
        processBtn.disabled = false;
        
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
    
    function importTasks() {
        if (importedTasksData.length === 0) {
            alert('No tasks to import');
            return;
        }
        
        const importTarget = document.querySelector('input[name="importTarget"]:checked').value;
        const skipDuplicates = document.getElementById('skipDuplicates').checked;
        
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
        document.getElementById('importTasksModal').style.display = 'none';
        showNotification(`Successfully imported ${importedTasksData.length} tasks!`);
    }
    
    function importTasksToSublist(sublist, tasks, skipDuplicates) {
        const existingTaskNames = sublist.tasks.map(t => t.name.toLowerCase());
        
        tasks.forEach(taskData => {
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
    
    function resetImportModal() {
        importedTasksData = [];
        if (previewArea) previewArea.style.display = 'none';
        if (previewBody) previewBody.innerHTML = '';
        if (processBtn) processBtn.disabled = true;
        if (fileInput) fileInput.value = '';
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
function makeRecurrenceEditable() {
    console.log('Making recurrence cells editable...');

    document.querySelectorAll('.extra-cell[data-column="recurrenceType"]').forEach(cell => {

        // Remove old listeners safely
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);

        // Add base class instead of inline styles
        newCell.classList.add('recurrence-editable');
        newCell.title = 'Click to change recurrence type';

        // Hover effect via class (no inline styles)
        newCell.addEventListener('mouseenter', () => {
            newCell.classList.add('hovered');
        });

        newCell.addEventListener('mouseleave', () => {
            newCell.classList.remove('hovered');
        });

        // Click event
        newCell.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const row = newCell.closest('tr');
            if (!row) return;

            const task = tasks.find(t => t.row === row);
            if (!task) return;

            const currentValue = newCell.textContent.trim();

            showRecurrenceTypeModal(task, newCell, currentValue);
        });
    });
}

function showRecurrenceTypeModal(task, cell, currentValue) {
    let modal = document.getElementById('recurrenceTypeModal');
    
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
        
        // Event listeners
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('cancelRecurrenceTypeBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('saveRecurrenceTypeBtn').addEventListener('click', () => {
            const select = document.getElementById('recurrenceTypeSelect');
            const newValue = select.value;
            const taskId = modal.getAttribute('data-current-task-id');
            const cellId = modal.getAttribute('data-current-cell-id');
            const targetCell = document.querySelector(`.extra-cell[data-recurrence-cell-id="${cellId}"]`);
            
            if (targetCell) {
                targetCell.textContent = newValue;
            } else if (window.currentRecurrenceCell) {
                window.currentRecurrenceCell.textContent = newValue;
            }
            
            if (window.currentRecurrenceTask) {
                window.currentRecurrenceTask.recurrenceType = newValue;
                const row = window.currentRecurrenceTask.row;
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
    
    const select = document.getElementById('recurrenceTypeSelect');
    select.value = currentValue;
    
    const currentDisplay = document.getElementById('currentRecurrenceDisplay');
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
    
    window.currentRecurrenceTask = task;
    window.currentRecurrenceCell = cell;
    
    if (!cell.hasAttribute('data-recurrence-cell-id')) {
        const cellId = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        cell.setAttribute('data-recurrence-cell-id', cellId);
    }
    
    modal.setAttribute('data-current-task-id', task.id || task.row.dataset.taskId);
    modal.setAttribute('data-current-cell-id', cell.getAttribute('data-recurrence-cell-id'));
    
    modal.style.display = 'block';
}
function updateRecurrenceFromCell(cell, newValue) {
    const row = cell.closest('tr');
    if (!row) return;
    
    const task = tasks.find(t => t.row === row);
    if (!task) return;

    task.recurrenceType = newValue;

    row.classList.remove('recurring-task', 'non-recurring-task');

    if (newValue !== 'None') {
        row.classList.add('recurring-task');
    } else {
        row.classList.add('non-recurring-task');
    }

    row.setAttribute('data-recurrence-type', newValue);

    const nameDiv = row.cells[0]?.querySelector('.skystemtaskmaster-task-name');

    if (nameDiv) {
        let indicator = nameDiv.querySelector('.recurrence-indicator');

        if (indicator) {
            indicator.textContent = newValue;
            indicator.title = `Recurrence: ${newValue} (Click to change)`;

            // ✅ Only class toggle (no inline CSS)
            indicator.classList.remove('recurring', 'non-recurring');

            if (newValue !== 'None') {
                indicator.classList.add('recurring');
            } else {
                indicator.classList.add('non-recurring');
            }
        }
    }
}

function addRecurrenceEditorStyles() {
    if (document.querySelector('link[href*="recurrence-editor-styles.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'recurrence-editor-styles.css';
    document.head.appendChild(link);
}

function initializeRecurrenceEditor() {
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
function makeRecurrenceCellsClickable() {
    console.log('Making recurrence cells clickable...');
    
    const recurrenceCells = document.querySelectorAll('.extra-cell[data-column="recurrenceType"]');
    console.log('Found recurrence cells:', recurrenceCells.length);

    recurrenceCells.forEach((cell, index) => {

        if (cell.classList.contains('recurrence-initialized')) {
            return;
        }

        cell.classList.add('recurrence-initialized');
        cell.classList.add('recurrence-cell'); // 👈 apply CSS class
        cell.setAttribute('title', 'Click to change recurrence type');

        // Remove old listeners by cloning
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);

        newCell.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            console.log('Recurrence cell clicked!');

            const row = this.closest('tr');
            if (!row) {
                console.error('No parent row found');
                return;
            }

            const task = tasks.find(t => t.row === row);
            if (!task) {
                console.error('No task found for row');
                return;
            }

            const currentValue = this.textContent.trim() || 'None';
            console.log('Current value:', currentValue);

            showRecurrenceTypeModal(task, this, currentValue);
        });

        console.log(`Cell ${index} initialized with click handler`);
    });
}
function showRecurrenceTypeModal(task, cell, currentValue) {
    console.log('Opening recurrence modal for task:', task.name, 'Current value:', currentValue);
    
    const existingModal = document.getElementById('recurrenceTypeModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'recurrenceTypeModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Set Recurrence Type</h3>
            
            <div class="task-info">
                <div class="task-info-label">Task:</div>
                <div class="task-info-name">${task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task'}</div>
            </div>
            
            <div class="current-recurrence-section">
                <label class="current-recurrence-label">Current Recurrence</label>
                <div class="current-recurrence-value ${currentValue !== 'None' ? 'recurring' : 'non-recurring'}">
                    ${currentValue || 'None'}
                </div>
            </div>
            
            <div class="recurrence-select-section">
                <label class="recurrence-select-label">Select Recurrence Type</label>
                <select id="recurrenceTypeSelect">
                    <optgroup label="Recurring Tasks">
                        <option value="Every Period" ${currentValue === 'Every Period' ? 'selected' : ''}>Every Period</option>
                        <option value="Quarterly" ${currentValue === 'Quarterly' ? 'selected' : ''}>Quarterly</option>
                        <option value="Annual" ${currentValue === 'Annual' ? 'selected' : ''}>Annual</option>
                    </optgroup>
                    <optgroup label="Non-Recurring Tasks">
                        <option value="Multiple" ${currentValue === 'Multiple' ? 'selected' : ''}>Multiple</option>
                        <option value="Custom" ${currentValue === 'Custom' ? 'selected' : ''}>Custom</option>
                        <option value="None" ${currentValue === 'None' ? 'selected' : ''}>None</option>
                    </optgroup>
                </select>
            </div>
            
            <div class="note-section">
                <strong>Note:</strong> Recurrence type determines the task's border color:<br>
                <span class="color-indicator gray"></span> Gray = Recurring (Every Period, Quarterly, Annual)<br>
                <span class="color-indicator blue"></span> Blue = Non-recurring (None, Multiple, Custom)
            </div>
            
            <div class="modal-buttons">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-save">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store references
    window.currentRecurrenceTask = task;
    window.currentRecurrenceCell = cell;
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const saveBtn = modal.querySelector('.btn-save');
    const select = document.getElementById('recurrenceTypeSelect');
    
    // Close modal function
    const closeModal = () => {
        modal.remove();
    };
    
    // Save function
    const saveRecurrenceType = () => {
        const newValue = select.value;
        console.log('Saving new recurrence value:', newValue);
        
        if (window.currentRecurrenceCell) {
            window.currentRecurrenceCell.textContent = newValue;
            
            if (window.currentRecurrenceTask) {
                window.currentRecurrenceTask.recurrenceType = newValue;
                
                const row = window.currentRecurrenceTask.row;
                if (row) {
                    // Remove existing classes
                    row.classList.remove('recurring-task', 'non-recurring-task');
                    
                    // Add appropriate class based on recurrence type
                    const recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
                    if (recurringOptions.includes(newValue)) {
                        row.classList.add('recurring-task');
                    } else {
                        row.classList.add('non-recurring-task');
                    }
                    
                    // Set data attribute
                    row.setAttribute('data-recurrence-type', newValue);
                }
            }
            
            // Save to storage
            setTimeout(() => saveAllData(), 100);
            
            // Show notification
            if (typeof showNotification === 'function') {
                showNotification(`Recurrence type set to: ${newValue}`);
            } else {
                console.log(`Recurrence type set to: ${newValue}`);
            }
        }
        
        closeModal();
    };
    
    // Attach event listeners
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', saveRecurrenceType);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Focus on select element
    setTimeout(() => {
        if (select) select.focus();
    }, 100);
}
function initializeRecurrenceEditor() {
    console.log('Initializing Recurrence Type Editor...');
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
function addRecurrenceEditorStyles() {
    if (document.getElementById('recurrence-editor-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'recurrence-editor-styles';
    style.textContent = `/* Paste the CSS from above here */`;
    document.head.appendChild(style);
}
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
