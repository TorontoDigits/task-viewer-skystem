// ================================
// TYPE DEFINITIONS
// ================================

interface User {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: string;
}

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
    mandatory: boolean;
    forSubtask: boolean;
}

interface Task {
    id: string;
    subListId: string;
    name: string;
    acc: string;
    tdoc: string;
    owner: string;
    reviewer: string;
    dueDate: string;
    status: string;
    taskNumber: string;
    taskOwner: string;
    taskStatus: string;
    approver: string;
    recurrenceType: string;
    completionDoc: string;
    cdoc?: string;  // Add this property
    createdBy: string;
    comment: string;
    assigneeDueDate: string;
    customField1: string;
    reviewerDueDate: string;
    customField2: string;
    linkedAccounts: string;
    completionDate: string;
    notifier: string;
    row: HTMLTableRowElement | null;
    statusBadge?: HTMLElement | null;
    dueDateCell?: HTMLElement | null;
    daysCell?: HTMLElement | null;
    taskNameCell?: HTMLElement | null;
    checkbox?: HTMLInputElement | null;
}
interface TaskComment {
    id: string;
    author: string;
    authorName: string;
    text: string;
    timestamp: string;
    edited: boolean;
}
interface TaskDocument {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
}

interface TaskDocument {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
}

interface Subtask {
    id: string;
    subListId: string;
    name: string;
    tdoc: string;
    owner: string;
    reviewer: string;
    dueDate: string;
    status: string;
    taskNumber: string;
    taskOwner: string;
    taskStatus: string;
    approver: string;
    recurrenceType: string;
    createdBy: string;
    comment: string;
    row: HTMLTableRowElement | null;
    statusBadge?: HTMLElement | null;
    taskNameCell?: HTMLElement | null;
    ownerCell?: HTMLElement | null;
    reviewerCell?: HTMLElement | null;
    checkbox?: HTMLInputElement | null;
}

interface MainList {
    id: string;
    name: string;
    subLists: SubList[];
    row: HTMLTableRowElement | null;
    tableContainer: HTMLDivElement | null;
    tableElement: HTMLTableElement | null;
    tbody: HTMLElement | null;
    titleRow: HTMLTableRowElement | null;
    plusIcon: HTMLElement | null;
    dropdownContent: HTMLElement | null;
    isExpanded: boolean;
    listHeading?: HTMLElement | null;
    outsideCheckbox?: HTMLInputElement | null;
    insideCheckbox?: HTMLInputElement | null;
    insideCollapseIcon?: HTMLElement | null;
    insidePlusIcon?: HTMLElement | null;
    insideDropdownContent?: HTMLElement | null;
    thead?: HTMLElement | null;
}

interface SubList {
    id: string;
    name: string;
    mainListId: string;
    tasks: Task[];
    row: HTMLTableRowElement | null;
    isExpanded: boolean;
}

interface Comment {
    id: string;
    author: string;
    authorName: string;
    text: string;
    timestamp: string;
    edited: boolean;
}

interface Document {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
}

interface Account {
    orgHierarchy?: string;
    fsCaption?: string;
    accountName: string;
    accountNumber?: string;
    accountOwners?: string[];
    accountFrom?: string;
    accountTo?: string;
    dueDaysFrom?: number;
    dueDaysTo?: number;
    isKeyAccount?: string;
    riskRating?: string;
    linkedDate?: string;
    linkedBy?: string;
    accountType?: string;
}

interface FilterState {
    status: string;
    owner: string;
    reviewer: string;
    dueDate: string;
    recurrence: string;
    hideEmptyLists: boolean;
    showTaskCount: boolean;
}

interface SortState {
    column: string;
    direction: 'asc' | 'desc';
}

interface DraggedItem {
    element: HTMLElement;
    type: 'task' | 'subtask';
    originalIndex: number;
}

// ================================
// GLOBAL VARIABLES
// ================================

let mainLists: MainList[] = [];
let subLists: SubList[] = [];
let tasks: Task[] = [];
let subtasks: Subtask[] = [];

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

const taskDocuments: Map<HTMLTableRowElement | string, TaskDocument[]> = new Map();
const taskTDocDocuments: Map<HTMLTableRowElement | string, TaskDocument[]> = new Map();

const taskAccounts: Map<HTMLTableRowElement | string, Account[]> = new Map();
const taskComments: Record<string, TaskComment[]> = {};
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

const dependentTasks: Map<string, string> = new Map();
let currentFilters: FilterState = {
    status: 'all',
    owner: 'all',
    reviewer: 'all',
    dueDate: 'all',
    recurrence: 'all',
    hideEmptyLists: false,
    showTaskCount: false
};

let currentSort: SortState = {
    column: 'taskName',
    direction: 'asc'
};

// ================================
// UTILITY FUNCTIONS
// ================================

function escapeHtml(str: string | null | undefined): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function addNotificationStyles(): void {
    if (document.getElementById('notification-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'notification-styles';
    link.rel = 'stylesheet';
    link.href = 'notifications.css';
    document.head.appendChild(link);
}

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    addNotificationStyles();
    let notification = document.querySelector('.skystemtaskmaster-notification');
    if (notification) {
        (notification as HTMLElement).style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification?.remove(), 300);
    }
    
    notification = document.createElement('div');
    notification.className = `skystemtaskmaster-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification) {
            (notification as HTMLElement).style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification?.remove(), 300);
        }
    }, 3000);
}


function getUserColor(initials: string): string {
    const colors: Record<string, string> = {
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

function getAuthorFullName(initials: string): string {
    const userMap: Record<string, string> = {
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

function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getCommentKey(rowId: string, type: string): string {
    return `${type}_${rowId}`;
}

function getVisibleColumnCount(): number {
    let count = 0;
    columnConfig.forEach(col => {
        if (col.visible !== false) count++;
    });
    return count;
}

// ================================
// STYLES INITIALIZATION
// ================================

function addSeparateTableStyles(): void {
    if (document.getElementById('separate-table-styles')) return;
    const link = document.createElement('link');
    link.id = 'separate-table-styles';
    link.rel = 'stylesheet';
    link.href = 'separate-table-styles.css';
    document.head.appendChild(link);
}

function addSublistStyles(): void {
    if (document.getElementById('sublist-styles')) return;
    const link = document.createElement('link');
    link.id = 'sublist-styles';
    link.rel = 'stylesheet';
    link.href = 'sublist-styles.css';
    document.head.appendChild(link);
}

function addDocumentStyles(): void {
    if (document.getElementById('document-icon-styles')) return;
    const link = document.createElement('link');
    link.id = 'document-icon-styles';
    link.rel = 'stylesheet';
    link.href = 'document-styles.css';
    document.head.appendChild(link);
}

function addAccountStyles(): void {
    if (document.getElementById('account-styles')) return;
    const link = document.createElement('link');
    link.id = 'account-styles';
    link.rel = 'stylesheet';
    link.href = 'account-styles.css';
    document.head.appendChild(link);
}

function addSortStyles(): void {
    if (document.getElementById('sort-styles')) return;
    const link = document.createElement('link');
    link.id = 'sort-styles';
    link.rel = 'stylesheet';
    link.href = 'sort-styles.css';
    document.head.appendChild(link);
}

function addTDocStyles(): void {
    if (document.getElementById('tdoc-styles')) return;
    const link = document.createElement('link');
    link.id = 'tdoc-styles';
    link.rel = 'stylesheet';
    link.href = 'tdoc-styles.css';
    document.head.appendChild(link);
}
function addRecurrenceStyles(): void {
    if (document.getElementById('recurrence-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'recurrence-styles';
    link.rel = 'stylesheet';
    link.href = 'recurrence-styles.css';
    document.head.appendChild(link);
}

function addDragStyles(): void {
    if (document.getElementById('skystemtaskmaster-drag-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'skystemtaskmaster-drag-styles';
    link.rel = 'stylesheet';
    link.href = 'drag-styles.css';
    document.head.appendChild(link);
}

function addUserStyles(): void {
    if (document.getElementById('skystemtaskmaster-user-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'skystemtaskmaster-user-styles';
    link.rel = 'stylesheet';
    link.href = 'user-styles.css';
    document.head.appendChild(link);
}
// ================================
// DATA INITIALIZATION
// ================================

function initializeData(): void {
    console.log('Initializing data...');
    tasks = [];
    subtasks = [];
    
    const rows = document.querySelectorAll("tbody tr");
    console.log('Total rows found:', rows.length);
    
    rows.forEach((row, index) => {
        const htmlRow = row as HTMLTableRowElement;
        console.log(`Row ${index}:`, htmlRow.className);
        const firstCell = htmlRow.cells[0];
        const isSubtask = firstCell && firstCell.colSpan > 1;
        
        if (isSubtask) {
            const checkbox = htmlRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const statusBadge = htmlRow.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
            const taskNameCell = htmlRow.cells[0];
            
            if (checkbox && statusBadge && taskNameCell) {
                let ownerCell: HTMLElement | null = null;
                let reviewerCell: HTMLElement | null = null;
                
                for (let i = 0; i < htmlRow.cells.length; i++) {
                    const cell = htmlRow.cells[i];
                    const badge = cell.querySelector('.skystemtaskmaster-badge');
                    if (badge) {
                        if (!ownerCell) ownerCell = cell;
                        else if (!reviewerCell) reviewerCell = cell;
                    }
                }
                
                subtasks.push({
                    id: `subtask_${Date.now()}_${index}`,
                    subListId: '',
                    name: taskNameCell.innerText,
                    tdoc: '',
                    owner: '',
                    reviewer: '',
                    dueDate: '',
                    status: statusBadge.innerText,
                    taskNumber: '',
                    taskOwner: '',
                    taskStatus: statusBadge.innerText,
                    approver: '',
                    recurrenceType: 'None',
                    createdBy: 'PK',
                    comment: '',
                    row: htmlRow,
                    statusBadge,
                    taskNameCell,
                    ownerCell: ownerCell || htmlRow.cells[htmlRow.cells.length - 2],
                    reviewerCell: reviewerCell || htmlRow.cells[htmlRow.cells.length - 1],
                    checkbox
                });
                console.log('Subtask added:', taskNameCell.innerText);
            }
        } else if (!htmlRow.classList.contains('main-list-row') && 
                   !htmlRow.classList.contains('sub-list-row') && 
                   !htmlRow.classList.contains('skystemtaskmaster-subtask-header')) {
            const checkbox = htmlRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const statusBadge = htmlRow.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
            const dueDateCell = htmlRow.cells[3] as HTMLElement;
            const daysCell = htmlRow.cells[8] as HTMLElement;
            const taskNameCell = htmlRow.cells[0];
            
            if (checkbox && statusBadge && dueDateCell && daysCell && taskNameCell) {
                tasks.push({
                    id: `task_${Date.now()}_${index}`,
                    subListId: '',
                    name: taskNameCell.innerText,
                    acc: htmlRow.cells[1]?.innerText || '+',
                    tdoc: htmlRow.cells[2]?.innerText || '0',
                    owner: htmlRow.cells[5]?.innerText || 'PK',
                    reviewer: htmlRow.cells[6]?.innerText || 'SM',
                    dueDate: dueDateCell.innerText,
                    status: statusBadge.innerText,
                    taskNumber: '',
                    taskOwner: htmlRow.cells[5]?.innerText || 'PK',
                    taskStatus: statusBadge.innerText,
                    approver: '—',
                    recurrenceType: 'None',
                    completionDoc: '0',
                    createdBy: 'PK',
                    comment: '',
                    assigneeDueDate: '',
                    customField1: '',
                    reviewerDueDate: '',
                    customField2: '',
                    linkedAccounts: '',
                    completionDate: '',
                    notifier: '',
                    row: htmlRow,
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
    
    const completedEl = document.getElementById("completedCount");
    const inProgressEl = document.getElementById("inProgressCount");
    const notStartedEl = document.getElementById("notStartedCount");
    
    if (completedEl) {
        completedEl.innerText = completed.toString();
        completedEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            if (completedEl) completedEl.style.transform = 'scale(1)';
        }, 200);
    }
    
    if (inProgressEl) {
        inProgressEl.innerText = inProgress.toString();
        inProgressEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            if (inProgressEl) inProgressEl.style.transform = 'scale(1)';
        }, 200);
    }
    
    if (notStartedEl) {
        notStartedEl.innerText = notStarted.toString();
        notStartedEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            if (notStartedEl) notStartedEl.style.transform = 'scale(1)';
        }, 200);
    }
}

// ================================
// MAIN LIST CREATION
// ================================

function createMainList(listName: string): MainList {
    const mainList: MainList = {
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

function addMainListTableStyles(): void {
    if (document.getElementById('main-list-table-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'main-list-table-styles';
    link.rel = 'stylesheet';
    link.href = 'main-list-table.css';
    document.head.appendChild(link);
}

function createMainListTable(mainList: MainList): HTMLDivElement | undefined {
    // Ensure styles are loaded
    addMainListTableStyles();
    
    let container = document.getElementById('mainTableContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mainTableContainer';
        container.className = 'main-table-container';
        const actionBar = document.querySelector('.skystemtaskmaster-action-bar');
        if (actionBar && actionBar.parentNode) {
            actionBar.parentNode.insertBefore(container, actionBar.nextSibling);
        } else {
            const wrapper = document.querySelector('.skystemtaskmaster-main-wrapper');
            if (wrapper) wrapper.appendChild(container);
        }
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'main-list-outer-wrapper';
    wrapper.setAttribute('data-mainlist-id', mainList.id);
    
    const listHeading = document.createElement('div');
    listHeading.className = 'main-list-heading-outside';
    
    const outsideCheckbox = document.createElement('input');
    outsideCheckbox.type = 'checkbox';
    outsideCheckbox.className = 'list-checkbox-outside';
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
            headerRow.appendChild(th);
        }
    });
    
    columnConfig.forEach(col => {
        if (baseColumns.indexOf(col.key) === -1 && col.visible) {
            const th = document.createElement('th');
            th.textContent = col.label;
            th.className = 'extra-column';
            th.setAttribute('data-column', col.key);
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
    titleCell.style.padding = '0';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'list-header-inside';
    
    const insideCheckbox = document.createElement('input');
    insideCheckbox.type = 'checkbox';
    insideCheckbox.className = 'list-checkbox-inside';
    insideCheckbox.title = 'Select this list';
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
    insidePlusIcon.className = 'plus-icon-inside';
    insidePlusIcon.innerHTML = '<i class="fa-solid fa-plus-circle"></i>';
    
    const insideDropdownContent = document.createElement('div');
    insideDropdownContent.className = 'plus-dropdown-content-inside';
    
    const insideAddSublistOption = document.createElement('div');
    insideAddSublistOption.className = 'plus-dropdown-item';
    insideAddSublistOption.innerHTML = '<i class="fa-solid fa-folder-plus" ></i><span>Add Sub List</span>';
    insideAddSublistOption.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateSubListModal(mainList);
        insideDropdownContent.classList.remove('show');
    });
    
    const insideAddTaskOption = document.createElement('div');
    insideAddTaskOption.className = 'plus-dropdown-item';
    insideAddTaskOption.innerHTML = '<i class="fa-solid fa-tasks"></i><span>Add List</span>';
    insideAddTaskOption.addEventListener('click', (e) => {
        e.stopPropagation();
        showCreateTaskForMainList(mainList);
        insideDropdownContent.classList.remove('show');
    });
    
    insideDropdownContent.appendChild(insideAddSublistOption);
    insideDropdownContent.appendChild(insideAddTaskOption);
    insidePlusDropdown.appendChild(insidePlusIcon);
    insidePlusDropdown.appendChild(insideDropdownContent);
    
    insidePlusIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        
        document.querySelectorAll('.plus-dropdown-content-inside, .plus-dropdown-content').forEach(d => {
            if (d instanceof HTMLElement && d !== insideDropdownContent) {
                d.classList.remove('show');
            }
        });
        
        insideDropdownContent.classList.toggle('show');
    });
    
    const insideCollapseIcon = document.createElement('span');
    insideCollapseIcon.className = 'collapse-icon-inside';
    insideCollapseIcon.innerHTML = '<i class="fas fa-angle-down"></i>';
    insideCollapseIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMainList(mainList);
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
            insideDropdownContent.classList.remove('show');
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

function toggleMainList(mainList: MainList): void {
    mainList.isExpanded = !mainList.isExpanded;
    
    const icon = mainList.insideCollapseIcon;
    if (icon) {
        icon.innerHTML = mainList.isExpanded ? '<i class="fas fa-angle-down"></i>' : '<i class="fas fa-angle-right"></i>';
    }
    
    const tbody = mainList.tbody;
    if (tbody) {
        let nextRow = mainList.titleRow?.nextSibling;
        while (nextRow && nextRow instanceof HTMLElement && !nextRow.classList.contains('main-list-title-row')) {
            nextRow.style.display = mainList.isExpanded ? '' : 'none';
            nextRow = nextRow.nextSibling;
        }
    }
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
    
    updateSelectedCount();
}

// ================================
// SUB LIST CREATION
// ================================

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

function createSubListRow(subList: SubList, mainList: MainList): HTMLTableRowElement | undefined {
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
    
    const checkbox = row.querySelector('.sublist-checkbox') as HTMLInputElement;
    if (checkbox) {
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            handleSublistCheckbox(subList, checkbox.checked);
        });
    }
    
    return row;
}

function toggleSubList(subList: SubList, mainList: MainList): void {
    subList.isExpanded = !subList.isExpanded;
    
    const icon = subList.row?.querySelector('.collapse-sublist-icon i');
    if (icon) {
        icon.className = subList.isExpanded ? 'fas fa-angle-down' : 'fas fa-angle-right';
    }
    
    const tbody = mainList.tbody;
    if (tbody) {
        let nextRow = subList.row?.nextSibling;
        while (nextRow && nextRow instanceof HTMLElement && !nextRow.classList.contains('sub-list-row')) {
            if (nextRow.classList && nextRow.classList.contains('task-row')) {
                nextRow.style.display = subList.isExpanded ? '' : 'none';
            }
            nextRow = nextRow.nextSibling;
        }
    }
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

function updateSelectedCount(): number {
    let selected = 0;
    
    tasks.forEach(task => {
        const checkbox = task.row?.querySelector('.task-checkbox') as HTMLInputElement;
        if (checkbox && checkbox.checked) selected++;
    });
    
    subtasks.forEach(subtask => {
        const checkbox = subtask.row?.querySelector('.subtask-checkbox') as HTMLInputElement;
        if (checkbox && checkbox.checked) selected++;
    });
    
    const selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = selected.toString();
    }
    
    console.log('Selected items:', selected);
    return selected;
}

// ================================
// TASK CREATION
// ================================

function createTask(subList: SubList, taskData: Partial<Task>): Task {
    const task: Task = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        subListId: subList.id,
        name: taskData.name || '',
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
            
            updateCommentColumn();
            updateCDocColumn();
            updateTDocColumn();
            
            makeExtraCellsEditable(task.row, task);
            
            console.log('Task fully initialized:', task.name);
        }
    }, 300);
    
    showNotification(`Task "${taskData.name}" created`);
    return task;
}

function createTaskRow(task: Task, subList: SubList): void {
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
    
    const rowHTML = `
        <td>
            <div class="skystemtaskmaster-task-name" style="padding-left: 70px; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" class="task-checkbox">
                <span>${escapeHtml(task.name)}</span>
            </div>
        </td>
        <td><span >${escapeHtml(task.acc)}</span></td>
        <td class="tdoc-cell">${escapeHtml(task.tdoc)}</td>
        <td class="skystemtaskmaster-editable due-date">${escapeHtml(formattedDueDate)}</td>
        <td><span class="skystemtaskmaster-status-badge skystemtaskmaster-status-not-started">${escapeHtml(task.status)}</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${task.owner.toLowerCase()}">${escapeHtml(task.owner)}</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${task.reviewer.toLowerCase()}">${escapeHtml(task.reviewer)}</span></td>
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

function addTaskEventListeners(task: Task): void {
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
    
    const ownerCell = row.cells[5];
    if (ownerCell) {
        const ownerBadge = ownerCell.querySelector('.skystemtaskmaster-badge') as HTMLElement;
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
        const reviewerBadge = reviewerCell.querySelector('.skystemtaskmaster-badge') as HTMLElement;
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
    
    const checkbox = row.querySelector('.task-checkbox') as HTMLInputElement;
    if (checkbox && task.statusBadge) {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                task.statusBadge!.innerText = "Completed";
                task.statusBadge!.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-completed";
            } else {
                task.statusBadge!.innerText = "Not Started";
                task.statusBadge!.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-not-started";
            }
            updateCounts();
        });
    }
    
    const dueDateCell = row.querySelector('.due-date') as HTMLElement;
    if (dueDateCell) {
        dueDateCell.addEventListener('blur', () => calculateDays());
    }
}

