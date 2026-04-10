"use strict";

// ================================
// INTERFACES AND TYPE DEFINITIONS
// ================================
interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
    mandatory: boolean;
    forSubtask: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: string;
}

interface Task {
    id?: string;
    subListId?: string;
    row: HTMLTableRowElement;
    checkbox: HTMLInputElement;
    statusBadge: HTMLElement;
    dueDateCell: HTMLElement;
    daysCell: HTMLElement;
    taskNameCell: HTMLElement;
    name?: string;
    acc?: string;
    tdoc?: string;
    owner?: string;
    reviewer?: string;
    dueDate?: string;
    status?: string;
    taskNumber?: string;
    taskOwner?: string;
    taskStatus?: string;
    approver?: string;
    recurrenceType?: string;
    completionDoc?: string;
    cdoc?: string;
    createdBy?: string;
    comment?: string;
    assigneeDueDate?: string;
    customField1?: string;
    reviewerDueDate?: string;
    customField2?: string;
    linkedAccounts?: any;
    completionDate?: string;
    notifier?: string;
    [key: string]: any;
}

interface Subtask {
    id?: string;
    row: HTMLTableRowElement;
    checkbox: HTMLInputElement;
    statusBadge: HTMLElement;
    taskNameCell: HTMLElement;
    ownerCell: HTMLElement;
    reviewerCell: HTMLElement;
    name?: string;
    owner?: string;
    reviewer?: string;
    status?: string;
    taskStatus?: string;
    taskOwner?: string;
    createdBy?: string;
    approver?: string;
    dueDate?: string;
    [key: string]: any;
}

interface MainList {
    id: string;
    name: string;
    subLists: SubList[];
    row: HTMLTableRowElement | null;
    isExpanded: boolean;
}

interface SubList {
    id: string;
    name: string;
    mainListId: string;
    tasks: Task[];
    row: HTMLTableRowElement | null;
    isExpanded: boolean;
}

interface DocumentFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
}

interface Account {
    accountNumber?: string;
    accountName?: string;
    accountType?: string;
    isKeyAccount?: string | boolean;
    reconcileable?: boolean;
    linkedDate?: string | Date;
    orgHierarchy?: string;
    fsCaption?: string;
    accountOwners?: string[];
    accountFrom?: string;
    accountTo?: string;
    dueDaysFrom?: string;
    dueDaysTo?: string;
    riskRating?: string;
    zba?: string;
    linkedBy?: string;
    [key: string]: any;
}

interface TaskComment {
    id: string;
    author: string;
    authorName: string;
    text: string;
    timestamp: Date | string;
    edited: boolean;
}

interface TaskComments {
    [key: string]: TaskComment[];
}

interface SavedData {
    mainLists: any[];
    subLists: any[];
    tasks: any[];
    cdocDocuments: { [key: string]: DocumentFile[] };
    tdocDocuments: { [key: string]: DocumentFile[] };
    linkedAccountsMap: { [key: string]: Account[] };
    taskComments: TaskComments;
}

interface DraggedItem {
    element: HTMLTableRowElement;
    type: 'task' | 'subtask';
    originalIndex: number;
}

interface CurrentSort {
    column: string | null;
    direction: 'asc' | 'desc';
}

// ================================
// GLOBAL VARIABLES
// ================================

let mainLists: MainList[] = [];
let subLists: SubList[] = [];
let tasks: Task[] = [];
let subtasks: Subtask[] = [];

