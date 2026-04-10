var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// ================================
// TYPE DEFINITIONS
// ================================
// ================================
// GLOBAL VARIABLES
// ================================
var mainLists = [];
var subLists = [];
var tasks = [];
var subtasks = [];
var columnConfig = [
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
var taskDocuments = new Map();
var taskTDocDocuments = new Map();
var taskAccounts = new Map();
var taskComments = {};
var draggedItem = null;
var currentTaskForStatus = null;
var currentSubtaskForStatus = null;
var activeCommentRowId = null;
var activeCommentType = null;
var editingCommentId = null;
var availableUsers = [
    { id: '1', name: 'Palakh Khanna', email: 'palakh@skystem.com', initials: 'PK', role: 'Owner' },
    { id: '2', name: 'Sarah Miller', email: 'sarah@skystem.com', initials: 'SM', role: 'Reviewer' },
    { id: '3', name: 'Mel Preparer', email: 'mel@skystem.com', initials: 'MP', role: 'Preparer' },
    { id: '4', name: 'Poppy Pan', email: 'poppy@skystem.com', initials: 'PP', role: 'Approver' },
    { id: '5', name: 'John Smith', email: 'john@skystem.com', initials: 'JS', role: 'Reviewer' },
    { id: '6', name: 'Emma Watson', email: 'emma@skystem.com', initials: 'EW', role: 'Owner' },
    { id: '7', name: 'David Brown', email: 'david@skystem.com', initials: 'DB', role: 'Reviewer' }
];
var dependentTasks = new Map();
var currentFilters = {
    status: 'all',
    owner: 'all',
    reviewer: 'all',
    dueDate: 'all',
    recurrence: 'all',
    hideEmptyLists: false,
    showTaskCount: false
};
var currentSort = {
    column: 'taskName',
    direction: 'asc'
};
// ================================
// UTILITY FUNCTIONS
// ================================
function escapeHtml(str) {
    if (!str)
        return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function showNotification(message, type) {
    if (type === void 0) { type = 'success'; }
    var notification = document.querySelector('.skystemtaskmaster-notification');
    if (notification)
        notification.remove();
    notification = document.createElement('div');
    notification.className = 'skystemtaskmaster-notification';
    notification.style.cssText = "\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        background: ".concat(type === 'error' ? '#dc3545' : type === 'info' ? '#17a2b8' : '#ff0080', ";\n        color: white;\n        padding: 12px 24px;\n        border-radius: 4px;\n        box-shadow: 0 2px 10px rgba(0,0,0,0.2);\n        z-index: 2000;\n        animation: slideIn 0.3s ease;\n    ");
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(function () {
        notification === null || notification === void 0 ? void 0 : notification.remove();
    }, 3000);
}
function getUserColor(initials) {
    var colors = {
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
function getAuthorFullName(initials) {
    var userMap = {
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
function formatDate(date) {
    var d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    if (bytes < 1024)
        return bytes + ' Bytes';
    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function getCommentKey(rowId, type) {
    return "".concat(type, "_").concat(rowId);
}
function getVisibleColumnCount() {
    var count = 0;
    columnConfig.forEach(function (col) {
        if (col.visible !== false)
            count++;
    });
    return count;
}
// ================================
// STYLES INITIALIZATION
// ================================
function addSeparateTableStyles() {
    if (document.getElementById('separate-table-styles'))
        return;
    var link = document.createElement('link');
    link.id = 'separate-table-styles';
    link.rel = 'stylesheet';
    link.href = 'separate-table-styles.css';
    document.head.appendChild(link);
}
function addSublistStyles() {
    if (document.getElementById('sublist-styles'))
        return;
    var link = document.createElement('link');
    link.id = 'sublist-styles';
    link.rel = 'stylesheet';
    link.href = 'sublist-styles.css';
    document.head.appendChild(link);
}
function addDocumentStyles() {
    if (document.getElementById('document-icon-styles'))
        return;
    var link = document.createElement('link');
    link.id = 'document-icon-styles';
    link.rel = 'stylesheet';
    link.href = 'document-styles.css';
    document.head.appendChild(link);
}
function addAccountStyles() {
    if (document.getElementById('account-styles'))
        return;
    var link = document.createElement('link');
    link.id = 'account-styles';
    link.rel = 'stylesheet';
    link.href = 'account-styles.css';
    document.head.appendChild(link);
}
function addSortStyles() {
    if (document.getElementById('sort-styles'))
        return;
    var link = document.createElement('link');
    link.id = 'sort-styles';
    link.rel = 'stylesheet';
    link.href = 'sort-styles.css';
    document.head.appendChild(link);
}
function addTDocStyles() {
    if (document.getElementById('tdoc-styles'))
        return;
    var link = document.createElement('link');
    link.id = 'tdoc-styles';
    link.rel = 'stylesheet';
    link.href = 'tdoc-styles.css';
    document.head.appendChild(link);
}
function addCommentStyles() {
    if (document.getElementById('comment-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'comment-styles';
    style.textContent = "\n        .comment-cell {\n            position: relative;\n            text-align: center;\n            vertical-align: middle;\n        }\n        .comment-icon-container {\n            display: inline-flex;\n            align-items: center;\n            gap: 4px;\n            cursor: pointer;\n            position: relative;\n        }\n        .comment-icon {\n            font-size: 18px;\n            transition: all 0.2s ease;\n            opacity: 0.7;\n        }\n        .comment-icon-empty {\n            opacity: 0.4;\n        }\n        .comment-icon-hover {\n            opacity: 1;\n            transform: scale(1.1);\n        }\n        .comment-count-badge {\n            position: absolute;\n            top: -8px;\n            right: -8px;\n            background: #ff0080;\n            color: white;\n            border-radius: 10px;\n            font-size: 10px;\n            padding: 2px 5px;\n            min-width: 16px;\n            text-align: center;\n        }\n        .comment-panel {\n            position: fixed;\n            right: -400px;\n            top: 0;\n            width: 380px;\n            height: 100vh;\n            background: white;\n            box-shadow: -2px 0 10px rgba(0,0,0,0.1);\n            transition: right 0.3s ease;\n            z-index: 10000;\n            display: flex;\n            flex-direction: column;\n        }\n        .comment-panel.open {\n            right: 0;\n        }\n        .comment-panel-header {\n            padding: 15px;\n            background: #ff0080;\n            color: white;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            font-weight: bold;\n        }\n        .comment-list {\n            flex: 1;\n            overflow-y: auto;\n            padding: 15px;\n        }\n        .comment-item {\n            margin-bottom: 15px;\n            padding: 10px;\n            background: #f9f9f9;\n            border-radius: 8px;\n        }\n        .comment-header {\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            margin-bottom: 8px;\n        }\n        .comment-author {\n            width: 32px;\n            height: 32px;\n            border-radius: 50%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            color: white;\n            font-weight: bold;\n        }\n        .comment-meta {\n            flex: 1;\n        }\n        .comment-author-name {\n            font-weight: 500;\n            font-size: 14px;\n        }\n        .comment-datetime {\n            font-size: 11px;\n            color: #999;\n        }\n        .comment-text {\n            margin-left: 42px;\n            font-size: 13px;\n            color: #333;\n        }\n        .comment-actions {\n            margin-left: 42px;\n            margin-top: 8px;\n            display: flex;\n            gap: 10px;\n        }\n        .comment-actions button {\n            background: none;\n            border: none;\n            font-size: 12px;\n            cursor: pointer;\n            color: #666;\n        }\n        .comment-actions button:hover {\n            color: #ff0080;\n        }\n        .comment-input-area {\n            padding: 15px;\n            border-top: 1px solid #eee;\n        }\n        .comment-input-area textarea {\n            width: 100%;\n            padding: 8px;\n            border: 1px solid #ddd;\n            border-radius: 4px;\n            resize: vertical;\n            font-family: inherit;\n        }\n        .comment-input-area button {\n            margin-top: 8px;\n            padding: 6px 16px;\n            background: #ff0080;\n            color: white;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n        }\n        .no-comments {\n            text-align: center;\n            color: #999;\n            padding: 20px;\n        }\n    ";
    document.head.appendChild(style);
}
function addStatusStyles() {
    if (document.getElementById('status-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'status-styles';
    style.textContent = "\n        .status-modal .modal-content {\n            width: 450px;\n            border-radius: 12px;\n        }\n        .status-modal-title {\n            color: #ff0080;\n            margin-bottom: 20px;\n        }\n        .status-modal-body {\n            margin-bottom: 20px;\n        }\n        .status-field {\n            margin-bottom: 15px;\n        }\n        .status-label {\n            display: block;\n            margin-bottom: 8px;\n            font-weight: 500;\n            color: #333;\n        }\n        .current-status-display {\n            padding: 10px;\n            background: #f5f5f5;\n            border-radius: 6px;\n            font-weight: 500;\n        }\n        .status-select {\n            width: 100%;\n            padding: 10px;\n            border: 2px solid #ddd;\n            border-radius: 6px;\n            font-size: 14px;\n        }\n        .status-comment {\n            width: 100%;\n            padding: 10px;\n            border: 2px solid #ddd;\n            border-radius: 6px;\n            resize: vertical;\n            font-family: inherit;\n        }\n        .status-comment-count {\n            text-align: right;\n            font-size: 12px;\n            color: #999;\n            margin-top: 5px;\n        }\n        .status-modal-buttons {\n            display: flex;\n            justify-content: flex-end;\n            gap: 10px;\n        }\n        .btn-cancel-status {\n            padding: 8px 16px;\n            background: #f0f0f0;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n        }\n        .btn-update-status {\n            padding: 8px 16px;\n            background: #ff0080;\n            color: white;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n        }\n    ";
    document.head.appendChild(style);
}
function addRecurrenceStyles() {
    if (document.getElementById('recurrence-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'recurrence-styles';
    style.textContent = "\n        .recurring-task {\n            border-left: 4px solid #808080 !important;\n        }\n        .non-recurring-task {\n            border-left: 4px solid #00cfff !important;\n        }\n        .recurrence-indicator {\n            display: inline-block;\n            margin-left: 8px;\n            padding: 2px 6px;\n            border-radius: 12px;\n            font-size: 10px;\n            font-weight: bold;\n            color: white;\n            cursor: pointer;\n        }\n        .recurrence-type-cell {\n            cursor: pointer;\n            transition: all 0.2s;\n        }\n        .recurrence-type-recurring {\n            color: #808080;\n            font-weight: 500;\n        }\n        .recurrence-type-none {\n            color: #00cfff;\n        }\n        .recurrence-cell-clickable {\n            cursor: pointer;\n            transition: all 0.2s;\n        }\n        .recurrence-cell-hover {\n            background-color: #fff0f5;\n            transform: scale(1.02);\n            font-weight: bold;\n        }\n    ";
    document.head.appendChild(style);
}
function addDragStyles() {
    if (document.getElementById('skystemtaskmaster-drag-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'skystemtaskmaster-drag-styles';
    style.textContent = "\n        .skystemtaskmaster-draggable {\n            cursor: move;\n        }\n        .skystemtaskmaster-dragging {\n            opacity: 0.5;\n        }\n        .skystemtaskmaster-drag-over-top {\n            border-top: 2px solid #ff0080 !important;\n        }\n        .skystemtaskmaster-drag-over-bottom {\n            border-bottom: 2px solid #ff0080 !important;\n        }\n    ";
    document.head.appendChild(style);
}
function addUserStyles() {
    if (document.getElementById('skystemtaskmaster-user-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'skystemtaskmaster-user-styles';
    style.textContent = "\n        .modal-user-select .modal-content {\n            width: 400px;\n        }\n        .user-search-container {\n            margin-bottom: 15px;\n        }\n        .user-search-input {\n            width: 100%;\n            padding: 10px;\n            border: 2px solid #ddd;\n            border-radius: 4px;\n            font-size: 14px;\n        }\n        .user-list-container {\n            max-height: 300px;\n            overflow-y: auto;\n            border: 1px solid #eee;\n            border-radius: 4px;\n        }\n        .user-item {\n            display: flex;\n            align-items: center;\n            gap: 12px;\n            padding: 10px;\n            cursor: pointer;\n            transition: background 0.2s;\n            border-bottom: 1px solid #eee;\n        }\n        .user-item:hover {\n            background: #f5f5f5;\n        }\n        .user-item-current {\n            background: #fff0f5;\n        }\n        .user-badge {\n            width: 40px;\n            height: 40px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            border-radius: 50%;\n            color: white;\n            font-weight: bold;\n        }\n        .user-info {\n            flex: 1;\n        }\n        .user-name {\n            font-weight: 500;\n            font-size: 14px;\n        }\n        .user-details {\n            font-size: 12px;\n            color: #666;\n        }\n        .user-checkmark {\n            color: #ff0080;\n            font-weight: bold;\n            font-size: 18px;\n        }\n        .user-modal-buttons {\n            display: flex;\n            justify-content: flex-end;\n            gap: 10px;\n            margin-top: 15px;\n        }\n        .btn-unassign {\n            padding: 8px 16px;\n            background: #f0f0f0;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n        }\n        .btn-close-modal {\n            padding: 8px 16px;\n            background: #ff0080;\n            color: white;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n        }\n    ";
    document.head.appendChild(style);
}
// ================================
// DATA INITIALIZATION
// ================================
function initializeData() {
    console.log('Initializing data...');
    tasks = [];
    subtasks = [];
    var rows = document.querySelectorAll("tbody tr");
    console.log('Total rows found:', rows.length);
    rows.forEach(function (row, index) {
        var _a, _b, _c, _d, _e;
        console.log("Row ".concat(index, ":"), row.className);
        var firstCell = row.cells[0];
        var isSubtask = firstCell && firstCell.colSpan > 1;
        if (isSubtask) {
            var checkbox = row.querySelector('input[type="checkbox"]');
            var statusBadge = row.querySelector('.skystemtaskmaster-status-badge');
            var taskNameCell = row.cells[0];
            if (checkbox && statusBadge && taskNameCell) {
                var ownerCell = null;
                var reviewerCell = null;
                for (var i = 0; i < row.cells.length; i++) {
                    var cell = row.cells[i];
                    var badge = cell.querySelector('.skystemtaskmaster-badge');
                    if (badge) {
                        if (!ownerCell)
                            ownerCell = cell;
                        else if (!reviewerCell)
                            reviewerCell = cell;
                    }
                }
                subtasks.push({
                    id: "subtask_".concat(Date.now(), "_").concat(index),
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
                    row: row,
                    statusBadge: statusBadge,
                    taskNameCell: taskNameCell,
                    ownerCell: ownerCell || row.cells[row.cells.length - 2],
                    reviewerCell: reviewerCell || row.cells[row.cells.length - 1],
                    checkbox: checkbox
                });
                console.log('Subtask added:', taskNameCell.innerText);
            }
        }
        else if (!row.classList.contains('main-list-row') &&
            !row.classList.contains('sub-list-row') &&
            !row.classList.contains('skystemtaskmaster-subtask-header')) {
            var checkbox = row.querySelector('input[type="checkbox"]');
            var statusBadge = row.querySelector('.skystemtaskmaster-status-badge');
            var dueDateCell = row.cells[3];
            var daysCell = row.cells[8];
            var taskNameCell = row.cells[0];
            if (checkbox && statusBadge && dueDateCell && daysCell && taskNameCell) {
                tasks.push({
                    id: "task_".concat(Date.now(), "_").concat(index),
                    subListId: '',
                    name: taskNameCell.innerText,
                    acc: ((_a = row.cells[1]) === null || _a === void 0 ? void 0 : _a.innerText) || '+',
                    tdoc: ((_b = row.cells[2]) === null || _b === void 0 ? void 0 : _b.innerText) || '0',
                    owner: ((_c = row.cells[5]) === null || _c === void 0 ? void 0 : _c.innerText) || 'PK',
                    reviewer: ((_d = row.cells[6]) === null || _d === void 0 ? void 0 : _d.innerText) || 'SM',
                    dueDate: dueDateCell.innerText,
                    status: statusBadge.innerText,
                    taskNumber: '',
                    taskOwner: ((_e = row.cells[5]) === null || _e === void 0 ? void 0 : _e.innerText) || 'PK',
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
                    row: row,
                    checkbox: checkbox,
                    statusBadge: statusBadge,
                    dueDateCell: dueDateCell,
                    daysCell: daysCell,
                    taskNameCell: taskNameCell
                });
                console.log('Task added:', taskNameCell.innerText);
            }
        }
    });
    console.log('Final tasks count:', tasks.length);
    console.log('Final subtasks count:', subtasks.length);
    updateCounts();
}
function updateCounts() {
    console.log('updateCounts called');
    var completed = 0;
    var inProgress = 0;
    var notStarted = 0;
    if (tasks && tasks.length > 0) {
        tasks.forEach(function (task, index) {
            if (task && task.statusBadge) {
                var statusText = task.statusBadge.innerText.trim();
                console.log("Task ".concat(index, " status:"), statusText);
                if (statusText === "Completed" || statusText === "✅ Completed")
                    completed++;
                else if (statusText === "In Progress" || statusText === "⏳ In Progress")
                    inProgress++;
                else if (statusText === "Not Started" || statusText === "⏹ Not Started")
                    notStarted++;
            }
        });
    }
    if (completed === 0 && inProgress === 0 && notStarted === 0) {
        console.log('Checking DOM directly for status badges...');
        document.querySelectorAll('.skystemtaskmaster-status-badge').forEach(function (badge) {
            var _a;
            var statusText = ((_a = badge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            if (statusText === "Completed" || statusText === "✅ Completed")
                completed++;
            else if (statusText === "In Progress" || statusText === "⏳ In Progress")
                inProgress++;
            else if (statusText === "Not Started" || statusText === "⏹ Not Started")
                notStarted++;
        });
    }
    console.log('Counts calculated - Completed:', completed, 'In Progress:', inProgress, 'Not Started:', notStarted);
    var completedEl = document.getElementById("completedCount");
    var inProgressEl = document.getElementById("inProgressCount");
    var notStartedEl = document.getElementById("notStartedCount");
    if (completedEl) {
        completedEl.innerText = completed.toString();
        completedEl.style.transform = 'scale(1.2)';
        setTimeout(function () {
            if (completedEl)
                completedEl.style.transform = 'scale(1)';
        }, 200);
    }
    if (inProgressEl) {
        inProgressEl.innerText = inProgress.toString();
        inProgressEl.style.transform = 'scale(1.2)';
        setTimeout(function () {
            if (inProgressEl)
                inProgressEl.style.transform = 'scale(1)';
        }, 200);
    }
    if (notStartedEl) {
        notStartedEl.innerText = notStarted.toString();
        notStartedEl.style.transform = 'scale(1.2)';
        setTimeout(function () {
            if (notStartedEl)
                notStartedEl.style.transform = 'scale(1)';
        }, 200);
    }
}
// ================================
// MAIN LIST CREATION
// ================================
function createMainList(listName) {
    var mainList = {
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
    showNotification("List \"".concat(listName, "\" created"));
    return mainList;
}
function createMainListTable(mainList) {
    var container = document.getElementById('mainTableContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mainTableContainer';
        container.className = 'main-table-container';
        var actionBar = document.querySelector('.skystemtaskmaster-action-bar');
        if (actionBar && actionBar.parentNode) {
            actionBar.parentNode.insertBefore(container, actionBar.nextSibling);
        }
        else {
            var wrapper_1 = document.querySelector('.skystemtaskmaster-main-wrapper');
            if (wrapper_1)
                wrapper_1.appendChild(container);
        }
    }
    var wrapper = document.createElement('div');
    wrapper.className = 'main-list-outer-wrapper';
    wrapper.setAttribute('data-mainlist-id', mainList.id);
    wrapper.style.marginBottom = '40px';
    var listHeading = document.createElement('div');
    listHeading.className = 'main-list-heading-outside';
    listHeading.style.cssText = "\n        margin-bottom: 12px;\n        padding: 8px 5px;\n        display: flex;\n        align-items: center;\n        gap: 10px;\n    ";
    var outsideCheckbox = document.createElement('input');
    outsideCheckbox.type = 'checkbox';
    outsideCheckbox.className = 'list-checkbox-outside';
    outsideCheckbox.style.cssText = "\n        width: 18px;\n        height: 18px;\n        cursor: pointer;\n        accent-color: #ff0080;\n    ";
    outsideCheckbox.title = 'Select this list';
    outsideCheckbox.addEventListener('change', function (e) {
        e.stopPropagation();
        handleMainListCheckbox(mainList, outsideCheckbox.checked);
        if (mainList.insideCheckbox) {
            mainList.insideCheckbox.checked = outsideCheckbox.checked;
        }
    });
    var nameSpan = document.createElement('span');
    nameSpan.className = 'list-name-outside';
    nameSpan.textContent = mainList.name;
    nameSpan.style.cssText = "\n        font-weight: 600;\n        font-size: 18px;\n        color: #333;\n    ";
    listHeading.appendChild(outsideCheckbox);
    listHeading.appendChild(nameSpan);
    var tableContainer = document.createElement('div');
    tableContainer.className = 'main-list-table-container';
    tableContainer.style.cssText = "\n        background: white;\n        border-radius: 8px;\n        overflow: visible !important;\n        box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n        border: 1px solid #e0e0e0;\n    ";
    var table = document.createElement('table');
    table.className = 'skystemtaskmaster-table';
    table.style.cssText = "\n        width: 100%;\n        border-collapse: collapse;\n        background-color: white;\n        overflow: visible !important;\n    ";
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    headerRow.className = 'main-header-row';
    var baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    baseColumns.forEach(function (colKey) {
        var col = columnConfig.find(function (c) { return c.key === colKey; });
        if (col && col.visible !== false) {
            var th = document.createElement('th');
            th.textContent = col.label;
            th.setAttribute('data-column', col.key);
            th.style.cssText = "\n                padding: 12px 8px;\n                text-align: left;\n                border-bottom: 2px solid #ff0080;\n                background-color: #f8f8f8;\n                font-weight: 600;\n            ";
            headerRow.appendChild(th);
        }
    });
    columnConfig.forEach(function (col) {
        if (!baseColumns.includes(col.key) && col.visible !== false) {
            var th = document.createElement('th');
            th.textContent = col.label;
            th.className = 'extra-column';
            th.setAttribute('data-column', col.key);
            th.style.cssText = "\n                padding: 12px 8px;\n                text-align: left;\n                border-bottom: 2px solid #ff0080;\n                background-color: #f8f8f8;\n            ";
            headerRow.appendChild(th);
        }
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    tbody.id = "mainTableBody_".concat(mainList.id);
    tbody.className = 'main-list-tbody';
    tbody.style.cssText = 'overflow: visible !important;';
    var titleRow = document.createElement('tr');
    titleRow.className = 'main-list-title-row';
    titleRow.style.cssText = "\n        background-color: #f0f0f0 !important;\n        border-top: 2px solid #ff0080;\n        border-bottom: 2px solid #ff0080;\n        position: relative;\n        z-index: 10;\n    ";
    var visibleCols = getVisibleColumnCount();
    var titleCell = document.createElement('td');
    titleCell.colSpan = visibleCols;
    titleCell.style.padding = '0';
    var titleDiv = document.createElement('div');
    titleDiv.className = 'list-header-inside';
    titleDiv.style.cssText = "\n        display: flex;\n        align-items: center;\n        gap: 10px;\n        padding: 12px 15px;\n        width: 100%;\n        box-sizing: border-box;\n        position: relative;\n    ";
    var insideCheckbox = document.createElement('input');
    insideCheckbox.type = 'checkbox';
    insideCheckbox.className = 'list-checkbox-inside';
    insideCheckbox.style.cssText = "\n        width: 18px;\n        height: 18px;\n        cursor: pointer;\n        accent-color: #ff0080;\n    ";
    insideCheckbox.title = 'Select this list';
    insideCheckbox.addEventListener('change', function (e) {
        e.stopPropagation();
        handleMainListCheckbox(mainList, insideCheckbox.checked);
        outsideCheckbox.checked = insideCheckbox.checked;
    });
    var insideIcon = document.createElement('span');
    insideIcon.className = 'list-icon-inside';
    insideIcon.innerHTML = '<i class="fa-solid fa-clipboard-list"></i>';
    insideIcon.style.cssText = "\n        font-size: 20px;\n        color: #ff0080;\n    ";
    var insideNameSpan = document.createElement('span');
    insideNameSpan.className = 'list-name-inside';
    insideNameSpan.textContent = mainList.name;
    insideNameSpan.style.cssText = "\n        flex: 1;\n        font-weight: bold;\n        font-size: 16px;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n    ";
    var insidePlusDropdown = document.createElement('div');
    insidePlusDropdown.style.cssText = "\n        position: relative;\n        display: inline-block;\n        z-index: 100;\n    ";
    var insidePlusIcon = document.createElement('span');
    insidePlusIcon.innerHTML = '<i class="fa-solid fa-plus-circle"></i>';
    insidePlusIcon.style.cssText = "\n        font-size: 18px;\n        cursor: pointer;\n        color: #ff0080;\n        margin: 0 8px;\n        transition: transform 0.2s;\n        display: inline-block;\n    ";
    var insideDropdownContent = document.createElement('div');
    insideDropdownContent.className = 'plus-dropdown-content-inside';
    insideDropdownContent.style.cssText = "\n        display: none;\n        position: absolute;\n        top: 100%;\n        right: 0;\n        background: white;\n        border-radius: 8px;\n        box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n        min-width: 150px;\n        z-index: 1001;\n        margin-top: 5px;\n        overflow: hidden;\n    ";
    var insideAddSublistOption = document.createElement('div');
    insideAddSublistOption.className = 'plus-dropdown-item';
    insideAddSublistOption.style.cssText = "\n        padding: 10px 16px;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        border-bottom: 1px solid #eee;\n        color: #333;\n        transition: background 0.2s;\n    ";
    insideAddSublistOption.innerHTML = '<i class="fa-solid fa-folder-plus" style="color: #00cfff;"></i><span>Add Sub List</span>';
    insideAddSublistOption.addEventListener('click', function (e) {
        e.stopPropagation();
        showCreateSubListModal(mainList);
        insideDropdownContent.style.display = 'none';
    });
    var insideAddTaskOption = document.createElement('div');
    insideAddTaskOption.className = 'plus-dropdown-item';
    insideAddTaskOption.style.cssText = "\n        padding: 10px 16px;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        color: #333;\n        transition: background 0.2s;\n    ";
    insideAddTaskOption.innerHTML = '<i class="fa-solid fa-tasks" style="color: #ff0080;"></i><span>Add List</span>';
    insideAddTaskOption.addEventListener('click', function (e) {
        e.stopPropagation();
        showCreateTaskForMainList(mainList);
        insideDropdownContent.style.display = 'none';
    });
    insideAddSublistOption.addEventListener('mouseenter', function () {
        insideAddSublistOption.style.backgroundColor = '#f5f5f5';
    });
    insideAddSublistOption.addEventListener('mouseleave', function () {
        insideAddSublistOption.style.backgroundColor = '';
    });
    insideAddTaskOption.addEventListener('mouseenter', function () {
        insideAddTaskOption.style.backgroundColor = '#f5f5f5';
    });
    insideAddTaskOption.addEventListener('mouseleave', function () {
        insideAddTaskOption.style.backgroundColor = '';
    });
    insideDropdownContent.appendChild(insideAddSublistOption);
    insideDropdownContent.appendChild(insideAddTaskOption);
    insidePlusDropdown.appendChild(insidePlusIcon);
    insidePlusDropdown.appendChild(insideDropdownContent);
    insidePlusIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelectorAll('.plus-dropdown-content-inside, .plus-dropdown-content').forEach(function (d) {
            if (d instanceof HTMLElement && d !== insideDropdownContent)
                d.style.display = 'none';
        });
        var isVisible = insideDropdownContent.style.display === 'block';
        insideDropdownContent.style.display = isVisible ? 'none' : 'block';
    });
    insidePlusIcon.addEventListener('mouseenter', function () {
        insidePlusIcon.style.transform = 'scale(1.1)';
    });
    insidePlusIcon.addEventListener('mouseleave', function () {
        insidePlusIcon.style.transform = 'scale(1)';
    });
    var insideCollapseIcon = document.createElement('span');
    insideCollapseIcon.className = 'collapse-icon-inside';
    insideCollapseIcon.innerHTML = '';
    insideCollapseIcon.style.cssText = "\n        font-size: 16px;\n        cursor: pointer;\n        color: #666;\n        transition: transform 0.2s;\n    ";
    insideCollapseIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMainList(mainList);
    });
    insideCollapseIcon.addEventListener('mouseenter', function () {
        insideCollapseIcon.style.transform = 'scale(1.1)';
    });
    insideCollapseIcon.addEventListener('mouseleave', function () {
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
    document.addEventListener('click', function (e) {
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
function toggleMainList(mainList) {
    var _a;
    mainList.isExpanded = !mainList.isExpanded;
    var icon = mainList.insideCollapseIcon;
    if (icon) {
        icon.innerHTML = mainList.isExpanded ? '<i class="fas fa-angle-down"></i>' : '<i class="fas fa-angle-right"></i>';
    }
    var tbody = mainList.tbody;
    if (tbody) {
        var nextRow = (_a = mainList.titleRow) === null || _a === void 0 ? void 0 : _a.nextSibling;
        while (nextRow && nextRow instanceof HTMLElement && !nextRow.classList.contains('main-list-title-row')) {
            nextRow.style.display = mainList.isExpanded ? '' : 'none';
            nextRow = nextRow.nextSibling;
        }
    }
}
function handleMainListCheckbox(mainList, checked) {
    console.log("Main list ".concat(mainList.name, " checkbox: ").concat(checked));
    mainList.subLists.forEach(function (subList) {
        if (subList.row) {
            var sublistCheckbox = subList.row.querySelector('.sublist-checkbox');
            if (sublistCheckbox) {
                sublistCheckbox.checked = checked;
            }
        }
        subList.tasks.forEach(function (task) {
            if (task.row) {
                var taskCheckbox = task.row.querySelector('.task-checkbox');
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
function createSubList(mainList, subListName) {
    var subList = {
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
    showNotification("Sub list \"".concat(subListName, "\" created"));
    return subList;
}
function createSubListRow(subList, mainList) {
    var tbody = mainList.tbody;
    if (!tbody)
        return;
    var row = document.createElement('tr');
    row.className = 'sub-list-row';
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-mainlist-id', mainList.id);
    var visibleCols = getVisibleColumnCount();
    row.innerHTML = "\n        <td colspan=\"".concat(visibleCols, "\">\n            <div class=\"sublist-header\" style=\"display: flex; align-items: center; gap: 10px; padding: 10px 15px 10px 40px; width: 100%; box-sizing: border-box;\">\n                <input type=\"checkbox\" class=\"sublist-checkbox\" title=\"Select this sublist\">\n                <span class=\"sublist-icon\"><i class=\"fa-solid fa-folder\"></i></span>\n                <span class=\"sublist-name\" style=\"flex: 1; font-weight: 500;\">").concat(escapeHtml(subList.name), "</span>\n                <span class=\"collapse-sublist-icon\" style=\"cursor: pointer;\"><i class=\"fas fa-angle-down\"></i></span>\n            </div>\n        </td>\n    ");
    subList.row = row;
    var insertAfter = mainList.titleRow;
    if (insertAfter && insertAfter.nextSibling) {
        tbody.insertBefore(row, insertAfter.nextSibling);
    }
    else {
        tbody.appendChild(row);
    }
    var collapseIcon = row.querySelector('.collapse-sublist-icon');
    if (collapseIcon) {
        collapseIcon.addEventListener('click', function () { return toggleSubList(subList, mainList); });
    }
    var checkbox = row.querySelector('.sublist-checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', function (e) {
            e.stopPropagation();
            handleSublistCheckbox(subList, checkbox.checked);
        });
    }
    return row;
}
function toggleSubList(subList, mainList) {
    var _a, _b;
    subList.isExpanded = !subList.isExpanded;
    var icon = (_a = subList.row) === null || _a === void 0 ? void 0 : _a.querySelector('.collapse-sublist-icon i');
    if (icon) {
        icon.className = subList.isExpanded ? 'fas fa-angle-down' : 'fas fa-angle-right';
    }
    var tbody = mainList.tbody;
    if (tbody) {
        var nextRow = (_b = subList.row) === null || _b === void 0 ? void 0 : _b.nextSibling;
        while (nextRow && nextRow instanceof HTMLElement && !nextRow.classList.contains('sub-list-row')) {
            if (nextRow.classList && nextRow.classList.contains('task-row')) {
                nextRow.style.display = subList.isExpanded ? '' : 'none';
            }
            nextRow = nextRow.nextSibling;
        }
    }
}
function handleSublistCheckbox(subList, checked) {
    console.log("Sublist ".concat(subList.name, " checkbox: ").concat(checked));
    subList.tasks.forEach(function (task) {
        if (task.row) {
            var taskCheckbox = task.row.querySelector('.task-checkbox');
            if (taskCheckbox) {
                taskCheckbox.checked = checked;
            }
        }
    });
    var mainList = mainLists.find(function (m) { return m.id === subList.mainListId; });
    if (mainList && mainList.row) {
        var mainCheckbox = mainList.row.querySelector('.list-checkbox');
        if (mainCheckbox) {
            var allSublistsChecked = mainList.subLists.every(function (s) {
                var _a;
                var cb = (_a = s.row) === null || _a === void 0 ? void 0 : _a.querySelector('.sublist-checkbox');
                return cb ? cb.checked : false;
            });
            var anySublistChecked = mainList.subLists.some(function (s) {
                var _a;
                var cb = (_a = s.row) === null || _a === void 0 ? void 0 : _a.querySelector('.sublist-checkbox');
                return cb ? cb.checked : false;
            });
            if (allSublistsChecked) {
                mainCheckbox.checked = true;
                mainCheckbox.indeterminate = false;
            }
            else if (anySublistChecked) {
                mainCheckbox.checked = false;
                mainCheckbox.indeterminate = true;
            }
            else {
                mainCheckbox.checked = false;
                mainCheckbox.indeterminate = false;
            }
        }
    }
    updateSelectedCount();
}
function updateSelectedCount() {
    var selected = 0;
    tasks.forEach(function (task) {
        var _a;
        var checkbox = (_a = task.row) === null || _a === void 0 ? void 0 : _a.querySelector('.task-checkbox');
        if (checkbox && checkbox.checked)
            selected++;
    });
    subtasks.forEach(function (subtask) {
        var _a;
        var checkbox = (_a = subtask.row) === null || _a === void 0 ? void 0 : _a.querySelector('.subtask-checkbox');
        if (checkbox && checkbox.checked)
            selected++;
    });
    var selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = selected.toString();
    }
    console.log('Selected items:', selected);
    return selected;
}
// ================================
// TASK CREATION
// ================================
function createTask(subList, taskData) {
    var task = {
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
    setTimeout(function () {
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
    showNotification("Task \"".concat(taskData.name, "\" created"));
    return task;
}
function createTaskRow(task, subList) {
    var mainList = mainLists.find(function (m) { return m.id === subList.mainListId; });
    if (!mainList || !mainList.tbody)
        return;
    var tbody = mainList.tbody;
    var formattedDueDate = 'Set due date';
    var daysText = '0';
    var daysClass = 'skystemtaskmaster-days-positive';
    if (task.dueDate) {
        var date = new Date(task.dueDate);
        formattedDueDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        var today = new Date();
        var due = new Date(task.dueDate);
        var diffTime = due.getTime() - today.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
            daysText = '+' + diffDays;
        }
        else {
            daysText = diffDays.toString();
            daysClass = 'skystemtaskmaster-days-negative';
        }
    }
    var row = document.createElement('tr');
    row.className = 'task-row';
    var isRecurring = task.recurrenceType && task.recurrenceType !== 'None';
    if (isRecurring) {
        row.classList.add('recurring-task');
    }
    else {
        row.classList.add('non-recurring-task');
    }
    row.setAttribute('data-task-id', task.id);
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-recurrence-type', task.recurrenceType || 'None');
    var rowHTML = "\n        <td>\n            <div class=\"skystemtaskmaster-task-name\" style=\"padding-left: 70px; display: flex; align-items: center; gap: 8px;\">\n                <input type=\"checkbox\" class=\"task-checkbox\">\n                <span>".concat(escapeHtml(task.name), "</span>\n            </div>\n        </td>\n        <td><span style=\"color: #ff0080; font-weight: bold;\">").concat(escapeHtml(task.acc), "</span></td>\n        <td class=\"tdoc-cell\">").concat(escapeHtml(task.tdoc), "</td>\n        <td class=\"skystemtaskmaster-editable due-date\">").concat(escapeHtml(formattedDueDate), "</td>\n        <td><span class=\"skystemtaskmaster-status-badge skystemtaskmaster-status-not-started\">").concat(escapeHtml(task.status), "</span></td>\n        <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(task.owner.toLowerCase(), "\">").concat(escapeHtml(task.owner), "</span></td>\n        <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(task.reviewer.toLowerCase(), "\">").concat(escapeHtml(task.reviewer), "</span></td>\n        <td class=\"cdoc-cell\">0</td>\n        <td class=\"days-cell ").concat(daysClass, "\">").concat(daysText, "</td>\n    ");
    row.innerHTML = rowHTML;
    task.row = row;
    var insertAfter = subList.row;
    if (insertAfter && insertAfter.nextSibling) {
        tbody.insertBefore(row, insertAfter.nextSibling);
    }
    else {
        tbody.appendChild(row);
    }
    taskDocuments.set(row, []);
    taskTDocDocuments.set(row, []);
    addTaskEventListeners(task);
    setTimeout(function () {
        addExtraColumnsForRow(row, task);
        applyVisibilityForMainList(mainList);
    }, 100);
}
function addTaskEventListeners(task) {
    var _a;
    var row = task.row;
    if (!row)
        return;
    var statusBadge = row.querySelector('.skystemtaskmaster-status-badge');
    if (statusBadge) {
        statusBadge.style.cursor = 'pointer';
        statusBadge.title = 'Click to change status';
        var newBadge = statusBadge.cloneNode(true);
        (_a = statusBadge.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newBadge, statusBadge);
        newBadge.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            console.log('Status badge clicked');
            showStatusChangeModal(task);
        });
        task.statusBadge = newBadge;
    }
    var ownerCell = row.cells[5];
    if (ownerCell) {
        var ownerBadge = ownerCell.querySelector('.skystemtaskmaster-badge');
        if (ownerBadge) {
            ownerBadge.style.cursor = 'pointer';
            ownerCell.style.cursor = 'pointer';
            ownerCell.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                showUserModal(ownerCell, 'owner', task);
            });
        }
    }
    var reviewerCell = row.cells[6];
    if (reviewerCell) {
        var reviewerBadge = reviewerCell.querySelector('.skystemtaskmaster-badge');
        if (reviewerBadge) {
            reviewerBadge.style.cursor = 'pointer';
            reviewerCell.style.cursor = 'pointer';
            reviewerCell.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                showUserModal(reviewerCell, 'reviewer', task);
            });
        }
    }
    var checkbox = row.querySelector('.task-checkbox');
    if (checkbox && task.statusBadge) {
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                task.statusBadge.innerText = "Completed";
                task.statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-completed";
            }
            else {
                task.statusBadge.innerText = "Not Started";
                task.statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-not-started";
            }
            updateCounts();
        });
    }
    var dueDateCell = row.querySelector('.due-date');
    if (dueDateCell) {
        dueDateCell.addEventListener('blur', function () { return calculateDays(); });
    }
}
// ================================
// USER MODAL FUNCTIONS
// ================================
function showUserModal(cell, type, item) {
    var _a;
    var badge = cell.querySelector('.skystemtaskmaster-badge');
    var currentInitials = badge ? ((_a = badge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '' : '';
    var modal = document.getElementById('userSelectionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'userSelectionModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content modal-user-select\">\n                <span class=\"close\">&times;</span>\n                <h3 class=\"modal-title\">Select ".concat(type === 'owner' ? 'Owner' : 'Reviewer', "</h3>\n                \n                <div class=\"user-search-container\">\n                    <input type=\"text\" id=\"userSearch\" class=\"user-search-input\" \n                           placeholder=\"Search by name or initials...\">\n                </div>\n                \n                <div class=\"user-list-container\" id=\"userList\"></div>\n                \n                <div class=\"user-modal-buttons\">\n                    <button id=\"unassignUserBtn\" class=\"btn-unassign\">Unassign</button>\n                    <button id=\"closeUserModal\" class=\"btn-close-modal\">Close</button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(modal);
        var closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                if (modal)
                    modal.style.display = 'none';
            });
        }
        var closeModalBtn = document.getElementById('closeUserModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function () {
                if (modal)
                    modal.style.display = 'none';
            });
        }
        var searchInput_1 = document.getElementById('userSearch');
        if (searchInput_1) {
            searchInput_1.addEventListener('keyup', function () {
                updateUserList(searchInput_1.value, currentInitials, type, cell, item);
            });
        }
        var unassignBtn = document.getElementById('unassignUserBtn');
        if (unassignBtn) {
            unassignBtn.addEventListener('click', function () {
                unassignUser(cell, type, item);
                if (modal)
                    modal.style.display = 'none';
            });
        }
    }
    updateUserList('', currentInitials, type, cell, item);
    if (modal)
        modal.style.display = 'block';
    setTimeout(function () {
        var searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
    }, 100);
}
function updateUserList(searchText, currentInitials, type, cell, item) {
    var userList = document.getElementById('userList');
    if (!userList)
        return;
    var filtered = availableUsers.filter(function (user) {
        var searchLower = searchText.toLowerCase();
        return user.name.toLowerCase().indexOf(searchLower) !== -1 ||
            user.initials.toLowerCase().indexOf(searchLower) !== -1 ||
            user.email.toLowerCase().indexOf(searchLower) !== -1;
    });
    if (filtered.length === 0) {
        userList.innerHTML = '<div class="user-list-empty">No users found</div>';
        return;
    }
    userList.innerHTML = filtered.map(function (user) {
        var isCurrent = user.initials === currentInitials;
        return "\n            <div class=\"user-item ".concat(isCurrent ? 'user-item-current' : '', "\" data-user='").concat(JSON.stringify(user), "'>\n                <span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(user.initials.toLowerCase(), " user-badge\">\n                    ").concat(user.initials, "\n                </span>\n                <div class=\"user-info\">\n                    <div class=\"user-name\">").concat(escapeHtml(user.name), "</div>\n                    <div class=\"user-details\">").concat(escapeHtml(user.email), " \u2022 ").concat(escapeHtml(user.role), "</div>\n                </div>\n                ").concat(isCurrent ? '<span class="user-checkmark">✓</span>' : '', "\n            </div>\n        ");
    }).join('');
    userList.querySelectorAll('.user-item').forEach(function (el) {
        el.addEventListener('click', function () {
            var userData = el.getAttribute('data-user');
            if (userData) {
                var user = JSON.parse(userData);
                assignUser(cell, user, type, item);
                var modal = document.getElementById('userSelectionModal');
                if (modal)
                    modal.style.display = 'none';
            }
        });
    });
}
function assignUser(cell, user, type, item) {
    cell.innerHTML = '';
    var badge = document.createElement('span');
    badge.className = "skystemtaskmaster-badge skystemtaskmaster-badge-".concat(user.initials.toLowerCase());
    badge.textContent = user.initials;
    badge.title = "".concat(user.name, " (").concat(user.role, ")");
    cell.appendChild(badge);
    makeCellClickable(cell, type, item);
    if ('dueDateCell' in item) {
        var taskItem_1 = item;
        if (type === 'owner') {
            var taskIndex = tasks.findIndex(function (t) { return t.row === taskItem_1.row; });
            if (taskIndex !== -1) {
                var row = tasks[taskIndex].row;
                if (row) {
                    var oldCell = row.cells[5];
                    var newCell = document.createElement('td');
                    newCell.innerHTML = cell.innerHTML;
                    newCell.className = oldCell.className;
                    newCell.style.cssText = oldCell.style.cssText;
                    row.replaceChild(newCell, oldCell);
                    tasks[taskIndex].row.cells[5] = newCell;
                    makeCellClickable(newCell, type, taskItem_1);
                }
            }
        }
        else {
            var taskIndex = tasks.findIndex(function (t) { return t.row === taskItem_1.row; });
            if (taskIndex !== -1) {
                var row = tasks[taskIndex].row;
                if (row) {
                    var oldCell = row.cells[6];
                    var newCell = document.createElement('td');
                    newCell.innerHTML = cell.innerHTML;
                    newCell.className = oldCell.className;
                    newCell.style.cssText = oldCell.style.cssText;
                    row.replaceChild(newCell, oldCell);
                    tasks[taskIndex].row.cells[6] = newCell;
                    makeCellClickable(newCell, type, taskItem_1);
                }
            }
        }
    }
    else {
        var subtaskItem_1 = item;
        if (type === 'owner') {
            var subtaskIndex = subtasks.findIndex(function (s) { return s.row === subtaskItem_1.row; });
            if (subtaskIndex !== -1) {
                subtasks[subtaskIndex].ownerCell = cell;
            }
        }
        else {
            var subtaskIndex = subtasks.findIndex(function (s) { return s.row === subtaskItem_1.row; });
            if (subtaskIndex !== -1) {
                subtasks[subtaskIndex].reviewerCell = cell;
            }
        }
    }
    showNotification("Assigned ".concat(user.name, " as ").concat(type));
}
function unassignUser(cell, type, item) {
    cell.innerHTML = '';
    var emptySpan = document.createElement('span');
    emptySpan.className = 'empty-assignee';
    emptySpan.textContent = '?';
    emptySpan.title = 'Click to assign';
    cell.appendChild(emptySpan);
    makeCellClickable(cell, type, item);
    showNotification("".concat(type, " unassigned"));
}
function makeCellClickable(cell, type, item) {
    var _a;
    var newCell = cell.cloneNode(true);
    (_a = cell.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newCell, cell);
    newCell.style.cursor = 'pointer';
    newCell.title = "Click to change ".concat(type);
    newCell.addEventListener('click', function (e) {
        e.stopPropagation();
        showUserModal(newCell, type, item);
    });
    newCell.addEventListener('mouseenter', function () {
        newCell.style.backgroundColor = '#fff0f5';
        newCell.style.borderRadius = '4px';
    });
    newCell.addEventListener('mouseleave', function () {
        newCell.style.backgroundColor = '';
    });
}
// ================================
// STATUS MODAL FUNCTIONS
// ================================
function showStatusChangeModal(task) {
    console.log('Opening status modal for task:', task);
    currentTaskForStatus = task;
    var currentStatus = task.statusBadge ? task.statusBadge.innerText : (task.status || 'Not Started');
    var modalHtml = "\n        <div id=\"statusChangeModal\" class=\"modal status-modal\">\n            <div class=\"modal-content status-modal-content\">\n                <span class=\"close\">&times;</span>\n                <h3 class=\"status-modal-title\">Change Status</h3>\n                \n                <div class=\"status-modal-body\">\n                    <div class=\"status-field\">\n                        <label class=\"status-label\">Current Status</label>\n                        <div id=\"currentStatusDisplay\" class=\"current-status-display\" data-status=\"".concat(escapeHtml(currentStatus), "\">\n                            ").concat(escapeHtml(currentStatus), "\n                        </div>\n                    </div>\n                    \n                    <div class=\"status-field\">\n                        <label class=\"status-label\">New Status</label>\n                        <select id=\"newStatusSelect\" class=\"status-select\">\n                            <option value=\"Not Started\">Not Started</option>\n                            <option value=\"In Progress\">In Progress</option>\n                            <option value=\"Completed\">Completed</option>\n                            <option value=\"Review\">Review</option>\n                            <option value=\"Approved\">Approved</option>\n                            <option value=\"Rejected\">Rejected</option>\n                            <option value=\"Hold\">Hold</option>\n                            <option value=\"Overdue\">Overdue</option>\n                        </select>\n                    </div>\n                    \n                    <div class=\"status-field\">\n                        <label class=\"status-label\">Comment (Optional)</label>\n                        <textarea id=\"statusComment\" class=\"status-comment\" rows=\"3\" placeholder=\"Add comment...\"></textarea>\n                        <div class=\"status-comment-count\">0/500</div>\n                    </div>\n                </div>\n                \n                <div class=\"status-modal-buttons\">\n                    <button id=\"cancelStatusBtn\" class=\"btn-cancel-status\">Cancel</button>\n                    <button id=\"updateStatusBtn\" class=\"btn-update-status\">Update Status</button>\n                </div>\n            </div>\n        </div>\n    ");
    var existingModal = document.getElementById('statusChangeModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    var modal = document.getElementById('statusChangeModal');
    var select = document.getElementById('newStatusSelect');
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    var commentTextarea = document.getElementById('statusComment');
    var charCounter = modal.querySelector('.status-comment-count');
    if (commentTextarea && charCounter) {
        commentTextarea.addEventListener('input', function () {
            var length = this.value.length;
            charCounter.textContent = "".concat(length, "/500");
            if (length > 500) {
                charCounter.classList.add('status-comment-count-exceed');
                this.classList.add('status-comment-error');
            }
            else {
                charCounter.classList.remove('status-comment-count-exceed');
                this.classList.remove('status-comment-error');
            }
        });
    }
    var closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function () {
        modal.remove();
        currentTaskForStatus = null;
    };
    var cancelBtn = document.getElementById('cancelStatusBtn');
    cancelBtn.onclick = function () {
        modal.remove();
        currentTaskForStatus = null;
    };
    var updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = function () {
        var newStatus = document.getElementById('newStatusSelect').value;
        var comment = document.getElementById('statusComment').value;
        if (currentTaskForStatus) {
            var task_1 = currentTaskForStatus;
            var oldStatus_1 = task_1.statusBadge ? task_1.statusBadge.innerText : (task_1.status || 'Not Started');
            updateBtn.classList.add('loading');
            updateBtn.disabled = true;
            setTimeout(function () {
                updateTaskStatusUniversal(task_1, newStatus);
                if (comment && comment.trim()) {
                    addStatusChangeComment(task_1.row, oldStatus_1, newStatus, comment);
                }
                showNotification("Status changed from ".concat(oldStatus_1, " to ").concat(newStatus));
                console.log('Status updated successfully');
                updateBtn.classList.remove('loading');
                updateBtn.classList.add('success');
                setTimeout(function () {
                    updateBtn.classList.remove('success');
                    modal.remove();
                    currentTaskForStatus = null;
                }, 300);
            }, 300);
        }
        else {
            modal.remove();
            currentTaskForStatus = null;
        }
    };
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.remove();
            currentTaskForStatus = null;
        }
    };
    setTimeout(function () {
        select.focus();
    }, 100);
}
function updateTaskStatusUniversal(task, newStatus) {
    console.log('Universal status update called for task:', task.name, 'New status:', newStatus);
    if (task.statusBadge) {
        task.statusBadge.innerText = newStatus;
        task.statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'));
    }
    if (task.row) {
        var allStatusBadges = task.row.querySelectorAll('.skystemtaskmaster-status-badge');
        allStatusBadges.forEach(function (badge) {
            badge.innerText = newStatus;
            badge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'));
        });
    }
    if (task.row && task.row.cells[4]) {
        var statusBaseCell = task.row.cells[4];
        var badge = statusBaseCell.querySelector('.skystemtaskmaster-status-badge');
        if (badge) {
            badge.innerText = newStatus;
            badge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'));
        }
        else {
            statusBaseCell.innerHTML = "<span class=\"skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'), "\">").concat(newStatus, "</span>");
        }
    }
    if (task.row) {
        var extraStatusCells = task.row.querySelectorAll('.extra-cell[data-column="taskStatus"]');
        if (extraStatusCells.length === 0) {
            extraStatusCells = task.row.querySelectorAll('td.extra-cell');
            extraStatusCells = Array.from(extraStatusCells).filter(function (cell) {
                var colKey = cell.getAttribute('data-column');
                return colKey === 'taskStatus';
            });
        }
        console.log('Found extra status cells:', extraStatusCells.length);
        if (extraStatusCells.length > 0) {
            extraStatusCells.forEach(function (cell) {
                cell.textContent = newStatus;
                cell.style.backgroundColor = '#e8f5e9';
                cell.style.transition = 'background-color 0.3s';
                setTimeout(function () {
                    cell.style.backgroundColor = '';
                }, 500);
                cell.style.cursor = 'pointer';
                cell.setAttribute('title', 'Click to change status');
                makeStatusCellClickable(cell, task);
                console.log('Updated existing extra status cell to:', newStatus);
            });
        }
        else {
            console.log('Creating new extra status cell...');
            var newCell = document.createElement('td');
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
    var taskIndex = tasks.findIndex(function (t) { return t.id === task.id || t.row === task.row; });
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        tasks[taskIndex].taskStatus = newStatus;
        if (tasks[taskIndex].statusBadge) {
            tasks[taskIndex].statusBadge.innerText = newStatus;
        }
    }
    setTimeout(function () {
        if (task.row) {
            var allStatusElements = task.row.querySelectorAll('.skystemtaskmaster-status-badge, .extra-cell[data-column="taskStatus"], td[data-column="taskStatus"]');
            allStatusElements.forEach(function (el) {
                var element = el;
                if (element.innerText !== newStatus) {
                    element.innerText = newStatus;
                    console.log('Final correction - updated element:', element);
                }
            });
            var finalCheck = task.row.querySelectorAll('.extra-cell[data-column="taskStatus"]');
            if (finalCheck.length === 0) {
                console.log('Final check: No status cell found, creating one more time');
                var finalCell = document.createElement('td');
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
    setTimeout(function () { return saveAllData(); }, 200);
    console.log('Status update complete for task, new status:', newStatus);
}
function makeStatusCellClickable(cell, item) {
    if (!cell)
        return cell;
    var newCell = cell.cloneNode(true);
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    newCell.style.cursor = 'pointer';
    newCell.style.transition = 'all 0.2s';
    newCell.title = 'Click to change status';
    newCell.addEventListener('mouseenter', function () {
        newCell.style.backgroundColor = '#fff0f5';
        newCell.style.transform = 'scale(1.02)';
        newCell.style.fontWeight = 'bold';
    });
    newCell.addEventListener('mouseleave', function () {
        newCell.style.backgroundColor = '';
        newCell.style.transform = 'scale(1)';
        newCell.style.fontWeight = '';
    });
    newCell.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('Task Status cell clicked!');
        if ('dueDateCell' in item) {
            showStatusChangeModal(item);
        }
        else {
            showSubtaskStatusChangeModal(item);
        }
    });
    return newCell;
}
function showSubtaskStatusChangeModal(subtask) {
    var _a, _b, _c;
    console.log('Opening status modal for subtask:', subtask);
    currentSubtaskForStatus = subtask;
    var modalHtml = "\n        <div id=\"statusChangeModal\" class=\"modal status-modal\">\n            <div class=\"modal-content status-modal-content\">\n                <span class=\"close\">&times;</span>\n                <h3 class=\"status-modal-title\">Change Subtask Status</h3>\n                \n                <div class=\"status-modal-body\">\n                    <div class=\"status-field\">\n                        <label class=\"status-label\">Current Status</label>\n                        <div id=\"currentStatusDisplay\" class=\"current-status-display\" data-status=\"".concat(escapeHtml(((_a = subtask.statusBadge) === null || _a === void 0 ? void 0 : _a.innerText) || 'Not Started'), "\">\n                            ").concat(escapeHtml(((_b = subtask.statusBadge) === null || _b === void 0 ? void 0 : _b.innerText) || 'Not Started'), "\n                        </div>\n                    </div>\n                    \n                    <div class=\"status-field\">\n                        <label class=\"status-label\">New Status</label>\n                        <select id=\"newStatusSelect\" class=\"status-select\">\n                            <option value=\"Not Started\">Not Started</option>\n                            <option value=\"In Progress\">In Progress</option>\n                            <option value=\"Completed\">Completed</option>\n                            <option value=\"Review\">Review</option>\n                            <option value=\"Approved\">Approved</option>\n                            <option value=\"Rejected\">Rejected</option>\n                            <option value=\"Hold\">Hold</option>\n                            <option value=\"Overdue\">Overdue</option>\n                        </select>\n                    </div>\n                    \n                    <div class=\"status-field\">\n                        <label class=\"status-label\">Comment (Optional)</label>\n                        <textarea id=\"statusComment\" class=\"status-comment\" rows=\"3\" placeholder=\"Add comment...\"></textarea>\n                        <div class=\"status-comment-count\">0/500</div>\n                    </div>\n                </div>\n                \n                <div class=\"status-modal-buttons\">\n                    <button id=\"cancelStatusBtn\" class=\"btn-cancel-status\">Cancel</button>\n                    <button id=\"updateStatusBtn\" class=\"btn-update-status\">Update Status</button>\n                </div>\n            </div>\n        </div>\n    ");
    var existingModal = document.getElementById('statusChangeModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    var modal = document.getElementById('statusChangeModal');
    var select = document.getElementById('newStatusSelect');
    var currentStatus = ((_c = subtask.statusBadge) === null || _c === void 0 ? void 0 : _c.innerText) || 'Not Started';
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    var commentTextarea = document.getElementById('statusComment');
    var charCounter = modal.querySelector('.status-comment-count');
    if (commentTextarea && charCounter) {
        commentTextarea.addEventListener('input', function () {
            var length = this.value.length;
            charCounter.textContent = "".concat(length, "/500");
            if (length > 500) {
                charCounter.style.color = '#f44336';
                this.style.borderColor = '#f44336';
            }
            else {
                charCounter.style.color = '#999';
                this.style.borderColor = '';
            }
        });
    }
    var closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function () {
        modal.remove();
        currentSubtaskForStatus = null;
    };
    var cancelBtn = document.getElementById('cancelStatusBtn');
    cancelBtn.onclick = function () {
        modal.remove();
        currentSubtaskForStatus = null;
    };
    var updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = function () {
        var _a;
        console.log('Update subtask button clicked!');
        var newStatus = document.getElementById('newStatusSelect').value;
        var comment = document.getElementById('statusComment').value;
        if (currentSubtaskForStatus) {
            var subtask_1 = currentSubtaskForStatus;
            var oldStatus_2 = ((_a = subtask_1.statusBadge) === null || _a === void 0 ? void 0 : _a.innerText) || 'Not Started';
            updateBtn.classList.add('loading');
            updateBtn.disabled = true;
            setTimeout(function () {
                if (subtask_1.statusBadge) {
                    subtask_1.statusBadge.innerText = newStatus;
                    subtask_1.statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'));
                }
                if (subtask_1.taskStatus !== undefined) {
                    subtask_1.taskStatus = newStatus;
                }
                updateTaskStatusExtraColumn(subtask_1.row, newStatus);
                updateCounts();
                showNotification("Subtask status changed from ".concat(oldStatus_2, " to ").concat(newStatus));
                updateBtn.classList.remove('loading');
                updateBtn.classList.add('success');
                setTimeout(function () {
                    updateBtn.classList.remove('success');
                    modal.remove();
                    currentSubtaskForStatus = null;
                }, 300);
            }, 300);
        }
        else {
            modal.remove();
            currentSubtaskForStatus = null;
        }
    };
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.remove();
            currentSubtaskForStatus = null;
        }
    };
    setTimeout(function () {
        select.focus();
    }, 100);
}
function updateTaskStatusExtraColumn(row, newStatus) {
    if (!row)
        return;
    var extraCells = row.querySelectorAll('.extra-cell');
    extraCells.forEach(function (cell) {
        var columnKey = cell.getAttribute('data-column');
        if (columnKey === 'taskStatus') {
            cell.textContent = newStatus;
            cell.style.backgroundColor = '';
            cell.style.transition = '';
            setTimeout(function () {
                cell.style.backgroundColor = '';
            }, 500);
            console.log('Task Status column updated to:', newStatus);
        }
    });
}
function addStatusChangeComment(row, oldStatus, newStatus, comment) {
    if (!row)
        return;
    var statusHistory = row.getAttribute('data-status-history') || '';
    var newEntry = "".concat(new Date().toLocaleString(), ": ").concat(oldStatus, " \u2192 ").concat(newStatus).concat(comment ? ' - ' + comment : '');
    row.setAttribute('data-status-history', statusHistory ? statusHistory + '|' + newEntry : newEntry);
}
// ================================
// EXTRA COLUMNS FUNCTIONS
// ================================
function addExtraColumns() {
    var mainHeader = document.getElementById('mainHeader');
    var subtaskHeader = document.getElementById('subtaskHeader');
    if (!mainHeader)
        return;
    document.querySelectorAll('.extra-column, .extra-header-column').forEach(function (el) { return el.remove(); });
    var baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    columnConfig.forEach(function (col) {
        if (baseColumns.indexOf(col.key) === -1) {
            var th = document.createElement('th');
            th.className = 'extra-column';
            th.setAttribute('data-column', col.key);
            th.textContent = col.label;
            th.style.display = col.visible ? '' : 'none';
            mainHeader.appendChild(th);
        }
    });
    if (subtaskHeader) {
        var subtaskRow = subtaskHeader.closest('tr');
        if (subtaskRow) {
            columnConfig.forEach(function (col) {
                if (col.forSubtask && baseColumns.indexOf(col.key) === -1) {
                    var td = document.createElement('td');
                    td.className = 'extra-header-column';
                    td.setAttribute('data-header-column', col.key);
                    td.textContent = col.label;
                    td.style.display = col.visible ? '' : 'none';
                    subtaskHeader.appendChild(td);
                }
            });
        }
    }
    setTimeout(function () {
        updateSublistRowsColspan();
    }, 100);
}
function addDataCells() {
    document.querySelectorAll('.task-row').forEach(function (row) {
        var taskId = row.getAttribute('data-task-id') || '1';
        row.querySelectorAll('.extra-cell').forEach(function (cell) { return cell.remove(); });
        var task = tasks.find(function (t) { return t.row === row; });
        columnConfig.forEach(function (col) {
            var baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
            if (baseColumns.indexOf(col.key) === -1) {
                var cell = document.createElement('td');
                cell.className = 'extra-cell';
                cell.setAttribute('data-column', col.key);
                var value = '—';
                if (task) {
                    value = getTaskColumnValue(task, col.key);
                }
                else {
                    if (col.key === 'taskNumber')
                        value = 'TSK-00' + taskId;
                    else if (col.key === 'taskStatus')
                        value = (task === null || task === void 0 ? void 0 : task.status) || 'Not Started';
                    else if (col.key === 'createdBy')
                        value = 'PK';
                    else if (col.key === 'approver')
                        value = '—';
                    else if (col.key === 'recurrenceType')
                        value = 'None';
                }
                cell.textContent = value;
                cell.style.display = col.visible ? '' : 'none';
                row.appendChild(cell);
            }
        });
        if (task) {
            setTimeout(function () {
                makeExtraCellsEditable(row, task);
            }, 50);
        }
    });
    document.querySelectorAll('.subtask-row').forEach(function (row) {
        // Handle subtask extra cells
    });
}
function addExtraColumnsForRow(row, task) {
    row.querySelectorAll('.extra-cell').forEach(function (cell) { return cell.remove(); });
    var baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    columnConfig.forEach(function (col) {
        if (!baseColumns.includes(col.key) && col.visible !== false) {
            var cell = document.createElement('td');
            cell.className = 'extra-cell';
            cell.setAttribute('data-column', col.key);
            var value = getTaskColumnValue(task, col.key);
            cell.textContent = value;
            cell.style.display = col.visible !== false ? '' : 'none';
            row.appendChild(cell);
        }
    });
}
function getTaskColumnValue(task, columnKey) {
    if (!task)
        return '—';
    switch (columnKey) {
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
                    var date = new Date(task.assigneeDueDate);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
                catch (e) {
                    return task.assigneeDueDate;
                }
            }
            return task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
        case 'customField1':
            return task.customField1 || '—';
        case 'reviewerDueDate':
            if (task.reviewerDueDate) {
                try {
                    var date = new Date(task.reviewerDueDate);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
                catch (e) {
                    return task.reviewerDueDate;
                }
            }
            return '—';
        case 'customField2':
            return task.customField2 || '—';
        case 'dueDate':
            if (task.dueDate) {
                try {
                    var date = new Date(task.dueDate);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
                catch (e) {
                    return task.dueDate;
                }
            }
            return 'Set due date';
        case 'linkedAccounts':
            return task.linkedAccounts || '—';
        case 'completionDate':
            if (task.completionDate) {
                try {
                    var date = new Date(task.completionDate);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
                catch (e) {
                    return task.completionDate;
                }
            }
            return '—';
        case 'days':
            if (task.dueDate) {
                var today = new Date();
                var due = new Date(task.dueDate);
                var diffTime = due.getTime() - today.getTime();
                var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 ? '+' + diffDays : diffDays.toString();
            }
            return '0';
        case 'notifier':
            return task.notifier || '—';
        default:
            return '—';
    }
}
function makeExtraCellsEditable(row, task) {
    row.querySelectorAll('.extra-cell').forEach(function (cell) {
        var colKey = cell.getAttribute('data-column');
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
function makeExtraUserCellClickable(cell, item, columnKey) {
    var _a;
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    var titleText = 'Click to change ';
    if (columnKey === 'taskOwner')
        titleText += 'Task Owner';
    else if (columnKey === 'createdBy')
        titleText += 'Created By';
    else if (columnKey === 'approver')
        titleText += 'Approver';
    cell.title = titleText;
    cell.addEventListener('mouseenter', function () {
        cell.style.backgroundColor = '#fff0f5';
        cell.style.transform = 'scale(1.02)';
    });
    cell.addEventListener('mouseleave', function () {
        cell.style.backgroundColor = '';
        cell.style.transform = 'scale(1)';
    });
    var newCell = cell.cloneNode(true);
    (_a = cell.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newCell, cell);
    newCell.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log("".concat(columnKey, " cell clicked!"));
        if (item && item.row) {
            var currentValue = newCell.textContent.trim();
            var columnDisplayName = '';
            if (columnKey === 'taskOwner')
                columnDisplayName = 'Owner';
            else if (columnKey === 'createdBy')
                columnDisplayName = 'Created By';
            else if (columnKey === 'approver')
                columnDisplayName = 'Approver';
            showExtraUserSelectionModal(item, newCell, columnKey, columnDisplayName, currentValue);
        }
    });
    return newCell;
}
function showExtraUserSelectionModal(item, cell, columnKey, columnDisplayName, currentValue) {
    var _a, _b;
    console.log('Opening user modal for:', columnDisplayName, 'Current:', currentValue);
    var existingModal = document.getElementById('extraUserSelectionModal');
    if (existingModal) {
        existingModal.remove();
    }
    var modalHtml = "\n        <div id=\"extraUserSelectionModal\" class=\"modal\" style=\"display: block; z-index: 10000;\">\n            <div class=\"modal-content\" style=\"width: 400px; position: relative; z-index: 10001;\">\n                <span class=\"close\" style=\"position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer; color: #999;\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-bottom: 15px;\">Select ".concat(columnDisplayName, "</h3>\n                \n                <div style=\"margin: 20px 0;\">\n                    <div style=\"margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 6px;\">\n                        <div style=\"font-size: 13px; color: #666; margin-bottom: 5px;\">Task:</div>\n                        <div style=\"font-weight: 500;\">").concat(item.name || ((_b = (_a = item.taskNameCell) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) || 'Task', "</div>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 8px; font-weight: 500;\">Current ").concat(columnDisplayName, "</label>\n                        <div id=\"currentUserDisplay\" style=\"padding: 8px; background: #f0f0f0; border-radius: 4px; margin-bottom: 15px; ").concat(currentValue !== '—' ? 'color: #ff0080; font-weight: 500;' : 'color: #999;', "\">\n                            ").concat(currentValue || '—', "\n                        </div>\n                    </div>\n                    \n                    <div style=\"position: relative; margin-bottom: 15px;\">\n                        <input type=\"text\" id=\"userSearchInput\" placeholder=\"Search by name or initials...\" \n                               style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; font-size: 14px;\">\n                    </div>\n                    \n                    <div style=\"max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px;\" id=\"userListContainer\"></div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;\">\n                    <button id=\"unassignUserBtn\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;\">Unassign</button>\n                    <button id=\"closeUserModalBtn\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;\">Close</button>\n                </div>\n            </div>\n        </div>\n    ");
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    var modal = document.getElementById('extraUserSelectionModal');
    window.currentExtraItem = item;
    window.currentExtraCell = cell;
    window.currentExtraColumnKey = columnKey;
    window.currentExtraColumnName = columnDisplayName;
    window.currentExtraValue = currentValue;
    updateUserListInModal('', currentValue);
    var closeSpan = modal.querySelector('.close');
    closeSpan.addEventListener('click', function () {
        modal.remove();
        clearExtraUserReferences();
    });
    var closeModalBtn = document.getElementById('closeUserModalBtn');
    closeModalBtn.addEventListener('click', function () {
        modal.remove();
        clearExtraUserReferences();
    });
    var unassignBtn = document.getElementById('unassignUserBtn');
    unassignBtn.addEventListener('click', function () {
        if (window.currentExtraCell) {
            window.currentExtraCell.textContent = '—';
            updateExtraUserField(window.currentExtraItem, window.currentExtraColumnKey, '—');
            showNotification("".concat(window.currentExtraColumnName, " unassigned"));
        }
        modal.remove();
        clearExtraUserReferences();
    });
    var searchInput = document.getElementById('userSearchInput');
    searchInput.addEventListener('keyup', function () {
        updateUserListInModal(searchInput.value, window.currentExtraValue);
    });
    setTimeout(function () {
        if (searchInput) {
            searchInput.focus();
        }
    }, 100);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
            clearExtraUserReferences();
        }
    });
}
function updateUserListInModal(searchText, currentValue) {
    var userList = document.getElementById('userListContainer');
    if (!userList)
        return;
    var filtered = availableUsers.filter(function (user) {
        var searchLower = searchText.toLowerCase();
        return user.name.toLowerCase().includes(searchLower) ||
            user.initials.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower);
    });
    if (filtered.length === 0) {
        userList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No users found</div>';
        return;
    }
    userList.innerHTML = filtered.map(function (user) {
        var isCurrent = user.initials === currentValue;
        return "\n            <div class=\"user-item\" data-user='".concat(JSON.stringify(user), "' \n                 style=\"display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; ").concat(isCurrent ? 'background-color: #fff0f5;' : '', "\">\n                <span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(user.initials.toLowerCase(), "\" \n                      style=\"width: 32px; height: 32px; line-height: 32px; display: inline-block; border-radius: 50%; color: white; text-align: center; font-weight: bold; background: ").concat(getUserColor(user.initials), ";\">").concat(user.initials, "</span>\n                <div style=\"flex: 1;\">\n                    <div style=\"font-weight: 500;\">").concat(escapeHtml(user.name), "</div>\n                    <div style=\"font-size: 12px; color: #666;\">").concat(escapeHtml(user.email), " \u2022 ").concat(escapeHtml(user.role), "</div>\n                </div>\n                ").concat(isCurrent ? '<span style="color: #ff0080; font-weight: bold;">✓</span>' : '', "\n            </div>\n        ");
    }).join('');
    userList.querySelectorAll('.user-item').forEach(function (el) {
        el.addEventListener('click', function () {
            var userData = el.getAttribute('data-user');
            if (userData) {
                var user = JSON.parse(userData);
                assignExtraUserFromModal(user);
            }
        });
    });
}
function assignExtraUserFromModal(user) {
    if (!window.currentExtraCell || !window.currentExtraItem)
        return;
    var cell = window.currentExtraCell;
    var item = window.currentExtraItem;
    var columnKey = window.currentExtraColumnKey;
    var columnName = window.currentExtraColumnName;
    cell.textContent = user.initials;
    cell.style.backgroundColor = '#e8f5e9';
    setTimeout(function () {
        cell.style.backgroundColor = '';
    }, 500);
    updateExtraUserField(item, columnKey, user.initials);
    var modal = document.getElementById('extraUserSelectionModal');
    if (modal)
        modal.remove();
    showNotification("".concat(columnName, " set to ").concat(user.name));
    clearExtraUserReferences();
}
function updateExtraUserField(item, columnKey, value) {
    if (!item)
        return;
    if (columnKey === 'taskOwner') {
        item.taskOwner = value;
        if ('owner' in item)
            item.owner = value;
    }
    else if (columnKey === 'createdBy') {
        item.createdBy = value;
    }
    else if (columnKey === 'approver') {
        item.approver = value;
    }
    if (item.id) {
        var taskIndex = tasks.findIndex(function (t) { return t.id === item.id; });
        if (taskIndex !== -1) {
            tasks[taskIndex][columnKey] = value;
            if (columnKey === 'taskOwner') {
                tasks[taskIndex].owner = value;
            }
        }
        var subtaskIndex = subtasks.findIndex(function (s) { return s.id === item.id; });
        if (subtaskIndex !== -1) {
            subtasks[subtaskIndex][columnKey] = value;
        }
    }
    setTimeout(function () { return saveAllData(); }, 100);
}
function clearExtraUserReferences() {
    window.currentExtraItem = null;
    window.currentExtraCell = null;
    window.currentExtraColumnKey = null;
    window.currentExtraColumnName = null;
    window.currentExtraValue = null;
}
function makeGenericCellEditable(cell, task, columnKey) {
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    cell.title = "Click to edit ".concat(columnKey);
    cell.addEventListener('mouseenter', function () {
        cell.style.backgroundColor = '#fff0f5';
    });
    cell.addEventListener('mouseleave', function () {
        cell.style.backgroundColor = '';
    });
    cell.addEventListener('click', function (e) {
        var _a;
        e.stopPropagation();
        e.preventDefault();
        var currentValue = ((_a = cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        var newValue = prompt("Enter ".concat(columnKey, ":"), currentValue);
        if (newValue !== null && newValue.trim() !== '') {
            cell.textContent = newValue.trim();
            task[columnKey] = newValue.trim();
            showNotification("".concat(columnKey, " updated to: ").concat(newValue));
            setTimeout(function () { return saveAllData(); }, 100);
        }
    });
}
// ================================
// RECURRENCE FUNCTIONS
// ================================
function makeRecurrenceCellClickable(row, task) {
    var recurrenceCell = row.querySelector('.extra-cell[data-column="recurrenceType"]');
    if (recurrenceCell) {
        recurrenceCell.classList.add('recurrence-cell-clickable');
        recurrenceCell.title = 'Click to change recurrence type';
        recurrenceCell.addEventListener('mouseenter', function () {
            recurrenceCell.classList.add('recurrence-cell-hover');
        });
        recurrenceCell.addEventListener('mouseleave', function () {
            recurrenceCell.classList.remove('recurrence-cell-hover');
        });
        recurrenceCell.addEventListener('click', function (e) {
            var _a;
            e.stopPropagation();
            e.preventDefault();
            showRecurrenceTypeModal(task, recurrenceCell, ((_a = recurrenceCell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || 'None');
        });
    }
}
function showRecurrenceTypeModal(task, cell, currentValue) {
    var _a, _b;
    console.log('Opening recurrence modal for task:', task.name, 'Current value:', currentValue);
    var existingModal = document.getElementById('recurrenceTypeModal');
    if (existingModal) {
        existingModal.remove();
    }
    var modal = document.createElement('div');
    modal.id = 'recurrenceTypeModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = "\n        <div class=\"modal-content\">\n            <span class=\"close\">&times;</span>\n            <h3>Set Recurrence Type</h3>\n            \n            <div class=\"task-info\">\n                <div class=\"task-info-label\">Task:</div>\n                <div class=\"task-info-name\">".concat(escapeHtml(task.name || (((_b = (_a = task.taskNameCell) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) || 'Task')), "</div>\n            </div>\n            \n            <div class=\"current-recurrence-section\">\n                <label class=\"current-recurrence-label\">Current Recurrence</label>\n                <div class=\"current-recurrence-value ").concat(currentValue !== 'None' ? 'recurring' : 'non-recurring', "\">\n                    ").concat(escapeHtml(currentValue || 'None'), "\n                </div>\n            </div>\n            \n            <div class=\"recurrence-select-section\">\n                <label class=\"recurrence-select-label\">Select Recurrence Type</label>\n                <select id=\"recurrenceTypeSelect\">\n                    <optgroup label=\"Recurring Tasks\">\n                        <option value=\"Every Period\" ").concat(currentValue === 'Every Period' ? 'selected' : '', ">Every Period</option>\n                        <option value=\"Quarterly\" ").concat(currentValue === 'Quarterly' ? 'selected' : '', ">Quarterly</option>\n                        <option value=\"Annual\" ").concat(currentValue === 'Annual' ? 'selected' : '', ">Annual</option>\n                    </optgroup>\n                    <optgroup label=\"Non-Recurring Tasks\">\n                        <option value=\"Multiple\" ").concat(currentValue === 'Multiple' ? 'selected' : '', ">Multiple</option>\n                        <option value=\"Custom\" ").concat(currentValue === 'Custom' ? 'selected' : '', ">Custom</option>\n                        <option value=\"None\" ").concat(currentValue === 'None' ? 'selected' : '', ">None</option>\n                    </optgroup>\n                </select>\n            </div>\n            \n            <div class=\"note-section\">\n                <strong>Note:</strong> Recurrence type determines the task's border color:<br>\n                <span class=\"color-indicator gray\"></span> Gray = Recurring (Every Period, Quarterly, Annual)<br>\n                <span class=\"color-indicator blue\"></span> Blue = Non-recurring (None, Multiple, Custom)\n            </div>\n            \n            <div class=\"modal-buttons\">\n                <button class=\"btn-cancel\">Cancel</button>\n                <button class=\"btn-save\">Save</button>\n            </div>\n        </div>\n    ");
    document.body.appendChild(modal);
    window.currentRecurrenceTask = task;
    window.currentRecurrenceCell = cell;
    var closeBtn = modal.querySelector('.close');
    var cancelBtn = modal.querySelector('.btn-cancel');
    var saveBtn = modal.querySelector('.btn-save');
    var select = document.getElementById('recurrenceTypeSelect');
    var closeModal = function () {
        modal.remove();
    };
    var saveRecurrenceType = function () {
        var newValue = select.value;
        console.log('Saving new recurrence value:', newValue);
        if (window.currentRecurrenceCell) {
            window.currentRecurrenceCell.textContent = newValue;
            if (window.currentRecurrenceTask) {
                var task_2 = window.currentRecurrenceTask;
                task_2.recurrenceType = newValue;
                var row = task_2.row;
                if (row) {
                    var recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
                    row.classList.remove('recurring-task', 'non-recurring-task');
                    if (recurringOptions.includes(newValue)) {
                        row.classList.add('recurring-task');
                    }
                    else {
                        row.classList.add('non-recurring-task');
                    }
                    row.setAttribute('data-recurrence-type', newValue);
                }
            }
            setTimeout(function () { return saveAllData(); }, 100);
            showNotification("Recurrence type set to: ".concat(newValue));
        }
        closeModal();
    };
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', saveRecurrenceType);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    setTimeout(function () {
        if (select)
            select.focus();
    }, 100);
}
function updateRecurrenceClasses() {
    tasks.forEach(function (task) {
        if (task.row) {
            var recurrenceType = task.recurrenceType || 'None';
            var recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
            var isRecurring = recurringOptions.includes(recurrenceType);
            task.row.classList.remove('recurring-task', 'non-recurring-task');
            if (isRecurring) {
                task.row.classList.add('recurring-task');
            }
            else {
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
function updateCommentColumn() {
    console.log('Updating comment column...');
    tasks.forEach(function (task) {
        if (task.row) {
            updateCommentCellForRow(task.row, task, 'task');
        }
    });
    subtasks.forEach(function (subtask) {
        if (subtask.row) {
            updateCommentCellForRow(subtask.row, subtask, 'subtask');
        }
    });
}
function updateCommentCellForRow(row, item, type) {
    if (!row)
        return;
    var commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    commentCells.forEach(function (cell) {
        cell.innerHTML = '';
        cell.classList.add('comment-cell');
        var rowId = type === 'task' ?
            (row.dataset.taskId || item.id) :
            (row.dataset.subtaskId || item.id);
        if (!rowId) {
            rowId = type === 'task' ?
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) :
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            if (type === 'task') {
                row.dataset.taskId = rowId;
                if (item)
                    item.id = rowId;
            }
            else {
                row.dataset.subtaskId = rowId;
                if (item)
                    item.id = rowId;
            }
        }
        var finalRowId = rowId;
        var commentKey = getCommentKey(finalRowId, type);
        var comments = taskComments[commentKey] || [];
        var count = comments.length;
        var iconContainer = document.createElement('div');
        iconContainer.classList.add('comment-icon-container');
        var icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = count > 0 ? "".concat(count, " comment").concat(count > 1 ? 's' : '') : 'Add comment';
        if (count === 0) {
            icon.classList.add('comment-icon-empty');
        }
        iconContainer.appendChild(icon);
        if (count > 0) {
            iconContainer.classList.add('has-comments');
            var badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            badge.textContent = count.toString();
            iconContainer.appendChild(badge);
        }
        cell.appendChild(iconContainer);
        iconContainer.addEventListener('mouseenter', function () {
            icon.classList.add('comment-icon-hover');
            if (count === 0) {
                icon.classList.add('comment-icon-empty-hover');
            }
        });
        iconContainer.addEventListener('mouseleave', function () {
            icon.classList.remove('comment-icon-hover');
            icon.classList.remove('comment-icon-empty-hover');
        });
        iconContainer.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            openCommentPanel(finalRowId, type);
        });
    });
}
function createCommentPanel() {
    var panel = document.getElementById('commentPanel');
    if (panel)
        return panel;
    panel = document.createElement('div');
    panel.id = 'commentPanel';
    panel.className = 'comment-panel';
    panel.innerHTML = "\n        <div class=\"comment-panel-header\">\n            <span>Comments</span>\n            <button class=\"close-panel\">&times;</button>\n        </div>\n        <div class=\"comment-list\"></div>\n        <div class=\"comment-input-area\">\n            <textarea placeholder=\"Add a comment...\" rows=\"2\"></textarea>\n            <button class=\"add-comment-btn\">Post</button>\n        </div>\n    ";
    document.body.appendChild(panel);
    var closeBtn = panel.querySelector('.close-panel');
    closeBtn.addEventListener('click', function () {
        panel.classList.remove('open');
        activeCommentRowId = null;
        activeCommentType = null;
        cancelEdit();
    });
    var postBtn = panel.querySelector('.add-comment-btn');
    var textarea = panel.querySelector('textarea');
    postBtn.addEventListener('click', function () {
        if (!activeCommentRowId || !activeCommentType) {
            alert('No active task selected');
            return;
        }
        var text = textarea.value.trim();
        if (!text) {
            alert('Please enter a comment');
            return;
        }
        var commentKey = getCommentKey(activeCommentRowId, activeCommentType);
        if (editingCommentId) {
            updateComment(commentKey, editingCommentId, text);
        }
        else {
            var comments = taskComments[commentKey] || [];
            var now = new Date();
            var newComment = {
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
        setTimeout(function () { return saveAllData(); }, 100);
    });
    textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            postBtn.click();
        }
        else if (e.key === 'Escape' && editingCommentId) {
            cancelEdit();
            if (activeCommentRowId && activeCommentType) {
                renderComments(getCommentKey(activeCommentRowId, activeCommentType));
            }
        }
    });
    return panel;
}
function openCommentPanel(rowId, type) {
    console.log('Opening comment panel for:', type, rowId);
    var panel = createCommentPanel();
    activeCommentRowId = rowId;
    activeCommentType = type;
    var commentKey = getCommentKey(rowId, type);
    cancelEdit();
    renderComments(commentKey);
    panel.classList.add('open');
    setTimeout(function () {
        var textarea = panel.querySelector('textarea');
        if (textarea)
            textarea.focus();
    }, 300);
}
function renderComments(commentKey) {
    var panel = document.getElementById('commentPanel');
    if (!panel)
        return;
    var list = panel.querySelector('.comment-list');
    if (!list)
        return;
    var comments = taskComments[commentKey] || [];
    console.log('Rendering comments for key:', commentKey, 'Count:', comments.length);
    if (comments.length === 0) {
        list.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        return;
    }
    var sortedComments = __spreadArray([], comments, true).sort(function (a, b) {
        var dateA = new Date(a.timestamp).getTime();
        var dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
    });
    list.innerHTML = sortedComments.map(function (c) {
        var timestamp = new Date(c.timestamp);
        var formattedDate = formatCommentDate(timestamp);
        var formattedTime = formatCommentTime(timestamp);
        var isEditing = c.id === editingCommentId;
        return "\n            <div class=\"comment-item ".concat(isEditing ? 'editing' : '', "\" data-comment-id=\"").concat(c.id, "\">\n                <div class=\"comment-header\">\n                    <span class=\"comment-author\" style=\"background: ").concat(getUserColor(c.author), "\">").concat(escapeHtml(c.author), "</span>\n                    <div class=\"comment-meta\">\n                        <span class=\"comment-author-name\">").concat(escapeHtml(getAuthorFullName(c.author)), "</span>\n                        <div class=\"comment-datetime\">\n                            <span class=\"comment-date\">").concat(escapeHtml(formattedDate), "</span>\n                            <span class=\"comment-time\">").concat(escapeHtml(formattedTime), "</span>\n                        </div>\n                    </div>\n                    ").concat(c.edited ? '<span class="edited-badge">(edited)</span>' : '', "\n                </div>\n                <div class=\"comment-text\">").concat(escapeHtml(c.text), "</div>\n                <div class=\"comment-actions\">\n                    <button class=\"edit-comment-btn\" data-comment-id=\"").concat(c.id, "\">Edit</button>\n                    <button class=\"delete-comment-btn\" data-comment-id=\"").concat(c.id, "\">Delete</button>\n                </div>\n            </div>\n        ");
    }).join('');
    attachCommentEventListeners(list, commentKey);
}
function attachCommentEventListeners(list, commentKey) {
    if (!list)
        return;
    var editButtons = list.querySelectorAll('.edit-comment-btn');
    var deleteButtons = list.querySelectorAll('.delete-comment-btn');
    editButtons.forEach(function (btn) {
        var _a;
        var newBtn = btn.cloneNode(true);
        (_a = btn.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var commentId = newBtn.getAttribute('data-comment-id');
            if (commentId) {
                startEditComment(commentKey, commentId);
            }
        });
    });
    deleteButtons.forEach(function (btn) {
        var _a;
        var newBtn = btn.cloneNode(true);
        (_a = btn.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var commentId = newBtn.getAttribute('data-comment-id');
            if (commentId) {
                deleteComment(commentKey, commentId);
            }
        });
    });
}
function startEditComment(commentKey, commentId) {
    console.log('Starting edit for comment:', commentId);
    var comments = taskComments[commentKey] || [];
    var comment = comments.find(function (c) { return c.id === commentId; });
    if (!comment) {
        console.error('Comment not found:', commentId);
        return;
    }
    editingCommentId = commentId;
    var panel = document.getElementById('commentPanel');
    if (panel) {
        var textarea = panel.querySelector('textarea');
        var postBtn = panel.querySelector('.add-comment-btn');
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
    if (!confirm('Are you sure you want to delete this comment?'))
        return;
    var comments = taskComments[commentKey] || [];
    var filtered = comments.filter(function (c) { return c.id !== commentId; });
    if (filtered.length === 0) {
        delete taskComments[commentKey];
    }
    else {
        taskComments[commentKey] = filtered;
    }
    if (editingCommentId === commentId) {
        cancelEdit();
    }
    renderComments(commentKey);
    var parts = commentKey.split('_');
    if (parts.length >= 2) {
        var type = parts[0];
        var rowId = parts.slice(1).join('_');
        updateCommentIcon(rowId, type);
    }
    setTimeout(function () { return saveAllData(); }, 100);
    showNotification('Comment deleted successfully');
}
function updateComment(commentKey, commentId, newText) {
    var comments = taskComments[commentKey] || [];
    var comment = comments.find(function (c) { return c.id === commentId; });
    if (!comment)
        return;
    comment.text = newText;
    comment.edited = true;
    comment.timestamp = new Date().toISOString();
    taskComments[commentKey] = comments;
    editingCommentId = null;
    var panel = document.getElementById('commentPanel');
    if (panel) {
        var textarea = panel.querySelector('textarea');
        var postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
    renderComments(commentKey);
}
function cancelEdit() {
    editingCommentId = null;
    var panel = document.getElementById('commentPanel');
    if (panel) {
        var textarea = panel.querySelector('textarea');
        var postBtn = panel.querySelector('.add-comment-btn');
        if (textarea && postBtn) {
            textarea.value = '';
            textarea.placeholder = 'Add a comment...';
            textarea.removeAttribute('data-editing');
            postBtn.textContent = 'Post';
        }
    }
}
function updateCommentIcon(rowId, type) {
    var commentKey = getCommentKey(rowId, type);
    var comments = taskComments[commentKey] || [];
    var count = comments.length;
    var selector = '';
    if (type === 'task') {
        selector = "tr[data-task-id=\"".concat(rowId, "\"] .extra-cell[data-column=\"comment\"]");
    }
    else {
        selector = "tr[data-subtask-id=\"".concat(rowId, "\"] .extra-cell[data-column=\"comment\"]");
    }
    var commentCell = document.querySelector(selector);
    if (commentCell) {
        var row_1 = commentCell.closest('tr');
        if (row_1) {
            if (type === 'task') {
                var task = tasks.find(function (t) { return t.row === row_1; });
                if (task)
                    updateCommentCellForRow(row_1, task, 'task');
            }
            else {
                var subtask = subtasks.find(function (s) { return s.row === row_1; });
                if (subtask)
                    updateCommentCellForRow(row_1, subtask, 'subtask');
            }
        }
    }
}
function formatCommentDate(date) {
    try {
        if (!date || isNaN(date.getTime())) {
            return 'Invalid date';
        }
        var commentDate = new Date(date);
        var today = new Date();
        var yesterday = new Date(today);
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
            var options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            };
            return commentDate.toLocaleDateString('en-US', options);
        }
    }
    catch (e) {
        console.error('Error formatting date:', e);
        return String(date);
    }
}
function formatCommentTime(date) {
    try {
        var options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleTimeString('en-US', options);
    }
    catch (e) {
        console.error('Error formatting time:', e);
        return '';
    }
}
// ================================
// DOCUMENT FUNCTIONS
// ================================
function updateCDocColumn() {
    console.log('Updating CDoc column with Font Awesome icons...');
    tasks.forEach(function (task) {
        if (!task.row)
            return;
        var cdocCell = task.row.cells[7];
        if (!cdocCell)
            return;
        cdocCell.innerHTML = '';
        cdocCell.classList.add('cdoc-cell');
        var docs = taskDocuments.get(task.row) || [];
        console.log("Task ".concat(task.id, " has ").concat(docs.length, " CDoc documents"));
        var iconContainer = createCDocIcon(docs, task.row);
        cdocCell.appendChild(iconContainer);
    });
    subtasks.forEach(function (subtask) {
        if (!subtask.row)
            return;
        var cdocCell = subtask.row.cells[7];
        if (!cdocCell)
            return;
        cdocCell.innerHTML = '';
        cdocCell.classList.add('cdoc-cell');
        var docs = taskDocuments.get(subtask.row) || [];
        console.log("Subtask ".concat(subtask.id, " has ").concat(docs.length, " CDoc documents"));
        var iconContainer = createCDocIcon(docs, subtask.row);
        cdocCell.appendChild(iconContainer);
    });
}
function createCDocIcon(docs, row) {
    var iconContainer = document.createElement('span');
    iconContainer.className = 'cdoc-icon-container';
    var icon = document.createElement('i');
    icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
    if (docs.length === 0) {
        icon.title = 'Click to upload documents';
    }
    else {
        icon.title = "".concat(docs.length, " document(s) attached");
    }
    iconContainer.appendChild(icon);
    if (docs.length > 0) {
        var badge = document.createElement('span');
        badge.className = 'cdoc-badge';
        badge.textContent = docs.length.toString();
        iconContainer.appendChild(badge);
    }
    else {
        var plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle cdoc-plus-icon';
        iconContainer.appendChild(plusIcon);
    }
    iconContainer.onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        showDocumentManager(row);
    };
    return iconContainer;
}
function updateTDocColumn() {
    console.log('Updating TDoc column with Font Awesome icons...');
    tasks.forEach(function (task) {
        if (!task.row)
            return;
        var tdocCell = task.row.cells[2];
        if (!tdocCell)
            return;
        tdocCell.innerHTML = '';
        var docs = taskTDocDocuments.get(task.row) || [];
        var iconContainer = createTDocIcon(task.row, docs);
        tdocCell.appendChild(iconContainer);
    });
    subtasks.forEach(function (subtask) {
        if (!subtask.row)
            return;
        var tdocCell = subtask.row.cells[2];
        if (!tdocCell)
            return;
        tdocCell.innerHTML = '';
        var docs = taskTDocDocuments.get(subtask.row) || [];
        var iconContainer = createTDocIcon(subtask.row, docs);
        tdocCell.appendChild(iconContainer);
    });
}
function createTDocIcon(row, docs) {
    var iconContainer = document.createElement('span');
    iconContainer.className = 'tdoc-icon-container';
    if (docs.length > 0) {
        iconContainer.classList.add('has-docs');
    }
    var icon = document.createElement('i');
    icon.className = 'fas fa-file-alt';
    icon.title = docs.length > 0 ? "".concat(docs.length, " document(s) attached") : 'Click to upload documents';
    iconContainer.appendChild(icon);
    if (docs.length > 0) {
        var badge = document.createElement('span');
        badge.className = 'tdoc-badge';
        badge.textContent = docs.length.toString();
        iconContainer.appendChild(badge);
    }
    else {
        var plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle tdoc-plus-icon';
        iconContainer.appendChild(plusIcon);
    }
    iconContainer.onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('TDoc icon clicked');
        showTDocDocumentManager(row);
    };
    return iconContainer;
}
function showDocumentManager(taskRow) {
    var docs = taskDocuments.get(taskRow) || [];
    var modal = document.getElementById('documentManagerModal');
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
    var modal = document.createElement('div');
    modal.id = 'documentManagerModal';
    modal.className = 'modal';
    modal.innerHTML = "\n        <div class=\"modal-content\" style=\"width: 800px; max-width: 95%; max-height: 80vh; overflow-y: auto;\">\n            <span class=\"close\">&times;</span>\n            <h3 style=\"color: #ff0080; margin-bottom: 20px;\">\uD83D\uDCC4 CDoc Document Manager</h3>\n            \n            <div style=\"margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px;\">\n                <h4 style=\"margin-bottom: 15px; color: #333;\">Upload New Documents</h4>\n                \n                <div id=\"dropArea\" style=\"border: 2px dashed #ddd; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;\">\n                    <div style=\"font-size: 32px; margin-bottom: 5px;\"><i class=\"fa-solid fa-folder-open\"></i></div>\n                    <div style=\"color: #666; margin-bottom: 5px;\">Drag files here or</div>\n                    <button id=\"browseFileBtn\" style=\"background: #ff0080; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;\">Browse</button>\n                    <input type=\"file\" id=\"fileInput\" style=\"display: none;\" multiple>\n                </div>\n                \n                <div id=\"selectedFilesList\" style=\"max-height: 150px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; padding: 10px; background: white; margin-bottom: 10px; display: none;\">\n                    <div style=\"font-weight: 500; margin-bottom: 8px; color: #666;\">Selected Files:</div>\n                    <div id=\"filesContainer\"></div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end;\">\n                    <button id=\"uploadSelectedBtn\" style=\"padding: 6px 16px; background: #00cfff; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;\">Upload Files</button>\n                </div>\n            </div>\n            \n            <div>\n                <h4 style=\"margin-bottom: 15px; color: #333;\">Attached Documents (<span id=\"docCount\">0</span>)</h4>\n                <div id=\"documentsListContainer\" style=\"max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px;\"></div>\n            </div>\n            \n            <div style=\"display: flex; justify-content: flex-end; margin-top: 20px;\">\n                <button id=\"closeManagerBtn\" style=\"padding: 8px 20px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Close</button>\n            </div>\n        </div>\n    ";
    return modal;
}
function updateDocumentsUI(docs, taskRow) {
    var listContainer = document.getElementById('documentsListContainer');
    var countSpan = document.getElementById('docCount');
    if (listContainer) {
        listContainer.innerHTML = renderDocumentsList(docs, taskRow);
        attachDocumentEventListeners(taskRow);
    }
    if (countSpan) {
        countSpan.textContent = docs.length.toString();
    }
}
function setupBaseEventListeners(modal, taskRow) {
    var closeModal = function () { modal.style.display = 'none'; };
    var closeBtn = modal.querySelector('.close');
    if (closeBtn)
        closeBtn.addEventListener('click', closeModal);
    var closeManagerBtn = document.getElementById('closeManagerBtn');
    if (closeManagerBtn)
        closeManagerBtn.addEventListener('click', closeModal);
    setupUploadHandlers(modal, taskRow);
}
function setupUploadHandlers(modal, taskRow) {
    var dropArea = document.getElementById('dropArea');
    var fileInput = document.getElementById('fileInput');
    var filesContainer = document.getElementById('filesContainer');
    var selectedFilesList = document.getElementById('selectedFilesList');
    var uploadBtn = document.getElementById('uploadSelectedBtn');
    var browseBtn = document.getElementById('browseFileBtn');
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn)
        return;
    var selectedFiles = [];
    browseBtn.addEventListener('click', function () {
        fileInput.click();
    });
    fileInput.addEventListener('change', function (e) {
        var files = Array.from(e.target.files || []);
        selectedFiles = __spreadArray(__spreadArray([], selectedFiles, true), files, true);
        updateSelectedFilesList();
    });
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropArea.style.borderColor = '#ff0080';
        dropArea.style.backgroundColor = '#fff0f5';
    });
    dropArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
    });
    dropArea.addEventListener('drop', function (e) {
        var _a;
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
        var files = Array.from(((_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) || []);
        selectedFiles = __spreadArray(__spreadArray([], selectedFiles, true), files, true);
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
        filesContainer.innerHTML = selectedFiles.map(function (file, index) { return "\n            <div style=\"display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;\">\n                <span>\uD83D\uDCC4 ".concat(escapeHtml(file.name), " (").concat((file.size / 1024).toFixed(1), " KB)</span>\n                <button class=\"remove-file\" data-index=\"").concat(index, "\" style=\"background:none; border:none; color:#dc3545; cursor:pointer;\">\u2715</button>\n            </div>\n        "); }).join('');
        filesContainer.querySelectorAll('.remove-file').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var index = parseInt(e.target.getAttribute('data-index') || '0');
                selectedFiles.splice(index, 1);
                updateSelectedFilesList();
                fileInput.value = '';
            });
        });
    }
    uploadBtn.addEventListener('click', function () {
        var _a;
        if (selectedFiles.length === 0) {
            alert('Please select files to upload');
            return;
        }
        var currentTaskRow = window.currentTaskRow || taskRow;
        if (!currentTaskRow) {
            alert('Error: Task not found');
            return;
        }
        var taskId = currentTaskRow.dataset.taskId || currentTaskRow.dataset.subtaskId;
        if (!taskId) {
            console.error('No ID found for row, generating one...');
            var newId = currentTaskRow.classList.contains('task-row') ?
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) :
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            if (currentTaskRow.classList.contains('task-row')) {
                currentTaskRow.dataset.taskId = newId;
                var task = tasks.find(function (t) { return t.row === currentTaskRow; });
                if (task)
                    task.id = newId;
            }
            else {
                currentTaskRow.dataset.subtaskId = newId;
                var subtask = subtasks.find(function (s) { return s.row === currentTaskRow; });
                if (subtask)
                    subtask.id = newId;
            }
        }
        var docs = selectedFiles.map(function (file) { return ({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date()
        }); });
        console.log('Uploading CDoc documents:', docs.length, 'to row:', currentTaskRow, 'ID:', taskId);
        var existingDocs = taskDocuments.get(currentTaskRow) || [];
        var updatedDocs = __spreadArray(__spreadArray([], existingDocs, true), docs, true);
        taskDocuments.set(currentTaskRow, updatedDocs);
        if (taskId) {
            taskDocuments.set(taskId, updatedDocs);
        }
        console.log('CDoc Map now has:', (_a = taskDocuments.get(currentTaskRow)) === null || _a === void 0 ? void 0 : _a.length, 'docs');
        updateCDocColumn();
        selectedFiles = [];
        updateSelectedFilesList();
        fileInput.value = '';
        var listContainer = document.getElementById('documentsListContainer');
        if (listContainer) {
            listContainer.innerHTML = renderDocumentsList(updatedDocs, currentTaskRow);
            attachDocumentEventListeners(currentTaskRow);
        }
        var countSpan = document.getElementById('docCount');
        if (countSpan)
            countSpan.textContent = updatedDocs.length.toString();
        showNotification("".concat(docs.length, " file(s) uploaded successfully"));
        console.log('Auto-saving after CDoc upload...');
        saveAllData();
    });
}
function renderDocumentsList(docs, taskRow) {
    if (docs.length === 0) {
        return "\n            <div class=\"tdoc-empty-state\">\n                <div class=\"tdoc-empty-icon\">\uD83D\uDCC4</div>\n                <div>No documents attached</div>\n                <div class=\"tdoc-empty-subtext\">Click upload area above to add documents</div>\n            </div>\n        ";
    }
    return "\n        <table class=\"tdoc-table\">\n            <thead>\n                <tr>\n                    <th>File Name</th>\n                    <th>Size</th>\n                    <th>Upload Date</th>\n                    <th style=\"text-align: center;\">Actions</th>\n                </tr>\n            </thead>\n            <tbody>\n                ".concat(docs.map(function (doc, index) {
        var date = new Date(doc.uploadDate);
        return "\n                        <tr data-doc-index=\"".concat(index, "\">\n                            <td>\n                                <div class=\"tdoc-file-info\">\n                                    <span style=\"font-size: 20px;\">\uD83D\uDCC4</span>\n                                    <span class=\"tdoc-file-name\">").concat(escapeHtml(doc.name), "</span>\n                                </div>\n                            </td>\n                            <td>").concat((doc.size / 1024).toFixed(1), " KB</td>\n                            <td>\n                                ").concat(date.toLocaleDateString(), " \n                                <span class=\"tdoc-timestamp\">").concat(date.toLocaleTimeString(), "</span>\n                            </td>\n                            <td style=\"text-align: center;\">\n                                <button class=\"view-doc-btn tdoc-action-btn btn-view\" \n                                        data-index=\"").concat(index, "\" \n                                        title=\"View File\">\uD83D\uDC41\uFE0F</button>\n                                <button class=\"delete-doc-btn tdoc-action-btn btn-delete\" \n                                        data-index=\"").concat(index, "\" \n                                        title=\"Delete File\">\uD83D\uDDD1</button>\n                            </td>\n                        </tr>\n                    ");
    }).join(''), "\n            </tbody>\n        </table>\n    ");
}
function attachDocumentEventListeners(taskRow) {
    document.querySelectorAll('.view-doc-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var index = parseInt(e.target.getAttribute('data-index') || '0');
            var docs = taskDocuments.get(taskRow) || [];
            if (docs[index]) {
                previewDocument(docs[index]);
            }
        });
    });
    document.querySelectorAll('.delete-doc-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var index = parseInt(e.target.getAttribute('data-index') || '0');
            showDeleteConfirmation(taskRow, index);
        });
    });
}
function showDeleteConfirmation(taskRow, index) {
    var docs = taskDocuments.get(taskRow) || [];
    var doc = docs[index];
    if (!doc)
        return;
    if (confirm("Are you sure you want to delete \"".concat(doc.name, "\"?"))) {
        deleteDocument(taskRow, index);
    }
}
function deleteDocument(taskRow, index) {
    var docs = taskDocuments.get(taskRow) || [];
    if (index >= 0 && index < docs.length) {
        var docName = docs[index].name;
        docs.splice(index, 1);
        if (docs.length === 0) {
            taskDocuments.delete(taskRow);
        }
        else {
            taskDocuments.set(taskRow, docs);
        }
        updateCDocColumn();
        var managerModal = document.getElementById('documentManagerModal');
        if (managerModal && managerModal.style.display === 'block') {
            var listContainer = document.getElementById('documentsListContainer');
            if (listContainer) {
                listContainer.innerHTML = renderDocumentsList(docs, taskRow);
                attachDocumentEventListeners(taskRow);
            }
            var header = managerModal.querySelector('h4');
            if (header)
                header.innerHTML = "Attached Documents (".concat(docs.length, ")");
        }
        showNotification("Document \"".concat(docName, "\" deleted successfully"));
    }
}
function showTDocDocumentManager(taskRow) {
    var docs = taskTDocDocuments.get(taskRow) || [];
    var modal = document.getElementById('tdocDocumentManagerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tdocDocumentManagerModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 800px; max-width: 95%; max-height: 80vh; overflow-y: auto;\">\n                <span class=\"close\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-bottom: 20px;\">\uD83D\uDCC4 TDoc Document Manager</h3>\n                \n                <div style=\"margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px;\">\n                    <h4 style=\"margin-bottom: 15px; color: #333;\">Upload New Documents</h4>\n                    \n                    <div id=\"tdocDropArea\" style=\"border: 2px dashed #ddd; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;\">\n                        <div style=\"font-size: 32px; margin-bottom: 5px;\"><i class=\"fa-solid fa-folder-open\"></i></div>\n                        <div style=\"color: #666; margin-bottom: 5px;\">Drag files here or</div>\n                        <button id=\"tdocBrowseFileBtn\" style=\"background: #ff0080; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;\">Browse</button>\n                        <input type=\"file\" id=\"tdocFileInput\" style=\"display: none;\" multiple>\n                    </div>\n                    \n                    <div id=\"tdocSelectedFilesList\" style=\"max-height: 150px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; padding: 10px; background: white; margin-bottom: 10px; display: none;\">\n                        <div style=\"font-weight: 500; margin-bottom: 8px; color: #666;\">Selected Files:</div>\n                        <div id=\"tdocFilesContainer\"></div>\n                    </div>\n                    \n                    <div style=\"display: flex; justify-content: flex-end;\">\n                        <button id=\"tdocUploadSelectedBtn\" style=\"padding: 6px 16px; background: #00cfff; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;\">Upload Files</button>\n                    </div>\n                </div>\n                \n                <div>\n                    <h4 style=\"margin-bottom: 15px; color: #333;\">Attached Documents (<span id=\"tdocDocCount\">".concat(docs.length, "</span>)</h4>\n                    <div id=\"tdocDocumentsListContainer\" style=\"max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px;\"></div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; margin-top: 20px;\">\n                    <button id=\"tdocCloseManagerBtn\" style=\"padding: 8px 20px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Close</button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(modal);
        var closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });
        var closeManagerBtn = document.getElementById('tdocCloseManagerBtn');
        closeManagerBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });
    }
    modal.setAttribute('data-current-task-row', taskRow.id || Math.random().toString(36));
    window.currentTDocTaskRow = taskRow;
    var listContainer = document.getElementById('tdocDocumentsListContainer');
    if (listContainer) {
        listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
        attachTDocDocumentEventListeners(taskRow);
    }
    var countSpan = document.getElementById('tdocDocCount');
    if (countSpan)
        countSpan.textContent = docs.length.toString();
    setupTDocUploadHandlers(modal, taskRow);
    modal.style.display = 'block';
}
function renderTDocDocumentsList(docs, taskRow) {
    if (docs.length === 0) {
        return "\n            <div class=\"tdoc-empty-state\">\n                <div class=\"tdoc-empty-icon\">\uD83D\uDCC4</div>\n                <div>No documents attached</div>\n                <div style=\"font-size: 13px; font-style: italic; margin-top: 5px;\">\n                    Click upload area above to add documents\n                </div>\n            </div>\n        ";
    }
    return "\n        <table class=\"tdoc-table\">\n            <thead>\n                <tr>\n                    <th>Name</th>\n                    <th>Size</th>\n                    <th>Upload Date</th>\n                    <th style=\"text-align: center;\">Actions</th>\n                </tr>\n            </thead>\n            <tbody>\n                ".concat(docs.map(function (doc, index) {
        var fileSize = (doc.size / 1024).toFixed(1);
        var dateStr = doc.uploadDate.toLocaleDateString();
        var timeStr = doc.uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return "\n                        <tr data-tdoc-doc-index=\"".concat(index, "\">\n                            <td>\n                                <div style=\"display: flex; align-items: center; gap: 10px;\">\n                                    <span style=\"font-size: 20px;\">\uD83D\uDCC4</span>\n                                    <span style=\"font-weight: 500;\">").concat(escapeHtml(doc.name), "</span>\n                                </div>\n                            </td>\n                            <td>").concat(fileSize, " KB</td>\n                            <td>\n                                ").concat(dateStr, " \n                                <span style=\"color: #999; font-size: 11px;\">").concat(timeStr, "</span>\n                            </td>\n                            <td style=\"text-align: center;\">\n                                <button class=\"tdoc-action-btn tdoc-view-btn tdoc-view-doc-btn\" \n                                        data-index=\"").concat(index, "\" title=\"View\">\uD83D\uDC41\uFE0F</button>\n                                <button class=\"tdoc-action-btn tdoc-delete-btn tdoc-delete-doc-btn\" \n                                        data-index=\"").concat(index, "\" title=\"Delete\">\uD83D\uDDD1</button>\n                            </td>\n                        </tr>\n                    ");
    }).join(''), "\n            </tbody>\n        </table>\n    ");
}
function attachTDocDocumentEventListeners(taskRow) {
    document.querySelectorAll('.tdoc-view-doc-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var index = parseInt(e.target.getAttribute('data-index') || '0');
            var docs = taskTDocDocuments.get(taskRow) || [];
            if (docs[index])
                previewDocument(docs[index]);
        });
    });
    document.querySelectorAll('.tdoc-delete-doc-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var index = parseInt(e.target.getAttribute('data-index') || '0');
            showTDocDeleteConfirmation(taskRow, index);
        });
    });
}
function showTDocDeleteConfirmation(taskRow, index) {
    var docs = taskTDocDocuments.get(taskRow) || [];
    var doc = docs[index];
    if (!doc)
        return;
    if (confirm("Are you sure you want to delete \"".concat(doc.name, "\"?"))) {
        deleteTDocDocument(taskRow, index);
    }
}
function deleteTDocDocument(taskRow, index) {
    var docs = taskTDocDocuments.get(taskRow) || [];
    if (index >= 0 && index < docs.length) {
        var docName = docs[index].name;
        docs.splice(index, 1);
        if (docs.length === 0) {
            taskTDocDocuments.delete(taskRow);
        }
        else {
            taskTDocDocuments.set(taskRow, docs);
        }
        updateTDocColumn();
        var managerModal = document.getElementById('tdocDocumentManagerModal');
        if (managerModal && managerModal.style.display === 'block') {
            var listContainer = document.getElementById('tdocDocumentsListContainer');
            if (listContainer) {
                listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
                attachTDocDocumentEventListeners(taskRow);
            }
            var header = managerModal.querySelector('h4');
            if (header)
                header.innerHTML = "Attached Documents (".concat(docs.length, ")");
        }
        showNotification("Document \"".concat(docName, "\" deleted successfully"));
    }
}
function setupTDocUploadHandlers(modal, taskRow) {
    var dropArea = document.getElementById('tdocDropArea');
    var fileInput = document.getElementById('tdocFileInput');
    var filesContainer = document.getElementById('tdocFilesContainer');
    var selectedFilesList = document.getElementById('tdocSelectedFilesList');
    var uploadBtn = document.getElementById('tdocUploadSelectedBtn');
    var browseBtn = document.getElementById('tdocBrowseFileBtn');
    if (!dropArea || !fileInput || !filesContainer || !selectedFilesList || !uploadBtn || !browseBtn)
        return;
    var selectedFiles = [];
    browseBtn.addEventListener('click', function () { return fileInput.click(); });
    fileInput.addEventListener('change', function (e) {
        var files = Array.from(e.target.files || []);
        selectedFiles = __spreadArray(__spreadArray([], selectedFiles, true), files, true);
        updateSelectedFilesList();
    });
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropArea.style.borderColor = '#ff0080';
        dropArea.style.backgroundColor = '#fff0f5';
    });
    dropArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
    });
    dropArea.addEventListener('drop', function (e) {
        var _a;
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = 'transparent';
        var files = Array.from(((_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) || []);
        selectedFiles = __spreadArray(__spreadArray([], selectedFiles, true), files, true);
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
        filesContainer.innerHTML = selectedFiles.map(function (file, index) { return "\n            <div style=\"display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;\">\n                <span>\uD83D\uDCC4 ".concat(escapeHtml(file.name), " (").concat((file.size / 1024).toFixed(1), " KB)</span>\n                <button class=\"remove-file\" data-index=\"").concat(index, "\" style=\"background:none; border:none; color:#dc3545; cursor:pointer;\">\u2715</button>\n            </div>\n        "); }).join('');
        filesContainer.querySelectorAll('.remove-file').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var index = parseInt(e.target.getAttribute('data-index') || '0');
                selectedFiles.splice(index, 1);
                updateSelectedFilesList();
                fileInput.value = '';
            });
        });
    }
    uploadBtn.addEventListener('click', function () {
        if (selectedFiles.length === 0) {
            alert('Please select files to upload');
            return;
        }
        var currentTaskRow = window.currentTDocTaskRow || taskRow;
        if (!currentTaskRow) {
            alert('Error: Task not found');
            return;
        }
        var taskId = currentTaskRow.dataset.taskId || currentTaskRow.dataset.subtaskId;
        if (!taskId) {
            var newId = currentTaskRow.classList.contains('task-row') ?
                'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) :
                'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            if (currentTaskRow.classList.contains('task-row')) {
                currentTaskRow.dataset.taskId = newId;
                var task = tasks.find(function (t) { return t.row === currentTaskRow; });
                if (task)
                    task.id = newId;
            }
            else {
                currentTaskRow.dataset.subtaskId = newId;
                var subtask = subtasks.find(function (s) { return s.row === currentTaskRow; });
                if (subtask)
                    subtask.id = newId;
            }
        }
        var docs = selectedFiles.map(function (file) { return ({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date()
        }); });
        console.log('Uploading TDoc documents:', docs.length, 'to row:', currentTaskRow);
        var existingDocs = taskTDocDocuments.get(currentTaskRow) || [];
        taskTDocDocuments.set(currentTaskRow, __spreadArray(__spreadArray([], existingDocs, true), docs, true));
        updateTDocColumn();
        selectedFiles = [];
        updateSelectedFilesList();
        fileInput.value = '';
        var listContainer = document.getElementById('tdocDocumentsListContainer');
        if (listContainer) {
            listContainer.innerHTML = renderTDocDocumentsList(taskTDocDocuments.get(currentTaskRow) || [], currentTaskRow);
            attachTDocDocumentEventListeners(currentTaskRow);
        }
        var countSpan = document.getElementById('tdocDocCount');
        if (countSpan)
            countSpan.textContent = (taskTDocDocuments.get(currentTaskRow) || []).length.toString();
        showNotification("".concat(docs.length, " file(s) uploaded successfully"));
        setTimeout(function () {
            console.log('Auto-saving after TDoc upload...');
            saveAllData();
        }, 100);
    });
}
function previewDocument(doc) {
    var previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (!previewWindow)
        return;
    var html = "\n        <!DOCTYPE html>\n        <html>\n        <head>\n            <title>".concat(escapeHtml(doc.name), "</title>\n            <style>\n                body {\n                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n                    margin: 0;\n                    padding: 20px;\n                    background: #f5f5f5;\n                }\n                .container {\n                    max-width: 600px;\n                    margin: 0 auto;\n                    background: white;\n                    border-radius: 12px;\n                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n                    overflow: hidden;\n                }\n                .doc-header {\n                    background: linear-gradient(135deg, #ff0080, #ff4d9e);\n                    color: white;\n                    padding: 20px;\n                    text-align: center;\n                }\n                .doc-icon {\n                    font-size: 48px;\n                    margin-bottom: 10px;\n                }\n                .doc-title {\n                    font-size: 18px;\n                    font-weight: 500;\n                    word-break: break-all;\n                }\n                .doc-meta {\n                    padding: 20px;\n                    border-bottom: 1px solid #eee;\n                }\n                .meta-row {\n                    display: flex;\n                    padding: 8px 0;\n                }\n                .meta-label {\n                    width: 100px;\n                    font-weight: 500;\n                    color: #666;\n                }\n                .meta-value {\n                    flex: 1;\n                    color: #333;\n                }\n                .preview-placeholder {\n                    padding: 40px;\n                    text-align: center;\n                    color: #999;\n                }\n                .preview-icon {\n                    font-size: 64px;\n                    margin-bottom: 20px;\n                }\n                .preview-text {\n                    font-size: 16px;\n                    margin-bottom: 10px;\n                }\n                .preview-note {\n                    font-size: 13px;\n                }\n            </style>\n        </head>\n        <body>\n            <div class=\"container\">\n                <div class=\"doc-header\">\n                    <div class=\"doc-icon\">\uD83D\uDCC4</div>\n                    <div class=\"doc-title\">").concat(escapeHtml(doc.name), "</div>\n                </div>\n\n                <div class=\"doc-meta\">\n                    <div class=\"meta-row\">\n                        <span class=\"meta-label\">Size:</span>\n                        <span class=\"meta-value\">").concat((doc.size / 1024).toFixed(2), " KB</span>\n                    </div>\n                    <div class=\"meta-row\">\n                        <span class=\"meta-label\">Type:</span>\n                        <span class=\"meta-value\">").concat(escapeHtml(doc.type) || 'Unknown', "</span>\n                    </div>\n                    <div class=\"meta-row\">\n                        <span class=\"meta-label\">Uploaded:</span>\n                        <span class=\"meta-value\">").concat(new Date(doc.uploadDate).toLocaleString(), "</span>\n                    </div>\n                </div>\n\n                <div class=\"preview-placeholder\">\n                    <div class=\"preview-icon\">\uD83D\uDCCB</div>\n                    <div class=\"preview-text\">Preview not available for this file type</div>\n                    <div class=\"preview-note\">The file would open in its native application</div>\n                </div>\n            </div>\n        </body>\n        </html>\n    ");
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
}
// ================================
// VISIBILITY FUNCTIONS
// ================================
function applyVisibility() {
    var mainHeader = document.getElementById('mainHeader');
    var subtaskHeader = document.getElementById('subtaskHeader');
    if (!mainHeader)
        return;
    var visibleColumns = columnConfig.filter(function (col) { return col.visible; }).map(function (col) { return col.key; });
    console.log('Visible columns:', visibleColumns);
    var baseIndices = {
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
    for (var i = 0; i < mainHeader.children.length; i++) {
        if (mainHeader.children[i]) {
            mainHeader.children[i].style.display = 'none';
        }
    }
    visibleColumns.forEach(function (key) {
        if (baseIndices[key] !== undefined) {
            if (mainHeader.children[baseIndices[key]]) {
                mainHeader.children[baseIndices[key]].style.display = '';
            }
        }
    });
    document.querySelectorAll('.extra-column').forEach(function (th) {
        var key = th.getAttribute('data-column');
        if (key && visibleColumns.includes(key)) {
            th.style.display = '';
        }
        else {
            th.style.display = 'none';
        }
    });
    document.querySelectorAll('.task-row').forEach(function (row) {
        for (var i = 0; i < row.cells.length; i++) {
            if (row.cells[i]) {
                row.cells[i].style.display = 'none';
            }
        }
        visibleColumns.forEach(function (key) {
            if (baseIndices[key] !== undefined) {
                if (row.cells[baseIndices[key]]) {
                    row.cells[baseIndices[key]].style.display = '';
                }
            }
        });
        row.querySelectorAll('.extra-cell').forEach(function (cell) {
            var key = cell.getAttribute('data-column');
            if (key && visibleColumns.includes(key)) {
                cell.style.display = '';
            }
            else {
                cell.style.display = 'none';
            }
        });
    });
    document.querySelectorAll('.subtask-row').forEach(function (row) {
        for (var i = 0; i < row.cells.length; i++) {
            if (row.cells[i]) {
                row.cells[i].style.display = 'none';
            }
        }
        if (row.cells[0]) {
            row.cells[0].style.display = '';
        }
        visibleColumns.forEach(function (key) {
            var col = columnConfig.find(function (c) { return c.key === key; });
            if (col && col.forSubtask) {
                var subtaskIndices = {
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
        row.querySelectorAll('.extra-cell').forEach(function (cell) {
            var key = cell.getAttribute('data-column');
            var col = columnConfig.find(function (c) { return c.key === key; });
            if (col && col.forSubtask && key && visibleColumns.includes(key)) {
                cell.style.display = '';
            }
            else {
                cell.style.display = 'none';
            }
        });
    });
    setTimeout(function () {
        updateSublistRowsColspan();
    }, 50);
}
function applyVisibilityForMainList(mainList) {
    if (!mainList || !mainList.tableElement)
        return;
    var visibleColumns = columnConfig.filter(function (col) { return col.visible !== false; }).map(function (col) { return col.key; });
    var baseIndices = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    var headerRow = mainList.tableElement.querySelector('thead tr');
    if (headerRow) {
        Array.from(headerRow.children).forEach(function (th, idx) {
            var colKey = th.getAttribute('data-column');
            if (colKey) {
                th.style.display = visibleColumns.includes(colKey) ? '' : 'none';
            }
            else {
                var baseKey = Object.keys(baseIndices)[idx];
                if (baseKey) {
                    th.style.display = visibleColumns.includes(baseKey) ? '' : 'none';
                }
            }
        });
    }
    var tbody = mainList.tbody;
    if (tbody) {
        Array.from(tbody.querySelectorAll('.task-row, .subtask-row')).forEach(function (row) {
            Array.from(row.children).forEach(function (cell, idx) {
                if (idx < 9) {
                    var baseKey = Object.keys(baseIndices)[idx];
                    if (baseKey) {
                        cell.style.display = visibleColumns.includes(baseKey) ? '' : 'none';
                    }
                }
            });
            row.querySelectorAll('.extra-cell').forEach(function (cell) {
                var colKey = cell.getAttribute('data-column');
                if (colKey) {
                    cell.style.display = visibleColumns.includes(colKey) ? '' : 'none';
                }
            });
        });
        var sublistRows = tbody.querySelectorAll('.sub-list-row td');
        sublistRows.forEach(function (td) {
            td.setAttribute('colspan', visibleColumns.length.toString());
        });
    }
}
function updateSublistRowsColspan() {
    var visibleCount = 0;
    var baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    baseColumns.forEach(function (key) {
        var col = columnConfig.find(function (c) { return c.key === key; });
        if (col && col.visible) {
            visibleCount++;
        }
    });
    columnConfig.forEach(function (col) {
        if (!baseColumns.includes(col.key) && col.visible) {
            visibleCount++;
        }
    });
    console.log('Total visible columns:', visibleCount);
    document.querySelectorAll('.main-list-row').forEach(function (row) {
        var td = row.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
            td.style.width = '100%';
        }
    });
    document.querySelectorAll('.sub-list-row').forEach(function (row) {
        var td = row.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
            td.style.width = '100%';
            var sublistHeader = td.querySelector('.sublist-header');
            if (sublistHeader) {
                sublistHeader.style.width = '100%';
                sublistHeader.style.display = 'flex';
                sublistHeader.style.justifyContent = 'space-between';
                sublistHeader.style.alignItems = 'center';
            }
        }
    });
    var subtaskHeader = document.querySelector('.skystemtaskmaster-subtask-header');
    if (subtaskHeader) {
        var td = subtaskHeader.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
        }
    }
}
// ================================
// SORTING FUNCTIONS
// ================================
function initializeColumnSorting() {
    console.log('Initializing column sorting with icons...');
    var allHeaders = document.querySelectorAll('.main-list-table-container th');
    allHeaders.forEach(function (header, index) {
        if (header.querySelector('.sort-icon'))
            return;
        header.style.cursor = 'pointer';
        header.setAttribute('title', 'Click to sort');
        var columnKey = header.getAttribute('data-column') || getColumnKeyFromText(header.textContent || '');
        var sortIcon = document.createElement('span');
        sortIcon.className = 'sort-icon';
        sortIcon.innerHTML = ' ↕️';
        sortIcon.style.cssText = "\n            font-size: 12px;\n            margin-left: 5px;\n            opacity: 0.5;\n            display: inline-block;\n            transition: all 0.2s;\n        ";
        header.appendChild(sortIcon);
        header.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleSortForTable(header, columnKey);
        });
        header.addEventListener('mouseenter', function () {
            header.style.backgroundColor = '#fff0f5';
        });
        header.addEventListener('mouseleave', function () {
            header.style.backgroundColor = '';
        });
    });
    console.log('Sort icons added to', allHeaders.length, 'headers');
}
function getColumnKeyFromText(text) {
    var columnMap = {
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
    var table = header.closest('.skystemtaskmaster-table');
    if (!table)
        return;
    var tbody = table.querySelector('tbody');
    if (!tbody)
        return;
    var sortState = null;
    var currentDirection = 'asc';
    var currentColumn = null;
    var stateAttr = table.getAttribute('data-sort-state');
    if (stateAttr) {
        try {
            var state = JSON.parse(stateAttr);
            currentColumn = state.column;
            currentDirection = state.direction;
        }
        catch (e) { }
    }
    var newDirection = 'asc';
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
    table.querySelectorAll('.sort-icon').forEach(function (icon) {
        icon.innerHTML = ' ↕️';
        icon.style.opacity = '0.5';
        icon.style.color = '';
    });
    var activeIcon = activeHeader.querySelector('.sort-icon');
    if (activeIcon) {
        activeIcon.innerHTML = direction === 'asc' ? ' ↑' : ' ↓';
        activeIcon.style.opacity = '1';
        activeIcon.style.color = '#ff0080';
    }
}
function sortTableByColumnPreservingHierarchy(columnKey, direction) {
    console.log('Sorting by', columnKey, direction);
    var tables = document.querySelectorAll('.main-list-table-container .skystemtaskmaster-table');
    tables.forEach(function (table) {
        var tbody = table.querySelector('tbody');
        if (!tbody)
            return;
        var allRows = Array.from(tbody.querySelectorAll('tr'));
        var mainListRows = allRows.filter(function (row) { return row.classList.contains('main-list-title-row'); });
        var subListRows = allRows.filter(function (row) { return row.classList.contains('sub-list-row'); });
        var taskRows = allRows.filter(function (row) { return row.classList.contains('task-row'); });
        var tasksBySublist = {};
        taskRows.forEach(function (row) {
            var sublistId = row.getAttribute('data-sublist-id') || '';
            if (!tasksBySublist[sublistId]) {
                tasksBySublist[sublistId] = [];
            }
            tasksBySublist[sublistId].push(row);
        });
        Object.keys(tasksBySublist).forEach(function (sublistId) {
            tasksBySublist[sublistId].sort(function (a, b) {
                var aVal = getCellValueForSort(a, columnKey);
                var bVal = getCellValueForSort(b, columnKey);
                return compareValues(aVal, bVal, direction);
            });
        });
        var fragment = document.createDocumentFragment();
        mainListRows.forEach(function (row) {
            fragment.appendChild(row);
            var mainListId = row.getAttribute('data-mainlist-id');
            var sublistRowsForMain = subListRows.filter(function (sr) { return sr.getAttribute('data-mainlist-id') === mainListId; });
            sublistRowsForMain.forEach(function (sublistRow) {
                fragment.appendChild(sublistRow);
                var sublistId = sublistRow.getAttribute('data-sublist-id') || '';
                var sortedTasks = tasksBySublist[sublistId] || [];
                sortedTasks.forEach(function (taskRow) { return fragment.appendChild(taskRow); });
            });
        });
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        tbody.appendChild(fragment);
    });
    showNotification("Sorted by ".concat(columnKey, " (").concat(direction === 'asc' ? 'Ascending' : 'Descending', ")"));
}
function getCellValueForSort(row, columnKey) {
    var _a, _b, _c, _d, _e, _f;
    var baseIndices = {
        taskName: 0, acc: 1, tdoc: 2, dueDate: 3, status: 4,
        owner: 5, reviewer: 6, cdoc: 7, days: 8
    };
    if (baseIndices[columnKey] !== undefined) {
        var cell = row.cells[baseIndices[columnKey]];
        if (!cell)
            return '';
        if (columnKey === 'status' || columnKey === 'owner' || columnKey === 'reviewer') {
            var badge = cell.querySelector('.skystemtaskmaster-status-badge, .skystemtaskmaster-badge');
            return badge ? (((_a = badge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '') : (((_b = cell.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '');
        }
        if (columnKey === 'days') {
            var val = ((_c = cell.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '0';
            return parseInt(val.replace('+', '')) || 0;
        }
        if (columnKey === 'dueDate') {
            var val = ((_d = cell.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            if (val === 'Set due date')
                return 0;
            return new Date(val).getTime() || 0;
        }
        return ((_e = cell.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '';
    }
    var extraCell = Array.from(row.querySelectorAll('.extra-cell')).find(function (cell) { return cell.getAttribute('data-column') === columnKey; });
    return extraCell ? (((_f = extraCell.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '') : '';
}
function compareValues(a, b, direction) {
    var multiplier = direction === 'asc' ? 1 : -1;
    if (typeof a === 'number' && typeof b === 'number') {
        return (a - b) * multiplier;
    }
    var aStr = String(a || '').toLowerCase();
    var bStr = String(b || '').toLowerCase();
    if (aStr < bStr)
        return -1 * multiplier;
    if (aStr > bStr)
        return 1 * multiplier;
    return 0;
}
// ================================
// SAVE/LOAD FUNCTIONS
// ================================
function saveAllData() {
    try {
        var tasksData = tasks.map(function (task) { return ({
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
        }); });
        var subtasksData = subtasks.map(function (subtask) { return ({
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
        }); });
        var data_1 = {
            mainLists: mainLists.map(function (mainList) { return ({
                id: mainList.id,
                name: mainList.name,
                isExpanded: mainList.isExpanded,
                subLists: mainList.subLists.map(function (sub) { return sub.id; })
            }); }),
            subLists: subLists.map(function (subList) { return ({
                id: subList.id,
                name: subList.name,
                mainListId: subList.mainListId,
                isExpanded: subList.isExpanded,
                tasks: subList.tasks.map(function (task) { return task.id; })
            }); }),
            tasks: tasksData,
            subtasks: subtasksData,
            taskComments: taskComments,
            cdocDocuments: {},
            tdocDocuments: {},
            linkedAccountsMap: {}
        };
        tasks.forEach(function (task) {
            if (task.id && task.row) {
                var docs = taskDocuments.get(task.row);
                if (docs && docs.length > 0) {
                    data_1.cdocDocuments[task.id] = docs;
                }
                var tdocs = taskTDocDocuments.get(task.row);
                if (tdocs && tdocs.length > 0) {
                    data_1.tdocDocuments[task.id] = tdocs;
                }
                var accounts = taskAccounts.get(task.row);
                if (accounts && accounts.length > 0) {
                    data_1.linkedAccountsMap[task.id] = accounts;
                }
            }
        });
        subtasks.forEach(function (subtask) {
            if (subtask.id && subtask.row) {
                var docs = taskDocuments.get(subtask.row);
                if (docs && docs.length > 0) {
                    data_1.cdocDocuments[subtask.id] = docs;
                }
                var tdocs = taskTDocDocuments.get(subtask.row);
                if (tdocs && tdocs.length > 0) {
                    data_1.tdocDocuments[subtask.id] = tdocs;
                }
            }
        });
        localStorage.setItem('taskViewerData', JSON.stringify(data_1));
        console.log('All data saved to localStorage. Tasks:', tasksData.length, 'Subtasks:', subtasksData.length, 'Comment threads:', Object.keys(taskComments).length);
        return true;
    }
    catch (e) {
        console.error('Error saving data:', e);
        return false;
    }
}
function loadAllData() {
    try {
        var savedData = localStorage.getItem('taskViewerData');
        if (!savedData) {
            console.log('No saved data found');
            return false;
        }
        var data_2 = JSON.parse(savedData);
        console.log('Loading data:', data_2);
        var container = document.getElementById('mainTableContainer');
        if (container)
            container.innerHTML = '';
        mainLists = [];
        subLists = [];
        tasks = [];
        subtasks = [];
        taskDocuments.clear();
        taskTDocDocuments.clear();
        taskAccounts.clear();
        Object.keys(taskComments).forEach(function (key) {
            delete taskComments[key];
        });
        if (data_2.taskComments) {
            Object.assign(taskComments, data_2.taskComments);
            console.log('Loaded comments from localStorage:', Object.keys(taskComments).length, 'comment threads');
        }
        if (data_2.mainLists) {
            data_2.mainLists.forEach(function (mainListData) {
                var mainList = {
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
        if (data_2.subLists) {
            data_2.subLists.forEach(function (subListData) {
                var mainList = mainLists.find(function (m) { return m.id === subListData.mainListId; });
                if (mainList) {
                    var subList = {
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
        if (data_2.tasks) {
            data_2.tasks.forEach(function (taskData) {
                var subList = subLists.find(function (s) { return s.id === taskData.subListId; });
                if (subList) {
                    var task = {
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
                }
                else {
                    console.warn('SubList not found for task:', taskData.id, taskData.subListId);
                }
            });
        }
        if (data_2.subtasks) {
            data_2.subtasks.forEach(function (subtaskData) {
                var subList = subLists.find(function (s) { return s.id === subtaskData.subListId; });
                if (subList) {
                    var subtask = {
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
        setTimeout(function () {
            tasks.forEach(function (task) {
                if (task.row && task.id) {
                    task.row.dataset.taskId = task.id;
                }
            });
            subtasks.forEach(function (subtask) {
                if (subtask.row && subtask.id) {
                    subtask.row.dataset.subtaskId = subtask.id;
                }
            });
            if (data_2.cdocDocuments) {
                tasks.forEach(function (task) {
                    if (task.id && task.row && data_2.cdocDocuments[task.id]) {
                        taskDocuments.set(task.row, data_2.cdocDocuments[task.id]);
                    }
                });
                subtasks.forEach(function (subtask) {
                    if (subtask.id && subtask.row && data_2.cdocDocuments[subtask.id]) {
                        taskDocuments.set(subtask.row, data_2.cdocDocuments[subtask.id]);
                    }
                });
            }
            if (data_2.tdocDocuments) {
                tasks.forEach(function (task) {
                    if (task.id && task.row && data_2.tdocDocuments[task.id]) {
                        taskTDocDocuments.set(task.row, data_2.tdocDocuments[task.id]);
                    }
                });
                subtasks.forEach(function (subtask) {
                    if (subtask.id && subtask.row && data_2.tdocDocuments[subtask.id]) {
                        taskTDocDocuments.set(subtask.row, data_2.tdocDocuments[subtask.id]);
                    }
                });
            }
            if (data_2.linkedAccountsMap) {
                tasks.forEach(function (task) {
                    if (task.id && task.row && data_2.linkedAccountsMap[task.id]) {
                        taskAccounts.set(task.row, data_2.linkedAccountsMap[task.id]);
                    }
                });
            }
            updateTDocColumn();
            updateCDocColumn();
            refreshLinkedAccountsColumn();
            updateCommentColumn();
            setTimeout(function () {
                makeOwnerReviewerClickable();
                makeRecurrenceCellsClickable();
            }, 200);
            showNotification('Data restored successfully');
            console.log('All data loaded from localStorage. Tasks:', tasks.length, 'Subtasks:', subtasks.length, 'Comments:', Object.keys(taskComments).length);
        }, 500);
        return true;
    }
    catch (e) {
        console.error('Error loading data:', e);
        return false;
    }
}
function refreshLinkedAccountsColumn() {
    document.querySelectorAll('.extra-cell[data-column="linkedAccounts"]').forEach(function (cell) {
        var row = cell.closest('tr');
        if (!row)
            return;
        var task = tasks.find(function (t) { return t.row === row; });
        if (!task)
            return;
        var taskId = task.id || row.getAttribute('data-task-id') || '';
        var accounts = taskAccounts.get(row) || taskAccounts.get(taskId) || [];
        cell.innerHTML = '';
        cell.classList.add('extra-cell');
        if (accounts.length > 0) {
            accounts.forEach(function (account) {
                var badge = document.createElement('span');
                badge.className = 'account-badge';
                badge.textContent = account.accountName.substring(0, 12) + (account.accountName.length > 12 ? '...' : '');
                badge.title = account.accountName;
                badge.onclick = function (e) {
                    e.stopPropagation();
                    showAccountDetails(account, row, task);
                };
                cell.appendChild(badge);
            });
            var addMore = document.createElement('span');
            addMore.className = 'add-more-icon';
            addMore.textContent = '+';
            addMore.onclick = function (e) {
                e.stopPropagation();
                showAccountLinkingModal(row, task);
            };
            cell.appendChild(addMore);
        }
        else {
            var addIcon = document.createElement('span');
            addIcon.className = 'add-link-btn';
            addIcon.textContent = '+ Link Account';
            addIcon.onclick = function (e) {
                e.stopPropagation();
                showAccountLinkingModal(row, task);
            };
            cell.appendChild(addIcon);
        }
    });
}
function showAccountDetails(account, taskRow, task) {
    var _a, _b, _c;
    document.querySelectorAll('.account-tooltip').forEach(function (el) { return el.remove(); });
    var tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';
    tooltip.style.cssText = "\n        position: absolute;\n        background: white;\n        border: 1px solid #ddd;\n        border-radius: 8px;\n        padding: 15px;\n        box-shadow: 0 4px 20px rgba(0,0,0,0.15);\n        z-index: 10000;\n        min-width: 250px;\n        animation: fadeIn 0.2s ease;\n    ";
    var ownerNames = ((_a = account.accountOwners) === null || _a === void 0 ? void 0 : _a.map(function (o) { return getAuthorFullName(o); }).join(', ')) || 'None';
    var linkedStr = account.linkedDate ? new Date(account.linkedDate).toLocaleString() : '—';
    tooltip.innerHTML = "\n        <div style=\"font-weight: bold; color: #ff0080; font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #eee;\">\n            ".concat(escapeHtml(account.accountNumber || account.accountName), "\n        </div>\n        <div style=\"margin: 8px 0;\">\n            <table style=\"width: 100%; font-size: 13px;\">\n                <tr><td style=\"padding: 4px 0; color: #666;\">Org Hierarchy:</td><td>").concat(escapeHtml(account.orgHierarchy || '—'), "</td></tr>\n                <tr><td style=\"padding: 4px 0; color: #666;\">FS Caption:</td><td>").concat(escapeHtml(account.fsCaption || '—'), "</td></tr>\n                <tr><td style=\"padding: 4px 0; color: #666;\">Account Name:</td><td>").concat(escapeHtml(account.accountName || '—'), "</td></tr>\n                <tr><td style=\"padding: 4px 0; color: #666;\">Account Owners:</td><td>").concat(escapeHtml(ownerNames), "</td></tr>\n                <tr><td style=\"padding: 4px 0; color: #666;\">Account Range:</td><td>").concat(escapeHtml(account.accountFrom || '0'), " - ").concat(escapeHtml(account.accountTo || '∞'), "</td></tr>\n                <tr><td style=\"padding: 4px 0; color: #666;\">Due Days Range:</td><td>").concat(account.dueDaysFrom || '0', " - ").concat(account.dueDaysTo || '∞', " days</td></tr>\n                <tr><td style=\"padding: 4px 0; color: #666;\">Key Account:</td><td>").concat(escapeHtml(account.isKeyAccount || '—'), "</td></tr>\n                <tr><td style=\"padding: 4px 0; color: #666;\">Risk Rating:</td><td>").concat(escapeHtml(account.riskRating || '—'), "</td></tr>\n                <tr><td style=\"padding: 4px 0; color: #666;\">Linked:</td><td>").concat(escapeHtml(linkedStr), "</td></tr>\n            </table>\n        </div>\n        <div style=\"display: flex; gap: 8px; margin-top: 15px; justify-content: flex-end;\">\n            <button class=\"close-tooltip-btn\" style=\"padding: 6px 12px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;\">Close</button>\n            <button class=\"remove-account-btn\" style=\"padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;\">Remove</button>\n        </div>\n    ");
    document.body.appendChild(tooltip);
    var rect = taskRow.getBoundingClientRect();
    tooltip.style.left = (rect.left + window.scrollX + 50) + 'px';
    tooltip.style.top = (rect.top + window.scrollY - 100) + 'px';
    (_b = tooltip.querySelector('.close-tooltip-btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        tooltip.remove();
    });
    (_c = tooltip.querySelector('.remove-account-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
        var _a;
        var taskId = task.id || ((_a = task.row) === null || _a === void 0 ? void 0 : _a.getAttribute('data-task-id')) || '';
        var accounts = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];
        var updatedAccounts = accounts.filter(function (a) { return a.accountNumber !== account.accountNumber; });
        if (updatedAccounts.length === 0) {
            taskAccounts.delete(task.row);
            taskAccounts.delete(taskId);
        }
        else {
            taskAccounts.set(task.row, updatedAccounts);
            taskAccounts.set(taskId, updatedAccounts);
        }
        tooltip.remove();
        refreshLinkedAccountsColumn();
        showNotification("Account ".concat(account.accountNumber, " removed"));
        setTimeout(function () { return saveAllData(); }, 100);
    });
    setTimeout(function () {
        document.addEventListener('click', function closeHandler(e) {
            if (!tooltip.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 100);
}
function showAccountLinkingModal(taskRow, task) {
    var _a, _b, _c, _d, _e;
    var existingModal = document.getElementById('accountLinkingModal');
    if (existingModal)
        existingModal.remove();
    var taskName = task.name || ((_b = (_a = task.taskNameCell) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) || 'Task';
    var modal = document.createElement('div');
    modal.id = 'accountLinkingModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.zIndex = '10000';
    modal.innerHTML = "\n        <div class=\"modal-content\" style=\"width: 800px; max-height: 90vh; overflow-y: auto;\">\n            <span class=\"close\">&times;</span>\n            <h3 class=\"cdoc-header\">\uD83D\uDCCA Link Account to Task</h3>\n            \n            <div class=\"account-info-box\" style=\"border-left: 3px solid #ff0080; padding: 10px; margin-bottom: 20px; background: #f9f9f9; border-radius: 4px;\">\n                <div style=\"font-size: 13px; color: #666; margin-bottom: 5px;\">Task:</div>\n                <div style=\"font-weight: 500;\">".concat(escapeHtml(taskName), "</div>\n            </div>\n            \n            <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 20px;\">\n                <div>\n                    <h4 class=\"section-title\" style=\"margin-bottom: 15px; color: #ff0080;\">Account Details</h4>\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Organizational Hierarchy</label>\n                        <select id=\"orgHierarchy\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"\">Select Hierarchy...</option>\n                            <option value=\"Corporate\">Corporate</option>\n                            <option value=\"Division\">Division</option>\n                            <option value=\"Department\">Department</option>\n                            <option value=\"Subsidiary\">Subsidiary</option>\n                        </select>\n                    </div>\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">FS Caption</label>\n                        <input type=\"text\" id=\"fsCaption\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"e.g., Cash & Equivalents\">\n                    </div>\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Account Name *</label>\n                        <input type=\"text\" id=\"accountName\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"e.g., Cash & Cash Equivalents\">\n                    </div>\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Account Owners</label>\n                        <select id=\"accountOwners\" class=\"form-input-full\" multiple size=\"3\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"PK\">Palakh Khanna</option>\n                            <option value=\"SM\">Sarah Miller</option>\n                            <option value=\"MP\">Mel Preparer</option>\n                            <option value=\"PP\">Poppy Pan</option>\n                            <option value=\"JS\">John Smith</option>\n                            <option value=\"EW\">Emma Watson</option>\n                            <option value=\"DB\">David Brown</option>\n                        </select>\n                        <div class=\"form-helper-text\" style=\"font-size: 12px; color: #999; margin-top: 5px;\">Ctrl+Click to select multiple</div>\n                    </div>\n                </div>\n                \n                <div>\n                    <h4 class=\"section-title\" style=\"margin-bottom: 15px; color: #ff0080;\">Account Range & Settings</h4>\n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;\">\n                        <div class=\"form-group\">\n                            <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Account # From</label>\n                            <input type=\"text\" id=\"accountFrom\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"e.g., 1000\">\n                        </div>\n                        <div class=\"form-group\">\n                            <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Account # To</label>\n                            <input type=\"text\" id=\"accountTo\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"e.g., 1999\">\n                        </div>\n                    </div>\n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;\">\n                        <div class=\"form-group\">\n                            <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Due Days From</label>\n                            <input type=\"number\" id=\"dueDaysFrom\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"0\">\n                        </div>\n                        <div class=\"form-group\">\n                            <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Due Days To</label>\n                            <input type=\"number\" id=\"dueDaysTo\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"30\">\n                        </div>\n                    </div>\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Is Key Account</label>\n                        <select id=\"isKeyAccount\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"All\">All</option>\n                            <option value=\"Yes\">Yes</option>\n                            <option value=\"No\">No</option>\n                        </select>\n                    </div>\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label class=\"form-label\" style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Risk Rating</label>\n                        <select id=\"riskRating\" class=\"form-input-full\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"All\">All</option>\n                            <option value=\"Low\">Low</option>\n                            <option value=\"Medium\">Medium</option>\n                            <option value=\"High\">High</option>\n                        </select>\n                    </div>\n                </div>\n            </div>\n            \n            <div class=\"modal-footer\" style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;\">\n                <button id=\"cancelAccountBtn\" class=\"btn-secondary\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Cancel</button>\n                <button id=\"linkAccountBtn\" class=\"btn-primary\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Link Account</button>\n            </div>\n        </div>\n    ");
    document.body.appendChild(modal);
    var close = function () { return modal.remove(); };
    (_c = modal.querySelector('.close')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', close);
    (_d = document.getElementById('cancelAccountBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal)
        close(); });
    (_e = document.getElementById('linkAccountBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', function () {
        var _a;
        var accountName = document.getElementById('accountName').value.trim();
        if (!accountName) {
            alert('Please enter Account Name');
            return;
        }
        var account = {
            orgHierarchy: document.getElementById('orgHierarchy').value,
            fsCaption: document.getElementById('fsCaption').value.trim(),
            accountName: accountName,
            accountNumber: document.getElementById('accountFrom').value || accountName,
            accountOwners: Array.from(document.getElementById('accountOwners').selectedOptions).map(function (opt) { return opt.value; }),
            accountFrom: document.getElementById('accountFrom').value.trim(),
            accountTo: document.getElementById('accountTo').value.trim(),
            dueDaysFrom: parseInt(document.getElementById('dueDaysFrom').value) || 0,
            dueDaysTo: parseInt(document.getElementById('dueDaysTo').value) || 0,
            isKeyAccount: document.getElementById('isKeyAccount').value,
            riskRating: document.getElementById('riskRating').value,
            linkedDate: new Date().toISOString(),
            linkedBy: 'PK'
        };
        var taskId = task.id || ((_a = task.row) === null || _a === void 0 ? void 0 : _a.getAttribute('data-task-id')) || '';
        var current = taskAccounts.get(task.row) || taskAccounts.get(taskId) || [];
        var updated = __spreadArray(__spreadArray([], current, true), [account], false);
        taskAccounts.set(task.row, updated);
        if (taskId)
            taskAccounts.set(taskId, updated);
        task.linkedAccounts = JSON.stringify(updated);
        refreshLinkedAccountsColumn();
        close();
        showNotification("Account \"".concat(accountName, "\" linked"));
        setTimeout(function () { return saveAllData(); }, 100);
    });
}
// ================================
// UTILITY FUNCTIONS
// ================================
function calculateDays() {
    var today = new Date();
    tasks.forEach(function (task) {
        if (!task.dueDateCell)
            return;
        var dueText = task.dueDateCell.innerText;
        if (dueText === 'Set due date')
            return;
        var dueDate = new Date(dueText);
        var diffTime = dueDate.getTime() - today.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (!isNaN(diffDays) && task.daysCell) {
            if (diffDays >= 0) {
                task.daysCell.innerText = "+" + diffDays;
                task.daysCell.className = "skystemtaskmaster-days-positive";
            }
            else {
                task.daysCell.innerText = diffDays.toString();
                task.daysCell.className = "skystemtaskmaster-days-negative";
            }
        }
    });
}
function makeOwnerReviewerClickable() {
    tasks.forEach(function (task) {
        var _a, _b;
        var ownerCell = (_a = task.row) === null || _a === void 0 ? void 0 : _a.cells[5];
        var reviewerCell = (_b = task.row) === null || _b === void 0 ? void 0 : _b.cells[6];
        if (ownerCell)
            makeCellClickable(ownerCell, 'owner', task);
        if (reviewerCell)
            makeCellClickable(reviewerCell, 'reviewer', task);
    });
    subtasks.forEach(function (subtask) {
        if (subtask.ownerCell)
            makeCellClickable(subtask.ownerCell, 'owner', subtask);
        if (subtask.reviewerCell)
            makeCellClickable(subtask.reviewerCell, 'reviewer', subtask);
    });
}
function makeRecurrenceCellsClickable() {
    var _this = this;
    console.log('Making recurrence cells clickable...');
    var recurrenceCells = document.querySelectorAll('.extra-cell[data-column="recurrenceType"]');
    console.log('Found recurrence cells:', recurrenceCells.length);
    recurrenceCells.forEach(function (cell, index) {
        var _a;
        if (cell.classList.contains('recurrence-initialized')) {
            return;
        }
        cell.classList.add('recurrence-initialized');
        var newCell = cell.cloneNode(true);
        (_a = cell.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newCell, cell);
        newCell.style.cursor = 'pointer';
        newCell.style.transition = 'all 0.2s ease';
        newCell.style.userSelect = 'none';
        newCell.setAttribute('title', 'Click to change recurrence type');
        newCell.addEventListener('mouseenter', function () {
            this.style.backgroundColor = '#fff0f5';
            this.style.transform = 'scale(1.02)';
            this.style.fontWeight = 'bold';
            this.style.boxShadow = '0 2px 4px rgba(255,0,128,0.2)';
        });
        newCell.addEventListener('mouseleave', function () {
            this.style.backgroundColor = '';
            this.style.transform = 'scale(1)';
            this.style.fontWeight = '';
            this.style.boxShadow = 'none';
        });
        newCell.addEventListener('click', function (e) {
            var _a;
            e.stopPropagation();
            e.preventDefault();
            console.log('Recurrence cell clicked!');
            var row = _this.closest('tr');
            if (!row) {
                console.error('No parent row found');
                return;
            }
            var task = tasks.find(function (t) { return t.row === row; });
            if (!task) {
                console.error('No task found for row');
                return;
            }
            var currentValue = ((_a = _this.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || 'None';
            console.log('Current value:', currentValue);
            showRecurrenceTypeModal(task, _this, currentValue);
        });
        console.log("Cell ".concat(index, " initialized with click handler"));
    });
}
function addRecurrenceEditor() {
    addRecurrenceStyles();
    makeRecurrenceCellsClickable();
}
function deleteSelectedItems() {
    var _a, _b, _c, _d, _e, _f, _g;
    var deleted = 0;
    for (var i = mainLists.length - 1; i >= 0; i--) {
        var mainList = mainLists[i];
        var outsideCheckbox = mainList.outsideCheckbox;
        var insideCheckbox = mainList.insideCheckbox;
        var isChecked = (outsideCheckbox && outsideCheckbox.checked) || (insideCheckbox && insideCheckbox.checked);
        if (isChecked) {
            console.log('Deleting main list:', mainList.name);
            mainList.subLists.forEach(function (subList) {
                var _a;
                for (var j = tasks.length - 1; j >= 0; j--) {
                    if (tasks[j].subListId === subList.id) {
                        (_a = tasks[j].row) === null || _a === void 0 ? void 0 : _a.remove();
                        tasks.splice(j, 1);
                        deleted++;
                    }
                }
                var subIndex = subLists.findIndex(function (s) { return s.id === subList.id; });
                if (subIndex !== -1) {
                    subLists.splice(subIndex, 1);
                    deleted++;
                }
            });
            if (mainList.tableContainer && mainList.tableContainer.parentElement) {
                var wrapper = mainList.tableContainer.parentElement;
                if (wrapper && wrapper.classList.contains('main-list-outer-wrapper')) {
                    wrapper.remove();
                    deleted++;
                }
                else if (mainList.tableContainer) {
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
    var _loop_1 = function (i) {
        var subList = subLists[i];
        var checkbox = (_a = subList.row) === null || _a === void 0 ? void 0 : _a.querySelector('.sublist-checkbox');
        if (checkbox && checkbox.checked) {
            for (var j = tasks.length - 1; j >= 0; j--) {
                if (tasks[j].subListId === subList.id) {
                    (_b = tasks[j].row) === null || _b === void 0 ? void 0 : _b.remove();
                    tasks.splice(j, 1);
                    deleted++;
                }
            }
            var mainList = mainLists.find(function (m) { return m.id === subList.mainListId; });
            if (mainList) {
                var subIndex = mainList.subLists.findIndex(function (s) { return s.id === subList.id; });
                if (subIndex !== -1)
                    mainList.subLists.splice(subIndex, 1);
            }
            (_c = subList.row) === null || _c === void 0 ? void 0 : _c.remove();
            subLists.splice(i, 1);
            deleted++;
        }
    };
    for (var i = subLists.length - 1; i >= 0; i--) {
        _loop_1(i);
    }
    var _loop_2 = function (i) {
        var task = tasks[i];
        var checkbox = (_d = task.row) === null || _d === void 0 ? void 0 : _d.querySelector('.task-checkbox');
        if (checkbox && checkbox.checked) {
            var subList = subLists.find(function (s) { return s.id === task.subListId; });
            if (subList) {
                var taskIndex = subList.tasks.findIndex(function (t) { return t.id === task.id; });
                if (taskIndex !== -1)
                    subList.tasks.splice(taskIndex, 1);
            }
            (_e = task.row) === null || _e === void 0 ? void 0 : _e.remove();
            tasks.splice(i, 1);
            deleted++;
        }
    };
    for (var i = tasks.length - 1; i >= 0; i--) {
        _loop_2(i);
    }
    for (var i = subtasks.length - 1; i >= 0; i--) {
        var subtask = subtasks[i];
        var checkbox = (_f = subtask.row) === null || _f === void 0 ? void 0 : _f.querySelector('.subtask-checkbox');
        if (checkbox && checkbox.checked) {
            (_g = subtask.row) === null || _g === void 0 ? void 0 : _g.remove();
            subtasks.splice(i, 1);
            deleted++;
        }
    }
    if (deleted > 0) {
        updateCounts();
        saveAllData();
        showNotification("".concat(deleted, " item(s) deleted successfully"));
    }
    else {
        showNotification('No items selected');
    }
}
function setupAutoSave() {
    var originalCreateMainList = createMainList;
    var originalCreateSubList = createSubList;
    var originalCreateTask = createTask;
    var originalDeleteSelectedItems = deleteSelectedItems;
    window.createMainList = function (listName) {
        var result = originalCreateMainList(listName);
        setTimeout(function () { return saveAllData(); }, 100);
        return result;
    };
    window.createSubList = function (mainList, subListName) {
        var result = originalCreateSubList(mainList, subListName);
        setTimeout(function () { return saveAllData(); }, 100);
        return result;
    };
    window.createTask = function (subList, taskData) {
        var result = originalCreateTask(subList, taskData);
        setTimeout(function () { return saveAllData(); }, 100);
        return result;
    };
    window.deleteSelectedItems = function () {
        var result = originalDeleteSelectedItems();
        setTimeout(function () { return saveAllData(); }, 100);
        return result;
    };
    document.addEventListener('click', function (e) {
        if (e.target instanceof HTMLElement &&
            (e.target.closest('.skystemtaskmaster-status-badge') ||
                e.target.closest('.skystemtaskmaster-badge'))) {
            setTimeout(function () { return saveAllData(); }, 200);
        }
    });
}
function initializeCleanStructure() {
    var container = document.getElementById('mainTableContainer');
    if (container)
        container.innerHTML = '';
    var oldTable = document.getElementById('mainTable');
    if (oldTable)
        oldTable.style.display = 'none';
    var sidebar = document.getElementById('mainSidebar');
    if (sidebar)
        sidebar.innerHTML = '';
    mainLists = [];
    subLists = [];
    tasks = [];
    subtasks = [];
    updateCounts();
    console.log('Clean structure initialized with separate tables');
}
function initializeEventListeners() {
    var newTaskBtn = document.querySelector('.skystemtaskmaster-btn-new');
    var newTaskOptionsModal = document.getElementById('newTaskOptionsModal');
    var enterListNameModal = document.getElementById('enterListNameModal');
    var importTasksModal = document.getElementById('importTasksModal');
    var addTaskModal = document.getElementById('addTaskModal');
    var addSubtaskModal = document.getElementById('addSubtaskModal');
    if (newTaskBtn && newTaskOptionsModal) {
        newTaskBtn.addEventListener('click', function () {
            newTaskOptionsModal.style.display = 'block';
        });
    }
    var newTaskMainButton = document.getElementById('newTaskMainButton');
    var newTaskDropdown = document.getElementById('newTaskDropdown');
    if (newTaskMainButton && newTaskDropdown) {
        newTaskMainButton.addEventListener('click', function (e) {
            e.stopPropagation();
            newTaskDropdown.style.display = newTaskDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
    document.addEventListener('click', function () {
        if (newTaskDropdown) {
            newTaskDropdown.style.display = 'none';
        }
    });
    if (newTaskDropdown) {
        newTaskDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }
    document.querySelectorAll('.close').forEach(function (button) {
        button.addEventListener('click', function () {
            if (newTaskOptionsModal)
                newTaskOptionsModal.style.display = 'none';
            if (enterListNameModal)
                enterListNameModal.style.display = 'none';
            if (importTasksModal)
                importTasksModal.style.display = 'none';
            if (addTaskModal)
                addTaskModal.style.display = 'none';
            if (addSubtaskModal)
                addSubtaskModal.style.display = 'none';
        });
    });
    window.addEventListener('click', function (event) {
        if (event.target === newTaskOptionsModal && newTaskOptionsModal)
            newTaskOptionsModal.style.display = 'none';
        if (event.target === enterListNameModal && enterListNameModal)
            enterListNameModal.style.display = 'none';
        if (event.target === importTasksModal && importTasksModal)
            importTasksModal.style.display = 'none';
        if (event.target === addTaskModal && addTaskModal)
            addTaskModal.style.display = 'none';
        if (event.target === addSubtaskModal && addSubtaskModal)
            addSubtaskModal.style.display = 'none';
    });
    var newListOption = document.getElementById('newListOption');
    if (newListOption) {
        newListOption.addEventListener('click', function () {
            if (newTaskOptionsModal)
                newTaskOptionsModal.style.display = 'none';
            if (enterListNameModal)
                enterListNameModal.style.display = 'block';
            if (newTaskDropdown)
                newTaskDropdown.style.display = 'none';
        });
    }
    var importTasksOption = document.getElementById('importTasksOption');
    if (importTasksOption) {
        importTasksOption.addEventListener('click', function () {
            if (newTaskOptionsModal)
                newTaskOptionsModal.style.display = 'none';
            if (importTasksModal)
                importTasksModal.style.display = 'block';
            if (newTaskDropdown)
                newTaskDropdown.style.display = 'none';
        });
    }
    var createListBtn = document.getElementById('createListBtn');
    var listNameInput = document.getElementById('listNameInput');
    if (createListBtn) {
        createListBtn.addEventListener('click', function () {
            var listName = listNameInput.value.trim();
            if (listName) {
                createMainList(listName);
                if (enterListNameModal)
                    enterListNameModal.style.display = 'none';
                listNameInput.value = '';
            }
            else {
                alert('Please enter a list name');
            }
        });
    }
    var addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function () {
            var taskName = document.getElementById('addTaskName').value.trim();
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
            }
            else {
                createNewTask(taskName, document.getElementById('addTaskAcc').value || '+', document.getElementById('addTaskTdoc').value || '0', document.getElementById('addTaskOwner').value, document.getElementById('addTaskReviewer').value, document.getElementById('addTaskDueDate').value);
            }
            if (addTaskModal)
                addTaskModal.style.display = 'none';
            document.getElementById('addTaskName').value = '';
        });
    }
    var addSubtaskBtn = document.getElementById('addSubtaskBtn');
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', createNewSubtask);
    }
    var taskPlus = document.querySelector('.task-plus');
    if (taskPlus) {
        taskPlus.addEventListener('click', function () {
            if (addTaskModal)
                addTaskModal.style.display = 'block';
        });
    }
    var subtaskPlus = document.querySelector('.subtask-plus');
    if (subtaskPlus) {
        subtaskPlus.addEventListener('click', function () {
            if (addSubtaskModal)
                addSubtaskModal.style.display = 'block';
        });
    }
    initializeThreeDotsMenu();
    var searchInput = document.querySelector(".skystemtaskmaster-search-bar");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            var value = searchInput.value.toLowerCase();
            tasks.forEach(function (task) {
                if (task.row) {
                    var text = task.row.innerText.toLowerCase();
                    task.row.style.display = text.indexOf(value) !== -1 ? "" : "none";
                }
            });
            subtasks.forEach(function (subtask) {
                if (subtask.row) {
                    var text = subtask.row.innerText.toLowerCase();
                    subtask.row.style.display = text.indexOf(value) !== -1 ? "" : "none";
                }
            });
        });
    }
}
function createNewTask(taskName, acc, tdoc, owner, reviewer, dueDate) {
    if (dueDate === void 0) { dueDate = ''; }
    var tbody = document.querySelector('tbody');
    if (!tbody)
        return;
    var subtaskHeader = document.querySelector('.skystemtaskmaster-subtask-header');
    var formattedDueDate = 'Set due date';
    if (dueDate) {
        var date = new Date(dueDate);
        formattedDueDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    var daysDiff = 0;
    var daysClass = 'skystemtaskmaster-days-positive';
    var daysText = '+0';
    if (dueDate) {
        var today = new Date();
        var due = new Date(dueDate);
        var diffTime = due.getTime() - today.getTime();
        daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0) {
            daysText = '+' + daysDiff;
        }
        else {
            daysText = daysDiff.toString();
            daysClass = 'skystemtaskmaster-days-negative';
        }
    }
    var newRow = document.createElement('tr');
    newRow.className = 'task-row';
    newRow.setAttribute('data-task-id', String(tasks.length + 1));
    newRow.innerHTML = "\n        <td>\n            <div class=\"skystemtaskmaster-task-name\">\n                <input type=\"checkbox\" class=\"task-checkbox\">\n                <span>".concat(escapeHtml(taskName), "</span>\n            </div>\n        </td>\n        <td><span style=\"color: #ff0080; font-weight: bold;\">").concat(escapeHtml(acc), "</span></td>\n        <td class=\"tdoc-cell\">").concat(escapeHtml(tdoc), "</td>\n        <td class=\"skystemtaskmaster-editable due-date\" contenteditable=\"true\">").concat(escapeHtml(formattedDueDate), "</td>\n        <td><span class=\"skystemtaskmaster-status-badge skystemtaskmaster-status-not-started\">Not Started</span></td>\n        <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(owner.toLowerCase(), "\">").concat(escapeHtml(owner), "</span></td>\n        <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(reviewer.toLowerCase(), "\">").concat(escapeHtml(reviewer), "</span></td>\n        <td class=\"cdoc-cell\">0</td>\n        <td class=\"days-cell ").concat(daysClass, "\">").concat(daysText, "</td>\n    ");
    if (subtaskHeader) {
        tbody.insertBefore(newRow, subtaskHeader);
    }
    else {
        tbody.appendChild(newRow);
    }
    taskDocuments.set(newRow, []);
    taskTDocDocuments.set(newRow, []);
    var checkbox = newRow.querySelector('.task-checkbox');
    var statusBadge = newRow.querySelector('.skystemtaskmaster-status-badge');
    var dueDateCell = newRow.cells[3];
    var daysCell = newRow.cells[8];
    var taskNameCell = newRow.cells[0];
    if (checkbox && statusBadge && dueDateCell && daysCell && taskNameCell) {
        var newTask_1 = {
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
            checkbox: checkbox,
            statusBadge: statusBadge,
            dueDateCell: dueDateCell,
            daysCell: daysCell,
            taskNameCell: taskNameCell
        };
        tasks.push(newTask_1);
        var statusCell = statusBadge.parentElement;
        if (statusCell) {
            statusCell.style.cursor = 'pointer';
            statusCell.title = 'Click to change status';
            statusCell.addEventListener('click', function (e) {
                e.stopPropagation();
                showStatusChangeModal(newTask_1);
            });
        }
        var ownerCell = newRow.cells[5];
        var reviewerCell = newRow.cells[6];
        if (ownerCell)
            makeCellClickable(ownerCell, 'owner', newTask_1);
        if (reviewerCell)
            makeCellClickable(reviewerCell, 'reviewer', newTask_1);
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                statusBadge.innerText = "Completed";
                statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-completed";
            }
            else {
                statusBadge.innerText = "Not Started";
                statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-not-started";
            }
            updateCounts();
        });
        dueDateCell.addEventListener('blur', function () { return calculateDays(); });
        setTimeout(function () { return addCommentIcons(); }, 100);
        setTimeout(function () {
            taskAccounts.set(newRow, []);
        }, 100);
    }
    var editableCells = [newRow.cells[1], newRow.cells[3], newRow.cells[7]];
    editableCells.forEach(function (cell) {
        if (cell) {
            cell.classList.add('skystemtaskmaster-editable');
            cell.setAttribute('contenteditable', 'true');
        }
    });
    updateCounts();
    addDataCells();
    applyVisibility();
    setTimeout(function () {
        updateCDocColumn();
        updateTDocColumn();
    }, 100);
    showNotification("Task \"".concat(taskName, "\" added successfully"));
}
function createNewSubtask() {
    var subtaskName = document.getElementById('subtaskName').value.trim();
    if (!subtaskName) {
        alert('Please enter a subtask name');
        return;
    }
    var owner = document.getElementById('subtaskOwner').value;
    var reviewer = document.getElementById('subtaskReviewer').value;
    var tdoc = document.getElementById('subtaskTdoc').value;
    var subtaskHeader = document.querySelector('.skystemtaskmaster-subtask-header');
    if (subtaskHeader && subtaskHeader.parentNode) {
        var tbody = subtaskHeader.parentNode;
        var newRow = document.createElement('tr');
        newRow.className = 'subtask-row';
        var subtaskId = 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        newRow.setAttribute('data-subtask-id', subtaskId);
        var defaultStatus = "Not Started";
        var statusClass = 'skystemtaskmaster-status-not-started';
        newRow.innerHTML = "\n            <td colspan=\"3\">\n                <div class=\"skystemtaskmaster-task-name\">\n                    <input type=\"checkbox\" class=\"subtask-checkbox\">\n                    <span>".concat(escapeHtml(subtaskName), "</span>\n                </div>\n            </td>\n            <td></td>\n            <td class=\"tdoc-cell\">").concat(escapeHtml(tdoc), "</td>\n            <td>Set due date</td>\n            <td><span class=\"skystemtaskmaster-status-badge ").concat(statusClass, "\">").concat(defaultStatus, "</span></td>\n            <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(owner.toLowerCase(), "\">").concat(escapeHtml(owner), "</span></td>\n            <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(reviewer.toLowerCase(), "\">").concat(escapeHtml(reviewer), "</span></td>\n        ");
        var dueDateCell = newRow.cells[3];
        if (dueDateCell) {
            dueDateCell.classList.add('skystemtaskmaster-editable');
            dueDateCell.setAttribute('contenteditable', 'true');
        }
        if (subtaskHeader.nextSibling) {
            tbody.insertBefore(newRow, subtaskHeader.nextSibling);
        }
        else {
            tbody.appendChild(newRow);
        }
        taskDocuments.set(newRow, []);
        taskTDocDocuments.set(newRow, []);
        var checkbox_1 = newRow.querySelector('.subtask-checkbox');
        var statusBadge_1 = newRow.querySelector('.skystemtaskmaster-status-badge');
        var taskNameCell = newRow.cells[0];
        if (checkbox_1 && statusBadge_1 && taskNameCell) {
            var ownerCell = null;
            var reviewerCell = null;
            for (var i = 0; i < newRow.cells.length; i++) {
                var cell = newRow.cells[i];
                var badge = cell.querySelector('.skystemtaskmaster-badge');
                if (badge) {
                    if (!ownerCell)
                        ownerCell = cell;
                    else if (!reviewerCell)
                        reviewerCell = cell;
                }
            }
            var newSubtask_1 = {
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
                checkbox: checkbox_1,
                statusBadge: statusBadge_1,
                taskNameCell: taskNameCell,
                ownerCell: ownerCell || newRow.cells[newRow.cells.length - 2],
                reviewerCell: reviewerCell || newRow.cells[newRow.cells.length - 1]
            };
            subtasks.push(newSubtask_1);
            var statusCell = statusBadge_1.parentElement;
            if (statusCell) {
                statusCell.style.cursor = 'pointer';
                statusCell.title = 'Click to change status';
                statusCell.addEventListener('click', function (e) {
                    e.stopPropagation();
                    showSubtaskStatusChangeModal(newSubtask_1);
                });
            }
            if (ownerCell)
                makeCellClickable(ownerCell, 'owner', newSubtask_1);
            if (reviewerCell)
                makeCellClickable(reviewerCell, 'reviewer', newSubtask_1);
            checkbox_1.addEventListener('change', function () {
                if (checkbox_1.checked) {
                    statusBadge_1.innerText = "Completed";
                    statusBadge_1.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-completed";
                }
                else {
                    statusBadge_1.innerText = "Not Started";
                    statusBadge_1.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-not-started";
                }
                updateCounts();
            });
            if (dueDateCell) {
                dueDateCell.addEventListener('blur', function () {
                    console.log('Due date updated for subtask');
                });
            }
            setTimeout(function () { return addCommentIcons(); }, 100);
        }
        updateCounts();
        addDataCells();
        applyVisibility();
        setTimeout(function () {
            updateCDocColumn();
            updateTDocColumn();
        }, 100);
        var addSubtaskModal = document.getElementById('addSubtaskModal');
        if (addSubtaskModal)
            addSubtaskModal.style.display = 'none';
        document.getElementById('subtaskName').value = '';
        document.getElementById('subtaskOwner').value = 'PK';
        document.getElementById('subtaskReviewer').value = 'SM';
        document.getElementById('subtaskTdoc').value = '';
        showNotification("Subtask \"".concat(subtaskName, "\" added successfully"));
        setTimeout(function () { return saveAllData(); }, 100);
    }
}
function addCommentIcons() {
    document.querySelectorAll('.comment-icon').forEach(function (icon) { return icon.remove(); });
    updateCommentColumn();
}
function initializeThreeDotsMenu() {
    var _a, _b;
    var threeDotsBtn = document.getElementById('threeDotsBtn');
    var dropdown = document.getElementById('threeDotsDropdown');
    if (!threeDotsBtn || !dropdown)
        return;
    threeDotsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    document.addEventListener('click', function (e) {
        if (!threeDotsBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    document.querySelectorAll('.submenu-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            var format = item.getAttribute('data-format');
            if (format)
                handleDownload(format);
            dropdown.classList.remove('show');
        });
    });
    var filterOption = document.getElementById('dropdownFilter');
    if (filterOption) {
        filterOption.addEventListener('click', function (e) {
            e.stopPropagation();
            showFilterPanel();
            dropdown.classList.remove('show');
        });
    }
    else {
        var filterItem = Array.from(document.querySelectorAll('.dropdown-item')).find(function (item) { var _a; return (_a = item.textContent) === null || _a === void 0 ? void 0 : _a.includes('Filter'); });
        if (filterItem) {
            filterItem.addEventListener('click', function (e) {
                e.stopPropagation();
                showFilterPanel();
                dropdown.classList.remove('show');
            });
        }
    }
    (_a = document.getElementById('dropdownDelete')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        deleteSelectedItems();
        dropdown.classList.remove('show');
    });
    (_b = document.getElementById('dropdownCustomGrid')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        showCustomizeGridModal();
        dropdown.classList.remove('show');
    });
}
function handleDownload(format) {
    switch (format) {
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
function downloadAsExcel() {
    var _a;
    var table = document.getElementById('mainTable');
    if (!table)
        return;
    var csv = [];
    var rows = table.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var cells = row.querySelectorAll('th, td');
        var rowData = [];
        for (var j = 0; j < cells.length; j++) {
            var cell = cells[j];
            if (cell.style.display === 'none')
                continue;
            var text = ((_a = cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            text = text.replace(/[☑⬇]/g, '').trim();
            rowData.push('"' + text + '"');
        }
        if (rowData.length > 0)
            csv.push(rowData.join(','));
    }
    var blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.csv';
    a.click();
    showNotification('Downloaded as Excel format');
}
function downloadAsCsv() {
    downloadAsExcel();
    showNotification('Downloaded as CSV');
}
function downloadAsJson() {
    var _a;
    var table = document.getElementById('mainTable');
    if (!table)
        return;
    var data = [];
    var rows = table.querySelectorAll('tr');
    var headers = [];
    var headerRow = rows[0].querySelectorAll('th');
    headerRow.forEach(function (th) {
        var _a;
        if (th.style.display !== 'none') {
            headers.push(((_a = th.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '');
        }
    });
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var cells = row.querySelectorAll('td');
        var rowData = {};
        var cellIndex = 0;
        for (var j = 0; j < cells.length; j++) {
            var cell = cells[j];
            if (cell.style.display !== 'none' && cellIndex < headers.length) {
                var value = ((_a = cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                value = value.replace(/[☑⬇]/g, '').trim();
                rowData[headers[cellIndex]] = value;
                cellIndex++;
            }
        }
        if (Object.keys(rowData).length > 0) {
            data.push(rowData);
        }
    }
    var jsonStr = JSON.stringify(data, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.json';
    a.click();
    showNotification('Downloaded as JSON');
}
function showFilterPanel() {
    var _a, _b, _c;
    var existingModal = document.getElementById('filterModal');
    if (existingModal)
        existingModal.remove();
    var filterModal = document.createElement('div');
    filterModal.id = 'filterModal';
    filterModal.className = 'modal';
    filterModal.innerHTML = "\n        <div class=\"modal-content\" style=\"width: 450px;\">\n            <span class=\"close\">&times;</span>\n            <h3 class=\"cdoc-header\"><i class=\"fas fa-filter\"></i> Filter Tasks</h3>\n            \n            <div class=\"sort-body\">\n                <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                    <label class=\"form-label\" style=\"display: block; margin-bottom: 5px;\">Status</label>\n                    <select id=\"filterStatus\" class=\"sort-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        <option value=\"all\">All</option>\n                        <option value=\"Not Started\">Not Started</option>\n                        <option value=\"In Progress\">In Progress</option>\n                        <option value=\"Completed\">Completed</option>\n                        <option value=\"Review\">Review</option>\n                        <option value=\"Approved\">Approved</option>\n                        <option value=\"Rejected\">Rejected</option>\n                        <option value=\"Hold\">Hold</option>\n                        <option value=\"Overdue\">Overdue</option>\n                    </select>\n                </div>\n                \n                <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                    <label class=\"form-label\" style=\"display: block; margin-bottom: 5px;\">Task Owner</label>\n                    <select id=\"filterOwner\" class=\"sort-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        <option value=\"all\">All</option>\n                        <option value=\"PK\">PK</option>\n                        <option value=\"SM\">SM</option>\n                        <option value=\"MP\">MP</option>\n                        <option value=\"PP\">PP</option>\n                        <option value=\"JS\">JS</option>\n                        <option value=\"EW\">EW</option>\n                        <option value=\"DB\">DB</option>\n                    </select>\n                </div>\n                \n                <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                    <label class=\"form-label\" style=\"display: block; margin-bottom: 5px;\">Due Date</label>\n                    <select id=\"filterDueDate\" class=\"sort-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        <option value=\"all\">All</option>\n                        <option value=\"overdue\">Overdue</option>\n                        <option value=\"today\">Today</option>\n                        <option value=\"week\">Next 7 days</option>\n                        <option value=\"month\">Next 30 days</option>\n                        <option value=\"future\">Beyond 30 days</option>\n                    </select>\n                </div>\n\n                <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                    <label class=\"form-label\" style=\"display: block; margin-bottom: 5px;\">Recurrence Type</label>\n                    <select id=\"filterRecurrence\" class=\"sort-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        <option value=\"all\">All</option>\n                        <option value=\"none\">Non-Recurring (None)</option>\n                        <option value=\"recurring\">Recurring (All Types)</option>\n                        <option value=\"Every Period\">Every Period</option>\n                        <option value=\"Quarterly\">Quarterly</option>\n                        <option value=\"Annual\">Annual</option>\n                    </select>\n                </div>\n\n                <div class=\"filter-options-container\" style=\"margin-bottom: 15px;\">\n                    <label class=\"filter-checkbox-group\" style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 8px;\">\n                        <input type=\"checkbox\" id=\"hideEmptyLists\">\n                        <span>Hide empty lists/sublists</span>\n                    </label>\n                    <label class=\"filter-checkbox-group\" style=\"display: flex; align-items: center; gap: 8px;\">\n                        <input type=\"checkbox\" id=\"showTaskCount\">\n                        <span>Show filtered task count in lists</span>\n                    </label>\n                </div>\n            </div>\n            \n            <div class=\"modal-footer\" style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;\">\n                <button id=\"clearFilterBtn\" class=\"btn-secondary\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">\uD83D\uDDD1 Clear All</button>\n                <button id=\"applyFilterBtn\" class=\"btn-primary\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Apply Filter</button>\n            </div>\n        </div>\n    ";
    document.body.appendChild(filterModal);
    document.getElementById('filterStatus').value = currentFilters.status;
    document.getElementById('filterOwner').value = currentFilters.owner;
    document.getElementById('filterDueDate').value = currentFilters.dueDate;
    document.getElementById('filterRecurrence').value = currentFilters.recurrence;
    document.getElementById('hideEmptyLists').checked = currentFilters.hideEmptyLists;
    document.getElementById('showTaskCount').checked = currentFilters.showTaskCount;
    var close = function () { return filterModal.remove(); };
    (_a = filterModal.querySelector('.close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close);
    (_b = document.getElementById('applyFilterBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        currentFilters = {
            status: document.getElementById('filterStatus').value,
            owner: document.getElementById('filterOwner').value,
            reviewer: 'all',
            dueDate: document.getElementById('filterDueDate').value,
            recurrence: document.getElementById('filterRecurrence').value,
            hideEmptyLists: document.getElementById('hideEmptyLists').checked,
            showTaskCount: document.getElementById('showTaskCount').checked
        };
        applyHierarchicalFilters();
        close();
        showNotification('Filters applied');
    });
    (_c = document.getElementById('clearFilterBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
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
        showNotification('Filters cleared');
    });
    filterModal.style.display = 'block';
}
function applyHierarchicalFilters() {
    console.log('Applying hierarchical filters:', currentFilters);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    var oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    var taskMatches = new Map();
    tasks.forEach(function (task) {
        var _a, _b, _c, _d, _e, _f;
        var matches = true;
        if (currentFilters.status !== 'all') {
            var taskStatus = ((_b = (_a = task.statusBadge) === null || _a === void 0 ? void 0 : _a.innerText) === null || _b === void 0 ? void 0 : _b.trim()) || task.status || 'Not Started';
            if (taskStatus !== currentFilters.status)
                matches = false;
        }
        if (matches && currentFilters.owner !== 'all') {
            var ownerBadge = (_d = (_c = task.row) === null || _c === void 0 ? void 0 : _c.cells[5]) === null || _d === void 0 ? void 0 : _d.querySelector('.skystemtaskmaster-badge');
            var ownerText = ((_e = ownerBadge === null || ownerBadge === void 0 ? void 0 : ownerBadge.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || task.taskOwner || task.owner || '';
            if (ownerText !== currentFilters.owner)
                matches = false;
        }
        if (matches && currentFilters.dueDate !== 'all') {
            var dueText = ((_f = task.dueDateCell) === null || _f === void 0 ? void 0 : _f.innerText) || task.dueDate || '';
            if (dueText !== 'Set due date' && dueText !== '') {
                try {
                    var dueDate = new Date(dueText);
                    dueDate.setHours(0, 0, 0, 0);
                    if (currentFilters.dueDate === 'overdue') {
                        if (dueDate >= today)
                            matches = false;
                    }
                    else if (currentFilters.dueDate === 'today') {
                        if (dueDate.getTime() !== today.getTime())
                            matches = false;
                    }
                    else if (currentFilters.dueDate === 'week') {
                        if (dueDate < today || dueDate > oneWeekLater)
                            matches = false;
                    }
                    else if (currentFilters.dueDate === 'month') {
                        if (dueDate < today || dueDate > oneMonthLater)
                            matches = false;
                    }
                    else if (currentFilters.dueDate === 'future') {
                        if (dueDate <= oneMonthLater)
                            matches = false;
                    }
                }
                catch (e) {
                    console.log('Error parsing due date:', dueText);
                }
            }
            else if (currentFilters.dueDate !== 'all') {
                matches = false;
            }
        }
        if (matches && currentFilters.recurrence && currentFilters.recurrence !== 'all') {
            var recurrenceType = task.recurrenceType || 'None';
            if (currentFilters.recurrence === 'none') {
                if (recurrenceType !== 'None')
                    matches = false;
            }
            else if (currentFilters.recurrence === 'recurring') {
                var recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
                if (!recurringOptions.includes(recurrenceType))
                    matches = false;
            }
            else {
                if (recurrenceType !== currentFilters.recurrence)
                    matches = false;
            }
        }
        taskMatches.set(task.id, matches);
        if (task.row) {
            task.row.style.display = matches ? '' : 'none';
        }
    });
    subtasks.forEach(function (subtask) {
        var _a, _b, _c, _d, _e;
        var matches = true;
        if (currentFilters.status !== 'all') {
            var taskStatus = ((_b = (_a = subtask.statusBadge) === null || _a === void 0 ? void 0 : _a.innerText) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            if (taskStatus !== currentFilters.status)
                matches = false;
        }
        if (matches && currentFilters.owner !== 'all') {
            var ownerBadge = (_c = subtask.ownerCell) === null || _c === void 0 ? void 0 : _c.querySelector('.skystemtaskmaster-badge');
            var ownerText = ((_d = ownerBadge === null || ownerBadge === void 0 ? void 0 : ownerBadge.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            if (ownerText !== currentFilters.owner)
                matches = false;
        }
        if (matches && currentFilters.dueDate !== 'all') {
            var dueDateCell = (_e = subtask.row) === null || _e === void 0 ? void 0 : _e.cells[3];
            if (dueDateCell) {
                var dueText = dueDateCell.innerText;
                if (dueText !== 'Set due date') {
                    try {
                        var dueDate = new Date(dueText);
                        dueDate.setHours(0, 0, 0, 0);
                        if (currentFilters.dueDate === 'overdue' && dueDate >= today)
                            matches = false;
                        else if (currentFilters.dueDate === 'today' && dueDate.getTime() !== today.getTime())
                            matches = false;
                        else if (currentFilters.dueDate === 'week') {
                            if (dueDate < today || dueDate > oneWeekLater)
                                matches = false;
                        }
                        else if (currentFilters.dueDate === 'month') {
                            if (dueDate < today || dueDate > oneMonthLater)
                                matches = false;
                        }
                        else if (currentFilters.dueDate === 'future') {
                            if (dueDate <= oneMonthLater)
                                matches = false;
                        }
                    }
                    catch (e) {
                        console.log('Error parsing subtask date:', dueText);
                    }
                }
                else if (currentFilters.dueDate !== 'all') {
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
function clearAllFilters() {
    tasks.forEach(function (task) {
        if (task.row)
            task.row.style.display = '';
    });
    subtasks.forEach(function (subtask) {
        if (subtask.row)
            subtask.row.style.display = '';
    });
    mainLists.forEach(function (mainList) {
        if (mainList.row)
            mainList.row.style.display = '';
    });
    subLists.forEach(function (subList) {
        if (subList.row)
            subList.row.style.display = '';
    });
    document.querySelectorAll('.task-count-badge, .list-count-badge').forEach(function (badge) {
        badge.remove();
    });
    console.log('All filters cleared');
}
function showCustomizeGridModal() {
    var _a, _b, _c;
    var modal = document.getElementById('customizeGridModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customizeGridModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 500px;\">\n                <span class=\"close\">&times;</span>\n                <h3 class=\"cdoc-header\">Customize Grid Columns</h3>\n                \n                <div class=\"grid-config-container\">\n                    <div class=\"grid-selection-layout\" id=\"columnChecklist\">\n                        ".concat(columnConfig.map(function (col) { return "\n                            <div class=\"column-option\" style=\"margin-bottom: 10px;\">\n                                <input type=\"checkbox\" id=\"col_".concat(col.key, "\" ").concat(col.visible ? 'checked' : '', " ").concat(col.mandatory ? 'disabled' : '', ">\n                                <label for=\"col_").concat(col.key, "\">").concat(col.label).concat(!col.forSubtask ? ' (tasks only)' : '', "</label>\n                            </div>\n                        "); }).join(''), "\n                    </div>\n                </div>\n                \n                <div class=\"modal-footer\" style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;\">\n                    <button id=\"resetGridBtn\" class=\"btn-secondary\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Reset to Default</button>\n                    <button id=\"saveGridBtn\" class=\"btn-primary\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Save Changes</button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(modal);
        var close_1 = function () { return modal.style.display = 'none'; };
        (_a = modal.querySelector('.close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close_1);
        (_b = document.getElementById('saveGridBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
            columnConfig.forEach(function (col) {
                var checkbox = document.getElementById("col_".concat(col.key));
                if (checkbox && !col.mandatory) {
                    col.visible = checkbox.checked;
                }
            });
            saveColumnVisibility();
            refreshGridUI();
            close_1();
            showNotification('Grid layout updated successfully!');
        });
        (_c = document.getElementById('resetGridBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
            var defaults = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
            columnConfig.forEach(function (col) {
                col.visible = defaults.includes(col.key);
            });
            columnConfig.forEach(function (col) {
                var checkbox = document.getElementById("col_".concat(col.key));
                if (checkbox && !col.mandatory) {
                    checkbox.checked = col.visible;
                }
            });
        });
    }
    modal.style.display = 'block';
}
function saveColumnVisibility() {
    var visibilityState = {};
    columnConfig.forEach(function (col) {
        visibilityState[col.key] = col.visible;
    });
    localStorage.setItem('columnVisibility', JSON.stringify(visibilityState));
    console.log('Column visibility saved:', visibilityState);
}
function refreshGridUI() {
    addExtraColumns();
    addDataCells();
    applyVisibility();
    updateSublistRowsColspan();
}
function showCreateSubListModal(mainList) {
    var _a;
    var modal = document.getElementById('createSubListModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createSubListModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content modal-content-small\" style=\"width: 350px;\">\n                <span class=\"close\">&times;</span>\n                <h3 class=\"cdoc-header sublist-modal-title\">Create Sub List</h3>\n                \n                <div style=\"margin: 20px 0;\">\n                    <label class=\"form-label\" style=\"display: block; margin-bottom: 5px;\">Sub List Name</label>\n                    <input type=\"text\" id=\"subListNameInput\" class=\"task-input\" \n                           placeholder=\"e.g. Phase 1, Q1 Review...\" \n                           style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;\">\n                    \n                    <button id=\"createSubListBtn\" class=\"btn-primary\" style=\"width: 100%; padding: 10px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">\n                        Create Sub List\n                    </button>\n                </div>\n            </div>\n        ";
        document.body.appendChild(modal);
        var close_2 = function () { return modal.style.display = 'none'; };
        (_a = modal.querySelector('.close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close_2);
        var input_1 = document.getElementById('subListNameInput');
        var createBtn = document.getElementById('createSubListBtn');
        var handleSubmit_1 = function () {
            var mainListId = modal.getAttribute('data-current-mainlist-id');
            var targetMainList = mainLists.find(function (m) { return m.id === mainListId; });
            if (!targetMainList) {
                showNotification('Error: Main list context lost', 'error');
                return;
            }
            var subListName = input_1.value.trim();
            if (subListName) {
                createSubList(targetMainList, subListName);
                close_2();
            }
            else {
                showNotification('Please enter a name for the sub list', 'info');
                input_1.focus();
            }
        };
        createBtn === null || createBtn === void 0 ? void 0 : createBtn.addEventListener('click', handleSubmit_1);
        input_1.addEventListener('keydown', function (e) {
            if (e.key === 'Enter')
                handleSubmit_1();
        });
    }
    modal.setAttribute('data-current-mainlist-id', mainList.id);
    var titleEl = modal.querySelector('.sublist-modal-title');
    if (titleEl)
        titleEl.textContent = "New Sub List for \"".concat(mainList.name, "\"");
    modal.style.display = 'block';
    setTimeout(function () {
        var input = document.getElementById('subListNameInput');
        if (input)
            input.focus();
    }, 100);
}
function showCreateTaskForMainList(mainList) {
    showCreateTaskModalForList(mainList, null);
}
function showCreateTaskModalForList(mainList, subList) {
    var _a, _b, _c;
    if (subList === void 0) { subList = null; }
    var existingModal = document.getElementById('createTaskCompleteModal');
    if (existingModal)
        existingModal.remove();
    var randomID = "TSK-".concat(Math.floor(1000 + Math.random() * 9000));
    var modal = document.createElement('div');
    modal.id = 'createTaskCompleteModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    var path = subList ? "".concat(mainList.name, " > ").concat(subList.name) : mainList.name;
    modal.innerHTML = "\n        <div class=\"modal-content animate-slide-down\" style=\"width: 800px; padding: 0; border-radius: 12px;\">\n            <div class=\"modal-header-gradient\" style=\"background: linear-gradient(135deg, #ff0080, #ff4d9e); padding: 15px 20px; color: white; border-radius: 12px 12px 0 0;\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n                    <h3 style=\"margin: 0;\"><i class=\"fa-solid fa-plus-circle\"></i> Create Task</h3>\n                    <span class=\"close\" style=\"color: white; cursor: pointer;\">&times;</span>\n                </div>\n                <p style=\"margin: 5px 0 0; font-size: 13px; opacity: 0.9;\">Context: ".concat(escapeHtml(path), "</p>\n            </div>\n            \n            <div style=\"padding: 20px; max-height: 75vh; overflow-y: auto;\">\n                <div class=\"modal-section\" style=\"margin-bottom: 20px;\">\n                    <h4 class=\"modal-section-title\" style=\"color: #ff0080; margin-bottom: 10px;\"><i class=\"fa-solid fa-info-circle\"></i> Basic Details</h4>\n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px;\">\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Task Name *</label>\n                            <input type=\"text\" id=\"createTaskName\" class=\"task-input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"What needs to be done?\">\n                        </div>\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Task Number</label>\n                            <input type=\"text\" id=\"createTaskNumber\" class=\"task-input\" value=\"").concat(randomID, "\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                    </div>\n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;\">\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Dependency</label>\n                            <select id=\"createTaskDependent\" class=\"task-input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"\">No dependency</option>\n                                ").concat(getTaskOptionsForDropdown(), "\n                            </select>\n                        </div>\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Owner</label>\n                            <select id=\"createTaskOwner\" class=\"task-input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK - Palakh Khanna</option>\n                                <option value=\"SM\">SM - Sarah Miller</option>\n                                <option value=\"MP\">MP - Mel Preparer</option>\n                                <option value=\"PP\">PP - Poppy Pan</option>\n                            </select>\n                        </div>\n                    </div>\n                </div>\n\n                <div class=\"modal-section\" style=\"margin-bottom: 20px;\">\n                    <h4 class=\"modal-section-title\" style=\"color: #ff0080; margin-bottom: 10px;\"><i class=\"fa-solid fa-calendar-day\"></i> Logistics & Dates</h4>\n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px;\">\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Due Date</label>\n                            <input type=\"date\" id=\"createTaskDueDate\" class=\"task-input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Recurrence</label>\n                            <select id=\"createTaskRecurrenceType\" class=\"task-input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"None\">None</option>\n                                <option value=\"Daily\">Daily</option>\n                                <option value=\"Weekly\">Weekly</option>\n                                <option value=\"Monthly\">Monthly</option>\n                            </select>\n                        </div>\n                    </div>\n                </div>\n\n                <div class=\"modal-section\" style=\"margin-bottom: 20px;\">\n                    <h4 class=\"modal-section-title\" style=\"color: #ff0080; margin-bottom: 10px;\"><i class=\"fa-solid fa-comment-dots\"></i> Additional Info</h4>\n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px;\">\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">TDoc (Task Document)</label>\n                            <input type=\"text\" id=\"createTaskTdoc\" class=\"task-input\" value=\"0\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">CDoc (Completion Document)</label>\n                            <input type=\"text\" id=\"createTaskCdoc\" class=\"task-input\" value=\"0\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                    </div>\n                    <div class=\"form-group\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Internal Comment</label>\n                        <textarea id=\"createTaskComment\" class=\"task-input\" rows=\"2\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\"></textarea>\n                    </div>\n                </div>\n\n                <div style=\"display: flex; justify-content: flex-end; gap: 12px; padding-top: 10px;\">\n                    <button class=\"btn-secondary\" id=\"cancelCreateTaskBtn\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Cancel</button>\n                    <button class=\"btn-primary\" id=\"submitCreateTaskBtn\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">\n                        <i class=\"fa-solid fa-check\"></i> Create Task\n                    </button>\n                </div>\n            </div>\n        </div>\n    ");
    document.body.appendChild(modal);
    setTimeout(function () {
        var nameInput = document.getElementById('createTaskName');
        if (nameInput)
            nameInput.focus();
    }, 150);
    var close = function () { return modal.remove(); };
    (_a = modal.querySelector('.close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close);
    (_b = document.getElementById('cancelCreateTaskBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal)
        close(); });
    (_c = document.getElementById('submitCreateTaskBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
        var name = document.getElementById('createTaskName').value.trim();
        if (!name) {
            showNotification('Please provide a task name', 'error');
            document.getElementById('createTaskName').focus();
            return;
        }
        var taskData = {
            name: name,
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
        var targetSubList = subList;
        if (!targetSubList) {
            targetSubList = mainList.subLists.length > 0
                ? mainList.subLists[0]
                : createSubList(mainList, 'Tasks');
        }
        var newTask = createTask(targetSubList, taskData);
        if (taskData.dependentTask) {
            dependentTasks.set(newTask.id, taskData.dependentTask);
        }
        showNotification("Task \"".concat(taskData.name, "\" added to ").concat(targetSubList.name));
        close();
    });
}
function getTaskOptionsForDropdown() {
    if (!tasks || tasks.length === 0)
        return '';
    var options = '';
    tasks.forEach(function (task) {
        var displayText = task.taskNumber || task.name || "Task ".concat(task.id);
        options += "<option value=\"".concat(task.id, "\">").concat(escapeHtml(displayText), "</option>");
    });
    return options;
}
function createSampleData() {
    var mainList = createMainList('Yearly Report 2025');
    setTimeout(function () {
        var subList = createSubList(mainList, 'Monthly Report - January');
        setTimeout(function () {
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
function initializeStatusSync() {
    setTimeout(function () {
        syncAllTaskStatusColumns();
    }, 1000);
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                clearTimeout(window.statusSyncTimeout);
                window.statusSyncTimeout = setTimeout(function () {
                    syncAllTaskStatusColumns();
                }, 200);
            }
        });
    });
    var tbody = document.getElementById('mainTableBody');
    if (tbody) {
        observer.observe(tbody, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
    }
}
function syncAllTaskStatusColumns() {
    console.log('Syncing all task status columns...');
    tasks.forEach(function (task) {
        if (task.row && task.statusBadge) {
            var currentStatus = task.statusBadge.innerText;
            updateTaskStatusExtraColumn(task.row, currentStatus);
            if (task.status !== undefined) {
                task.status = currentStatus;
            }
            if (task.taskStatus !== undefined) {
                task.taskStatus = currentStatus;
            }
        }
    });
    subtasks.forEach(function (subtask) {
        if (subtask.row && subtask.statusBadge) {
            var currentStatus = subtask.statusBadge.innerText;
            updateTaskStatusExtraColumn(subtask.row, currentStatus);
            if (subtask.taskStatus !== undefined) {
                subtask.taskStatus = currentStatus;
            }
        }
    });
    console.log('Status sync complete');
}
function initializeTaskStatus() {
    console.log('Initializing Task Status column...');
    var style = document.createElement('style');
    style.textContent = "\n        .extra-cell[data-column=\"taskStatus\"] {\n            cursor: pointer;\n            transition: all 0.2s;\n            font-weight: 500;\n        }\n        \n        .extra-cell[data-column=\"taskStatus\"]:hover {\n            background-color: #fff0f5 !important;\n            transform: scale(1.02);\n            font-weight: bold;\n        }\n        \n        .extra-cell[data-column=\"taskStatus\"]:empty:before {\n            content: \"Not Started\";\n            color: #999;\n        }\n    ";
    document.head.appendChild(style);
    setTimeout(function () {
        makeAllStatusClickable();
    }, 1000);
}
function makeAllStatusClickable() {
    tasks.forEach(function (task) {
        var _a;
        if (task.statusBadge) {
            task.statusBadge.style.cursor = 'pointer';
            task.statusBadge.title = 'Click to change status';
            var newBadge = task.statusBadge.cloneNode(true);
            (_a = task.statusBadge.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newBadge, task.statusBadge);
            newBadge.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                showStatusChangeModal(task);
            });
            task.statusBadge = newBadge;
        }
    });
    subtasks.forEach(function (subtask) {
        var _a;
        if (subtask.statusBadge) {
            subtask.statusBadge.style.cursor = 'pointer';
            subtask.statusBadge.title = 'Click to change status';
            var newBadge = subtask.statusBadge.cloneNode(true);
            (_a = subtask.statusBadge.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newBadge, subtask.statusBadge);
            newBadge.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                showSubtaskStatusChangeModal(subtask);
            });
            subtask.statusBadge = newBadge;
        }
    });
    setTimeout(function () {
        document.querySelectorAll('.extra-cell[data-column="taskStatus"]').forEach(function (cell) {
            var row = cell.closest('tr');
            if (!row)
                return;
            var task = tasks.find(function (t) { return t.row === row; });
            var subtask = subtasks.find(function (s) { return s.row === row; });
            if (task || subtask) {
                makeStatusCellClickable(cell, (task || subtask));
            }
        });
    }, 200);
}
function initializeUserSystem() {
    console.log('Initializing user system...');
    addUserStyles();
    setTimeout(function () {
        makeOwnerReviewerClickable();
        console.log('User system ready');
    }, 500);
}
function initializeDocumentManager() {
    addDocumentStyles();
    updateCDocColumn();
}
function initializeTDocManager() {
    addTDocStyles();
    updateTDocColumn();
}
function initializeRecurrenceEditor() {
    console.log('Initializing Recurrence Type Editor...');
    addRecurrenceStyles();
    makeRecurrenceCellsClickable();
    setTimeout(function () {
        console.log('Retry 1: Making recurrence cells clickable');
        makeRecurrenceCellsClickable();
    }, 500);
    setTimeout(function () {
        console.log('Retry 2: Making recurrence cells clickable');
        makeRecurrenceCellsClickable();
    }, 1000);
    setTimeout(function () {
        console.log('Retry 3: Making recurrence cells clickable');
        makeRecurrenceCellsClickable();
    }, 2000);
    var observer = new MutationObserver(function (mutations) {
        var shouldRetry = false;
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                shouldRetry = true;
            }
        });
        if (shouldRetry) {
            setTimeout(function () {
                makeRecurrenceCellsClickable();
            }, 100);
        }
    });
    var tbody = document.getElementById('mainTableBody');
    if (tbody) {
        observer.observe(tbody, { childList: true, subtree: true });
        console.log('Observer attached to tbody');
    }
}
function initializeSortingWithIcons() {
    console.log('Initializing sorting with icons...');
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'sorting-styles.css';
    document.head.appendChild(link);
    setTimeout(function () {
        initializeColumnSorting();
    }, 500);
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(function () {
                    initializeColumnSorting();
                }, 100);
            }
        });
    });
    var container = document.getElementById('mainTableContainer');
    if (container) {
        observer.observe(container, { childList: true, subtree: true });
    }
}
function initializeFileImport() {
    console.log('Initializing file import...');
    var dropArea = document.getElementById('importDropArea');
    var fileInput = document.getElementById('importFileInput');
    var browseBtn = document.getElementById('importBrowseFileBtn');
    var cancelBtn = document.getElementById('cancelImportBtn');
    var processBtn = document.getElementById('processImportBtn');
    var previewArea = document.getElementById('importPreviewArea');
    var previewBody = document.getElementById('importPreviewBody');
    if (!dropArea || !fileInput || !browseBtn || !cancelBtn || !processBtn)
        return;
    var importedTasksData = [];
    browseBtn.addEventListener('click', function () {
        fileInput.click();
    });
    fileInput.addEventListener('change', function (e) {
        var files = fileInput.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    });
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropArea.classList.add('drag-over');
    });
    dropArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
    });
    dropArea.addEventListener('drop', function (e) {
        var _a;
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        var files = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    });
    cancelBtn.addEventListener('click', function () {
        resetImportModal();
        var importTasksModal = document.getElementById('importTasksModal');
        if (importTasksModal)
            importTasksModal.style.display = 'none';
    });
    processBtn.addEventListener('click', function () {
        importTasks();
    });
    function processFile(file) {
        var _a;
        console.log('Processing file:', file.name);
        var fileExtension = (_a = file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (fileExtension === 'csv') {
            parseCSV(file);
        }
        else if (fileExtension === 'json') {
            parseJSON(file);
        }
        else if (fileExtension === 'txt') {
            parseTXT(file);
        }
        else {
            alert('Unsupported file format. Please use CSV, JSON, or TXT.');
        }
    }
    function parseCSV(file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            var content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            var lines = content.split('\n');
            var headers = lines[0].split(',').map(function (h) { return h.trim().toLowerCase(); });
            var taskNameIndex = headers.findIndex(function (h) { return h.includes('task') || h.includes('name'); });
            var ownerIndex = headers.findIndex(function (h) { return h.includes('owner'); });
            var reviewerIndex = headers.findIndex(function (h) { return h.includes('reviewer'); });
            var dueDateIndex = headers.findIndex(function (h) { return h.includes('due') || h.includes('date'); });
            importedTasksData = [];
            for (var i = 1; i < lines.length; i++) {
                if (!lines[i].trim())
                    continue;
                var values = lines[i].split(',').map(function (v) { return v.trim(); });
                var task = {
                    name: values[taskNameIndex] || "Task ".concat(i),
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
        var reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            try {
                var content = JSON.parse((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
                if (Array.isArray(content)) {
                    importedTasksData = content.map(function (item) { return ({
                        name: item.name || item.taskName || item.task || 'Unnamed Task',
                        owner: item.owner || item.taskOwner || 'PK',
                        reviewer: item.reviewer || 'SM',
                        dueDate: item.dueDate || item.due || '',
                        acc: item.acc || '+',
                        tdoc: item.tdoc || item.tDoc || '0',
                        status: item.status || item.taskStatus || 'Not Started'
                    }); });
                }
                else if (content.tasks && Array.isArray(content.tasks)) {
                    importedTasksData = content.tasks.map(function (item) { return ({
                        name: item.name || item.taskName || 'Unnamed Task',
                        owner: item.owner || 'PK',
                        reviewer: item.reviewer || 'SM',
                        dueDate: item.dueDate || '',
                        acc: item.acc || '+',
                        tdoc: item.tdoc || '0',
                        status: item.status || 'Not Started'
                    }); });
                }
                showPreview(importedTasksData);
            }
            catch (error) {
                alert('Invalid JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    function parseTXT(file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            var content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            var lines = content.split('\n');
            importedTasksData = lines
                .filter(function (line) { return line.trim(); })
                .map(function (line, index) { return ({
                name: line.trim(),
                owner: 'PK',
                reviewer: 'SM',
                dueDate: '',
                acc: '+',
                tdoc: '0',
                status: 'Not Started'
            }); });
            showPreview(importedTasksData);
        };
        reader.readAsText(file);
    }
    function showPreview(tasks) {
        if (!previewBody || !previewArea)
            return;
        previewArea.style.display = 'block';
        processBtn.disabled = false;
        var previewHtml = tasks.slice(0, 5).map(function (task) { return "\n            <tr class=\"preview-row\">\n                <td class=\"preview-cell\">".concat(escapeHtml(task.name), "</td>\n                <td class=\"preview-cell\">").concat(escapeHtml(task.owner), "</td>\n                <td class=\"preview-cell\">").concat(escapeHtml(task.reviewer), "</td>\n                <td class=\"preview-cell\">").concat(escapeHtml(task.dueDate || 'Not set'), "</td>\n            </tr>\n        "); }).join('');
        if (tasks.length > 5) {
            previewBody.innerHTML = previewHtml + "\n                <tr class=\"preview-more-row\">\n                    <td colspan=\"4\" class=\"preview-more-cell\">\n                        ... and ".concat(tasks.length - 5, " more tasks\n                    </td>\n                </tr>\n            ");
        }
        else {
            previewBody.innerHTML = previewHtml;
        }
        var countDisplay = document.createElement('div');
        countDisplay.id = 'importPreviewCount';
        countDisplay.className = 'preview-count';
        countDisplay.textContent = "Total ".concat(tasks.length, " task(s) ready to import");
        var existingCount = document.getElementById('importPreviewCount');
        if (existingCount)
            existingCount.remove();
        previewArea.appendChild(countDisplay);
    }
    function importTasks() {
        var _a, _b;
        if (importedTasksData.length === 0) {
            alert('No tasks to import');
            return;
        }
        var importTarget = (_a = document.querySelector('input[name="importTarget"]:checked')) === null || _a === void 0 ? void 0 : _a.value;
        var skipDuplicates = (_b = document.getElementById('skipDuplicates')) === null || _b === void 0 ? void 0 : _b.checked;
        if (importTarget === 'newList') {
            var listName = prompt('Enter name for new list:', 'Imported Tasks ' + new Date().toLocaleDateString());
            if (!listName)
                return;
            var targetList_1 = createMainList(listName);
            setTimeout(function () {
                var subList = createSubList(targetList_1, 'Imported Tasks');
                importTasksToSublist(subList, importedTasksData, skipDuplicates);
            }, 100);
        }
        else {
            if (subLists.length === 0) {
                alert('Please create a list first');
                return;
            }
            var targetSublist = subLists[subLists.length - 1];
            importTasksToSublist(targetSublist, importedTasksData, skipDuplicates);
        }
        resetImportModal();
        var importTasksModal = document.getElementById('importTasksModal');
        if (importTasksModal)
            importTasksModal.style.display = 'none';
        showNotification("Successfully imported ".concat(importedTasksData.length, " tasks!"));
    }
    function importTasksToSublist(sublist, tasks, skipDuplicates) {
        var existingTaskNames = sublist.tasks.map(function (t) { return t.name.toLowerCase(); });
        tasks.forEach(function (taskData) {
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
        if (previewArea)
            previewArea.style.display = 'none';
        if (previewBody)
            previewBody.innerHTML = '';
        processBtn.disabled = true;
        fileInput.value = '';
    }
}
function initializeDeleteButton() {
    var buttons = document.querySelectorAll('.skystemtaskmaster-action-btn');
    buttons.forEach(function (button) {
        var text = button.textContent || '';
        if (text.indexOf('🗑') !== -1 || text.indexOf('Delete') !== -1) {
            button.addEventListener('click', function () {
                deleteSelectedItems();
            });
        }
    });
}
function makeExistingTasksEditable() {
    tasks.forEach(function (task) {
        var _a, _b, _c;
        var cells = [(_a = task.row) === null || _a === void 0 ? void 0 : _a.cells[1], (_b = task.row) === null || _b === void 0 ? void 0 : _b.cells[3], (_c = task.row) === null || _c === void 0 ? void 0 : _c.cells[7]];
        cells.forEach(function (cell) {
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
document.addEventListener('DOMContentLoaded', function () {
    addStyles();
    addSeparateTableStyles();
    addSortStyles();
    loadColumnVisibility();
    createModals();
    initializeData();
    initializeCleanStructure();
    initializeEventListeners();
    setTimeout(function () {
        addExtraColumns();
        addDataCells();
        updateCounts();
        calculateDays();
        initializeDeleteButton();
        makeExistingTasksEditable();
        initializeColumnSorting();
        var btn = document.getElementById('customGridBtn');
        if (btn)
            btn.addEventListener('click', showCustomizeGridModal);
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
        var linkedAccountsCol = columnConfig.find(function (c) { return c.key === 'linkedAccounts'; });
        if (linkedAccountsCol)
            linkedAccountsCol.visible = true;
        setTimeout(function () {
            refreshLinkedAccountsColumn();
        }, 100);
        var hasSavedData = loadAllData();
        if (!hasSavedData) {
            createSampleData();
        }
        setTimeout(function () {
            console.log('Force updating document columns...');
            updateTDocColumn();
            updateCDocColumn();
            refreshLinkedAccountsColumn();
        }, 200);
        setupAutoSave();
        setTimeout(function () { return saveAllData(); }, 500);
        console.log('Task Viewer fully initialized with separate tables');
    }, 500);
});
function addStyles() {
    if (document.getElementById('skystemtaskmaster-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'skystemtaskmaster-styles';
    style.textContent = "\n        * {\n            margin: 0;\n            padding: 0;\n            box-sizing: border-box;\n        }\n        \n        body {\n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n            background: #f5f5f5;\n        }\n        \n        .skystemtaskmaster-main-wrapper {\n            max-width: 1400px;\n            margin: 0 auto;\n            padding: 20px;\n        }\n        \n        .skystemtaskmaster-action-bar {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            margin-bottom: 20px;\n            padding: 15px;\n            background: white;\n            border-radius: 8px;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n        }\n        \n        .skystemtaskmaster-action-buttons {\n            display: flex;\n            gap: 10px;\n        }\n        \n        .skystemtaskmaster-action-btn {\n            padding: 8px 16px;\n            background: #f0f0f0;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n            transition: all 0.2s;\n        }\n        \n        .skystemtaskmaster-action-btn:hover {\n            background: #e0e0e0;\n            transform: translateY(-1px);\n        }\n        \n        .skystemtaskmaster-btn-new {\n            background: #ff0080;\n            color: white;\n        }\n        \n        .skystemtaskmaster-btn-new:hover {\n            background: #e60073;\n        }\n        \n        .skystemtaskmaster-search-bar {\n            padding: 8px 12px;\n            border: 1px solid #ddd;\n            border-radius: 4px;\n            width: 250px;\n        }\n        \n        .skystemtaskmaster-task-dropdown {\n            padding: 8px 12px;\n            border: 1px solid #ddd;\n            border-radius: 4px;\n            background: white;\n        }\n        \n        .skystemtaskmaster-stats {\n            display: flex;\n            gap: 20px;\n            margin-bottom: 20px;\n            padding: 15px;\n            background: white;\n            border-radius: 8px;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n        }\n        \n        .stat-card {\n            flex: 1;\n            text-align: center;\n            padding: 10px;\n            background: #f9f9f9;\n            border-radius: 6px;\n        }\n        \n        .stat-value {\n            font-size: 24px;\n            font-weight: bold;\n            color: #ff0080;\n        }\n        \n        .stat-label {\n            font-size: 12px;\n            color: #666;\n            margin-top: 5px;\n        }\n        \n        .main-table-container {\n            background: white;\n            border-radius: 8px;\n            overflow: hidden;\n            box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n        }\n        \n        .skystemtaskmaster-table {\n            width: 100%;\n            border-collapse: collapse;\n        }\n        \n        .skystemtaskmaster-table th {\n            background: #f8f8f8;\n            padding: 12px;\n            text-align: left;\n            font-weight: 600;\n            border-bottom: 2px solid #ff0080;\n        }\n        \n        .skystemtaskmaster-table td {\n            padding: 12px;\n            border-bottom: 1px solid #eee;\n        }\n        \n        .task-row:hover {\n            background: #fafafa;\n        }\n        \n        .skystemtaskmaster-status-badge {\n            display: inline-block;\n            padding: 4px 8px;\n            border-radius: 12px;\n            font-size: 12px;\n            font-weight: 500;\n        }\n        \n        .skystemtaskmaster-status-not-started {\n            background: #f0f0f0;\n            color: #666;\n        }\n        \n        .skystemtaskmaster-status-in-progress {\n            background: #fff3e0;\n            color: #ff9800;\n        }\n        \n        .skystemtaskmaster-status-completed {\n            background: #e8f5e9;\n            color: #4caf50;\n        }\n        \n        .skystemtaskmaster-status-review {\n            background: #e3f2fd;\n            color: #2196f3;\n        }\n        \n        .skystemtaskmaster-badge {\n            display: inline-block;\n            padding: 4px 8px;\n            border-radius: 4px;\n            font-size: 12px;\n            font-weight: 500;\n        }\n        \n        .skystemtaskmaster-badge-pk {\n            background: #ff0080;\n            color: white;\n        }\n        \n        .skystemtaskmaster-badge-sm {\n            background: #00cfff;\n            color: white;\n        }\n        \n        .skystemtaskmaster-badge-mp {\n            background: #9c27b0;\n            color: white;\n        }\n        \n        .skystemtaskmaster-badge-pp {\n            background: #ff9800;\n            color: white;\n        }\n        \n        .skystemtaskmaster-badge-js {\n            background: #4caf50;\n            color: white;\n        }\n        \n        .skystemtaskmaster-badge-ew {\n            background: #f44336;\n            color: white;\n        }\n        \n        .skystemtaskmaster-badge-db {\n            background: #795548;\n            color: white;\n        }\n        \n        .skystemtaskmaster-editable {\n            cursor: pointer;\n            transition: background 0.2s;\n        }\n        \n        .skystemtaskmaster-editable:hover {\n            background: #fff0f5;\n        }\n        \n        .skystemtaskmaster-days-positive {\n            color: #4caf50;\n            font-weight: 500;\n        }\n        \n        .skystemtaskmaster-days-negative {\n            color: #f44336;\n            font-weight: 500;\n        }\n        \n        .modal {\n            display: none;\n            position: fixed;\n            z-index: 10000;\n            left: 0;\n            top: 0;\n            width: 100%;\n            height: 100%;\n            background-color: rgba(0,0,0,0.5);\n            animation: fadeIn 0.3s;\n        }\n        \n        .modal-content {\n            background-color: white;\n            margin: 50px auto;\n            padding: 20px;\n            border-radius: 8px;\n            width: 90%;\n            max-width: 500px;\n            position: relative;\n            animation: slideDown 0.3s;\n        }\n        \n        .modal-sm {\n            max-width: 400px;\n        }\n        \n        .modal-md {\n            max-width: 600px;\n        }\n        \n        .modal-lg {\n            max-width: 800px;\n        }\n        \n        .close {\n            position: absolute;\n            right: 15px;\n            top: 10px;\n            font-size: 24px;\n            cursor: pointer;\n            color: #999;\n        }\n        \n        .close:hover {\n            color: #ff0080;\n        }\n        \n        .modal-title {\n            color: #ff0080;\n            margin-bottom: 20px;\n        }\n        \n        .modal-input {\n            width: 100%;\n            padding: 10px;\n            border: 1px solid #ddd;\n            border-radius: 4px;\n            margin: 10px 0;\n        }\n        \n        .modal-btn-primary {\n            width: 100%;\n            padding: 10px;\n            background: #ff0080;\n            color: white;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n            margin-top: 10px;\n        }\n        \n        .modal-btn-primary:hover {\n            background: #e60073;\n        }\n        \n        @keyframes fadeIn {\n            from { opacity: 0; }\n            to { opacity: 1; }\n        }\n        \n        @keyframes slideDown {\n            from {\n                transform: translateY(-50px);\n                opacity: 0;\n            }\n            to {\n                transform: translateY(0);\n                opacity: 1;\n            }\n        }\n        \n        @keyframes slideIn {\n            from {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            to {\n                transform: translateX(0);\n                opacity: 1;\n            }\n        }\n        \n        @keyframes slideOut {\n            from {\n                transform: translateX(0);\n                opacity: 1;\n            }\n            to {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n        }\n    ";
    document.head.appendChild(style);
}
function createModals() {
    var modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.innerHTML = "\n        <div id=\"newTaskOptionsModal\" class=\"modal\">\n            <div class=\"modal-content modal-sm\">\n                <span class=\"close\">&times;</span>\n                <h3>Create New</h3>\n                <div class=\"modal-body\">\n                    <div class=\"dropdown-container\">\n                        <button id=\"newTaskMainButton\" class=\"dropdown-main-btn\" style=\"width: 100%; padding: 12px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">\n                            <span>\n                                <i class=\"fa-solid fa-clipboard-list\"></i> New Checklist\n                            </span>\n                            <span class=\"dropdown-arrow\">\n                                <i class=\"fa-solid fa-angle-down\"></i>\n                            </span>\n                        </button>\n                        \n                        <div id=\"newTaskDropdown\" class=\"dropdown-menu\" style=\"display: none; position: absolute; background: white; border: 1px solid #ddd; border-radius: 4px; margin-top: 5px; width: 100%;\">\n                            <button id=\"newListOption\" class=\"dropdown-item\" style=\"width: 100%; padding: 10px; text-align: left; background: none; border: none; cursor: pointer;\">\n                                <span>\n                                    <i class=\"fa-solid fa-list\"></i> New List\n                                </span>\n                            </button>\n                            <button id=\"importTasksOption\" class=\"dropdown-item\" style=\"width: 100%; padding: 10px; text-align: left; background: none; border: none; cursor: pointer;\">\n                                <span>\n                                    <i class=\"fa-solid fa-file-import\"></i> Import Tasks\n                                </span>\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        \n        <div id=\"enterListNameModal\" class=\"modal\">\n            <div class=\"modal-content modal-sm\">\n                <span class=\"close\">&times;</span>\n                <h3>Enter List Name</h3>\n                <div class=\"modal-body\">\n                    <input type=\"text\" id=\"listNameInput\" class=\"modal-input\" placeholder=\"Enter list name\">\n                    <button id=\"createListBtn\" class=\"modal-btn-primary\">Create List</button>\n                </div>\n            </div>\n        </div>\n        \n        <div id=\"importTasksModal\" class=\"modal\">\n            <div class=\"modal-content modal-lg\" style=\"max-width: 800px; max-height: 90vh; overflow-y: auto;\">\n                <div class=\"modal-header\">\n                    <span class=\"close\">&times;</span>\n                    <h3 class=\"modal-title\">\uD83D\uDCE5 Import Tasks from File</h3>\n                </div>\n                \n                <div class=\"modal-body-scrollable\">\n                    <div class=\"upload-section\" style=\"margin-bottom: 20px;\">\n                        <h4 class=\"section-title\" style=\"color: #ff0080; margin-bottom: 10px;\">Upload File</h4>\n                        \n                        <div id=\"importDropArea\" class=\"drop-area\" style=\"border: 2px dashed #ddd; border-radius: 8px; padding: 30px; text-align: center; cursor: pointer;\">\n                            <div class=\"drop-area-icon\" style=\"font-size: 48px; margin-bottom: 10px;\"><i class=\"fa-solid fa-folder-open\"></i></div>\n                            <div class=\"drop-area-title\" style=\"color: #666;\">Drag & drop file here</div>\n                            <div class=\"drop-area-or\" style=\"color: #999; margin: 10px 0;\">or</div>\n                            <button id=\"importBrowseFileBtn\" class=\"btn-browse\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Browse Files</button>\n                            <input type=\"file\" id=\"importFileInput\" class=\"file-input\" accept=\".csv,.json,.txt,.xlsx,.xls\" style=\"display: none;\">\n                        </div>\n                        \n                        <div class=\"supported-formats\" style=\"font-size: 12px; color: #999; margin-top: 10px;\">\n                            <strong>Supported formats:</strong> CSV, JSON, TXT (one task per line), Excel (.xlsx, .xls)\n                        </div>\n                    </div>\n                    \n                    <div id=\"importPreviewArea\" class=\"preview-area\" style=\"display: none; margin-bottom: 20px;\">\n                        <h4 class=\"section-title\" style=\"color: #ff0080; margin-bottom: 10px;\">Preview Imported Tasks</h4>\n                        <div class=\"preview-table-container\" style=\"overflow-x: auto;\">\n                            <table class=\"preview-table\" style=\"width: 100%; border-collapse: collapse;\">\n                                <thead>\n                                    <tr>\n                                        <th style=\"padding: 8px; text-align: left; border-bottom: 1px solid #ddd;\">Task Name</th>\n                                        <th style=\"padding: 8px; text-align: left; border-bottom: 1px solid #ddd;\">Owner</th>\n                                        <th style=\"padding: 8px; text-align: left; border-bottom: 1px solid #ddd;\">Reviewer</th>\n                                        <th style=\"padding: 8px; text-align: left; border-bottom: 1px solid #ddd;\">Due Date</th>\n                                    </tr>\n                                </thead>\n                                <tbody id=\"importPreviewBody\"></tbody>\n                            </table>\n                        </div>\n                    </div>\n                    \n                    <div class=\"options-section\" style=\"margin-bottom: 20px;\">\n                        <h4 class=\"section-title\" style=\"color: #ff0080; margin-bottom: 10px;\">Import Options</h4>\n                        \n                        <div class=\"radio-group\" style=\"margin-bottom: 10px;\">\n                            <label class=\"radio-label\" style=\"display: block; margin-bottom: 5px;\">\n                                <input type=\"radio\" name=\"importTarget\" value=\"newList\" checked>\n                                <span>Create New List with imported tasks</span>\n                            </label>\n                            <label class=\"radio-label\" style=\"display: block;\">\n                                <input type=\"radio\" name=\"importTarget\" value=\"currentList\">\n                                <span>Add to currently selected list</span>\n                            </label>\n                        </div>\n                        \n                        <div class=\"checkbox-group\">\n                            <label class=\"checkbox-label\" style=\"display: flex; align-items: center; gap: 8px;\">\n                                <input type=\"checkbox\" id=\"skipDuplicates\" checked>\n                                <span>Skip duplicate task names</span>\n                            </label>\n                        </div>\n                    </div>\n                </div>\n                \n                <div class=\"modal-footer\" style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;\">\n                    <button id=\"cancelImportBtn\" class=\"btn-secondary\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Cancel</button>\n                    <button id=\"processImportBtn\" class=\"btn-primary\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\" disabled>Import Tasks</button>\n                </div>\n            </div>\n        </div>\n        \n        <div id=\"addTaskModal\" class=\"modal\">\n            <div class=\"modal-content modal-md\">\n                <span class=\"close\">&times;</span>\n                <h3>Add New Task</h3>\n                <div class=\"modal-body\">\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px;\">Task Name *</label>\n                        <input type=\"text\" id=\"addTaskName\" class=\"form-input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"Enter task name\" autofocus>\n                    </div>\n                    \n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px;\">Acc</label>\n                            <input type=\"text\" id=\"addTaskAcc\" class=\"form-input\" value=\"+\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px;\">TDoc</label>\n                            <input type=\"text\" id=\"addTaskTdoc\" class=\"form-input\" value=\"0\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                    </div>\n                    \n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px;\">Owner</label>\n                            <select id=\"addTaskOwner\" class=\"form-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK (Palakh Khanna)</option>\n                                <option value=\"SM\">SM (Sarah Miller)</option>\n                                <option value=\"MP\">MP (Mel Preparer)</option>\n                                <option value=\"PP\">PP (Poppy Pan)</option>\n                                <option value=\"JS\">JS (John Smith)</option>\n                                <option value=\"EW\">EW (Emma Watson)</option>\n                                <option value=\"DB\">DB (David Brown)</option>\n                            </select>\n                        </div>\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px;\">Reviewer</label>\n                            <select id=\"addTaskReviewer\" class=\"form-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK (Palakh Khanna)</option>\n                                <option value=\"SM\">SM (Sarah Miller)</option>\n                                <option value=\"MP\">MP (Mel Preparer)</option>\n                                <option value=\"PP\">PP (Poppy Pan)</option>\n                                <option value=\"JS\">JS (John Smith)</option>\n                                <option value=\"EW\">EW (Emma Watson)</option>\n                                <option value=\"DB\">DB (David Brown)</option>\n                            </select>\n                        </div>\n                    </div>\n                    \n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px;\">Due Date (optional)</label>\n                        <input type=\"date\" id=\"addTaskDueDate\" class=\"form-input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                    </div>\n                    \n                    <button id=\"addTaskBtn\" class=\"modal-btn-primary\" style=\"width: 100%; padding: 10px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Add Task</button>\n                </div>\n            </div>\n        </div>\n        \n        <div id=\"addSubtaskModal\" class=\"modal\">\n            <div class=\"modal-content modal-md\">\n                <span class=\"close\">&times;</span>\n                <h3>Add Subtask</h3>\n                <div class=\"modal-body\">\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px;\">Subtask Name</label>\n                        <input type=\"text\" id=\"subtaskName\" class=\"form-input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"Enter subtask name\">\n                    </div>\n                    \n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px;\">Status</label>\n                        <select id=\"subtaskStatus\" class=\"form-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"Not Started\">Not Started</option>\n                            <option value=\"In Progress\">In Progress</option>\n                            <option value=\"Completed\">Completed</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px;\">Owner</label>\n                            <select id=\"subtaskOwner\" class=\"form-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK</option>\n                                <option value=\"SM\">SM</option>\n                            </select>\n                        </div>\n                        <div class=\"form-group\">\n                            <label style=\"display: block; margin-bottom: 5px;\">Reviewer</label>\n                            <select id=\"subtaskReviewer\" class=\"form-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK</option>\n                                <option value=\"SM\">SM</option>\n                            </select>\n                        </div>\n                    </div>\n                    \n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px;\">TDoc</label>\n                        <input type=\"text\" id=\"subtaskTdoc\" class=\"form-input\" value=\"\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                    </div>\n                    \n                    <button id=\"addSubtaskBtn\" class=\"modal-btn-primary\" style=\"width: 100%; padding: 10px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Add Subtask</button>\n                </div>\n            </div>\n        </div>\n    ";
    document.body.appendChild(modalContainer);
}
function initializeComments() {
    console.log('Initializing comments...');
    addCommentStyles();
    setTimeout(function () {
        updateCommentColumn();
    }, 500);
}
function initializeStatus() {
    addStatusStyles();
    makeStatusEditable();
}
function makeStatusEditable() {
    tasks.forEach(function (task) {
        var _a, _b;
        var statusCell = (_a = task.statusBadge) === null || _a === void 0 ? void 0 : _a.parentElement;
        if (!statusCell)
            return;
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        var newStatusCell = statusCell.cloneNode(true);
        (_b = statusCell.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(newStatusCell, statusCell);
        newStatusCell.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            showStatusChangeModal(task);
        });
    });
    subtasks.forEach(function (subtask) {
        var _a, _b;
        var statusCell = (_a = subtask.statusBadge) === null || _a === void 0 ? void 0 : _a.parentElement;
        if (!statusCell)
            return;
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        var newStatusCell = statusCell.cloneNode(true);
        (_b = statusCell.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(newStatusCell, statusCell);
        newStatusCell.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            showSubtaskStatusChangeModal(subtask);
        });
    });
}
function initializeDragAndDrop() {
    console.log('Initializing Drag and Drop...');
    tasks.forEach(function (task) { return makeRowDraggable(task.row, 'task'); });
    subtasks.forEach(function (subtask) { return makeRowDraggable(subtask.row, 'subtask'); });
    addDragStyles();
}
function makeRowDraggable(row, type) {
    if (!row)
        return;
    if (row.getAttribute('draggable') === 'true')
        return;
    row.setAttribute('draggable', 'true');
    row.classList.add('skystemtaskmaster-draggable');
    var existingHandle = row.querySelector('.skystemtaskmaster-drag-handle');
    if (existingHandle)
        existingHandle.remove();
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragend', handleDragEnd);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragleave', handleDragLeave);
    row.addEventListener('drop', handleDrop);
}
function handleDragStart(e) {
    var row = e.currentTarget;
    if (row.classList.contains('skystemtaskmaster-subtask-header')) {
        e.preventDefault();
        return;
    }
    var type = row.classList.contains('subtask-row') ? 'subtask' : 'task';
    draggedItem = {
        element: row,
        type: type,
        originalIndex: getItemIndex(row, type)
    };
    if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'move';
    }
    row.classList.add('skystemtaskmaster-dragging');
}
function handleDragEnd(e) {
    var row = e.currentTarget;
    row.classList.remove('skystemtaskmaster-dragging');
    document.querySelectorAll('tr').forEach(function (tr) {
        tr.classList.remove('skystemtaskmaster-drag-over', 'skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
    });
    draggedItem = null;
}
function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer)
        e.dataTransfer.dropEffect = 'move';
    var targetRow = e.currentTarget;
    if (!draggedItem || draggedItem.element === targetRow)
        return;
    var isDraggedTask = draggedItem.type === 'task';
    var isTargetTask = !targetRow.classList.contains('subtask-row') &&
        !targetRow.classList.contains('skystemtaskmaster-subtask-header') &&
        !targetRow.classList.contains('main-list-row') &&
        !targetRow.classList.contains('sub-list-row');
    if (isDraggedTask !== isTargetTask)
        return;
    document.querySelectorAll('tr').forEach(function (tr) {
        tr.classList.remove('skystemtaskmaster-drag-over', 'skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
    });
    var rect = targetRow.getBoundingClientRect();
    var mouseY = e.clientY;
    var midpoint = rect.top + rect.height / 2;
    if (mouseY < midpoint) {
        targetRow.classList.add('skystemtaskmaster-drag-over-top');
    }
    else {
        targetRow.classList.add('skystemtaskmaster-drag-over-bottom');
    }
}
function handleDragLeave(e) {
    var targetRow = e.currentTarget;
    targetRow.classList.remove('skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
}
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    var targetRow = e.currentTarget;
    targetRow.classList.remove('skystemtaskmaster-drag-over-top', 'skystemtaskmaster-drag-over-bottom');
    if (!draggedItem || draggedItem.element === targetRow)
        return;
    var isDraggedTask = draggedItem.type === 'task';
    var isTargetTask = !targetRow.classList.contains('subtask-row') &&
        !targetRow.classList.contains('skystemtaskmaster-subtask-header') &&
        !targetRow.classList.contains('main-list-row') &&
        !targetRow.classList.contains('sub-list-row');
    if (isDraggedTask !== isTargetTask) {
        alert("Cannot move ".concat(isDraggedTask ? 'tasks' : 'subtasks', " into ").concat(isTargetTask ? 'tasks' : 'subtasks', " section"));
        return;
    }
    var tbody = targetRow.parentNode;
    var isDropAbove = targetRow.classList.contains('skystemtaskmaster-drag-over-top');
    if (isDropAbove) {
        tbody === null || tbody === void 0 ? void 0 : tbody.insertBefore(draggedItem.element, targetRow);
    }
    else {
        tbody === null || tbody === void 0 ? void 0 : tbody.insertBefore(draggedItem.element, targetRow.nextSibling);
    }
    if (draggedItem.type === 'task') {
        updateTasksOrder();
    }
    else {
        updateSubtasksOrder();
    }
    saveTaskOrder();
}
function getItemIndex(row, type) {
    if (type === 'task') {
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].row === row)
                return i;
        }
        return -1;
    }
    else {
        for (var i = 0; i < subtasks.length; i++) {
            if (subtasks[i].row === row)
                return i;
        }
        return -1;
    }
}
function updateTasksOrder() {
    var tbody = document.querySelector('tbody');
    if (!tbody)
        return;
    var allRows = Array.from(tbody.querySelectorAll('tr'));
    var taskRows = allRows.filter(function (row) {
        return !row.classList.contains('skystemtaskmaster-subtask-header') &&
            !row.classList.contains('subtask-row') &&
            !row.classList.contains('main-list-row') &&
            !row.classList.contains('sub-list-row');
    });
    tasks.sort(function (a, b) {
        var aIndex = taskRows.indexOf(a.row);
        var bIndex = taskRows.indexOf(b.row);
        return aIndex - bIndex;
    });
}
function updateSubtasksOrder() {
    var tbody = document.querySelector('tbody');
    if (!tbody)
        return;
    var allRows = Array.from(tbody.querySelectorAll('tr'));
    var subtaskRows = allRows.filter(function (row) { return row.classList.contains('subtask-row'); });
    subtasks.sort(function (a, b) {
        var aIndex = subtaskRows.indexOf(a.row);
        var bIndex = subtaskRows.indexOf(b.row);
        return aIndex - bIndex;
    });
}
function saveTaskOrder() {
    var order = {
        tasks: tasks.map(function (t) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            return ({
                taskName: ((_c = (_b = (_a = t.taskNameCell) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '',
                dueDate: ((_e = (_d = t.dueDateCell) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '',
                status: ((_g = (_f = t.statusBadge) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim()) || '',
                owner: ((_l = (_k = (_j = (_h = t.row) === null || _h === void 0 ? void 0 : _h.cells[5]) === null || _j === void 0 ? void 0 : _j.querySelector('.skystemtaskmaster-badge')) === null || _k === void 0 ? void 0 : _k.textContent) === null || _l === void 0 ? void 0 : _l.trim()) || '',
                reviewer: ((_q = (_p = (_o = (_m = t.row) === null || _m === void 0 ? void 0 : _m.cells[6]) === null || _o === void 0 ? void 0 : _o.querySelector('.skystemtaskmaster-badge')) === null || _p === void 0 ? void 0 : _p.textContent) === null || _q === void 0 ? void 0 : _q.trim()) || '',
                cdoc: ((_t = (_s = (_r = t.row) === null || _r === void 0 ? void 0 : _r.cells[7]) === null || _s === void 0 ? void 0 : _s.textContent) === null || _t === void 0 ? void 0 : _t.trim()) || ''
            });
        }),
        subtasks: subtasks.map(function (s) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            return ({
                taskName: ((_c = (_b = (_a = s.taskNameCell) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '',
                status: ((_e = (_d = s.statusBadge) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '',
                owner: ((_h = (_g = (_f = s.ownerCell) === null || _f === void 0 ? void 0 : _f.querySelector('.skystemtaskmaster-badge')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim()) || '',
                reviewer: ((_l = (_k = (_j = s.reviewerCell) === null || _j === void 0 ? void 0 : _j.querySelector('.skystemtaskmaster-badge')) === null || _k === void 0 ? void 0 : _k.textContent) === null || _l === void 0 ? void 0 : _l.trim()) || ''
            });
        })
    };
    localStorage.setItem('taskOrder', JSON.stringify(order));
}
function loadTaskOrder() {
    var savedOrder = localStorage.getItem('taskOrder');
    if (!savedOrder)
        return;
    try {
        var order = JSON.parse(savedOrder);
        console.log('Loaded saved order', order);
    }
    catch (e) {
        console.error('Failed to load saved order', e);
    }
}
function initializeTaskDropdown() {
    var _a;
    var taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown");
    if (!taskDropdown)
        return;
    var newDropdown = taskDropdown.cloneNode(true);
    (_a = taskDropdown.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newDropdown, taskDropdown);
    newDropdown.addEventListener("change", function (e) {
        var filter = e.target.value;
        var currentUser = 'PK';
        console.log('Dropdown filter changed to:', filter);
        tasks.forEach(function (task) {
            if (task.row)
                task.row.style.display = '';
        });
        subtasks.forEach(function (subtask) {
            if (subtask.row)
                subtask.row.style.display = '';
        });
        if (filter !== "all") {
            tasks.forEach(function (task) {
                var _a, _b, _c, _d, _e, _f;
                var ownerBadge = (_b = (_a = task.row) === null || _a === void 0 ? void 0 : _a.cells[5]) === null || _b === void 0 ? void 0 : _b.querySelector('.skystemtaskmaster-badge');
                var reviewerBadge = (_d = (_c = task.row) === null || _c === void 0 ? void 0 : _c.cells[6]) === null || _d === void 0 ? void 0 : _d.querySelector('.skystemtaskmaster-badge');
                var ownerText = ((_e = ownerBadge === null || ownerBadge === void 0 ? void 0 : ownerBadge.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '';
                var reviewerText = ((_f = reviewerBadge === null || reviewerBadge === void 0 ? void 0 : reviewerBadge.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '';
                var show = true;
                switch (filter) {
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
                if (task.row)
                    task.row.style.display = show ? '' : 'none';
            });
            subtasks.forEach(function (subtask) {
                var _a, _b, _c, _d;
                var ownerBadge = (_a = subtask.ownerCell) === null || _a === void 0 ? void 0 : _a.querySelector('.skystemtaskmaster-badge');
                var reviewerBadge = (_b = subtask.reviewerCell) === null || _b === void 0 ? void 0 : _b.querySelector('.skystemtaskmaster-badge');
                var ownerText = ((_c = ownerBadge === null || ownerBadge === void 0 ? void 0 : ownerBadge.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
                var reviewerText = ((_d = reviewerBadge === null || reviewerBadge === void 0 ? void 0 : reviewerBadge.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
                var show = true;
                switch (filter) {
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
                if (subtask.row)
                    subtask.row.style.display = show ? '' : 'none';
            });
        }
        var visibleTasks = 0;
        tasks.forEach(function (task) {
            if (task.row && task.row.style.display !== 'none')
                visibleTasks++;
        });
        subtasks.forEach(function (subtask) {
            if (subtask.row && subtask.row.style.display !== 'none')
                visibleTasks++;
        });
        showNotification("Filter: ".concat(filter.replace(/-/g, ' '), " - ").concat(visibleTasks, " items visible"));
    });
}
function initializeFilterButton() {
    var filterBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(function (btn) {
        return (btn.textContent && btn.textContent.indexOf('Filter') !== -1) ||
            (btn.innerHTML && btn.innerHTML.indexOf('filter') !== -1);
    });
    if (filterBtn) {
        filterBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showFilterPanel();
        });
    }
    else {
        var filterOption = document.getElementById('dropdownFilter');
        if (filterOption) {
            filterOption.addEventListener('click', function (e) {
                e.stopPropagation();
                showFilterPanel();
            });
        }
    }
}
function initializeDownloadButton() {
    var downloadBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(function (btn) {
        var _a;
        return ((_a = btn.textContent) === null || _a === void 0 ? void 0 : _a.indexOf('Download')) !== -1 || btn.innerHTML.indexOf('download') !== -1;
    });
    if (downloadBtn) {
        downloadBtn.addEventListener('click', showDownloadOptions);
    }
}
function showDownloadOptions() {
    var _a, _b, _c, _d;
    var downloadModal = document.getElementById('downloadModal');
    if (!downloadModal) {
        downloadModal = document.createElement('div');
        downloadModal.id = 'downloadModal';
        downloadModal.className = 'modal';
        downloadModal.innerHTML = "\n            <div class=\"modal-content modal-download\" style=\"width: 350px;\">\n                <span class=\"close\">&times;</span>\n                <h3 class=\"cdoc-header\">Download As</h3>\n                \n                <div class=\"download-button-list\" style=\"display: flex; flex-direction: column; gap: 10px; margin: 20px 0;\">\n                    <button id=\"downloadExcelBtn\" class=\"btn-download btn-excel\" style=\"padding: 10px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;\">\n                        <i class=\"fas fa-file-excel\"></i> Excel (XLSX)\n                    </button>\n                    <button id=\"downloadCsvBtn\" class=\"btn-download btn-csv\" style=\"padding: 10px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;\">\n                        <i class=\"fas fa-file-csv\"></i> CSV (Flat File)\n                    </button>\n                    <button id=\"downloadJsonBtn\" class=\"btn-download btn-json\" style=\"padding: 10px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer;\">\n                        <i class=\"fas fa-code\"></i> JSON (Raw Data)\n                    </button>\n                </div>\n            </div>\n        ";
        document.body.appendChild(downloadModal);
        var close_3 = function () { return downloadModal.style.display = 'none'; };
        (_a = downloadModal.querySelector('.close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close_3);
        var executeAction_1 = function (actionFn) {
            if (actionFn)
                actionFn();
            close_3();
        };
        (_b = document.getElementById('downloadExcelBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () { return executeAction_1(downloadAsExcel); });
        (_c = document.getElementById('downloadCsvBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () { return executeAction_1(downloadAsCsv); });
        (_d = document.getElementById('downloadJsonBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function () { return executeAction_1(downloadAsJson); });
    }
    downloadModal.style.display = 'block';
}
function initializeSortButton() {
    var sortBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(function (btn) {
        var _a;
        return ((_a = btn.textContent) === null || _a === void 0 ? void 0 : _a.indexOf('Sort')) !== -1 || btn.innerHTML.indexOf('sort') !== -1;
    });
    if (sortBtn) {
        sortBtn.addEventListener('click', showSortOptions);
    }
}
function showSortOptions() {
    var _a, _b;
    var sortModal = document.getElementById('sortModal');
    if (!sortModal) {
        sortModal = document.createElement('div');
        sortModal.id = 'sortModal';
        sortModal.className = 'modal';
        sortModal.innerHTML = "\n            <div class=\"modal-content modal-sort\" style=\"width: 350px;\">\n                <span class=\"close\">&times;</span>\n                <h3 class=\"cdoc-header\">Sort Tasks</h3>\n                \n                <div class=\"sort-body\" style=\"margin: 20px 0;\">\n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label class=\"form-label\" style=\"display: block; margin-bottom: 5px;\">Sort By</label>\n                        <select id=\"sortBy\" class=\"sort-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"taskName\">Task Name</option>\n                            <option value=\"dueDate\">Due Date</option>\n                            <option value=\"status\">Status</option>\n                            <option value=\"owner\">Owner</option>\n                            <option value=\"reviewer\">Reviewer</option>\n                            <option value=\"days\">+/- Days</option>\n                        </select>\n                    </div>\n                    \n                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">\n                        <label class=\"form-label\" style=\"display: block; margin-bottom: 5px;\">Order</label>\n                        <select id=\"sortOrder\" class=\"sort-select\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"asc\">Ascending (A-Z)</option>\n                            <option value=\"desc\">Descending (Z-A)</option>\n                        </select>\n                    </div>\n                </div>\n                \n                <div class=\"modal-footer\" style=\"display: flex; justify-content: flex-end;\">\n                    <button id=\"applySortBtn\" class=\"btn-primary\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Apply Sort</button>\n                </div>\n            </div>\n        ";
        document.body.appendChild(sortModal);
        var close_4 = function () { return sortModal.style.display = 'none'; };
        (_a = sortModal.querySelector('.close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close_4);
        (_b = document.getElementById('applySortBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
            var sortBy = document.getElementById('sortBy').value;
            var sortOrder = document.getElementById('sortOrder').value;
            applySort(sortBy, sortOrder);
            close_4();
        });
    }
    sortModal.style.display = 'block';
}
function applySort(sortBy, sortOrder) {
    var tbody = document.querySelector('tbody');
    if (!tbody)
        return;
    var allRows = Array.from(tbody.querySelectorAll('tr'));
    var headerRows = allRows.filter(function (row) {
        return row.classList.contains('main-list-row') ||
            row.classList.contains('sub-list-row') ||
            row.classList.contains('skystemtaskmaster-subtask-header');
    });
    var taskRows = allRows.filter(function (row) { return row.classList.contains('task-row'); });
    var subtaskRows = allRows.filter(function (row) { return row.classList.contains('subtask-row'); });
    var tasksBySublist = {};
    taskRows.forEach(function (row) {
        var sublistId = row.getAttribute('data-sublist-id') || '';
        if (!tasksBySublist[sublistId]) {
            tasksBySublist[sublistId] = [];
        }
        tasksBySublist[sublistId].push(row);
    });
    Object.keys(tasksBySublist).forEach(function (sublistId) {
        tasksBySublist[sublistId].sort(function (a, b) {
            var aVal = getSortValue(a, sortBy);
            var bVal = getSortValue(b, sortBy);
            if (sortBy === 'dueDate' || sortBy === 'days') {
                aVal = parseSortValue(aVal, sortBy);
                bVal = parseSortValue(bVal, sortBy);
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }
            else {
                return sortOrder === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
        });
    });
    while (tbody.firstChild)
        tbody.removeChild(tbody.firstChild);
    headerRows.forEach(function (row) { return tbody.appendChild(row); });
    headerRows.forEach(function (headerRow) {
        if (headerRow.classList.contains('sub-list-row')) {
            var sublistId = headerRow.getAttribute('data-sublist-id') || '';
            var tasksForThisSublist = tasksBySublist[sublistId] || [];
            tasksForThisSublist.forEach(function (taskRow) { return tbody.appendChild(taskRow); });
        }
    });
    var remainingTasks = taskRows.filter(function (row) {
        return !Array.from(tbody.children).includes(row);
    });
    remainingTasks.forEach(function (row) { return tbody.appendChild(row); });
    subtaskRows.forEach(function (row) { return tbody.appendChild(row); });
    showNotification("Sorted by ".concat(sortBy, " (").concat(sortOrder === 'asc' ? 'Ascending' : 'Descending', ")"));
}
function getSortValue(row, sortBy) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    switch (sortBy) {
        case 'taskName':
            return ((_c = (_b = (_a = row.cells[0]) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
        case 'dueDate':
            return ((_e = (_d = row.cells[3]) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '';
        case 'status':
            return ((_h = (_g = (_f = row.cells[4]) === null || _f === void 0 ? void 0 : _f.querySelector('.skystemtaskmaster-status-badge')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim()) || '';
        case 'owner':
            return ((_l = (_k = (_j = row.cells[5]) === null || _j === void 0 ? void 0 : _j.querySelector('.skystemtaskmaster-badge')) === null || _k === void 0 ? void 0 : _k.textContent) === null || _l === void 0 ? void 0 : _l.trim()) || '';
        case 'reviewer':
            return ((_p = (_o = (_m = row.cells[6]) === null || _m === void 0 ? void 0 : _m.querySelector('.skystemtaskmaster-badge')) === null || _o === void 0 ? void 0 : _o.textContent) === null || _p === void 0 ? void 0 : _p.trim()) || '';
        case 'days':
            return ((_r = (_q = row.cells[8]) === null || _q === void 0 ? void 0 : _q.textContent) === null || _r === void 0 ? void 0 : _r.trim()) || '0';
        default:
            return '';
    }
}
function parseSortValue(val, sortBy) {
    if (sortBy === 'days')
        return parseInt(val.replace('+', '')) || 0;
    if (sortBy === 'dueDate')
        return new Date(val).getTime() || 0;
    return 0;
}
function loadColumnVisibility() {
    var saved = localStorage.getItem('columnVisibility');
    if (saved) {
        try {
            var visibilityState_1 = JSON.parse(saved);
            columnConfig.forEach(function (col) {
                if (visibilityState_1[col.key] !== undefined && !col.mandatory) {
                    col.visible = visibilityState_1[col.key];
                }
            });
            console.log('Column visibility loaded:', visibilityState_1);
        }
        catch (e) {
            console.error('Failed to load column visibility', e);
        }
    }
}
function initializeSimpleUserColumns() {
    console.log('Initializing user columns...');
    var style = document.createElement('style');
    style.id = 'extra-user-styles';
    style.textContent = "\n        .extra-cell[data-column=\"taskOwner\"],\n        .extra-cell[data-column=\"createdBy\"],\n        .extra-cell[data-column=\"approver\"] {\n            cursor: pointer !important;\n            transition: all 0.2s ease !important;\n        }\n        \n        .extra-cell[data-column=\"taskOwner\"]:hover,\n        .extra-cell[data-column=\"createdBy\"]:hover,\n        .extra-cell[data-column=\"approver\"]:hover {\n            background-color: #fff0f5 !important;\n            transform: scale(1.02);\n        }\n        \n        .user-item {\n            transition: all 0.2s;\n        }\n        \n        .user-item:hover {\n            background-color: #f5f5f5;\n        }\n    ";
    document.head.appendChild(style);
    var ownerCol = columnConfig.find(function (c) { return c.key === 'taskOwner'; });
    var createdByCol = columnConfig.find(function (c) { return c.key === 'createdBy'; });
    var approverCol = columnConfig.find(function (c) { return c.key === 'approver'; });
    if (ownerCol)
        ownerCol.visible = true;
    if (createdByCol)
        createdByCol.visible = true;
    if (approverCol)
        approverCol.visible = true;
    setTimeout(function () {
        addExtraColumns();
        addDataCells();
        applyVisibility();
    }, 100);
}
// Export for module usage (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        tasks: tasks,
        subtasks: subtasks,
        mainLists: mainLists,
        subLists: subLists,
        createMainList: createMainList,
        createSubList: createSubList,
        createTask: createTask
    };
}