// ================================
// USER MODAL FUNCTIONS
// ================================

function showUserModal(cell: HTMLElement, type: string, item: Task | Subtask): void {
    const badge = cell.querySelector('.skystemtaskmaster-badge') as HTMLElement;
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
        
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }
        
        const closeModalBtn = document.getElementById('closeUserModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }
        
        const searchInput = document.getElementById('userSearch') as HTMLInputElement;
        if (searchInput) {
            searchInput.addEventListener('keyup', () => {
                updateUserList(searchInput.value, currentInitials, type, cell, item);
            });
        }
        
        const unassignBtn = document.getElementById('unassignUserBtn');
        if (unassignBtn) {
            unassignBtn.addEventListener('click', () => {
                unassignUser(cell, type, item);
                if (modal) modal.style.display = 'none';
            });
        }
    }
    
    updateUserList('', currentInitials, type, cell, item);
    if (modal) modal.style.display = 'block';
    
    setTimeout(() => {
        const searchInput = document.getElementById('userSearch') as HTMLInputElement;
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
    }, 100);
}

function updateUserList(searchText: string, currentInitials: string, type: string, cell: HTMLElement, item: Task | Subtask): void {
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
                const user: User = JSON.parse(userData);
                assignUser(cell, user, type, item);
                const modal = document.getElementById('userSelectionModal');
                if (modal) modal.style.display = 'none';
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
        const taskItem = item as Task;
        if (type === 'owner') {
            const taskIndex = tasks.findIndex(t => t.row === taskItem.row);
            if (taskIndex !== -1) {
                const row = tasks[taskIndex].row;
                if (row) {
                    const oldCell = row.cells[5];
                    const newCell = document.createElement('td');
                    newCell.innerHTML = cell.innerHTML;
                    newCell.className = oldCell.className;
                    newCell.style.cssText = oldCell.style.cssText;
                    row.replaceChild(newCell, oldCell);
                    tasks[taskIndex].row!.cells[5] = newCell;
                    makeCellClickable(newCell, type, taskItem);
                }
            }
        } else {
            const taskIndex = tasks.findIndex(t => t.row === taskItem.row);
            if (taskIndex !== -1) {
                const row = tasks[taskIndex].row;
                if (row) {
                    const oldCell = row.cells[6];
                    const newCell = document.createElement('td');
                    newCell.innerHTML = cell.innerHTML;
                    newCell.className = oldCell.className;
                    newCell.style.cssText = oldCell.style.cssText;
                    row.replaceChild(newCell, oldCell);
                    tasks[taskIndex].row!.cells[6] = newCell;
                    makeCellClickable(newCell, type, taskItem);
                }
            }
        }
    } else {
        const subtaskItem = item as Subtask;
        if (type === 'owner') {
            const subtaskIndex = subtasks.findIndex(s => s.row === subtaskItem.row);
            if (subtaskIndex !== -1) {
                subtasks[subtaskIndex].ownerCell = cell;
            }
        } else {
            const subtaskIndex = subtasks.findIndex(s => s.row === subtaskItem.row);
            if (subtaskIndex !== -1) {
                subtasks[subtaskIndex].reviewerCell = cell;
            }
        }
    }
    
    showNotification(`Assigned ${user.name} as ${type}`);
}

function unassignUser(cell: HTMLElement, type: string, item: Task | Subtask): void {
    cell.innerHTML = '';
    
    const emptySpan = document.createElement('span');
    emptySpan.className = 'empty-assignee';
    emptySpan.textContent = '?';
    emptySpan.title = 'Click to assign';
    cell.appendChild(emptySpan);
    
    makeCellClickable(cell, type, item);
    showNotification(`${type} unassigned`);
}

function makeCellClickable(cell: HTMLElement, type: string, item: Task | Subtask): void {
    const newCell = cell.cloneNode(true) as HTMLElement;
    cell.parentNode?.replaceChild(newCell, cell);
    
    newCell.style.cursor = 'pointer';
    newCell.title = `Click to change ${type}`;
    
    newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        showUserModal(newCell, type, item);
    });
    
    newCell.addEventListener('mouseenter', () => {
        newCell.style.backgroundColor = '#fff0f5';
        newCell.style.borderRadius = '4px';
    });
    
    newCell.addEventListener('mouseleave', () => {
        newCell.style.backgroundColor = '';
    });
}

// ================================
// STATUS MODAL FUNCTIONS
// ================================

function showStatusChangeModal(task: Task): void {
    console.log('Opening status modal for task:', task);
    currentTaskForStatus = task;
    
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
    const modal = document.getElementById('statusChangeModal')!;
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
        currentTaskForStatus = null;
    };
    
    const cancelBtn = document.getElementById('cancelStatusBtn') as HTMLElement;
    cancelBtn.onclick = function() {
        modal.remove();
        currentTaskForStatus = null;
    };
    
    const updateBtn = document.getElementById('updateStatusBtn') as HTMLElement;
    updateBtn.onclick = function() {
        const newStatus = (document.getElementById('newStatusSelect') as HTMLSelectElement).value;
        const comment = (document.getElementById('statusComment') as HTMLTextAreaElement).value;
        
        if (currentTaskForStatus) {
            const task = currentTaskForStatus;
            const oldStatus = task.statusBadge ? task.statusBadge.innerText : (task.status || 'Not Started');
            
            updateBtn.classList.add('loading');
            (updateBtn as HTMLButtonElement).disabled = true;
            
            setTimeout(() => {
                updateTaskStatusUniversal(task, newStatus);
                
                if (comment && comment.trim()) {
                    addStatusChangeComment(task.row, oldStatus, newStatus, comment);
                }
                
                showNotification(`Status changed from ${oldStatus} to ${newStatus}`);
                console.log('Status updated successfully');
                
                updateBtn.classList.remove('loading');
                updateBtn.classList.add('success');
                
                setTimeout(() => {
                    updateBtn.classList.remove('success');
                    modal.remove();
                    currentTaskForStatus = null;
                }, 300);
            }, 300);
        } else {
            modal.remove();
            currentTaskForStatus = null;
        }
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
            currentTaskForStatus = null;
        }
    };
    
    setTimeout(() => {
        select.focus();
    }, 100);
}