// Column configuration
const columnConfig: ColumnConfig[] = [
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

const taskDocuments: Map<HTMLTableRowElement | string, DocumentFile[]> = new Map();
const taskTDocDocuments: Map<HTMLTableRowElement | string, DocumentFile[]> = new Map();
const taskAccounts: Map<HTMLTableRowElement | string, Account[]> = new Map();
const taskComments: TaskComments = {}
let draggedItem: DraggedItem | null = null;

let currentTaskForStatus: Task | null = null;
let currentSubtaskForStatus: Subtask | null = null;

let activeCommentRowId: string | null = null;
let activeCommentType: string | null = null;
let editingCommentId: string | null = null;

const availableUsers: User[] = [
    { id: '1', name: 'Palakh Khanna', email: 'palakh@skystem.com', initials: 'PK', role: 'Owner' },
    { id: '2', name: 'Sarah Miller', email: 'sarah@skystem.com', initials: 'SM', role: 'Reviewer' },
    { id: '3', name: 'Mel Preparer', email: 'mel@skystem.com', initials: 'MP', role: 'Preparer' },
    { id: '4', name: 'Poppy Pan', email: 'poppy@skystem.com', initials: 'PP', role: 'Approver' },
    { id: '5', name: 'John Smith', email: 'john@skystem.com', initials: 'JS', role: 'Reviewer' },
    { id: '6', name: 'Emma Watson', email: 'emma@skystem.com', initials: 'EW', role: 'Owner' },
    { id: '7', name: 'David Brown', email: 'david@skystem.com', initials: 'DB', role: 'Reviewer' }
];

// ================================
// INITIALIZE DATA
// ================================

function initializeData(): void {
    console.log('Initializing data...');
    tasks = [];
    subtasks = [];
    
    const rows = document.querySelectorAll("tbody tr");
    console.log('Total rows found:', rows.length);
    
    rows.forEach((rowElement, index) => {
        const row = rowElement as HTMLTableRowElement;
        console.log(`Row ${index}:`, row.className);
        const firstCell = row.cells[0];
        const isSubtask = firstCell && firstCell.colSpan > 1;
        
        if (isSubtask) {
            const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const statusBadge = row.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
            const taskNameCell = row.cells[0] as HTMLElement;
            
            if (checkbox && statusBadge && taskNameCell) {
                let ownerCell: HTMLElement | null = null;
                let reviewerCell: HTMLElement | null = null;
                
                for (let i = 0; i < row.cells.length; i++) {
                    const cell = row.cells[i] as HTMLElement;
                    const badge = cell.querySelector('.skystemtaskmaster-badge');
                    if (badge) {
                        if (!ownerCell) ownerCell = cell;
                        else if (!reviewerCell) reviewerCell = cell;
                    }
                }
                
                subtasks.push({
                    row: row,
                    checkbox,
                    statusBadge,
                    taskNameCell,
                    ownerCell: ownerCell || row.cells[row.cells.length - 2] as HTMLElement,
                    reviewerCell: reviewerCell || row.cells[row.cells.length - 1] as HTMLElement
                });
                console.log('Subtask added:', taskNameCell.innerText);
            }
        } else if (!row.classList.contains('main-list-row') && 
                   !row.classList.contains('sub-list-row') && 
                   !row.classList.contains('skystemtaskmaster-subtask-header')) {
            const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const statusBadge = row.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
            const dueDateCell = row.cells[3] as HTMLElement;
            const daysCell = row.cells[8] as HTMLElement;
            const taskNameCell = row.cells[0] as HTMLElement;
            
            if (checkbox && statusBadge && dueDateCell && daysCell && taskNameCell) {
                tasks.push({
                    row: row,
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
// ================================
// SIMPLIFIED FIX: OWNER, APPROVER, CREATED BY POPUP
// ================================

(function ensureColumnsVisible(): void {
    const ownerCol = columnConfig.find(c => c.key === 'taskOwner');
    const createdByCol = columnConfig.find(c => c.key === 'createdBy');
    const approverCol = columnConfig.find(c => c.key === 'approver');
    
    if (ownerCol) ownerCol.visible = true;
    if (createdByCol) createdByCol.visible = true;
    if (approverCol) approverCol.visible = true;
    
    console.log('User columns visibility set to true');
})();

function makeCellClickableForPopup(cell: HTMLElement, item: Task | Subtask, columnKey: string, columnLabel: string): HTMLElement {
    if (!cell) return cell;
    
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    cell.title = `Click to change ${columnLabel}`;
    
    cell.addEventListener('mouseenter', () => {
        cell.style.backgroundColor = '';
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = '';
    });
    
    const newCell = cell.cloneNode(true) as HTMLElement;
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    
    newCell.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        console.log(`${columnKey} clicked`);
        
        const currentValue = newCell.textContent?.trim() || '—';
        
        showSimpleUserModal(item, newCell, columnKey, columnLabel, currentValue);
    });
    
    return newCell;
}

function showSimpleUserModal(
    item: Task | Subtask,
    cell: HTMLElement,
    columnKey: string,
    columnLabel: string,
    currentValue: string
): void {

    const existingModal = document.getElementById('simpleUserModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'simpleUserModal';
    modal.className = 'modal show';

    modal.innerHTML = `
        <div class="modal-content simple-user-modal">
            <span class="close">&times;</span>

            <h3 class="modal-title">Select ${columnLabel}</h3>

            <div class="modal-body">

                <div class="task-box">
                    <div class="task-name">
                        ${(item as any).name || 'Task'}
                    </div>
                </div>

                <div class="form-group">
                    <label>Current ${columnLabel}</label>
                    <div class="current-value">
                        ${currentValue}
                    </div>
                </div>

                <input 
                    type="text" 
                    id="simpleUserSearch" 
                    class="search-input"
                    placeholder="Search..."
                >

                <div id="simpleUserList" class="user-list"></div>
            </div>

            <div class="modal-footer">
                <button id="simpleUnassignBtn" class="btn btn-cancel">Unassign</button>
                <button id="simpleCloseBtn" class="btn btn-save">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    (window as any).simpleItem = item;
    (window as any).simpleCell = cell;
    (window as any).simpleColumnKey = columnKey;
    (window as any).simpleColumnLabel = columnLabel;

    updateSimpleUserList('', currentValue);

    modal.querySelector('.close')?.addEventListener('click', () => modal.remove());
    document.getElementById('simpleCloseBtn')?.addEventListener('click', () => modal.remove());

    document.getElementById('simpleUnassignBtn')?.addEventListener('click', () => {
        if ((window as any).simpleCell) {
            (window as any).simpleCell.textContent = '—';
            updateSimpleField(
                (window as any).simpleItem,
                (window as any).simpleColumnKey,
                '—'
            );
            showNotification(`${columnLabel} unassigned`);
        }
        modal.remove();
    });

    document.getElementById('simpleUserSearch')?.addEventListener('keyup', (e: Event) => {
        const input = e.target as HTMLInputElement;
        updateSimpleUserList(input.value, currentValue);
    });
}

function updateSimpleUserList(search: string, currentValue: string): void {
    const list = document.getElementById('simpleUserList');
    if (!list) return;
    
    const filtered = availableUsers.filter(u => 
        u.name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
        u.initials.toLowerCase().indexOf(search.toLowerCase()) >= 0
    );
    
    list.innerHTML = filtered.map(user => {
        const isCurrent = user.initials === currentValue;
        return `
            <div class="user-item" data-initials="${user.initials}" data-name="${user.name}"
                 style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid ; cursor: pointer; ${isCurrent ? 'background: ;' : ''}">
                <span style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: ${getUserColor(user.initials)}; color: white; text-align: center; line-height: 30px;">${user.initials}</span>
                <div>
                    <div>${user.name}</div>
                    <div style="font-size: 11px; color: ;">${user.email} • ${user.role}</div>
                </div>
                ${isCurrent ? '<span style="color: ;">✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    list.querySelectorAll('.user-item').forEach(el => {
        el.addEventListener('click', () => {
            const initials = (el as HTMLElement).dataset.initials;
            const name = (el as HTMLElement).dataset.name;
            
            if ((window as any).simpleCell) {
                (window as any).simpleCell.textContent = initials || '';
                updateSimpleField((window as any).simpleItem, (window as any).simpleColumnKey, initials || '');
                showNotification(`${(window as any).simpleColumnLabel} set to ${name}`);
            }
            
            const modal = document.getElementById('simpleUserModal');
            if (modal) modal.remove();
        });
    });
}

function updateSimpleField(item: Task | Subtask, columnKey: string, value: string): void {
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
        document.querySelectorAll('.task-row, .subtask-row').forEach(rowElement => {
            const row = rowElement as HTMLTableRowElement;
            const task = tasks.find(t => t.row === row);
            const subtask = subtasks.find(s => s.row === row);
            const item = task || subtask;
            
            if (!item) return;
            
            row.querySelectorAll('.extra-cell').forEach(cellElement => {
                const cell = cellElement as HTMLElement;
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

// ================================
// CUSTOM GRID FUNCTIONS
// ================================

function addExtraColumns(): void {
    const mainHeader = document.getElementById('mainHeader') as HTMLTableRowElement;
    const subtaskHeader = document.getElementById('subtaskHeader') as HTMLTableRowElement;
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
    document.querySelectorAll('.task-row').forEach(rowElement => {
        const row = rowElement as HTMLTableRowElement;
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
                    else if (col.key === 'createdBy') value = 'PK';
                    else if (col.key === 'approver') value = '—';
                }
                
                cell.textContent = value;
                cell.style.display = col.visible ? '' : 'none';
                
                if (col.key === 'taskOwner' || col.key === 'createdBy' || col.key === 'approver') {
                    if (task) makeExtraUserCellClickable(cell, task, col.key);
                }
                
                if (col.key === 'taskStatus' && task) {
                    makeStatusCellClickable(cell, task);
                }
                
                row.appendChild(cell);
            }
        });
    });
    
    document.querySelectorAll('.subtask-row').forEach(rowElement => {
        const row = rowElement as HTMLTableRowElement;
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
                    const subtask = subtasks.find(s => s.row === row);
                    
                    if (col.key === 'taskNumber') value = 'SUB-00' + subtaskId;
                    else if (col.key === 'taskStatus') value = (subtask && subtask.statusBadge) ? subtask.statusBadge.innerText : 'In Progress';
                    else if (col.key === 'createdBy') value = 'PK';
                    else if (col.key === 'approver') value = '—';
                    
                    cell.textContent = value;
                    cell.style.display = col.visible ? '' : 'none';
                    
                    if ((col.key === 'taskOwner' || col.key === 'createdBy' || col.key === 'approver') && subtask) {
                        makeExtraUserCellClickable(cell, subtask, col.key);
                    }
                    
                    if (col.key === 'taskStatus' && subtask) {
                        makeStatusCellClickable(cell, subtask);
                    }
                    
                    row.appendChild(cell);
                }
            }
        });
    });
}

function makeExtraUserCellClickable(cell: HTMLElement, item: Task | Subtask, columnKey: string): HTMLElement {
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    
    let titleText = 'Click to change ';
    if (columnKey === 'taskOwner') titleText += 'Task Owner';
    else if (columnKey === 'createdBy') titleText += 'Created By';
    else if (columnKey === 'approver') titleText += 'Approver';
    cell.title = titleText;
    
    cell.addEventListener('mouseenter', () => {
        cell.style.backgroundColor = '';
        cell.style.transform = 'scale(1.02)';
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = '';
        cell.style.transform = 'scale(1)';
    });
    
    const newCell = cell.cloneNode(true) as HTMLElement;
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    
    newCell.addEventListener('click', (e: MouseEvent) => {
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

function showExtraUserSelectionModal(item: Task | Subtask, cell: HTMLElement, columnKey: string, columnDisplayName: string, currentValue: string): void {
    console.log('Opening user modal for:', columnDisplayName, 'Current:', currentValue);
    
    const existingModal = document.getElementById('extraUserSelectionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div id="extraUserSelectionModal" class="modal" style="display: block; z-index: 10000;">
            <div class="modal-content" style="width: 400px; position: relative; z-index: 10001;">
                <span class="close" style="position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer; color: #999;">&times;</span>
                <h3 style="color: ; margin-bottom: 15px;">Select ${columnDisplayName}</h3>
                
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 20px; padding: 10px; background: ; border-radius: 6px;">
                        <div style="font-size: 13px; color: ; margin-bottom: 5px;">Task:</div>
                        <div style="font-weight: 500;">${(item as any).name || (item as any).taskNameCell?.querySelector('span')?.textContent || 'Task'}</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Current ${columnDisplayName}</label>
                        <div id="currentUserDisplay" style="padding: 8px; background:; border-radius: 4px; margin-bottom: 15px; ${currentValue !== '—' ? 'color: ; font-weight: 500;' : 'color: #999;'}">
                            ${currentValue || '—'}
                        </div>
                    </div>
                    
                    <div style="position: relative; margin-bottom: 15px;">
                        <input type="text" id="userSearchInput" placeholder="Search by name or initials..." 
                               style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 4px; font-size: 14px;">
                    </div>
                    
                    <div style="max-height: 300px; overflow-y: auto; border: 1px soli; border-radius: 4px;" id="userListContainer"></div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                    <button id="unassignUserBtn" style="padding: 8px 16px; background:; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Unassign</button>
                    <button id="closeUserModalBtn" style="padding: 8px 16px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('extraUserSelectionModal') as HTMLElement;
    
    (window as any).currentExtraItem = item;
    (window as any).currentExtraCell = cell;
    (window as any).currentExtraColumnKey = columnKey;
    (window as any).currentExtraColumnName = columnDisplayName;
    (window as any).currentExtraValue = currentValue;
    
    updateUserListInModal('', currentValue);
    
    (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
        modal.remove();
        clearExtraUserReferences();
    });
    
    (document.getElementById('closeUserModalBtn') as HTMLButtonElement).addEventListener('click', () => {
        modal.remove();
        clearExtraUserReferences();
    });
    
    (document.getElementById('unassignUserBtn') as HTMLButtonElement).addEventListener('click', () => {
        if ((window as any).currentExtraCell) {
            (window as any).currentExtraCell.textContent = '—';
            updateExtraUserField((window as any).currentExtraItem, (window as any).currentExtraColumnKey, '—');
            showNotification(`${(window as any).currentExtraColumnName} unassigned`);
        }
        modal.remove();
        clearExtraUserReferences();
    });
    
    const searchInput = document.getElementById('userSearchInput') as HTMLInputElement;
    searchInput.addEventListener('keyup', () => {
        updateUserListInModal(searchInput.value, (window as any).currentExtraValue);
    });
    
    setTimeout(() => {
        if (searchInput) {
            searchInput.focus();
        }
    }, 100);
    
    modal.addEventListener('click', (e: MouseEvent) => {
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
        return user.name.toLowerCase().indexOf(searchLower) >= 0 ||
               user.initials.toLowerCase().indexOf(searchLower) >= 0 ||
               user.email.toLowerCase().indexOf(searchLower) >= 0;
    });
    
    if (filtered.length === 0) {
        userList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No users found</div>';
        return;
    }
    
    userList.innerHTML = filtered.map(user => {
        const isCurrent = user.initials === currentValue;
        return `
            <div class="user-item" data-user='${JSON.stringify(user)}' 
                 style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; ${isCurrent ? 'background-color: ;' : ''}">
                <span class="skystemtaskmaster-badge skystemtaskmaster-badge-${user.initials.toLowerCase()}" 
                      style="width: 32px; height: 32px; line-height: 32px; display: inline-block; border-radius: 50%; color: white; text-align: center; font-weight: bold; background: ${getUserColor(user.initials)};">${user.initials}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${user.name}</div>
                    <div style="font-size: 12px; color: ;">${user.email} • ${user.role}</div>
                </div>
                ${isCurrent ? '<span style="color: ; font-weight: bold;">✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    userList.querySelectorAll('.user-item').forEach(el => {
        el.addEventListener('click', () => {
            const userData = (el as HTMLElement).getAttribute('data-user');
            if (userData) {
                const user = JSON.parse(userData) as User;
                assignExtraUserFromModal(user);
            }
        });
    });
}

function assignExtraUserFromModal(user: User): void {
    if (!(window as any).currentExtraCell || !(window as any).currentExtraItem) return;
    
    const cell = (window as any).currentExtraCell as HTMLElement;
    const item = (window as any).currentExtraItem as Task | Subtask;
    const columnKey = (window as any).currentExtraColumnKey as string;
    const columnName = (window as any).currentExtraColumnName as string;
    
    cell.textContent = user.initials;
    
    cell.style.backgroundColor = '#e8f5e9';
    setTimeout(() => {
        cell.style.backgroundColor = '';
    }, 500);
    
    updateExtraUserField(item, columnKey, user.initials);
    
    const modal = document.getElementById('extraUserSelectionModal');
    if (modal) modal.remove();
    
    showNotification(`${columnName} set to ${user.name}`);
    
    clearExtraUserReferences();
}

function updateExtraUserField(item: Task | Subtask, columnKey: string, value: string): void {
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

function makeStatusCellClickable(cell: HTMLElement, item: Task | Subtask): HTMLElement {
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    cell.title = 'Click to change status';
    
    cell.addEventListener('mouseenter', () => {
        cell.style.backgroundColor = '';
        cell.style.transform = 'scale(1.02)';
        cell.style.fontWeight = 'bold';
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = '';
        cell.style.transform = 'scale(1)';
        cell.style.fontWeight = '';
    });
    
    const newCell = cell.cloneNode(true) as HTMLElement;
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    
    newCell.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        console.log('Task Status cell clicked!');
        
        if (item && item.row) {
            if ('dueDateCell' in item) {
                showStatusChangeModal(item as Task);
            } else {
                showSubtaskStatusChangeModal(item as Subtask);
            }
        }
    });
    
    return newCell;
}

function getTaskColumnValue(task: Task | undefined, columnKey: string): string {
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
            
            const newBadge = task.statusBadge.cloneNode(true) as HTMLElement;
            if (task.statusBadge.parentNode) {
                task.statusBadge.parentNode.replaceChild(newBadge, task.statusBadge);
            }
            
            newBadge.addEventListener('click', (e: MouseEvent) => {
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
            
            const newBadge = subtask.statusBadge.cloneNode(true) as HTMLElement;
            if (subtask.statusBadge.parentNode) {
                subtask.statusBadge.parentNode.replaceChild(newBadge, subtask.statusBadge);
            }
            
            newBadge.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                showSubtaskStatusChangeModal(subtask);
            });
            
            subtask.statusBadge = newBadge;
        }
    });
    
    setTimeout(() => {
        document.querySelectorAll('.extra-cell[data-column="taskStatus"]').forEach(cellElement => {
            const cell = cellElement as HTMLElement;
            const row = cell.closest('tr') as HTMLTableRowElement;
            if (!row) return;
            
            const task = tasks.find(t => t.row === row);
            const subtask = subtasks.find(s => s.row === row);
            
            if (task || subtask) {
                makeStatusCellClickable(cell, task || subtask!);
            }
        });
    }, 200);
}

function initializeTaskStatus(): void {
    console.log('Initializing Task Status column...');
    
    const style = document.createElement('style');
    style.textContent = `
     
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        makeAllStatusClickable();
    }, 1000);
}

function applyVisibility(): void {
    const mainHeader = document.getElementById('mainHeader') as HTMLTableRowElement;
    const subtaskHeader = document.getElementById('subtaskHeader') as HTMLTableRowElement;
    if (!mainHeader) return;
    
    const visibleColumns = columnConfig.filter(col => col.visible).map(col => col.key);
    console.log('Visible columns:', visibleColumns);
    
    const baseIndices: { [key: string]: number } = {
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
    
    function arrayContains(arr: string[], value: string): boolean {
        return arr.indexOf(value) >= 0;
    }
    
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
    
    document.querySelectorAll('.extra-column').forEach(thElement => {
        const th = thElement as HTMLElement;
        const key = th.getAttribute('data-column');
        if (key && arrayContains(visibleColumns, key)) {
            th.style.display = '';
        } else {
            th.style.display = 'none';
        }
    });
    
    document.querySelectorAll('.task-row').forEach(rowElement => {
        const row = rowElement as HTMLTableRowElement;
        // Hide ALL cells first
        for (let i = 0; i < row.cells.length; i++) {
            if (row.cells[i]) {
                (row.cells[i] as HTMLElement).style.display = 'none';
            }
        }
        
        visibleColumns.forEach(key => {
            if (baseIndices[key] !== undefined) {
                if (row.cells[baseIndices[key]]) {
                    (row.cells[baseIndices[key]] as HTMLElement).style.display = '';
                }
            }
        });
        
        row.querySelectorAll('.extra-cell').forEach(cellElement => {
            const cell = cellElement as HTMLElement;
            const key = cell.getAttribute('data-column');
            if (key && arrayContains(visibleColumns, key)) {
                cell.style.display = '';
            } else {
                cell.style.display = 'none';
            }
        });
    });
    
    document.querySelectorAll('.subtask-row').forEach(rowElement => {
        const row = rowElement as HTMLTableRowElement;
        for (let i = 0; i < row.cells.length; i++) {
            if (row.cells[i]) {
                (row.cells[i] as HTMLElement).style.display = 'none';
            }
        }
        
        if (row.cells[0]) {
            (row.cells[0] as HTMLElement).style.display = '';
        }
        
        visibleColumns.forEach(key => {
            const col = columnConfig.find(c => c.key === key);
            if (col && col.forSubtask) {
                // Map column key to cell index for subtasks
                const subtaskIndices: { [key: string]: number } = {
                    tdoc: 2,
                    dueDate: 3,
                    status: 4,
                    owner: 5,
                    reviewer: 6
                };
                
                if (subtaskIndices[key] !== undefined) {
                    if (row.cells[subtaskIndices[key]]) {
                        (row.cells[subtaskIndices[key]] as HTMLElement).style.display = '';
                    }
                }
            }
        });
        
        row.querySelectorAll('.extra-cell').forEach(cellElement => {
            const cell = cellElement as HTMLElement;
            const key = cell.getAttribute('data-column');
            const col = columnConfig.find(c => c.key === key);
            if (col && col.forSubtask && key && arrayContains(visibleColumns, key)) {
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

function updateSublistRowsColspan(): void {
    let visibleCount = 0;
    
    const baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    function arrayContains(arr: string[], value: string): boolean {
        return arr.indexOf(value) >= 0;
    }
    
    baseColumns.forEach(key => {
        const col = columnConfig.find(c => c.key === key);
        if (col && col.visible) {
            visibleCount++;
        }
    });
    
    columnConfig.forEach(col => {
        if (!arrayContains(baseColumns, col.key) && col.visible) {
            visibleCount++;
        }
    });
    
    console.log('Total visible columns:', visibleCount);
    
    document.querySelectorAll('.main-list-row').forEach(rowElement => {
        const row = rowElement as HTMLTableRowElement;
        const td = row.querySelector('td') as HTMLTableDataCellElement;
        if (td) {
            td.colSpan = visibleCount;
            td.style.width = '100%';
        }
    });
    
    document.querySelectorAll('.sub-list-row').forEach(rowElement => {
        const row = rowElement as HTMLTableRowElement;
        const td = row.querySelector('td') as HTMLTableDataCellElement;
        if (td) {
            td.colSpan = visibleCount;
            td.style.width = '100%';
            
            const sublistHeader = td.querySelector('.sublist-header') as HTMLElement;
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
        const td = subtaskHeader.querySelector('td') as HTMLTableDataCellElement;
        if (td) {
            td.colSpan = visibleCount;
        }
    }
}

let currentSort: CurrentSort = {
    column: null,
    direction: 'asc'
};

function initializeColumnSorting(): void {
    const headers = document.querySelectorAll('#mainHeader th');
    
    headers.forEach((headerElement, index) => {
        const header = headerElement as HTMLElement;
        header.style.cursor = 'pointer';
        header.setAttribute('title', 'Click to sort');
        
        // Add sort icon
        const sortIcon = document.createElement('span');
        sortIcon.className = 'sort-icon';
        sortIcon.innerHTML = ' ↕️';
        sortIcon.style.fontSize = '12px';
        sortIcon.style.marginLeft = '5px';
        sortIcon.style.opacity = '0.5';
        header.appendChild(sortIcon);
        
        header.addEventListener('click', () => {
            const columnKey = getColumnKeyFromIndex(index);
            if (columnKey) {
                toggleSort(columnKey, header);
            }
        });
        
        header.addEventListener('mouseenter', () => {
            header.style.backgroundColor = '';
        });
        
        header.addEventListener('mouseleave', () => {
            header.style.backgroundColor = '';
        });
    });
}

function getColumnKeyFromIndex(index: number): string | null {
    // Map header index to column key
    const columnMap: string[] = [
        'taskName', 'acc', 'tdoc', 'dueDate', 'status', 
        'owner', 'reviewer', 'cdoc', 'days'
    ];
    
    if (index < columnMap.length) {
        return columnMap[index];
    }
    
    const header = document.querySelectorAll('#mainHeader th')[index] as HTMLElement;
    if (header) {
        return header.getAttribute('data-column');
    }
    
    return null;
}

function toggleSort(columnKey: string, headerElement: HTMLElement): void {
    if (currentSort.column === columnKey) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnKey;
        currentSort.direction = 'asc';
    }
    
    updateSortIcons(headerElement);
    
    sortTableByColumn(columnKey, currentSort.direction);
}

function updateSortIcons(activeHeader: HTMLElement): void {
    document.querySelectorAll('#mainHeader th .sort-icon').forEach(iconElement => {
        const icon = iconElement as HTMLElement;
        icon.innerHTML = ' ↕️';
        icon.style.opacity = '0.5';
        icon.style.color = '';
    });
    
    const activeIcon = activeHeader.querySelector('.sort-icon') as HTMLElement;
    if (activeIcon) {
        activeIcon.innerHTML = currentSort.direction === 'asc' ? ' ↑' : ' ↓';
        activeIcon.style.opacity = '1';
        activeIcon.style.color = '';
    }
}

function sortTableByColumn(columnKey: string, direction: 'asc' | 'desc'): void {
    const tbody = document.querySelector('tbody') as HTMLTableSectionElement;
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(rowElement => {
        const row = rowElement as HTMLTableRowElement;
        return !row.classList.contains('main-list-row') && 
               !row.classList.contains('sub-list-row') &&
               !row.classList.contains('skystemtaskmaster-subtask-header');
    }) as HTMLTableRowElement[];
    
    const taskRows = rows.filter(row => row.classList.contains('task-row'));
    const subtaskRows = rows.filter(row => row.classList.contains('subtask-row'));
    
    
    taskRows.sort((a, b) => {
        const aVal = getCellValueForSort(a, columnKey);
        const bVal = getCellValueForSort(b, columnKey);
        return compareValues(aVal, bVal, direction);
    });
    
    subtaskRows.sort((a, b) => {
        const aVal = getCellValueForSort(a, columnKey);
        const bVal = getCellValueForSort(b, columnKey);
        return compareValues(aVal, bVal, direction);
    });
    
    const allRows = Array.from(tbody.children) as HTMLTableRowElement[];
    const headerRows = allRows.filter(row => 
        row.classList.contains('main-list-row') || 
        row.classList.contains('sub-list-row') ||
        row.classList.contains('skystemtaskmaster-subtask-header')
    );
    
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    headerRows.forEach(row => tbody.appendChild(row));
    
    taskRows.forEach(row => tbody.appendChild(row));
    
    subtaskRows.forEach(row => tbody.appendChild(row));
    
    showNotification(`Sorted by ${columnKey} (${direction === 'asc' ? 'Ascending' : 'Descending'})`);
}

function getCellValueForSort(row: HTMLTableRowElement, columnKey: string): string | number {
    const baseIndices: { [key: string]: number } = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    
    if (baseIndices[columnKey] !== undefined) {
        const cell = row.cells[baseIndices[columnKey]] as HTMLElement;
        if (!cell) return '';
        
        if (columnKey === 'status' || columnKey === 'owner' || columnKey === 'reviewer') {
            const badge = cell.querySelector('.skystemtaskmaster-status-badge, .skystemtaskmaster-badge') as HTMLElement;
            return badge ? badge.textContent?.trim() || '' : cell.textContent?.trim() || '';
        }
        
        if (columnKey === 'days') {
            const val = cell.textContent?.trim() || '';
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
        cellElement => (cellElement as HTMLElement).getAttribute('data-column') === columnKey
    ) as HTMLElement;
    return extraCell ? extraCell.textContent?.trim() || '' : '';
}

function compareValues(a: string | number, b: string | number, direction: 'asc' | 'desc'): number {
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

// ================================
// HIERARCHICAL LIST FUNCTIONS
// ================================

function initializeCleanStructure(): void {
    const tbody = document.getElementById('mainTableBody');
    if (tbody) tbody.innerHTML = '';
    
    const sidebar = document.getElementById('mainSidebar');
    if (sidebar) sidebar.innerHTML = '';
    
    mainLists = [];
    subLists = [];
    tasks = [];
    
    updateCounts();
    console.log('Clean structure initialized');
}

function createMainList(listName: string): MainList {
    const mainList: MainList = {
        id: 'main_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: listName,
        subLists: [],
        row: null,
        isExpanded: true
    };
    
    mainLists.push(mainList);
    
    const titleElement = document.querySelector('.skystemtaskmaster-checklist-title');
    if (titleElement) titleElement.textContent = listName;
    
    createMainListRow(mainList);
    showNotification(`List "${listName}" created`);
    return mainList;
}

// ================================
// LIST ROWS WITH CHECKBOXES
// ================================

function createMainListRow(mainList: MainList): HTMLTableRowElement {
    const tbody = document.getElementById('mainTableBody') as HTMLTableSectionElement;
    if (!tbody) throw new Error('Table body not found');
    
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
                <span class="list-name">${mainList.name}</span>
                <button class="add-sublist-btn" title="Add Sub List">+ Add Sub List</button>
                <span class="collapse-icon">▼</span>
            </div>
        </td>
    `;
    
    mainList.row = row;
    tbody.appendChild(row);
    
    const addBtn = row.querySelector('.add-sublist-btn') as HTMLButtonElement;
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateSubListModal(mainList);
    });
    
    const collapseIcon = row.querySelector('.collapse-icon') as HTMLElement;
    collapseIcon.addEventListener('click', () => {
        toggleMainList(mainList);
    });
    
    // Add checkbox functionality
    const checkbox = row.querySelector('.list-checkbox') as HTMLInputElement;
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        handleMainListCheckbox(mainList, checkbox.checked);
    });
    
    return row;
}

function createSubListRow(subList: SubList, mainList: MainList): HTMLTableRowElement {
    const tbody = document.getElementById('mainTableBody') as HTMLTableSectionElement;
    if (!tbody) throw new Error('Table body not found');
    
    const row = document.createElement('tr');
    row.className = 'sub-list-row';
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-mainlist-id', mainList.id);
    
    row.innerHTML = `
        <td colspan="9">
            <div class="sublist-header">
                <input type="checkbox" class="sublist-checkbox" title="Select this sublist">
                <span class="sublist-icon">
                    <i class="fa-solid fa-folder"></i>
                </span>
                <span class="sublist-name">${subList.name}</span>
                <button class="add-task-btn" title="Add Task">+ Add Task</button>
                <span class="collapse-sublist-icon">▼</span>
            </div>
        </td>
    `;
    
    subList.row = row;
    
    let insertAfter = mainList.row;
    while (insertAfter && insertAfter.nextSibling) {
        const next = insertAfter.nextSibling as HTMLTableRowElement;
        if (next.classList && next.classList.contains('main-list-row')) break;
        insertAfter = next;
    }
    
    if (insertAfter && insertAfter.nextSibling) {
        tbody.insertBefore(row, insertAfter.nextSibling);
    } else {
        tbody.appendChild(row);
    }
    
    const addBtn = row.querySelector('.add-task-btn') as HTMLButtonElement;
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateTaskModal(subList);
    });
    
    const collapseIcon = row.querySelector('.collapse-sublist-icon') as HTMLElement;
    collapseIcon.addEventListener('click', () => {
        toggleSubList(subList);
    });
    
    const checkbox = row.querySelector('.sublist-checkbox') as HTMLInputElement;
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        handleSublistCheckbox(subList, checkbox.checked);
    });
    
    return row;
}

function handleSublistCheckbox(subList: SubList, checked: boolean): void {
    console.log(`Sublist ${subList.name} checkbox: ${checked}`);
    
    subList.tasks.forEach(task => {
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
            const allSublistsChecked = mainList.subLists.every(s => {
                const cb = s.row?.querySelector('.sublist-checkbox') as HTMLInputElement;
                return cb ? cb.checked : false;
            });
            
            const anySublistChecked = mainList.subLists.some(s => {
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

function handleMainListCheckbox(mainList: MainList, checked: boolean): void {
    console.log(`Main list ${mainList.name} checkbox: ${checked}`);
    
    mainList.subLists.forEach(subList => {
        if (subList.row) {
            const sublistCheckbox = subList.row.querySelector('.sublist-checkbox') as HTMLInputElement;
            if (sublistCheckbox) {
                sublistCheckbox.checked = checked;
            }
        }
        
        subList.tasks.forEach(task => {
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

function showCreateSubListModal(mainList: MainList): void {
    let modal = document.getElementById('createSubListModal') as HTMLElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createSubListModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="width: 400px;">
                <span class="close">&times;</span>
                <h3 ">Create Sub List</h3>
                <div style="margin: 20px 0;">
                    <input type="text" id="subListNameInput" placeholder="Enter sub list name" style="width: 100%; padding: 10px; border: 1px solid ; border-radius: 4px; margin-bottom: 15px;">
                    <button id="createSubListBtn">Create Sub List</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close button
        (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        (document.getElementById('createSubListBtn') as HTMLButtonElement).addEventListener('click', () => {
            const currentMainListId = modal.getAttribute('data-current-mainlist-id');
            const currentMainList = mainLists.find(m => m.id === currentMainListId);
            
            if (!currentMainList) {
                alert('Error: Main list not found');
                return;
            }
            
            const subListName = (document.getElementById('subListNameInput') as HTMLInputElement).value.trim();
            if (subListName) {
                createSubList(currentMainList, subListName);
                modal.style.display = 'none';
                (document.getElementById('subListNameInput') as HTMLInputElement).value = '';
            } else {
                alert('Please enter a sub list name');
            }
        });
    }
    
    modal.setAttribute('data-current-mainlist-id', mainList.id);
    
    const modalTitle = modal.querySelector('h3') as HTMLElement;
    if (modalTitle) {
        modalTitle.textContent = `Create Sub List for "${mainList.name}"`;
    }
    
    modal.style.display = 'block';
}

// ================================
// PERSISTENCE FUNCTIONS
// ================================

function saveAllData(): void {
    try {
        const data: SavedData = {
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
            tasks: tasks.map(task => ({
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
            })),
            cdocDocuments: {}, 
            tdocDocuments: {},  
            linkedAccountsMap: {}, 
            taskComments: taskComments
        };
        tasks.forEach(task => {
            if (task.id) {
                const docs = taskDocuments.get(task.row);
                if (docs && docs.length > 0) {
                    data.cdocDocuments[task.id] = docs;
                    console.log('Saving CDoc for task:', task.id, docs.length, 'docs');
                }
            }
        });
        
        subtasks.forEach(subtask => {
            if (subtask.id) {
                const docs = taskDocuments.get(subtask.row);
                if (docs && docs.length > 0) {
                    data.cdocDocuments[subtask.id] = docs;
                    console.log('Saving CDoc for subtask:', subtask.id, docs.length, 'docs');
                }
            }
        });
        
        tasks.forEach(task => {
            if (task.id) {
                const docs = taskTDocDocuments.get(task.row);
                if (docs && docs.length > 0) {
                    data.tdocDocuments[task.id] = docs;
                    console.log('Saving TDoc for task:', task.id, docs.length, 'docs');
                }
            }
        });
        
        subtasks.forEach(subtask => {
            if (subtask.id) {
                const docs = taskTDocDocuments.get(subtask.row);
                if (docs && docs.length > 0) {
                    data.tdocDocuments[subtask.id] = docs;
                    console.log('Saving TDoc for subtask:', subtask.id, docs.length, 'docs');
                }
            }
        });
        

        tasks.forEach(task => {
            if (task.id) {
                const accounts = taskAccounts.get(task.row);
                if (accounts && accounts.length > 0) {
                    data.linkedAccountsMap[task.id] = accounts;
                    console.log('Saving Linked Accounts for task:', task.id, accounts);
                } else if (task.linkedAccounts) {
                    data.linkedAccountsMap[task.id] = task.linkedAccounts;
                }
            }
        });
        
        taskAccounts.forEach((value, key) => {
            if (typeof key === 'string' && !data.linkedAccountsMap[key]) {
                data.linkedAccountsMap[key] = value;
                console.log('Saving Linked Accounts by string key:', key, value);
            }
        });
        
        localStorage.setItem('taskViewerData', JSON.stringify(data));
        console.log('All data saved to localStorage');
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function loadAllData(): boolean {
    try {
        const savedData = localStorage.getItem('taskViewerData');
        if (!savedData) {
            console.log('No saved data found');
            return false;
        }
        
        const data = JSON.parse(savedData) as SavedData;
        console.log('Loading data:', data);
        
        const tbody = document.getElementById('mainTableBody') as HTMLTableSectionElement;
        if (tbody) tbody.innerHTML = '';
        
        mainLists = [];
        subLists = [];
        tasks = [];
        subtasks = [];
        
        taskDocuments.clear();
        taskTDocDocuments.clear();
        taskAccounts.clear();
        
        if (data.mainLists) {
            data.mainLists.forEach(mainListData => {
                const mainList: MainList = {
                    id: mainListData.id,
                    name: mainListData.name,
                    subLists: [],
                    row: null,
                    isExpanded: mainListData.isExpanded !== undefined ? mainListData.isExpanded : true
                };
                mainLists.push(mainList);
                createMainListRow(mainList);
            });
        }
        
        // Recreate sub lists
        if (data.subLists) {
            data.subLists.forEach(subListData => {
                const mainList = mainLists.find(m => m.id === subListData.mainListId);
                if (mainList) {
                    const subList: SubList = {
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
        
        // Recreate tasks
        if (data.tasks) {
            data.tasks.forEach(taskData => {
                const subList = subLists.find(s => s.id === taskData.subListId);
                if (subList) {
                    const task: Task = {
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
                        row: null as any,
                        checkbox: null as any,
                        statusBadge: null as any,
                        dueDateCell: null as any,
                        daysCell: null as any,
                        taskNameCell: null as any
                    };
                    
                    subList.tasks.push(task);
                    tasks.push(task);
                    createTaskRow(task, subList);
                }
            });
        }
        
        setTimeout(() => {
            console.log('Restoring documents and accounts...');
            
            if (data.cdocDocuments) {
                console.log('CDoc documents found:', Object.keys(data.cdocDocuments).length);
                
                tasks.forEach(task => {
                    if (task.id && data.cdocDocuments[task.id]) {
                        console.log('Restoring CDoc for task:', task.id, data.cdocDocuments[task.id].length, 'docs');
                        taskDocuments.set(task.row, data.cdocDocuments[task.id]);
                    }
                });
                
                subtasks.forEach(subtask => {
                    if (subtask.id && data.cdocDocuments[subtask.id]) {
                        console.log('Restoring CDoc for subtask:', subtask.id, data.cdocDocuments[subtask.id].length, 'docs');
                        taskDocuments.set(subtask.row, data.cdocDocuments[subtask.id]);
                    }
                });
            }
            
            if (data.tdocDocuments) {
                console.log('TDoc documents found:', Object.keys(data.tdocDocuments).length);
                
                tasks.forEach(task => {
                    if (task.id && data.tdocDocuments[task.id]) {
                        console.log('Restoring TDoc for task:', task.id, data.tdocDocuments[task.id].length, 'docs');
                        taskTDocDocuments.set(task.row, data.tdocDocuments[task.id]);
                    }
                });
                
                subtasks.forEach(subtask => {
                    if (subtask.id && data.tdocDocuments[subtask.id]) {
                        console.log('Restoring TDoc for subtask:', subtask.id, data.tdocDocuments[subtask.id].length, 'docs');
                        taskTDocDocuments.set(subtask.row, data.tdocDocuments[subtask.id]);
                    }
                });
            }
            
            if (data.linkedAccountsMap) {
                console.log('Linked accounts found:', Object.keys(data.linkedAccountsMap).length);
                
                tasks.forEach(task => {
                    if (task.id) {
                        if (data.linkedAccountsMap[task.id]) {
                            console.log('Restoring accounts for task:', task.id, data.linkedAccountsMap[task.id]);
                            taskAccounts.set(task.row, data.linkedAccountsMap[task.id]);
                            
                            // Also store in task object
                            if (Array.isArray(data.linkedAccountsMap[task.id])) {
                                task.linkedAccounts = data.linkedAccountsMap[task.id];
                            }
                        }
                    }
                });
                
                taskAccounts.forEach((value, key) => {
                    if (typeof key === 'string') {
                        console.log('Found accounts with string key:', key);
                    }
                });
            }
            
            if (data.taskComments) {
                Object.assign(taskComments, data.taskComments);
            }
            
            console.log('Updating UI columns...');
            updateTDocColumn();
            updateCDocColumn();
            refreshLinkedAccountsColumn();
            
            showNotification('Data restored successfully');
        }, 500);
        
        console.log('All data loaded from localStorage');
        return true;
    } catch (e) {
        console.error('Error loading data:', e);
        return false;
    }
}

function findRowById(id: string): HTMLTableRowElement | null {
    const task = tasks.find(t => t.id === id);
    if (task && task.row) return task.row;
        const row = document.querySelector(`[data-task-id="${id}"], [data-subtask-id="${id}"]`) as HTMLTableRowElement;
    if (row) return row;
    
    return null;
}

function setupAutoSave(): void {
    const originalCreateMainList = createMainList;
    const originalCreateSubList = createSubList;
    const originalCreateTask = createTask;
    const originalDeleteSelectedItems = deleteSelectedItems;
    
    (window as any).createMainList = function(listName: string): MainList {
        const result = originalCreateMainList(listName);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    (window as any).createSubList = function(mainList: MainList, subListName: string): SubList {
        const result = originalCreateSubList(mainList, subListName);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    (window as any).createTask = function(subList: SubList, taskData: any): Task {
        const result = originalCreateTask(subList, taskData);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    (window as any).deleteSelectedItems = function(): number {
        const result = originalDeleteSelectedItems();
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    document.addEventListener('click', function(e) {
        const target = e.target as HTMLElement;
        if (target.closest('.skystemtaskmaster-status-badge') || 
            target.closest('.skystemtaskmaster-badge')) {
            setTimeout(() => saveAllData(), 200);
        }
    });
}

function createSubList(mainList: MainList, subListName: string): SubList {
    const subList: SubList = {
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


function showCreateTaskModal(subList: SubList): void {
    let modal = document.getElementById('createTaskModal') as HTMLElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createTaskModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="width: 700px; max-height: 80vh; overflow-y: auto;">
                <span class="close">&times;</span>
                <h3 style="color: ; margin-bottom: 20px;">Create Task</h3>
                
                <div style="margin: 20px 0;">
                    <!-- Basic Info Section -->
                    <div style="background: ; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">Basic Information</h4>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Task Name *</label>
                            <input type="text" id="taskNameInput" placeholder="Enter task name" >
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Task Number</label>
                                <input type="text" id="taskNumberInput" value="TSK-${Math.floor(100 + Math.random() * 900)}" >
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Task Owner</label>
                                <select id="taskOwnerInput" >
                                    <option value="PK">PK - Palakh Khanna</option>
                                    <option value="SM">SM - Sarah Miller</option>
                                    <option value="MP">MP - Mel Preparer</option>
                                    <option value="PP">PP - Poppy Pan</option>
                                    <option value="JS">JS - John Smith</option>
                                    <option value="EW">EW - Emma Watson</option>
                                    <option value="DB">DB - David Brown</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Task Status</label>
                                <select id="taskStatusInput" >
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Review">Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Reviewer</label>
                                <select id="taskReviewerInput" >
                                    <option value="PK">PK - Palakh Khanna</option>
                                    <option value="SM">SM - Sarah Miller</option>
                                    <option value="MP">MP - Mel Preparer</option>
                                    <option value="PP">PP - Poppy Pan</option>
                                    <option value="JS">JS - John Smith</option>
                                    <option value="EW">EW - Emma Watson</option>
                                    <option value="DB">DB - David Brown</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Document Section -->
                    <div style="background: ; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">Documents</h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Task Doc (TDoc)</label>
                                <input type="text" id="taskTdocInput" value="0" >
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Completion Doc (CDoc)</label>
                                <input type="text" id="taskCdocInput" value="0" >
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dates Section -->
                    <div style="background: ; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">Dates</h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Due Date</label>
                                <input type="date" id="taskDueDateInput" >
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Assignee Due Date</label>
                                <input type="date" id="taskAssigneeDueDateInput" >
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Reviewer Due Date</label>
                                <input type="date" id="taskReviewerDueDateInput" >
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Completion Date</label>
                                <input type="date" id="taskCompletionDateInput" >
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Recurrence Type</label>
                                <select id="taskRecurrenceTypeInput" >
                                    <option value="None">None</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Additional Fields Section -->
                    <div style="background: ; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">Additional Information</h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Approver</label>
                                <select id="taskApproverInput" >
                                    <option value="—">None</option>
                                    <option value="PK">PK - Palakh Khanna</option>
                                    <option value="SM">SM - Sarah Miller</option>
                                    <option value="PP">PP - Poppy Pan</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Created By</label>
                                <select id="taskCreatedByInput" >
                                    <option value="PK">PK - Palakh Khanna</option>
                                    <option value="SM">SM - Sarah Miller</option>
                                    <option value="MP">MP - Mel Preparer</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Notifier</label>
                                <select id="taskNotifierInput" >
                                    <option value="—">None</option>
                                    <option value="PK">PK - Palakh Khanna</option>
                                    <option value="SM">SM - Sarah Miller</option>
                                    <option value="MP">MP - Mel Preparer</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Linked Accounts</label>
                                <input type="text" id="taskLinkedAccountsInput" placeholder="e.g., ACC-101, ACC-102" >
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Custom Field #1</label>
                                <input type="text" id="taskCustomField1Input" >
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px;">Custom Field #2</label>
                                <input type="text" id="taskCustomField2Input" >
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 5px;">Comment</label>
                            <textarea id="taskCommentInput" rows="3"  placeholder="Add any comments..."></textarea>
                        </div>
                    </div>
                    
                    <button id="createTaskBtn" style="background: ; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; font-weight: 500;">Create Task</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        (document.getElementById('createTaskBtn') as HTMLButtonElement).addEventListener('click', () => {
            const currentSubListId = modal.getAttribute('data-current-sublist-id');
            const currentSubList = subLists.find(s => s.id === currentSubListId);
            
            if (!currentSubList) {
                alert('Error: Sub list not found');
                return;
            }
            
            const taskName = (document.getElementById('taskNameInput') as HTMLInputElement).value.trim();
            if (!taskName) {
                alert('Please enter a task name');
                return;
            }
            
            const taskData = {
                name: taskName,
                taskNumber: (document.getElementById('taskNumberInput') as HTMLInputElement).value || 'TSK-' + Math.floor(100 + Math.random() * 900),
                taskOwner: (document.getElementById('taskOwnerInput') as HTMLSelectElement).value,
                owner: (document.getElementById('taskOwnerInput') as HTMLSelectElement).value,
                taskStatus: (document.getElementById('taskStatusInput') as HTMLSelectElement).value,
                status: (document.getElementById('taskStatusInput') as HTMLSelectElement).value,
                reviewer: (document.getElementById('taskReviewerInput') as HTMLSelectElement).value,
                tdoc: (document.getElementById('taskTdocInput') as HTMLInputElement).value || '0',
                completionDoc: (document.getElementById('taskCdocInput') as HTMLInputElement).value || '0',
                cdoc: (document.getElementById('taskCdocInput') as HTMLInputElement).value || '0',
                dueDate: (document.getElementById('taskDueDateInput') as HTMLInputElement).value,
                assigneeDueDate: (document.getElementById('taskAssigneeDueDateInput') as HTMLInputElement).value || (document.getElementById('taskDueDateInput') as HTMLInputElement).value,
                reviewerDueDate: (document.getElementById('taskReviewerDueDateInput') as HTMLInputElement).value,
                completionDate: (document.getElementById('taskCompletionDateInput') as HTMLInputElement).value,
                recurrenceType: (document.getElementById('taskRecurrenceTypeInput') as HTMLSelectElement).value,
                approver: (document.getElementById('taskApproverInput') as HTMLSelectElement).value,
                createdBy: (document.getElementById('taskCreatedByInput') as HTMLSelectElement).value,
                notifier: (document.getElementById('taskNotifierInput') as HTMLSelectElement).value,
                linkedAccounts: (document.getElementById('taskLinkedAccountsInput') as HTMLInputElement).value,
                customField1: (document.getElementById('taskCustomField1Input') as HTMLInputElement).value,
                customField2: (document.getElementById('taskCustomField2Input') as HTMLInputElement).value,
                comment: (document.getElementById('taskCommentInput') as HTMLTextAreaElement).value,
                acc: '+',
                days: '0'
            };
            
            createTask(currentSubList, taskData);
            
            modal.style.display = 'none';
            
            // Clear form
            (document.getElementById('taskNameInput') as HTMLInputElement).value = '';
            (document.getElementById('taskNumberInput') as HTMLInputElement).value = 'TSK-' + Math.floor(100 + Math.random() * 900);
            (document.getElementById('taskDueDateInput') as HTMLInputElement).value = '';
            (document.getElementById('taskAssigneeDueDateInput') as HTMLInputElement).value = '';
            (document.getElementById('taskReviewerDueDateInput') as HTMLInputElement).value = '';
            (document.getElementById('taskCompletionDateInput') as HTMLInputElement).value = '';
            (document.getElementById('taskLinkedAccountsInput') as HTMLInputElement).value = '';
            (document.getElementById('taskCustomField1Input') as HTMLInputElement).value = '';
            (document.getElementById('taskCustomField2Input') as HTMLInputElement).value = '';
            (document.getElementById('taskCommentInput') as HTMLTextAreaElement).value = '';
            (document.getElementById('taskTdocInput') as HTMLInputElement).value = '0';
            (document.getElementById('taskCdocInput') as HTMLInputElement).value = '0';
        });
    }
    
    modal.setAttribute('data-current-sublist-id', subList.id);
    
    const modalTitle = modal.querySelector('h3') as HTMLElement;
    if (modalTitle) {
        modalTitle.textContent = `Create Task for "${subList.name}"`;
    }
    
    const taskNumberInput = document.getElementById('taskNumberInput') as HTMLInputElement;
    if (taskNumberInput) {
        taskNumberInput.value = 'TSK-' + Math.floor(100 + Math.random() * 900);
    }
    
    modal.style.display = 'block';
}



function addExtraColumnsForRow(row: HTMLTableRowElement, task: Task): void {
    row.querySelectorAll('.extra-cell').forEach(cell => cell.remove());
    
    columnConfig.forEach(col => {
        const baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
        
        if (baseColumns.indexOf(col.key) === -1) {
            const cell = document.createElement('td');
            cell.className = 'extra-cell';
            cell.setAttribute('data-column', col.key);
            
            let value = getTaskColumnValue(task, col.key);
            cell.textContent = value;
            cell.style.display = col.visible ? '' : 'none';
            
            row.appendChild(cell);
        }
    });
}

function createTaskRow(task: Task, subList: SubList): HTMLTableRowElement {
    const tbody = document.getElementById('mainTableBody') as HTMLTableSectionElement;
    if (!tbody) throw new Error('Table body not found');
    
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
    
    const recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
    const isRecurring = recurringOptions.indexOf(task.recurrenceType || '') >= 0;
    
    if (isRecurring) {
        row.classList.add('recurring-task');
    } else {
        row.classList.add('non-recurring-task');
    }
    
    row.setAttribute('data-task-id', task.id || '');
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-recurrence-type', task.recurrenceType || 'None');
    
    let rowHTML = `
        <td>
            <div class="skystemtaskmaster-task-name" style="padding-left: 70px;">
                <input type="checkbox" class="task-checkbox">
                <span>${task.name}</span>
            </div>
        </td>
        <td><span>${task.acc}</span></td>
        <td class="tdoc-cell">${task.tdoc}</td>
        <td class="skystemtaskmaster-editable due-date">${formattedDueDate}</td>
        <td><span class="skystemtaskmaster-status-badge skystemtaskmaster-status-not-started">${task.status}</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${(task.owner || 'PK').toLowerCase()}">${task.owner}</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${(task.reviewer || 'SM').toLowerCase()}">${task.reviewer}</span></td>
        <td class="cdoc-cell">0</td>
        <td class="days-cell ${daysClass}">${daysText}</td>
    `;
    
    row.innerHTML = rowHTML;
    task.row = row;
    
    // Insert row in correct position
    let insertAfter = subList.row;
    while (insertAfter && insertAfter.nextSibling) {
        const next = insertAfter.nextSibling as HTMLTableRowElement;
        if (next.classList && (next.classList.contains('sub-list-row') || next.classList.contains('main-list-row'))) break;
        insertAfter = next;
    }
    
    if (insertAfter && insertAfter.nextSibling) {
        tbody.insertBefore(row, insertAfter.nextSibling);
    } else {
        tbody.appendChild(row);
    }
    
    taskDocuments.set(row, []);
    taskTDocDocuments.set(row, []);
    
    addTaskEventListeners(task);
    
    // Add extra columns with actual data
    setTimeout(() => {
        addExtraColumnsForRow(row, task);
        addDataCells();
        applyVisibility();
    }, 100);
    
    return row;
}


function toggleMainList(mainList: MainList): void {
    mainList.isExpanded = !mainList.isExpanded;
    
    const icon = mainList.row!.querySelector('.collapse-icon') as HTMLElement;
    icon.textContent = mainList.isExpanded ? '▼' : '▶';
    
    let nextRow = mainList.row!.nextSibling as HTMLTableRowElement;
    while (nextRow) {
        if (nextRow.classList && nextRow.classList.contains('main-list-row')) break;
        if (nextRow.style) nextRow.style.display = mainList.isExpanded ? '' : 'none';
        nextRow = nextRow.nextSibling as HTMLTableRowElement;
    }
}

function toggleSubList(subList: SubList): void {
    subList.isExpanded = !subList.isExpanded;
    
    const icon = subList.row!.querySelector('.collapse-sublist-icon') as HTMLElement;
    icon.textContent = subList.isExpanded ? '▼' : '▶';
    
    let nextRow = subList.row!.nextSibling as HTMLTableRowElement;
    while (nextRow) {
        if (nextRow.classList && (nextRow.classList.contains('sub-list-row') || nextRow.classList.contains('main-list-row'))) break;
        if (nextRow.classList && nextRow.classList.contains('task-row')) {
            nextRow.style.display = subList.isExpanded ? '' : 'none';
        }
        nextRow = nextRow.nextSibling as HTMLTableRowElement;
    }
}

// ================================
// TASK FUNCTIONS
// ================================

function createNewTask(taskName: string, acc: string, tdoc: string, owner: string, reviewer: string, dueDate: string = ''): void {
    const tbody = document.querySelector('tbody') as HTMLTableSectionElement;
    if (!tbody) return;
    
    const subtaskHeader = document.querySelector('.skystemtaskmaster-subtask-header') as HTMLTableRowElement;
    
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
        <td><span">${acc}</span></td>
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
    const dueDateCell = newRow.cells[3] as HTMLElement;
    const daysCell = newRow.cells[8] as HTMLElement;
    const taskNameCell = newRow.cells[0] as HTMLElement;
    
    if (checkbox && statusBadge && dueDateCell && daysCell && taskNameCell) {
        const newTask: Task = {
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
            statusCell.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                showStatusChangeModal(newTask);
            });
        }
        
        const ownerCell = newRow.cells[5] as HTMLElement;
        const reviewerCell = newRow.cells[6] as HTMLElement;
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
            (cell as HTMLElement).classList.add('skystemtaskmaster-editable');
            (cell as HTMLElement).setAttribute('contenteditable', 'true');
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
    const subtaskHeader = document.querySelector('.skystemtaskmaster-subtask-header') as HTMLTableRowElement;
    
    if (subtaskHeader && subtaskHeader.parentNode) {
        const tbody = subtaskHeader.parentNode as HTMLTableSectionElement;
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
        
        const dueDateCell = newRow.cells[3] as HTMLElement;
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
        const taskNameCell = newRow.cells[0] as HTMLElement;
        
        if (checkbox && statusBadge && taskNameCell) {
            let ownerCell: HTMLElement | null = null;
            let reviewerCell: HTMLElement | null = null;
            
            for (let i = 0; i < newRow.cells.length; i++) {
                const cell = newRow.cells[i] as HTMLElement;
                const badge = cell.querySelector('.skystemtaskmaster-badge');
                if (badge) {
                    if (!ownerCell) ownerCell = cell;
                    else if (!reviewerCell) reviewerCell = cell;
                }
            }
            
            const newSubtask: Subtask = {
                id: subtaskId,
                row: newRow,
                checkbox,
                statusBadge,
                taskNameCell,
                ownerCell: ownerCell || newRow.cells[newRow.cells.length - 2] as HTMLElement,
                reviewerCell: reviewerCell || newRow.cells[newRow.cells.length - 1] as HTMLElement
            };
            
            subtasks.push(newSubtask);
            
            const statusCell = statusBadge.parentElement;
            if (statusCell) {
                statusCell.style.cursor = 'pointer';
                statusCell.title = 'Click to change status';
                statusCell.addEventListener('click', (e: MouseEvent) => {
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
        
        const addSubtaskModal = document.getElementById('addSubtaskModal') as HTMLElement;
        addSubtaskModal.style.display = 'none';
        
        (document.getElementById('subtaskName') as HTMLInputElement).value = '';
        (document.getElementById('subtaskOwner') as HTMLSelectElement).value = 'PK';
        (document.getElementById('subtaskReviewer') as HTMLSelectElement).value = 'SM';
        (document.getElementById('subtaskTdoc') as HTMLInputElement).value = '';
        
        showNotification(`Subtask "${subtaskName}" added successfully`);
        
        // Auto-save after adding subtask
        setTimeout(() => saveAllData(), 100);
    }
}

function initializeDragAndDrop(): void {
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
}

// ================================
// 3-DOT DROPDOWN MENU FUNCTIONS
// ================================

function initializeThreeDotsMenu(): void {
    const threeDotsBtn = document.getElementById('threeDotsBtn') as HTMLElement;
    const dropdown = document.getElementById('threeDotsDropdown') as HTMLElement;
    
    if (!threeDotsBtn || !dropdown) return;
    
    threeDotsBtn.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!threeDotsBtn.contains(target) && !dropdown.contains(target)) {
            dropdown.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            const format = (item as HTMLElement).dataset.format;
            handleDownload(format);
            dropdown.classList.remove('show');
        });
    });
    
    const filterOption = document.getElementById('dropdownFilter');
    if (filterOption) {
        filterOption.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            showFilterPanel();
            dropdown.classList.remove('show');
        });
    } else {
        const filterItem = Array.from(document.querySelectorAll('.dropdown-item')).find(
            item => item.textContent && item.textContent.indexOf('Filter') >= 0
        ) as HTMLElement;
        if (filterItem) {
            filterItem.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                showFilterPanel();
                dropdown.classList.remove('show');
            });
        }
    }
    
    (document.getElementById('dropdownDelete') as HTMLElement)?.addEventListener('click', () => {
        deleteSelectedItems();
        dropdown.classList.remove('show');
    });
    
    (document.getElementById('dropdownCustomGrid') as HTMLElement)?.addEventListener('click', () => {
        showCustomizeGridModal();
        dropdown.classList.remove('show');
    });
}

function handleDownload(format: string | undefined): void {
    switch(format) {
        case 'pdf':
            downloadAsPdf();
            break;
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

function deleteSelectedItems(): number {
    let deleted = 0;
       for (let i = mainLists.length - 1; i >= 0; i--) {
        const mainList = mainLists[i];
        const checkbox = mainList.row?.querySelector('.list-checkbox') as HTMLInputElement;
        
        if (checkbox && checkbox.checked) {
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
                
                subList.row?.remove();
            });
            
            mainList.row?.remove();
            mainLists.splice(i, 1);
            deleted++;
            continue;
        }
    }
    
    // Delete sublists
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
                const subIndex = mainList.subLists.findIndex(s => s.id === subList.id);
                if (subIndex !== -1) mainList.subLists.splice(subIndex, 1);
            }
            
            subList.row?.remove();
            subLists.splice(i, 1);
            deleted++;
        }
    }
    
    // Delete tasks
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        const checkbox = task.row.querySelector('.task-checkbox') as HTMLInputElement;
        
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
    
    return deleted;
}

function downloadAsJson(): void {
    const table = document.getElementById('mainTable') as HTMLTableElement;
    if (!table) return;
    
    const data: any[] = [];
    const rows = table.querySelectorAll('tr');
    
    const headers: string[] = [];
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
            const cell = cells[j] as HTMLElement;
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

// ================================
// UTILITY FUNCTIONS
// ================================

function makeCellsEditable(row: HTMLTableRowElement): void {
    const cells = [row.cells[1], row.cells[3], row.cells[7]];
    cells.forEach(cell => {
        if (cell) {
            (cell as HTMLElement).classList.add('skystemtaskmaster-editable');
            (cell as HTMLElement).setAttribute('contenteditable', 'true');
        }
    });
}

function makeExistingTasksEditable(): void {
    tasks.forEach(task => makeCellsEditable(task.row));
}

function showNotification(message: string): void {
    let notification = document.querySelector('.skystemtaskmaster-notification') as HTMLElement;
    if (notification) notification.remove();
    
    notification = document.createElement('div');
    notification.className = 'skystemtaskmaster-notification';
    notification.style.cssText = `
        
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateCounts(): void {
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
            const statusText = badge.textContent?.trim() || '';
            if (statusText === "Completed" || statusText === "✅ Completed") completed++;
            else if (statusText === "In Progress" || statusText === "⏳ In Progress") inProgress++;
            else if (statusText === "Not Started" || statusText === "⏹ Not Started") notStarted++;
        });
    }
    
    console.log('Counts calculated - Completed:', completed, 'In Progress:', inProgress, 'Not Started:', notStarted);
    
    // Update DOM
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
        completedEl.style.transform = 'scale(1.2)';
        setTimeout(() => completedEl.style.transform = 'scale(1)', 200);
    }
    
    if (inProgressEl) {
        inProgressEl.innerText = inProgress.toString();
        inProgressEl.style.transform = 'scale(1.2)';
        setTimeout(() => inProgressEl.style.transform = 'scale(1)', 200);
    }
    
    if (notStartedEl) {
        notStartedEl.innerText = notStarted.toString();
        notStartedEl.style.transform = 'scale(1.2)';
        setTimeout(() => notStartedEl.style.transform = 'scale(1)', 200);
    }
}

function calculateDays(): void {
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
    let modal = document.getElementById('customizeGridModal') as HTMLElement;
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customizeGridModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Customize Grid</h3>
                
                <div style="margin: 20px 0; max-height: 400px; overflow-y: auto;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        ${columnConfig.map(col => `
                            <div style="display: flex; align-items: center; gap: 8px; padding: 5px;">
                                <input type="checkbox" 
                                    id="col_${col.key}" 
                                    ${col.visible ? 'checked' : ''} 
                                    ${col.mandatory ? 'disabled' : ''}>
                                <label for="col_${col.key}">
                                    ${col.label}
                                    ${!col.forSubtask ? ' (tasks only)' : ''}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button id="resetGridBtn" ;">Reset</button>
                    <button id="saveGridBtn" ">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e: MouseEvent) => {
            if (e.target === modal) modal.style.display = 'none';
        });
        
        (document.getElementById('saveGridBtn') as HTMLButtonElement).addEventListener('click', () => {
            columnConfig.forEach(col => {
                const checkbox = document.getElementById(`col_${col.key}`) as HTMLInputElement;
                if (checkbox && !col.mandatory) col.visible = checkbox.checked;
            });
            
            saveColumnVisibility();
            
            addExtraColumns();
            addDataCells();
            applyVisibility();
            
            updateSublistRowsColspan();
            
            modal.style.display = 'none';
            showNotification('Grid layout updated successfully!');
        });
        
        (document.getElementById('resetGridBtn') as HTMLButtonElement).addEventListener('click', () => {
            columnConfig.forEach(col => {
                const base = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
                col.visible = base.indexOf(col.key) !== -1;
            });
            columnConfig.forEach(col => {
                const cb = document.getElementById(`col_${col.key}`) as HTMLInputElement;
                if (cb && !col.mandatory) cb.checked = col.visible;
            });
        });
    }
    modal.style.display = 'block';
}

// ================================
// TDOC DOCUMENT FUNCTIONS
// ================================

function updateTDocColumn(): void {
    console.log('Updating TDoc column with Font Awesome icons...');
    
    tasks.forEach(task => {
        if (!task.row) return;
        const tdocCell = task.row.cells[2] as HTMLElement;
        if (!tdocCell) return;
        
        tdocCell.innerHTML = '';
        tdocCell.style.textAlign = 'center';
        
        const docs = taskTDocDocuments.get(task.row) || [];
        
        // Create icon container
        const iconContainer = document.createElement('span');
        iconContainer.className = 'tdoc-icon-container';
        iconContainer.style.cssText = `
            cursor: pointer;
            display: inline-block;
            position: relative;
            padding: 5px;
        `;
        
        const icon = document.createElement('i');
        icon.className = docs.length > 0 ? 'fas fa-file-alt' : 'fas fa-file-alt';
        icon.style.cssText = `
            font-size: 20px;
            color: ${docs.length > 0 ? '' : ''};
            transition: all 0.2s;
        `;
        
        if (docs.length === 0) {
            icon.style.opacity = '0.7';
            icon.title = 'Click to upload documents';
        } else {
            icon.title = `${docs.length} document(s) attached`;
        }
        
        iconContainer.appendChild(icon);
        
        if (docs.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'tdoc-badge';
            badge.textContent = docs.length.toString();
            badge.style.cssText = `
                
            `;
            iconContainer.appendChild(badge);
        } else {
            const plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle';
            plusIcon.style.cssText = `
                
            `;
            iconContainer.appendChild(plusIcon);
        }
        
        iconContainer.onclick = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('TDoc icon clicked');
            showTDocDocumentManager(task.row);
        };
        
        iconContainer.onmouseenter = () => {
            icon.style.transform = 'scale(1.1)';
            icon.style.filter = 'drop-shadow(0 2px 4px rgba(0,207,255,0.3))';
        };
        
        iconContainer.onmouseleave = () => {
            icon.style.transform = 'scale(1)';
            icon.style.filter = 'none';
        };
        
        tdocCell.appendChild(iconContainer);
    });
    
    subtasks.forEach(subtask => {
        if (!subtask.row) return;
        const tdocCell = subtask.row.cells[2] as HTMLElement;
        if (!tdocCell) return;
        
        tdocCell.innerHTML = '';
        tdocCell.style.textAlign = 'center';
        
        const docs = taskTDocDocuments.get(subtask.row) || [];
        
        const iconContainer = document.createElement('span');
        iconContainer.className = 'tdoc-icon-container';
        iconContainer.style.cssText = `
            cursor: pointer;
            display: inline-block;
            position: relative;
            padding: 5px;
        `;
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-alt';
        icon.style.cssText = `
            font-size: 20px;
            color: ${docs.length > 0 ? '' : ''};
            transition: all 0.2s;
        `;
        
        if (docs.length === 0) {
            icon.style.opacity = '0.7';
            icon.title = 'Click to upload documents';
        } else {
            icon.title = `${docs.length} document(s) attached`;
        }
        
        iconContainer.appendChild(icon);
        
        if (docs.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'tdoc-badge';
            badge.textContent = docs.length.toString();
            badge.style.cssText = `
              
            `;
            iconContainer.appendChild(badge);
        } else {
            const plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle';
            plusIcon.style.cssText = `
                
            `;
            iconContainer.appendChild(plusIcon);
        }
        
        iconContainer.onclick = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            showTDocDocumentManager(subtask.row);
        };
        
        iconContainer.onmouseenter = () => {
            icon.style.transform = 'scale(1.1)';
        };
        
        iconContainer.onmouseleave = () => {
            icon.style.transform = 'scale(1)';
        };
        
        tdocCell.appendChild(iconContainer);
    });
}



function showTDocDocumentManager(taskRow: HTMLTableRowElement): void {
    const docs = taskTDocDocuments.get(taskRow) || [];
    let modal = document.getElementById('tdocDocumentManagerModal') as HTMLElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tdocDocumentManagerModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="width: 800px; max-width: 95%; max-height: 80vh; overflow-y: auto;">
                <span class="close">&times;</span>
                <h3 >📄 TDoc Document Manager</h3>
                
                <div style="margin-bottom: 30px; background: ; padding: 20px; border-radius: 8px;">
                    <h4 style="margin-bottom: 15px; color: #333;">Upload New Documents</h4>
                    
                    <div id="tdocDropArea" style="border: 2px dashed ; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 32px; margin-bottom: 5px;"><i class="fa-solid fa-folder-open"></i></div>
                        <div style="color: ; margin-bottom: 5px;">Drag files here or</div>
                        <button id="tdocBrowseFileBtn" style="background: ; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">Browse</button>
                        <input type="file" id="tdocFileInput" style="display: none;" multiple>
                    </div>
                    
                    <div id="tdocSelectedFilesList" style="max-height: 150px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; padding: 10px; background: white; margin-bottom: 10px; display: none;">
                        <div style="font-weight: 500; margin-bottom: 8px; color: ;">Selected Files:</div>
                        <div id="tdocFilesContainer"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end;">
                        <button id="tdocUploadSelectedBtn" style="padding: 6px 16px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;">Upload Files</button>
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 15px; color: #333;">Attached Documents (<span id="tdocDocCount">${docs.length}</span>)</h4>
                    <div id="tdocDocumentsListContainer" style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px;"></div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                    <button id="tdocCloseManagerBtn" style="padding: 8px 20px; background:; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        (document.getElementById('tdocCloseManagerBtn') as HTMLButtonElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    modal.setAttribute('data-current-task-row', taskRow.id || Math.random().toString(36));
    (window as any).currentTDocTaskRow = taskRow;
    
    const listContainer = document.getElementById('tdocDocumentsListContainer') as HTMLElement;
    if (listContainer) {
        listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
    }
    
    const countSpan = document.getElementById('tdocDocCount') as HTMLElement;
    if (countSpan) countSpan.textContent = docs.length.toString();
    
    setupTDocUploadHandlers(modal, taskRow);
    modal.style.display = 'block';
}

function renderTDocDocumentsList(docs: DocumentFile[], taskRow: HTMLTableRowElement): string {
    if (docs.length === 0) {
        return `
            <div style="padding: 40px; text-align: center; color: #999;">
                <div style="font-size: 48px; margin-bottom: 10px;">📄</div>
                <div>No documents attached</div>
                <div style="font-size: 13px; margin-top: 5px;">Click upload area above to add documents</div>
            </div>
        `;
    }
    
    return `
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: #f5f5f5; position: sticky; top: 0;">
                <tr>
                    <th">Name</th>
                    <th">Size</th>
                    <th">Upload Date</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid ;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${docs.map((doc, index) => `
                    <tr data-tdoc-doc-index="${index}">
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px;">📄</span>
                                <span style="font-weight: 500;">${doc.name}</span>
                            </div>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${(doc.size / 1024).toFixed(1)} KB</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">
                            ${doc.uploadDate.toLocaleDateString()} 
                            <span style="color: #999; font-size: 11px;">${doc.uploadDate.toLocaleTimeString()}</span>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                            <button class="tdoc-view-doc-btn" data-index="${index}" style="background: none; border: none; color: ; cursor: pointer; margin: 0 5px; font-size: 18px;" title="View">👁️</button>
                            <button class="tdoc-delete-doc-btn" data-index="${index}" style="background: none; border: none; color: #dc3545; cursor: pointer; margin: 0 5px; font-size: 18px;" title="Delete">🗑</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function setupTDocUploadHandlers(modal: HTMLElement, taskRow: HTMLTableRowElement): void {
    const dropArea = document.getElementById('tdocDropArea') as HTMLElement;
    const fileInput = document.getElementById('tdocFileInput') as HTMLInputElement;
    const filesContainer = document.getElementById('tdocFilesContainer') as HTMLElement;
    const selectedFilesList = document.getElementById('tdocSelectedFilesList') as HTMLElement;
    const uploadBtn = document.getElementById('tdocUploadSelectedBtn') as HTMLButtonElement;
    const browseBtn = document.getElementById('tdocBrowseFileBtn') as HTMLButtonElement;
    
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;
    
    let selectedFiles: File[] = [];
    
    browseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e: Event) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    dropArea.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.backgroundColor = '';
    });
    
    dropArea.addEventListener('dragleave', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.backgroundColor = 'transparent';
    });
    
    dropArea.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.backgroundColor = 'transparent';
        const files = Array.from(e.dataTransfer?.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    function updateSelectedFilesList(): void {
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
            btn.addEventListener('click', (e: Event) => {
                const target = e.target as HTMLElement;
                const index = parseInt(target.getAttribute('data-index') || '0');
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
        
        const docs: DocumentFile[] = selectedFiles.map(file => ({
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
        
        const listContainer = document.getElementById('tdocDocumentsListContainer') as HTMLElement;
        if (listContainer) {
            listContainer.innerHTML = renderTDocDocumentsList(taskTDocDocuments.get(currentTaskRow) || [], currentTaskRow);
            attachTDocDocumentEventListeners(currentTaskRow);
        }
        
        const countSpan = document.getElementById('tdocDocCount') as HTMLElement;
        if (countSpan) countSpan.textContent = (taskTDocDocuments.get(currentTaskRow) || []).length.toString();
        
        showNotification(`${docs.length} file(s) uploaded successfully`);
        
        setTimeout(() => {
            console.log('Auto-saving after TDoc upload...');
            saveAllData();
        }, 100);
    });
}

function attachTDocDocumentEventListeners(taskRow: HTMLTableRowElement): void {
    document.querySelectorAll('.tdoc-view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLElement;
            const index = parseInt(target.dataset.index || '0');
            const docs = taskTDocDocuments.get(taskRow) || [];
            if (docs[index]) previewDocument(docs[index]);
        });
    });
    
    document.querySelectorAll('.tdoc-delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLElement;
            const index = parseInt(target.dataset.index || '0');
            showTDocDeleteConfirmation(taskRow, index);
        });
    });
}

function showTDocDeleteConfirmation(taskRow: HTMLTableRowElement, index: number): void {
    const docs = taskTDocDocuments.get(taskRow) || [];
    const doc = docs[index];
    if (!doc) return;
    
    let confirmModal = document.getElementById('tdocDeleteConfirmModal') as HTMLElement;
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'tdocDeleteConfirmModal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = `
            <div class="modal-content" style="width: 350px;">
                <span class="close">&times;</span>
                <h3 style="color: ;">Confirm Delete</h3>
                
                <div style="margin: 20px 0; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                    <p style="margin-bottom: 5px;">Are you sure you want to delete this document?</p>
                    <p style="color: ; font-size: 13px;" id="tdocDocNameDisplay"></p>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <button id="tdocCancelDeleteBtn" style="padding: 8px 20px; background:; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button id="tdocConfirmDeleteBtn" style="padding: 8px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        
        (confirmModal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
        
        (document.getElementById('tdocCancelDeleteBtn') as HTMLButtonElement).addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
        
        (document.getElementById('tdocConfirmDeleteBtn') as HTMLButtonElement).addEventListener('click', () => {
            const row = (window as any).currentTDocDeleteTaskRow;
            const idx = (window as any).currentTDocDeleteIndex;
            if (row && idx !== undefined) deleteTDocDocument(row, idx);
            confirmModal.style.display = 'none';
        });
    }
    
    const docNameDisplay = document.getElementById('tdocDocNameDisplay') as HTMLElement;
    if (docNameDisplay) docNameDisplay.textContent = `"${doc.name}"`;
    
    (window as any).currentTDocDeleteTaskRow = taskRow;
    (window as any).currentTDocDeleteIndex = index;
    confirmModal.style.display = 'block';
}

function deleteTDocDocument(taskRow: HTMLTableRowElement, index: number): void {
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
        
        const managerModal = document.getElementById('tdocDocumentManagerModal') as HTMLElement;
        if (managerModal && managerModal.style.display === 'block') {
            const listContainer = document.getElementById('tdocDocumentsListContainer') as HTMLElement;
            if (listContainer) {
                listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
                attachTDocDocumentEventListeners(taskRow);
            }
            
            const header = managerModal.querySelector('h4') as HTMLElement;
            if (header) header.innerHTML = `Attached Documents (${docs.length})`;
        }
        
        showNotification(`Document "${docName}" deleted successfully`);
    }
}

function initializeTDocManager(): void {
    addTDocStyles();
    updateTDocColumn();
}

function addTDocStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
        .tdoc-count {
            cursor: pointer;
            color: ;
            font-weight: bold;
            font-size: 14px;
            padding: 4px 8px;
            display: inline-block;
            transition: all 0.2s;
        }
        
        .tdoc-count:hover {
            transform: scale(1.1);
            background-color: ;
            border-radius: 4px;
        }
        
        #tdocDocumentManagerModal .modal-content {
            animation: slideIn 0.3s ease;
        }
        
        #tdocDropArea {
            transition: all 0.3s;
        }
        
        #tdocDropArea.drag-over {
            border-color:  !important;
            background-color:  !important;
        }
        
        #tdocDocumentsListContainer tr:hover {
            background-color: ;
        }
        
        .tdoc-view-doc-btn, .tdoc-delete-doc-btn {
            transition: all 0.2s;
            opacity: 0.7;
        }
        
        .tdoc-view-doc-btn:hover, .tdoc-delete-doc-btn:hover {
            opacity: 1;
            transform: scale(1.2);
        }
        
        #tdocDeleteConfirmModal .modal-content {
            animation: slideIn 0.3s ease;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
}

// ================================
// DOWNLOAD FUNCTIONALITY
// ================================

function initializeDownloadButton(): void {
    const downloadBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return (btn.textContent && btn.textContent.indexOf('Download') !== -1) || 
               (btn.innerHTML && btn.innerHTML.indexOf('download') !== -1);
    });
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', showDownloadOptions);
    }
}

function showDownloadOptions(): void {
    let downloadModal = document.getElementById('downloadModal') as HTMLElement;
    if (!downloadModal) {
        downloadModal = document.createElement('div');
        downloadModal.id = 'downloadModal';
        downloadModal.className = 'modal';
        downloadModal.innerHTML = `
            <div class="modal-content" style="width: 300px;">
                <span class="close">&times;</span>
                <h3>Download As</h3>
                <div style="display: flex; flex-direction: column; gap: 15px; margin: 20px 0;">
                    <button id="downloadExcelBtn" style="padding: 12px; background: #1D6F42; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">📊 Excel</button>
                    <button id="downloadPdfBtn" style="padding: 12px; background: #D32F2F; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">📄 PDF</button>
                    <button id="downloadCsvBtn" style="padding: 12px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">📑 CSV</button>
                    <button id="downloadJsonBtn" style="padding: 12px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">🔧 JSON</button>
                </div>
            </div>
        `;
        document.body.appendChild(downloadModal);
        
        (downloadModal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            downloadModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e: MouseEvent) => {
            if (e.target === downloadModal) downloadModal.style.display = 'none';
        });
        
        (document.getElementById('downloadExcelBtn') as HTMLButtonElement).addEventListener('click', () => {
            downloadAsExcel();
            downloadModal.style.display = 'none';
        });
        
        (document.getElementById('downloadPdfBtn') as HTMLButtonElement).addEventListener('click', () => {
            downloadAsPdf();
            downloadModal.style.display = 'none';
        });
        
        (document.getElementById('downloadCsvBtn') as HTMLButtonElement).addEventListener('click', () => {
            downloadAsCsv();
            downloadModal.style.display = 'none';
        });
        
        (document.getElementById('downloadJsonBtn') as HTMLButtonElement).addEventListener('click', () => {
            downloadAsJson();
            downloadModal.style.display = 'none';
        });
    }
    downloadModal.style.display = 'block';
}