function updateTaskStatusUniversal(task: Task, newStatus: string): void {
    console.log('Universal status update called for task:', task.name, 'New status:', newStatus);
    
    if (task.statusBadge) {
        (task.statusBadge as HTMLElement).innerText = newStatus;
        task.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
    }
    
    if (task.row) {
        const allStatusBadges = task.row.querySelectorAll('.skystemtaskmaster-status-badge');
        allStatusBadges.forEach(badge => {
            (badge as HTMLElement).innerText = newStatus;
            badge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
        });
    }
    
    if (task.row && task.row.cells[4]) {
        const statusBaseCell = task.row.cells[4];
        const badge = statusBaseCell.querySelector('.skystemtaskmaster-status-badge') as HTMLElement;
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
            const filteredCells: Element[] = [];
            extraStatusCells.forEach(cell => {
                const colKey = cell.getAttribute('data-column');
                if (colKey === 'taskStatus') {
                    filteredCells.push(cell);
                }
            });
            extraStatusCells = filteredCells as unknown as NodeListOf<Element>;
        }
        
        console.log('Found extra status cells:', extraStatusCells.length);
        
        if (extraStatusCells.length > 0) {
            extraStatusCells.forEach(cell => {
                (cell as HTMLElement).textContent = newStatus;
                (cell as HTMLElement).style.backgroundColor = '#e8f5e9';
                (cell as HTMLElement).style.transition = 'background-color 0.3s';
                setTimeout(() => {
                    (cell as HTMLElement).style.backgroundColor = '';
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
            (tasks[taskIndex].statusBadge as HTMLElement).innerText = newStatus;
        }
    }
    
    setTimeout(() => {
        if (task.row) {
            const allStatusElements = task.row.querySelectorAll('.skystemtaskmaster-status-badge, .extra-cell[data-column="taskStatus"], td[data-column="taskStatus"]');
            allStatusElements.forEach(el => {
                const element = el as HTMLElement;
                if (element.innerText !== newStatus) {
                    element.innerText = newStatus;
                    console.log('Final correction - updated element:', element);
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


function makeStatusCellClickable(cell: HTMLElement, item: Task | Subtask): HTMLElement {
    if (!cell) return cell;
    
    const newCell = cell.cloneNode(true) as HTMLElement;
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
        
        if ('dueDateCell' in item) {
            showStatusChangeModal(item as Task);
        } else {
            showSubtaskStatusChangeModal(item as Subtask);
        }
    });
    
    return newCell;
}

function addStatusModalStyles(): void {
    if (document.getElementById('status-modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'status-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'status-modal.css';
    document.head.appendChild(link);
}

function showSubtaskStatusChangeModal(subtask: Subtask): void {
    console.log('Opening status modal for subtask:', subtask);
    
    // Ensure styles are loaded
    addStatusModalStyles();
    
    currentSubtaskForStatus = subtask;
    
    const modalHtml = `
        <div id="statusChangeModal" class="modal status-modal">
            <div class="modal-content status-modal-content">
                <span class="close">&times;</span>
                <h3 class="status-modal-title">Change Subtask Status</h3>
                
                <div class="status-modal-body">
                    <div class="status-field">
                        <label class="status-label">Current Status</label>
                        <div id="currentStatusDisplay" class="current-status-display" data-status="${escapeHtml(subtask.statusBadge?.innerText || 'Not Started')}">
                            ${escapeHtml(subtask.statusBadge?.innerText || 'Not Started')}
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
    const modal = document.getElementById('statusChangeModal')!;
    const select = document.getElementById('newStatusSelect') as HTMLSelectElement;
    const currentStatus = subtask.statusBadge?.innerText || 'Not Started';
    
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
                charCounter.classList.add('exceed');
                this.classList.add('error');
            } else {
                charCounter.classList.remove('exceed');
                this.classList.remove('error');
            }
        });
    }
    
    const closeModal = () => {
        modal.remove();
        currentSubtaskForStatus = null;
    };
    
    const closeBtn = modal.querySelector('.close') as HTMLElement;
    closeBtn.onclick = closeModal;
    
    const cancelBtn = document.getElementById('cancelStatusBtn') as HTMLElement;
    cancelBtn.onclick = closeModal;
    
    const updateBtn = document.getElementById('updateStatusBtn') as HTMLElement;
    updateBtn.onclick = function() {
        console.log('Update subtask button clicked!');
        
        const newStatus = (document.getElementById('newStatusSelect') as HTMLSelectElement).value;
        const comment = (document.getElementById('statusComment') as HTMLTextAreaElement).value;
        
        if (currentSubtaskForStatus) {
            const subtask = currentSubtaskForStatus;
            const oldStatus = subtask.statusBadge?.innerText || 'Not Started';
            
            updateBtn.classList.add('loading');
            (updateBtn as HTMLButtonElement).disabled = true;
            
            setTimeout(() => {
                if (subtask.statusBadge) {
                    subtask.statusBadge.innerText = newStatus;
                    subtask.statusBadge.className = `skystemtaskmaster-status-badge skystemtaskmaster-status-${newStatus.toLowerCase().replace(' ', '-')}`;
                }
                
                if (subtask.taskStatus !== undefined) {
                    subtask.taskStatus = newStatus;
                }
                
                updateTaskStatusExtraColumn(subtask.row, newStatus);
                updateCounts();
                showNotification(`Subtask status changed from ${oldStatus} to ${newStatus}`);
                
                updateBtn.classList.remove('loading');
                updateBtn.classList.add('success');
                
                setTimeout(() => {
                    updateBtn.classList.remove('success');
                    closeModal();
                }, 300);
            }, 300);
        } else {
            closeModal();
        }
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    setTimeout(() => {
        select.focus();
    }, 100);
}

function updateTaskStatusExtraColumn(row: HTMLTableRowElement | null, newStatus: string): void {
    if (!row) return;
    
    const extraCells = row.querySelectorAll('.extra-cell');
    extraCells.forEach(cell => {
        const columnKey = cell.getAttribute('data-column');
        if (columnKey === 'taskStatus') {
            // Cast cell to HTMLElement to access style property
            const htmlCell = cell as HTMLElement;
            htmlCell.textContent = newStatus;
            htmlCell.style.backgroundColor = '';
            htmlCell.style.transition = '';
            setTimeout(() => {
                htmlCell.style.backgroundColor = '';
            }, 500);
            
            console.log('Task Status column updated to:', newStatus);
        }
    });
}
function addStatusChangeComment(row: HTMLTableRowElement | null, oldStatus: string, newStatus: string, comment: string): void {
    if (!row) return;
    const statusHistory = row.getAttribute('data-status-history') || '';
    const newEntry = `${new Date().toLocaleString()}: ${oldStatus} → ${newStatus}${comment ? ' - ' + comment : ''}`;
    row.setAttribute('data-status-history', statusHistory ? statusHistory + '|' + newEntry : newEntry);
}

// ================================
// EXTRA COLUMNS FUNCTIONS
// ================================

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
        const taskId = row.getAttribute('data-task-id') || '1';
        
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
                    // Fix: Properly handle when task doesn't exist
                    switch(col.key) {
                        case 'taskNumber':
                            value = 'TSK-00' + taskId;
                            break;
                        case 'taskStatus':
                            value = 'Not Started';
                            break;
                        case 'createdBy':
                            value = 'PK';
                            break;
                        case 'approver':
                            value = '—';
                            break;
                        case 'recurrenceType':
                            value = 'None';
                            break;
                        default:
                            value = '—';
                    }
                }
                
                cell.textContent = value;
                cell.style.display = col.visible ? '' : 'none';
                
                row.appendChild(cell);
            }
        });
        if (task) {
            setTimeout(() => {
                makeExtraCellsEditable(row as HTMLTableRowElement, task);
            }, 50);
        }
    });
    
    document.querySelectorAll('.subtask-row').forEach(row => {
        // Handle subtask extra cells
    });
}

function addExtraColumnsForRow(row: HTMLTableRowElement, task: Task): void {
    row.querySelectorAll('.extra-cell').forEach(cell => cell.remove());
    
    const baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    
    columnConfig.forEach(col => {
        // First fix: use indexOf instead of includes
        // Second fix: remove "!== false" comparison
        if (baseColumns.indexOf(col.key) === -1 && col.visible) {
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

function getTaskColumnValue(task: Task, columnKey: string): string {
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

function makeExtraCellsEditable(row: HTMLTableRowElement, task: Task): void {
    row.querySelectorAll('.extra-cell').forEach(cell => {
        const colKey = cell.getAttribute('data-column');
        
        // Check if colKey is not null before using it
        if (colKey) {
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
        }
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
        cell.style.backgroundColor = '#fff0f5';
        cell.style.transform = 'scale(1.02)';
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = '';
        cell.style.transform = 'scale(1)';
    });
    
    const newCell = cell.cloneNode(true) as HTMLElement;
    cell.parentNode?.replaceChild(newCell, cell);
    
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

function addExtraUserModalStyles(): void {
    if (document.getElementById('extra-user-modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'extra-user-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'extra-user-modal.css';
    document.head.appendChild(link);
}

function showExtraUserSelectionModal(item: Task | Subtask, cell: HTMLElement, columnKey: string, columnDisplayName: string, currentValue: string): void {
    console.log('Opening user modal for:', columnDisplayName, 'Current:', currentValue);
    
    // Ensure styles are loaded
    addExtraUserModalStyles();
    
    const existingModal = document.getElementById('extraUserSelectionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const hasValue = currentValue !== '—';
    const currentValueClass = hasValue ? 'has-value' : 'no-value';
    
    const modalHtml = `
        <div id="extraUserSelectionModal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Select ${escapeHtml(columnDisplayName)}</h3>
                
                <div class="modal-content-area">
                    <div class="task-info-box">
                        <div class="task-info-label">Task:</div>
                        <div class="task-info-name">${escapeHtml(item.name || (item as Task).taskNameCell?.querySelector('span')?.textContent || 'Task')}</div>
                    </div>
                    
                    <div class="current-user-section">
                        <label class="current-user-label">Current ${escapeHtml(columnDisplayName)}</label>
                        <div id="currentUserDisplay" class="current-user-value ${currentValueClass}">
                            ${escapeHtml(currentValue || '—')}
                        </div>
                    </div>
                    
                    <div class="user-search-input-modal">
                        <input type="text" id="userSearchInput" placeholder="Search by name or initials...">
                    </div>
                    
                    <div id="userListContainer" class="user-list-container-modal"></div>
                </div>
                
                <div class="modal-footer-buttons">
                    <button id="unassignUserBtn" class="btn-unassign-modal">Unassign</button>
                    <button id="closeUserModalBtn" class="btn-close-modal-user">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('extraUserSelectionModal')!;
    
    (window as any).currentExtraItem = item;
    (window as any).currentExtraCell = cell;
    (window as any).currentExtraColumnKey = columnKey;
    (window as any).currentExtraColumnName = columnDisplayName;
    (window as any).currentExtraValue = currentValue;
    
    updateUserListInModal('', currentValue);
    
    const closeSpan = modal.querySelector('.close') as HTMLElement;
    closeSpan.addEventListener('click', () => {
        modal.remove();
        clearExtraUserReferences();
    });
    
    const closeModalBtn = document.getElementById('closeUserModalBtn') as HTMLElement;
    closeModalBtn.addEventListener('click', () => {
        modal.remove();
        clearExtraUserReferences();
    });
    
    const unassignBtn = document.getElementById('unassignUserBtn') as HTMLElement;
    unassignBtn.addEventListener('click', () => {
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
    
    modal.addEventListener('click', (e) => {
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
            <div class="user-item-modal ${isCurrent ? 'current' : ''}" data-user='${JSON.stringify(user)}'>
                <span class="user-badge-modal" style="background: ${getUserColor(user.initials)}">
                    ${escapeHtml(user.initials)}
                </span>
                <div class="user-info-modal">
                    <div class="user-name-modal">${escapeHtml(user.name)}</div>
                    <div class="user-details-modal">${escapeHtml(user.email)} • ${escapeHtml(user.role)}</div>
                </div>
                ${isCurrent ? '<span class="user-checkmark-modal">✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    userList.querySelectorAll('.user-item-modal').forEach(el => {
        el.addEventListener('click', () => {
            const userData = el.getAttribute('data-user');
            if (userData) {
                const user: User = JSON.parse(userData);
                assignExtraUserFromModal(user);
            }
        });
    });
}

function assignExtraUserFromModal(user: User): void {
    if (!(window as any).currentExtraCell || !(window as any).currentExtraItem) return;
    
    const cell = (window as any).currentExtraCell;
    const item = (window as any).currentExtraItem;
    const columnKey = (window as any).currentExtraColumnKey;
    const columnName = (window as any).currentExtraColumnName;
    
    cell.textContent = user.initials;
    cell.classList.add('success-flash');
    
    setTimeout(() => {
        cell.classList.remove('success-flash');
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
        if ('owner' in item) item.owner = value;
    } else if (columnKey === 'createdBy') {
        item.createdBy = value;
    } else if (columnKey === 'approver') {
        item.approver = value;
    }
    
    if (item.id) {
        const taskIndex = tasks.findIndex(t => t.id === item.id);
        if (taskIndex !== -1) {
            (tasks[taskIndex] as any)[columnKey] = value;
            if (columnKey === 'taskOwner') {
                tasks[taskIndex].owner = value;
            }
        }
        
        const subtaskIndex = subtasks.findIndex(s => s.id === item.id);
        if (subtaskIndex !== -1) {
            (subtasks[subtaskIndex] as any)[columnKey] = value;
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

function makeGenericCellEditable(cell: HTMLElement, task: Task, columnKey: string): void {
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    cell.title = `Click to edit ${columnKey}`;
    
    cell.addEventListener('mouseenter', () => {
        cell.style.backgroundColor = '#fff0f5';
    });
    
    cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = '';
    });
    
    cell.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const currentValue = cell.textContent?.trim() || '';
        const newValue = prompt(`Enter ${columnKey}:`, currentValue);
        
        if (newValue !== null && newValue.trim() !== '') {
            cell.textContent = newValue.trim();
            (task as any)[columnKey] = newValue.trim();
            showNotification(`${columnKey} updated to: ${newValue}`);
            setTimeout(() => saveAllData(), 100);
        }
    });
}

// ================================
// RECURRENCE FUNCTIONS
// ================================

function makeRecurrenceCellClickable(row: HTMLTableRowElement, task: Task): void {
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
            const currentValue = recurrenceCell.textContent?.trim() || 'None';
            showRecurrenceTypeModal(task, recurrenceCell, currentValue);
        });
    }
}

function showRecurrenceTypeModal(task: Task, cell: HTMLElement, currentValue: string): void {
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
                <div class="task-info-name">${escapeHtml(task.name || (task.taskNameCell?.querySelector('span')?.textContent || 'Task'))}</div>
            </div>
            
            <div class="current-recurrence-section">
                <label class="current-recurrence-label">Current Recurrence</label>
                <div class="current-recurrence-value ${currentValue !== 'None' ? 'recurring' : 'non-recurring'}">
                    ${escapeHtml(currentValue || 'None')}
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
    
    (window as any).currentRecurrenceTask = task;
    (window as any).currentRecurrenceCell = cell;
    
    const closeBtn = modal.querySelector('.close') as HTMLElement;
    const cancelBtn = modal.querySelector('.btn-cancel') as HTMLElement;
    const saveBtn = modal.querySelector('.btn-save') as HTMLElement;
    const select = document.getElementById('recurrenceTypeSelect') as HTMLSelectElement;
    
    const closeModal = () => {
        modal.remove();
    };
    
   const saveRecurrenceType = () => {
    const newValue = select.value;
    console.log('Saving new recurrence value:', newValue);
    
    if ((window as any).currentRecurrenceCell) {
        (window as any).currentRecurrenceCell.textContent = newValue;
        
        if ((window as any).currentRecurrenceTask) {
            const task = (window as any).currentRecurrenceTask;
            task.recurrenceType = newValue;
            
            const row = task.row;
            if (row) {
                const recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
                row.classList.remove('recurring-task', 'non-recurring-task');
                
                // Fix: Replace includes() with indexOf()
                if (recurringOptions.indexOf(newValue) !== -1) {
                    row.classList.add('recurring-task');
                } else {
                    row.classList.add('non-recurring-task');
                }
                
                row.setAttribute('data-recurrence-type', newValue);
            }
        }
        
        setTimeout(() => saveAllData(), 100);
        showNotification(`Recurrence type set to: ${newValue}`);
    }
    
    closeModal();
};
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', saveRecurrenceType);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    setTimeout(() => {
        if (select) select.focus();
    }, 100);
}


function updateRecurrenceClasses(): void {
    tasks.forEach(task => {
        if (task.row) {
            const recurrenceType = task.recurrenceType || 'None';
            const recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
            // Fix: Replace includes() with indexOf()
            const isRecurring = recurringOptions.indexOf(recurrenceType) !== -1;
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

// ================================
// COMMENT FUNCTIONS
// ================================

function updateCommentColumn(): void {
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

function updateCommentCellForRow(row: HTMLTableRowElement, item: Task | Subtask, type: string): void {
    if (!row) return;
    const commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    
    commentCells.forEach(cell => {
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

function createCommentPanel(): HTMLElement {
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
    
    const closeBtn = panel.querySelector('.close-panel') as HTMLElement;
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        activeCommentRowId = null;
        activeCommentType = null;
        cancelEdit();
    });
    
    const postBtn = panel.querySelector('.add-comment-btn') as HTMLElement;
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
            const now = new Date();
            
            // Fix: Replace substr() with substring()
             const newComment: TaskComment = {
                id: 'c' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
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
            if (activeCommentRowId && activeCommentType) {
                renderComments(getCommentKey(activeCommentRowId, activeCommentType));
            }
        }
    });
    
    return panel;
}

function openCommentPanel(rowId: string, type: string): void {
    console.log('Opening comment panel for:', type, rowId);
    
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
                    <span class="comment-author" style="background: ${getUserColor(c.author)}">${escapeHtml(c.author)}</span>
                    <div class="comment-meta">
                        <span class="comment-author-name">${escapeHtml(getAuthorFullName(c.author))}</span>
                        <div class="comment-datetime">
                            <span class="comment-date">${escapeHtml(formattedDate)}</span>
                            <span class="comment-time">${escapeHtml(formattedTime)}</span>
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

function attachCommentEventListeners(list: HTMLElement, commentKey: string): void {
    if (!list) return;
    
    const editButtons = list.querySelectorAll('.edit-comment-btn');
    const deleteButtons = list.querySelectorAll('.delete-comment-btn');
    
    editButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true) as HTMLElement;
        btn.parentNode?.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = newBtn.getAttribute('data-comment-id');
            if (commentId) {
                startEditComment(commentKey, commentId);
            }
        });
    });
    
    deleteButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true) as HTMLElement;
        btn.parentNode?.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = newBtn.getAttribute('data-comment-id');
            if (commentId) {
                deleteComment(commentKey, commentId);
            }
        });
    });
}

function startEditComment(commentKey: string, commentId: string): void {
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
        const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
        const postBtn = panel.querySelector('.add-comment-btn') as HTMLElement;
        
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

function deleteComment(commentKey: string, commentId: string): void {
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

function updateComment(commentKey: string, commentId: string, newText: string): void {
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
        const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
        const postBtn = panel.querySelector('.add-comment-btn') as HTMLElement;
        if (textarea && postBtn) {
            textarea.value = '';
            textarea.placeholder = 'Add a comment...';
            postBtn.textContent = 'Post';
        }
    }
    
    renderComments(commentKey);
}

function cancelEdit(): void {
    editingCommentId = null;
    const panel = document.getElementById('commentPanel');
    if (panel) {
        const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
        const postBtn = panel.querySelector('.add-comment-btn') as HTMLElement;
        if (textarea && postBtn) {
            textarea.value = '';
            textarea.placeholder = 'Add a comment...';
            textarea.removeAttribute('data-editing');
            postBtn.textContent = 'Post';
        }
    }
}

function updateCommentIcon(rowId: string, type: string): void {
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
                if (task) updateCommentCellForRow(row as HTMLTableRowElement, task, 'task');
            } else {
                const subtask = subtasks.find(s => s.row === row);
                if (subtask) updateCommentCellForRow(row as HTMLTableRowElement, subtask, 'subtask');
            }
        }
    }
}

function formatCommentDate(date: Date): string {
    try {
        if (!date || isNaN(date.getTime())) {
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
            const options: Intl.DateTimeFormatOptions = { 
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

function formatCommentTime(date: Date): string {
    try {
        const options: Intl.DateTimeFormatOptions = { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        };
        return date.toLocaleTimeString('en-US', options);
    } catch (e) {
        console.error('Error formatting time:', e);
        return '';
    }
}

// ================================
// DOCUMENT FUNCTIONS
// ================================

function updateCDocColumn(): void {
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

function createCDocIcon(docs: TaskDocument[], row: HTMLTableRowElement): HTMLElement {
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

function updateTDocColumn(): void {
    console.log('Updating TDoc column with Font Awesome icons...');
    
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

function createTDocIcon(row: HTMLTableRowElement, docs: TaskDocument[]): HTMLElement{
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

function showDocumentManager(taskRow: HTMLTableRowElement): void {
    const docs = taskDocuments.get(taskRow) || [];
    let modal = document.getElementById('documentManagerModal');
    
    if (!modal) {
        modal = createDocumentModalHTML();
        document.body.appendChild(modal);
        setupBaseEventListeners(modal, taskRow);
    }
    
    (window as any).currentTaskRow = taskRow;
    updateDocumentsUI(docs, taskRow);
    
    (modal as HTMLElement).style.display = 'block';
}

function addDocumentModalStyles(): void {
    if (document.getElementById('document-modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'document-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'document-modal.css';
    document.head.appendChild(link);
}

function createDocumentModalHTML(): HTMLElement {
    // Ensure styles are loaded
    addDocumentModalStyles();
    
    const modal = document.createElement('div');
    modal.id = 'documentManagerModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>📄 CDoc Document Manager</h3>
            
            <div class="upload-section">
                <h4>Upload New Documents</h4>
                
                <div id="dropArea" class="drop-area">
                    <div class="drop-area-icon"><i class="fa-solid fa-folder-open"></i></div>
                    <div class="drop-area-text">Drag files here or</div>
                    <button id="browseFileBtn" class="btn-browse">Browse</button>
                    <input type="file" id="fileInput" style="display: none;" multiple>
                </div>
                
                <div id="selectedFilesList" class="selected-files-list">
                    <div class="selected-files-header">Selected Files:</div>
                    <div id="filesContainer" class="files-container"></div>
                </div>
                
                <div style="display: flex; justify-content: flex-end;">
                    <button id="uploadSelectedBtn" class="upload-btn">Upload Files</button>
                </div>
            </div>
            
            <div class="documents-section">
                <h4>Attached Documents (<span id="docCount" class="doc-count">0</span>)</h4>
                <div id="documentsListContainer" class="documents-list-container"></div>
            </div>
            
            <div class="modal-footer-doc">
                <button id="closeManagerBtn" class="btn-close-doc">Close</button>
            </div>
        </div>
    `;
    
    return modal;
}

function updateDocumentsUI(docs: TaskDocument[], taskRow: HTMLTableRowElement): void {
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

function setupBaseEventListeners(modal: HTMLElement, taskRow: HTMLTableRowElement): void {
    const closeModal = () => { modal.style.display = 'none'; };

    const closeBtn = modal.querySelector('.close') as HTMLElement;
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    const closeManagerBtn = document.getElementById('closeManagerBtn') as HTMLElement;
    if (closeManagerBtn) closeManagerBtn.addEventListener('click', closeModal);
    
    setupUploadHandlers(modal, taskRow);
}

function setupUploadHandlers(modal: HTMLElement, taskRow: HTMLTableRowElement): void {
    const dropArea = document.getElementById('dropArea') as HTMLElement;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const filesContainer = document.getElementById('filesContainer') as HTMLElement;
    const selectedFilesList = document.getElementById('selectedFilesList') as HTMLElement;
    const uploadBtn = document.getElementById('uploadSelectedBtn') as HTMLElement;
    const browseBtn = document.getElementById('browseFileBtn') as HTMLElement;
    
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;
    
    let selectedFiles: File[] = [];
    
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
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
                <span>📄 ${escapeHtml(file.name)} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button class="remove-file" data-index="${index}" style="background:none; border:none; color:#dc3545; cursor:pointer;">✕</button>
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
           const docs: TaskDocument[] = selectedFiles.map(file => ({
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date()
            }));
        
        console.log('Uploading CDoc documents:', docs.length, 'to row:', currentTaskRow, 'ID:', taskId);
        const existingDocs = taskDocuments.get(currentTaskRow) || [];
        const updatedDocs = [...existingDocs, ...docs];
        taskDocuments.set(currentTaskRow, updatedDocs);
        if (taskId) {
            taskDocuments.set(taskId, updatedDocs);
        }
        
        console.log('CDoc Map now has:', taskDocuments.get(currentTaskRow)?.length, 'docs');
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
        console.log('Auto-saving after CDoc upload...');
        saveAllData();
    });
}

function renderDocumentsList(docs: TaskDocument[], taskRow: HTMLTableRowElement): string {
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
                                    <span class="tdoc-file-name">${escapeHtml(doc.name)}</span>
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

function attachDocumentEventListeners(taskRow: HTMLTableRowElement): void {
    document.querySelectorAll('.view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
            const docs = taskDocuments.get(taskRow) || [];
            if (docs[index]) {
                previewDocument(docs[index]);
            }
        });
    });
    
    document.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
            showDeleteConfirmation(taskRow, index);
        });
    });
}

function showDeleteConfirmation(taskRow: HTMLTableRowElement, index: number): void {
    const docs = taskDocuments.get(taskRow) || [];
    const doc = docs[index];
    
    if (!doc) return;
    
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
        deleteDocument(taskRow, index);
    }
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
        
        const managerModal = document.getElementById('documentManagerModal');
        if (managerModal && managerModal.style.display === 'block') {
            const listContainer = document.getElementById('documentsListContainer');
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

function addTDocModalStyles(): void {
    if (document.getElementById('tdoc-modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'tdoc-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'tdoc-modal.css';
    document.head.appendChild(link);
}

function showTDocDocumentManager(taskRow: HTMLTableRowElement): void {
    // Ensure styles are loaded
    addTDocModalStyles();
    
    const docs = taskTDocDocuments.get(taskRow) || [];
    let modal = document.getElementById('tdocDocumentManagerModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tdocDocumentManagerModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>📄 TDoc Document Manager</h3>
                
                <div class="upload-section">
                    <h4>Upload New Documents</h4>
                    
                    <div id="tdocDropArea" class="drop-area">
                        <div class="drop-area-icon"><i class="fa-solid fa-folder-open"></i></div>
                        <div class="drop-area-text">Drag files here or</div>
                        <button id="tdocBrowseFileBtn" class="btn-browse">Browse</button>
                        <input type="file" id="tdocFileInput" style="display: none;" multiple>
                    </div>
                    
                    <div id="tdocSelectedFilesList" class="selected-files-list">
                        <div class="selected-files-header">Selected Files:</div>
                        <div id="tdocFilesContainer" class="files-container"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end;">
                        <button id="tdocUploadSelectedBtn" class="upload-btn">Upload Files</button>
                    </div>
                </div>
                
                <div class="documents-section">
                    <h4>Attached Documents (<span id="tdocDocCount" class="doc-count">${docs.length}</span>)</h4>
                    <div id="tdocDocumentsListContainer" class="documents-list-container"></div>
                </div>
                
                <div class="modal-footer-doc">
                    <button id="tdocCloseManagerBtn" class="btn-close-doc">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.close') as HTMLElement;
        closeBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
        
        const closeManagerBtn = document.getElementById('tdocCloseManagerBtn') as HTMLElement;
        closeManagerBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }
    
    modal.setAttribute('data-current-task-row', taskRow.id || Math.random().toString(36));
    (window as any).currentTDocTaskRow = taskRow;
    
    const listContainer = document.getElementById('tdocDocumentsListContainer');
    if (listContainer) {
        listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
        attachTDocDocumentEventListeners(taskRow);
    }
    
    const countSpan = document.getElementById('tdocDocCount');
    if (countSpan) countSpan.textContent = docs.length.toString();
    
    setupTDocUploadHandlers(modal, taskRow);
    modal.style.display = 'block';
}

function renderTDocDocumentsList(docs: TaskDocument[], taskRow: HTMLTableRowElement): string{
    if (docs.length === 0) {
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
                ${docs.map((doc, index) => {
                    const fileSize = (doc.size / 1024).toFixed(1);
                    const dateStr = doc.uploadDate.toLocaleDateString();
                    const timeStr = doc.uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return `
                        <tr data-tdoc-doc-index="${index}">
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 20px;">📄</span>
                                    <span style="font-weight: 500;">${escapeHtml(doc.name)}</span>
                                </div>
                            </td>
                            <td>${fileSize} KB</td>
                            <td>
                                ${dateStr} 
                                <span style="color: #999; font-size: 11px;">${timeStr}</span>
                            </td>
                            <td style="text-align: center;">
                                <button class="tdoc-action-btn tdoc-view-btn tdoc-view-doc-btn" 
                                        data-index="${index}" title="View">👁️</button>
                                <button class="tdoc-action-btn tdoc-delete-btn tdoc-delete-doc-btn" 
                                        data-index="${index}" title="Delete">🗑</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function attachTDocDocumentEventListeners(taskRow: HTMLTableRowElement): void {
    document.querySelectorAll('.tdoc-view-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
            const docs = taskTDocDocuments.get(taskRow) || [];
            if (docs[index]) previewDocument(docs[index]);
        });
    });
    
    document.querySelectorAll('.tdoc-delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
            showTDocDeleteConfirmation(taskRow, index);
        });
    });
}

function showTDocDeleteConfirmation(taskRow: HTMLTableRowElement, index: number): void {
    const docs = taskTDocDocuments.get(taskRow) || [];
    const doc = docs[index];
    if (!doc) return;
    
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
        deleteTDocDocument(taskRow, index);
    }
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
        
        const managerModal = document.getElementById('tdocDocumentManagerModal');
        if (managerModal && managerModal.style.display === 'block') {
            const listContainer = document.getElementById('tdocDocumentsListContainer');
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

function addTDocUploadStyles(): void {
    if (document.getElementById('tdoc-upload-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'tdoc-upload-styles';
    link.rel = 'stylesheet';
    link.href = 'tdoc-upload.css';
    document.head.appendChild(link);
}

function setupTDocUploadHandlers(modal: HTMLElement, taskRow: HTMLTableRowElement): void {
    // Ensure styles are loaded
    addTDocUploadStyles();
    
    const dropArea = document.getElementById('tdocDropArea') as HTMLElement;
    const fileInput = document.getElementById('tdocFileInput') as HTMLInputElement;
    const filesContainer = document.getElementById('tdocFilesContainer') as HTMLElement;
    const selectedFilesList = document.getElementById('tdocSelectedFilesList') as HTMLElement;
    const uploadBtn = document.getElementById('tdocUploadSelectedBtn') as HTMLElement;
    const browseBtn = document.getElementById('tdocBrowseFileBtn') as HTMLElement;
    
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn) return;
    
    let selectedFiles: File[] = [];
    
    // Add CSS classes
    dropArea.classList.add('tdoc-drop-area');
    selectedFilesList.classList.add('tdoc-selected-files');
    uploadBtn.classList.add('tdoc-upload-btn');
    
    browseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-over');
        dropArea.classList.remove('normal');
    });
    
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        dropArea.classList.add('normal');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        dropArea.classList.add('normal');
        const files = Array.from(e.dataTransfer?.files || []);
        selectedFiles = [...selectedFiles, ...files];
        updateSelectedFilesList();
    });
    
    function updateSelectedFilesList(): void {
        if (selectedFiles.length === 0) {
            selectedFilesList.classList.remove('show');
            uploadBtn.classList.remove('show');
            return;
        }
        
        selectedFilesList.classList.add('show');
        uploadBtn.classList.add('show');
        
        filesContainer.innerHTML = selectedFiles.map((file, index) => `
            <div class="tdoc-file-item" data-file-index="${index}">
                <div class="tdoc-file-info">
                    <span class="tdoc-file-icon">📄</span>
                    <span class="tdoc-file-name">${escapeHtml(file.name)}</span>
                    <span class="tdoc-file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button class="tdoc-remove-file" data-index="${index}">✕</button>
            </div>
        `).join('');
        
        filesContainer.querySelectorAll('.tdoc-remove-file').forEach(btn => {
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
            showNotification('Please select files to upload', 'info');
            return;
        }
        
        const currentTaskRow = (window as any).currentTDocTaskRow || taskRow;
        if (!currentTaskRow) {
            showNotification('Error: Task not found', 'error');
            return;
        }
        
        // Add loading state
        uploadBtn.classList.add('uploading');
        const originalText = uploadBtn.textContent;
        uploadBtn.textContent = 'Uploading...';
        
        const taskId = currentTaskRow.dataset?.taskId || currentTaskRow.dataset?.subtaskId;
        if (!taskId) {
            const newId = currentTaskRow.classList.contains('task-row') ? 
                'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7) :
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
            
            if (currentTaskRow.classList.contains('task-row')) {
                if (currentTaskRow.dataset) currentTaskRow.dataset.taskId = newId;
                const task = tasks.find(t => t.row === currentTaskRow);
                if (task) task.id = newId;
            } else {
                if (currentTaskRow.dataset) currentTaskRow.dataset.subtaskId = newId;
                const subtask = subtasks.find(s => s.row === currentTaskRow);
                if (subtask) subtask.id = newId;
            }
        }
        
        const docs: TaskDocument[] = selectedFiles.map(file => ({
            id: Date.now() + '_' + Math.random().toString(36).substring(2, 11),
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
        
        // Reset button state
        uploadBtn.classList.remove('uploading');
        uploadBtn.textContent = originalText;
        
        showNotification(`${docs.length} file(s) uploaded successfully`, 'success');
        
        setTimeout(() => {
            console.log('Auto-saving after TDoc upload...');
            saveAllData();
        }, 100);
    });
}

function previewDocument(doc: TaskDocument): void{
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (!previewWindow) return;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${escapeHtml(doc.name)}</title>
           
        </head>
        <body>
            <div class="container">
                <div class="doc-header">
                    <div class="doc-icon">📄</div>
                    <div class="doc-title">${escapeHtml(doc.name)}</div>
                </div>

                <div class="doc-meta">
                    <div class="meta-row">
                        <span class="meta-label">Size:</span>
                        <span class="meta-value">${(doc.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Type:</span>
                        <span class="meta-value">${escapeHtml(doc.type) || 'Unknown'}</span>
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
        </body>
        </html>
    `;

    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
}

// ================================
// VISIBILITY FUNCTIONS
// ================================

function applyVisibility(): void {
    const mainHeader = document.getElementById('mainHeader');
    const subtaskHeader = document.getElementById('subtaskHeader');
    if (!mainHeader) return;
    
    const visibleColumns = columnConfig.filter(col => col.visible !== false).map(col => col.key);
    console.log('Visible columns:', visibleColumns);
    
    const baseIndices: Record<string, number> = {
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
        if (key && visibleColumns.includes(key)) {
            (th as HTMLElement).style.display = '';
        } else {
            (th as HTMLElement).style.display = 'none';
        }
    });
    
    document.querySelectorAll('.task-row').forEach(row => {
        const htmlRow = row as HTMLTableRowElement;
        for (let i = 0; i < htmlRow.cells.length; i++) {
            if (htmlRow.cells[i]) {
                htmlRow.cells[i].style.display = 'none';
            }
        }
        
        visibleColumns.forEach(key => {
            if (baseIndices[key] !== undefined) {
                if (htmlRow.cells[baseIndices[key]]) {
                    htmlRow.cells[baseIndices[key]].style.display = '';
                }
            }
        });
        
        row.querySelectorAll('.extra-cell').forEach(cell => {
            const key = cell.getAttribute('data-column');
            if (key && visibleColumns.includes(key)) {
                (cell as HTMLElement).style.display = '';
            } else {
                (cell as HTMLElement).style.display = 'none';
            }
        });
    });
    
    document.querySelectorAll('.subtask-row').forEach(row => {
        const htmlRow = row as HTMLTableRowElement;
        for (let i = 0; i < htmlRow.cells.length; i++) {
            if (htmlRow.cells[i]) {
                htmlRow.cells[i].style.display = 'none';
            }
        }
        if (htmlRow.cells[0]) {
            htmlRow.cells[0].style.display = '';
        }
        
        visibleColumns.forEach(key => {
            const col = columnConfig.find(c => c.key === key);
            if (col && col.forSubtask) {
                const subtaskIndices: Record<string, number> = {
                    tdoc: 2,
                    dueDate: 3,
                    status: 4,
                    owner: 5,
                    reviewer: 6
                };
                
                if (subtaskIndices[key] !== undefined) {
                    if (htmlRow.cells[subtaskIndices[key]]) {
                        htmlRow.cells[subtaskIndices[key]].style.display = '';
                    }
                }
            }
        });
        
        row.querySelectorAll('.extra-cell').forEach(cell => {
            const key = cell.getAttribute('data-column');
            const col = columnConfig.find(c => c.key === key);
            if (col && col.forSubtask && key && visibleColumns.includes(key)) {
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


function applyVisibilityForMainList(mainList: MainList): void {
    if (!mainList || !mainList.tableElement) return;
    
    const visibleColumns = columnConfig.filter(col => col.visible !== false).map(col => col.key);
    const baseIndices: Record<string, number> = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    
    const headerRow = mainList.tableElement.querySelector('thead tr');
    if (headerRow) {
        Array.from(headerRow.children).forEach((th, idx) => {
            const colKey = th.getAttribute('data-column');
            if (colKey) {
                // Fix: Replace includes() with indexOf()
                (th as HTMLElement).style.display = visibleColumns.indexOf(colKey) !== -1 ? '' : 'none';
            } else {
                const baseKey = Object.keys(baseIndices)[idx];
                if (baseKey) {
                    // Fix: Replace includes() with indexOf()
                    (th as HTMLElement).style.display = visibleColumns.indexOf(baseKey) !== -1 ? '' : 'none';
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
                        // Fix: Replace includes() with indexOf()
                        (cell as HTMLElement).style.display = visibleColumns.indexOf(baseKey) !== -1 ? '' : 'none';
                    }
                }
            });
            
            row.querySelectorAll('.extra-cell').forEach(cell => {
                const colKey = cell.getAttribute('data-column');
                if (colKey) {
                    // Fix: Replace includes() with indexOf()
                    (cell as HTMLElement).style.display = visibleColumns.indexOf(colKey) !== -1 ? '' : 'none';
                }
            });
        });
        
        const sublistRows = tbody.querySelectorAll('.sub-list-row td');
        sublistRows.forEach(td => {
            td.setAttribute('colspan', visibleColumns.length.toString());
        });
    }
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
        // Fix: Replace includes() with indexOf()
        if (baseColumns.indexOf(col.key) === -1 && col.visible) {
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
        const td = subtaskHeader.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
        }
    }
}

// ================================
// SORTING FUNCTIONS
// ================================

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
            toggleSortForTable(header as HTMLElement, columnKey);
        });
        
        header.addEventListener('mouseenter', () => {
            (header as HTMLElement).style.backgroundColor = '#fff0f5';
        });
        
        header.addEventListener('mouseleave', () => {
            (header as HTMLElement).style.backgroundColor = '';
        });
    });
    
    console.log('Sort icons added to', allHeaders.length, 'headers');
}

function getColumnKeyFromText(text: string): string {
    const columnMap: Record<string, string> = {
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
    
    let sortState: SortState | null = null;
    let currentDirection: 'asc' | 'desc' = 'asc';
    let currentColumn: string | null = null;
    
    const stateAttr = table.getAttribute('data-sort-state');
    if (stateAttr) {
        try {
            const state = JSON.parse(stateAttr) as SortState;
            currentColumn = state.column;
            currentDirection = state.direction;
        } catch(e) {}
    }
    
    let newDirection: 'asc' | 'desc' = 'asc';
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

function updateSortIconsInTable(table: Element, activeHeader: HTMLElement, direction: 'asc' | 'desc'): void {
    table.querySelectorAll('.sort-icon').forEach(icon => {
        icon.innerHTML = ' ↕️';
        (icon as HTMLElement).style.opacity = '0.5';
        (icon as HTMLElement).style.color = '';
    });
    
    const activeIcon = activeHeader.querySelector('.sort-icon') as HTMLElement;
    if (activeIcon) {
        activeIcon.innerHTML = direction === 'asc' ? ' ↑' : ' ↓';
        activeIcon.style.opacity = '1';
        activeIcon.style.color = '';
    }
}

function sortTableByColumnPreservingHierarchy(columnKey: string, direction: 'asc' | 'desc'): void {
    console.log('Sorting by', columnKey, direction);
    const tables = document.querySelectorAll('.main-list-table-container .skystemtaskmaster-table');
    
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const allRows = Array.from(tbody.querySelectorAll('tr'));
        
        const mainListRows = allRows.filter(row => row.classList.contains('main-list-title-row'));
        const subListRows = allRows.filter(row => row.classList.contains('sub-list-row'));
        const taskRows = allRows.filter(row => row.classList.contains('task-row'));
        
        const tasksBySublist: Record<string, HTMLTableRowElement[]> = {};
        taskRows.forEach(row => {
            const sublistId = row.getAttribute('data-sublist-id') || '';
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
                
                const sublistId = sublistRow.getAttribute('data-sublist-id') || '';
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

function getCellValueForSort(row: HTMLTableRowElement, columnKey: string): string | number {
    const baseIndices: Record<string, number> = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    
    if (baseIndices[columnKey] !== undefined) {
        const cell = row.cells[baseIndices[columnKey]];
        if (!cell) return '';
        
        if (columnKey === 'status' || columnKey === 'owner' || columnKey === 'reviewer') {
            const badge = cell.querySelector('.skystemtaskmaster-status-badge, .skystemtaskmaster-badge');
            return badge ? (badge.textContent?.trim() || '') : (cell.textContent?.trim() || '');
        }
        
        if (columnKey === 'days') {
            const val = cell.textContent?.trim() || '0';
            return parseInt(val.replace('+', '')) || 0;
        }
        
        if (columnKey === 'dueDate') {
            const val = cell.textContent?.trim() || '';
            if (val === 'Set due date') return 0;
            return new Date(val).getTime() || 0;
        }
        
        return cell.textContent?.trim() || '';
    }
    
    const extraCell = Array.from(row.querySelectorAll('.extra-cell')).find(
        cell => cell.getAttribute('data-column') === columnKey
    );
    return extraCell ? (extraCell.textContent?.trim() || '') : '';
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
// SAVE/LOAD FUNCTIONS
// ================================

function saveAllData(): boolean {  // Changed from void to boolean
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
        
        tasks.forEach(task => {
            if (task.id && task.row) {
                const docs = taskDocuments.get(task.row);
                if (docs && docs.length > 0) {
                    (data.cdocDocuments as any)[task.id] = docs;
                }
                const tdocs = taskTDocDocuments.get(task.row);
                if (tdocs && tdocs.length > 0) {
                    (data.tdocDocuments as any)[task.id] = tdocs;
                }
                const accounts = taskAccounts.get(task.row);
                if (accounts && accounts.length > 0) {
                    (data.linkedAccountsMap as any)[task.id] = accounts;
                }
            }
        });
        
        subtasks.forEach(subtask => {
            if (subtask.id && subtask.row) {
                const docs = taskDocuments.get(subtask.row);
                if (docs && docs.length > 0) {
                    (data.cdocDocuments as any)[subtask.id] = docs;
                }
                const tdocs = taskTDocDocuments.get(subtask.row);
                if (tdocs && tdocs.length > 0) {
                    (data.tdocDocuments as any)[subtask.id] = tdocs;
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
        }
        
        if (data.mainLists) {
            data.mainLists.forEach((mainListData: any) => {
                const mainList: MainList = {
                    id: mainListData.id,
                    name: mainListData.name,
                    subLists: [],
                    row: null,
                    tableContainer: null,
                    tableElement: null,
                    tbody: null,
                    titleRow: null,
                    plusIcon: null,
                    dropdownContent: null,
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
        
        if (data.tasks) {
            data.tasks.forEach((taskData: any) => {
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
                    const subtask: Subtask = {
                        id: subtaskData.id,
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
                }
            });
        }
        
        setTimeout(() => {
            tasks.forEach(task => {
                if (task.row && task.id) {
                    task.row.dataset.taskId = task.id;
                }
            });
            
            subtasks.forEach(subtask => {
                if (subtask.row && subtask.id) {
                    subtask.row.dataset.subtaskId = subtask.id;
                }
            });
            
            if (data.cdocDocuments) {
                tasks.forEach(task => {
                    if (task.id && task.row && (data.cdocDocuments as any)[task.id]) {
                        taskDocuments.set(task.row, (data.cdocDocuments as any)[task.id]);
                    }
                });
                subtasks.forEach(subtask => {
                    if (subtask.id && subtask.row && (data.cdocDocuments as any)[subtask.id]) {
                        taskDocuments.set(subtask.row, (data.cdocDocuments as any)[subtask.id]);
                    }
                });
            }
            
            if (data.tdocDocuments) {
                tasks.forEach(task => {
                    if (task.id && task.row && (data.tdocDocuments as any)[task.id]) {
                        taskTDocDocuments.set(task.row, (data.tdocDocuments as any)[task.id]);
                    }
                });
                subtasks.forEach(subtask => {
                    if (subtask.id && subtask.row && (data.tdocDocuments as any)[subtask.id]) {
                        taskTDocDocuments.set(subtask.row, (data.tdocDocuments as any)[subtask.id]);
                    }
                });
            }
            
            if (data.linkedAccountsMap) {
                tasks.forEach(task => {
                    if (task.id && task.row && (data.linkedAccountsMap as any)[task.id]) {
                        taskAccounts.set(task.row, (data.linkedAccountsMap as any)[task.id]);
                    }
                });
            }
            
            updateTDocColumn();
            updateCDocColumn();
            refreshLinkedAccountsColumn();
            
            updateCommentColumn();
            
            setTimeout(() => {
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

function refreshLinkedAccountsColumn(): void {
    document.querySelectorAll('.extra-cell[data-column="linkedAccounts"]').forEach(cell => {
        const row = cell.closest('tr');
        if (!row) return;
        
        const task = tasks.find(t => t.row === row);
        if (!task) return;
        
        const taskId = task.id || row.getAttribute('data-task-id') || '';
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
                    showAccountDetails(account, row as HTMLTableRowElement, task);
                };
                
                cell.appendChild(badge);
            });
            
            const addMore = document.createElement('span');
            addMore.className = 'add-more-icon';
            addMore.textContent = '+';
            addMore.onclick = (e) => {
                e.stopPropagation();
                showAccountLinkingModal(row as HTMLTableRowElement, task);
            };
            cell.appendChild(addMore);
            
        } else {
            const addIcon = document.createElement('span');
            addIcon.className = 'add-link-btn';
            addIcon.textContent = '+ Link Account';
            addIcon.onclick = (e) => {
                e.stopPropagation();
                showAccountLinkingModal(row as HTMLTableRowElement, task);
            };
            cell.appendChild(addIcon);
        }
    });
}

function addAccountTooltipStyles(): void {
    if (document.getElementById('account-tooltip-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'account-tooltip-styles';
    link.rel = 'stylesheet';
    link.href = 'account-styles.css';
    document.head.appendChild(link);
}

function showAccountDetails(account: Account, taskRow: HTMLTableRowElement, task: Task): void {
    // Ensure styles are loaded
    addAccountTooltipStyles();
    
    document.querySelectorAll('.account-tooltip').forEach(el => el.remove());

    const tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';
    
    const ownerNames = account.accountOwners?.map(o => getAuthorFullName(o)).join(', ') || 'None';
    const linkedStr = account.linkedDate ? new Date(account.linkedDate).toLocaleString() : '—';

    tooltip.innerHTML = `
        <div class="tooltip-header">
            <i class="fas fa-chart-line"></i>
            ${escapeHtml(account.accountNumber || account.accountName)}
        </div>
        <div class="tooltip-content">
            <table class="tooltip-table">
                <tr><td>Org Hierarchy:</td><td>${escapeHtml(account.orgHierarchy || '—')}</td></tr>
                <tr><td>FS Caption:</td><td>${escapeHtml(account.fsCaption || '—')}</td></tr>
                <tr><td>Account Name:</td><td>${escapeHtml(account.accountName || '—')}</td></tr>
                <tr><td>Account Owners:</td><td>${escapeHtml(ownerNames)}</td></tr>
                <tr><td>Account Range:</td><td>${escapeHtml(account.accountFrom || '0')} - ${escapeHtml(account.accountTo || '∞')}</td></tr>
                <tr><td>Due Days Range:</td><td>${account.dueDaysFrom || '0'} - ${account.dueDaysTo || '∞'} days</td></tr>
                <tr><td>Key Account:</td><td>${escapeHtml(account.isKeyAccount || '—')}</td></tr>
                <tr><td>Risk Rating:</td><td>${escapeHtml(account.riskRating || '—')}</td></tr>
                <tr><td>Linked:</td><td>${escapeHtml(linkedStr)}</td></tr>
            </table>
        </div>
        <div class="tooltip-actions">
            <button class="btn-tooltip-close">Close</button>
            <button class="btn-tooltip-remove">Remove</button>
        </div>
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = taskRow.getBoundingClientRect();
    tooltip.style.left = (rect.left + window.scrollX + 50) + 'px';
    tooltip.style.top = (rect.top + window.scrollY - 100) + 'px';
    
    // Adjust if tooltip goes off screen
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
        tooltip.style.left = (rect.left + window.scrollX - tooltipRect.width - 10) + 'px';
    }
    if (tooltipRect.top < 0) {
        tooltip.style.top = (rect.top + window.scrollY + 30) + 'px';
    }
    
    tooltip.querySelector('.btn-tooltip-close')?.addEventListener('click', () => {
        tooltip.classList.add('fade-out');
        setTimeout(() => tooltip.remove(), 200);
    });
    
    tooltip.querySelector('.btn-tooltip-remove')?.addEventListener('click', () => {
        const taskId = task.id || task.row?.getAttribute('data-task-id') || '';
        const accounts = taskAccounts.get(task.row!) || taskAccounts.get(taskId) || [];
        const updatedAccounts = accounts.filter(a => a.accountNumber !== account.accountNumber);
        
        if (updatedAccounts.length === 0) {
            taskAccounts.delete(task.row!);
            taskAccounts.delete(taskId);
        } else {
            taskAccounts.set(task.row!, updatedAccounts);
            taskAccounts.set(taskId, updatedAccounts);
        }
        
        tooltip.classList.add('fade-out');
        setTimeout(() => {
            tooltip.remove();
            refreshLinkedAccountsColumn();
            showNotification(`Account ${account.accountNumber} removed`);
            setTimeout(() => saveAllData(), 100);
        }, 200);
    });
    
    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e) {
            if (!tooltip.contains(e.target as Node)) {
                tooltip.classList.add('fade-out');
                setTimeout(() => {
                    tooltip.remove();
                    document.removeEventListener('click', closeHandler);
                }, 200);
            }
        });
    }, 100);
}

function showAccountLinkingModal(taskRow: HTMLTableRowElement, task: Task): void {
    // Ensure styles are loaded
    addAccountTooltipStyles();
    
    const existingModal = document.getElementById('accountLinkingModal');
    if (existingModal) existingModal.remove();

    const taskName = task.name || task.taskNameCell?.querySelector('span')?.textContent || 'Task';
    
    const modal = document.createElement('div');
    modal.id = 'accountLinkingModal';
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3 class="cdoc-header">📊 Link Account to Task</h3>
            
            <div class="account-info-box">
                <div class="account-info-label">Task:</div>
                <div class="account-info-name">${escapeHtml(taskName)}</div>
            </div>
            
            <div class="account-form-grid">
                <div>
                    <h4 class="account-section-title">Account Details</h4>
                    <div class="account-form-group">
                        <label class="account-form-label">Organizational Hierarchy</label>
                        <select id="orgHierarchy" class="account-form-select">
                            <option value="">Select Hierarchy...</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Division">Division</option>
                            <option value="Department">Department</option>
                            <option value="Subsidiary">Subsidiary</option>
                        </select>
                    </div>
                    <div class="account-form-group">
                        <label class="account-form-label">FS Caption</label>
                        <input type="text" id="fsCaption" class="account-form-input" placeholder="e.g., Cash & Equivalents">
                    </div>
                    <div class="account-form-group">
                        <label class="account-form-label">Account Name *</label>
                        <input type="text" id="accountName" class="account-form-input" placeholder="e.g., Cash & Cash Equivalents">
                    </div>
                    <div class="account-form-group">
                        <label class="account-form-label">Account Owners</label>
                        <select id="accountOwners" class="account-form-multiple" multiple size="3">
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
                    <h4 class="account-section-title">Account Range & Settings</h4>
                    <div class="number-input-row">
                        <div class="account-form-group">
                            <label class="account-form-label">Account # From</label>
                            <input type="text" id="accountFrom" class="account-form-input" placeholder="e.g., 1000">
                        </div>
                        <div class="account-form-group">
                            <label class="account-form-label">Account # To</label>
                            <input type="text" id="accountTo" class="account-form-input" placeholder="e.g., 1999">
                        </div>
                    </div>
                    <div class="number-input-row">
                        <div class="account-form-group">
                            <label class="account-form-label">Due Days From</label>
                            <input type="number" id="dueDaysFrom" class="account-form-input" placeholder="0">
                        </div>
                        <div class="account-form-group">
                            <label class="account-form-label">Due Days To</label>
                            <input type="number" id="dueDaysTo" class="account-form-input" placeholder="30">
                        </div>
                    </div>
                    <div class="account-form-group">
                        <label class="account-form-label">Is Key Account</label>
                        <select id="isKeyAccount" class="account-form-select">
                            <option value="All">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div class="account-form-group">
                        <label class="account-form-label">Risk Rating</label>
                        <select id="riskRating" class="account-form-select">
                            <option value="All">All</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="account-modal-footer">
                <button id="cancelAccountBtn" class="btn-cancel-account">Cancel</button>
                <button id="linkAccountBtn" class="btn-link-account">Link Account</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const close = () => {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 200);
    };
    
    modal.querySelector('.close')?.addEventListener('click', close);
    document.getElementById('cancelAccountBtn')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    
    document.getElementById('linkAccountBtn')?.addEventListener('click', () => {
        const accountName = (document.getElementById('accountName') as HTMLInputElement).value.trim();
        if (!accountName) {
            showNotification('Please enter Account Name', 'error');
            return;
        }
        
        const account: Account = {
            orgHierarchy: (document.getElementById('orgHierarchy') as HTMLSelectElement).value,
            fsCaption: (document.getElementById('fsCaption') as HTMLInputElement).value.trim(),
            accountName: accountName,
            accountNumber: (document.getElementById('accountFrom') as HTMLInputElement).value || accountName,
            accountOwners: Array.from((document.getElementById('accountOwners') as HTMLSelectElement).selectedOptions).map(opt => opt.value),
            accountFrom: (document.getElementById('accountFrom') as HTMLInputElement).value.trim(),
            accountTo: (document.getElementById('accountTo') as HTMLInputElement).value.trim(),
            dueDaysFrom: parseInt((document.getElementById('dueDaysFrom') as HTMLInputElement).value) || 0,
            dueDaysTo: parseInt((document.getElementById('dueDaysTo') as HTMLInputElement).value) || 0,
            isKeyAccount: (document.getElementById('isKeyAccount') as HTMLSelectElement).value,
            riskRating: (document.getElementById('riskRating') as HTMLSelectElement).value,
            linkedDate: new Date().toISOString(),
            linkedBy: 'PK'
        };
        
        const taskId = task.id || task.row?.getAttribute('data-task-id') || '';
        const current = taskAccounts.get(task.row!) || taskAccounts.get(taskId) || [];
        const updated = [...current, account];
        
        taskAccounts.set(task.row!, updated);
        if (taskId) taskAccounts.set(taskId, updated);
        task.linkedAccounts = JSON.stringify(updated);
        
        refreshLinkedAccountsColumn();
        close();
        showNotification(`Account "${accountName}" linked`, 'success');
        setTimeout(() => saveAllData(), 100);
    });
}

// ================================
// UTILITY FUNCTIONS
// ================================

function calculateDays(): void {
    const today = new Date();
    
    tasks.forEach(task => {
        if (!task.dueDateCell) return;
        const dueText = task.dueDateCell.innerText;
        if (dueText === 'Set due date') return;
        
        const dueDate = new Date(dueText);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (!isNaN(diffDays) && task.daysCell) {
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

function makeOwnerReviewerClickable(): void {
    tasks.forEach(task => {
        const ownerCell = task.row?.cells[5];
        const reviewerCell = task.row?.cells[6];
        if (ownerCell) makeCellClickable(ownerCell, 'owner', task);
        if (reviewerCell) makeCellClickable(reviewerCell, 'reviewer', task);
    });
    
    subtasks.forEach(subtask => {
        if (subtask.ownerCell) makeCellClickable(subtask.ownerCell, 'owner', subtask);
        if (subtask.reviewerCell) makeCellClickable(subtask.reviewerCell, 'reviewer', subtask);
    });
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
        
        const newCell = cell.cloneNode(true) as HTMLElement;
        cell.parentNode?.replaceChild(newCell, cell);
        
        newCell.style.cursor = 'pointer';
        newCell.style.transition = 'all 0.2s ease';
        newCell.style.userSelect = 'none';
        newCell.setAttribute('title', 'Click to change recurrence type');
        
        newCell.addEventListener('mouseenter', function(this: HTMLElement) {
            this.style.backgroundColor = '#fff0f5';
            this.style.transform = 'scale(1.02)';
            this.style.fontWeight = 'bold';
            this.style.boxShadow = '0 2px 4px rgba(255,0,128,0.2)';
        });
        
        newCell.addEventListener('mouseleave', function(this: HTMLElement) {
            this.style.backgroundColor = '';
            this.style.transform = 'scale(1)';
            this.style.fontWeight = '';
            this.style.boxShadow = 'none';
        });
        
        newCell.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            console.log('Recurrence cell clicked!');
            const row = (e.currentTarget as HTMLElement).closest('tr');
            if (!row) {
                console.error('No parent row found');
                return;
            }
            const task = tasks.find(t => t.row === row);
            if (!task) {
                console.error('No task found for row');
                return;
            }
            const currentValue = (e.currentTarget as HTMLElement).textContent?.trim() || 'None';
            console.log('Current value:', currentValue);
            showRecurrenceTypeModal(task, e.currentTarget as HTMLElement, currentValue);
        });
        
        console.log(`Cell ${index} initialized with click handler`);
    });
}

function addRecurrenceEditor(): void {
    addRecurrenceStyles();
    makeRecurrenceCellsClickable();
}

function deleteSelectedItems(): void {
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
    
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        const checkbox = task.row?.querySelector('.task-checkbox') as HTMLInputElement;
        
        if (checkbox && checkbox.checked) {
            const subList = subLists.find(s => s.id === task.subListId);
            if (subList) {
                const taskIndex = subList.tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) subList.tasks.splice(taskIndex, 1);
            }
            
            task.row?.remove();
            tasks.splice(i, 1);
            deleted++;
        }
    }
    
    for (let i = subtasks.length - 1; i >= 0; i--) {
        const subtask = subtasks[i];
        const checkbox = subtask.row?.querySelector('.subtask-checkbox') as HTMLInputElement;
        
        if (checkbox && checkbox.checked) {
            subtask.row?.remove();
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
    
    (window as any).createSubList = function(mainList: MainList, subListName: string) {
        const result = originalCreateSubList(mainList, subListName);
        setTimeout(() => saveAllData(), 100);
        return result;
    };
    
    (window as any).createTask = function(subList: SubList, taskData: Partial<Task>) {
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
        if (e.target instanceof HTMLElement && 
            (e.target.closest('.skystemtaskmaster-status-badge') || 
             e.target.closest('.skystemtaskmaster-badge'))) {
            setTimeout(() => saveAllData(), 200);
        }
    });
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

function initializeEventListeners(): void {
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
            if (newTaskOptionsModal) newTaskOptionsModal.style.display = 'none';
            if (enterListNameModal) enterListNameModal.style.display = 'none';
            if (importTasksModal) importTasksModal.style.display = 'none';
            if (addTaskModal) addTaskModal.style.display = 'none';
            if (addSubtaskModal) addSubtaskModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === newTaskOptionsModal && newTaskOptionsModal) newTaskOptionsModal.style.display = 'none';
        if (event.target === enterListNameModal && enterListNameModal) enterListNameModal.style.display = 'none';
        if (event.target === importTasksModal && importTasksModal) importTasksModal.style.display = 'none';
        if (event.target === addTaskModal && addTaskModal) addTaskModal.style.display = 'none';
        if (event.target === addSubtaskModal && addSubtaskModal) addSubtaskModal.style.display = 'none';
    });
    
    const newListOption = document.getElementById('newListOption');
    if (newListOption) {
        newListOption.addEventListener('click', () => {
            if (newTaskOptionsModal) newTaskOptionsModal.style.display = 'none';
            if (enterListNameModal) enterListNameModal.style.display = 'block';
            if (newTaskDropdown) newTaskDropdown.style.display = 'none';
        });
    }
    
    const importTasksOption = document.getElementById('importTasksOption');
    if (importTasksOption) {
        importTasksOption.addEventListener('click', () => {
            if (newTaskOptionsModal) newTaskOptionsModal.style.display = 'none';
            if (importTasksModal) importTasksModal.style.display = 'block';
            if (newTaskDropdown) newTaskDropdown.style.display = 'none';
        });
    }
    
    const createListBtn = document.getElementById('createListBtn');
    const listNameInput = document.getElementById('listNameInput') as HTMLInputElement;
    
    if (createListBtn) {
        createListBtn.addEventListener('click', () => {
            const listName = listNameInput.value.trim();
            if (listName) {
                createMainList(listName);
                if (enterListNameModal) enterListNameModal.style.display = 'none';
                listNameInput.value = '';
            } else {
                alert('Please enter a list name');
            }
        });
    }
    
    const addTaskBtn = document.getElementById('addTaskBtn');
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
            
            if (addTaskModal) addTaskModal.style.display = 'none';
            (document.getElementById('addTaskName') as HTMLInputElement).value = '';
        });
    }
    
    const addSubtaskBtn = document.getElementById('addSubtaskBtn');
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', createNewSubtask);
    }
    
    const taskPlus = document.querySelector('.task-plus');
    if (taskPlus) {
        taskPlus.addEventListener('click', () => {
            if (addTaskModal) addTaskModal.style.display = 'block';
        });
    }
    
    const subtaskPlus = document.querySelector('.subtask-plus');
    if (subtaskPlus) {
        subtaskPlus.addEventListener('click', () => {
            if (addSubtaskModal) addSubtaskModal.style.display = 'block';
        });
    }
    
    initializeThreeDotsMenu();
    
    const searchInput = document.querySelector(".skystemtaskmaster-search-bar") as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const value = searchInput.value.toLowerCase();
            tasks.forEach(task => {
                if (task.row) {
                    const text = task.row.innerText.toLowerCase();
                    task.row.style.display = text.indexOf(value) !== -1 ? "" : "none";
                }
            });
            subtasks.forEach(subtask => {
                if (subtask.row) {
                    const text = subtask.row.innerText.toLowerCase();
                    subtask.row.style.display = text.indexOf(value) !== -1 ? "" : "none";
                }
            });
        });
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
                <span>${escapeHtml(taskName)}</span>
            </div>
        </td>
        <td><span style="color: ; font-weight: bold;">${escapeHtml(acc)}</span></td>
        <td class="tdoc-cell">${escapeHtml(tdoc)}</td>
        <td class="skystemtaskmaster-editable due-date" contenteditable="true">${escapeHtml(formattedDueDate)}</td>
        <td><span class="skystemtaskmaster-status-badge skystemtaskmaster-status-not-started">Not Started</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${owner.toLowerCase()}">${escapeHtml(owner)}</span></td>
        <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${reviewer.toLowerCase()}">${escapeHtml(reviewer)}</span></td>
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
        const newTask: Task = {
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            subListId: '',
            name: taskName,
            acc: acc,
            tdoc: tdoc,
            owner: owner,
            reviewer: reviewer,
            dueDate: dueDate,
            status: 'Not Started',
            taskNumber: '',
            taskOwner: owner,
            taskStatus: 'Not Started',
            approver: '—',
            recurrenceType: 'None',
            completionDoc: '0',
            createdBy: 'PK',
            comment: '',
            assigneeDueDate: '',
            customField1: '',
            reviewerDueDate: '',
            customField2: '',
            linkedAccounts: '',
            completionDate: '',
            notifier: '',
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
        
        setTimeout(() => {
            taskAccounts.set(newRow, []);
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
        updateTDocColumn();
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
                    <span>${escapeHtml(subtaskName)}</span>
                </div>
            </td>
            <td></td>
            <td class="tdoc-cell">${escapeHtml(tdoc)}</td>
            <td>Set due date</td>
            <td><span class="skystemtaskmaster-status-badge ${statusClass}">${defaultStatus}</span></td>
            <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${owner.toLowerCase()}">${escapeHtml(owner)}</span></td>
            <td><span class="skystemtaskmaster-badge skystemtaskmaster-badge-${reviewer.toLowerCase()}">${escapeHtml(reviewer)}</span></td>
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
            
            const newSubtask: Subtask = {
                id: subtaskId,
                subListId: '',
                name: subtaskName,
                tdoc: tdoc,
                owner: owner,
                reviewer: reviewer,
                dueDate: '',
                status: defaultStatus,
                taskNumber: '',
                taskOwner: owner,
                taskStatus: defaultStatus,
                approver: '—',
                recurrenceType: 'None',
                createdBy: 'PK',
                comment: '',
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
        }
        
        updateCounts();
        addDataCells();
        applyVisibility();
        
        setTimeout(() => {
            updateCDocColumn();
            updateTDocColumn();
        }, 100);
        
        const addSubtaskModal = document.getElementById('addSubtaskModal');
        if (addSubtaskModal) addSubtaskModal.style.display = 'none';
        
        (document.getElementById('subtaskName') as HTMLInputElement).value = '';
        (document.getElementById('subtaskOwner') as HTMLSelectElement).value = 'PK';
        (document.getElementById('subtaskReviewer') as HTMLSelectElement).value = 'SM';
        (document.getElementById('subtaskTdoc') as HTMLInputElement).value = '';
        
        showNotification(`Subtask "${subtaskName}" added successfully`);
        
        setTimeout(() => saveAllData(), 100);
    }
}

function addCommentIcons(): void {
    document.querySelectorAll('.comment-icon').forEach(icon => icon.remove());
    updateCommentColumn();
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
            const format = item.getAttribute('data-format');
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

function downloadAsExcel(): void {
    const table = document.getElementById('mainTable');
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

function downloadAsCsv(): void {
    downloadAsExcel();
    showNotification('Downloaded as CSV');
}

function downloadAsJson(): void {
    const table = document.getElementById('mainTable');
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

function addFilterModalStyles(): void {
    if (document.getElementById('filter-modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'filter-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'filter-modal.css';
    document.head.appendChild(link);
}

function showFilterPanel(): void {
    // Ensure styles are loaded
    addFilterModalStyles();
    
    const existingModal = document.getElementById('filterModal');
    if (existingModal) existingModal.remove();
    
    const filterModal = document.createElement('div');
    filterModal.id = 'filterModal';
    filterModal.className = 'modal';
    
    filterModal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3 class="cdoc-header"><i class="fas fa-filter"></i> Filter Tasks</h3>
            
            <div class="filter-body">
                <div class="filter-form-group">
                    <label class="filter-label">Status</label>
                    <select id="filterStatus" class="filter-select">
                        <option value="all">All</option>
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
                
                <div class="filter-form-group">
                    <label class="filter-label">Task Owner</label>
                    <select id="filterOwner" class="filter-select">
                        <option value="all">All</option>
                        <option value="PK">PK - Palakh Khanna</option>
                        <option value="SM">SM - Sarah Miller</option>
                        <option value="MP">MP - Mel Preparer</option>
                        <option value="PP">PP - Poppy Pan</option>
                        <option value="JS">JS - John Smith</option>
                        <option value="EW">EW - Emma Watson</option>
                        <option value="DB">DB - David Brown</option>
                    </select>
                </div>
                
                <div class="filter-form-group">
                    <label class="filter-label">Due Date</label>
                    <select id="filterDueDate" class="filter-select">
                        <option value="all">All</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Today</option>
                        <option value="week">Next 7 days</option>
                        <option value="month">Next 30 days</option>
                        <option value="future">Beyond 30 days</option>
                    </select>
                </div>

                <div class="filter-form-group">
                    <label class="filter-label">Recurrence Type</label>
                    <select id="filterRecurrence" class="filter-select">
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
            
            <div class="filter-modal-footer">
                <button id="clearFilterBtn" class="btn-clear-filter">
                    <i class="fas fa-trash-alt"></i> Clear All
                </button>
                <button id="applyFilterBtn" class="btn-apply-filter">
                    <i class="fas fa-check"></i> Apply Filter
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(filterModal);
    
    // Set current filter values
    const filterStatus = document.getElementById('filterStatus') as HTMLSelectElement;
    const filterOwner = document.getElementById('filterOwner') as HTMLSelectElement;
    const filterDueDate = document.getElementById('filterDueDate') as HTMLSelectElement;
    const filterRecurrence = document.getElementById('filterRecurrence') as HTMLSelectElement;
    const hideEmptyLists = document.getElementById('hideEmptyLists') as HTMLInputElement;
    const showTaskCount = document.getElementById('showTaskCount') as HTMLInputElement;
    
    if (filterStatus) filterStatus.value = currentFilters.status;
    if (filterOwner) filterOwner.value = currentFilters.owner;
    if (filterDueDate) filterDueDate.value = currentFilters.dueDate;
    if (filterRecurrence) filterRecurrence.value = currentFilters.recurrence;
    if (hideEmptyLists) hideEmptyLists.checked = currentFilters.hideEmptyLists;
    if (showTaskCount) showTaskCount.checked = currentFilters.showTaskCount;
    
    const close = () => {
        filterModal.classList.add('fade-out');
        setTimeout(() => filterModal.remove(), 200);
    };
    
    const closeBtn = filterModal.querySelector('.close') as HTMLElement;
    if (closeBtn) closeBtn.addEventListener('click', close);
    
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            currentFilters = {
                status: filterStatus?.value || 'all',
                owner: filterOwner?.value || 'all',
                reviewer: 'all',
                dueDate: filterDueDate?.value || 'all',
                recurrence: filterRecurrence?.value || 'all',
                hideEmptyLists: hideEmptyLists?.checked || false,
                showTaskCount: showTaskCount?.checked || false
            };
            
            applyHierarchicalFilters();
            close();
            showNotification('Filters applied', 'success');
        });
    }
    
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            currentFilters = {
                status: 'all',
                owner: 'all',
                reviewer: 'all',
                dueDate: 'all',
                recurrence: 'all',
                hideEmptyLists: false,
                showTaskCount: false
            };
            clearAllFilters();
            close();
            showNotification('Filters cleared', 'info');
        });
    }
    
    // Close modal when clicking outside
    filterModal.addEventListener('click', (e) => {
        if (e.target === filterModal) {
            close();
        }
    });
    
    filterModal.style.display = 'block';
}