function downloadAsExcel(): void {
    const table = document.getElementById('mainTable') as HTMLTableElement;
    if (!table) return;
    
    let csv: string[] = [];
    const rows = table.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('th, td');
        const rowData: string[] = [];
        
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

function downloadAsPdf(): void {
    showNotification('Preparing PDF...');
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow pop-ups for PDF download');
        return;
    }
    
    const table = document.getElementById('mainTable') as HTMLTableElement;
    if (!table) return;
    
    const styles = document.querySelectorAll('style');
    let styleText = '';
    styles.forEach(style => styleText += style.innerHTML);
    
    const title = document.querySelector('.skystemtaskmaster-checklist-title')?.textContent || 'Tasks';
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Task Viewer Export</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid ; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                ${styleText}
            </style>
        </head>
        <body>
            <h2>Task Viewer - ${title}</h2>
            ${table.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function downloadAsCsv(): void {
    downloadAsExcel();
    showNotification('Downloaded as CSV');
}

// ================================
// FILTER FUNCTIONALITY - FIXED VERSION
// ================================

function initializeFilterButton(): void {
    const filterBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return (btn.textContent && btn.textContent.indexOf('Filter') !== -1) || 
               (btn.innerHTML && btn.innerHTML.indexOf('filter') !== -1);
    });
    
    if (filterBtn) {
        filterBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            showFilterPanel();
        });
    } else {
        const filterOption = document.getElementById('dropdownFilter');
        if (filterOption) {
            filterOption.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                showFilterPanel();
            });
        }
    }
}

function showFilterPanel(): void {
    const existingModal = document.getElementById('filterModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create filter modal
    const filterModal = document.createElement('div');
    filterModal.id = 'filterModal';
    filterModal.className = 'modal';
    filterModal.innerHTML = `
        <div class="modal-content" style="width: 400px;">
            <span class="close">&times;</span>
            <h3 style="color: ; margin-bottom: 20px;">Filter Tasks</h3>
            
            <div style="margin: 20px 0;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Status</label>
                    <select id="filterStatus" >
                        <option value="all">All Status</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Review">Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Owner</label>
                    <select id="filterOwner" >
                        <option value="all">All Owners</option>
                        <option value="PK">PK - Palakh Khanna</option>
                        <option value="SM">SM - Sarah Miller</option>
                        <option value="MP">MP - Mel Preparer</option>
                        <option value="PP">PP - Poppy Pan</option>
                        <option value="JS">JS - John Smith</option>
                        <option value="EW">EW - Emma Watson</option>
                        <option value="DB">DB - David Brown</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Reviewer</label>
                    <select id="filterReviewer" >
                        <option value="all">All Reviewers</option>
                        <option value="PK">PK - Palakh Khanna</option>
                        <option value="SM">SM - Sarah Miller</option>
                        <option value="MP">MP - Mel Preparer</option>
                        <option value="PP">PP - Poppy Pan</option>
                        <option value="JS">JS - John Smith</option>
                        <option value="EW">EW - Emma Watson</option>
                        <option value="DB">DB - David Brown</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Due Date</label>
                    <select id="filterDueDate" >
                        <option value="all">All Dates</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Due Today</option>
                        <option value="week">Due This Week</option>
                        <option value="month">Due This Month</option>
                        <option value="future">Future (After This Month)</option>
                    </select>
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                <button id="clearFilterBtn" style="padding: 8px 16px; background:; border: none; border-radius: 4px; cursor: pointer;">Clear</button>
                <button id="applyFilterBtn" style="padding: 8px 16px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply Filter</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(filterModal);
    
    // Close button
    (filterModal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
        filterModal.style.display = 'none';
    });
    
    // Click outside to close
    window.addEventListener('click', (e: MouseEvent) => {
        if (e.target === filterModal) {
            filterModal.style.display = 'none';
        }
    });
    
    // Apply filter button
    (document.getElementById('applyFilterBtn') as HTMLButtonElement).addEventListener('click', () => {
        applyFilters();
        filterModal.style.display = 'none';
        showNotification('Filters applied successfully');
    });
    
    // Clear filter button
    (document.getElementById('clearFilterBtn') as HTMLButtonElement).addEventListener('click', () => {
        clearFilters();
        filterModal.style.display = 'none';
        showNotification('Filters cleared');
    });
    
    filterModal.style.display = 'block';
}

function applyFilters(): void {
    // Get filter values
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
    
    // Filter tasks
    tasks.forEach(task => {
        let show = true;
        
        // Status filter
        if (show && statusFilter !== 'all') {
            const taskStatus = task.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter) show = false;
        }
        
        // Owner filter
        if (show && ownerFilter !== 'all') {
            const ownerBadge = task.row.cells[5]?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
            const ownerText = ownerBadge?.textContent?.trim() || '';
            if (ownerText !== ownerFilter) show = false;
        }
        
        // Reviewer filter
        if (show && reviewerFilter !== 'all') {
            const reviewerBadge = task.row.cells[6]?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
            const reviewerText = reviewerBadge?.textContent?.trim() || '';
            if (reviewerText !== reviewerFilter) show = false;
        }
        
        // Due date filter
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
    
    // Filter subtasks
    subtasks.forEach(subtask => {
        let show = true;
        
        // Status filter
        if (show && statusFilter !== 'all') {
            const taskStatus = subtask.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter) show = false;
        }
        
        // Owner filter
        if (show && ownerFilter !== 'all') {
            const ownerBadge = subtask.ownerCell?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
            const ownerText = ownerBadge?.textContent?.trim() || '';
            if (ownerText !== ownerFilter) show = false;
        }
        
        // Reviewer filter
        if (show && reviewerFilter !== 'all') {
            const reviewerBadge = subtask.reviewerCell?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
            const reviewerText = reviewerBadge?.textContent?.trim() || '';
            if (reviewerText !== reviewerFilter) show = false;
        }
        
        if (show && dueDateFilter !== 'all') {
            const dueDateCell = subtask.row.cells[3] as HTMLElement;
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
    tasks.forEach(task => {
        task.row.style.display = '';
    });
    subtasks.forEach(subtask => {
        subtask.row.style.display = '';
    });
    console.log('Filters cleared');
}

function initializeTaskDropdown(): void {
    const taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown") as HTMLSelectElement;
    if (!taskDropdown) return;
    
    // Clear existing event listeners
    const newDropdown = taskDropdown.cloneNode(true) as HTMLSelectElement;
    taskDropdown.parentNode!.replaceChild(newDropdown, taskDropdown);
    
    newDropdown.addEventListener("change", (e: Event) => {
        const filter = (e.target as HTMLSelectElement).value;
        const currentUser = 'PK';
        
        console.log('Dropdown filter changed to:', filter);
        
        // First show all rows
        tasks.forEach(task => {
            if (task.row) task.row.style.display = '';
        });
        
        subtasks.forEach(subtask => {
            if (subtask.row) subtask.row.style.display = '';
        });
        
        if (filter !== "all") {
            tasks.forEach(task => {
                const ownerBadge = task.row.cells[5]?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
                const reviewerBadge = task.row.cells[6]?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
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
                const ownerBadge = subtask.ownerCell?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
                const reviewerBadge = subtask.reviewerCell?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
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
        
        // Count visible items
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

// ================================
// SORT FUNCTIONALITY
// ================================

function initializeSortButton(): void {
    const sortBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return btn.textContent?.indexOf('Sort') !== -1 || btn.innerHTML.indexOf('sort') !== -1;
    });
    
    if (sortBtn) {
        sortBtn.addEventListener('click', showSortOptions);
    }
}

function showSortOptions(): void {
    let sortModal = document.getElementById('sortModal') as HTMLElement;
    if (!sortModal) {
        sortModal = document.createElement('div');
        sortModal.id = 'sortModal';
        sortModal.className = 'modal';
        sortModal.innerHTML = `
            <div class="modal-content" style="width: 350px;">
                <span class="close">&times;</span>
                <h3>Sort Tasks</h3>
                
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Sort By</label>
                        <select id="sortBy" >
                            <option value="taskName">Task Name</option>
                            <option value="dueDate">Due Date</option>
                            <option value="status">Status</option>
                            <option value="owner">Owner</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="days">+/- Days</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Order</label>
                        <select id="sortOrder" >
                            <option value="asc">Ascending (A-Z)</option>
                            <option value="desc">Descending (Z-A)</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="applySortBtn" style="padding: 8px 16px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply Sort</button>
                </div>
            </div>
        `;
        document.body.appendChild(sortModal);
        
        (sortModal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            sortModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e: MouseEvent) => {
            if (e.target === sortModal) sortModal.style.display = 'none';
        });
        
        (document.getElementById('applySortBtn') as HTMLButtonElement).addEventListener('click', () => {
            const sortBy = (document.getElementById('sortBy') as HTMLSelectElement).value;
            const sortOrder = (document.getElementById('sortOrder') as HTMLSelectElement).value as 'asc' | 'desc';
            applySort(sortBy, sortOrder);
            sortModal.style.display = 'none';
        });
    }
    sortModal.style.display = 'block';
}

function applySort(sortBy: string, sortOrder: 'asc' | 'desc'): void {
    const tbody = document.querySelector('tbody') as HTMLTableSectionElement;
    if (!tbody) return;
    
    // Get all rows
    const allRows = Array.from(tbody.querySelectorAll('tr')) as HTMLTableRowElement[];
    
    // Separate header rows (main-list, sub-list, subtask-header)
    const headerRows = allRows.filter(row => 
        row.classList.contains('main-list-row') || 
        row.classList.contains('sub-list-row') ||
        row.classList.contains('skystemtaskmaster-subtask-header')
    );
    
    // Get all task rows
    const taskRows = allRows.filter(row => row.classList.contains('task-row'));
    const subtaskRows = allRows.filter(row => row.classList.contains('subtask-row'));
    
    // Group tasks by their parent sublist
    const tasksBySublist: { [key: string]: HTMLTableRowElement[] } = {};
    taskRows.forEach(row => {
        const sublistId = row.dataset.sublistId;
        if (sublistId) {
            if (!tasksBySublist[sublistId]) {
                tasksBySublist[sublistId] = [];
            }
            tasksBySublist[sublistId].push(row);
        }
    });
    
    // Sort tasks WITHIN each sublist
    Object.keys(tasksBySublist).forEach(sublistId => {
        tasksBySublist[sublistId].sort((a, b) => {
            let aVal = getSortValue(a, sortBy);
            let bVal = getSortValue(b, sortBy);
            
            if (sortBy === 'dueDate' || sortBy === 'days') {
                aVal = parseSortValue(aVal, sortBy);
                bVal = parseSortValue(bVal, sortBy);
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            } else {
                // For string comparison in ES5
                const aStr = String(aVal).toLowerCase();
                const bStr = String(bVal).toLowerCase();
                if (sortOrder === 'asc') {
                    if (aStr < bStr) return -1;
                    if (aStr > bStr) return 1;
                    return 0;
                } else {
                    if (bStr < aStr) return -1;
                    if (bStr > aStr) return 1;
                    return 0;
                }
            }
        });
    });
    
    // Clear tbody
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    
    // Rebuild the table preserving hierarchy
    headerRows.forEach(row => tbody.appendChild(row));
    
    // For each sublist row, add its tasks right after it
    headerRows.forEach(headerRow => {
        if (headerRow.classList.contains('sub-list-row')) {
            const sublistId = headerRow.dataset.sublistId;
            const tasksForThisSublist = sublistId ? tasksBySublist[sublistId] || [] : [];
            tasksForThisSublist.forEach(taskRow => tbody.appendChild(taskRow));
        }
    });
    
    // Add remaining tasks (if any) - those might not be under any sublist
    const remainingTasks = taskRows.filter(row => {
        return !Array.from(tbody.children).some(child => child === row);
    });
    remainingTasks.forEach(row => tbody.appendChild(row));
    
    // Add subtasks at the end
    subtaskRows.forEach(row => tbody.appendChild(row));
    
    showNotification(`Sorted by ${sortBy} (${sortOrder === 'asc' ? 'Ascending' : 'Descending'})`);
}

function getSortValue(row: HTMLTableRowElement, sortBy: string): string | number {
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

function getSubtaskSortValue(row: HTMLTableRowElement, sortBy: string): string | number {
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

function parseSortValue(val: string | number, sortBy: string): number {
    if (typeof val === 'string') {
        if (sortBy === 'days') return parseInt(val.replace('+', '')) || 0;
        if (sortBy === 'dueDate') return new Date(val).getTime() || 0;
    }
    return 0;
}

// ================================
// ACCOUNT COLUMN FUNCTIONS
// ================================

function addAccountColumnToTasks(): void {
    // Tasks ke liye
    tasks.forEach(task => {
        const row = task.row;
        const accountCell = row.cells[1] as HTMLElement;
        if (accountCell) {
            // Clear existing content
            accountCell.innerHTML = '';
            
            // Create account display
            const accountDisplay = document.createElement('div');
            accountDisplay.className = 'account-display';
            accountDisplay.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                min-height: 24px;
                align-items: center;
            `;
            
            // Get linked accounts for this task (using task ID or row as key)
            const taskId = task.id || task.row.dataset.taskId;
            const accounts = taskAccounts.get(task.row) || (taskId ? taskAccounts.get(taskId) : []) || [];
            
            if (accounts.length > 0) {
                // Show account numbers
                accounts.forEach((account: Account) => {
                    const accountBadge = document.createElement('span');
                    accountBadge.className = 'account-badge';
                    accountBadge.textContent = account.accountNumber || 'ACC';
                    accountBadge.title = account.accountName || `Account ${account.accountNumber}`;
                    accountBadge.style.cssText = `
                        display: inline-block;
                        background: ;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 11px;
                        margin-right: 4px;
                        margin-bottom: 2px;
                        cursor: pointer;
                        transition: all 0.2s;
                    `;
                    
                    accountBadge.addEventListener('mouseenter', () => {
                        accountBadge.style.transform = 'scale(1.05)';
                        accountBadge.style.backgroundColor = '#e50072';
                    });
                    
                    accountBadge.addEventListener('mouseleave', () => {
                        accountBadge.style.transform = 'scale(1)';
                        accountBadge.style.backgroundColor = '';
                    });
                    
                    accountBadge.addEventListener('click', (e: MouseEvent) => {
                        e.stopPropagation();
                        showAccountDetails(account, task.row, task);
                    });
                    
                    accountDisplay.appendChild(accountBadge);
                });
            }
            else {
                // Show empty state with plus icon
                const addIcon = document.createElement('span');
                addIcon.className = 'add-account-icon';
                addIcon.innerHTML = '+';
                addIcon.style.cssText = `
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    background:;
                    color: ;
                    border-radius: 50%;
                    text-align: center;
                    line-height: 20px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s;
                `;
                addIcon.title = 'Link account';
                
                addIcon.addEventListener('mouseenter', () => {
                    addIcon.style.transform = 'scale(1.1)';
                    addIcon.style.backgroundColor = '';
                    addIcon.style.color = 'white';
                });
                
                addIcon.addEventListener('mouseleave', () => {
                    addIcon.style.transform = 'scale(1)';
                    addIcon.style.backgroundColor = '#f0f0f0';
                    addIcon.style.color = '';
                });
                
                addIcon.addEventListener('click', (e: MouseEvent) => {
                    e.stopPropagation();
                    showAccountLinkingModal(task.row, task);
                });
                
                accountDisplay.appendChild(addIcon);
            }
            
            accountCell.appendChild(accountDisplay);
        }
    });
}

// ================================
// SHOW ACCOUNT DETAILS
// ================================

function showAccountDetails(account: Account, taskRow: HTMLTableRowElement, task: Task): void {
    // Remove any existing tooltips
    document.querySelectorAll('.account-tooltip').forEach(el => el.remove());
    
    // Create tooltip/popup
    const tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid ;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 250px;
        animation: fadeIn 0.2s ease;
    `;
    
    tooltip.innerHTML = `
        <div style="font-weight: bold; color: ; font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
            ${account.accountNumber || 'Account'}
        </div>
        <div style="margin: 8px 0; color: #333;">
            <div style="font-size: 14px; margin-bottom: 4px;">${account.accountName || 'Account'}</div>
            ${account.accountType ? `<div style="font-size: 12px; color: ; margin-bottom: 2px;">Type: ${account.accountType}</div>` : ''}
            ${account.riskRating ? `<div style="font-size: 12px; color: ;">Risk: ${account.riskRating}</div>` : ''}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 15px; justify-content: flex-end;">
            <button class="close-tooltip-btn" style="padding: 6px 12px; background:; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Close</button>
            <button class="remove-account-btn" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
        </div>
    `;
    
    // Position tooltip near the click
    document.body.appendChild(tooltip);
    
    // Position near the mouse
    const rect = taskRow.getBoundingClientRect();
    tooltip.style.left = (rect.left + window.scrollX + 50) + 'px';
    tooltip.style.top = (rect.top + window.scrollY - 50) + 'px';
    
    // Close button
    (tooltip.querySelector('.close-tooltip-btn') as HTMLElement).addEventListener('click', () => {
        tooltip.remove();
    });
    
    // Remove button
    (tooltip.querySelector('.remove-account-btn') as HTMLElement).addEventListener('click', () => {
        const taskId = task.id || task.row.dataset.taskId;
        const accounts = taskAccounts.get(task.row) || (taskId ? taskAccounts.get(taskId) : []) || [];
        const updatedAccounts = accounts.filter((a: Account) => a.accountNumber !== account.accountNumber);
        
        if (updatedAccounts.length === 0) {
            taskAccounts.delete(task.row);
            if (taskId) taskAccounts.delete(taskId);
        } else {
            taskAccounts.set(task.row, updatedAccounts);
            if (taskId) taskAccounts.set(taskId, updatedAccounts);
        }
        
        tooltip.remove();
        addAccountColumnToTasks();
        showNotification(`Account ${account.accountNumber} removed`);
    });
    
    // Click outside to close
    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e: MouseEvent) {
            if (!tooltip.contains(e.target as Node)) {
                tooltip.remove();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 100);
}

// ================================
// ACCOUNT LINKING MODAL
// ================================

function showAccountLinkingModal(taskRow: HTMLTableRowElement, task: Task): void {
    // Remove any existing modal
    const existingModal = document.getElementById('accountLinkingModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'accountLinkingModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.zIndex = '10000';
    
    modal.innerHTML = `
        <div class="modal-content" style="width: 800px; max-width: 95%; margin: 3% auto; padding: 25px; background: white; border-radius: 8px; position: relative; max-height: 90vh; overflow-y: auto;">
            <span class="close" style="position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer;">&times;</span>
            <h3 style="color: ; margin-bottom: 20px;">📊 Link Account to Task</h3>
            
            <div style="margin-bottom: 20px; padding: 12px; background: ; border-radius: 6px; border-left: 3px solid ;">
                <div style="font-size: 13px; color: ; margin-bottom: 5px;">Task:</div>
                <div style="font-weight: 500;">${task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task'}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
                <!-- Left Column -->
                <div>
                    <h4 style="color: #333; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Account Details</h4>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Organizational Hierarchy</label>
                        <select id="orgHierarchy" style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                            <option value="">Select Hierarchy...</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Division">Division</option>
                            <option value="Department">Department</option>
                            <option value="Subsidiary">Subsidiary</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">FS Caption</label>
                        <input type="text" id="fsCaption" placeholder="e.g., Cash & Equivalents" 
                               style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Account Name *</label>
                        <input type="text" id="accountName" placeholder="e.g., Cash & Cash Equivalents" 
                               style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Account Owners</label>
                        <select id="accountOwners" style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;" multiple size="3">
                            <option value="PK">Palakh Khanna</option>
                            <option value="SM">Sarah Miller</option>
                            <option value="MP">Mel Preparer</option>
                            <option value="PP">Poppy Pan</option>
                            <option value="JS">John Smith</option>
                            <option value="EW">Emma Watson</option>
                            <option value="DB">David Brown</option>
                        </select>
                        <div style="font-size: 11px; color: ; margin-top: 4px;">Ctrl+Click to select multiple</div>
                    </div>
                </div>
                
                <!-- Right Column -->
                <div>
                    <h4 style="color: #333; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Account Range & Settings</h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Account # From</label>
                            <input type="text" id="accountFrom" placeholder="e.g., 1000" 
                                   style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Account # To</label>
                            <input type="text" id="accountTo" placeholder="e.g., 1999" 
                                   style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Due Days From</label>
                            <input type="number" id="dueDaysFrom" placeholder="e.g., 0" 
                                   style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Due Days To</label>
                            <input type="number" id="dueDaysTo" placeholder="e.g., 30" 
                                   style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Is Key Account</label>
                        <select id="isKeyAccount" style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                            <option value="All">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Reconcilable</label>
                        <select id="reconcilable" style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                            <option value="All">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Risk Rating</label>
                        <select id="riskRating" style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                            <option value="All">All</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">ZBA</label>
                        <select id="zba" style="width: 100%; padding: 10px; border: 2px solid ; border-radius: 6px;">
                            <option value="All">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid ; padding-top: 20px;">
                <button id="cancelAccountBtn" style="padding: 10px 20px; background:; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
                <button id="linkAccountBtn" style="padding: 10px 20px; background: ; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Link Account</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
        modal.remove();
    });
    
    // Cancel button
    (document.getElementById('cancelAccountBtn') as HTMLButtonElement).addEventListener('click', () => {
        modal.remove();
    });
    
    // Link button
    (document.getElementById('linkAccountBtn') as HTMLButtonElement).addEventListener('click', () => {
        const accountName = (document.getElementById('accountName') as HTMLInputElement).value.trim();
        
        if (!accountName) {
            alert('Please enter Account Name');
            return;
        }
        
        // Get selected account owners (multiple)
        const accountOwnersSelect = document.getElementById('accountOwners') as HTMLSelectElement;
        const selectedOwners = Array.from(accountOwnersSelect.selectedOptions).map(opt => opt.value);
        
        const account: Account = {
            // Basic Info
            orgHierarchy: (document.getElementById('orgHierarchy') as HTMLSelectElement).value,
            fsCaption: (document.getElementById('fsCaption') as HTMLInputElement).value.trim(),
            accountName: accountName,
            accountOwners: selectedOwners,
            
            // Account Range
            accountFrom: (document.getElementById('accountFrom') as HTMLInputElement).value.trim(),
            accountTo: (document.getElementById('accountTo') as HTMLInputElement).value.trim(),
            
            // Due Days Range
            dueDaysFrom: (document.getElementById('dueDaysFrom') as HTMLInputElement).value,
            dueDaysTo: (document.getElementById('dueDaysTo') as HTMLInputElement).value,
            
            // Settings
            isKeyAccount: (document.getElementById('isKeyAccount') as HTMLSelectElement).value,
            reconcilable: (document.getElementById('reconcilable') as HTMLSelectElement).value,
            riskRating: (document.getElementById('riskRating') as HTMLSelectElement).value,
            zba: (document.getElementById('zba') as HTMLSelectElement).value,
            
            // Metadata
            linkedDate: new Date().toISOString(),
            linkedBy: 'PK'
        };
        
        // Save account to task
        const taskId = task.id || task.row.dataset.taskId;
        const existingAccounts = taskAccounts.get(task.row) || (taskId ? taskAccounts.get(taskId) : []) || [];
        const updatedAccounts = [...existingAccounts, account];
        
        taskAccounts.set(task.row, updatedAccounts);
        if (taskId) taskAccounts.set(taskId, updatedAccounts);
        
        if (task) {
            task.linkedAccounts = updatedAccounts;
        }
        
        // Refresh display
        refreshLinkedAccountsColumn();
        
        modal.remove();
        showNotification(`Account "${accountName}" linked to task`);
        
        setTimeout(() => saveAllData(), 100);
    });
    
    // Click outside to close
    modal.addEventListener('click', (e: MouseEvent) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ================================
// ADD ACCOUNT STYLES
// ================================

// ================================
// INITIALIZE ACCOUNT COLUMN
// ================================


// ================================
// FIXED LINKED ACCOUNTS DISPLAY
// ================================

function refreshLinkedAccountsColumn(): void {
    document.querySelectorAll('.extra-cell[data-column="linkedAccounts"]').forEach(cellElement => {
        const cell = cellElement as HTMLElement;
        const row = cell.closest('tr') as HTMLTableRowElement;
        if (!row) return;
        
        const task = tasks.find(t => t.row === row);
        if (!task) return;
        
        const taskId = task.id || row.dataset.taskId;
        const accounts = taskAccounts.get(row) || (taskId ? taskAccounts.get(taskId) : []) || [];
        
        cell.innerHTML = '';
        cell.style.cursor = 'pointer';
        cell.style.padding = '4px 8px';
        cell.style.minWidth = '150px';
        
        if (accounts.length > 0) {
            accounts.forEach((account: Account) => {
                const badge = document.createElement('span');
                badge.textContent = account.accountName ? account.accountName.substring(0, 12) + (account.accountName.length > 12 ? '...' : '') : 'Account';
                badge.style.cssText = `
                   
                `;
                badge.title = account.accountName || '';
                
                badge.onclick = (e: MouseEvent) => {
                    e.stopPropagation();
                    showAccountDetails(account, row, task);
                };
                
                cell.appendChild(badge);
            });
            
            // Add more button
            const addMore = document.createElement('span');
            addMore.textContent = '+';
            addMore.style.cssText = `
               
            `;
            addMore.onclick = (e: MouseEvent) => {
                e.stopPropagation();
                showAccountLinkingModal(task.row, task);
            };
            cell.appendChild(addMore);
            
        } else {
            const addIcon = document.createElement('span');
            addIcon.textContent = '+ Link Account';
            addIcon.style.cssText = `
               
            `;
            addIcon.onclick = (e: MouseEvent) => {
                e.stopPropagation();
                showAccountLinkingModal(task.row, task);
            };
            cell.appendChild(addIcon);
        }
    });
}

// Update the addDataCells function to properly initialize linked accounts
function enhanceAddDataCells(): void {
    // Call the original addDataCells
    addDataCells();
    
    // Now update linked accounts column
    setTimeout(() => {
        refreshLinkedAccountsColumn();
    }, 100);
}

// ================================
// CDOC DOCUMENT FUNCTIONS
// ================================

function updateCDocColumn(): void {
    console.log('Updating CDoc column with Font Awesome icons...');
    
    tasks.forEach(task => {
        if (!task.row) return;
        const cdocCell = task.row.cells[7] as HTMLElement;
        if (!cdocCell) return;
        
        cdocCell.innerHTML = '';
        cdocCell.style.textAlign = 'center';
        
        // CRITICAL: Make sure we're using taskDocuments Map for CDoc
        const docs = taskDocuments.get(task.row) || [];
        console.log(`Task ${task.id} has ${docs.length} CDoc documents`);
        
        const iconContainer = document.createElement('span');
        iconContainer.className = 'cdoc-icon-container';
        iconContainer.style.cssText = `
            cursor: pointer;
            display: inline-block;
            position: relative;
            padding: 5px;
        `;
        
        // Different icon for CDoc (folder)
        const icon = document.createElement('i');
        icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
        icon.style.cssText = `
            font-size: 20px;
            color: ${docs.length > 0 ? '' : '#999'};
            transition: all 0.2s;
        `;
        
        if (docs.length === 0) {
            icon.style.opacity = '0.7';
            icon.title = 'Click to upload documents';
        } else {
            icon.title = `${docs.length} document(s) attached`;
        }
        
        iconContainer.appendChild(icon);
        
        if (docs.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'cdoc-badge';
            badge.textContent = docs.length.toString();
            badge.style.cssText = `
                
            `;
            iconContainer.appendChild(badge);
        } else {
            const plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle';
            plusIcon.style.cssText = `
               
            `;
            iconContainer.appendChild(plusIcon);
        }
        
        iconContainer.onclick = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            showDocumentManager(task.row);
        };
        
        iconContainer.onmouseenter = () => {
            icon.style.transform = 'scale(1.1)';
        };
        
        iconContainer.onmouseleave = () => {
            icon.style.transform = 'scale(1)';
        };
        
        cdocCell.appendChild(iconContainer);
    });
    
    // Subtasks ke liye same logic
    subtasks.forEach(subtask => {
        if (!subtask.row) return;
        const cdocCell = subtask.row.cells[7] as HTMLElement;
        if (!cdocCell) return;
        
        cdocCell.innerHTML = '';
        cdocCell.style.textAlign = 'center';
        
        const docs = taskDocuments.get(subtask.row) || [];
        console.log(`Subtask ${subtask.id} has ${docs.length} CDoc documents`);
        
        const iconContainer = document.createElement('span');
        iconContainer.className = 'cdoc-icon-container';
        iconContainer.style.cssText = `
            cursor: pointer;
            display: inline-block;
            position: relative;
            padding: 5px;
        `;
        
        const icon = document.createElement('i');
        icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
        icon.style.cssText = `
            font-size: 20px;
            color: ${docs.length > 0 ? '' : '#999'};
            transition: all 0.2s;
        `;
        
        if (docs.length === 0) {
            icon.style.opacity = '0.7';
            icon.title = 'Click to upload documents';
        } else {
            icon.title = `${docs.length} document(s) attached`;
        }
        
        iconContainer.appendChild(icon);
        
        if (docs.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'cdoc-badge';
            badge.textContent = docs.length.toString();
            badge.style.cssText = `
                
            `;
            iconContainer.appendChild(badge);
        } else {
            const plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle';
            plusIcon.style.cssText = `
               
            `;
            iconContainer.appendChild(plusIcon);
        }
        
        iconContainer.onclick = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            showDocumentManager(subtask.row);
        };
        
        iconContainer.onmouseenter = () => {
            icon.style.transform = 'scale(1.1)';
        };
        
        iconContainer.onmouseleave = () => {
            icon.style.transform = 'scale(1)';
        };
        
        cdocCell.appendChild(iconContainer);
    });
}

function showDocumentManager(taskRow: HTMLTableRowElement): void {
    const docs = taskDocuments.get(taskRow) || [];
    let modal = document.getElementById('documentManagerModal') as HTMLElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'documentManagerModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="width: 800px; max-width: 95%; max-height: 80vh; overflow-y: auto;">
                <span class="close">&times;</span>
                <h3 style="color: ; margin-bottom: 20px;">📄 CDoc Document Manager</h3>
                
                <div style="margin-bottom: 30px; background: ; padding: 20px; border-radius: 8px;">
                    <h4 style="margin-bottom: 15px; color: #333;">Upload New Documents</h4>
                    
                    <div id="dropArea" style="border: 2px dashed #ddd; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 32px; margin-bottom: 5px;"><i class="fa-solid fa-folder-open"></i></div>
                        <div style="color: ; margin-bottom: 5px;">Drag files here or</div>
                        <button id="browseFileBtn" style="background: ; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">Browse</button>
                        <input type="file" id="fileInput" style="display: none;" multiple>
                    </div>
                    
                    <div id="selectedFilesList" style="max-height: 150px; overflow-y: auto; border: 1px solid ; border-radius: 4px; padding: 10px; background: white; margin-bottom: 10px; display: none;">
                        <div style="font-weight: 500; margin-bottom: 8px; color: ;">Selected Files:</div>
                        <div id="filesContainer"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end;">
                        <button id="uploadSelectedBtn" style="padding: 6px 16px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;">Upload Files</button>
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 15px; color: #333;">Attached Documents (<span id="docCount">${docs.length}</span>)</h4>
                    <div id="documentsListContainer" style="max-height: 300px; overflow-y: auto; border: 1px solid ; border-radius: 4px;"></div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                    <button id="closeManagerBtn" style="padding: 8px 20px; background:; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        (document.getElementById('closeManagerBtn') as HTMLButtonElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Store the current task row in a global variable
        (window as any).currentTaskRow = taskRow;
        
        setupUploadHandlers(modal, taskRow);
    }
    
    // Update the current task row
    (window as any).currentTaskRow = taskRow;
    
    const listContainer = document.getElementById('documentsListContainer') as HTMLElement;
    if (listContainer) {
        listContainer.innerHTML = renderDocumentsList(docs, taskRow);
        attachDocumentEventListeners(taskRow);
    }
    
    const countSpan = document.getElementById('docCount') as HTMLElement;
    if (countSpan) countSpan.textContent = docs.length.toString();
    
    modal.style.display = 'block';
}

function renderDocumentsList(docs: DocumentFile[], taskRow: HTMLTableRowElement): string {
    if (docs.length === 0) {
        return `
            <div style="padding: 40px; text-align: center; color: #999;">
                <div style="font-size: 48px; margin-bottom: 10px;">📄</div>
                <div>No documents attached</div>
                <div style="font-size: 13px; margin-top: 5px;">Click upload area above to add documents</div>
            </div>
        `;
    }
    
    return `
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: #f5f5f5; position: sticky; top: 0;">
                <tr>
                    <th">Name</th>
                    <th">Size</th>
                    <th">Upload Date</th>
                    <th">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${docs.map((doc, index) => `
                    <tr data-doc-index="${index}">
                        <td style="padding: 12px; border-bottom: 1px solid ;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px;">📄</span>
                                <span style="font-weight: 500;">${doc.name}</span>
                            </div>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid ;">${(doc.size / 1024).toFixed(1)} KB</td>
                        <td style="padding: 12px; border-bottom: 1px solid ;">
                            ${doc.uploadDate.toLocaleDateString()} 
                            <span style="color: #999; font-size: 11px;">${doc.uploadDate.toLocaleTimeString()}</span>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid ; text-align: center;">
                            <button class="view-doc-btn" data-index="${index}" style="background: none; border: none; color: ; cursor: pointer; margin: 0 5px; font-size: 18px;" title="View">👁️</button>
                            <button class="delete-doc-btn" data-index="${index}" style="background: none; border: none; color: #dc3545; cursor: pointer; margin: 0 5px; font-size: 18px;" title="Delete">🗑</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function attachDocumentEventListeners(taskRow: HTMLTableRowElement): void {
    document.querySelectorAll('.view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLElement;
            const index = parseInt(target.dataset.index || '0');
            const docs = taskDocuments.get(taskRow) || [];
            if (docs[index]) previewDocument(docs[index]);
        });
    });
    
    document.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLElement;
            const index = parseInt(target.dataset.index || '0');
            showDeleteConfirmation(taskRow, index);
        });
    });
}

function showDeleteConfirmation(taskRow: HTMLTableRowElement, index: number): void {
    const docs = taskDocuments.get(taskRow) || [];
    const doc = docs[index];
    if (!doc) return;
    
    let confirmModal = document.getElementById('deleteConfirmModal') as HTMLElement;
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'deleteConfirmModal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = `
            <div class="modal-content" style="width: 350px;">
                <span class="close">&times;</span>
                <h3 style="color: ;">Confirm Delete</h3>
                
                <div style="margin: 20px 0; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                    <p style="margin-bottom: 5px;">Are you sure you want to delete this document?</p>
                    <p style="color: ; font-size: 13px;" id="docNameDisplay"></p>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <button id="cancelDeleteBtn" style="padding: 8px 20px; background:; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button id="confirmDeleteBtn" style="padding: 8px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        
        (confirmModal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
        
        (document.getElementById('cancelDeleteBtn') as HTMLButtonElement).addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
        
        (document.getElementById('confirmDeleteBtn') as HTMLButtonElement).addEventListener('click', () => {
            const row = (window as any).currentDeleteTaskRow;
            const idx = (window as any).currentDeleteIndex;
            if (row && idx !== undefined) deleteDocument(row, idx);
            confirmModal.style.display = 'none';
        });
    }
    
    const docNameDisplay = document.getElementById('docNameDisplay') as HTMLElement;
    if (docNameDisplay) docNameDisplay.textContent = `"${doc.name}"`;
    
    (window as any).currentDeleteTaskRow = taskRow;
    (window as any).currentDeleteIndex = index;
    confirmModal.style.display = 'block';
}

function deleteDocument(taskRow: HTMLTableRowElement, index: number): void {
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
        
        const managerModal = document.getElementById('documentManagerModal') as HTMLElement;
        if (managerModal && managerModal.style.display === 'block') {
            const listContainer = document.getElementById('documentsListContainer') as HTMLElement;
            if (listContainer) {
                listContainer.innerHTML = renderDocumentsList(docs, taskRow);
                attachDocumentEventListeners(taskRow);
            }
            
            const header = managerModal.querySelector('h4') as HTMLElement;
            if (header) header.innerHTML = `Attached Documents (${docs.length})`;
        }
        
        showNotification(`Document "${docName}" deleted successfully`);
    }
}