function applyHierarchicalFilters(): void {
    console.log('Applying hierarchical filters:', currentFilters);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    const taskMatches = new Map<string, boolean>();
    
    tasks.forEach(task => {
        let matches = true;
        
        if (currentFilters.status !== 'all') {
            const taskStatus = task.statusBadge?.innerText?.trim() || task.status || 'Not Started';
            if (taskStatus !== currentFilters.status) matches = false;
        }
        
        if (matches && currentFilters.owner !== 'all') {
            const ownerBadge = task.row?.cells[5]?.querySelector('.skystemtaskmaster-badge');
            const ownerText = ownerBadge?.textContent?.trim() || task.taskOwner || task.owner || '';
            if (ownerText !== currentFilters.owner) matches = false;
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
                // Fix: Replace includes() with indexOf()
                if (recurringOptions.indexOf(recurrenceType) === -1) matches = false;
            } else {
                if (recurrenceType !== currentFilters.recurrence) matches = false;
            }
        }
        
        taskMatches.set(task.id, matches);
        
        if (task.row) {
            task.row.style.display = matches ? '' : 'none';
        }
    });
    
    subtasks.forEach(subtask => {
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
        
        if (matches && currentFilters.dueDate !== 'all') {
            const dueDateCell = subtask.row?.cells[3];
            if (dueDateCell) {
                const dueText = dueDateCell.innerText;
                if (dueText !== 'Set due date') {
                    try {
                        const dueDate = new Date(dueText);
                        dueDate.setHours(0, 0, 0, 0);
                        
                        if (currentFilters.dueDate === 'overdue' && dueDate >= today) matches = false;
                        else if (currentFilters.dueDate === 'today' && dueDate.getTime() !== today.getTime()) matches = false;
                        else if (currentFilters.dueDate === 'week') {
                            if (dueDate < today || dueDate > oneWeekLater) matches = false;
                        }
                        else if (currentFilters.dueDate === 'month') {
                            if (dueDate < today || dueDate > oneMonthLater) matches = false;
                        }
                        else if (currentFilters.dueDate === 'future') {
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
        
        if (subtask.row) {
            subtask.row.style.display = matches ? '' : 'none';
        }
    });
    
    console.log('Filters applied');
}

function clearAllFilters(): void {
    tasks.forEach(task => {
        if (task.row) task.row.style.display = '';
    });
    
    subtasks.forEach(subtask => {
        if (subtask.row) subtask.row.style.display = '';
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

function addCustomizeGridStyles(): void {
    if (document.getElementById('customize-grid-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'customize-grid-styles';
    link.rel = 'stylesheet';
    link.href = 'customize-grid.css';
    document.head.appendChild(link);
}

function showCustomizeGridModal(): void {
    // Ensure styles are loaded
    addCustomizeGridStyles();
    
    let modal = document.getElementById('customizeGridModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customizeGridModal';
        modal.className = 'modal';
        
        // Separate mandatory and optional columns
        const mandatoryColumns = columnConfig.filter(col => col.mandatory);
        const optionalColumns = columnConfig.filter(col => !col.mandatory);
        
        const renderColumnOptions = (columns: typeof columnConfig, showDivider: boolean) => {
            return columns.map((col, index) => `
                <div class="column-option ${col.mandatory ? 'mandatory' : ''}" style="--index: ${index}">
                    <input type="checkbox" 
                           id="col_${col.key}" 
                           ${col.visible ? 'checked' : ''} 
                           ${col.mandatory ? 'disabled' : ''}>
                    <label for="col_${col.key}">
                        ${escapeHtml(col.label)}
                        ${!col.forSubtask ? ' <span style="font-size: 11px; color: #999;">(tasks only)</span>' : ''}
                    </label>
                </div>
            `).join('');
        };
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3 class="cdoc-header">
                    <i class="fas fa-columns"></i> Customize Grid Columns
                </h3>
                
                <div class="grid-config-container">
                    <div class="grid-selection-layout" id="columnChecklist">
                        ${mandatoryColumns.length > 0 ? `
                            <div class="grid-section-divider">Required Columns</div>
                            ${renderColumnOptions(mandatoryColumns, false)}
                        ` : ''}
                        ${optionalColumns.length > 0 ? `
                            <div class="grid-section-divider">Optional Columns</div>
                            ${renderColumnOptions(optionalColumns, true)}
                        ` : ''}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button id="resetGridBtn" class="btn-reset-grid">
                        <i class="fas fa-undo-alt"></i> Reset to Default
                    </button>
                    <button id="saveGridBtn" class="btn-save-grid">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const close = () => {
            if (modal) modal.style.display = 'none';
        };
        
        const closeBtn = modal.querySelector('.close') as HTMLElement;
        if (closeBtn) closeBtn.addEventListener('click', close);
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
        
        const saveGridBtn = document.getElementById('saveGridBtn');
        if (saveGridBtn) {
            saveGridBtn.addEventListener('click', () => {
                // Save column visibility
                columnConfig.forEach(col => {
                    const checkbox = document.getElementById(`col_${col.key}`) as HTMLInputElement;
                    if (checkbox && !col.mandatory) {
                        col.visible = checkbox.checked;
                    }
                });
                
                saveColumnVisibility();
                refreshGridUI();
                close();
                showNotification('Grid layout updated successfully!', 'success');
            });
        }
        
        const resetGridBtn = document.getElementById('resetGridBtn');
        if (resetGridBtn) {
            resetGridBtn.addEventListener('click', () => {
                const defaults = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
                
                // Reset column visibility
                columnConfig.forEach(col => {
                    if (!col.mandatory) {
                        col.visible = defaults.indexOf(col.key) !== -1;
                    }
                });
                
                // Update checkboxes
                columnConfig.forEach(col => {
                    const checkbox = document.getElementById(`col_${col.key}`) as HTMLInputElement;
                    if (checkbox && !col.mandatory) {
                        checkbox.checked = col.visible;
                    }
                });
                
                showNotification('Grid reset to default layout', 'info');
            });
        }
    }
    
    if (modal) {
        modal.style.display = 'block';
    }
}

function saveColumnVisibility(): void {
    const visibilityState: Record<string, boolean> = {};
    columnConfig.forEach(col => {
        visibilityState[col.key] = col.visible;
    });
    localStorage.setItem('columnVisibility', JSON.stringify(visibilityState));
    console.log('Column visibility saved:', visibilityState);
}

function refreshGridUI(): void {
    addExtraColumns();
    addDataCells();
    applyVisibility();
    updateSublistRowsColspan();
}

function addCreateModalStyles(): void {
    if (document.getElementById('create-modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'create-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'create-modals.css';
    document.head.appendChild(link);
}

function showCreateSubListModal(mainList: MainList): void {
    // Ensure styles are loaded
    addCreateModalStyles();
    
    let modal = document.getElementById('createSubListModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createSubListModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3 class="cdoc-header sublist-modal-title">Create Sub List</h3>
                
                <div style="margin: 20px 0;">
                    <label class="form-label">Sub List Name</label>
                    <input type="text" id="subListNameInput" class="task-input" 
                           placeholder="e.g. Phase 1, Q1 Review...">
                    
                    <button id="createSubListBtn" class="btn-create-sublist" style="margin-top: 15px;">
                        Create Sub List
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const close = () => {
            if (modal) modal.style.display = 'none';
        };
        
        modal.querySelector('.close')?.addEventListener('click', close);
        
        const input = document.getElementById('subListNameInput') as HTMLInputElement;
        const createBtn = document.getElementById('createSubListBtn');
        
        const handleSubmit = () => {
            if (!modal) return;
            
            const mainListId = modal.getAttribute('data-current-mainlist-id');
            const targetMainList = mainLists.find(m => m.id === mainListId);
            
            if (!targetMainList) {
                showNotification('Error: Main list context lost', 'error');
                return;
            }
            
            const subListName = input.value.trim();
            
            if (subListName) {
                createSubList(targetMainList, subListName);
                close();
            } else {
                showNotification('Please enter a name for the sub list', 'info');
                input.focus();
            }
        };
        
        createBtn?.addEventListener('click', handleSubmit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
    }
    
    if (modal) {
        modal.setAttribute('data-current-mainlist-id', mainList.id);
        const titleEl = modal.querySelector('.sublist-modal-title');
        if (titleEl) titleEl.textContent = `New Sub List for "${mainList.name}"`;
        
        modal.style.display = 'block';
        setTimeout(() => {
            const input = document.getElementById('subListNameInput') as HTMLInputElement;
            if (input) input.focus();
        }, 100);
    }
}

function showCreateTaskForMainList(mainList: MainList): void {
    showCreateTaskModalForList(mainList, null);
}

function showCreateTaskModalForList(mainList: MainList, subList: SubList | null = null): void {
    // Ensure styles are loaded
    addCreateModalStyles();
    
    const existingModal = document.getElementById('createTaskCompleteModal');
    if (existingModal) existingModal.remove();

    const randomID = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const modal = document.createElement('div');
    modal.id = 'createTaskCompleteModal';
    modal.className = 'modal';
    modal.style.display = 'block';

    const path = subList ? `${mainList.name} > ${subList.name}` : mainList.name;

    const userOptions = `
        <option value="">None</option>
        <option value="PK">PK - Palakh Khanna (palakh@skystem.com)</option>
        <option value="SM">SM - Sarah Miller (sarah@skystem.com)</option>
        <option value="MP">MP - Mel Preparer (mel@skystem.com)</option>
        <option value="PP">PP - Poppy Pan (poppy@skystem.com)</option>
        <option value="JS">JS - John Smith (john@skystem.com)</option>
        <option value="EW">EW - Emma Watson (emma@skystem.com)</option>
        <option value="DB">DB - David Brown (david@skystem.com)</option>
    `;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-gradient-header">
                <div class="modal-header-content">
                    <h3><i class="fa-solid fa-circle-plus"></i> Create Task</h3>
                    <span class="close modal-close-white">&times;</span>
                </div>
                <p class="modal-path">Path: ${escapeHtml(path)}</p>
            </div>
            
            <div class="modal-body-scroll">
                <!-- Basic Details Section -->
                <div class="form-section">
                    <h4 class="section-title">Basic Details</h4>
                    <div class="form-grid-2cols">
                        <div class="form-group">
                            <label class="form-label">Task Name *</label>
                            <input type="text" id="createTaskName" class="task-input" placeholder="Task Name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Task ID</label>
                            <input type="text" id="createTaskNumber" class="task-input" style="background: #fff0f6;  color: #ff0080;" placeholder="Enter a ID">
                        </div>
                    </div>
                    
                    <div class="form-grid-3cols">
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
                    
                    <div class="form-grid-2cols-equal">
                        <div class="form-group">
                            <label class="form-label">Dependent Task</label>
                            <select id="createTaskDependent" class="task-input">
                                <option value="">No Dependent</option>
                                ${getTaskOptionsForDropdown()}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Created By</label>
                            <select id="createTaskCreator" class="task-input">${userOptions}</select>
                        </div>
                    </div>
                </div>

                <!-- Logistics & Recurrence Section -->
                <div class="form-section">
                    <h4 class="section-title">Logistics & Recurrence</h4>
                    <div class="form-grid-3cols">
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
                            <label class="form-label">Notifier</label>
                            <select id="createTaskNotifier" class="task-input">${userOptions}</select>
                        </div>
                    </div>
                </div>

                <!-- Timeline Section -->
                <div class="form-section">
                    <h4 class="section-title">Timeline</h4>
                    <div class="form-grid-3cols">
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

                <!-- Documents Section -->
                <div class="documents-section">
                    <div class="documents-grid">
                        <div class="form-group">
                            <label class="form-label">Task Doc (TDoc) <i class="fa-solid fa-upload"></i></label>
                            <input type="file" id="uploadTDoc" class="file-upload-input">
                            <input type="text" id="createTaskTdoc" class="file-reference-input" placeholder="Or enter TDoc reference">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Completion Doc (CDoc) <i class="fa-solid fa-upload"></i></label>
                            <input type="file" id="uploadCDoc" class="file-upload-input">
                            <input type="text" id="createTaskCdoc" class="file-reference-input" placeholder="Or enter CDoc reference">
                        </div>
                    </div>
                    <div class="form-group" style="margin-top: 15px;">
                        <label class="form-label">Linked Accounts</label>
                        <input type="text" id="createLinkedAccounts" class="task-input" placeholder="Account IDs (comma separated)...">
                    </div>
                </div>

                <!-- Comment Section -->
                <div class="form-group" style="margin-bottom: 25px;">
                    <label class="form-label">Internal Comment</label>
                    <textarea id="createTaskComment" class="comment-textarea" rows="3" placeholder="Add any internal notes or comments..."></textarea>
                </div>

                <!-- Custom Fields Section -->
                <div class="form-section">
                    <h4 class="section-title">Custom Fields</h4>
                    <div class="form-grid-2cols-equal">
                        <div class="form-group">
                            <label class="form-label">Custom Field #1</label>
                            <input type="text" id="createCustomField1" class="task-input" placeholder="Custom field value...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Custom Field #2</label>
                            <input type="text" id="createCustomField2" class="task-input" placeholder="Custom field value...">
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="modal-action-buttons">
                    <button class="btn-cancel-task" id="cancelCreateTaskBtn">Cancel</button>
                    <button class="btn-create-task" id="submitCreateTaskBtn">
                        <i class="fa-solid fa-check"></i> Create Task
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    setTimeout(() => {
        const nameInput = document.getElementById('createTaskName') as HTMLInputElement;
        if (nameInput) nameInput.focus();
    }, 150);

    const close = () => modal.remove();
    modal.querySelector('.close')?.addEventListener('click', close);
    document.getElementById('cancelCreateTaskBtn')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if(e.target === modal) close(); });

    document.getElementById('submitCreateTaskBtn')?.addEventListener('click', () => {
        const name = (document.getElementById('createTaskName') as HTMLInputElement).value.trim();
        if (!name) {
            showNotification('Please provide a task name', 'error');
            (document.getElementById('createTaskName') as HTMLInputElement).focus();
            return;
        }

        const taskData = {
            name: name,
            taskNumber: (document.getElementById('createTaskNumber') as HTMLInputElement).value,
            owner: (document.getElementById('createTaskOwner') as HTMLSelectElement).value,
            reviewer: (document.getElementById('createTaskReviewer') as HTMLSelectElement).value,
            approver: (document.getElementById('createTaskApprover') as HTMLSelectElement).value,
            status: (document.getElementById('createTaskStatus') as HTMLSelectElement).value,
            recurrenceType: (document.getElementById('createTaskRecurrence') as HTMLSelectElement).value,
            notifier: (document.getElementById('createTaskNotifier') as HTMLSelectElement).value,
            createdBy: (document.getElementById('createTaskCreator') as HTMLSelectElement).value,
            dueDate: (document.getElementById('createAssigneeDate') as HTMLInputElement).value,
            reviewerDueDate: (document.getElementById('createReviewerDate') as HTMLInputElement).value,
            completionDate: (document.getElementById('createCompletionDate') as HTMLInputElement).value,
            tdoc: (document.getElementById('createTaskTdoc') as HTMLInputElement).value || '0',
            cdoc: (document.getElementById('createTaskCdoc') as HTMLInputElement).value || '0',
            linkedAccounts: (document.getElementById('createLinkedAccounts') as HTMLInputElement).value,
            comment: (document.getElementById('createTaskComment') as HTMLTextAreaElement).value,
            customField1: (document.getElementById('createCustomField1') as HTMLInputElement).value,
            customField2: (document.getElementById('createCustomField2') as HTMLInputElement).value,
            dependentTask: (document.getElementById('createTaskDependent') as HTMLSelectElement).value
        };
        
        let targetSubList = subList;
        
        if (!targetSubList) {
            targetSubList = mainList.subLists.length > 0 
                ? mainList.subLists[0] 
                : createSubList(mainList, 'Tasks');
        }
        
        const newTask = createTask(targetSubList, taskData);
        
        if (taskData.dependentTask) {
            dependentTasks.set(newTask.id, taskData.dependentTask);
        }
        
        showNotification(`Task "${taskData.name}" added to ${targetSubList.name}`, 'success');
        close();
    });
}

function getTaskOptionsForDropdown(): string {
    if (!tasks || tasks.length === 0) return '';
    
    let options = '';
    tasks.forEach(task => {
        const displayText = task.taskNumber || task.name || `Task ${task.id}`;
        options += `<option value="${task.id}">${escapeHtml(displayText)}</option>`;
    });
    
    return options;
}

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

function syncAllTaskStatusColumns(): void {
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

function initializeTaskStatus(): void {
    console.log('Initializing Task Status column...');
    const style = document.createElement('style');
    style.textContent = `
        .extra-cell[data-column="taskStatus"] {
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
        }
        
        .extra-cell[data-column="taskStatus"]:hover {
            background-color: #fff0f5 !important;
            transform: scale(1.02);
            font-weight: bold;
        }
        
        .extra-cell[data-column="taskStatus"]:empty:before {
            content: "Not Started";
            color: #999;
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        makeAllStatusClickable();
    }, 1000);
}

function makeAllStatusClickable(): void {
    tasks.forEach(task => {
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
    });
    
    subtasks.forEach(subtask => {
        if (subtask.statusBadge) {
            subtask.statusBadge.style.cursor = 'pointer';
            subtask.statusBadge.title = 'Click to change status';
            
            const newBadge = subtask.statusBadge.cloneNode(true) as HTMLElement;
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
                makeStatusCellClickable(cell as HTMLElement, (task || subtask) as Task | Subtask);
            }
        });
    }, 200);
}

function initializeUserSystem(): void {
    console.log('Initializing user system...');
    addUserStyles();
    setTimeout(() => {
        makeOwnerReviewerClickable();
        console.log('User system ready');
    }, 500);
}

function initializeDocumentManager(): void {
    addDocumentStyles();
    updateCDocColumn();
}

function initializeTDocManager(): void {
    addTDocStyles();
    updateTDocColumn();
}

function initializeRecurrenceEditor(): void {
    console.log('Initializing Recurrence Type Editor...');
    addRecurrenceStyles();
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
    
    let importedTasksData: any[] = [];
    
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
    
    function showPreview(tasks: any[]): void {
        if (!previewBody || !previewArea) return;
        
        previewArea.style.display = 'block';
        (processBtn as HTMLButtonElement).disabled = false;
        
        const previewHtml = tasks.slice(0, 5).map((task: any) => `
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
        
        const countDisplay = document.createElement('div');
        countDisplay.id = 'importPreviewCount';
        countDisplay.className = 'preview-count';
        countDisplay.textContent = `Total ${tasks.length} task(s) ready to import`;
        
        const existingCount = document.getElementById('importPreviewCount');
        if (existingCount) existingCount.remove();
        previewArea.appendChild(countDisplay);
    }
    
  function importTasks(): void {
    if (importedTasksData.length === 0) {
        alert('No tasks to import');
        return;
    }
    
    const importTarget = (document.querySelector('input[name="importTarget"]:checked') as HTMLInputElement)?.value;
    const skipDuplicates = (document.getElementById('skipDuplicates') as HTMLInputElement)?.checked;
    
    if (importTarget === 'newList') {
        const listName = prompt('Enter name for new list:', 'Imported Tasks ' + new Date().toLocaleDateString());
        if (!listName) return;
        
        const targetList = createMainList(listName);
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

function importTasksToSublist(sublist: SubList, tasks: any[], skipDuplicates: boolean): void {
    const existingTaskNames = sublist.tasks.map(t => t.name.toLowerCase());
    
    tasks.forEach(taskData => {
        // Fix: Replace includes() with indexOf()
        if (skipDuplicates && existingTaskNames.indexOf(taskData.name.toLowerCase()) !== -1) {
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
        (processBtn as HTMLButtonElement).disabled = true;
        fileInput.value = '';
    }
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

function makeExistingTasksEditable(): void {
    tasks.forEach(task => {
        const cells = [task.row?.cells[1], task.row?.cells[3], task.row?.cells[7]];
        cells.forEach(cell => {
            if (cell) {
                cell.classList.add('skystemtaskmaster-editable');
                cell.setAttribute('contenteditable', 'true');
            }
        });
    });
}

// ================================
// DOM CONTENT LOADED INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
    addSeparateTableStyles();
    addSortStyles();
    addDocumentStyles(); // Fix: Changed from addCommentStyles to addDocumentStyles
    addAccountStyles();
    addRecurrenceStyles();
    addDragStyles();
    addUserStyles();
    addTDocStyles();
    
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




function addModalStyles(): void {
    if (document.getElementById('modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'modal-styles';
    link.rel = 'stylesheet';
    link.href = 'modals.css';
    document.head.appendChild(link);
}

function createModals(): void {
    // Ensure styles are loaded
    addModalStyles();
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.innerHTML = `
        <div id="newTaskOptionsModal" class="modal">
            <div class="modal-content modal-sm">
                <span class="close">&times;</span>
                <h3 class="modal-title">Create New</h3>
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
                <h3 class="modal-title">Enter List Name</h3>
                <div class="modal-body">
                    <input type="text" id="listNameInput" class="modal-input" placeholder="Enter list name">
                    <button id="createListBtn" class="modal-btn-primary">Create List</button>
                </div>
            </div>
        </div>
        
        <div id="importTasksModal" class="modal">
            <div class="modal-content modal-lg">
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
                            <input type="file" id="importFileInput" class="file-input" accept=".csv,.json,.txt,.xlsx,.xls" style="display: none;">
                        </div>
                        
                        <div class="supported-formats">
                            <strong>Supported formats:</strong> CSV, JSON, TXT (one task per line), Excel (.xlsx, .xls)
                        </div>
                    </div>
                    
                    <div id="importPreviewArea" class="preview-area" style="display: none;">
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
                <h3 class="modal-title">Add New Task</h3>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Task Name *</label>
                        <input type="text" id="addTaskName" class="form-input" placeholder="Enter task name" autofocus>
                    </div>
                    
                    <div class="form-grid-2">
                        <div class="form-group">
                            <label>Acc</label>
                            <input type="text" id="addTaskAcc" class="form-input" value="+">
                        </div>
                        <div class="form-group">
                            <label>TDoc</label>
                            <input type="text" id="addTaskTdoc" class="form-input" value="0">
                        </div>
                    </div>
                    
                    <div class="form-grid-2">
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
                <h3 class="modal-title">Add Subtask</h3>
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
                    
                    <div class="form-grid-2">
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



function makeStatusEditable(): void {
    tasks.forEach(task => {
        const statusCell = task.statusBadge?.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        const newStatusCell = statusCell.cloneNode(true) as HTMLElement;
        statusCell.parentNode?.replaceChild(newStatusCell, statusCell);
        newStatusCell.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showStatusChangeModal(task);
        });
    });
    
    subtasks.forEach(subtask => {
        const statusCell = subtask.statusBadge?.parentElement;
        if (!statusCell) return;
        
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        const newStatusCell = statusCell.cloneNode(true) as HTMLElement;
        statusCell.parentNode?.replaceChild(newStatusCell, statusCell);
        newStatusCell.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showSubtaskStatusChangeModal(subtask);
        });
    });
}

function initializeDragAndDrop(): void {
    console.log('Initializing Drag and Drop...');
    
    tasks.forEach(task => makeRowDraggable(task.row, 'task'));
    subtasks.forEach(subtask => makeRowDraggable(subtask.row, 'subtask'));
    
    addDragStyles();
}

function makeRowDraggable(row: HTMLTableRowElement | null, type: string): void {
    if (!row) return;
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
        type: type as 'task' | 'subtask',
        originalIndex: getItemIndex(row, type)
    };
    
    if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'move';
    }
    row.classList.add('skystemtaskmaster-dragging');
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
    
    tasks.sort((a, b) => {
        const aIndex = taskRows.indexOf(a.row!);
        const bIndex = taskRows.indexOf(b.row!);
        return aIndex - bIndex;
    });
}

function updateSubtasksOrder(): void {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const subtaskRows = allRows.filter(row => row.classList.contains('subtask-row'));
    
    subtasks.sort((a, b) => {
        const aIndex = subtaskRows.indexOf(a.row!);
        const bIndex = subtaskRows.indexOf(b.row!);
        return aIndex - bIndex;
    });
}

function saveTaskOrder(): void {
    const order = {
        tasks: tasks.map(t => ({
            taskName: t.taskNameCell?.querySelector('span')?.textContent?.trim() || '',
            dueDate: t.dueDateCell?.textContent?.trim() || '',
            status: t.statusBadge?.textContent?.trim() || '',
            owner: t.row?.cells[5]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            reviewer: t.row?.cells[6]?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            cdoc: t.row?.cells[7]?.textContent?.trim() || ''
        })),
        subtasks: subtasks.map(s => ({
            taskName: s.taskNameCell?.querySelector('span')?.textContent?.trim() || '',
            status: s.statusBadge?.textContent?.trim() || '',
            owner: s.ownerCell?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || '',
            reviewer: s.reviewerCell?.querySelector('.skystemtaskmaster-badge')?.textContent?.trim() || ''
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

function initializeTaskDropdown(): void {
    const taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown") as HTMLSelectElement;
    if (!taskDropdown) return;
    
    const newDropdown = taskDropdown.cloneNode(true) as HTMLSelectElement;
    taskDropdown.parentNode?.replaceChild(newDropdown, taskDropdown);
    
    newDropdown.addEventListener("change", (e) => {
        const filter = (e.target as HTMLSelectElement).value;
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
                const ownerBadge = task.row?.cells[5]?.querySelector('.skystemtaskmaster-badge');
                const reviewerBadge = task.row?.cells[6]?.querySelector('.skystemtaskmaster-badge');
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
                
                if (task.row) task.row.style.display = show ? '' : 'none';
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
                
                if (subtask.row) subtask.row.style.display = show ? '' : 'none';
            });
        }
        
        let visibleTasks = 0;
        tasks.forEach(task => {
            if (task.row && task.row.style.display !== 'none') visibleTasks++;
        });
        subtasks.forEach(subtask => {
            if (subtask.row && subtask.row.style.display !== 'none') visibleTasks++;
        });
        
        showNotification(`Filter: ${filter.replace(/-/g, ' ')} - ${visibleTasks} items visible`);
    });
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

function initializeDownloadButton(): void {
    const downloadBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return btn.textContent?.indexOf('Download') !== -1 || btn.innerHTML.indexOf('download') !== -1;
    });
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', showDownloadOptions);
    }
}

function addDownloadModalStyles(): void {
    if (document.getElementById('download-modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'download-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'download-modal.css';
    document.head.appendChild(link);
}

function showDownloadOptions(): void {
    // Ensure styles are loaded
    addDownloadModalStyles();
    
    let downloadModal = document.getElementById('downloadModal');
    
    if (!downloadModal) {
        downloadModal = document.createElement('div');
        downloadModal.id = 'downloadModal';
        downloadModal.className = 'modal';
        downloadModal.innerHTML = `
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
        document.body.appendChild(downloadModal);
        
        const close = () => {
            if (downloadModal) downloadModal.style.display = 'none';
        };
        
        downloadModal.querySelector('.close')?.addEventListener('click', close);
        
        const executeAction = (actionFn: (() => void) | undefined) => {
            if (actionFn) actionFn();
            close();
        };
        
        document.getElementById('downloadExcelBtn')?.addEventListener('click', () => executeAction(downloadAsExcel));
        document.getElementById('downloadCsvBtn')?.addEventListener('click', () => executeAction(downloadAsCsv));
        document.getElementById('downloadJsonBtn')?.addEventListener('click', () => executeAction(downloadAsJson));
    }
    
    downloadModal.style.display = 'block';
}

function initializeSortButton(): void {
    const sortBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(btn => {
        return btn.textContent?.indexOf('Sort') !== -1 || btn.innerHTML.indexOf('sort') !== -1;
    });
    
    if (sortBtn) {
        sortBtn.addEventListener('click', showSortOptions);
    }
}

function addSortModalStyles(): void {
    if (document.getElementById('sort-modal-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'sort-modal-styles';
    link.rel = 'stylesheet';
    link.href = 'sort-modal.css';
    document.head.appendChild(link);
}

function showSortOptions(): void {
    // Ensure styles are loaded
    addSortModalStyles();
    
    let sortModal = document.getElementById('sortModal');
    
    if (!sortModal) {
        sortModal = document.createElement('div');
        sortModal.id = 'sortModal';
        sortModal.className = 'modal';
        sortModal.innerHTML = `
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
        document.body.appendChild(sortModal);
        
        const close = () => {
            if (sortModal) sortModal.style.display = 'none';
        };
        
        sortModal.querySelector('.close')?.addEventListener('click', close);
        
        document.getElementById('applySortBtn')?.addEventListener('click', () => {
            const sortBy = (document.getElementById('sortBy') as HTMLSelectElement).value;
            const sortOrder = (document.getElementById('sortOrder') as HTMLSelectElement).value as 'asc' | 'desc';
            applySort(sortBy, sortOrder);
            close();
        });
    }
    
    sortModal.style.display = 'block';
}

function applySort(sortBy: string, sortOrder: 'asc' | 'desc'): void {
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
    
    const tasksBySublist: Record<string, HTMLTableRowElement[]> = {};
    taskRows.forEach(row => {
        const sublistId = row.getAttribute('data-sublist-id') || '';
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
                aVal = parseSortValue(aVal as string, sortBy);
                bVal = parseSortValue(bVal as string, sortBy);
                return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
            } else {
                return sortOrder === 'asc' 
                    ? (aVal as string).localeCompare(bVal as string) 
                    : (bVal as string).localeCompare(aVal as string);
            }
        });
    });
    
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    
    headerRows.forEach(row => tbody.appendChild(row));
    headerRows.forEach(headerRow => {
        if (headerRow.classList.contains('sub-list-row')) {
            const sublistId = headerRow.getAttribute('data-sublist-id') || '';
            const tasksForThisSublist = tasksBySublist[sublistId] || [];
            tasksForThisSublist.forEach(taskRow => tbody.appendChild(taskRow));
        }
    });
    
    const remainingTasks = taskRows.filter(row => {
        const childrenArray = Array.from(tbody.children);
        return childrenArray.indexOf(row) === -1; // Using indexOf instead of includes
    });
    remainingTasks.forEach(row => tbody.appendChild(row));
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

function parseSortValue(val: string, sortBy: string): number {
    if (sortBy === 'days') return parseInt(val.replace('+', '')) || 0;
    if (sortBy === 'dueDate') return new Date(val).getTime() || 0;
    return 0;
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

function initializeSimpleUserColumns(): void {
    console.log('Initializing user columns...');
    
    // Load CSS from external file
    if (!document.getElementById('user-columns-styles')) {
        const link = document.createElement('link');
        link.id = 'user-columns-styles';
        link.rel = 'stylesheet';
        link.href = 'user-columns.css';
        document.head.appendChild(link);
    }
    
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



function addCommentStyles(): void {
}

function addStatusStyles(): void {
}

function initializeComments(): void {
    console.log('Initializing comments...');
    addCommentStyles(); 
    
    setTimeout(() => {
        updateCommentColumn();
    }, 500);
}

function initializeStatus(): void {
    addStatusStyles(); 
    makeStatusEditable();
}