function setupUploadHandlers(modal: HTMLElement, taskRow: HTMLTableRowElement): void {
    const dropArea = document.getElementById('dropArea') as HTMLElement;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const filesContainer = document.getElementById('filesContainer') as HTMLElement;
    const selectedFilesList = document.getElementById('selectedFilesList') as HTMLElement;
    const uploadBtn = document.getElementById('uploadSelectedBtn') as HTMLButtonElement;
    const browseBtn = document.getElementById('browseFileBtn') as HTMLButtonElement;
    
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;
    
    let selectedFiles: File[] = [];
    
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e: Event) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    dropArea.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.backgroundColor = '';
    });
    
    dropArea.addEventListener('dragleave', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
    });
    
    dropArea.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
        const files = Array.from(e.dataTransfer?.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    function updateSelectedFilesList(): void {
        if (selectedFiles.length === 0) {
            selectedFilesList.style.display = 'none';
            uploadBtn.style.display = 'none';
            return;
        }
        
        selectedFilesList.style.display = 'block';
        uploadBtn.style.display = 'inline-block';
        
        filesContainer.innerHTML = selectedFiles.map((file, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid ;">
                <span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button class="remove-file" data-index="${index}" style="background:none; border:none; color:#dc3545; cursor:pointer;">✕</button>
            </div>
        `).join('');
        
        filesContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e: Event) => {
                const target = e.target as HTMLElement;
                const index = parseInt(target.getAttribute('data-index') || '0');
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
        
        // Use the taskRow that was passed to the function
        const currentTaskRow = taskRow || (window as any).currentTaskRow;
        if (!currentTaskRow) {
            alert('Error: Task not found');
            return;
        }
        
        // Get the task/subtask ID
        const taskId = currentTaskRow.dataset.taskId || currentTaskRow.dataset.subtaskId;
        if (!taskId) {
            console.error('No ID found for row, generating one...');
            // Generate a new ID if none exists
            const newId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            if (currentTaskRow.classList.contains('task-row')) {
                currentTaskRow.dataset.taskId = newId;
                // Update task in tasks array
                const task = tasks.find(t => t.row === currentTaskRow);
                if (task) task.id = newId;
            } else {
                currentTaskRow.dataset.subtaskId = newId;
                // Update subtask in subtasks array
                const subtask = subtasks.find(s => s.row === currentTaskRow);
                if (subtask) subtask.id = newId;
            }
        }
        
        const docs: DocumentFile[] = selectedFiles.map(file => ({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date()
        }));
        
        console.log('Uploading CDoc documents:', docs.length, 'to row:', currentTaskRow, 'ID:', taskId);
        
        // Get existing docs and add new ones
        const existingDocs = taskDocuments.get(currentTaskRow) || [];
        const updatedDocs = [...existingDocs, ...docs];
        
        // Save to Map
        taskDocuments.set(currentTaskRow, updatedDocs);
        
        // Also save by ID for backup
        if (taskId) {
            taskDocuments.set(taskId, updatedDocs);
        }
        
        console.log('CDoc Map now has:', taskDocuments.get(currentTaskRow)?.length, 'docs');
        
        // Update the CDoc column
        updateCDocColumn();
        
        // Clear selection
        selectedFiles = [];
        updateSelectedFilesList();
        fileInput.value = '';
        
        // Update modal list if open
        const listContainer = document.getElementById('documentsListContainer') as HTMLElement;
        if (listContainer) {
            listContainer.innerHTML = renderDocumentsList(updatedDocs, currentTaskRow);
            attachDocumentEventListeners(currentTaskRow);
        }
        
        const countSpan = document.getElementById('docCount') as HTMLElement;
        if (countSpan) countSpan.textContent = updatedDocs.length.toString();
        
        showNotification(`${docs.length} file(s) uploaded successfully`);
        
        // CRITICAL: Save immediately after upload
        console.log('Auto-saving after CDoc upload...');
        saveAllData();
    });
}

// Column visibility save/load functions
function saveColumnVisibility(): void {
    const visibilityState: { [key: string]: boolean } = {};
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
            const visibilityState = JSON.parse(saved) as { [key: string]: boolean };
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

function previewDocument(doc: DocumentFile): void {
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (!previewWindow) return;
    
    previewWindow.document.write(`
        <html>
        <head>
            <title>${doc.name}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; background: #f5f5f5; margin: 0; }
                .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; }
                .doc-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid; }
                .doc-icon { font-size: 48px; }
                .doc-title { font-size: 24px; font-weight: bold; color: ; }
                .doc-meta { background: ; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
                .meta-row { display: flex; margin-bottom: 10px; }
                .meta-label { width: 120px; color: ; }
                .meta-value { color: #333; font-weight: 500; }
                .preview-placeholder { border: 2px dashed #ddd; padding: 60px; text-align: center; border-radius: 8px; }
                .preview-icon { font-size: 64px; margin-bottom: 20px; color: #999; }
                .preview-text { color: #999; font-size: 16px; }
            </style>
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
                        <span class="meta-value">${doc.uploadDate.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="preview-placeholder">
                    <div class="preview-icon">📋</div>
                    <div class="preview-text">Preview not available for this file type</div>
                    <div style="margin-top: 20px; color: #999; font-size: 14px;">The file would open in its native application</div>
                </div>
            </div>
        </body>
        </html>
    `);
}




// ================================
// STATUS CHANGE FUNCTIONS
// ================================

function makeStatusEditable(): void {
    tasks.forEach(task => {
        const statusCell = task.statusBadge.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        statusCell.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            showStatusChangeModal(task);
        });
    });
    
    subtasks.forEach(subtask => {
        const statusCell = subtask.statusBadge.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        statusCell.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            showSubtaskStatusChangeModal(subtask);
        });
    });
}

// ================================
// FIXED STATUS CHANGE MODAL WITH EXTRA COLUMN UPDATE
// ================================

function showStatusChangeModal(task: Task): void {
    console.log('Opening status modal for task:', task);
    
    // Store the current task globally
    (window as any).currentTaskForStatus = task;
    
    // Create modal HTML
    const modalHtml = `
        <div id="statusChangeModal" class="modal" style="display: block; z-index: 10000;">
            <div class="modal-content" style="width: 350px; position: relative; z-index: 10001;">
                <span class="close" style="position: absolute; right: 10px; top: 5px; font-size: 24px; cursor: pointer;">&times;</span>
                <h3 style="color: ; margin-top: 0;">Change Status</h3>
                
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Current Status</label>
                        <div id="currentStatusDisplay" style="padding: 8px; background:; border-radius: 4px;">${task.statusBadge.innerText}</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">New Status</label>
                        <select id="newStatusSelect" >
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
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Comment (Optional)</label>
                        <textarea id="statusComment" rows="3"  placeholder="Add comment..."></textarea>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="cancelStatusBtn" style="padding: 8px 16px; background:; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button id="updateStatusBtn" style="padding: 8px 16px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer;">Update Status</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove any existing modal
    const existingModal = document.getElementById('statusChangeModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Get modal element
    const modal = document.getElementById('statusChangeModal') as HTMLElement;
    
    // Set current status in dropdown
    const select = document.getElementById('newStatusSelect') as HTMLSelectElement;
    const currentStatus = task.statusBadge.innerText;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    
    // Close button handler
    const closeBtn = modal.querySelector('.close') as HTMLElement;
    closeBtn.onclick = function() {
        modal.remove();
        (window as any).currentTaskForStatus = null;
    };
    
    // Cancel button handler
    const cancelBtn = document.getElementById('cancelStatusBtn') as HTMLButtonElement;
    cancelBtn.onclick = function() {
        modal.remove();
        (window as any).currentTaskForStatus = null;
    };
    
    // Update button handler - FIXED VERSION
    const updateBtn = document.getElementById('updateStatusBtn') as HTMLButtonElement;
    updateBtn.onclick = function() {
        console.log('Update button clicked!');
        
        const newStatus = (document.getElementById('newStatusSelect') as HTMLSelectElement).value;
        const comment = (document.getElementById('statusComment') as HTMLTextAreaElement).value;
        
        console.log('New status selected:', newStatus);
        
        if ((window as any).currentTaskForStatus) {
            // Update the status
            const task = (window as any).currentTaskForStatus as Task;
            const oldStatus = task.statusBadge.innerText;
            
            // Change the main status badge
            task.statusBadge.innerText = newStatus;
            task.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
            
            // Update task object
            if (task.status !== undefined) {
                task.status = newStatus;
            }
            if (task.taskStatus !== undefined) {
                task.taskStatus = newStatus;
            }
            
            // FIX: Update the Task Status column (extra cell)
            updateTaskStatusExtraColumn(task.row, newStatus);
            
            // Update counts
            updateCounts();
            
            // Show notification
            showNotification(`Status changed from ${oldStatus} to ${newStatus}`);
            
            console.log('Status updated successfully');
        }
        
        // Remove modal
        modal.remove();
        (window as any).currentTaskForStatus = null;
    };
    
    // Click outside to close
    window.onclick = function(event: MouseEvent) {
        if (event.target === modal) {
            modal.remove();
            (window as any).currentTaskForStatus = null;
        }
    };
}

// Helper function to update the Task Status extra column
function updateTaskStatusExtraColumn(row: HTMLTableRowElement, newStatus: string): void {
    if (!row) return;
    
    // Find all extra cells in this row
    const extraCells = row.querySelectorAll('.extra-cell');
    
    extraCells.forEach(cell => {
        const columnKey = (cell as HTMLElement).getAttribute('data-column');
        if (columnKey === 'taskStatus') {
            // Update the cell text
            cell.textContent = newStatus;
            
            // Add visual feedback
            (cell as HTMLElement).style.backgroundColor = '#e8f5e9';
            (cell as HTMLElement).style.transition = 'background-color 0.5s';
            
            // Remove highlight after animation
            setTimeout(() => {
                (cell as HTMLElement).style.backgroundColor = '';
            }, 500);
            
            console.log('Task Status column updated to:', newStatus);
        }
    });
}

// For subtasks
function showSubtaskStatusChangeModal(subtask: Subtask): void {
    console.log('Opening status modal for subtask:', subtask);
    
    // Store the current subtask globally
    (window as any).currentSubtaskForStatus = subtask;
    
    // Create modal HTML
    const modalHtml = `
        <div id="statusChangeModal" class="modal" style="display: block; z-index: 10000;">
            <div class="modal-content" style="width: 350px; position: relative; z-index: 10001;">
                <span class="close" style="position: absolute; right: 10px; top: 5px; font-size: 24px; cursor: pointer;">&times;</span>
                <h3 style="color: ; margin-top: 0;">Change Subtask Status</h3>
                
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Current Status</label>
                        <div id="currentStatusDisplay" style="padding: 8px; background:; border-radius: 4px;">${subtask.statusBadge.innerText}</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">New Status</label>
                        <select id="newStatusSelect" >
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
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Comment (Optional)</label>
                        <textarea id="statusComment" rows="3"  placeholder="Add comment..."></textarea>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="cancelStatusBtn" style="padding: 8px 16px; background:; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button id="updateStatusBtn" style="padding: 8px 16px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer;">Update Status</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove any existing modal
    const existingModal = document.getElementById('statusChangeModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Get modal element
    const modal = document.getElementById('statusChangeModal') as HTMLElement;
    
    // Set current status in dropdown
    const select = document.getElementById('newStatusSelect') as HTMLSelectElement;
    const currentStatus = subtask.statusBadge.innerText;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    
    // Close button handler
    const closeBtn = modal.querySelector('.close') as HTMLElement;
    closeBtn.onclick = function() {
        modal.remove();
        (window as any).currentSubtaskForStatus = null;
    };
    
    // Cancel button handler
    const cancelBtn = document.getElementById('cancelStatusBtn') as HTMLButtonElement;
    cancelBtn.onclick = function() {
        modal.remove();
        (window as any).currentSubtaskForStatus = null;
    };
    
    // Update button handler
    const updateBtn = document.getElementById('updateStatusBtn') as HTMLButtonElement;
    updateBtn.onclick = function() {
        console.log('Update subtask button clicked!');
        
        const newStatus = (document.getElementById('newStatusSelect') as HTMLSelectElement).value;
        const comment = (document.getElementById('statusComment') as HTMLTextAreaElement).value;
        
        if ((window as any).currentSubtaskForStatus) {
            const subtask = (window as any).currentSubtaskForStatus as Subtask;
            const oldStatus = subtask.statusBadge.innerText;
            
            subtask.statusBadge.innerText = newStatus;
            subtask.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
            
            // Update taskStatus in subtask object if it exists
            if (subtask.taskStatus !== undefined) {
                subtask.taskStatus = newStatus;
            }
            
            // FIX: Update the Task Status column for subtask
            updateTaskStatusExtraColumn(subtask.row, newStatus);
            
            updateCounts();
            showNotification(`Subtask status changed to ${newStatus}`);
        }
        
        modal.remove();
        (window as any).currentSubtaskForStatus = null;
    };
    
    // Click outside to close
    window.onclick = function(event: MouseEvent) {
        if (event.target === modal) {
            modal.remove();
            (window as any).currentSubtaskForStatus = null;
        }
    };
}

// Function to sync status between main badge and extra column for all tasks
function syncAllTaskStatusColumns(): void {
    console.log('Syncing all task status columns...');
    
    // Sync tasks
    tasks.forEach(task => {
        if (task.row && task.statusBadge) {
            const currentStatus = task.statusBadge.innerText;
            updateTaskStatusExtraColumn(task.row, currentStatus);
            
            // Update task object
            if (task.status !== undefined) {
                task.status = currentStatus;
            }
            if (task.taskStatus !== undefined) {
                task.taskStatus = currentStatus;
            }
        }
    });
    
    // Sync subtasks
    subtasks.forEach(subtask => {
        if (subtask.row && subtask.statusBadge) {
            const currentStatus = subtask.statusBadge.innerText;
            updateTaskStatusExtraColumn(subtask.row, currentStatus);
        }
    });
    
    console.log('Status sync complete');
}

// Call this function after data is loaded and whenever status changes
// Add this to your initialization
function initializeStatusSync(): void {
    // Initial sync
    setTimeout(() => {
        syncAllTaskStatusColumns();
    }, 1000);
    
    // Observe for any status changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                // Debounce the sync
                clearTimeout((window as any).statusSyncTimeout);
                (window as any).statusSyncTimeout = setTimeout(() => {
                    syncAllTaskStatusColumns();
                }, 200);
            }
        });
    });
    
    // Observe the tbody for changes
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



function initializeStatus(): void {
    makeStatusEditable();
}

function updateTaskStatus(task: Task, newStatus: string, comment: string): void {
    const oldStatus = task.statusBadge.innerText;
    
    task.statusBadge.innerText = newStatus;
    task.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
    
    addStatusChangeComment(task.row, oldStatus, newStatus, comment);
    updateCounts();
    showNotification(`Status changed from ${oldStatus} to ${newStatus}`);
}

function updateSubtaskStatus(subtask: Subtask, newStatus: string, comment: string): void {
    const oldStatus = subtask.statusBadge.innerText;
    
    subtask.statusBadge.innerText = newStatus;
    subtask.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
    
    addStatusChangeComment(subtask.row, oldStatus, newStatus, comment);
    updateCounts();
    showNotification(`Subtask status changed from ${oldStatus} to ${newStatus}`);
}

function addStatusChangeComment(row: HTMLTableRowElement, oldStatus: string, newStatus: string, comment: string): void {
    const statusHistory = row.getAttribute('data-status-history') || '';
    const newEntry = `${new Date().toLocaleString()}: ${oldStatus} → ${newStatus}${comment ? ' - ' + comment : ''}`;
    row.setAttribute('data-status-history', statusHistory ? statusHistory + '|' + newEntry : newEntry);
}

// ================================
// DRAG AND DROP FUNCTIONS
// ================================

function makeRowDraggable(row: HTMLTableRowElement, type: 'task' | 'subtask'): void {
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
    const row = e.currentTarget as HTMLTableRowElement;
    
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
    const row = e.currentTarget as HTMLTableRowElement;
    row.classList.remove('skystemtaskmaster-dragging');
    
    document.querySelectorAll('tr').forEach(tr => {
        tr.classList.remove('skystemtaskmaster-drag-over', 'skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
    });
    
    draggedItem = null;
}

function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    
    const targetRow = e.currentTarget as HTMLTableRowElement;
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
    const targetRow = e.currentTarget as HTMLTableRowElement;
    targetRow.classList.remove('skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
}

function handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    
    const targetRow = e.currentTarget as HTMLTableRowElement;
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
    
    const tbody = targetRow.parentNode as HTMLTableSectionElement;
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

function getItemIndex(row: HTMLTableRowElement, type: 'task' | 'subtask'): number {
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
    const tbody = document.querySelector('tbody') as HTMLTableSectionElement;
    if (!tbody) return;
    
    const allRows = Array.from(tbody.querySelectorAll('tr')) as HTMLTableRowElement[];
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

function updateSubtasksOrder(): void {
    const tbody = document.querySelector('tbody') as HTMLTableSectionElement;
    if (!tbody) return;
    
    const allRows = Array.from(tbody.querySelectorAll('tr')) as HTMLTableRowElement[];
    const subtaskRows = allRows.filter(row => row.classList.contains('subtask-row'));
    
    subtasks.sort((a, b) => {
        const aIndex = subtaskRows.indexOf(a.row);
        const bIndex = subtaskRows.indexOf(b.row);
        return aIndex - bIndex;
    });
}

function saveTaskOrder(): void {
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
function makeOwnerReviewerClickable(): void {
    tasks.forEach(task => {
        const ownerCell = task.row.cells[5] as HTMLElement;
        const reviewerCell = task.row.cells[6] as HTMLElement;
        if (ownerCell) makeCellClickable(ownerCell, 'owner', task);
        if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', task);
    });
    
    subtasks.forEach(subtask => {
        const ownerCell = subtask.ownerCell as HTMLElement;
        const reviewerCell = subtask.reviewerCell as HTMLElement;
        if (ownerCell) makeCellClickable(ownerCell, 'owner', subtask);
        if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', subtask);
    });
}

function makeCellClickable(cell: HTMLElement, type: string, item: Task | Subtask): void {
    const oldCell = cell.cloneNode(true) as HTMLElement;
    if (cell.parentNode) {
        cell.parentNode.replaceChild(oldCell, cell);
        cell = oldCell;
    }
    
    cell.style.cursor = 'pointer';
    cell.title = `Click to change ${type}`;
    
    cell.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        showUserModal(cell, type, item);
    });
    
    cell.addEventListener('mouseenter', () => {
        cell.style.backgroundColor = '';
        cell.style.borderRadius = '4px';
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = '';
    });
}

function showUserModal(cell: HTMLElement, type: string, item: Task | Subtask): void {
    const badge = cell.querySelector('.skystemtaskmaster-badge') as HTMLElement;
    const currentInitials = badge ? badge.textContent?.trim() || '' : '';
    
    let modal = document.getElementById('userSelectionModal') as HTMLElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'userSelectionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="width: 400px;">
                <span class="close">&times;</span>
                <h3 style="color: ; margin-bottom: 15px;">Select ${type === 'owner' ? 'Owner' : 'Reviewer'}</h3>
                
                <div style="position: relative; margin-bottom: 15px;">
                    <input type="text" id="userSearch" placeholder="Search by name or initials..." 
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px;">
                </div>
                
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid ; border-radius: 4px;" id="userList"></div>
                
                <div style="display: flex; justify-content: flex-end; margin-top: 15px; gap: 10px;">
                    <button id="unassignUserBtn" style="padding: 8px 16px; background:; border: none; border-radius: 4px; cursor: pointer;">Unassign</button>
                    <button id="closeUserModal" style="padding: 8px 16px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        (document.getElementById('closeUserModal') as HTMLButtonElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        const searchInput = document.getElementById('userSearch') as HTMLInputElement;
        searchInput.addEventListener('keyup', () => {
            updateUserList(searchInput.value, currentInitials, type, cell, item);
        });
        
        (document.getElementById('unassignUserBtn') as HTMLButtonElement).addEventListener('click', () => {
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

function updateUserList(searchText: string, currentInitials: string, type: string, cell: HTMLElement, item: Task | Subtask): void {
    const userList = document.getElementById('userList') as HTMLElement;
    if (!userList) return;
    
    const filtered = availableUsers.filter(user => {
        const searchLower = searchText.toLowerCase();
        return user.name.toLowerCase().indexOf(searchLower) !== -1 ||
               user.initials.toLowerCase().indexOf(searchLower) !== -1 ||
               user.email.toLowerCase().indexOf(searchLower) !== -1;
    });
    
    if (filtered.length === 0) {
        userList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No users found</div>';
        return;
    }
    
    userList.innerHTML = filtered.map(user => {
        const isCurrent = user.initials === currentInitials;
        return `
            <div class="user-item" data-user='${JSON.stringify(user)}' 
                 style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid ; cursor: pointer; ${isCurrent ? 'background-color: ;' : ''}">
                <span class="skystemtaskmaster-badge skystemtaskmaster-badge-${user.initials.toLowerCase()}" 
                      style="width: 32px; height: 32px; line-height: 32px;">${user.initials}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${user.name}</div>
                    <div style="font-size: 12px; color: ;">${user.email} • ${user.role}</div>
                </div>
                ${isCurrent ? '<span style="color: ;">✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    userList.querySelectorAll('.user-item').forEach(el => {
        el.addEventListener('click', () => {
            const userData = (el as HTMLElement).getAttribute('data-user');
            if (userData) {
                const user = JSON.parse(userData) as User;
                assignUser(cell, user, type, item);
                (document.getElementById('userSelectionModal') as HTMLElement).style.display = 'none';
            }
        });
    });
}

function assignUser(cell: HTMLElement, user: User, type: string, item: Task | Subtask): void {
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
                    const oldCell = row.cells[5] as HTMLElement;
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
                    const oldCell = row.cells[6] as HTMLElement;
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
        const subtaskItem = item as Subtask;
        if (type === 'owner') {
            for (let i = 0; i < subtasks.length; i++) {
                if (subtasks[i].row === subtaskItem.row) {
                    subtasks[i].ownerCell = cell;
                    break;
                }
            }
        } else {
            for (let i = 0; i < subtasks.length; i++) {
                if (subtasks[i].row === subtaskItem.row) {
                    subtasks[i].reviewerCell = cell;
                    break;
                }
            }
        }
    }
    
    showNotification(`Assigned ${user.name} as ${type}`);
}

function unassignUser(cell: HTMLElement, type: string, item: Task | Subtask): void {
    cell.innerHTML = '';
    
    const emptySpan = document.createElement('span');
    emptySpan.style.cssText = `
      
    `;
    emptySpan.textContent = '?';
    emptySpan.title = 'Click to assign';
    cell.appendChild(emptySpan);
    
    makeCellClickable(cell, type, item);
    showNotification(`${type} unassigned`);
}

function updateExistingBadges(): void {
    tasks.forEach(task => {
        const ownerBadge = task.row.cells[5]?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
        const reviewerBadge = task.row.cells[6]?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
        
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
        const ownerBadge = subtask.ownerCell?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
        const reviewerBadge = subtask.reviewerCell?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
        
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
    updateExistingBadges();
    setTimeout(() => {
        makeOwnerReviewerClickable();
        console.log('User system ready');
    }, 500);
}

// ================================
// COMMENT FUNCTIONS
// ================================

// Initialize comments
function initializeComments(): void {
    console.log('Initializing comments...');
    
    setTimeout(() => {
        updateCommentColumn();
    }, 500);
}

// Update comment column
function updateCommentColumn(): void {
    // Update tasks
    tasks.forEach(task => {
        if (task.row) updateCommentCellForRow(task.row, task, 'task');
    });
    
    // Update subtasks
    subtasks.forEach(subtask => {
        if (subtask.row) updateCommentCellForRow(subtask.row, subtask, 'subtask');
    });
}

// Update comment cell for a specific row
function updateCommentCellForRow(row: HTMLTableRowElement, item: Task | Subtask, type: string): void {
    if (!row) return;
    
    const commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    
    commentCells.forEach(cell => {
        cell.innerHTML = '';
        (cell as HTMLElement).style.cursor = 'pointer';
        (cell as HTMLElement).style.textAlign = 'center';
        (cell as HTMLElement).style.padding = '4px 8px';
        
        // Get row ID
        let rowId = type === 'task' ? 
            ((row as HTMLTableRowElement).dataset.taskId || (item as Task).id) : 
            ((row as HTMLTableRowElement).dataset.subtaskId || (item as Subtask).id);
        
        if (!rowId) {
            rowId = type === 'task' ? 
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) : 
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            if (type === 'task') {
                row.dataset.taskId = rowId;
                if (item) (item as Task).id = rowId;
            } else {
                row.dataset.subtaskId = rowId;
                if (item) (item as Subtask).id = rowId;
            }
        }
        
        const commentKey = getCommentKey(rowId, type);
        const comments = taskComments[commentKey] || [];
        const count = comments.length;
        
        const iconContainer = document.createElement('div');
        iconContainer.style.display = 'inline-block';
        iconContainer.style.position = 'relative';
        iconContainer.style.cursor = 'pointer';
        
        const icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = count > 0 ? `${count} comment${count > 1 ? 's' : ''}` : 'Add comment';
        icon.style.fontSize = '18px';
        icon.style.opacity = count > 0 ? '1' : '0.6';
        icon.style.transition = 'all 0.2s';
        
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            badge.textContent = count.toString();
            badge.style.cssText = `
               
            `;
            iconContainer.appendChild(icon);
            iconContainer.appendChild(badge);
        } else {
            iconContainer.appendChild(icon);
        }
        
        cell.appendChild(iconContainer);
        
        // Hover effects
        iconContainer.addEventListener('mouseenter', () => {
            icon.style.opacity = '1';
            icon.style.transform = 'scale(1.1)';
        });
        
        iconContainer.addEventListener('mouseleave', () => {
            icon.style.opacity = count > 0 ? '1' : '0.6';
            icon.style.transform = 'scale(1)';
        });
        
        // Click handler
        iconContainer.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            openCommentPanel(rowId, type);
        });
    });
}

// Create comment panel
function createCommentPanel(): HTMLElement {
    let panel = document.getElementById('commentPanel') as HTMLElement;
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
    
    // Close panel button
    (panel.querySelector('.close-panel') as HTMLElement).addEventListener('click', () => {
        panel.classList.remove('open');
        activeCommentRowId = null;
        activeCommentType = null;
        cancelEdit();
    });
    
    // Post button click handler
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
            // Update existing comment
            updateComment(commentKey, editingCommentId, text);
        } else {
            // Create new comment
            const comments = taskComments[commentKey] || [];
            
            // FIXED: Use TaskComment instead of Comment
           const newComment: TaskComment = {  // Now this will work
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
    
    // Enter key to post (Ctrl+Enter)
    textarea.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            postBtn.click();
        } else if (e.key === 'Escape' && editingCommentId) {
            cancelEdit();
        }
    });
    
    return panel;
}
// Open comment panel
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

// Render comments
function renderComments(commentKey: string): void {
    const panel = document.getElementById('commentPanel') as HTMLElement;
    if (!panel) return;
    
    const list = panel.querySelector('.comment-list') as HTMLElement;
    if (!list) return;
    
    const comments = taskComments[commentKey] || [];
    
    if (comments.length === 0) {
        list.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        return;
    }
    
    const sortedComments = [...comments].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    list.innerHTML = sortedComments.map(c => {
        const timestamp = new Date(c.timestamp);
        const formattedDate = formatCommentDate(timestamp);
        const formattedTime = formatCommentTime(timestamp);
        
        return `
            <div class="comment-item ${c.id === editingCommentId ? 'editing' : ''}" data-comment-id="${c.id}">
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
                    <button class="edit-comment" data-id="${c.id}">Edit</button>
                    <button class="delete-comment" data-id="${c.id}">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Attach event listeners
    list.querySelectorAll('.edit-comment').forEach(btn => {
        btn.addEventListener('click', () => {
            const commentId = (btn as HTMLElement).dataset.id;
            if (commentId) startEditComment(commentKey, commentId);
        });
    });
    
    list.querySelectorAll('.delete-comment').forEach(btn => {
        btn.addEventListener('click', () => {
            const commentId = (btn as HTMLElement).dataset.id;
            if (commentId) deleteComment(commentKey, commentId);
        });
    });
}

// Helper functions
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
    const names: { [key: string]: string } = {
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

function getUserColor(initials: string): string {
    const colors: { [key: string]: string } = {
        'PK': '',
        'SM': '',
        'MP': '#9c27b0',
        'PP': '#ff9800',
        'JS': '#4caf50',
        'EW': '#f44336',
        'DB': '#795548'
    };
    return colors[initials] || '#999';
}

function escapeHtml(unsafe: string): string {
    return unsafe.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

function cancelEdit(): void {
    editingCommentId = null;
    const panel = document.getElementById('commentPanel') as HTMLElement;
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
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    editingCommentId = commentId;
    
    const panel = document.getElementById('commentPanel') as HTMLElement;
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
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    comment.text = newText;
    comment.edited = true;
    comment.timestamp = new Date().toISOString();
    
    taskComments[commentKey] = comments;
    editingCommentId = null;
    
    const panel = document.getElementById('commentPanel') as HTMLElement;
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



function ensureAllTasksHaveIds(): void {
    console.log('Ensuring all tasks and subtasks have IDs...');
    
    // Check tasks
    tasks.forEach((task, index) => {
        if (!task.id) {
            task.id = 'task_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5);
        }
        
        if (task.row && !task.row.dataset.taskId) {
            task.row.dataset.taskId = task.id;
        }
    });
    
    // Check subtasks
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

function attachCommentEventListeners(list: HTMLElement, commentKey: string): void {
    // Edit buttons
    list.querySelectorAll('.edit-comment').forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLElement;
            const commentId = target.dataset.id;
            if (commentId) startEditComment(commentKey, commentId);
        });
    });
    
    // Delete buttons
    list.querySelectorAll('.delete-comment').forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLElement;
            const commentId = target.dataset.id;
            if (commentId) deleteComment(commentKey, commentId);
        });
    });
}

function updateCommentIcon(rowId: string, type: string): void {
    const commentKey = getCommentKey(rowId, type);
    const comments = taskComments[commentKey] || [];
    const count = comments.length;
    
    // Find the comment icon for this row
    let selector = '';
    if (type === 'task') {
        selector = `tr[data-task-id="${rowId}"] .comment-icon`;
    } else {
        selector = `tr[data-subtask-id="${rowId}"] .comment-icon`;
    }
    
    const icon = document.querySelector(selector) as HTMLElement;
    if (icon) {
        if (count > 0) {
            icon.setAttribute('data-count', count.toString());
            icon.classList.add('has-comments');
            icon.title = `${count} comment${count > 1 ? 's' : ''}`;
        } else {
            icon.removeAttribute('data-count');
            icon.classList.remove('has-comments');
            icon.title = 'Add comment';
        }
    }
}

function addCommentIcons(): void {
    // We'll add the comment functionality to the Comment column instead
    updateCommentColumn();
}

function makeCellEditable(cell: HTMLElement, task: Task, fieldName: string): void {
    if (!cell) return;
    
    // Don't make already editable cells again
    if (cell.classList.contains('editable-field')) return;
    
    cell.classList.add('editable-field');
    cell.style.cursor = 'pointer';
    cell.title = `Click to edit ${fieldName}`;
    
    // Store original value
    let originalValue = cell.innerText.trim();
    
    cell.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        
        // Don't open editor if already editing
        if (cell.classList.contains('editing-mode')) return;
        
        // For fields with badges (owner, reviewer, status)
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
            // Days is calculated field, maybe not editable
            showNotification('Days is auto-calculated from Due Date');
        }
        else {
            // For any other text field
            showInlineEditor(cell, task, fieldName);
        }
    });
    
    // Hover effect
    cell.addEventListener('mouseenter', () => {
        if (!cell.classList.contains('editing-mode')) {
            cell.style.backgroundColor = '';
            cell.style.borderRadius = '4px';
        }
    });
    
    cell.addEventListener('mouseleave', () => {
        if (!cell.classList.contains('editing-mode')) {
            cell.style.backgroundColor = '';
        }
    });
}

// Placeholder functions for the editors (to be implemented if needed)
function showUserSelector(cell: HTMLElement, task: Task, fieldName: string): void {
    // Implementation for user selector
    showUserModal(cell, fieldName, task);
}

function showStatusSelector(cell: HTMLElement, task: Task): void {
    showStatusChangeModal(task);
}

function showDatePicker(cell: HTMLElement, task: Task): void {
    // Simple implementation - you can enhance this
    const currentDate = cell.textContent?.trim() || '';
    const newDate = prompt('Enter new due date (YYYY-MM-DD):', currentDate);
    if (newDate) {
        cell.textContent = newDate;
        calculateDays();
    }
}

function showTextEditor(cell: HTMLElement, task: Task, fieldName: string): void {
    const currentValue = cell.textContent?.trim() || '';
    const newValue = prompt(`Enter new ${fieldName}:`, currentValue);
    if (newValue !== null) {
        cell.textContent = newValue;
        if (fieldName === 'tdoc' || fieldName === 'cdoc') {
            // Update task object
            if (fieldName === 'tdoc') task.tdoc = newValue;
            if (fieldName === 'cdoc') task.cdoc = newValue;
        }
    }
}

function showInlineEditor(cell: HTMLElement, task: Task, fieldName: string): void {
    const currentValue = cell.textContent?.trim() || '';
    const newValue = prompt(`Enter new ${fieldName}:`, currentValue);
    if (newValue !== null) {
        cell.textContent = newValue;
        // Update task object if property exists
        if (fieldName in task) {
            (task as any)[fieldName] = newValue;
        }
    }
}

// ================================
// ADD TASK EVENT LISTENERS
// ================================

function addTaskEventListeners(task: Task): void {
    const row = task.row;
    if (!row) return;
    
    // Status badge click handler
    const statusBadge = row.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
    
    if (statusBadge) {
        // Make the badge itself clickable
        statusBadge.style.cursor = 'pointer';
        statusBadge.title = 'Click to change status';
        
        // Remove any existing listeners by cloning
        const newBadge = statusBadge.cloneNode(true) as HTMLElement;
        if (statusBadge.parentNode) {
            statusBadge.parentNode.replaceChild(newBadge, statusBadge);
        }
        
        // Add new click handler
        newBadge.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Status badge clicked');
            showStatusChangeModal(task);
        });
        
        // Update the task object to point to the new badge
        task.statusBadge = newBadge;
    }
    
    // Owner badge click handler
    const ownerCell = row.cells[5] as HTMLElement;
    if (ownerCell) {
        const ownerBadge = ownerCell.querySelector('.skystemtaskmaster-badge') as HTMLElement;
        if (ownerBadge) {
            ownerBadge.style.cursor = 'pointer';
            ownerCell.style.cursor = 'pointer';
            
            ownerCell.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                showUserModal(ownerCell, 'owner', task);
            });
        }
    }
    
    // Reviewer badge click handler
    const reviewerCell = row.cells[6] as HTMLElement;
    if (reviewerCell) {
        const reviewerBadge = reviewerCell.querySelector('.skystemtaskmaster-badge') as HTMLElement;
        if (reviewerBadge) {
            reviewerBadge.style.cursor = 'pointer';
            reviewerCell.style.cursor = 'pointer';
            
            reviewerCell.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                showUserModal(reviewerCell, 'reviewer', task);
            });
        }
    }
    
    // Checkbox change handler
    const checkbox = row.querySelector('.task-checkbox') as HTMLInputElement;
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
    
    // Due date blur handler
    const dueDateCell = row.querySelector('.due-date') as HTMLElement;
    if (dueDateCell) {
        dueDateCell.addEventListener('blur', calculateDays);
    }
    
    // Comment icon click handler
    const commentIcon = row.querySelector('.comment-icon') as HTMLElement;
    if (commentIcon) {
        commentIcon.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            if (task.id) openCommentPanel(task.id, 'task');
        });
    }
    
    console.log('Event listeners added for task:', task.name);
}

// ================================
// CREATE MODALS
// ================================

function createModals(): void {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.innerHTML = `
        <div id="newTaskOptionsModal" class="modal">
            <div class="modal-content" style="width: 300px;">
                <span class="close">&times;</span>
                <h3>Create New</h3>
                <div style="margin-top:20px;">
                    <div style="position:relative;">
                        <button id="newTaskMainButton"
                            style="width:100%; padding:15px; background:; color:white; border:none; border-radius:8px; cursor:pointer; font-size:16px; display:flex; justify-content:space-between; align-items:center;">
                            <span>
                                <i class="fa-solid fa-clipboard-list"></i> New Task
                            </span>
                                <span class="dropdown-arrow">
                                 <i class="fa-solid fa-angle-down"></i>
                               </span>
                        </button>
                        
                        <div id="newTaskDropdown"
                            style="display:none; position:absolute; top:100%; left:0; width:100%; background:white; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.2); margin-top:5px; z-index:1000;">
                            <button id="newListOption"
                                style="width:100%; padding:12px; border:none; background:white; cursor:pointer; text-align:left; border-bottom:1px solid ;">
                                <span>
                                 <i class="fa-solid fa-list"></i> New List
                               </span>
                            </button>
                            <button id="importTasksOption"
                                style="width:100%; padding:12px; border:none; background:white; cursor:pointer; text-align:left;">
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
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Enter List Name</h3>
                <div style="margin-top: 20px;">
                    <input type="text" id="listNameInput" placeholder="Enter list name" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
                    <button id="createListBtn" style="background: ; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%;">Create List</button>
                </div>
            </div>
        </div>
        
        <!-- UPDATED IMPORT TASKS MODAL WITH FILE UPLOAD -->
        <div id="importTasksModal" class="modal">
            <div class="modal-content" style="width: 1000px; max-width: 90%;">
                <span class="close" style="position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer;">&times;</span>
                <h3 style="color: ; margin-bottom: 20px;">📥 Import Tasks from File</h3>
                
                <div style="margin: 20px 0;">
                    <!-- File Upload Area -->
                    <div style="margin-bottom: 25px; background: ; padding: 20px; border-radius: 8px; height:300px;">
                        <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">Upload File</h4>
                        
                        <div id="importDropArea" style="border: 2px dashed ; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 15px; cursor: pointer; transition: all 0.3s; background: ;">
                            <div style="font-size: 48px; margin-bottom: 10px;"><i class="fa-solid fa-folder-open"></i></div>
                            <div style="color: ; font-weight: 500; margin-bottom: 5px;">Drag & drop file here</div>
                            <div style="color: ; margin-bottom: 15px;">or</div>
                            <button id="importBrowseFileBtn" style="background: ; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;">Browse Files</button>
                            <input type="file" id="importFileInput" style="display: none;" accept=".csv,.json,.txt,.xlsx,.xls">
                        </div>
                        
                        <div style="font-size: 13px; color: ; padding: 10px; background: #fff; border-radius: 4px; border-left: 3px solid ;">
                            <strong>Supported formats:</strong> CSV, JSON, TXT (one task per line), Excel (.xlsx, .xls)
                        </div>
                    </div>
                    
                    <!-- Preview Area -->
                    <div id="importPreviewArea" style="display: none; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #333;">Preview Imported Tasks</h4>
                        <div>
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead style="background: #f5f5f5; position: sticky; top: 0;">
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
                    
                    <!-- Import Options -->
                    <div style="margin-bottom: 20px; padding: 15px; background: ; border-radius: 8px;">
                        <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">Import Options</h4>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="importTarget" value="newList" checked>
                                <span>Create New List with imported tasks</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 8px;">
                                <input type="radio" name="importTarget" value="currentList">
                                <span>Add to currently selected list</span>
                            </label>
                        </div>
                        
                        <div style="margin-bottom: 10px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="skipDuplicates" checked>
                                <span>Skip duplicate task names</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button id="cancelImportBtn" style="padding: 10px 20px; background:; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                    <button id="processImportBtn" style="padding: 10px 20px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;" disabled>Import Tasks</button>
                </div>
            </div>
        </div>
        
        <div id="addTaskModal" class="modal">
            <div class="modal-content" style="width: 500px;">
                <span class="close">&times;</span>
                <h3>Add New Task</h3>
                <div style="margin-top: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label>Task Name *</label>
                        <input type="text" id="addTaskName" placeholder="Enter task name"  autofocus>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label>Acc</label>
                            <input type="text" id="addTaskAcc" value="+" >
                        </div>
                        <div>
                            <label>TDoc</label>
                            <input type="text" id="addTaskTdoc" value="0" >
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label>Owner</label>
                            <select id="addTaskOwner" >
                                <option value="PK">PK (Palakh Khanna)</option>
                                <option value="SM">SM (Sarah Miller)</option>
                                <option value="MP">MP (Mel Preparer)</option>
                                <option value="PP">PP (Poppy Pan)</option>
                                <option value="JS">JS (John Smith)</option>
                                <option value="EW">EW (Emma Watson)</option>
                                <option value="DB">DB (David Brown)</option>
                            </select>
                        </div>
                        <div>
                            <label>Reviewer</label>
                            <select id="addTaskReviewer" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
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
                    
                    <div style="margin-bottom: 15px;">
                        <label>Due Date (optional)</label>
                        <input type="date" id="addTaskDueDate" >
                    </div>
                    
                    <button id="addTaskBtn" style="background: ; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px;">Add Task</button>
                </div>
            </div>
        </div>
        
        <div id="addSubtaskModal" class="modal">
            <div class="modal-content" style="width: 500px;">
                <span class="close">&times;</span>
                <h3>Add Subtask</h3>
                <div style="margin-top: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label>Subtask Name</label>
                        <input type="text" id="subtaskName" placeholder="Enter subtask name" >
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label>Status</label>
                        <select id="subtaskStatus" ">
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label>Owner</label>
                            <select id="subtaskOwner" ">
                                <option value="PK">PK</option>
                                <option value="SM">SM</option>
                            </select>
                        </div>
                        <div>
                            <label>Reviewer</label>
                            <select id="subtaskReviewer" ">
                                <option value="PK">PK</option>
                                <option value="SM">SM</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label>TDoc</label>
                        <input type="text" id="subtaskTdoc" value="" ">
                    </div>
                    
                    <button id="addSubtaskBtn" style="background: ; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%;">Add Subtask</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
}

// ================================
// INITIALIZE EVENT LISTENERS
// ================================

function initializeEventListeners(): void {
    const newTaskBtn = document.querySelector('.skystemtaskmaster-btn-new') as HTMLElement;
    const newTaskOptionsModal = document.getElementById('newTaskOptionsModal') as HTMLElement;
    const enterListNameModal = document.getElementById('enterListNameModal') as HTMLElement;
    const importTasksModal = document.getElementById('importTasksModal') as HTMLElement;
    const addTaskModal = document.getElementById('addTaskModal') as HTMLElement;
    const addSubtaskModal = document.getElementById('addSubtaskModal') as HTMLElement;
    
    if (newTaskBtn && newTaskOptionsModal) {
        newTaskBtn.addEventListener('click', () => {
            newTaskOptionsModal.style.display = 'block';
        });
    }
    
    // ===== NEW CODE: Toggle dropdown when New Task button is clicked =====
    const newTaskMainButton = document.getElementById('newTaskMainButton') as HTMLButtonElement;
    const newTaskDropdown = document.getElementById('newTaskDropdown') as HTMLElement;
    
    if (newTaskMainButton && newTaskDropdown) {
        newTaskMainButton.addEventListener('click', function(e: MouseEvent) {
            e.stopPropagation();
            newTaskDropdown.style.display = newTaskDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        if (newTaskDropdown) {
            newTaskDropdown.style.display = 'none';
        }
    });
    
    // Prevent dropdown from closing when clicking inside it
    if (newTaskDropdown) {
        newTaskDropdown.addEventListener('click', function(e: MouseEvent) {
            e.stopPropagation();
        });
    }
    // ===== END OF NEW CODE =====
    
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            newTaskOptionsModal.style.display = 'none';
            enterListNameModal.style.display = 'none';
            importTasksModal.style.display = 'none';
            addTaskModal.style.display = 'none';
            addSubtaskModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target === newTaskOptionsModal) newTaskOptionsModal.style.display = 'none';
        if (target === enterListNameModal) enterListNameModal.style.display = 'none';
        if (target === importTasksModal) importTasksModal.style.display = 'none';
        if (target === addTaskModal) addTaskModal.style.display = 'none';
        if (target === addSubtaskModal) addSubtaskModal.style.display = 'none';
    });
    
    const newListOption = document.getElementById('newListOption') as HTMLButtonElement;
    if (newListOption) {
        newListOption.addEventListener('click', () => {
            newTaskOptionsModal.style.display = 'none';
            enterListNameModal.style.display = 'block';
            if (newTaskDropdown) newTaskDropdown.style.display = 'none';
        });
    }
    
    const importTasksOption = document.getElementById('importTasksOption') as HTMLButtonElement;
    if (importTasksOption) {
        importTasksOption.addEventListener('click', () => {
            newTaskOptionsModal.style.display = 'none';
            importTasksModal.style.display = 'block';
            if (newTaskDropdown) newTaskDropdown.style.display = 'none';
        });
    }
    
    const createListBtn = document.getElementById('createListBtn') as HTMLButtonElement;
    const listNameInput = document.getElementById('listNameInput') as HTMLInputElement;
    
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
    
    const addTaskBtn = document.getElementById('addTaskBtn') as HTMLButtonElement;
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            const taskName = (document.getElementById('addTaskName') as HTMLInputElement).value.trim();
            if (!taskName) {
                alert('Please enter a task name');
                return;
            }
            
            if (subLists.length > 0) {
                createTask(subLists[subLists.length - 1], {
                    name: taskName,
                    acc: (document.getElementById('addTaskAcc') as HTMLInputElement).value || '+',
                    tdoc: (document.getElementById('addTaskTdoc') as HTMLInputElement).value || '0',
                    owner: (document.getElementById('addTaskOwner') as HTMLSelectElement).value,
                    reviewer: (document.getElementById('addTaskReviewer') as HTMLSelectElement).value,
                    dueDate: (document.getElementById('addTaskDueDate') as HTMLInputElement).value
                });
            } else {
                createNewTask(taskName, 
                    (document.getElementById('addTaskAcc') as HTMLInputElement).value || '+', 
                    (document.getElementById('addTaskTdoc') as HTMLInputElement).value || '0', 
                    (document.getElementById('addTaskOwner') as HTMLSelectElement).value, 
                    (document.getElementById('addTaskReviewer') as HTMLSelectElement).value, 
                    (document.getElementById('addTaskDueDate') as HTMLInputElement).value
                );
            }
            
            addTaskModal.style.display = 'none';
            (document.getElementById('addTaskName') as HTMLInputElement).value = '';
        });
    }
    
    const addSubtaskBtn = document.getElementById('addSubtaskBtn') as HTMLButtonElement;
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', createNewSubtask);
    }
    
    const taskPlus = document.querySelector('.task-plus') as HTMLElement;
    if (taskPlus) {
        taskPlus.addEventListener('click', () => {
            addTaskModal.style.display = 'block';
        });
    }
    
    const subtaskPlus = document.querySelector('.subtask-plus') as HTMLElement;
    if (subtaskPlus) {
        subtaskPlus.addEventListener('click', () => {
            addSubtaskModal.style.display = 'block';
        });
    }
    
    const importTaskBtn = document.getElementById('importTaskBtn') as HTMLButtonElement;
    if (importTaskBtn) {
        importTaskBtn.addEventListener('click', function() {
            const taskName = (document.getElementById('importTaskName') as HTMLInputElement).value;
            if (!taskName) {
                alert('Please enter task name');
                return;
            }
            
            if (subLists.length > 0) {
                createTask(subLists[subLists.length - 1], {
                    name: taskName,
                    acc: (document.getElementById('importAcc') as HTMLInputElement).value || '+',
                    tdoc: (document.getElementById('importTdoc') as HTMLInputElement).value || '0',
                    owner: (document.getElementById('importOwner') as HTMLSelectElement).value,
                    reviewer: (document.getElementById('importReviewer') as HTMLSelectElement).value,
                    dueDate: (document.getElementById('importDueDate') as HTMLInputElement).value
                });
            } else {
                createNewTask(taskName, 
                    (document.getElementById('importAcc') as HTMLInputElement).value || '+', 
                    (document.getElementById('importTdoc') as HTMLInputElement).value || '0', 
                    (document.getElementById('importOwner') as HTMLSelectElement).value, 
                    (document.getElementById('importReviewer') as HTMLSelectElement).value, 
                    (document.getElementById('importDueDate') as HTMLInputElement).value
                );
            }
            
            importTasksModal.style.display = 'none';
            showNotification('Task imported!');
        });
    }
    
    // Initialize 3-dot menu
    initializeThreeDotsMenu();
    
    const searchInput = document.querySelector(".skystemtaskmaster-search-bar") as HTMLInputElement;
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
    
    const taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown") as HTMLSelectElement;
    if (taskDropdown) {
        taskDropdown.addEventListener("change", () => {
            const filter = taskDropdown.value;
            tasks.forEach(task => {
                const ownerCell = task.row.cells[5] as HTMLElement;
                const reviewerCell = task.row.cells[6] as HTMLElement;
                const ownerBadge = ownerCell?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
                const reviewerBadge = reviewerCell?.querySelector('.skystemtaskmaster-badge') as HTMLElement;
                const ownerText = ownerBadge ? ownerBadge.textContent?.trim() || '' : '';
                const reviewerText = reviewerBadge ? reviewerBadge.textContent?.trim() || '' : '';
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
                const ownerBadge = subtask.ownerCell.querySelector('.skystemtaskmaster-badge') as HTMLElement;
                const reviewerBadge = subtask.reviewerCell.querySelector('.skystemtaskmaster-badge') as HTMLElement;
                const ownerText = ownerBadge ? ownerBadge.textContent?.trim() || '' : '';
                const reviewerText = reviewerBadge ? reviewerBadge.textContent?.trim() || '' : '';
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

// Add this function to style tasks based on recurrence type
// Note: addRecurrenceStyles is already defined above
// This comment is to avoid duplicate function

// ================================
// UPDATED CREATE TASK FUNCTION - WITH IMMEDIATE ICON DISPLAY
// ================================

function createTask(subList: SubList, taskData: any): Task {
    const task: Task = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        subListId: subList.id,
        name: taskData.name,
        acc: taskData.acc || '+',
        tdoc: taskData.tdoc || '0',
        owner: taskData.owner || 'PK',
        reviewer: taskData.reviewer || 'SM',
        dueDate: taskData.dueDate || '',
        status: taskData.status || 'Not Started',
        
        // ALL custom fields with proper values
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
        
        row: null as any,
        checkbox: null as any,
        statusBadge: null as any,
        dueDateCell: null as any,
        daysCell: null as any,
        taskNameCell: null as any
    };
    
    subList.tasks.push(task);
    tasks.push(task);
    
    // Create the row first
    createTaskRow(task, subList);
    
    // IMPORTANT: Immediately update document columns for this new row
    setTimeout(() => {
        if (task.row) {
            // Initialize empty document maps for this row
            taskDocuments.set(task.row, []);
            taskTDocDocuments.set(task.row, []);
            
            // Force update all columns for this specific row
            updateCDocColumnForRow(task.row);
            updateTDocColumnForRow(task.row);
            updateCommentColumnForRow(task.row, task, 'task');
        }
    }, 50); // Small delay to ensure row is fully in DOM
    
    showNotification(`Task "${taskData.name}" created`);
    return task;
}

// ================================
// HELPER FUNCTIONS TO UPDATE SINGLE ROWS
// ================================

function updateCDocColumnForRow(row: HTMLTableRowElement): void {
    if (!row) return;
    
    const cdocCell = row.cells[7] as HTMLElement;
    if (!cdocCell) return;
    
    cdocCell.innerHTML = '';
    cdocCell.style.textAlign = 'center';
    
    const docs = taskDocuments.get(row) || [];
    
    const iconContainer = document.createElement('span');
    iconContainer.className = 'cdoc-icon-container';
    iconContainer.style.cssText = `
        cursor: pointer;
        display: inline-block;
        position: relative;
        padding: 5px;
    `;
    
    const icon = document.createElement('i');
    icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
    icon.style.cssText = `
        font-size: 20px;
        color: ${docs.length > 0 ? '' : '#999'};
        transition: all 0.2s;
    `;
    
    if (docs.length === 0) {
        icon.style.opacity = '0.7';
        icon.title = 'Click to upload documents';
    } else {
        icon.title = `${docs.length} document(s) attached`;
    }
    
    iconContainer.appendChild(icon);
    
    if (docs.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'cdoc-badge';
        badge.textContent = docs.length.toString();
        badge.style.cssText = `
            
        `;
        iconContainer.appendChild(badge);
    } else {
        const plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle';
        plusIcon.style.cssText = `
           
        `;
        iconContainer.appendChild(plusIcon);
    }
    
    iconContainer.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        showDocumentManager(row);
    };
    
    iconContainer.onmouseenter = () => {
        icon.style.transform = 'scale(1.1)';
    };
    
    iconContainer.onmouseleave = () => {
        icon.style.transform = 'scale(1)';
    };
    
    cdocCell.appendChild(iconContainer);
}

function updateTDocColumnForRow(row: HTMLTableRowElement): void {
    if (!row) return;
    
    const tdocCell = row.cells[2] as HTMLElement;
    if (!tdocCell) return;
    
    tdocCell.innerHTML = '';
    tdocCell.style.textAlign = 'center';
    
    const docs = taskTDocDocuments.get(row) || [];
    
    const iconContainer = document.createElement('span');
    iconContainer.className = 'tdoc-icon-container';
    iconContainer.style.cssText = `
        cursor: pointer;
        display: inline-block;
        position: relative;
        padding: 5px;
    `;
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-file-alt';
    icon.style.cssText = `
        font-size: 20px;
        color: ${docs.length > 0 ? '' : '#999'};
        transition: all 0.2s;
    `;
    
    if (docs.length === 0) {
        icon.style.opacity = '0.7';
        icon.title = 'Click to upload documents';
    } else {
        icon.title = `${docs.length} document(s) attached`;
    }
    
    iconContainer.appendChild(icon);
    
    if (docs.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'tdoc-badge';
        badge.textContent = docs.length.toString();
        badge.style.cssText = `
           
        `;
        iconContainer.appendChild(badge);
    } else {
        const plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle';
        plusIcon.style.cssText = `
           
        `;
        iconContainer.appendChild(plusIcon);
    }
    
    iconContainer.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        showTDocDocumentManager(row);
    };
    
    iconContainer.onmouseenter = () => {
        icon.style.transform = 'scale(1.1)';
    };
    
    iconContainer.onmouseleave = () => {
        icon.style.transform = 'scale(1)';
    };
    
    tdocCell.appendChild(iconContainer);
}

function updateCommentColumnForRow(row: HTMLTableRowElement, item: Task | Subtask, type: string): void {
    if (!row) return;
    
    const commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    
    commentCells.forEach(cell => {
        cell.innerHTML = '';
        (cell as HTMLElement).style.cursor = 'pointer';
        (cell as HTMLElement).style.textAlign = 'center';
        (cell as HTMLElement).style.padding = '4px 8px';
        
        const rowId = type === 'task' ? 
            ((row as HTMLTableRowElement).dataset.taskId || (item as Task).id) : 
            ((row as HTMLTableRowElement).dataset.subtaskId || (item as Subtask).id);
        
        if (!rowId) return;
        
        const commentKey = getCommentKey(rowId, type);
        const comments = taskComments[commentKey] || [];
        const count = comments.length;
        
        const iconContainer = document.createElement('div');
        iconContainer.style.display = 'inline-block';
        iconContainer.style.position = 'relative';
        iconContainer.style.cursor = 'pointer';
        
        const icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = count > 0 ? `${count} comment${count > 1 ? 's' : ''}` : 'Add comment';
        icon.style.fontSize = '18px';
        icon.style.opacity = count > 0 ? '1' : '0.6';
        icon.style.transition = 'all 0.2s';
        
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            badge.textContent = count.toString();
            badge.style.cssText = `
               
            `;
            iconContainer.appendChild(icon);
            iconContainer.appendChild(badge);
        } else {
            iconContainer.appendChild(icon);
        }
        
        cell.appendChild(iconContainer);
        
        iconContainer.addEventListener('mouseenter', () => {
            icon.style.opacity = '1';
            icon.style.transform = 'scale(1.1)';
        });
        
        iconContainer.addEventListener('mouseleave', () => {
            icon.style.opacity = count > 0 ? '1' : '0.6';
            icon.style.transform = 'scale(1)';
        });
        
        iconContainer.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            openCommentPanel(rowId, type);
        });
    });
}

function updateRecurrenceClasses(): void {
    tasks.forEach(task => {
        if (task.row) {
            const recurrenceType = task.recurrenceType || 'None';
            
            const recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
            const isRecurring = recurringOptions.indexOf(recurrenceType) >= 0;
            
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
    const task = tasks.find(t => t.id === taskId || t.row.dataset.taskId === taskId);
    if (task) {
        const oldType = task.recurrenceType || 'None';
        task.recurrenceType = newRecurrenceType;
        
        // Update row class
        const isRecurring = newRecurrenceType !== 'None';
        task.row.classList.remove('recurring-task', 'non-recurring-task');
        
        if (isRecurring) {
            task.row.classList.add('recurring-task');
        } else {
            task.row.classList.add('non-recurring-task');
        }
        
        task.row.setAttribute('data-recurrence-type', newRecurrenceType);
        
        // Update the recurrence indicator text
        const nameDiv = task.row.cells[0].querySelector('.skystemtaskmaster-task-name') as HTMLElement;
        if (nameDiv) {
            let indicator = nameDiv.querySelector('.recurrence-indicator') as HTMLElement;
            if (indicator) {
                indicator.textContent = newRecurrenceType;
                indicator.style.background = isRecurring ? '' : '';
                indicator.title = `Recurrence: ${newRecurrenceType} (Click to change)`;
            } else {
                makeRecurrenceCellsClickable();
            }
        }
        
        console.log(`Task ${taskId} recurrence updated from ${oldType} to ${newRecurrenceType}`);
        showNotification(`Recurrence set to: ${newRecurrenceType}`);
        
        // Save changes
        setTimeout(() => saveAllData(), 100);
    }
}

function syncRecurrenceFromColumn(): void {
    tasks.forEach(task => {
        // Find the recurrence column cell
        const extraCells = task.row.querySelectorAll('.extra-cell');
        let recurrenceValue = 'None';
        
        extraCells.forEach(cell => {
            const colKey = (cell as HTMLElement).getAttribute('data-column');
            if (colKey === 'recurrenceType') {
                recurrenceValue = cell.textContent?.trim() || 'None';
            }
        });
        
        // Update task recurrence if different
        if (task.recurrenceType !== recurrenceValue) {
            task.recurrenceType = recurrenceValue;
            
            // Update indicator
            const nameDiv = task.row.cells[0].querySelector('.skystemtaskmaster-task-name') as HTMLElement;
            if (nameDiv) {
                let indicator = nameDiv.querySelector('.recurrence-indicator') as HTMLElement;
                if (indicator) {
                    indicator.textContent = recurrenceValue;
                    indicator.style.background = recurrenceValue !== 'None' ? '' : '';
                    indicator.title = `Recurrence: ${recurrenceValue} (Click to change)`;
                }
            }
            
            // Update row class
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

function showRecurrenceModal(task: Task): void {
    let modal = document.getElementById('recurrenceModal') as HTMLElement;
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recurrenceModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="width: 400px;">
                <span class="close">&times;</span>
                <h3 style="color: ; margin-bottom: 15px;">Set Recurrence</h3>
                
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 20px; padding: 10px; background: ; border-radius: 6px;">
                        <div style="font-size: 13px; color:; margin-bottom: 5px;">Task:</div>
                        <div style="font-weight: 500;">${task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task'}</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Current Recurrence</label>
                        <div id="currentRecurrenceDisplay" style="padding: 8px; background:; border-radius: 4px; margin-bottom: 15px;">
                            ${task.recurrenceType || 'None'}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">New Recurrence Type</label>
                        <select id="recurrenceTypeSelect" style="width: 100%; padding: 10px; border: 2px solid; border-radius: 6px; font-size: 14px;">
                            <option value="None">None (Non-recurring)</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                    
                    <div style="color: ; font-size: 13px; padding: 10px; background: ; border-radius: 4px; border-left: 3px solid ;">
                        <strong>Note:</strong> Recurring tasks show a gray left border, non-recurring show blue.
                        The recurrence type will also appear next to the task name.
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button id="cancelRecurrenceBtn" style="padding: 10px 20px; background:; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
                    <button id="saveRecurrenceBtn" style="padding: 10px 20px; background: ; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        (modal.querySelector('.close') as HTMLElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        (document.getElementById('cancelRecurrenceBtn') as HTMLButtonElement).addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        (document.getElementById('saveRecurrenceBtn') as HTMLButtonElement).addEventListener('click', () => {
            const newType = (document.getElementById('recurrenceTypeSelect') as HTMLSelectElement).value;
            const taskId = modal.getAttribute('data-current-task-id');
            if (taskId) updateTaskRecurrence(taskId, newType);
            modal.style.display = 'none';
        });
    }
    
    const select = document.getElementById('recurrenceTypeSelect') as HTMLSelectElement;
    select.value = task.recurrenceType || 'None';
    
    const currentDisplay = document.getElementById('currentRecurrenceDisplay') as HTMLElement;
    if (currentDisplay) {
        currentDisplay.textContent = task.recurrenceType || 'None';
        currentDisplay.style.color = task.recurrenceType && task.recurrenceType !== 'None' ? '' : '#666';
    }
    
    modal.setAttribute('data-current-task-id', task.id || task.row.dataset.taskId || '');
    
    modal.style.display = 'block';
}

// ================================
// CREATE SAMPLE DATA
// ================================

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



// ================================
// RECURRENCE TYPE EDITOR
// ================================
function makeRecurrenceEditable(): void {
    console.log('Making recurrence cells editable...');
    
    document.querySelectorAll('.extra-cell[data-column="recurrenceType"]').forEach(cellElement => {
        const cell = cellElement as HTMLElement;
        cell.style.cursor = 'pointer';
        cell.style.transition = 'all 0.2s';
        cell.title = 'Click to change recurrence type';
        
        cell.addEventListener('mouseenter', () => {
            cell.style.backgroundColor = '';
            cell.style.transform = 'scale(1.02)';
            cell.style.fontWeight = 'bold';
        });
        
        cell.addEventListener('mouseleave', () => {
            cell.style.backgroundColor = '';
            cell.style.transform = 'scale(1)';
            cell.style.fontWeight = '';
        });
        
        const newCell = cell.cloneNode(true) as HTMLElement;
        if (cell.parentNode) {
            cell.parentNode.replaceChild(newCell, cell);
        }
        
        newCell.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            
            const row = newCell.closest('tr') as HTMLTableRowElement;
            if (!row) return;
            
            const task = tasks.find(t => t.row === row);
            if (!task) return;
            
            const currentValue = newCell.textContent?.trim() || '';
            
            showRecurrenceTypeModal(task, newCell, currentValue);
        });
    });
}

function showRecurrenceTypeModal(task: Task, cell: HTMLElement, currentValue: string): void {
    const existingModal = document.getElementById('recurrenceTypeModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'recurrenceTypeModal';
    modal.className = 'modal show';

    modal.innerHTML = `
        <div class="modal-content recurrence-modal">
            <span class="close">&times;</span>
            <h3 class="modal-title">Set Recurrence Type</h3>
            
            <div class="modal-body">

                <div class="task-info-box">
                    <div class="task-label">Task:</div>
                    <div class="task-name">
                        ${task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task'}
                    </div>
                </div>

                <div class="form-group">
                    <label>Current Recurrence</label>
                    <div id="currentRecurrenceDisplay" 
                         class="current-recurrence ${currentValue !== 'None' ? 'active' : ''}">
                        ${currentValue || 'None'}
                    </div>
                </div>

                <div class="form-group">
                    <label>Select Recurrence Type</label>
                    <select id="recurrenceTypeSelect" class="recurrence-select">
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

                <div class="note-box">
                    <strong>Note:</strong> Recurrence type determines the task's border color:
                    <div class="note-item">
                        <span class="color-box gray"></span> Gray = Recurring
                    </div>
                    <div class="note-item">
                        <span class="color-box blue"></span> Blue = Non-recurring
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button id="cancelRecurrenceTypeBtn" class="btn btn-cancel">Cancel</button>
                <button id="saveRecurrenceTypeBtn" class="btn btn-save">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    (window as any).currentRecurrenceTask = task;
    (window as any).currentRecurrenceCell = cell;

    modal.querySelector('.close')?.addEventListener('click', () => modal.remove());
    document.getElementById('cancelRecurrenceTypeBtn')?.addEventListener('click', () => modal.remove());

    document.getElementById('saveRecurrenceTypeBtn')?.addEventListener('click', () => {
        const select = document.getElementById('recurrenceTypeSelect') as HTMLSelectElement;
        const newValue = select.value;

        if ((window as any).currentRecurrenceCell) {
            (window as any).currentRecurrenceCell.textContent = newValue;

            const currentTask = (window as any).currentRecurrenceTask as Task;
            if (currentTask) {
                currentTask.recurrenceType = newValue;

                const row = currentTask.row;
                if (row) {
                    row.classList.remove('recurring-task', 'non-recurring-task');

                    const recurringOptions = ['Every Period', 'Quarterly', 'Annual'];

                    row.setAttribute('data-recurrence-type', newValue);
                }
            }

            setTimeout(() => saveAllData(), 100);
            showNotification(`Recurrence type set to: ${newValue}`);
        }

        modal.remove();
    });

    modal.addEventListener('click', (e: MouseEvent) => {
        if (e.target === modal) modal.remove();
    });

    setTimeout(() => {
        (document.getElementById('recurrenceTypeSelect') as HTMLSelectElement)?.focus();
    }, 100);
}
function initializeRecurrenceEditor(): void {
    console.log('Initializing Recurrence Type Editor...');
    
    
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
    
    recurrenceCells.forEach((cellElement, index) => {
        const cell = cellElement as HTMLElement;
        if (cell.classList.contains('recurrence-initialized')) {
            return;
        }
        
        cell.classList.add('recurrence-initialized');
                cell.style.cursor = 'pointer';
        cell.style.transition = 'all 0.2s ease';
        cell.style.userSelect = 'none';
        cell.setAttribute('title', 'Click to change recurrence type');
        
        const newCell = cell.cloneNode(true) as HTMLElement;
        if (cell.parentNode) {
            cell.parentNode.replaceChild(newCell, cell);
        }

        newCell.addEventListener('mouseenter', function(this: HTMLElement) {
            
        });
        
        newCell.addEventListener('mouseleave', function(this: HTMLElement) {
            
        });
        
        newCell.addEventListener('click', function(this: HTMLElement, e: MouseEvent) {
            e.stopPropagation();
            e.preventDefault();
            
            console.log('Recurrence cell clicked!');
            
            const row = this.closest('tr') as HTMLTableRowElement;
            if (!row) {
                console.error('No parent row found');
                return;
            }
            
            const task = tasks.find(t => t.row === row);
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



// ================================
// FILE IMPORT FUNCTIONS
// ================================

let importedTasksData: any[] = [];

function initializeFileImport(): void {
    console.log('Initializing file import...');
    
    const dropArea = document.getElementById('importDropArea') as HTMLElement;
    const fileInput = document.getElementById('importFileInput') as HTMLInputElement;
    const browseBtn = document.getElementById('importBrowseFileBtn') as HTMLButtonElement;
    const cancelBtn = document.getElementById('cancelImportBtn') as HTMLButtonElement;
    const processBtn = document.getElementById('processImportBtn') as HTMLButtonElement;
    const previewArea = document.getElementById('importPreviewArea') as HTMLElement;
    const previewBody = document.getElementById('importPreviewBody') as HTMLElement;
    
    if (!dropArea || !fileInput || !browseBtn || !cancelBtn || !processBtn) return;
    
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    });
    
    dropArea.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.backgroundColor = '';
    });
    
    dropArea.addEventListener('dragleave', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.backgroundColor = '';
    });
    
    dropArea.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.backgroundColor = '';
        
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    });
    
    cancelBtn.addEventListener('click', () => {
        resetImportModal();
        (document.getElementById('importTasksModal') as HTMLElement).style.display = 'none';
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
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const content = e.target?.result as string;
            const lines = content.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            // Map headers to expected fields
            const taskNameIndex = headers.findIndex(h => h.indexOf('task') >= 0 || h.indexOf('name') >= 0);
            const ownerIndex = headers.findIndex(h => h.indexOf('owner') >= 0);
            const reviewerIndex = headers.findIndex(h => h.indexOf('reviewer') >= 0);
            const dueDateIndex = headers.findIndex(h => h.indexOf('due') >= 0 || h.indexOf('date') >= 0);
            
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
        reader.onload = (e: ProgressEvent<FileReader>) => {
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
        reader.onload = (e: ProgressEvent<FileReader>) => {
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
        
        previewArea.style.display = 'block';
        processBtn.disabled = false;
        
        const previewHtml = tasks.slice(0, 5).map(task => `
            <tr>
                <td">${task.name}</td>
                <td">${task.owner}</td>
                <td">${task.reviewer}</td>
                <td">${task.dueDate || 'Not set'}</td>
            </tr>
        `).join('');
        
        if (tasks.length > 5) {
            previewBody.innerHTML = previewHtml + `
                <tr>
                    <td colspan="4">
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
        countDisplay.style.cssText = '';
        countDisplay.textContent = `Total ${tasks.length} task(s) ready to import`;
        
        previewArea.appendChild(countDisplay);
    }
    
    function importTasks(): void {
        if (importedTasksData.length === 0) {
            alert('No tasks to import');
            return;
        }
        
        const importTarget = (document.querySelector('input[name="importTarget"]:checked') as HTMLInputElement).value;
        const skipDuplicates = (document.getElementById('skipDuplicates') as HTMLInputElement).checked;
        
        let targetList: MainList | null = null;
        
        if (importTarget === 'newList') {
            const listName = prompt('Enter name for new list:', 'Imported Tasks ' + new Date().toLocaleDateString());
            if (!listName) return;
            
            targetList = createMainList(listName);
            
            setTimeout(() => {
                const subList = createSubList(targetList!, 'Imported Tasks');
                
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
        (document.getElementById('importTasksModal') as HTMLElement).style.display = 'none';
        showNotification(`Successfully imported ${importedTasksData.length} tasks!`);
    }
    
    function importTasksToSublist(sublist: SubList, tasks: any[], skipDuplicates: boolean): void {
        const existingTaskNames = sublist.tasks.map(t => t.name?.toLowerCase() || '');
        
        tasks.forEach(taskData => {
            if (skipDuplicates && existingTaskNames.indexOf(taskData.name.toLowerCase()) >= 0) {
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
        if (previewArea) previewArea.style.display = 'none';
        if (previewBody) previewBody.innerHTML = '';
        if (processBtn) processBtn.disabled = true;
        if (fileInput) fileInput.value = '';
    }
}

// ================================
// MAIN INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
   
    
    loadColumnVisibility();
    
    createModals();
    
    initializeData();
    
    initializeCleanStructure();
    
    initializeEventListeners();
    
    setTimeout(() => {
        addExtraColumns();
        addDataCells();
        applyVisibility();
        updateSublistRowsColspan();
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
        
        
        initializeTDocManager();    
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
        
        console.log('Task Viewer fully initialized with persistence');
    }, 500);
});