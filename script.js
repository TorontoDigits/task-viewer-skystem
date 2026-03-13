"use strict";
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
// GLOBAL VARIABLES
// ================================
var mainLists = [];
var subLists = [];
var tasks = [];
var subtasks = [];
// Column configuration
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
// ================================
// INITIALIZE DATA
// ================================
function initializeData() {
    console.log('Initializing data...');
    tasks = [];
    subtasks = [];
    var rows = document.querySelectorAll("tbody tr");
    console.log('Total rows found:', rows.length);
    rows.forEach(function (rowElement, index) {
        var row = rowElement;
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
                    row: row,
                    checkbox: checkbox,
                    statusBadge: statusBadge,
                    taskNameCell: taskNameCell,
                    ownerCell: ownerCell || row.cells[row.cells.length - 2],
                    reviewerCell: reviewerCell || row.cells[row.cells.length - 1]
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
function addSublistStyles() {
    var style = document.createElement('style');
    style.textContent = "\n        /* Main list row styles */\n        .main-list-row {\n            background-color: #f0f0f0 !important;\n            border-top: 2px solid #ff0080;\n            border-bottom: 2px solid #ff0080;\n        }\n        \n        .main-list-row td {\n            padding: 0 !important;\n            width: 100%;\n        }\n        \n        .list-header {\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            padding: 12px 15px;\n            width: 100%;\n            box-sizing: border-box;\n        }\n        \n        .list-icon { \n            font-size: 20px; \n            color: #ff0080;\n            flex-shrink: 0;\n        }\n        \n        .list-name { \n            flex: 1; \n            font-weight: bold; \n            font-size: 16px;\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;\n        }\n        \n        /* Sub list row styles */\n        .sub-list-row {\n            background-color: #f9f9f9 !important;\n        }\n        \n        .sub-list-row td {\n            padding: 0 !important;\n            width: 100%;\n        }\n        \n        .sublist-header {\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            padding: 10px 15px 10px 40px;\n            width: 100%;\n            box-sizing: border-box;\n        }\n        \n        .sublist-icon { \n            font-size: 18px; \n            color: #00cfff;\n            flex-shrink: 0;\n        }\n        \n        .sublist-name { \n            flex: 1; \n            font-weight: 500;\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;\n        }\n        \n        .add-task-btn {\n            background: #00cfff;\n            color: white;\n            border: none;\n            padding: 4px 10px;\n            border-radius: 4px;\n            cursor: pointer;\n            font-size: 12px;\n            flex-shrink: 0;\n        }\n        \n        .add-task-btn:hover { \n            background: #00b5e0; \n        }\n        \n        .add-sublist-btn {\n            background: #ff0080;\n            color: white;\n            border: none;\n            padding: 6px 12px;\n            border-radius: 4px;\n            cursor: pointer;\n            font-size: 13px;\n            font-weight: 500;\n            flex-shrink: 0;\n        }\n        \n        .add-sublist-btn:hover { \n            background: #e50072; \n        }\n        \n        .collapse-icon, .collapse-sublist-icon {\n            cursor: pointer;\n            font-size: 16px;\n            transition: transform 0.2s;\n            flex-shrink: 0;\n        }\n        \n        .collapse-icon:hover, .collapse-sublist-icon:hover { \n            transform: scale(1.2); \n        }\n        \n        /* Table wrapper to prevent horizontal scroll */\n        .skystemtaskmaster-table-wrapper {\n            overflow-x: auto;\n            max-width: 100%;\n            border: 1px solid #eee;\n            border-radius: 8px;\n        }\n        \n        table {\n            min-width: 100%;\n            border-collapse: collapse;\n        }\n        \n        /* Ensure all cells have proper padding */\n        td, th {\n            padding: 12px 8px;\n            vertical-align: middle;\n        }\n    ";
    document.head.appendChild(style);
}
// ================================
// SIMPLIFIED FIX: OWNER, APPROVER, CREATED BY POPUP
// ================================
(function ensureColumnsVisible() {
    var ownerCol = columnConfig.find(function (c) { return c.key === 'taskOwner'; });
    var createdByCol = columnConfig.find(function (c) { return c.key === 'createdBy'; });
    var approverCol = columnConfig.find(function (c) { return c.key === 'approver'; });
    if (ownerCol)
        ownerCol.visible = true;
    if (createdByCol)
        createdByCol.visible = true;
    if (approverCol)
        approverCol.visible = true;
    console.log('User columns visibility set to true');
})();
function makeCellClickableForPopup(cell, item, columnKey, columnLabel) {
    if (!cell)
        return cell;
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    cell.title = "Click to change ".concat(columnLabel);
    cell.addEventListener('mouseenter', function () {
        cell.style.backgroundColor = '#fff0f5';
    });
    cell.addEventListener('mouseleave', function () {
        cell.style.backgroundColor = '';
    });
    var newCell = cell.cloneNode(true);
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    newCell.addEventListener('click', function (e) {
        var _a;
        e.stopPropagation();
        e.preventDefault();
        console.log("".concat(columnKey, " clicked"));
        var currentValue = ((_a = newCell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '—';
        showSimpleUserModal(item, newCell, columnKey, columnLabel, currentValue);
    });
    return newCell;
}
function showSimpleUserModal(item, cell, columnKey, columnLabel, currentValue) {
    var existingModal = document.getElementById('simpleUserModal');
    if (existingModal)
        existingModal.remove();
    var modal = document.createElement('div');
    modal.id = 'simpleUserModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.zIndex = '10000';
    modal.innerHTML = "\n        <div class=\"modal-content\" style=\"width: 400px; margin: 10% auto; padding: 20px; background: white; border-radius: 8px;\">\n            <span class=\"close\" style=\"position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer;\">&times;</span>\n            <h3 style=\"color: #ff0080; margin-bottom: 15px;\">Select ".concat(columnLabel, "</h3>\n            \n            <div style=\"margin: 20px 0;\">\n                <div style=\"margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 6px;\">\n                    <div style=\"font-weight: 500;\">").concat(item.name || 'Task', "</div>\n                </div>\n                \n                <div style=\"margin-bottom: 15px;\">\n                    <label style=\"font-weight: 500;\">Current ").concat(columnLabel, "</label>\n                    <div style=\"padding: 8px; background: #f0f0f0; border-radius: 4px; margin: 5px 0 15px 0;\">\n                        ").concat(currentValue, "\n                    </div>\n                </div>\n                \n                <input type=\"text\" id=\"simpleUserSearch\" placeholder=\"Search...\" \n                       style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;\">\n                \n                <div id=\"simpleUserList\" style=\"max-height: 300px; overflow-y: auto;\"></div>\n            </div>\n            \n            <div style=\"display: flex; justify-content: flex-end; gap: 10px;\">\n                <button id=\"simpleUnassignBtn\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Unassign</button>\n                <button id=\"simpleCloseBtn\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Close</button>\n            </div>\n        </div>\n    ");
    document.body.appendChild(modal);
    // Store references on window object (using type assertion)
    window.simpleItem = item;
    window.simpleCell = cell;
    window.simpleColumnKey = columnKey;
    window.simpleColumnLabel = columnLabel;
    // Populate user list
    updateSimpleUserList('', currentValue);
    // Close button
    modal.querySelector('.close').addEventListener('click', function () { return modal.remove(); });
    document.getElementById('simpleCloseBtn').addEventListener('click', function () { return modal.remove(); });
    // Unassign button
    document.getElementById('simpleUnassignBtn').addEventListener('click', function () {
        if (window.simpleCell) {
            window.simpleCell.textContent = '—';
            updateSimpleField(window.simpleItem, window.simpleColumnKey, '—');
            showNotification("".concat(columnLabel, " unassigned"));
        }
        modal.remove();
    });
    // Search
    document.getElementById('simpleUserSearch').addEventListener('keyup', function (e) {
        var input = e.target;
        updateSimpleUserList(input.value, currentValue);
    });
}
// Update user list
function updateSimpleUserList(search, currentValue) {
    var list = document.getElementById('simpleUserList');
    if (!list)
        return;
    var filtered = availableUsers.filter(function (u) {
        return u.name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
            u.initials.toLowerCase().indexOf(search.toLowerCase()) >= 0;
    });
    list.innerHTML = filtered.map(function (user) {
        var isCurrent = user.initials === currentValue;
        return "\n            <div class=\"user-item\" data-initials=\"".concat(user.initials, "\" data-name=\"").concat(user.name, "\"\n                 style=\"display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #eee; cursor: pointer; ").concat(isCurrent ? 'background: #fff0f5;' : '', "\">\n                <span style=\"display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: ").concat(getUserColor(user.initials), "; color: white; text-align: center; line-height: 30px;\">").concat(user.initials, "</span>\n                <div>\n                    <div>").concat(user.name, "</div>\n                    <div style=\"font-size: 11px; color: #666;\">").concat(user.email, " \u2022 ").concat(user.role, "</div>\n                </div>\n                ").concat(isCurrent ? '<span style="color: #ff0080;">✓</span>' : '', "\n            </div>\n        ");
    }).join('');
    // Add click handlers
    list.querySelectorAll('.user-item').forEach(function (el) {
        el.addEventListener('click', function () {
            var initials = el.dataset.initials;
            var name = el.dataset.name;
            if (window.simpleCell) {
                window.simpleCell.textContent = initials || '';
                updateSimpleField(window.simpleItem, window.simpleColumnKey, initials || '');
                showNotification("".concat(window.simpleColumnLabel, " set to ").concat(name));
            }
            var modal = document.getElementById('simpleUserModal');
            if (modal)
                modal.remove();
        });
    });
}
function updateSimpleField(item, columnKey, value) {
    if (!item)
        return;
    if (columnKey === 'taskOwner') {
        item.taskOwner = value;
        if (item.owner !== undefined)
            item.owner = value;
    }
    else if (columnKey === 'createdBy') {
        item.createdBy = value;
    }
    else if (columnKey === 'approver') {
        item.approver = value;
    }
    setTimeout(function () { return saveAllData(); }, 100);
}
function initializeSimpleUserColumns() {
    console.log('Initializing user columns...');
    setTimeout(function () {
        document.querySelectorAll('.task-row, .subtask-row').forEach(function (rowElement) {
            var row = rowElement;
            var task = tasks.find(function (t) { return t.row === row; });
            var subtask = subtasks.find(function (s) { return s.row === row; });
            var item = task || subtask;
            if (!item)
                return;
            row.querySelectorAll('.extra-cell').forEach(function (cellElement) {
                var cell = cellElement;
                var colKey = cell.getAttribute('data-column');
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
    document.querySelectorAll('.task-row').forEach(function (rowElement) {
        var row = rowElement;
        var taskId = row.dataset.taskId || '1';
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
                    else if (col.key === 'createdBy')
                        value = 'PK';
                    else if (col.key === 'approver')
                        value = '—';
                }
                cell.textContent = value;
                cell.style.display = col.visible ? '' : 'none';
                if (col.key === 'taskOwner' || col.key === 'createdBy' || col.key === 'approver') {
                    if (task)
                        makeExtraUserCellClickable(cell, task, col.key);
                }
                if (col.key === 'taskStatus' && task) {
                    makeStatusCellClickable(cell, task);
                }
                row.appendChild(cell);
            }
        });
    });
    document.querySelectorAll('.subtask-row').forEach(function (rowElement) {
        var row = rowElement;
        var subtaskId = row.dataset.subtaskId || '1';
        row.querySelectorAll('.extra-cell').forEach(function (cell) { return cell.remove(); });
        columnConfig.forEach(function (col) {
            if (col.forSubtask) {
                var subtaskBaseColumns = ['taskName', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer'];
                if (subtaskBaseColumns.indexOf(col.key) === -1) {
                    var cell = document.createElement('td');
                    cell.className = 'extra-cell';
                    cell.setAttribute('data-column', col.key);
                    var value = '—';
                    var subtask = subtasks.find(function (s) { return s.row === row; });
                    if (col.key === 'taskNumber')
                        value = 'SUB-00' + subtaskId;
                    else if (col.key === 'taskStatus')
                        value = (subtask && subtask.statusBadge) ? subtask.statusBadge.innerText : 'In Progress';
                    else if (col.key === 'createdBy')
                        value = 'PK';
                    else if (col.key === 'approver')
                        value = '—';
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
function makeExtraUserCellClickable(cell, item, columnKey) {
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
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    newCell.addEventListener('click', function (e) {
        var _a;
        e.stopPropagation();
        e.preventDefault();
        console.log("".concat(columnKey, " cell clicked!"));
        if (item && item.row) {
            var currentValue = ((_a = newCell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
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
    modal.querySelector('.close').addEventListener('click', function () {
        modal.remove();
        clearExtraUserReferences();
    });
    document.getElementById('closeUserModalBtn').addEventListener('click', function () {
        modal.remove();
        clearExtraUserReferences();
    });
    document.getElementById('unassignUserBtn').addEventListener('click', function () {
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
        return user.name.toLowerCase().indexOf(searchLower) >= 0 ||
            user.initials.toLowerCase().indexOf(searchLower) >= 0 ||
            user.email.toLowerCase().indexOf(searchLower) >= 0;
    });
    if (filtered.length === 0) {
        userList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No users found</div>';
        return;
    }
    userList.innerHTML = filtered.map(function (user) {
        var isCurrent = user.initials === currentValue;
        return "\n            <div class=\"user-item\" data-user='".concat(JSON.stringify(user), "' \n                 style=\"display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; ").concat(isCurrent ? 'background-color: #fff0f5;' : '', "\">\n                <span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(user.initials.toLowerCase(), "\" \n                      style=\"width: 32px; height: 32px; line-height: 32px; display: inline-block; border-radius: 50%; color: white; text-align: center; font-weight: bold; background: ").concat(getUserColor(user.initials), ";\">").concat(user.initials, "</span>\n                <div style=\"flex: 1;\">\n                    <div style=\"font-weight: 500;\">").concat(user.name, "</div>\n                    <div style=\"font-size: 12px; color: #666;\">").concat(user.email, " \u2022 ").concat(user.role, "</div>\n                </div>\n                ").concat(isCurrent ? '<span style="color: #ff0080; font-weight: bold;">✓</span>' : '', "\n            </div>\n        ");
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
        if (item.owner !== undefined)
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
function initializeExtraUserColumns() {
    console.log('Initializing extra user columns (Owner, Created By, Approver)...');
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
function makeStatusCellClickable(cell, item) {
    cell.style.cursor = 'pointer';
    cell.style.transition = 'all 0.2s';
    cell.title = 'Click to change status';
    cell.addEventListener('mouseenter', function () {
        cell.style.backgroundColor = '#fff0f5';
        cell.style.transform = 'scale(1.02)';
        cell.style.fontWeight = 'bold';
    });
    cell.addEventListener('mouseleave', function () {
        cell.style.backgroundColor = '';
        cell.style.transform = 'scale(1)';
        cell.style.fontWeight = '';
    });
    var newCell = cell.cloneNode(true);
    if (cell.parentNode) {
        cell.parentNode.replaceChild(newCell, cell);
    }
    newCell.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('Task Status cell clicked!');
        if (item && item.row) {
            if ('dueDateCell' in item) {
                showStatusChangeModal(item);
            }
            else {
                showSubtaskStatusChangeModal(item);
            }
        }
    });
    return newCell;
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
// Make sure status badges are clickable for all tasks
function makeAllStatusClickable() {
    // Regular status badges
    tasks.forEach(function (task) {
        if (task.statusBadge) {
            task.statusBadge.style.cursor = 'pointer';
            task.statusBadge.title = 'Click to change status';
            var newBadge = task.statusBadge.cloneNode(true);
            if (task.statusBadge.parentNode) {
                task.statusBadge.parentNode.replaceChild(newBadge, task.statusBadge);
            }
            newBadge.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                showStatusChangeModal(task);
            });
            task.statusBadge = newBadge;
        }
    });
    subtasks.forEach(function (subtask) {
        if (subtask.statusBadge) {
            subtask.statusBadge.style.cursor = 'pointer';
            subtask.statusBadge.title = 'Click to change status';
            var newBadge = subtask.statusBadge.cloneNode(true);
            if (subtask.statusBadge.parentNode) {
                subtask.statusBadge.parentNode.replaceChild(newBadge, subtask.statusBadge);
            }
            newBadge.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                showSubtaskStatusChangeModal(subtask);
            });
            subtask.statusBadge = newBadge;
        }
    });
    // Also make extra column status cells clickable
    setTimeout(function () {
        document.querySelectorAll('.extra-cell[data-column="taskStatus"]').forEach(function (cellElement) {
            var cell = cellElement;
            var row = cell.closest('tr');
            if (!row)
                return;
            var task = tasks.find(function (t) { return t.row === row; });
            var subtask = subtasks.find(function (s) { return s.row === row; });
            if (task || subtask) {
                makeStatusCellClickable(cell, task || subtask);
            }
        });
    }, 200);
}
// Update the initialize function
function initializeTaskStatus() {
    console.log('Initializing Task Status column...');
    // Add styles for status cells
    var style = document.createElement('style');
    style.textContent = "\n        .extra-cell[data-column=\"taskStatus\"] {\n            cursor: pointer;\n            transition: all 0.2s;\n            font-weight: 500;\n        }\n        \n        .extra-cell[data-column=\"taskStatus\"]:hover {\n            background-color: #fff0f5 !important;\n            transform: scale(1.02);\n            font-weight: bold;\n        }\n        \n        .extra-cell[data-column=\"taskStatus\"]:empty:before {\n            content: \"Not Started\";\n            color: #999;\n        }\n    ";
    document.head.appendChild(style);
    // Make all status clickable after a delay
    setTimeout(function () {
        makeAllStatusClickable();
    }, 1000);
}
function applyVisibility() {
    var mainHeader = document.getElementById('mainHeader');
    var subtaskHeader = document.getElementById('subtaskHeader');
    if (!mainHeader)
        return;
    // Get all visible columns from config
    var visibleColumns = columnConfig.filter(function (col) { return col.visible; }).map(function (col) { return col.key; });
    console.log('Visible columns:', visibleColumns);
    // Define column indices for base columns
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
    // Helper function to check if array contains a value (for ES5 compatibility)
    function arrayContains(arr, value) {
        return arr.indexOf(value) >= 0;
    }
    // FIRST: Hide ALL columns in header
    for (var i = 0; i < mainHeader.children.length; i++) {
        if (mainHeader.children[i]) {
            mainHeader.children[i].style.display = 'none';
        }
    }
    // THEN: Show only visible base columns in header
    visibleColumns.forEach(function (key) {
        if (baseIndices[key] !== undefined) {
            if (mainHeader.children[baseIndices[key]]) {
                mainHeader.children[baseIndices[key]].style.display = '';
            }
        }
    });
    // Show extra header columns that are visible
    document.querySelectorAll('.extra-column').forEach(function (thElement) {
        var th = thElement;
        var key = th.getAttribute('data-column');
        if (key && arrayContains(visibleColumns, key)) {
            th.style.display = '';
        }
        else {
            th.style.display = 'none';
        }
    });
    // Apply to task rows
    document.querySelectorAll('.task-row').forEach(function (rowElement) {
        var row = rowElement;
        // Hide ALL cells first
        for (var i = 0; i < row.cells.length; i++) {
            if (row.cells[i]) {
                row.cells[i].style.display = 'none';
            }
        }
        // Show only visible base columns
        visibleColumns.forEach(function (key) {
            if (baseIndices[key] !== undefined) {
                if (row.cells[baseIndices[key]]) {
                    row.cells[baseIndices[key]].style.display = '';
                }
            }
        });
        // Show visible extra columns
        row.querySelectorAll('.extra-cell').forEach(function (cellElement) {
            var cell = cellElement;
            var key = cell.getAttribute('data-column');
            if (key && arrayContains(visibleColumns, key)) {
                cell.style.display = '';
            }
            else {
                cell.style.display = 'none';
            }
        });
    });
    // Apply to subtask rows
    document.querySelectorAll('.subtask-row').forEach(function (rowElement) {
        var row = rowElement;
        // Hide ALL cells first
        for (var i = 0; i < row.cells.length; i++) {
            if (row.cells[i]) {
                row.cells[i].style.display = 'none';
            }
        }
        // Task name is always first cell (index 0)
        if (row.cells[0]) {
            row.cells[0].style.display = '';
        }
        // Show other visible columns that apply to subtasks
        visibleColumns.forEach(function (key) {
            // Check if this column applies to subtasks
            var col = columnConfig.find(function (c) { return c.key === key; });
            if (col && col.forSubtask) {
                // Map column key to cell index for subtasks
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
        // Show visible extra columns for subtasks
        row.querySelectorAll('.extra-cell').forEach(function (cellElement) {
            var cell = cellElement;
            var key = cell.getAttribute('data-column');
            var col = columnConfig.find(function (c) { return c.key === key; });
            if (col && col.forSubtask && key && arrayContains(visibleColumns, key)) {
                cell.style.display = '';
            }
            else {
                cell.style.display = 'none';
            }
        });
    });
    // Update list rows colspan
    setTimeout(function () {
        updateSublistRowsColspan();
    }, 50);
}
function updateSublistRowsColspan() {
    var visibleCount = 0;
    var baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
    // Helper function for ES5 compatibility
    function arrayContains(arr, value) {
        return arr.indexOf(value) >= 0;
    }
    baseColumns.forEach(function (key) {
        var col = columnConfig.find(function (c) { return c.key === key; });
        if (col && col.visible) {
            visibleCount++;
        }
    });
    columnConfig.forEach(function (col) {
        if (!arrayContains(baseColumns, col.key) && col.visible) {
            visibleCount++;
        }
    });
    console.log('Total visible columns:', visibleCount);
    document.querySelectorAll('.main-list-row').forEach(function (rowElement) {
        var row = rowElement;
        var td = row.querySelector('td');
        if (td) {
            td.colSpan = visibleCount;
            td.style.width = '100%';
        }
    });
    document.querySelectorAll('.sub-list-row').forEach(function (rowElement) {
        var row = rowElement;
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
var currentSort = {
    column: null,
    direction: 'asc'
};
function initializeColumnSorting() {
    var headers = document.querySelectorAll('#mainHeader th');
    headers.forEach(function (headerElement, index) {
        var header = headerElement;
        header.style.cursor = 'pointer';
        header.setAttribute('title', 'Click to sort');
        // Add sort icon
        var sortIcon = document.createElement('span');
        sortIcon.className = 'sort-icon';
        sortIcon.innerHTML = ' ↕️';
        sortIcon.style.fontSize = '12px';
        sortIcon.style.marginLeft = '5px';
        sortIcon.style.opacity = '0.5';
        header.appendChild(sortIcon);
        header.addEventListener('click', function () {
            var columnKey = getColumnKeyFromIndex(index);
            if (columnKey) {
                toggleSort(columnKey, header);
            }
        });
        header.addEventListener('mouseenter', function () {
            header.style.backgroundColor = '#fff0f5';
        });
        header.addEventListener('mouseleave', function () {
            header.style.backgroundColor = '';
        });
    });
}
function getColumnKeyFromIndex(index) {
    // Map header index to column key
    var columnMap = [
        'taskName', 'acc', 'tdoc', 'dueDate', 'status',
        'owner', 'reviewer', 'cdoc', 'days'
    ];
    if (index < columnMap.length) {
        return columnMap[index];
    }
    // For extra columns, get from data attribute
    var header = document.querySelectorAll('#mainHeader th')[index];
    if (header) {
        return header.getAttribute('data-column');
    }
    return null;
}
function toggleSort(columnKey, headerElement) {
    if (currentSort.column === columnKey) {
        // Toggle direction
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    else {
        currentSort.column = columnKey;
        currentSort.direction = 'asc';
    }
    // Update sort icons
    updateSortIcons(headerElement);
    // Perform sort
    sortTableByColumn(columnKey, currentSort.direction);
}
function updateSortIcons(activeHeader) {
    // Reset all icons
    document.querySelectorAll('#mainHeader th .sort-icon').forEach(function (iconElement) {
        var icon = iconElement;
        icon.innerHTML = ' ↕️';
        icon.style.opacity = '0.5';
        icon.style.color = '';
    });
    // Update active header icon
    var activeIcon = activeHeader.querySelector('.sort-icon');
    if (activeIcon) {
        activeIcon.innerHTML = currentSort.direction === 'asc' ? ' ↑' : ' ↓';
        activeIcon.style.opacity = '1';
        activeIcon.style.color = '#ff0080';
    }
}
function sortTableByColumn(columnKey, direction) {
    var tbody = document.querySelector('tbody');
    if (!tbody)
        return;
    // Get all rows (excluding header rows)
    var rows = Array.from(tbody.querySelectorAll('tr')).filter(function (rowElement) {
        var row = rowElement;
        return !row.classList.contains('main-list-row') &&
            !row.classList.contains('sub-list-row') &&
            !row.classList.contains('skystemtaskmaster-subtask-header');
    });
    // Separate tasks and subtasks
    var taskRows = rows.filter(function (row) { return row.classList.contains('task-row'); });
    var subtaskRows = rows.filter(function (row) { return row.classList.contains('subtask-row'); });
    // Sort tasks
    taskRows.sort(function (a, b) {
        var aVal = getCellValueForSort(a, columnKey);
        var bVal = getCellValueForSort(b, columnKey);
        return compareValues(aVal, bVal, direction);
    });
    // Sort subtasks
    subtaskRows.sort(function (a, b) {
        var aVal = getCellValueForSort(a, columnKey);
        var bVal = getCellValueForSort(b, columnKey);
        return compareValues(aVal, bVal, direction);
    });
    // Reorder rows in tbody
    var allRows = Array.from(tbody.children);
    var headerRows = allRows.filter(function (row) {
        return row.classList.contains('main-list-row') ||
            row.classList.contains('sub-list-row') ||
            row.classList.contains('skystemtaskmaster-subtask-header');
    });
    // Clear tbody
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    // Add header rows first
    headerRows.forEach(function (row) { return tbody.appendChild(row); });
    // Add sorted task rows
    taskRows.forEach(function (row) { return tbody.appendChild(row); });
    // Add sorted subtask rows
    subtaskRows.forEach(function (row) { return tbody.appendChild(row); });
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
            return badge ? ((_a = badge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '' : ((_b = cell.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
        }
        if (columnKey === 'days') {
            var val = ((_c = cell.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
            return parseInt(val.replace('+', '')) || 0;
        }
        if (columnKey === 'dueDate') {
            var val = ((_d = cell.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            if (val === 'Set due date')
                return new Date(0).getTime();
            return new Date(val).getTime() || 0;
        }
        return ((_e = cell.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '';
    }
    // Extra column
    var extraCell = Array.from(row.querySelectorAll('.extra-cell')).find(function (cellElement) { return cellElement.getAttribute('data-column') === columnKey; });
    return extraCell ? ((_f = extraCell.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '' : '';
}
function compareValues(a, b, direction) {
    var multiplier = direction === 'asc' ? 1 : -1;
    if (typeof a === 'number' && typeof b === 'number') {
        return (a - b) * multiplier;
    }
    // Convert to strings for comparison
    var aStr = String(a || '').toLowerCase();
    var bStr = String(b || '').toLowerCase();
    if (aStr < bStr)
        return -1 * multiplier;
    if (aStr > bStr)
        return 1 * multiplier;
    return 0;
}
// ================================
// HIERARCHICAL LIST FUNCTIONS
// ================================
function initializeCleanStructure() {
    var tbody = document.getElementById('mainTableBody');
    if (tbody)
        tbody.innerHTML = '';
    var sidebar = document.getElementById('mainSidebar');
    if (sidebar)
        sidebar.innerHTML = '';
    mainLists = [];
    subLists = [];
    tasks = [];
    updateCounts();
    console.log('Clean structure initialized');
}
function createMainList(listName) {
    var mainList = {
        id: 'main_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: listName,
        subLists: [],
        row: null,
        isExpanded: true
    };
    mainLists.push(mainList);
    var titleElement = document.querySelector('.skystemtaskmaster-checklist-title');
    if (titleElement)
        titleElement.textContent = listName;
    createMainListRow(mainList);
    showNotification("List \"".concat(listName, "\" created"));
    return mainList;
}
// ================================
// LIST ROWS WITH CHECKBOXES
// ================================
function createMainListRow(mainList) {
    var tbody = document.getElementById('mainTableBody');
    if (!tbody)
        throw new Error('Table body not found');
    var row = document.createElement('tr');
    row.className = 'main-list-row';
    row.setAttribute('data-list-id', mainList.id);
    row.innerHTML = "\n        <td colspan=\"9\">\n            <div class=\"list-header\">\n                <input type=\"checkbox\" class=\"list-checkbox\" title=\"Select this list\">\n                <span class=\"list-icon\">\n                    <i class=\"fa-solid fa-clipboard-list\"></i>\n                </span>\n                <span class=\"list-name\">".concat(mainList.name, "</span>\n                <button class=\"add-sublist-btn\" title=\"Add Sub List\">+ Add Sub List</button>\n                <span class=\"collapse-icon\">\u25BC</span>\n            </div>\n        </td>\n    ");
    mainList.row = row;
    tbody.appendChild(row);
    var addBtn = row.querySelector('.add-sublist-btn');
    addBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showCreateSubListModal(mainList);
    });
    var collapseIcon = row.querySelector('.collapse-icon');
    collapseIcon.addEventListener('click', function () {
        toggleMainList(mainList);
    });
    // Add checkbox functionality
    var checkbox = row.querySelector('.list-checkbox');
    checkbox.addEventListener('change', function (e) {
        e.stopPropagation();
        handleMainListCheckbox(mainList, checkbox.checked);
    });
    return row;
}
function createSubListRow(subList, mainList) {
    var tbody = document.getElementById('mainTableBody');
    if (!tbody)
        throw new Error('Table body not found');
    var row = document.createElement('tr');
    row.className = 'sub-list-row';
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-mainlist-id', mainList.id);
    // Add HTML with checkbox (with indentation)
    row.innerHTML = "\n        <td colspan=\"9\">\n            <div class=\"sublist-header\">\n                <input type=\"checkbox\" class=\"sublist-checkbox\" title=\"Select this sublist\">\n                <span class=\"sublist-icon\">\n                    <i class=\"fa-solid fa-folder\"></i>\n                </span>\n                <span class=\"sublist-name\">".concat(subList.name, "</span>\n                <button class=\"add-task-btn\" title=\"Add Task\">+ Add Task</button>\n                <span class=\"collapse-sublist-icon\">\u25BC</span>\n            </div>\n        </td>\n    ");
    subList.row = row;
    // Insert after main list
    var insertAfter = mainList.row;
    while (insertAfter && insertAfter.nextSibling) {
        var next = insertAfter.nextSibling;
        if (next.classList && next.classList.contains('main-list-row'))
            break;
        insertAfter = next;
    }
    if (insertAfter && insertAfter.nextSibling) {
        tbody.insertBefore(row, insertAfter.nextSibling);
    }
    else {
        tbody.appendChild(row);
    }
    var addBtn = row.querySelector('.add-task-btn');
    addBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showCreateTaskModal(subList);
    });
    var collapseIcon = row.querySelector('.collapse-sublist-icon');
    collapseIcon.addEventListener('click', function () {
        toggleSubList(subList);
    });
    // Add checkbox functionality
    var checkbox = row.querySelector('.sublist-checkbox');
    checkbox.addEventListener('change', function (e) {
        e.stopPropagation();
        handleSublistCheckbox(subList, checkbox.checked);
    });
    return row;
}
// Sublist checkbox handler function
function handleSublistCheckbox(subList, checked) {
    console.log("Sublist ".concat(subList.name, " checkbox: ").concat(checked));
    // Update all tasks under this sublist
    subList.tasks.forEach(function (task) {
        if (task.row) {
            var taskCheckbox = task.row.querySelector('.task-checkbox');
            if (taskCheckbox) {
                taskCheckbox.checked = checked;
            }
        }
    });
    // Update parent main list checkbox (if all sublists are checked)
    var mainList = mainLists.find(function (m) { return m.id === subList.mainListId; });
    if (mainList && mainList.row) {
        var mainCheckbox = mainList.row.querySelector('.list-checkbox');
        if (mainCheckbox) {
            // Check if all sublists under this main list are checked
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
// Main list checkbox handler
function handleMainListCheckbox(mainList, checked) {
    console.log("Main list ".concat(mainList.name, " checkbox: ").concat(checked));
    // Update all sublists under this main list
    mainList.subLists.forEach(function (subList) {
        // Update sublist checkbox
        if (subList.row) {
            var sublistCheckbox = subList.row.querySelector('.sublist-checkbox');
            if (sublistCheckbox) {
                sublistCheckbox.checked = checked;
            }
        }
        // Update all tasks under this sublist
        subList.tasks.forEach(function (task) {
            if (task.row) {
                var taskCheckbox = task.row.querySelector('.task-checkbox');
                if (taskCheckbox) {
                    taskCheckbox.checked = checked;
                }
            }
        });
    });
    if (checked) {
        // You could add logic to mark all tasks as completed
        // Or just leave as is for selection only
    }
    updateSelectedCount();
}
// Update selected count function
function updateSelectedCount() {
    var selected = 0;
    // Count selected tasks
    tasks.forEach(function (task) {
        var checkbox = task.row.querySelector('.task-checkbox');
        if (checkbox && checkbox.checked)
            selected++;
    });
    // Count selected subtasks
    subtasks.forEach(function (subtask) {
        var checkbox = subtask.row.querySelector('.subtask-checkbox');
        if (checkbox && checkbox.checked)
            selected++;
    });
    // Update UI if you have a selected count display
    var selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = selected.toString();
    }
    console.log('Selected items:', selected);
    return selected;
}
function showCreateSubListModal(mainList) {
    // Store current mainList in a data attribute
    var modal = document.getElementById('createSubListModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createSubListModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 400px;\">\n                <span class=\"close\">&times;</span>\n                <h3 style=\"color: #ff0080;\">Create Sub List</h3>\n                <div style=\"margin: 20px 0;\">\n                    <input type=\"text\" id=\"subListNameInput\" placeholder=\"Enter sub list name\" style=\"width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;\">\n                    <button id=\"createSubListBtn\" style=\"background: #ff0080; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%;\">Create Sub List</button>\n                </div>\n            </div>\n        ";
        document.body.appendChild(modal);
        // Close button
        modal.querySelector('.close').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        document.getElementById('createSubListBtn').addEventListener('click', function () {
            var currentMainListId = modal.getAttribute('data-current-mainlist-id');
            var currentMainList = mainLists.find(function (m) { return m.id === currentMainListId; });
            if (!currentMainList) {
                alert('Error: Main list not found');
                return;
            }
            var subListName = document.getElementById('subListNameInput').value.trim();
            if (subListName) {
                createSubList(currentMainList, subListName);
                modal.style.display = 'none';
                document.getElementById('subListNameInput').value = '';
            }
            else {
                alert('Please enter a sub list name');
            }
        });
    }
    // Set current main list ID in modal's data attribute
    modal.setAttribute('data-current-mainlist-id', mainList.id);
    // Optional: Show which list we're adding to
    var modalTitle = modal.querySelector('h3');
    if (modalTitle) {
        modalTitle.textContent = "Create Sub List for \"".concat(mainList.name, "\"");
    }
    modal.style.display = 'block';
}
// ================================
// PERSISTENCE FUNCTIONS
// ================================
function saveAllData() {
    try {
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
            tasks: tasks.map(function (task) { return ({
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
            }); }),
            cdocDocuments: {},
            tdocDocuments: {},
            linkedAccountsMap: {},
            taskComments: taskComments
        };
        // Save CDoc documents (completion documents) by ID
        tasks.forEach(function (task) {
            if (task.id) {
                var docs = taskDocuments.get(task.row);
                if (docs && docs.length > 0) {
                    data_1.cdocDocuments[task.id] = docs;
                    console.log('Saving CDoc for task:', task.id, docs.length, 'docs');
                }
            }
        });
        subtasks.forEach(function (subtask) {
            if (subtask.id) {
                var docs = taskDocuments.get(subtask.row);
                if (docs && docs.length > 0) {
                    data_1.cdocDocuments[subtask.id] = docs;
                    console.log('Saving CDoc for subtask:', subtask.id, docs.length, 'docs');
                }
            }
        });
        // Save TDoc documents by ID
        tasks.forEach(function (task) {
            if (task.id) {
                var docs = taskTDocDocuments.get(task.row);
                if (docs && docs.length > 0) {
                    data_1.tdocDocuments[task.id] = docs;
                    console.log('Saving TDoc for task:', task.id, docs.length, 'docs');
                }
            }
        });
        subtasks.forEach(function (subtask) {
            if (subtask.id) {
                var docs = taskTDocDocuments.get(subtask.row);
                if (docs && docs.length > 0) {
                    data_1.tdocDocuments[subtask.id] = docs;
                    console.log('Saving TDoc for subtask:', subtask.id, docs.length, 'docs');
                }
            }
        });
        // Save Linked Accounts by ID
        tasks.forEach(function (task) {
            if (task.id) {
                var accounts = taskAccounts.get(task.row);
                if (accounts && accounts.length > 0) {
                    data_1.linkedAccountsMap[task.id] = accounts;
                    console.log('Saving Linked Accounts for task:', task.id, accounts);
                }
                else if (task.linkedAccounts) {
                    // Also check if accounts are stored in task object
                    data_1.linkedAccountsMap[task.id] = task.linkedAccounts;
                }
            }
        });
        taskAccounts.forEach(function (value, key) {
            if (typeof key === 'string' && !data_1.linkedAccountsMap[key]) {
                data_1.linkedAccountsMap[key] = value;
                console.log('Saving Linked Accounts by string key:', key, value);
            }
        });
        localStorage.setItem('taskViewerData', JSON.stringify(data_1));
        console.log('All data saved to localStorage');
    }
    catch (e) {
        console.error('Error saving data:', e);
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
        // Clear existing data
        var tbody = document.getElementById('mainTableBody');
        if (tbody)
            tbody.innerHTML = '';
        mainLists = [];
        subLists = [];
        tasks = [];
        subtasks = [];
        // Clear existing document and account maps
        taskDocuments.clear();
        taskTDocDocuments.clear();
        taskAccounts.clear();
        // Recreate main lists
        if (data_2.mainLists) {
            data_2.mainLists.forEach(function (mainListData) {
                var mainList = {
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
        // Recreate tasks
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
                        row: null,
                        checkbox: null,
                        statusBadge: null,
                        dueDateCell: null,
                        daysCell: null,
                        taskNameCell: null
                    };
                    subList.tasks.push(task);
                    tasks.push(task);
                    createTaskRow(task, subList);
                }
            });
        }
        // Restore documents and accounts after all rows are created
        setTimeout(function () {
            console.log('Restoring documents and accounts...');
            // Restore CDoc documents
            if (data_2.cdocDocuments) {
                console.log('CDoc documents found:', Object.keys(data_2.cdocDocuments).length);
                tasks.forEach(function (task) {
                    if (task.id && data_2.cdocDocuments[task.id]) {
                        console.log('Restoring CDoc for task:', task.id, data_2.cdocDocuments[task.id].length, 'docs');
                        taskDocuments.set(task.row, data_2.cdocDocuments[task.id]);
                    }
                });
                subtasks.forEach(function (subtask) {
                    if (subtask.id && data_2.cdocDocuments[subtask.id]) {
                        console.log('Restoring CDoc for subtask:', subtask.id, data_2.cdocDocuments[subtask.id].length, 'docs');
                        taskDocuments.set(subtask.row, data_2.cdocDocuments[subtask.id]);
                    }
                });
            }
            // Restore TDoc documents
            if (data_2.tdocDocuments) {
                console.log('TDoc documents found:', Object.keys(data_2.tdocDocuments).length);
                tasks.forEach(function (task) {
                    if (task.id && data_2.tdocDocuments[task.id]) {
                        console.log('Restoring TDoc for task:', task.id, data_2.tdocDocuments[task.id].length, 'docs');
                        taskTDocDocuments.set(task.row, data_2.tdocDocuments[task.id]);
                    }
                });
                subtasks.forEach(function (subtask) {
                    if (subtask.id && data_2.tdocDocuments[subtask.id]) {
                        console.log('Restoring TDoc for subtask:', subtask.id, data_2.tdocDocuments[subtask.id].length, 'docs');
                        taskTDocDocuments.set(subtask.row, data_2.tdocDocuments[subtask.id]);
                    }
                });
            }
            // Restore Linked Accounts
            if (data_2.linkedAccountsMap) {
                console.log('Linked accounts found:', Object.keys(data_2.linkedAccountsMap).length);
                tasks.forEach(function (task) {
                    if (task.id) {
                        // Check if accounts exist for this task ID
                        if (data_2.linkedAccountsMap[task.id]) {
                            console.log('Restoring accounts for task:', task.id, data_2.linkedAccountsMap[task.id]);
                            taskAccounts.set(task.row, data_2.linkedAccountsMap[task.id]);
                            // Also store in task object
                            if (Array.isArray(data_2.linkedAccountsMap[task.id])) {
                                task.linkedAccounts = data_2.linkedAccountsMap[task.id];
                            }
                        }
                    }
                });
                // Also check for accounts stored with row ID as key
                taskAccounts.forEach(function (value, key) {
                    if (typeof key === 'string') {
                        console.log('Found accounts with string key:', key);
                    }
                });
            }
            // Restore comments
            if (data_2.taskComments) {
                Object.assign(taskComments, data_2.taskComments);
            }
            // Update the UI to show restored documents and accounts
            console.log('Updating UI columns...');
            updateTDocColumn();
            updateCDocColumn();
            refreshLinkedAccountsColumn();
            showNotification('Data restored successfully');
        }, 500);
        console.log('All data loaded from localStorage');
        return true;
    }
    catch (e) {
        console.error('Error loading data:', e);
        return false;
    }
}
function findRowById(id) {
    // Try to find by task ID
    var task = tasks.find(function (t) { return t.id === id; });
    if (task && task.row)
        return task.row;
    // Try to find by data attribute
    var row = document.querySelector("[data-task-id=\"".concat(id, "\"], [data-subtask-id=\"").concat(id, "\"]"));
    if (row)
        return row;
    return null;
}
// Auto-save after any data modification
function setupAutoSave() {
    // Save after any operation that modifies data
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
    // Also save on status changes, user assignments, etc.
    document.addEventListener('click', function (e) {
        var target = e.target;
        if (target.closest('.skystemtaskmaster-status-badge') ||
            target.closest('.skystemtaskmaster-badge')) {
            setTimeout(function () { return saveAllData(); }, 200);
        }
    });
}
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
// Create SubList Row - NOTE: This is the main implementation, not a duplicate
// The previous duplicate declaration has been removed
function showCreateTaskModal(subList) {
    var modal = document.getElementById('createTaskModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createTaskModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 700px; max-height: 80vh; overflow-y: auto;\">\n                <span class=\"close\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-bottom: 20px;\">Create Task</h3>\n                \n                <div style=\"margin: 20px 0;\">\n                    <!-- Basic Info Section -->\n                    <div style=\"background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;\">\n                        <h4 style=\"margin-top: 0; margin-bottom: 15px; color: #333;\">Basic Information</h4>\n                        \n                        <div style=\"margin-bottom: 15px;\">\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Task Name *</label>\n                            <input type=\"text\" id=\"taskNameInput\" placeholder=\"Enter task name\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                        \n                        <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Task Number</label>\n                                <input type=\"text\" id=\"taskNumberInput\" value=\"TSK-".concat(Math.floor(100 + Math.random() * 900), "\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Task Owner</label>\n                                <select id=\"taskOwnerInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                    <option value=\"PK\">PK - Palakh Khanna</option>\n                                    <option value=\"SM\">SM - Sarah Miller</option>\n                                    <option value=\"MP\">MP - Mel Preparer</option>\n                                    <option value=\"PP\">PP - Poppy Pan</option>\n                                    <option value=\"JS\">JS - John Smith</option>\n                                    <option value=\"EW\">EW - Emma Watson</option>\n                                    <option value=\"DB\">DB - David Brown</option>\n                                </select>\n                            </div>\n                        </div>\n                        \n                        <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Task Status</label>\n                                <select id=\"taskStatusInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                    <option value=\"Not Started\">Not Started</option>\n                                    <option value=\"In Progress\">In Progress</option>\n                                    <option value=\"Completed\">Completed</option>\n                                    <option value=\"Review\">Review</option>\n                                    <option value=\"Approved\">Approved</option>\n                                    <option value=\"Rejected\">Rejected</option>\n                                </select>\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Reviewer</label>\n                                <select id=\"taskReviewerInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                    <option value=\"PK\">PK - Palakh Khanna</option>\n                                    <option value=\"SM\">SM - Sarah Miller</option>\n                                    <option value=\"MP\">MP - Mel Preparer</option>\n                                    <option value=\"PP\">PP - Poppy Pan</option>\n                                    <option value=\"JS\">JS - John Smith</option>\n                                    <option value=\"EW\">EW - Emma Watson</option>\n                                    <option value=\"DB\">DB - David Brown</option>\n                                </select>\n                            </div>\n                        </div>\n                    </div>\n                    \n                    <!-- Document Section -->\n                    <div style=\"background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;\">\n                        <h4 style=\"margin-top: 0; margin-bottom: 15px; color: #333;\">Documents</h4>\n                        \n                        <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Task Doc (TDoc)</label>\n                                <input type=\"text\" id=\"taskTdocInput\" value=\"0\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Completion Doc (CDoc)</label>\n                                <input type=\"text\" id=\"taskCdocInput\" value=\"0\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                        </div>\n                    </div>\n                    \n                    <!-- Dates Section -->\n                    <div style=\"background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;\">\n                        <h4 style=\"margin-top: 0; margin-bottom: 15px; color: #333;\">Dates</h4>\n                        \n                        <div style=\"display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Due Date</label>\n                                <input type=\"date\" id=\"taskDueDateInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Assignee Due Date</label>\n                                <input type=\"date\" id=\"taskAssigneeDueDateInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Reviewer Due Date</label>\n                                <input type=\"date\" id=\"taskReviewerDueDateInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                        </div>\n                        \n                        <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px;\">\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Completion Date</label>\n                                <input type=\"date\" id=\"taskCompletionDateInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Recurrence Type</label>\n                                <select id=\"taskRecurrenceTypeInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                    <option value=\"None\">None</option>\n                                    <option value=\"Daily\">Daily</option>\n                                    <option value=\"Weekly\">Weekly</option>\n                                    <option value=\"Monthly\">Monthly</option>\n                                    <option value=\"Quarterly\">Quarterly</option>\n                                    <option value=\"Yearly\">Yearly</option>\n                                </select>\n                            </div>\n                        </div>\n                    </div>\n                    \n                    <!-- Additional Fields Section -->\n                    <div style=\"background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;\">\n                        <h4 style=\"margin-top: 0; margin-bottom: 15px; color: #333;\">Additional Information</h4>\n                        \n                        <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Approver</label>\n                                <select id=\"taskApproverInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                    <option value=\"\u2014\">None</option>\n                                    <option value=\"PK\">PK - Palakh Khanna</option>\n                                    <option value=\"SM\">SM - Sarah Miller</option>\n                                    <option value=\"PP\">PP - Poppy Pan</option>\n                                </select>\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Created By</label>\n                                <select id=\"taskCreatedByInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                    <option value=\"PK\">PK - Palakh Khanna</option>\n                                    <option value=\"SM\">SM - Sarah Miller</option>\n                                    <option value=\"MP\">MP - Mel Preparer</option>\n                                </select>\n                            </div>\n                        </div>\n                        \n                        <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Notifier</label>\n                                <select id=\"taskNotifierInput\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                    <option value=\"\u2014\">None</option>\n                                    <option value=\"PK\">PK - Palakh Khanna</option>\n                                    <option value=\"SM\">SM - Sarah Miller</option>\n                                    <option value=\"MP\">MP - Mel Preparer</option>\n                                </select>\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Linked Accounts</label>\n                                <input type=\"text\" id=\"taskLinkedAccountsInput\" placeholder=\"e.g., ACC-101, ACC-102\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                        </div>\n                        \n                        <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Custom Field #1</label>\n                                <input type=\"text\" id=\"taskCustomField1Input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                            <div>\n                                <label style=\"display: block; margin-bottom: 5px;\">Custom Field #2</label>\n                                <input type=\"text\" id=\"taskCustomField2Input\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            </div>\n                        </div>\n                        \n                        <div>\n                            <label style=\"display: block; margin-bottom: 5px;\">Comment</label>\n                            <textarea id=\"taskCommentInput\" rows=\"3\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"Add any comments...\"></textarea>\n                        </div>\n                    </div>\n                    \n                    <button id=\"createTaskBtn\" style=\"background: #ff0080; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; font-weight: 500;\">Create Task</button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(modal);
        // Close button
        modal.querySelector('.close').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        // Create task button
        document.getElementById('createTaskBtn').addEventListener('click', function () {
            var currentSubListId = modal.getAttribute('data-current-sublist-id');
            var currentSubList = subLists.find(function (s) { return s.id === currentSubListId; });
            if (!currentSubList) {
                alert('Error: Sub list not found');
                return;
            }
            var taskName = document.getElementById('taskNameInput').value.trim();
            if (!taskName) {
                alert('Please enter a task name');
                return;
            }
            var taskData = {
                name: taskName,
                taskNumber: document.getElementById('taskNumberInput').value || 'TSK-' + Math.floor(100 + Math.random() * 900),
                taskOwner: document.getElementById('taskOwnerInput').value,
                owner: document.getElementById('taskOwnerInput').value,
                taskStatus: document.getElementById('taskStatusInput').value,
                status: document.getElementById('taskStatusInput').value,
                reviewer: document.getElementById('taskReviewerInput').value,
                tdoc: document.getElementById('taskTdocInput').value || '0',
                completionDoc: document.getElementById('taskCdocInput').value || '0',
                cdoc: document.getElementById('taskCdocInput').value || '0',
                dueDate: document.getElementById('taskDueDateInput').value,
                assigneeDueDate: document.getElementById('taskAssigneeDueDateInput').value || document.getElementById('taskDueDateInput').value,
                reviewerDueDate: document.getElementById('taskReviewerDueDateInput').value,
                completionDate: document.getElementById('taskCompletionDateInput').value,
                recurrenceType: document.getElementById('taskRecurrenceTypeInput').value,
                approver: document.getElementById('taskApproverInput').value,
                createdBy: document.getElementById('taskCreatedByInput').value,
                notifier: document.getElementById('taskNotifierInput').value,
                linkedAccounts: document.getElementById('taskLinkedAccountsInput').value,
                customField1: document.getElementById('taskCustomField1Input').value,
                customField2: document.getElementById('taskCustomField2Input').value,
                comment: document.getElementById('taskCommentInput').value,
                acc: '+',
                days: '0'
            };
            createTask(currentSubList, taskData);
            modal.style.display = 'none';
            // Clear form
            document.getElementById('taskNameInput').value = '';
            document.getElementById('taskNumberInput').value = 'TSK-' + Math.floor(100 + Math.random() * 900);
            document.getElementById('taskDueDateInput').value = '';
            document.getElementById('taskAssigneeDueDateInput').value = '';
            document.getElementById('taskReviewerDueDateInput').value = '';
            document.getElementById('taskCompletionDateInput').value = '';
            document.getElementById('taskLinkedAccountsInput').value = '';
            document.getElementById('taskCustomField1Input').value = '';
            document.getElementById('taskCustomField2Input').value = '';
            document.getElementById('taskCommentInput').value = '';
            document.getElementById('taskTdocInput').value = '0';
            document.getElementById('taskCdocInput').value = '0';
        });
    }
    // Set current sublist ID in modal's data attribute
    modal.setAttribute('data-current-sublist-id', subList.id);
    // Update modal title
    var modalTitle = modal.querySelector('h3');
    if (modalTitle) {
        modalTitle.textContent = "Create Task for \"".concat(subList.name, "\"");
    }
    // Generate a random task number
    var taskNumberInput = document.getElementById('taskNumberInput');
    if (taskNumberInput) {
        taskNumberInput.value = 'TSK-' + Math.floor(100 + Math.random() * 900);
    }
    modal.style.display = 'block';
}
// Note: setupUploadHandlers function is defined later in the file
// Only one definition exists
function addExtraColumnsForRow(row, task) {
    // Remove existing extra cells
    row.querySelectorAll('.extra-cell').forEach(function (cell) { return cell.remove(); });
    // Add extra cells with actual data
    columnConfig.forEach(function (col) {
        var baseColumns = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
        if (baseColumns.indexOf(col.key) === -1) {
            var cell = document.createElement('td');
            cell.className = 'extra-cell';
            cell.setAttribute('data-column', col.key);
            // Get actual value based on column key
            var value = getTaskColumnValue(task, col.key);
            cell.textContent = value;
            cell.style.display = col.visible ? '' : 'none';
            row.appendChild(cell);
        }
    });
}
function createTaskRow(task, subList) {
    var tbody = document.getElementById('mainTableBody');
    if (!tbody)
        throw new Error('Table body not found');
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
    // Define recurring options
    var recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
    var isRecurring = recurringOptions.indexOf(task.recurrenceType || '') >= 0;
    // Add recurrence class based on recurrenceType
    if (isRecurring) {
        row.classList.add('recurring-task');
    }
    else {
        row.classList.add('non-recurring-task');
    }
    row.setAttribute('data-task-id', task.id || '');
    row.setAttribute('data-sublist-id', subList.id);
    row.setAttribute('data-recurrence-type', task.recurrenceType || 'None');
    var rowHTML = "\n        <td>\n            <div class=\"skystemtaskmaster-task-name\" style=\"padding-left: 70px;\">\n                <input type=\"checkbox\" class=\"task-checkbox\">\n                <span>".concat(task.name, "</span>\n            </div>\n        </td>\n        <td><span style=\"color: #ff0080; font-weight: bold;\">").concat(task.acc, "</span></td>\n        <td class=\"tdoc-cell\">").concat(task.tdoc, "</td>\n        <td class=\"skystemtaskmaster-editable due-date\">").concat(formattedDueDate, "</td>\n        <td><span class=\"skystemtaskmaster-status-badge skystemtaskmaster-status-not-started\">").concat(task.status, "</span></td>\n        <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat((task.owner || 'PK').toLowerCase(), "\">").concat(task.owner, "</span></td>\n        <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat((task.reviewer || 'SM').toLowerCase(), "\">").concat(task.reviewer, "</span></td>\n        <td class=\"cdoc-cell\">0</td>\n        <td class=\"days-cell ").concat(daysClass, "\">").concat(daysText, "</td>\n    ");
    row.innerHTML = rowHTML;
    task.row = row;
    // Insert row in correct position
    var insertAfter = subList.row;
    while (insertAfter && insertAfter.nextSibling) {
        var next = insertAfter.nextSibling;
        if (next.classList && (next.classList.contains('sub-list-row') || next.classList.contains('main-list-row')))
            break;
        insertAfter = next;
    }
    if (insertAfter && insertAfter.nextSibling) {
        tbody.insertBefore(row, insertAfter.nextSibling);
    }
    else {
        tbody.appendChild(row);
    }
    taskDocuments.set(row, []);
    taskTDocDocuments.set(row, []);
    addTaskEventListeners(task);
    // Add extra columns with actual data
    setTimeout(function () {
        addExtraColumnsForRow(row, task);
        addDataCells();
        applyVisibility();
    }, 100);
    return row;
}
// Add styles for recurrence indicators
function addRecurrenceStyles() {
    // Check if styles already exist
    if (document.getElementById('recurrence-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'recurrence-styles';
    style.textContent = "\n        /* Recurring tasks - Gray bar */\n        .task-row.recurring-task {\n            border-left: 4px solid #808080 !important;\n        }\n        \n        /* Non-recurring tasks - Blue bar */\n        .task-row.non-recurring-task {\n            border-left: 4px solid #00cfff !important;\n        }\n        \n        /* Subtasks styling */\n        .subtask-row.recurring-task {\n            border-left: 4px solid #808080 !important;\n        }\n        \n        .subtask-row.non-recurring-task {\n            border-left: 4px solid #00cfff !important;\n        }\n        \n        /* Ensure the border doesn't get overridden */\n        .task-row, .subtask-row {\n            position: relative;\n            transition: border-left-width 0.2s;\n        }\n        \n        /* Hover effect to emphasize the indicator */\n        .task-row:hover, .subtask-row:hover {\n            border-left-width: 6px !important;\n        }\n        \n        /* Style for recurrence column cells */\n        .extra-cell[data-column=\"recurrenceType\"] {\n            font-weight: 500;\n        }\n        \n        /* Recurring values in column */\n        .extra-cell[data-column=\"recurrenceType\"] {\n            color: #666;\n        }\n        \n        .extra-cell[data-column=\"recurrenceType\"]:contains(\"Every Period\"),\n        .extra-cell[data-column=\"recurrenceType\"]:contains(\"Quarterly\"),\n        .extra-cell[data-column=\"recurrenceType\"]:contains(\"Annual\") {\n            color: #808080;\n            font-weight: 600;\n        }\n        \n        .extra-cell[data-column=\"recurrenceType\"]:contains(\"Multiple\"),\n        .extra-cell[data-column=\"recurrenceType\"]:contains(\"Custom\") {\n            color: #00cfff;\n            font-weight: 600;\n        }\n    ";
    document.head.appendChild(style);
}
function toggleMainList(mainList) {
    mainList.isExpanded = !mainList.isExpanded;
    var icon = mainList.row.querySelector('.collapse-icon');
    icon.textContent = mainList.isExpanded ? '▼' : '▶';
    var nextRow = mainList.row.nextSibling;
    while (nextRow) {
        if (nextRow.classList && nextRow.classList.contains('main-list-row'))
            break;
        if (nextRow.style)
            nextRow.style.display = mainList.isExpanded ? '' : 'none';
        nextRow = nextRow.nextSibling;
    }
}
function toggleSubList(subList) {
    subList.isExpanded = !subList.isExpanded;
    var icon = subList.row.querySelector('.collapse-sublist-icon');
    icon.textContent = subList.isExpanded ? '▼' : '▶';
    var nextRow = subList.row.nextSibling;
    while (nextRow) {
        if (nextRow.classList && (nextRow.classList.contains('sub-list-row') || nextRow.classList.contains('main-list-row')))
            break;
        if (nextRow.classList && nextRow.classList.contains('task-row')) {
            nextRow.style.display = subList.isExpanded ? '' : 'none';
        }
        nextRow = nextRow.nextSibling;
    }
}
// ================================
// TASK FUNCTIONS
// ================================
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
    newRow.innerHTML = "\n        <td>\n            <div class=\"skystemtaskmaster-task-name\">\n                <input type=\"checkbox\" class=\"task-checkbox\">\n                <span>".concat(taskName, "</span>\n            </div>\n        </td>\n        <td><span style=\"color: #ff0080; font-weight: bold;\">").concat(acc, "</span></td>\n        <td class=\"tdoc-cell\">").concat(tdoc, "</td>\n        <td class=\"skystemtaskmaster-editable due-date\" contenteditable=\"true\">").concat(formattedDueDate, "</td>\n        <td><span class=\"skystemtaskmaster-status-badge skystemtaskmaster-status-not-started\">Not Started</span></td>\n        <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(owner.toLowerCase(), "\">").concat(owner, "</span></td>\n        <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(reviewer.toLowerCase(), "\">").concat(reviewer, "</span></td>\n        <td class=\"cdoc-cell\">0</td>\n        <td class=\"days-cell ").concat(daysClass, "\">").concat(daysText, "</td>\n    ");
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
        makeRowDraggable(newRow, 'task');
        setTimeout(function () {
            taskAccounts.set(newRow, []);
            addAccountColumnToTasks();
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
        if (typeof updateTDocColumn !== 'undefined')
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
        // FIX: Generate a proper unique ID
        var subtaskId = 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        newRow.setAttribute('data-subtask-id', subtaskId);
        var defaultStatus = "Not Started";
        var statusClass = 'skystemtaskmaster-status-not-started';
        newRow.innerHTML = "\n            <td colspan=\"3\">\n                <div class=\"skystemtaskmaster-task-name\">\n                    <input type=\"checkbox\" class=\"subtask-checkbox\">\n                    <span>".concat(subtaskName, "</span>\n                </div>\n            </td>\n            <td></td>\n            <td class=\"tdoc-cell\">").concat(tdoc, "</td>\n            <td>Set due date</td>\n            <td><span class=\"skystemtaskmaster-status-badge ").concat(statusClass, "\">").concat(defaultStatus, "</span></td>\n            <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(owner.toLowerCase(), "\">").concat(owner, "</span></td>\n            <td><span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(reviewer.toLowerCase(), "\">").concat(reviewer, "</span></td>\n        ");
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
            makeRowDraggable(newRow, 'subtask');
        }
        updateCounts();
        addDataCells();
        applyVisibility();
        setTimeout(function () {
            if (typeof updateCDocColumn !== 'undefined')
                updateCDocColumn();
            if (typeof updateTDocColumn !== 'undefined')
                updateTDocColumn();
        }, 100);
        var addSubtaskModal = document.getElementById('addSubtaskModal');
        addSubtaskModal.style.display = 'none';
        document.getElementById('subtaskName').value = '';
        document.getElementById('subtaskOwner').value = 'PK';
        document.getElementById('subtaskReviewer').value = 'SM';
        document.getElementById('subtaskTdoc').value = '';
        showNotification("Subtask \"".concat(subtaskName, "\" added successfully"));
        // Auto-save after adding subtask
        setTimeout(function () { return saveAllData(); }, 100);
    }
}
function initializeDragAndDrop() {
    console.log('Initializing Drag and Drop...');
    tasks.forEach(function (task) {
        makeRowDraggable(task.row, 'task');
    });
    subtasks.forEach(function (subtask) {
        makeRowDraggable(subtask.row, 'subtask');
    });
    var subtaskHeader = document.getElementById('subtaskHeader');
    if (subtaskHeader) {
        // Do something with subtaskHeader if needed
    }
    // Add drag styles
    addDragStyles();
}
// ================================
// 3-DOT DROPDOWN MENU FUNCTIONS
// ================================
function initializeThreeDotsMenu() {
    var _a, _b;
    var threeDotsBtn = document.getElementById('threeDotsBtn');
    var dropdown = document.getElementById('threeDotsDropdown');
    if (!threeDotsBtn || !dropdown)
        return;
    // Toggle dropdown
    threeDotsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        var target = e.target;
        if (!threeDotsBtn.contains(target) && !dropdown.contains(target)) {
            dropdown.classList.remove('show');
        }
    });
    // Download submenu items
    document.querySelectorAll('.submenu-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            var format = item.dataset.format;
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
        var filterItem = Array.from(document.querySelectorAll('.dropdown-item')).find(function (item) { return item.textContent && item.textContent.indexOf('Filter') >= 0; });
        if (filterItem) {
            filterItem.addEventListener('click', function (e) {
                e.stopPropagation();
                showFilterPanel();
                dropdown.classList.remove('show');
            });
        }
    }
    // Delete option
    (_a = document.getElementById('dropdownDelete')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        deleteSelectedItems();
        dropdown.classList.remove('show');
    });
    // Custom Grid option
    (_b = document.getElementById('dropdownCustomGrid')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        showCustomizeGridModal();
        dropdown.classList.remove('show');
    });
}
function handleDownload(format) {
    switch (format) {
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
function deleteSelectedItems() {
    var _a, _b, _c, _d, _e;
    var deleted = 0;
    // Delete lists first (they will delete their children too)
    // Delete main lists
    for (var i = mainLists.length - 1; i >= 0; i--) {
        var mainList = mainLists[i];
        var checkbox = (_a = mainList.row) === null || _a === void 0 ? void 0 : _a.querySelector('.list-checkbox');
        if (checkbox && checkbox.checked) {
            // Delete all sublists and tasks under this main list
            mainList.subLists.forEach(function (subList) {
                var _a, _b;
                // Delete tasks in this sublist
                for (var j = tasks.length - 1; j >= 0; j--) {
                    if (tasks[j].subListId === subList.id) {
                        (_a = tasks[j].row) === null || _a === void 0 ? void 0 : _a.remove();
                        tasks.splice(j, 1);
                        deleted++;
                    }
                }
                // Remove sublist from subLists array
                var subIndex = subLists.findIndex(function (s) { return s.id === subList.id; });
                if (subIndex !== -1) {
                    subLists.splice(subIndex, 1);
                    deleted++;
                }
                // Remove sublist row
                (_b = subList.row) === null || _b === void 0 ? void 0 : _b.remove();
            });
            // Remove main list row
            (_b = mainList.row) === null || _b === void 0 ? void 0 : _b.remove();
            mainLists.splice(i, 1);
            deleted++;
            continue;
        }
    }
    var _loop_1 = function (i) {
        var subList = subLists[i];
        var checkbox = (_c = subList.row) === null || _c === void 0 ? void 0 : _c.querySelector('.sublist-checkbox');
        if (checkbox && checkbox.checked) {
            // Delete tasks in this sublist
            for (var j = tasks.length - 1; j >= 0; j--) {
                if (tasks[j].subListId === subList.id) {
                    (_d = tasks[j].row) === null || _d === void 0 ? void 0 : _d.remove();
                    tasks.splice(j, 1);
                    deleted++;
                }
            }
            // Remove from parent main list
            var mainList = mainLists.find(function (m) { return m.id === subList.mainListId; });
            if (mainList) {
                var subIndex = mainList.subLists.findIndex(function (s) { return s.id === subList.id; });
                if (subIndex !== -1)
                    mainList.subLists.splice(subIndex, 1);
            }
            // Remove sublist
            (_e = subList.row) === null || _e === void 0 ? void 0 : _e.remove();
            subLists.splice(i, 1);
            deleted++;
        }
    };
    // Delete sublists
    for (var i = subLists.length - 1; i >= 0; i--) {
        _loop_1(i);
    }
    var _loop_2 = function (i) {
        var task = tasks[i];
        var checkbox = task.row.querySelector('.task-checkbox');
        if (checkbox && checkbox.checked) {
            // Remove from parent sublist
            var subList = subLists.find(function (s) { return s.id === task.subListId; });
            if (subList) {
                var taskIndex = subList.tasks.findIndex(function (t) { return t.id === task.id; });
                if (taskIndex !== -1)
                    subList.tasks.splice(taskIndex, 1);
            }
            task.row.remove();
            tasks.splice(i, 1);
            deleted++;
        }
    };
    // Delete tasks
    for (var i = tasks.length - 1; i >= 0; i--) {
        _loop_2(i);
    }
    // Delete subtasks
    for (var i = subtasks.length - 1; i >= 0; i--) {
        var subtask = subtasks[i];
        var checkbox = subtask.row.querySelector('.subtask-checkbox');
        if (checkbox && checkbox.checked) {
            subtask.row.remove();
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
    return deleted;
}
function downloadAsJson() {
    var _a;
    var table = document.getElementById('mainTable');
    if (!table)
        return;
    var data = [];
    var rows = table.querySelectorAll('tr');
    // Get headers
    var headers = [];
    var headerRow = rows[0].querySelectorAll('th');
    headerRow.forEach(function (th) {
        var _a;
        if (th.style.display !== 'none') {
            headers.push(((_a = th.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '');
        }
    });
    // Get data rows
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
    // Convert to JSON and download
    var jsonStr = JSON.stringify(data, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.json';
    a.click();
    showNotification('Downloaded as JSON');
}
// ================================
// UTILITY FUNCTIONS
// ================================
function makeCellsEditable(row) {
    var cells = [row.cells[1], row.cells[3], row.cells[7]];
    cells.forEach(function (cell) {
        if (cell) {
            cell.classList.add('skystemtaskmaster-editable');
            cell.setAttribute('contenteditable', 'true');
        }
    });
}
function makeExistingTasksEditable() {
    tasks.forEach(function (task) { return makeCellsEditable(task.row); });
}
function showNotification(message) {
    var notification = document.querySelector('.skystemtaskmaster-notification');
    if (notification)
        notification.remove();
    notification = document.createElement('div');
    notification.className = 'skystemtaskmaster-notification';
    notification.style.cssText = "\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        background: #ff0080;\n        color: white;\n        padding: 12px 24px;\n        border-radius: 4px;\n        box-shadow: 0 2px 10px rgba(0,0,0,0.2);\n        z-index: 2000;\n        animation: slideIn 0.3s ease;\n    ";
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(function () {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function () { return notification.remove(); }, 300);
    }, 3000);
}
// Enhanced updateCounts function with better status detection
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
    // Check DOM directly as fallback
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
    // Update DOM
    var completedEl = document.getElementById("completedCount");
    var inProgressEl = document.getElementById("inProgressCount");
    var notStartedEl = document.getElementById("notStartedCount");
    console.log('DOM elements found:', {
        completed: completedEl,
        inProgress: inProgressEl,
        notStarted: notStartedEl
    });
    if (completedEl) {
        completedEl.innerText = completed.toString();
        // Add animation
        completedEl.style.transform = 'scale(1.2)';
        setTimeout(function () { return completedEl.style.transform = 'scale(1)'; }, 200);
    }
    if (inProgressEl) {
        inProgressEl.innerText = inProgress.toString();
        inProgressEl.style.transform = 'scale(1.2)';
        setTimeout(function () { return inProgressEl.style.transform = 'scale(1)'; }, 200);
    }
    if (notStartedEl) {
        notStartedEl.innerText = notStarted.toString();
        notStartedEl.style.transform = 'scale(1.2)';
        setTimeout(function () { return notStartedEl.style.transform = 'scale(1)'; }, 200);
    }
}
function calculateDays() {
    var today = new Date();
    tasks.forEach(function (task) {
        var dueText = task.dueDateCell.innerText;
        if (dueText === 'Set due date')
            return;
        var dueDate = new Date(dueText);
        var diffTime = dueDate.getTime() - today.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (!isNaN(diffDays)) {
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
function showCustomizeGridModal() {
    var modal = document.getElementById('customizeGridModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customizeGridModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content\">\n                <span class=\"close\">&times;</span>\n                <h3>Customize Grid</h3>\n                \n                <div style=\"margin: 20px 0; max-height: 400px; overflow-y: auto;\">\n                    <div style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;\">\n                        ".concat(columnConfig.map(function (col) { return "\n                            <div style=\"display: flex; align-items: center; gap: 8px; padding: 5px;\">\n                                <input type=\"checkbox\" \n                                    id=\"col_".concat(col.key, "\" \n                                    ").concat(col.visible ? 'checked' : '', " \n                                    ").concat(col.mandatory ? 'disabled' : '', ">\n                                <label for=\"col_").concat(col.key, "\">\n                                    ").concat(col.label, "\n                                    ").concat(!col.forSubtask ? ' (tasks only)' : '', "\n                                </label>\n                            </div>\n                        "); }).join(''), "\n                    </div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;\">\n                    <button id=\"resetGridBtn\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Reset</button>\n                    <button id=\"saveGridBtn\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Save Changes</button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(modal);
        modal.querySelector('.close').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        window.addEventListener('click', function (e) {
            if (e.target === modal)
                modal.style.display = 'none';
        });
        document.getElementById('saveGridBtn').addEventListener('click', function () {
            columnConfig.forEach(function (col) {
                var checkbox = document.getElementById("col_".concat(col.key));
                if (checkbox && !col.mandatory)
                    col.visible = checkbox.checked;
            });
            // Save to localStorage
            saveColumnVisibility();
            addExtraColumns();
            addDataCells();
            applyVisibility();
            // Update all sub-list rows colspan
            updateSublistRowsColspan();
            modal.style.display = 'none';
            showNotification('Grid layout updated successfully!');
        });
        document.getElementById('resetGridBtn').addEventListener('click', function () {
            columnConfig.forEach(function (col) {
                var base = ['taskName', 'acc', 'tdoc', 'dueDate', 'status', 'owner', 'reviewer', 'cdoc', 'days'];
                col.visible = base.indexOf(col.key) !== -1;
            });
            columnConfig.forEach(function (col) {
                var cb = document.getElementById("col_".concat(col.key));
                if (cb && !col.mandatory)
                    cb.checked = col.visible;
            });
        });
    }
    modal.style.display = 'block';
}
// ================================
// TDOC DOCUMENT FUNCTIONS
// ================================
function updateTDocColumn() {
    console.log('Updating TDoc column with Font Awesome icons...');
    tasks.forEach(function (task) {
        if (!task.row)
            return;
        var tdocCell = task.row.cells[2];
        if (!tdocCell)
            return;
        tdocCell.innerHTML = '';
        tdocCell.style.textAlign = 'center';
        var docs = taskTDocDocuments.get(task.row) || [];
        // Create icon container
        var iconContainer = document.createElement('span');
        iconContainer.className = 'tdoc-icon-container';
        iconContainer.style.cssText = "\n            cursor: pointer;\n            display: inline-block;\n            position: relative;\n            padding: 5px;\n        ";
        var icon = document.createElement('i');
        icon.className = docs.length > 0 ? 'fas fa-file-alt' : 'fas fa-file-alt';
        icon.style.cssText = "\n            font-size: 20px;\n            color: ".concat(docs.length > 0 ? '#00cfff' : '#999', ";\n            transition: all 0.2s;\n        ");
        // Add "plus" effect for empty state
        if (docs.length === 0) {
            icon.style.opacity = '0.7';
            icon.title = 'Click to upload documents';
        }
        else {
            icon.title = "".concat(docs.length, " document(s) attached");
        }
        iconContainer.appendChild(icon);
        // Add count badge if documents exist
        if (docs.length > 0) {
            var badge = document.createElement('span');
            badge.className = 'tdoc-badge';
            badge.textContent = docs.length.toString();
            badge.style.cssText = "\n                position: absolute;\n                top: -5px;\n                right: -5px;\n                background: #00cfff;\n                color: white;\n                font-size: 10px;\n                font-weight: bold;\n                padding: 2px 5px;\n                border-radius: 10px;\n                min-width: 15px;\n                text-align: center;\n                box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n            ";
            iconContainer.appendChild(badge);
        }
        else {
            var plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle';
            plusIcon.style.cssText = "\n                position: absolute;\n                bottom: -5px;\n                right: -5px;\n                font-size: 12px;\n                color: #ff0080;\n                background: white;\n                border-radius: 50%;\n            ";
            iconContainer.appendChild(plusIcon);
        }
        // Add click handler
        iconContainer.onclick = function (e) {
            e.stopPropagation();
            e.preventDefault();
            console.log('TDoc icon clicked');
            showTDocDocumentManager(task.row);
        };
        // Add hover effects
        iconContainer.onmouseenter = function () {
            icon.style.transform = 'scale(1.1)';
            icon.style.filter = 'drop-shadow(0 2px 4px rgba(0,207,255,0.3))';
        };
        iconContainer.onmouseleave = function () {
            icon.style.transform = 'scale(1)';
            icon.style.filter = 'none';
        };
        tdocCell.appendChild(iconContainer);
    });
    subtasks.forEach(function (subtask) {
        if (!subtask.row)
            return;
        var tdocCell = subtask.row.cells[2];
        if (!tdocCell)
            return;
        tdocCell.innerHTML = '';
        tdocCell.style.textAlign = 'center';
        var docs = taskTDocDocuments.get(subtask.row) || [];
        var iconContainer = document.createElement('span');
        iconContainer.className = 'tdoc-icon-container';
        iconContainer.style.cssText = "\n            cursor: pointer;\n            display: inline-block;\n            position: relative;\n            padding: 5px;\n        ";
        var icon = document.createElement('i');
        icon.className = 'fas fa-file-alt';
        icon.style.cssText = "\n            font-size: 20px;\n            color: ".concat(docs.length > 0 ? '#00cfff' : '#999', ";\n            transition: all 0.2s;\n        ");
        if (docs.length === 0) {
            icon.style.opacity = '0.7';
            icon.title = 'Click to upload documents';
        }
        else {
            icon.title = "".concat(docs.length, " document(s) attached");
        }
        iconContainer.appendChild(icon);
        if (docs.length > 0) {
            var badge = document.createElement('span');
            badge.className = 'tdoc-badge';
            badge.textContent = docs.length.toString();
            badge.style.cssText = "\n                position: absolute;\n                top: -5px;\n                right: -5px;\n                background: #00cfff;\n                color: white;\n                font-size: 10px;\n                font-weight: bold;\n                padding: 2px 5px;\n                border-radius: 10px;\n                min-width: 15px;\n                text-align: center;\n            ";
            iconContainer.appendChild(badge);
        }
        else {
            var plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle';
            plusIcon.style.cssText = "\n                position: absolute;\n                bottom: -5px;\n                right: -5px;\n                font-size: 12px;\n                color: #ff0080;\n                background: white;\n                border-radius: 50%;\n            ";
            iconContainer.appendChild(plusIcon);
        }
        iconContainer.onclick = function (e) {
            e.stopPropagation();
            e.preventDefault();
            showTDocDocumentManager(subtask.row);
        };
        iconContainer.onmouseenter = function () {
            icon.style.transform = 'scale(1.1)';
        };
        iconContainer.onmouseleave = function () {
            icon.style.transform = 'scale(1)';
        };
        tdocCell.appendChild(iconContainer);
    });
}
function addDocumentStyles() {
    // Check if styles already exist
    if (document.getElementById('document-icon-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'document-icon-styles';
    style.textContent = "\n        .cdoc-icon, .tdoc-icon {\n            cursor: pointer !important;\n            transition: all 0.2s ease !important;\n            position: relative !important;\n            display: inline-block !important;\n            user-select: none !important;\n        }\n        \n        .cdoc-icon:hover, .tdoc-icon:hover {\n            transform: scale(1.15) !important;\n            filter: drop-shadow(0 2px 6px rgba(255,0,128,0.4)) !important;\n        }\n        \n        .tdoc-icon:hover {\n            filter: drop-shadow(0 2px 6px rgba(0,207,255,0.4)) !important;\n        }\n        \n        .doc-badge, .doc-badge-tdoc {\n            position: absolute !important;\n            top: -8px !important;\n            right: -8px !important;\n            color: white !important;\n            font-size: 10px !important;\n            font-weight: bold !important;\n            padding: 2px 5px !important;\n            border-radius: 10px !important;\n            min-width: 15px !important;\n            text-align: center !important;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;\n            z-index: 10 !important;\n            animation: badgePop 0.2s ease !important;\n        }\n        \n        .doc-badge {\n            background: #ff0080 !important;\n        }\n        \n        .doc-badge-tdoc {\n            background: #00cfff !important;\n        }\n        \n        @keyframes badgePop {\n            from {\n                transform: scale(0);\n                opacity: 0;\n            }\n            to {\n                transform: scale(1);\n                opacity: 1;\n            }\n        }\n    ";
    document.head.appendChild(style);
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
        modal.querySelector('.close').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        document.getElementById('tdocCloseManagerBtn').addEventListener('click', function () {
            modal.style.display = 'none';
        });
    }
    modal.setAttribute('data-current-task-row', taskRow.id || Math.random().toString(36));
    window.currentTDocTaskRow = taskRow;
    var listContainer = document.getElementById('tdocDocumentsListContainer');
    if (listContainer) {
        listContainer.innerHTML = renderTDocDocumentsList(docs, taskRow);
    }
    var countSpan = document.getElementById('tdocDocCount');
    if (countSpan)
        countSpan.textContent = docs.length.toString();
    setupTDocUploadHandlers(modal, taskRow);
    modal.style.display = 'block';
}
function renderTDocDocumentsList(docs, taskRow) {
    if (docs.length === 0) {
        return "\n            <div style=\"padding: 40px; text-align: center; color: #999;\">\n                <div style=\"font-size: 48px; margin-bottom: 10px;\">\uD83D\uDCC4</div>\n                <div>No documents attached</div>\n                <div style=\"font-size: 13px; margin-top: 5px;\">Click upload area above to add documents</div>\n            </div>\n        ";
    }
    return "\n        <table style=\"width: 100%; border-collapse: collapse;\">\n            <thead style=\"background: #f5f5f5; position: sticky; top: 0;\">\n                <tr>\n                    <th style=\"padding: 12px; text-align: left; border-bottom: 2px solid #ddd;\">Name</th>\n                    <th style=\"padding: 12px; text-align: left; border-bottom: 2px solid #ddd;\">Size</th>\n                    <th style=\"padding: 12px; text-align: left; border-bottom: 2px solid #ddd;\">Upload Date</th>\n                    <th style=\"padding: 12px; text-align: center; border-bottom: 2px solid #ddd;\">Actions</th>\n                </tr>\n            </thead>\n            <tbody>\n                ".concat(docs.map(function (doc, index) { return "\n                    <tr data-tdoc-doc-index=\"".concat(index, "\">\n                        <td style=\"padding: 12px; border-bottom: 1px solid #eee;\">\n                            <div style=\"display: flex; align-items: center; gap: 10px;\">\n                                <span style=\"font-size: 20px;\">\uD83D\uDCC4</span>\n                                <span style=\"font-weight: 500;\">").concat(doc.name, "</span>\n                            </div>\n                        </td>\n                        <td style=\"padding: 12px; border-bottom: 1px solid #eee;\">").concat((doc.size / 1024).toFixed(1), " KB</td>\n                        <td style=\"padding: 12px; border-bottom: 1px solid #eee;\">\n                            ").concat(doc.uploadDate.toLocaleDateString(), " \n                            <span style=\"color: #999; font-size: 11px;\">").concat(doc.uploadDate.toLocaleTimeString(), "</span>\n                        </td>\n                        <td style=\"padding: 12px; border-bottom: 1px solid #eee; text-align: center;\">\n                            <button class=\"tdoc-view-doc-btn\" data-index=\"").concat(index, "\" style=\"background: none; border: none; color: #ff0080; cursor: pointer; margin: 0 5px; font-size: 18px;\" title=\"View\">\uD83D\uDC41\uFE0F</button>\n                            <button class=\"tdoc-delete-doc-btn\" data-index=\"").concat(index, "\" style=\"background: none; border: none; color: #dc3545; cursor: pointer; margin: 0 5px; font-size: 18px;\" title=\"Delete\">\uD83D\uDDD1</button>\n                        </td>\n                    </tr>\n                "); }).join(''), "\n            </tbody>\n        </table>\n    ");
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
        filesContainer.innerHTML = selectedFiles.map(function (file, index) { return "\n            <div style=\"display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;\">\n                <span>\uD83D\uDCC4 ".concat(file.name, " (").concat((file.size / 1024).toFixed(1), " KB)</span>\n                <button class=\"remove-file\" data-index=\"").concat(index, "\" style=\"background:none; border:none; color:#dc3545; cursor:pointer;\">\u2715</button>\n            </div>\n        "); }).join('');
        filesContainer.querySelectorAll('.remove-file').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var target = e.target;
                var index = parseInt(target.getAttribute('data-index') || '0');
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
        // Get or generate ID
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
function attachTDocDocumentEventListeners(taskRow) {
    document.querySelectorAll('.tdoc-view-doc-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var target = e.target;
            var index = parseInt(target.dataset.index || '0');
            var docs = taskTDocDocuments.get(taskRow) || [];
            if (docs[index])
                previewDocument(docs[index]);
        });
    });
    document.querySelectorAll('.tdoc-delete-doc-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var target = e.target;
            var index = parseInt(target.dataset.index || '0');
            showTDocDeleteConfirmation(taskRow, index);
        });
    });
}
function showTDocDeleteConfirmation(taskRow, index) {
    var docs = taskTDocDocuments.get(taskRow) || [];
    var doc = docs[index];
    if (!doc)
        return;
    var confirmModal = document.getElementById('tdocDeleteConfirmModal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'tdocDeleteConfirmModal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 350px;\">\n                <span class=\"close\">&times;</span>\n                <h3 style=\"color: #ff0080;\">Confirm Delete</h3>\n                \n                <div style=\"margin: 20px 0; text-align: center;\">\n                    <div style=\"font-size: 48px; margin-bottom: 10px;\">\u26A0\uFE0F</div>\n                    <p style=\"margin-bottom: 5px;\">Are you sure you want to delete this document?</p>\n                    <p style=\"color: #666; font-size: 13px;\" id=\"tdocDocNameDisplay\"></p>\n                </div>\n                \n                <div style=\"display: flex; justify-content: center; gap: 10px;\">\n                    <button id=\"tdocCancelDeleteBtn\" style=\"padding: 8px 20px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Cancel</button>\n                    <button id=\"tdocConfirmDeleteBtn\" style=\"padding: 8px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;\">Delete</button>\n                </div>\n            </div>\n        ";
        document.body.appendChild(confirmModal);
        confirmModal.querySelector('.close').addEventListener('click', function () {
            confirmModal.style.display = 'none';
        });
        document.getElementById('tdocCancelDeleteBtn').addEventListener('click', function () {
            confirmModal.style.display = 'none';
        });
        document.getElementById('tdocConfirmDeleteBtn').addEventListener('click', function () {
            var row = window.currentTDocDeleteTaskRow;
            var idx = window.currentTDocDeleteIndex;
            if (row && idx !== undefined)
                deleteTDocDocument(row, idx);
            confirmModal.style.display = 'none';
        });
    }
    var docNameDisplay = document.getElementById('tdocDocNameDisplay');
    if (docNameDisplay)
        docNameDisplay.textContent = "\"".concat(doc.name, "\"");
    window.currentTDocDeleteTaskRow = taskRow;
    window.currentTDocDeleteIndex = index;
    confirmModal.style.display = 'block';
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
function initializeTDocManager() {
    addTDocStyles();
    updateTDocColumn();
}
function addTDocStyles() {
    var style = document.createElement('style');
    style.textContent = "\n        .tdoc-count {\n            cursor: pointer;\n            color: #ff0080;\n            font-weight: bold;\n            font-size: 14px;\n            padding: 4px 8px;\n            display: inline-block;\n            transition: all 0.2s;\n        }\n        \n        .tdoc-count:hover {\n            transform: scale(1.1);\n            background-color: #fff0f5;\n            border-radius: 4px;\n        }\n        \n        #tdocDocumentManagerModal .modal-content {\n            animation: slideIn 0.3s ease;\n        }\n        \n        #tdocDropArea {\n            transition: all 0.3s;\n        }\n        \n        #tdocDropArea.drag-over {\n            border-color: #ff0080 !important;\n            background-color: #fff0f5 !important;\n        }\n        \n        #tdocDocumentsListContainer tr:hover {\n            background-color: #f9f9f9;\n        }\n        \n        .tdoc-view-doc-btn, .tdoc-delete-doc-btn {\n            transition: all 0.2s;\n            opacity: 0.7;\n        }\n        \n        .tdoc-view-doc-btn:hover, .tdoc-delete-doc-btn:hover {\n            opacity: 1;\n            transform: scale(1.2);\n        }\n        \n        #tdocDeleteConfirmModal .modal-content {\n            animation: slideIn 0.3s ease;\n            text-align: center;\n        }\n    ";
    document.head.appendChild(style);
}
// ================================
// DOWNLOAD FUNCTIONALITY
// ================================
function initializeDownloadButton() {
    var downloadBtn = Array.from(document.querySelectorAll('.skystemtaskmaster-action-btn')).find(function (btn) {
        return (btn.textContent && btn.textContent.indexOf('Download') !== -1) ||
            (btn.innerHTML && btn.innerHTML.indexOf('download') !== -1);
    });
    if (downloadBtn) {
        downloadBtn.addEventListener('click', showDownloadOptions);
    }
}
function showDownloadOptions() {
    var downloadModal = document.getElementById('downloadModal');
    if (!downloadModal) {
        downloadModal = document.createElement('div');
        downloadModal.id = 'downloadModal';
        downloadModal.className = 'modal';
        downloadModal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 300px;\">\n                <span class=\"close\">&times;</span>\n                <h3>Download As</h3>\n                <div style=\"display: flex; flex-direction: column; gap: 15px; margin: 20px 0;\">\n                    <button id=\"downloadExcelBtn\" style=\"padding: 12px; background: #1D6F42; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;\">\uD83D\uDCCA Excel</button>\n                    <button id=\"downloadPdfBtn\" style=\"padding: 12px; background: #D32F2F; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;\">\uD83D\uDCC4 PDF</button>\n                    <button id=\"downloadCsvBtn\" style=\"padding: 12px; background: #00cfff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;\">\uD83D\uDCD1 CSV</button>\n                    <button id=\"downloadJsonBtn\" style=\"padding: 12px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;\">\uD83D\uDD27 JSON</button>\n                </div>\n            </div>\n        ";
        document.body.appendChild(downloadModal);
        downloadModal.querySelector('.close').addEventListener('click', function () {
            downloadModal.style.display = 'none';
        });
        window.addEventListener('click', function (e) {
            if (e.target === downloadModal)
                downloadModal.style.display = 'none';
        });
        document.getElementById('downloadExcelBtn').addEventListener('click', function () {
            downloadAsExcel();
            downloadModal.style.display = 'none';
        });
        document.getElementById('downloadPdfBtn').addEventListener('click', function () {
            downloadAsPdf();
            downloadModal.style.display = 'none';
        });
        document.getElementById('downloadCsvBtn').addEventListener('click', function () {
            downloadAsCsv();
            downloadModal.style.display = 'none';
        });
        document.getElementById('downloadJsonBtn').addEventListener('click', function () {
            downloadAsJson();
            downloadModal.style.display = 'none';
        });
    }
    downloadModal.style.display = 'block';
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
function downloadAsPdf() {
    var _a;
    showNotification('Preparing PDF...');
    var printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow pop-ups for PDF download');
        return;
    }
    var table = document.getElementById('mainTable');
    if (!table)
        return;
    var styles = document.querySelectorAll('style');
    var styleText = '';
    styles.forEach(function (style) { return styleText += style.innerHTML; });
    var title = ((_a = document.querySelector('.skystemtaskmaster-checklist-title')) === null || _a === void 0 ? void 0 : _a.textContent) || 'Tasks';
    printWindow.document.write("\n        <html>\n        <head>\n            <title>Task Viewer Export</title>\n            <style>\n                body { font-family: Arial, sans-serif; padding: 20px; }\n                table { border-collapse: collapse; width: 100%; }\n                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n                th { background-color: #f2f2f2; }\n                ".concat(styleText, "\n            </style>\n        </head>\n        <body>\n            <h2>Task Viewer - ").concat(title, "</h2>\n            ").concat(table.outerHTML, "\n        </body>\n        </html>\n    "));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}
function downloadAsCsv() {
    downloadAsExcel();
    showNotification('Downloaded as CSV');
}
// ================================
// FILTER FUNCTIONALITY - FIXED VERSION
// ================================
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
function showFilterPanel() {
    var existingModal = document.getElementById('filterModal');
    if (existingModal) {
        existingModal.remove();
    }
    // Create filter modal
    var filterModal = document.createElement('div');
    filterModal.id = 'filterModal';
    filterModal.className = 'modal';
    filterModal.innerHTML = "\n        <div class=\"modal-content\" style=\"width: 400px;\">\n            <span class=\"close\">&times;</span>\n            <h3 style=\"color: #ff0080; margin-bottom: 20px;\">Filter Tasks</h3>\n            \n            <div style=\"margin: 20px 0;\">\n                <div style=\"margin-bottom: 15px;\">\n                    <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Status</label>\n                    <select id=\"filterStatus\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        <option value=\"all\">All Status</option>\n                        <option value=\"Not Started\">Not Started</option>\n                        <option value=\"In Progress\">In Progress</option>\n                        <option value=\"Completed\">Completed</option>\n                        <option value=\"Review\">Review</option>\n                        <option value=\"Approved\">Approved</option>\n                        <option value=\"Rejected\">Rejected</option>\n                    </select>\n                </div>\n                \n                <div style=\"margin-bottom: 15px;\">\n                    <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Owner</label>\n                    <select id=\"filterOwner\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        <option value=\"all\">All Owners</option>\n                        <option value=\"PK\">PK - Palakh Khanna</option>\n                        <option value=\"SM\">SM - Sarah Miller</option>\n                        <option value=\"MP\">MP - Mel Preparer</option>\n                        <option value=\"PP\">PP - Poppy Pan</option>\n                        <option value=\"JS\">JS - John Smith</option>\n                        <option value=\"EW\">EW - Emma Watson</option>\n                        <option value=\"DB\">DB - David Brown</option>\n                    </select>\n                </div>\n                \n                <div style=\"margin-bottom: 15px;\">\n                    <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Reviewer</label>\n                    <select id=\"filterReviewer\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        <option value=\"all\">All Reviewers</option>\n                        <option value=\"PK\">PK - Palakh Khanna</option>\n                        <option value=\"SM\">SM - Sarah Miller</option>\n                        <option value=\"MP\">MP - Mel Preparer</option>\n                        <option value=\"PP\">PP - Poppy Pan</option>\n                        <option value=\"JS\">JS - John Smith</option>\n                        <option value=\"EW\">EW - Emma Watson</option>\n                        <option value=\"DB\">DB - David Brown</option>\n                    </select>\n                </div>\n                \n                <div style=\"margin-bottom: 15px;\">\n                    <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Due Date</label>\n                    <select id=\"filterDueDate\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        <option value=\"all\">All Dates</option>\n                        <option value=\"overdue\">Overdue</option>\n                        <option value=\"today\">Due Today</option>\n                        <option value=\"week\">Due This Week</option>\n                        <option value=\"month\">Due This Month</option>\n                        <option value=\"future\">Future (After This Month)</option>\n                    </select>\n                </div>\n            </div>\n            \n            <div style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;\">\n                <button id=\"clearFilterBtn\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Clear</button>\n                <button id=\"applyFilterBtn\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Apply Filter</button>\n            </div>\n        </div>\n    ";
    document.body.appendChild(filterModal);
    // Close button
    filterModal.querySelector('.close').addEventListener('click', function () {
        filterModal.style.display = 'none';
    });
    // Click outside to close
    window.addEventListener('click', function (e) {
        if (e.target === filterModal) {
            filterModal.style.display = 'none';
        }
    });
    // Apply filter button
    document.getElementById('applyFilterBtn').addEventListener('click', function () {
        applyFilters();
        filterModal.style.display = 'none';
        showNotification('Filters applied successfully');
    });
    // Clear filter button
    document.getElementById('clearFilterBtn').addEventListener('click', function () {
        clearFilters();
        filterModal.style.display = 'none';
        showNotification('Filters cleared');
    });
    filterModal.style.display = 'block';
}
function applyFilters() {
    var _a, _b, _c, _d;
    // Get filter values
    var statusFilter = ((_a = document.getElementById('filterStatus')) === null || _a === void 0 ? void 0 : _a.value) || 'all';
    var ownerFilter = ((_b = document.getElementById('filterOwner')) === null || _b === void 0 ? void 0 : _b.value) || 'all';
    var reviewerFilter = ((_c = document.getElementById('filterReviewer')) === null || _c === void 0 ? void 0 : _c.value) || 'all';
    var dueDateFilter = ((_d = document.getElementById('filterDueDate')) === null || _d === void 0 ? void 0 : _d.value) || 'all';
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    var oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    var visibleCount = 0;
    // Filter tasks
    tasks.forEach(function (task) {
        var _a, _b, _c, _d;
        var show = true;
        // Status filter
        if (show && statusFilter !== 'all') {
            var taskStatus = task.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter)
                show = false;
        }
        // Owner filter
        if (show && ownerFilter !== 'all') {
            var ownerBadge = (_a = task.row.cells[5]) === null || _a === void 0 ? void 0 : _a.querySelector('.skystemtaskmaster-badge');
            var ownerText = ((_b = ownerBadge === null || ownerBadge === void 0 ? void 0 : ownerBadge.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            if (ownerText !== ownerFilter)
                show = false;
        }
        // Reviewer filter
        if (show && reviewerFilter !== 'all') {
            var reviewerBadge = (_c = task.row.cells[6]) === null || _c === void 0 ? void 0 : _c.querySelector('.skystemtaskmaster-badge');
            var reviewerText = ((_d = reviewerBadge === null || reviewerBadge === void 0 ? void 0 : reviewerBadge.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            if (reviewerText !== reviewerFilter)
                show = false;
        }
        // Due date filter
        if (show && dueDateFilter !== 'all') {
            var dueText = task.dueDateCell.innerText;
            if (dueText !== 'Set due date') {
                try {
                    var dueDate = new Date(dueText);
                    dueDate.setHours(0, 0, 0, 0);
                    if (dueDateFilter === 'overdue' && dueDate >= today)
                        show = false;
                    else if (dueDateFilter === 'today' && dueDate.getTime() !== today.getTime())
                        show = false;
                    else if (dueDateFilter === 'week' && (dueDate < today || dueDate > oneWeekLater))
                        show = false;
                    else if (dueDateFilter === 'month' && (dueDate < today || dueDate > oneMonthLater))
                        show = false;
                    else if (dueDateFilter === 'future' && dueDate <= oneMonthLater)
                        show = false;
                }
                catch (e) {
                    console.log('Error parsing date:', dueText);
                }
            }
            else if (dueDateFilter !== 'all') {
                show = false;
            }
        }
        task.row.style.display = show ? '' : 'none';
        if (show)
            visibleCount++;
    });
    // Filter subtasks
    subtasks.forEach(function (subtask) {
        var _a, _b, _c, _d;
        var show = true;
        // Status filter
        if (show && statusFilter !== 'all') {
            var taskStatus = subtask.statusBadge.innerText.trim();
            if (taskStatus !== statusFilter)
                show = false;
        }
        // Owner filter
        if (show && ownerFilter !== 'all') {
            var ownerBadge = (_a = subtask.ownerCell) === null || _a === void 0 ? void 0 : _a.querySelector('.skystemtaskmaster-badge');
            var ownerText = ((_b = ownerBadge === null || ownerBadge === void 0 ? void 0 : ownerBadge.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            if (ownerText !== ownerFilter)
                show = false;
        }
        // Reviewer filter
        if (show && reviewerFilter !== 'all') {
            var reviewerBadge = (_c = subtask.reviewerCell) === null || _c === void 0 ? void 0 : _c.querySelector('.skystemtaskmaster-badge');
            var reviewerText = ((_d = reviewerBadge === null || reviewerBadge === void 0 ? void 0 : reviewerBadge.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            if (reviewerText !== reviewerFilter)
                show = false;
        }
        if (show && dueDateFilter !== 'all') {
            var dueDateCell = subtask.row.cells[3];
            if (dueDateCell) {
                var dueText = dueDateCell.innerText;
                if (dueText !== 'Set due date') {
                    try {
                        var dueDate = new Date(dueText);
                        dueDate.setHours(0, 0, 0, 0);
                        if (dueDateFilter === 'overdue' && dueDate >= today)
                            show = false;
                        else if (dueDateFilter === 'today' && dueDate.getTime() !== today.getTime())
                            show = false;
                        else if (dueDateFilter === 'week' && (dueDate < today || dueDate > oneWeekLater))
                            show = false;
                        else if (dueDateFilter === 'month' && (dueDate < today || dueDate > oneMonthLater))
                            show = false;
                        else if (dueDateFilter === 'future' && dueDate <= oneMonthLater)
                            show = false;
                    }
                    catch (e) {
                        console.log('Error parsing subtask date:', dueText);
                    }
                }
                else if (dueDateFilter !== 'all') {
                    show = false;
                }
            }
        }
        subtask.row.style.display = show ? '' : 'none';
        if (show)
            visibleCount++;
    });
    console.log("Filter applied: ".concat(visibleCount, " items visible"));
}
function clearFilters() {
    tasks.forEach(function (task) {
        task.row.style.display = '';
    });
    subtasks.forEach(function (subtask) {
        subtask.row.style.display = '';
    });
    console.log('Filters cleared');
}
function initializeTaskDropdown() {
    var taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown");
    if (!taskDropdown)
        return;
    // Clear existing event listeners
    var newDropdown = taskDropdown.cloneNode(true);
    taskDropdown.parentNode.replaceChild(newDropdown, taskDropdown);
    newDropdown.addEventListener("change", function (e) {
        var filter = e.target.value;
        var currentUser = 'PK';
        console.log('Dropdown filter changed to:', filter);
        // First show all rows
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
                var _a, _b, _c, _d;
                var ownerBadge = (_a = task.row.cells[5]) === null || _a === void 0 ? void 0 : _a.querySelector('.skystemtaskmaster-badge');
                var reviewerBadge = (_b = task.row.cells[6]) === null || _b === void 0 ? void 0 : _b.querySelector('.skystemtaskmaster-badge');
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
                subtask.row.style.display = show ? '' : 'none';
            });
        }
        // Count visible items
        var visibleTasks = 0;
        tasks.forEach(function (task) {
            if (task.row.style.display !== 'none')
                visibleTasks++;
        });
        subtasks.forEach(function (subtask) {
            if (subtask.row.style.display !== 'none')
                visibleTasks++;
        });
        showNotification("Filter: ".concat(filter.replace(/-/g, ' '), " - ").concat(visibleTasks, " items visible"));
    });
}
// ================================
// SORT FUNCTIONALITY
// ================================
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
    var sortModal = document.getElementById('sortModal');
    if (!sortModal) {
        sortModal = document.createElement('div');
        sortModal.id = 'sortModal';
        sortModal.className = 'modal';
        sortModal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 350px;\">\n                <span class=\"close\">&times;</span>\n                <h3>Sort Tasks</h3>\n                \n                <div style=\"margin: 20px 0;\">\n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Sort By</label>\n                        <select id=\"sortBy\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"taskName\">Task Name</option>\n                            <option value=\"dueDate\">Due Date</option>\n                            <option value=\"status\">Status</option>\n                            <option value=\"owner\">Owner</option>\n                            <option value=\"reviewer\">Reviewer</option>\n                            <option value=\"days\">+/- Days</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Order</label>\n                        <select id=\"sortOrder\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"asc\">Ascending (A-Z)</option>\n                            <option value=\"desc\">Descending (Z-A)</option>\n                        </select>\n                    </div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; gap: 10px;\">\n                    <button id=\"applySortBtn\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Apply Sort</button>\n                </div>\n            </div>\n        ";
        document.body.appendChild(sortModal);
        sortModal.querySelector('.close').addEventListener('click', function () {
            sortModal.style.display = 'none';
        });
        window.addEventListener('click', function (e) {
            if (e.target === sortModal)
                sortModal.style.display = 'none';
        });
        document.getElementById('applySortBtn').addEventListener('click', function () {
            var sortBy = document.getElementById('sortBy').value;
            var sortOrder = document.getElementById('sortOrder').value;
            applySort(sortBy, sortOrder);
            sortModal.style.display = 'none';
        });
    }
    sortModal.style.display = 'block';
}
function applySort(sortBy, sortOrder) {
    var tbody = document.querySelector('tbody');
    if (!tbody)
        return;
    // Get all rows
    var allRows = Array.from(tbody.querySelectorAll('tr'));
    // Separate header rows (main-list, sub-list, subtask-header)
    var headerRows = allRows.filter(function (row) {
        return row.classList.contains('main-list-row') ||
            row.classList.contains('sub-list-row') ||
            row.classList.contains('skystemtaskmaster-subtask-header');
    });
    // Get all task rows
    var taskRows = allRows.filter(function (row) { return row.classList.contains('task-row'); });
    var subtaskRows = allRows.filter(function (row) { return row.classList.contains('subtask-row'); });
    // Group tasks by their parent sublist
    var tasksBySublist = {};
    taskRows.forEach(function (row) {
        var sublistId = row.dataset.sublistId;
        if (sublistId) {
            if (!tasksBySublist[sublistId]) {
                tasksBySublist[sublistId] = [];
            }
            tasksBySublist[sublistId].push(row);
        }
    });
    // Sort tasks WITHIN each sublist
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
                // For string comparison in ES5
                var aStr = String(aVal).toLowerCase();
                var bStr = String(bVal).toLowerCase();
                if (sortOrder === 'asc') {
                    if (aStr < bStr)
                        return -1;
                    if (aStr > bStr)
                        return 1;
                    return 0;
                }
                else {
                    if (bStr < aStr)
                        return -1;
                    if (bStr > aStr)
                        return 1;
                    return 0;
                }
            }
        });
    });
    // Clear tbody
    while (tbody.firstChild)
        tbody.removeChild(tbody.firstChild);
    // Rebuild the table preserving hierarchy
    headerRows.forEach(function (row) { return tbody.appendChild(row); });
    // For each sublist row, add its tasks right after it
    headerRows.forEach(function (headerRow) {
        if (headerRow.classList.contains('sub-list-row')) {
            var sublistId = headerRow.dataset.sublistId;
            var tasksForThisSublist = sublistId ? tasksBySublist[sublistId] || [] : [];
            tasksForThisSublist.forEach(function (taskRow) { return tbody.appendChild(taskRow); });
        }
    });
    // Add remaining tasks (if any) - those might not be under any sublist
    var remainingTasks = taskRows.filter(function (row) {
        return !Array.from(tbody.children).some(function (child) { return child === row; });
    });
    remainingTasks.forEach(function (row) { return tbody.appendChild(row); });
    // Add subtasks at the end
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
function getSubtaskSortValue(row, sortBy) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
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
        default:
            return '';
    }
}
function parseSortValue(val, sortBy) {
    if (typeof val === 'string') {
        if (sortBy === 'days')
            return parseInt(val.replace('+', '')) || 0;
        if (sortBy === 'dueDate')
            return new Date(val).getTime() || 0;
    }
    return 0;
}
// ================================
// ACCOUNT COLUMN FUNCTIONS
// ================================
function addAccountColumnToTasks() {
    // Tasks ke liye
    tasks.forEach(function (task) {
        var row = task.row;
        var accountCell = row.cells[1];
        if (accountCell) {
            // Clear existing content
            accountCell.innerHTML = '';
            // Create account display
            var accountDisplay_1 = document.createElement('div');
            accountDisplay_1.className = 'account-display';
            accountDisplay_1.style.cssText = "\n                display: flex;\n                flex-wrap: wrap;\n                gap: 4px;\n                min-height: 24px;\n                align-items: center;\n            ";
            // Get linked accounts for this task (using task ID or row as key)
            var taskId = task.id || task.row.dataset.taskId;
            var accounts = taskAccounts.get(task.row) || (taskId ? taskAccounts.get(taskId) : []) || [];
            if (accounts.length > 0) {
                // Show account numbers
                accounts.forEach(function (account) {
                    var accountBadge = document.createElement('span');
                    accountBadge.className = 'account-badge';
                    accountBadge.textContent = account.accountNumber || 'ACC';
                    accountBadge.title = account.accountName || "Account ".concat(account.accountNumber);
                    accountBadge.style.cssText = "\n                        display: inline-block;\n                        background: #ff0080;\n                        color: white;\n                        padding: 2px 8px;\n                        border-radius: 12px;\n                        font-size: 11px;\n                        margin-right: 4px;\n                        margin-bottom: 2px;\n                        cursor: pointer;\n                        transition: all 0.2s;\n                    ";
                    accountBadge.addEventListener('mouseenter', function () {
                        accountBadge.style.transform = 'scale(1.05)';
                        accountBadge.style.backgroundColor = '#e50072';
                    });
                    accountBadge.addEventListener('mouseleave', function () {
                        accountBadge.style.transform = 'scale(1)';
                        accountBadge.style.backgroundColor = '#ff0080';
                    });
                    accountBadge.addEventListener('click', function (e) {
                        e.stopPropagation();
                        showAccountDetails(account, task.row, task);
                    });
                    accountDisplay_1.appendChild(accountBadge);
                });
            }
            else {
                // Show empty state with plus icon
                var addIcon_1 = document.createElement('span');
                addIcon_1.className = 'add-account-icon';
                addIcon_1.innerHTML = '+';
                addIcon_1.style.cssText = "\n                    display: inline-block;\n                    width: 20px;\n                    height: 20px;\n                    background: #f0f0f0;\n                    color: #ff0080;\n                    border-radius: 50%;\n                    text-align: center;\n                    line-height: 20px;\n                    cursor: pointer;\n                    font-weight: bold;\n                    transition: all 0.2s;\n                ";
                addIcon_1.title = 'Link account';
                addIcon_1.addEventListener('mouseenter', function () {
                    addIcon_1.style.transform = 'scale(1.1)';
                    addIcon_1.style.backgroundColor = '#ff0080';
                    addIcon_1.style.color = 'white';
                });
                addIcon_1.addEventListener('mouseleave', function () {
                    addIcon_1.style.transform = 'scale(1)';
                    addIcon_1.style.backgroundColor = '#f0f0f0';
                    addIcon_1.style.color = '#ff0080';
                });
                addIcon_1.addEventListener('click', function (e) {
                    e.stopPropagation();
                    showAccountLinkingModal(task.row, task);
                });
                accountDisplay_1.appendChild(addIcon_1);
            }
            accountCell.appendChild(accountDisplay_1);
        }
    });
}
// ================================
// SHOW ACCOUNT DETAILS
// ================================
function showAccountDetails(account, taskRow, task) {
    // Remove any existing tooltips
    document.querySelectorAll('.account-tooltip').forEach(function (el) { return el.remove(); });
    // Create tooltip/popup
    var tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';
    tooltip.style.cssText = "\n        position: absolute;\n        background: white;\n        border: 1px solid #ddd;\n        border-radius: 8px;\n        padding: 15px;\n        box-shadow: 0 4px 20px rgba(0,0,0,0.15);\n        z-index: 10000;\n        min-width: 250px;\n        animation: fadeIn 0.2s ease;\n    ";
    tooltip.innerHTML = "\n        <div style=\"font-weight: bold; color: #ff0080; font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #eee;\">\n            ".concat(account.accountNumber || 'Account', "\n        </div>\n        <div style=\"margin: 8px 0; color: #333;\">\n            <div style=\"font-size: 14px; margin-bottom: 4px;\">").concat(account.accountName || 'Account', "</div>\n            ").concat(account.accountType ? "<div style=\"font-size: 12px; color: #666; margin-bottom: 2px;\">Type: ".concat(account.accountType, "</div>") : '', "\n            ").concat(account.riskRating ? "<div style=\"font-size: 12px; color: #666;\">Risk: ".concat(account.riskRating, "</div>") : '', "\n        </div>\n        <div style=\"display: flex; gap: 8px; margin-top: 15px; justify-content: flex-end;\">\n            <button class=\"close-tooltip-btn\" style=\"padding: 6px 12px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;\">Close</button>\n            <button class=\"remove-account-btn\" style=\"padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;\">Remove</button>\n        </div>\n    ");
    // Position tooltip near the click
    document.body.appendChild(tooltip);
    // Position near the mouse
    var rect = taskRow.getBoundingClientRect();
    tooltip.style.left = (rect.left + window.scrollX + 50) + 'px';
    tooltip.style.top = (rect.top + window.scrollY - 50) + 'px';
    // Close button
    tooltip.querySelector('.close-tooltip-btn').addEventListener('click', function () {
        tooltip.remove();
    });
    // Remove button
    tooltip.querySelector('.remove-account-btn').addEventListener('click', function () {
        var taskId = task.id || task.row.dataset.taskId;
        var accounts = taskAccounts.get(task.row) || (taskId ? taskAccounts.get(taskId) : []) || [];
        var updatedAccounts = accounts.filter(function (a) { return a.accountNumber !== account.accountNumber; });
        if (updatedAccounts.length === 0) {
            taskAccounts.delete(task.row);
            if (taskId)
                taskAccounts.delete(taskId);
        }
        else {
            taskAccounts.set(task.row, updatedAccounts);
            if (taskId)
                taskAccounts.set(taskId, updatedAccounts);
        }
        tooltip.remove();
        addAccountColumnToTasks();
        showNotification("Account ".concat(account.accountNumber, " removed"));
    });
    // Click outside to close
    setTimeout(function () {
        document.addEventListener('click', function closeHandler(e) {
            if (!tooltip.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 100);
}
// ================================
// ACCOUNT LINKING MODAL
// ================================
function showAccountLinkingModal(taskRow, task) {
    var _a, _b;
    // Remove any existing modal
    var existingModal = document.getElementById('accountLinkingModal');
    if (existingModal)
        existingModal.remove();
    var modal = document.createElement('div');
    modal.id = 'accountLinkingModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.zIndex = '10000';
    modal.innerHTML = "\n        <div class=\"modal-content\" style=\"width: 800px; max-width: 95%; margin: 3% auto; padding: 25px; background: white; border-radius: 8px; position: relative; max-height: 90vh; overflow-y: auto;\">\n            <span class=\"close\" style=\"position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer;\">&times;</span>\n            <h3 style=\"color: #ff0080; margin-bottom: 20px;\">\uD83D\uDCCA Link Account to Task</h3>\n            \n            <div style=\"margin-bottom: 20px; padding: 12px; background: #f9f9f9; border-radius: 6px; border-left: 3px solid #ff0080;\">\n                <div style=\"font-size: 13px; color: #666; margin-bottom: 5px;\">Task:</div>\n                <div style=\"font-weight: 500;\">".concat(task.name || ((_b = (_a = task.taskNameCell) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) || 'Task', "</div>\n            </div>\n            \n            <div style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;\">\n                <!-- Left Column -->\n                <div>\n                    <h4 style=\"color: #333; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;\">Account Details</h4>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Organizational Hierarchy</label>\n                        <select id=\"orgHierarchy\" style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                            <option value=\"\">Select Hierarchy...</option>\n                            <option value=\"Corporate\">Corporate</option>\n                            <option value=\"Division\">Division</option>\n                            <option value=\"Department\">Department</option>\n                            <option value=\"Subsidiary\">Subsidiary</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">FS Caption</label>\n                        <input type=\"text\" id=\"fsCaption\" placeholder=\"e.g., Cash & Equivalents\" \n                               style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Account Name *</label>\n                        <input type=\"text\" id=\"accountName\" placeholder=\"e.g., Cash & Cash Equivalents\" \n                               style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Account Owners</label>\n                        <select id=\"accountOwners\" style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\" multiple size=\"3\">\n                            <option value=\"PK\">Palakh Khanna</option>\n                            <option value=\"SM\">Sarah Miller</option>\n                            <option value=\"MP\">Mel Preparer</option>\n                            <option value=\"PP\">Poppy Pan</option>\n                            <option value=\"JS\">John Smith</option>\n                            <option value=\"EW\">Emma Watson</option>\n                            <option value=\"DB\">David Brown</option>\n                        </select>\n                        <div style=\"font-size: 11px; color: #666; margin-top: 4px;\">Ctrl+Click to select multiple</div>\n                    </div>\n                </div>\n                \n                <!-- Right Column -->\n                <div>\n                    <h4 style=\"color: #333; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;\">Account Range & Settings</h4>\n                    \n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;\">\n                        <div>\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Account # From</label>\n                            <input type=\"text\" id=\"accountFrom\" placeholder=\"e.g., 1000\" \n                                   style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                        </div>\n                        <div>\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Account # To</label>\n                            <input type=\"text\" id=\"accountTo\" placeholder=\"e.g., 1999\" \n                                   style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                        </div>\n                    </div>\n                    \n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;\">\n                        <div>\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Due Days From</label>\n                            <input type=\"number\" id=\"dueDaysFrom\" placeholder=\"e.g., 0\" \n                                   style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                        </div>\n                        <div>\n                            <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Due Days To</label>\n                            <input type=\"number\" id=\"dueDaysTo\" placeholder=\"e.g., 30\" \n                                   style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                        </div>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Is Key Account</label>\n                        <select id=\"isKeyAccount\" style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                            <option value=\"All\">All</option>\n                            <option value=\"Yes\">Yes</option>\n                            <option value=\"No\">No</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Reconcilable</label>\n                        <select id=\"reconcilable\" style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                            <option value=\"All\">All</option>\n                            <option value=\"Yes\">Yes</option>\n                            <option value=\"No\">No</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Risk Rating</label>\n                        <select id=\"riskRating\" style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                            <option value=\"All\">All</option>\n                            <option value=\"Low\">Low</option>\n                            <option value=\"Medium\">Medium</option>\n                            <option value=\"High\">High</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">ZBA</label>\n                        <select id=\"zba\" style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;\">\n                            <option value=\"All\">All</option>\n                            <option value=\"Yes\">Yes</option>\n                            <option value=\"No\">No</option>\n                        </select>\n                    </div>\n                </div>\n            </div>\n            \n            <div style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;\">\n                <button id=\"cancelAccountBtn\" style=\"padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;\">Cancel</button>\n                <button id=\"linkAccountBtn\" style=\"padding: 10px 20px; background: #ff0080; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;\">Link Account</button>\n            </div>\n        </div>\n    ");
    document.body.appendChild(modal);
    // Close button
    modal.querySelector('.close').addEventListener('click', function () {
        modal.remove();
    });
    // Cancel button
    document.getElementById('cancelAccountBtn').addEventListener('click', function () {
        modal.remove();
    });
    // Link button
    document.getElementById('linkAccountBtn').addEventListener('click', function () {
        var accountName = document.getElementById('accountName').value.trim();
        if (!accountName) {
            alert('Please enter Account Name');
            return;
        }
        // Get selected account owners (multiple)
        var accountOwnersSelect = document.getElementById('accountOwners');
        var selectedOwners = Array.from(accountOwnersSelect.selectedOptions).map(function (opt) { return opt.value; });
        var account = {
            // Basic Info
            orgHierarchy: document.getElementById('orgHierarchy').value,
            fsCaption: document.getElementById('fsCaption').value.trim(),
            accountName: accountName,
            accountOwners: selectedOwners,
            // Account Range
            accountFrom: document.getElementById('accountFrom').value.trim(),
            accountTo: document.getElementById('accountTo').value.trim(),
            // Due Days Range
            dueDaysFrom: document.getElementById('dueDaysFrom').value,
            dueDaysTo: document.getElementById('dueDaysTo').value,
            // Settings
            isKeyAccount: document.getElementById('isKeyAccount').value,
            reconcilable: document.getElementById('reconcilable').value,
            riskRating: document.getElementById('riskRating').value,
            zba: document.getElementById('zba').value,
            // Metadata
            linkedDate: new Date().toISOString(),
            linkedBy: 'PK'
        };
        // Save account to task
        var taskId = task.id || task.row.dataset.taskId;
        var existingAccounts = taskAccounts.get(task.row) || (taskId ? taskAccounts.get(taskId) : []) || [];
        var updatedAccounts = __spreadArray(__spreadArray([], existingAccounts, true), [account], false);
        taskAccounts.set(task.row, updatedAccounts);
        if (taskId)
            taskAccounts.set(taskId, updatedAccounts);
        if (task) {
            task.linkedAccounts = updatedAccounts;
        }
        // Refresh display
        refreshLinkedAccountsColumn();
        modal.remove();
        showNotification("Account \"".concat(accountName, "\" linked to task"));
        setTimeout(function () { return saveAllData(); }, 100);
    });
    // Click outside to close
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
// ================================
// ADD ACCOUNT STYLES
// ================================
function addAccountStyles() {
    if (document.getElementById('account-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'account-styles';
    style.textContent = "\n        .account-display {\n            display: flex;\n            flex-wrap: wrap;\n            gap: 4px;\n            min-height: 24px;\n            align-items: center;\n        }\n        \n        .account-badge {\n            display: inline-block;\n            background: #ff0080;\n            color: white;\n            padding: 2px 8px;\n            border-radius: 12px;\n            font-size: 11px;\n            cursor: pointer;\n            transition: all 0.2s;\n        }\n        \n        .account-badge:hover {\n            background: #e50072;\n            transform: scale(1.05);\n            box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n        }\n        \n        .add-account-icon {\n            display: inline-block;\n            width: 20px;\n            height: 20px;\n            background: #f0f0f0;\n            color: #ff0080;\n            border-radius: 50%;\n            text-align: center;\n            line-height: 20px;\n            cursor: pointer;\n            font-weight: bold;\n            transition: all 0.2s;\n        }\n        \n        .add-account-icon:hover {\n            background: #ff0080;\n            color: white;\n            transform: scale(1.1);\n            box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n        }\n        \n        .account-tooltip {\n            position: absolute;\n            background: white;\n            border: 1px solid #ddd;\n            border-radius: 8px;\n            padding: 15px;\n            box-shadow: 0 4px 20px rgba(0,0,0,0.15);\n            z-index: 10000;\n            animation: fadeIn 0.2s ease;\n        }\n        \n        @keyframes fadeIn {\n            from { opacity: 0; transform: translateY(-5px); }\n            to { opacity: 1; transform: translateY(0); }\n        }\n        \n        .remove-account-btn {\n            padding: 6px 12px;\n            background: #dc3545;\n            color: white;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n            font-size: 12px;\n            transition: all 0.2s;\n        }\n        \n        .remove-account-btn:hover {\n            background: #c82333;\n            transform: scale(1.05);\n        }\n        \n        .close-tooltip-btn {\n            padding: 6px 12px;\n            background: #f0f0f0;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n            font-size: 12px;\n            transition: all 0.2s;\n        }\n        \n        .close-tooltip-btn:hover {\n            background: #e0e0e0;\n        }\n        \n        #accountLinkingModal .modal-content {\n            animation: slideDown 0.3s ease;\n        }\n        \n        #accountLinkingModal input:focus,\n        #accountLinkingModal select:focus {\n            outline: none;\n            border-color: #ff0080 !important;\n            box-shadow: 0 0 0 2px rgba(255, 0, 128, 0.1);\n        }\n    ";
    document.head.appendChild(style);
}
// ================================
// INITIALIZE ACCOUNT COLUMN
// ================================
function initializeAccountColumn() {
    console.log('Initializing Account Column...');
    addAccountStyles();
    addAccountColumnToTasks();
}
// ================================
// FIXED LINKED ACCOUNTS DISPLAY
// ================================
function refreshLinkedAccountsColumn() {
    document.querySelectorAll('.extra-cell[data-column="linkedAccounts"]').forEach(function (cellElement) {
        var cell = cellElement;
        var row = cell.closest('tr');
        if (!row)
            return;
        var task = tasks.find(function (t) { return t.row === row; });
        if (!task)
            return;
        var taskId = task.id || row.dataset.taskId;
        var accounts = taskAccounts.get(row) || (taskId ? taskAccounts.get(taskId) : []) || [];
        cell.innerHTML = '';
        cell.style.cursor = 'pointer';
        cell.style.padding = '4px 8px';
        cell.style.minWidth = '150px';
        if (accounts.length > 0) {
            accounts.forEach(function (account) {
                var badge = document.createElement('span');
                badge.textContent = account.accountName ? account.accountName.substring(0, 12) + (account.accountName.length > 12 ? '...' : '') : 'Account';
                badge.style.cssText = "\n                    display: inline-block;\n                    background: #ff0080;\n                    color: white;\n                    padding: 2px 8px;\n                    border-radius: 12px;\n                    font-size: 11px;\n                    margin: 2px;\n                    cursor: pointer;\n                ";
                badge.title = account.accountName || '';
                badge.onclick = function (e) {
                    e.stopPropagation();
                    showAccountDetails(account, row, task);
                };
                cell.appendChild(badge);
            });
            // Add more button
            var addMore = document.createElement('span');
            addMore.textContent = '+';
            addMore.style.cssText = "\n                display: inline-block;\n                width: 20px;\n                height: 20px;\n                background: #f0f0f0;\n                color: #ff0080;\n                border-radius: 50%;\n                text-align: center;\n                line-height: 20px;\n                font-size: 14px;\n                font-weight: bold;\n                margin: 2px;\n                cursor: pointer;\n            ";
            addMore.onclick = function (e) {
                e.stopPropagation();
                showAccountLinkingModal(task.row, task);
            };
            cell.appendChild(addMore);
        }
        else {
            var addIcon = document.createElement('span');
            addIcon.textContent = '+ Link Account';
            addIcon.style.cssText = "\n                display: inline-block;\n                background: #f0f0f0;\n                color: #ff0080;\n                padding: 4px 12px;\n                border-radius: 16px;\n                font-size: 11px;\n                font-weight: 500;\n                cursor: pointer;\n                border: 1px dashed #ff0080;\n            ";
            addIcon.onclick = function (e) {
                e.stopPropagation();
                showAccountLinkingModal(task.row, task);
            };
            cell.appendChild(addIcon);
        }
    });
}
// Update the addDataCells function to properly initialize linked accounts
function enhanceAddDataCells() {
    // Call the original addDataCells
    addDataCells();
    // Now update linked accounts column
    setTimeout(function () {
        refreshLinkedAccountsColumn();
    }, 100);
}
// ================================
// CDOC DOCUMENT FUNCTIONS
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
        cdocCell.style.textAlign = 'center';
        // CRITICAL: Make sure we're using taskDocuments Map for CDoc
        var docs = taskDocuments.get(task.row) || [];
        console.log("Task ".concat(task.id, " has ").concat(docs.length, " CDoc documents"));
        var iconContainer = document.createElement('span');
        iconContainer.className = 'cdoc-icon-container';
        iconContainer.style.cssText = "\n            cursor: pointer;\n            display: inline-block;\n            position: relative;\n            padding: 5px;\n        ";
        // Different icon for CDoc (folder)
        var icon = document.createElement('i');
        icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
        icon.style.cssText = "\n            font-size: 20px;\n            color: ".concat(docs.length > 0 ? '#ff0080' : '#999', ";\n            transition: all 0.2s;\n        ");
        if (docs.length === 0) {
            icon.style.opacity = '0.7';
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
            badge.style.cssText = "\n                position: absolute;\n                top: -5px;\n                right: -5px;\n                background: #ff0080;\n                color: white;\n                font-size: 10px;\n                font-weight: bold;\n                padding: 2px 5px;\n                border-radius: 10px;\n                min-width: 15px;\n                text-align: center;\n                box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n            ";
            iconContainer.appendChild(badge);
        }
        else {
            var plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle';
            plusIcon.style.cssText = "\n                position: absolute;\n                bottom: -5px;\n                right: -5px;\n                font-size: 12px;\n                color: #ff0080;\n                background: white;\n                border-radius: 50%;\n            ";
            iconContainer.appendChild(plusIcon);
        }
        iconContainer.onclick = function (e) {
            e.stopPropagation();
            e.preventDefault();
            showDocumentManager(task.row);
        };
        iconContainer.onmouseenter = function () {
            icon.style.transform = 'scale(1.1)';
        };
        iconContainer.onmouseleave = function () {
            icon.style.transform = 'scale(1)';
        };
        cdocCell.appendChild(iconContainer);
    });
    // Subtasks ke liye same logic
    subtasks.forEach(function (subtask) {
        if (!subtask.row)
            return;
        var cdocCell = subtask.row.cells[7];
        if (!cdocCell)
            return;
        cdocCell.innerHTML = '';
        cdocCell.style.textAlign = 'center';
        var docs = taskDocuments.get(subtask.row) || [];
        console.log("Subtask ".concat(subtask.id, " has ").concat(docs.length, " CDoc documents"));
        var iconContainer = document.createElement('span');
        iconContainer.className = 'cdoc-icon-container';
        iconContainer.style.cssText = "\n            cursor: pointer;\n            display: inline-block;\n            position: relative;\n            padding: 5px;\n        ";
        var icon = document.createElement('i');
        icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
        icon.style.cssText = "\n            font-size: 20px;\n            color: ".concat(docs.length > 0 ? '#ff0080' : '#999', ";\n            transition: all 0.2s;\n        ");
        if (docs.length === 0) {
            icon.style.opacity = '0.7';
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
            badge.style.cssText = "\n                position: absolute;\n                top: -5px;\n                right: -5px;\n                background: #ff0080;\n                color: white;\n                font-size: 10px;\n                font-weight: bold;\n                padding: 2px 5px;\n                border-radius: 10px;\n                min-width: 15px;\n                text-align: center;\n            ";
            iconContainer.appendChild(badge);
        }
        else {
            var plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus-circle';
            plusIcon.style.cssText = "\n                position: absolute;\n                bottom: -5px;\n                right: -5px;\n                font-size: 12px;\n                color: #ff0080;\n                background: white;\n                border-radius: 50%;\n            ";
            iconContainer.appendChild(plusIcon);
        }
        iconContainer.onclick = function (e) {
            e.stopPropagation();
            e.preventDefault();
            showDocumentManager(subtask.row);
        };
        iconContainer.onmouseenter = function () {
            icon.style.transform = 'scale(1.1)';
        };
        iconContainer.onmouseleave = function () {
            icon.style.transform = 'scale(1)';
        };
        cdocCell.appendChild(iconContainer);
    });
}
function showDocumentManager(taskRow) {
    var docs = taskDocuments.get(taskRow) || [];
    var modal = document.getElementById('documentManagerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'documentManagerModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 800px; max-width: 95%; max-height: 80vh; overflow-y: auto;\">\n                <span class=\"close\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-bottom: 20px;\">\uD83D\uDCC4 CDoc Document Manager</h3>\n                \n                <div style=\"margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px;\">\n                    <h4 style=\"margin-bottom: 15px; color: #333;\">Upload New Documents</h4>\n                    \n                    <div id=\"dropArea\" style=\"border: 2px dashed #ddd; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;\">\n                        <div style=\"font-size: 32px; margin-bottom: 5px;\"><i class=\"fa-solid fa-folder-open\"></i></div>\n                        <div style=\"color: #666; margin-bottom: 5px;\">Drag files here or</div>\n                        <button id=\"browseFileBtn\" style=\"background: #ff0080; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;\">Browse</button>\n                        <input type=\"file\" id=\"fileInput\" style=\"display: none;\" multiple>\n                    </div>\n                    \n                    <div id=\"selectedFilesList\" style=\"max-height: 150px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; padding: 10px; background: white; margin-bottom: 10px; display: none;\">\n                        <div style=\"font-weight: 500; margin-bottom: 8px; color: #666;\">Selected Files:</div>\n                        <div id=\"filesContainer\"></div>\n                    </div>\n                    \n                    <div style=\"display: flex; justify-content: flex-end;\">\n                        <button id=\"uploadSelectedBtn\" style=\"padding: 6px 16px; background: #00cfff; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;\">Upload Files</button>\n                    </div>\n                </div>\n                \n                <div>\n                    <h4 style=\"margin-bottom: 15px; color: #333;\">Attached Documents (<span id=\"docCount\">".concat(docs.length, "</span>)</h4>\n                    <div id=\"documentsListContainer\" style=\"max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px;\"></div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; margin-top: 20px;\">\n                    <button id=\"closeManagerBtn\" style=\"padding: 8px 20px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Close</button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(modal);
        modal.querySelector('.close').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        document.getElementById('closeManagerBtn').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        // Store the current task row in a global variable
        window.currentTaskRow = taskRow;
        setupUploadHandlers(modal, taskRow);
    }
    // Update the current task row
    window.currentTaskRow = taskRow;
    var listContainer = document.getElementById('documentsListContainer');
    if (listContainer) {
        listContainer.innerHTML = renderDocumentsList(docs, taskRow);
        attachDocumentEventListeners(taskRow);
    }
    var countSpan = document.getElementById('docCount');
    if (countSpan)
        countSpan.textContent = docs.length.toString();
    modal.style.display = 'block';
}
function renderDocumentsList(docs, taskRow) {
    if (docs.length === 0) {
        return "\n            <div style=\"padding: 40px; text-align: center; color: #999;\">\n                <div style=\"font-size: 48px; margin-bottom: 10px;\">\uD83D\uDCC4</div>\n                <div>No documents attached</div>\n                <div style=\"font-size: 13px; margin-top: 5px;\">Click upload area above to add documents</div>\n            </div>\n        ";
    }
    return "\n        <table style=\"width: 100%; border-collapse: collapse;\">\n            <thead style=\"background: #f5f5f5; position: sticky; top: 0;\">\n                <tr>\n                    <th style=\"padding: 12px; text-align: left; border-bottom: 2px solid #ddd;\">Name</th>\n                    <th style=\"padding: 12px; text-align: left; border-bottom: 2px solid #ddd;\">Size</th>\n                    <th style=\"padding: 12px; text-align: left; border-bottom: 2px solid #ddd;\">Upload Date</th>\n                    <th style=\"padding: 12px; text-align: center; border-bottom: 2px solid #ddd;\">Actions</th>\n                </tr>\n            </thead>\n            <tbody>\n                ".concat(docs.map(function (doc, index) { return "\n                    <tr data-doc-index=\"".concat(index, "\">\n                        <td style=\"padding: 12px; border-bottom: 1px solid #eee;\">\n                            <div style=\"display: flex; align-items: center; gap: 10px;\">\n                                <span style=\"font-size: 20px;\">\uD83D\uDCC4</span>\n                                <span style=\"font-weight: 500;\">").concat(doc.name, "</span>\n                            </div>\n                        </td>\n                        <td style=\"padding: 12px; border-bottom: 1px solid #eee;\">").concat((doc.size / 1024).toFixed(1), " KB</td>\n                        <td style=\"padding: 12px; border-bottom: 1px solid #eee;\">\n                            ").concat(doc.uploadDate.toLocaleDateString(), " \n                            <span style=\"color: #999; font-size: 11px;\">").concat(doc.uploadDate.toLocaleTimeString(), "</span>\n                        </td>\n                        <td style=\"padding: 12px; border-bottom: 1px solid #eee; text-align: center;\">\n                            <button class=\"view-doc-btn\" data-index=\"").concat(index, "\" style=\"background: none; border: none; color: #ff0080; cursor: pointer; margin: 0 5px; font-size: 18px;\" title=\"View\">\uD83D\uDC41\uFE0F</button>\n                            <button class=\"delete-doc-btn\" data-index=\"").concat(index, "\" style=\"background: none; border: none; color: #dc3545; cursor: pointer; margin: 0 5px; font-size: 18px;\" title=\"Delete\">\uD83D\uDDD1</button>\n                        </td>\n                    </tr>\n                "); }).join(''), "\n            </tbody>\n        </table>\n    ");
}
function attachDocumentEventListeners(taskRow) {
    document.querySelectorAll('.view-doc-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var target = e.target;
            var index = parseInt(target.dataset.index || '0');
            var docs = taskDocuments.get(taskRow) || [];
            if (docs[index])
                previewDocument(docs[index]);
        });
    });
    document.querySelectorAll('.delete-doc-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var target = e.target;
            var index = parseInt(target.dataset.index || '0');
            showDeleteConfirmation(taskRow, index);
        });
    });
}
function showDeleteConfirmation(taskRow, index) {
    var docs = taskDocuments.get(taskRow) || [];
    var doc = docs[index];
    if (!doc)
        return;
    var confirmModal = document.getElementById('deleteConfirmModal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'deleteConfirmModal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 350px;\">\n                <span class=\"close\">&times;</span>\n                <h3 style=\"color: #ff0080;\">Confirm Delete</h3>\n                \n                <div style=\"margin: 20px 0; text-align: center;\">\n                    <div style=\"font-size: 48px; margin-bottom: 10px;\">\u26A0\uFE0F</div>\n                    <p style=\"margin-bottom: 5px;\">Are you sure you want to delete this document?</p>\n                    <p style=\"color: #666; font-size: 13px;\" id=\"docNameDisplay\"></p>\n                </div>\n                \n                <div style=\"display: flex; justify-content: center; gap: 10px;\">\n                    <button id=\"cancelDeleteBtn\" style=\"padding: 8px 20px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Cancel</button>\n                    <button id=\"confirmDeleteBtn\" style=\"padding: 8px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;\">Delete</button>\n                </div>\n            </div>\n        ";
        document.body.appendChild(confirmModal);
        confirmModal.querySelector('.close').addEventListener('click', function () {
            confirmModal.style.display = 'none';
        });
        document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
            confirmModal.style.display = 'none';
        });
        document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
            var row = window.currentDeleteTaskRow;
            var idx = window.currentDeleteIndex;
            if (row && idx !== undefined)
                deleteDocument(row, idx);
            confirmModal.style.display = 'none';
        });
    }
    var docNameDisplay = document.getElementById('docNameDisplay');
    if (docNameDisplay)
        docNameDisplay.textContent = "\"".concat(doc.name, "\"");
    window.currentDeleteTaskRow = taskRow;
    window.currentDeleteIndex = index;
    confirmModal.style.display = 'block';
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
        filesContainer.innerHTML = selectedFiles.map(function (file, index) { return "\n            <div style=\"display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;\">\n                <span>\uD83D\uDCC4 ".concat(file.name, " (").concat((file.size / 1024).toFixed(1), " KB)</span>\n                <button class=\"remove-file\" data-index=\"").concat(index, "\" style=\"background:none; border:none; color:#dc3545; cursor:pointer;\">\u2715</button>\n            </div>\n        "); }).join('');
        filesContainer.querySelectorAll('.remove-file').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var target = e.target;
                var index = parseInt(target.getAttribute('data-index') || '0');
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
        // Use the taskRow that was passed to the function
        var currentTaskRow = taskRow || window.currentTaskRow;
        if (!currentTaskRow) {
            alert('Error: Task not found');
            return;
        }
        // Get the task/subtask ID
        var taskId = currentTaskRow.dataset.taskId || currentTaskRow.dataset.subtaskId;
        if (!taskId) {
            console.error('No ID found for row, generating one...');
            // Generate a new ID if none exists
            var newId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            if (currentTaskRow.classList.contains('task-row')) {
                currentTaskRow.dataset.taskId = newId;
                // Update task in tasks array
                var task = tasks.find(function (t) { return t.row === currentTaskRow; });
                if (task)
                    task.id = newId;
            }
            else {
                currentTaskRow.dataset.subtaskId = newId;
                // Update subtask in subtasks array
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
        // Get existing docs and add new ones
        var existingDocs = taskDocuments.get(currentTaskRow) || [];
        var updatedDocs = __spreadArray(__spreadArray([], existingDocs, true), docs, true);
        // Save to Map
        taskDocuments.set(currentTaskRow, updatedDocs);
        // Also save by ID for backup
        if (taskId) {
            taskDocuments.set(taskId, updatedDocs);
        }
        console.log('CDoc Map now has:', (_a = taskDocuments.get(currentTaskRow)) === null || _a === void 0 ? void 0 : _a.length, 'docs');
        // Update the CDoc column
        updateCDocColumn();
        // Clear selection
        selectedFiles = [];
        updateSelectedFilesList();
        fileInput.value = '';
        // Update modal list if open
        var listContainer = document.getElementById('documentsListContainer');
        if (listContainer) {
            listContainer.innerHTML = renderDocumentsList(updatedDocs, currentTaskRow);
            attachDocumentEventListeners(currentTaskRow);
        }
        var countSpan = document.getElementById('docCount');
        if (countSpan)
            countSpan.textContent = updatedDocs.length.toString();
        showNotification("".concat(docs.length, " file(s) uploaded successfully"));
        // CRITICAL: Save immediately after upload
        console.log('Auto-saving after CDoc upload...');
        saveAllData();
    });
}
// Column visibility save/load functions
function saveColumnVisibility() {
    var visibilityState = {};
    columnConfig.forEach(function (col) {
        visibilityState[col.key] = col.visible;
    });
    localStorage.setItem('columnVisibility', JSON.stringify(visibilityState));
    console.log('Column visibility saved:', visibilityState);
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
function previewDocument(doc) {
    var previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (!previewWindow)
        return;
    previewWindow.document.write("\n        <html>\n        <head>\n            <title>".concat(doc.name, "</title>\n            <style>\n                body { font-family: Arial, sans-serif; padding: 30px; background: #f5f5f5; margin: 0; }\n                .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; }\n                .doc-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; }\n                .doc-icon { font-size: 48px; }\n                .doc-title { font-size: 24px; font-weight: bold; color: #ff0080; }\n                .doc-meta { background: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 30px; }\n                .meta-row { display: flex; margin-bottom: 10px; }\n                .meta-label { width: 120px; color: #666; }\n                .meta-value { color: #333; font-weight: 500; }\n                .preview-placeholder { border: 2px dashed #ddd; padding: 60px; text-align: center; border-radius: 8px; }\n                .preview-icon { font-size: 64px; margin-bottom: 20px; color: #999; }\n                .preview-text { color: #999; font-size: 16px; }\n            </style>\n        </head>\n        <body>\n            <div class=\"container\">\n                <div class=\"doc-header\">\n                    <div class=\"doc-icon\">\uD83D\uDCC4</div>\n                    <div class=\"doc-title\">").concat(doc.name, "</div>\n                </div>\n                \n                <div class=\"doc-meta\">\n                    <div class=\"meta-row\">\n                        <span class=\"meta-label\">Size:</span>\n                        <span class=\"meta-value\">").concat((doc.size / 1024).toFixed(2), " KB</span>\n                    </div>\n                    <div class=\"meta-row\">\n                        <span class=\"meta-label\">Type:</span>\n                        <span class=\"meta-value\">").concat(doc.type || 'Unknown', "</span>\n                    </div>\n                    <div class=\"meta-row\">\n                        <span class=\"meta-label\">Uploaded:</span>\n                        <span class=\"meta-value\">").concat(doc.uploadDate.toLocaleString(), "</span>\n                    </div>\n                </div>\n                \n                <div class=\"preview-placeholder\">\n                    <div class=\"preview-icon\">\uD83D\uDCCB</div>\n                    <div class=\"preview-text\">Preview not available for this file type</div>\n                    <div style=\"margin-top: 20px; color: #999; font-size: 14px;\">The file would open in its native application</div>\n                </div>\n            </div>\n        </body>\n        </html>\n    "));
}
function addDocumentManagerStyles() {
    var style = document.createElement('style');
    style.textContent = "\n        .cdoc-count {\n            cursor: pointer;\n            color: #ff0080;\n            font-weight: bold;\n            font-size: 14px;\n            padding: 4px 8px;\n            display: inline-block;\n            transition: all 0.2s;\n        }\n        \n        .cdoc-count:hover {\n            transform: scale(1.1);\n            background-color: #fff0f5;\n            border-radius: 4px;\n        }\n        \n        #documentManagerModal .modal-content {\n            animation: slideIn 0.3s ease;\n        }\n        \n        #dropArea {\n            transition: all 0.3s;\n        }\n        \n        #dropArea.drag-over {\n            border-color: #ff0080 !important;\n            background-color: #fff0f5 !important;\n        }\n        \n        #documentsListContainer tr:hover {\n            background-color: #f9f9f9;\n        }\n        \n        .view-doc-btn, .delete-doc-btn {\n            transition: all 0.2s;\n            opacity: 0.7;\n        }\n        \n        .view-doc-btn:hover, .delete-doc-btn:hover {\n            opacity: 1;\n            transform: scale(1.2);\n        }\n        \n        #deleteConfirmModal .modal-content {\n            animation: slideIn 0.3s ease;\n            text-align: center;\n        }\n    ";
    document.head.appendChild(style);
}
function initializeDocumentManager() {
    addDocumentManagerStyles();
    updateCDocColumn();
}
// ================================
// STATUS CHANGE FUNCTIONS
// ================================
function makeStatusEditable() {
    tasks.forEach(function (task) {
        var statusCell = task.statusBadge.parentElement;
        if (!statusCell)
            return;
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        statusCell.addEventListener('click', function (e) {
            e.stopPropagation();
            showStatusChangeModal(task);
        });
    });
    subtasks.forEach(function (subtask) {
        var statusCell = subtask.statusBadge.parentElement;
        if (!statusCell)
            return;
        statusCell.style.cursor = 'pointer';
        statusCell.title = 'Click to change status';
        statusCell.addEventListener('click', function (e) {
            e.stopPropagation();
            showSubtaskStatusChangeModal(subtask);
        });
    });
}
// ================================
// FIXED STATUS CHANGE MODAL WITH EXTRA COLUMN UPDATE
// ================================
function showStatusChangeModal(task) {
    console.log('Opening status modal for task:', task);
    // Store the current task globally
    window.currentTaskForStatus = task;
    // Create modal HTML
    var modalHtml = "\n        <div id=\"statusChangeModal\" class=\"modal\" style=\"display: block; z-index: 10000;\">\n            <div class=\"modal-content\" style=\"width: 350px; position: relative; z-index: 10001;\">\n                <span class=\"close\" style=\"position: absolute; right: 10px; top: 5px; font-size: 24px; cursor: pointer;\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-top: 0;\">Change Status</h3>\n                \n                <div style=\"margin: 20px 0;\">\n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Current Status</label>\n                        <div id=\"currentStatusDisplay\" style=\"padding: 8px; background: #f0f0f0; border-radius: 4px;\">".concat(task.statusBadge.innerText, "</div>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">New Status</label>\n                        <select id=\"newStatusSelect\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"Not Started\">Not Started</option>\n                            <option value=\"In Progress\">In Progress</option>\n                            <option value=\"Completed\">Completed</option>\n                            <option value=\"Review\">Review</option>\n                            <option value=\"Approved\">Approved</option>\n                            <option value=\"Rejected\">Rejected</option>\n                            <option value=\"Hold\">Hold</option>\n                            <option value=\"Overdue\">Overdue</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Comment (Optional)</label>\n                        <textarea id=\"statusComment\" rows=\"3\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"Add comment...\"></textarea>\n                    </div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; gap: 10px;\">\n                    <button id=\"cancelStatusBtn\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Cancel</button>\n                    <button id=\"updateStatusBtn\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Update Status</button>\n                </div>\n            </div>\n        </div>\n    ");
    // Remove any existing modal
    var existingModal = document.getElementById('statusChangeModal');
    if (existingModal) {
        existingModal.remove();
    }
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    // Get modal element
    var modal = document.getElementById('statusChangeModal');
    // Set current status in dropdown
    var select = document.getElementById('newStatusSelect');
    var currentStatus = task.statusBadge.innerText;
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    // Close button handler
    var closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function () {
        modal.remove();
        window.currentTaskForStatus = null;
    };
    // Cancel button handler
    var cancelBtn = document.getElementById('cancelStatusBtn');
    cancelBtn.onclick = function () {
        modal.remove();
        window.currentTaskForStatus = null;
    };
    // Update button handler - FIXED VERSION
    var updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = function () {
        console.log('Update button clicked!');
        var newStatus = document.getElementById('newStatusSelect').value;
        var comment = document.getElementById('statusComment').value;
        console.log('New status selected:', newStatus);
        if (window.currentTaskForStatus) {
            // Update the status
            var task_1 = window.currentTaskForStatus;
            var oldStatus = task_1.statusBadge.innerText;
            // Change the main status badge
            task_1.statusBadge.innerText = newStatus;
            task_1.statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'));
            // Update task object
            if (task_1.status !== undefined) {
                task_1.status = newStatus;
            }
            if (task_1.taskStatus !== undefined) {
                task_1.taskStatus = newStatus;
            }
            // FIX: Update the Task Status column (extra cell)
            updateTaskStatusExtraColumn(task_1.row, newStatus);
            // Update counts
            updateCounts();
            // Show notification
            showNotification("Status changed from ".concat(oldStatus, " to ").concat(newStatus));
            console.log('Status updated successfully');
        }
        // Remove modal
        modal.remove();
        window.currentTaskForStatus = null;
    };
    // Click outside to close
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.remove();
            window.currentTaskForStatus = null;
        }
    };
}
// Helper function to update the Task Status extra column
function updateTaskStatusExtraColumn(row, newStatus) {
    if (!row)
        return;
    // Find all extra cells in this row
    var extraCells = row.querySelectorAll('.extra-cell');
    extraCells.forEach(function (cell) {
        var columnKey = cell.getAttribute('data-column');
        if (columnKey === 'taskStatus') {
            // Update the cell text
            cell.textContent = newStatus;
            // Add visual feedback
            cell.style.backgroundColor = '#e8f5e9';
            cell.style.transition = 'background-color 0.5s';
            // Remove highlight after animation
            setTimeout(function () {
                cell.style.backgroundColor = '';
            }, 500);
            console.log('Task Status column updated to:', newStatus);
        }
    });
}
// For subtasks
function showSubtaskStatusChangeModal(subtask) {
    console.log('Opening status modal for subtask:', subtask);
    // Store the current subtask globally
    window.currentSubtaskForStatus = subtask;
    // Create modal HTML
    var modalHtml = "\n        <div id=\"statusChangeModal\" class=\"modal\" style=\"display: block; z-index: 10000;\">\n            <div class=\"modal-content\" style=\"width: 350px; position: relative; z-index: 10001;\">\n                <span class=\"close\" style=\"position: absolute; right: 10px; top: 5px; font-size: 24px; cursor: pointer;\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-top: 0;\">Change Subtask Status</h3>\n                \n                <div style=\"margin: 20px 0;\">\n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Current Status</label>\n                        <div id=\"currentStatusDisplay\" style=\"padding: 8px; background: #f0f0f0; border-radius: 4px;\">".concat(subtask.statusBadge.innerText, "</div>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">New Status</label>\n                        <select id=\"newStatusSelect\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"Not Started\">Not Started</option>\n                            <option value=\"In Progress\">In Progress</option>\n                            <option value=\"Completed\">Completed</option>\n                            <option value=\"Review\">Review</option>\n                            <option value=\"Approved\">Approved</option>\n                            <option value=\"Rejected\">Rejected</option>\n                            <option value=\"Hold\">Hold</option>\n                            <option value=\"Overdue\">Overdue</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 5px; font-weight: 500;\">Comment (Optional)</label>\n                        <textarea id=\"statusComment\" rows=\"3\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" placeholder=\"Add comment...\"></textarea>\n                    </div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; gap: 10px;\">\n                    <button id=\"cancelStatusBtn\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Cancel</button>\n                    <button id=\"updateStatusBtn\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Update Status</button>\n                </div>\n            </div>\n        </div>\n    ");
    // Remove any existing modal
    var existingModal = document.getElementById('statusChangeModal');
    if (existingModal) {
        existingModal.remove();
    }
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    // Get modal element
    var modal = document.getElementById('statusChangeModal');
    // Set current status in dropdown
    var select = document.getElementById('newStatusSelect');
    var currentStatus = subtask.statusBadge.innerText;
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === currentStatus) {
            select.selectedIndex = i;
            break;
        }
    }
    // Close button handler
    var closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function () {
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    // Cancel button handler
    var cancelBtn = document.getElementById('cancelStatusBtn');
    cancelBtn.onclick = function () {
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    // Update button handler
    var updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = function () {
        console.log('Update subtask button clicked!');
        var newStatus = document.getElementById('newStatusSelect').value;
        var comment = document.getElementById('statusComment').value;
        if (window.currentSubtaskForStatus) {
            var subtask_1 = window.currentSubtaskForStatus;
            var oldStatus = subtask_1.statusBadge.innerText;
            subtask_1.statusBadge.innerText = newStatus;
            subtask_1.statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'));
            // Update taskStatus in subtask object if it exists
            if (subtask_1.taskStatus !== undefined) {
                subtask_1.taskStatus = newStatus;
            }
            // FIX: Update the Task Status column for subtask
            updateTaskStatusExtraColumn(subtask_1.row, newStatus);
            updateCounts();
            showNotification("Subtask status changed to ".concat(newStatus));
        }
        modal.remove();
        window.currentSubtaskForStatus = null;
    };
    // Click outside to close
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.remove();
            window.currentSubtaskForStatus = null;
        }
    };
}
// Function to sync status between main badge and extra column for all tasks
function syncAllTaskStatusColumns() {
    console.log('Syncing all task status columns...');
    // Sync tasks
    tasks.forEach(function (task) {
        if (task.row && task.statusBadge) {
            var currentStatus = task.statusBadge.innerText;
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
    subtasks.forEach(function (subtask) {
        if (subtask.row && subtask.statusBadge) {
            var currentStatus = subtask.statusBadge.innerText;
            updateTaskStatusExtraColumn(subtask.row, currentStatus);
        }
    });
    console.log('Status sync complete');
}
// Call this function after data is loaded and whenever status changes
// Add this to your initialization
function initializeStatusSync() {
    // Initial sync
    setTimeout(function () {
        syncAllTaskStatusColumns();
    }, 1000);
    // Observe for any status changes
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                // Debounce the sync
                clearTimeout(window.statusSyncTimeout);
                window.statusSyncTimeout = setTimeout(function () {
                    syncAllTaskStatusColumns();
                }, 200);
            }
        });
    });
    // Observe the tbody for changes
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
// Add styles for all status types
function addStatusStyles() {
    var style = document.createElement('style');
    style.textContent = "\n        .skystemtaskmaster-status-badge {\n            cursor: pointer;\n            transition: all 0.2s;\n            padding: 4px 8px;\n            border-radius: 12px;\n            font-size: 12px;\n            font-weight: 500;\n            display: inline-block;\n        }\n        \n        .skystemtaskmaster-status-badge:hover {\n            transform: scale(1.05);\n            box-shadow: 0 2px 5px rgba(0,0,0,0.1);\n        }\n        \n        .skystemtaskmaster-status-not-started {\n            background: #fde2e4;\n            color: #e91e63;\n        }\n        \n        .skystemtaskmaster-status-in-progress {\n            background: #fff3cd;\n            color: #ff9800;\n        }\n        \n        .skystemtaskmaster-status-completed {\n            background: #4CAF50;\n            color: white;\n        }\n        \n        .skystemtaskmaster-status-review {\n            background: #ff9800;\n            color: white;\n        }\n        \n        .skystemtaskmaster-status-approved {\n            background: #009688;\n            color: white;\n        }\n        \n        .skystemtaskmaster-status-rejected {\n            background: #f44336;\n            color: white;\n        }\n        \n        .skystemtaskmaster-status-hold {\n            background: #9c27b0;\n            color: white;\n        }\n        \n        .skystemtaskmaster-status-overdue {\n            background: #d32f2f;\n            color: white;\n        }\n        \n        #statusChangeModal .modal-content {\n            animation: slideIn 0.3s ease;\n        }\n    ";
    document.head.appendChild(style);
}
function initializeStatus() {
    addStatusStyles();
    makeStatusEditable();
}
function updateTaskStatus(task, newStatus, comment) {
    var oldStatus = task.statusBadge.innerText;
    task.statusBadge.innerText = newStatus;
    task.statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'));
    addStatusChangeComment(task.row, oldStatus, newStatus, comment);
    updateCounts();
    showNotification("Status changed from ".concat(oldStatus, " to ").concat(newStatus));
}
function updateSubtaskStatus(subtask, newStatus, comment) {
    var oldStatus = subtask.statusBadge.innerText;
    subtask.statusBadge.innerText = newStatus;
    subtask.statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-".concat(newStatus.toLowerCase().replace(' ', '-'));
    addStatusChangeComment(subtask.row, oldStatus, newStatus, comment);
    updateCounts();
    showNotification("Subtask status changed from ".concat(oldStatus, " to ").concat(newStatus));
}
function addStatusChangeComment(row, oldStatus, newStatus, comment) {
    var statusHistory = row.getAttribute('data-status-history') || '';
    var newEntry = "".concat(new Date().toLocaleString(), ": ").concat(oldStatus, " \u2192 ").concat(newStatus).concat(comment ? ' - ' + comment : '');
    row.setAttribute('data-status-history', statusHistory ? statusHistory + '|' + newEntry : newEntry);
}
// ================================
// DRAG AND DROP FUNCTIONS
// ================================
function makeRowDraggable(row, type) {
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
    var _a;
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
    (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', '');
    row.classList.add('skystemtaskmaster-dragging');
    if (e.dataTransfer)
        e.dataTransfer.effectAllowed = 'move';
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
        tbody.insertBefore(draggedItem.element, targetRow);
    }
    else {
        tbody.insertBefore(draggedItem.element, targetRow.nextSibling);
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return ({
                taskName: ((_b = (_a = t.taskNameCell.querySelector('span')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '',
                dueDate: ((_c = t.dueDateCell.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '',
                status: ((_d = t.statusBadge.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '',
                owner: ((_g = (_f = (_e = t.row.cells[5]) === null || _e === void 0 ? void 0 : _e.querySelector('.skystemtaskmaster-badge')) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim()) || '',
                reviewer: ((_k = (_j = (_h = t.row.cells[6]) === null || _h === void 0 ? void 0 : _h.querySelector('.skystemtaskmaster-badge')) === null || _j === void 0 ? void 0 : _j.textContent) === null || _k === void 0 ? void 0 : _k.trim()) || '',
                cdoc: ((_m = (_l = t.row.cells[7]) === null || _l === void 0 ? void 0 : _l.textContent) === null || _m === void 0 ? void 0 : _m.trim()) || ''
            });
        }),
        subtasks: subtasks.map(function (s) {
            var _a, _b, _c, _d, _e, _f, _g;
            return ({
                taskName: ((_b = (_a = s.taskNameCell.querySelector('span')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '',
                status: ((_c = s.statusBadge.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '',
                owner: ((_e = (_d = s.ownerCell.querySelector('.skystemtaskmaster-badge')) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '',
                reviewer: ((_g = (_f = s.reviewerCell.querySelector('.skystemtaskmaster-badge')) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim()) || ''
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
function addDragStyles() {
    if (document.getElementById('skystemtaskmaster-drag-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'skystemtaskmaster-drag-styles';
    style.textContent = "\n        .skystemtaskmaster-draggable {\n            cursor: move;\n            user-select: none;\n        }\n        \n        .skystemtaskmaster-dragging {\n            opacity: 0.5;\n            background: #f0f0f0 !important;\n            box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n        }\n        \n        .skystemtaskmaster-drag-over-top {\n            border-top: 3px solid #ff0080 !important;\n            background: rgba(255, 0, 128, 0.05);\n        }\n        \n        .skystemtaskmaster-drag-over-bottom {\n            border-bottom: 3px solid #ff0080 !important;\n            background: rgba(255, 0, 128, 0.05);\n        }\n    ";
    document.head.appendChild(style);
}
// ================================
// USER FUNCTIONS
// ================================
function addUserStyles() {
    var style = document.createElement('style');
    style.textContent = "\n        .skystemtaskmaster-badge {\n            display: inline-block;\n            width: 30px;\n            height: 30px;\n            border-radius: 50%;\n            color: white;\n            text-align: center;\n            line-height: 30px;\n            font-weight: bold;\n            font-size: 12px;\n            cursor: pointer;\n            transition: all 0.2s;\n        }\n        \n        .skystemtaskmaster-badge:hover {\n            transform: scale(1.1);\n            box-shadow: 0 2px 8px rgba(0,0,0,0.2);\n        }\n        \n        .skystemtaskmaster-badge-pk { background: #ff0080; }\n        .skystemtaskmaster-badge-sm { background: #00cfff; }\n        .skystemtaskmaster-badge-mp { background: #9c27b0; }\n        .skystemtaskmaster-badge-pp { background: #ff9800; }\n        .skystemtaskmaster-badge-js { background: #4caf50; }\n        .skystemtaskmaster-badge-ew { background: #f44336; }\n        .skystemtaskmaster-badge-db { background: #795548; }\n        \n        #userSelectionModal .modal-content {\n            animation: slideIn 0.3s ease;\n        }\n        \n        .user-item {\n            transition: all 0.2s;\n        }\n        \n        .user-item:hover {\n            background-color: #f5f5f5;\n        }\n        \n        .user-item.selected {\n            background-color: #fff0f5;\n        }\n        \n        #userSearchInput:focus {\n            outline: none;\n            border-color: #ff0080 !important;\n            box-shadow: 0 0 0 2px rgba(255, 0, 128, 0.1);\n        }\n    ";
    document.head.appendChild(style);
}
function makeOwnerReviewerClickable() {
    tasks.forEach(function (task) {
        var ownerCell = task.row.cells[5];
        var reviewerCell = task.row.cells[6];
        if (ownerCell)
            makeCellClickable(ownerCell, 'owner', task);
        if (reviewerCell)
            makeCellClickable(reviewerCell, 'reviewer', task);
    });
    subtasks.forEach(function (subtask) {
        var ownerCell = subtask.ownerCell;
        var reviewerCell = subtask.reviewerCell;
        if (ownerCell)
            makeCellClickable(ownerCell, 'owner', subtask);
        if (reviewerCell)
            makeCellClickable(reviewerCell, 'reviewer', subtask);
    });
}
function makeCellClickable(cell, type, item) {
    var oldCell = cell.cloneNode(true);
    if (cell.parentNode) {
        cell.parentNode.replaceChild(oldCell, cell);
        cell = oldCell;
    }
    cell.style.cursor = 'pointer';
    cell.title = "Click to change ".concat(type);
    cell.addEventListener('click', function (e) {
        e.stopPropagation();
        showUserModal(cell, type, item);
    });
    cell.addEventListener('mouseenter', function () {
        cell.style.backgroundColor = '#fff0f5';
        cell.style.borderRadius = '4px';
    });
    cell.addEventListener('mouseleave', function () {
        cell.style.backgroundColor = '';
    });
}
function showUserModal(cell, type, item) {
    var _a;
    var badge = cell.querySelector('.skystemtaskmaster-badge');
    var currentInitials = badge ? ((_a = badge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '' : '';
    var modal = document.getElementById('userSelectionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'userSelectionModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 400px;\">\n                <span class=\"close\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-bottom: 15px;\">Select ".concat(type === 'owner' ? 'Owner' : 'Reviewer', "</h3>\n                \n                <div style=\"position: relative; margin-bottom: 15px;\">\n                    <input type=\"text\" id=\"userSearch\" placeholder=\"Search by name or initials...\" \n                           style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px;\">\n                </div>\n                \n                <div style=\"max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px;\" id=\"userList\"></div>\n                \n                <div style=\"display: flex; justify-content: flex-end; margin-top: 15px; gap: 10px;\">\n                    <button id=\"unassignUserBtn\" style=\"padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;\">Unassign</button>\n                    <button id=\"closeUserModal\" style=\"padding: 8px 16px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer;\">Close</button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(modal);
        modal.querySelector('.close').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        document.getElementById('closeUserModal').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        var searchInput_1 = document.getElementById('userSearch');
        searchInput_1.addEventListener('keyup', function () {
            updateUserList(searchInput_1.value, currentInitials, type, cell, item);
        });
        document.getElementById('unassignUserBtn').addEventListener('click', function () {
            unassignUser(cell, type, item);
            modal.style.display = 'none';
        });
    }
    updateUserList('', currentInitials, type, cell, item);
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
        userList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No users found</div>';
        return;
    }
    userList.innerHTML = filtered.map(function (user) {
        var isCurrent = user.initials === currentInitials;
        return "\n            <div class=\"user-item\" data-user='".concat(JSON.stringify(user), "' \n                 style=\"display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; ").concat(isCurrent ? 'background-color: #fff0f5;' : '', "\">\n                <span class=\"skystemtaskmaster-badge skystemtaskmaster-badge-").concat(user.initials.toLowerCase(), "\" \n                      style=\"width: 32px; height: 32px; line-height: 32px;\">").concat(user.initials, "</span>\n                <div style=\"flex: 1;\">\n                    <div style=\"font-weight: 500;\">").concat(user.name, "</div>\n                    <div style=\"font-size: 12px; color: #666;\">").concat(user.email, " \u2022 ").concat(user.role, "</div>\n                </div>\n                ").concat(isCurrent ? '<span style="color: #ff0080;">✓</span>' : '', "\n            </div>\n        ");
    }).join('');
    userList.querySelectorAll('.user-item').forEach(function (el) {
        el.addEventListener('click', function () {
            var userData = el.getAttribute('data-user');
            if (userData) {
                var user = JSON.parse(userData);
                assignUser(cell, user, type, item);
                document.getElementById('userSelectionModal').style.display = 'none';
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
        if (type === 'owner') {
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].row === item.row) {
                    var row = tasks[i].row;
                    var oldCell = row.cells[5];
                    var newCell = document.createElement('td');
                    newCell.innerHTML = cell.innerHTML;
                    newCell.className = oldCell.className;
                    newCell.style.cssText = oldCell.style.cssText;
                    row.replaceChild(newCell, oldCell);
                    tasks[i].row.cells[5] = newCell;
                    makeCellClickable(newCell, type, item);
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].row === item.row) {
                    var row = tasks[i].row;
                    var oldCell = row.cells[6];
                    var newCell = document.createElement('td');
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
    }
    else {
        var subtaskItem = item;
        if (type === 'owner') {
            for (var i = 0; i < subtasks.length; i++) {
                if (subtasks[i].row === subtaskItem.row) {
                    subtasks[i].ownerCell = cell;
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < subtasks.length; i++) {
                if (subtasks[i].row === subtaskItem.row) {
                    subtasks[i].reviewerCell = cell;
                    break;
                }
            }
        }
    }
    showNotification("Assigned ".concat(user.name, " as ").concat(type));
}
function unassignUser(cell, type, item) {
    cell.innerHTML = '';
    var emptySpan = document.createElement('span');
    emptySpan.style.cssText = "\n        display: inline-block;\n        width: 30px;\n        height: 30px;\n        border-radius: 50%;\n        background: #f0f0f0;\n        color: #999;\n        text-align: center;\n        line-height: 30px;\n        font-size: 16px;\n        cursor: pointer;\n    ";
    emptySpan.textContent = '?';
    emptySpan.title = 'Click to assign';
    cell.appendChild(emptySpan);
    makeCellClickable(cell, type, item);
    showNotification("".concat(type, " unassigned"));
}
function updateExistingBadges() {
    tasks.forEach(function (task) {
        var _a, _b, _c, _d;
        var ownerBadge = (_a = task.row.cells[5]) === null || _a === void 0 ? void 0 : _a.querySelector('.skystemtaskmaster-badge');
        var reviewerBadge = (_b = task.row.cells[6]) === null || _b === void 0 ? void 0 : _b.querySelector('.skystemtaskmaster-badge');
        if (ownerBadge) {
            var text = ((_c = ownerBadge.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
            ownerBadge.className = "skystemtaskmaster-badge skystemtaskmaster-badge-".concat(text.toLowerCase());
        }
        if (reviewerBadge) {
            var text = ((_d = reviewerBadge.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            reviewerBadge.className = "skystemtaskmaster-badge skystemtaskmaster-badge-".concat(text.toLowerCase());
        }
    });
    subtasks.forEach(function (subtask) {
        var _a, _b, _c, _d;
        var ownerBadge = (_a = subtask.ownerCell) === null || _a === void 0 ? void 0 : _a.querySelector('.skystemtaskmaster-badge');
        var reviewerBadge = (_b = subtask.reviewerCell) === null || _b === void 0 ? void 0 : _b.querySelector('.skystemtaskmaster-badge');
        if (ownerBadge) {
            var text = ((_c = ownerBadge.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
            ownerBadge.className = "skystemtaskmaster-badge skystemtaskmaster-badge-".concat(text.toLowerCase());
        }
        if (reviewerBadge) {
            var text = ((_d = reviewerBadge.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            reviewerBadge.className = "skystemtaskmaster-badge skystemtaskmaster-badge-".concat(text.toLowerCase());
        }
    });
}
function initializeUserSystem() {
    console.log('Initializing user system...');
    addUserStyles();
    updateExistingBadges();
    setTimeout(function () {
        makeOwnerReviewerClickable();
        console.log('User system ready');
    }, 500);
}
// ================================
// COMMENT FUNCTIONS
// ================================
// Initialize comments
function initializeComments() {
    console.log('Initializing comments...');
    addCommentStyles();
    setTimeout(function () {
        updateCommentColumn();
    }, 500);
}
// Update comment column
function updateCommentColumn() {
    // Update tasks
    tasks.forEach(function (task) {
        if (task.row)
            updateCommentCellForRow(task.row, task, 'task');
    });
    // Update subtasks
    subtasks.forEach(function (subtask) {
        if (subtask.row)
            updateCommentCellForRow(subtask.row, subtask, 'subtask');
    });
}
// Update comment cell for a specific row
function updateCommentCellForRow(row, item, type) {
    if (!row)
        return;
    var commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    commentCells.forEach(function (cell) {
        cell.innerHTML = '';
        cell.style.cursor = 'pointer';
        cell.style.textAlign = 'center';
        cell.style.padding = '4px 8px';
        // Get row ID
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
        var commentKey = getCommentKey(rowId, type);
        var comments = taskComments[commentKey] || [];
        var count = comments.length;
        var iconContainer = document.createElement('div');
        iconContainer.style.display = 'inline-block';
        iconContainer.style.position = 'relative';
        iconContainer.style.cursor = 'pointer';
        var icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = count > 0 ? "".concat(count, " comment").concat(count > 1 ? 's' : '') : 'Add comment';
        icon.style.fontSize = '18px';
        icon.style.opacity = count > 0 ? '1' : '0.6';
        icon.style.transition = 'all 0.2s';
        if (count > 0) {
            var badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            badge.textContent = count.toString();
            badge.style.cssText = "\n                position: absolute;\n                top: -8px;\n                right: -8px;\n                background: #ff0080;\n                color: white;\n                font-size: 10px;\n                font-weight: bold;\n                padding: 2px 5px;\n                border-radius: 10px;\n                min-width: 15px;\n                text-align: center;\n                box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n            ";
            iconContainer.appendChild(icon);
            iconContainer.appendChild(badge);
        }
        else {
            iconContainer.appendChild(icon);
        }
        cell.appendChild(iconContainer);
        // Hover effects
        iconContainer.addEventListener('mouseenter', function () {
            icon.style.opacity = '1';
            icon.style.transform = 'scale(1.1)';
        });
        iconContainer.addEventListener('mouseleave', function () {
            icon.style.opacity = count > 0 ? '1' : '0.6';
            icon.style.transform = 'scale(1)';
        });
        // Click handler
        iconContainer.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            openCommentPanel(rowId, type);
        });
    });
}
// Create comment panel
function createCommentPanel() {
    var panel = document.getElementById('commentPanel');
    if (panel)
        return panel;
    panel = document.createElement('div');
    panel.id = 'commentPanel';
    panel.className = 'comment-panel';
    panel.innerHTML = "\n        <div class=\"comment-panel-header\">\n            <span>Comments</span>\n            <button class=\"close-panel\">&times;</button>\n        </div>\n        <div class=\"comment-list\"></div>\n        <div class=\"comment-input-area\">\n            <textarea placeholder=\"Add a comment...\" rows=\"2\"></textarea>\n            <button class=\"add-comment-btn\">Post</button>\n        </div>\n    ";
    document.body.appendChild(panel);
    // Close panel button
    panel.querySelector('.close-panel').addEventListener('click', function () {
        panel.classList.remove('open');
        activeCommentRowId = null;
        activeCommentType = null;
        cancelEdit();
    });
    // Post button click handler
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
            // Update existing comment
            updateComment(commentKey, editingCommentId, text);
        }
        else {
            // Create new comment
            var comments = taskComments[commentKey] || [];
            // FIXED: Use TaskComment instead of Comment
            var newComment = {
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
    textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            postBtn.click();
        }
        else if (e.key === 'Escape' && editingCommentId) {
            cancelEdit();
        }
    });
    return panel;
}
// Open comment panel
function openCommentPanel(rowId, type) {
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
// Render comments
function renderComments(commentKey) {
    var panel = document.getElementById('commentPanel');
    if (!panel)
        return;
    var list = panel.querySelector('.comment-list');
    if (!list)
        return;
    var comments = taskComments[commentKey] || [];
    if (comments.length === 0) {
        list.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        return;
    }
    var sortedComments = __spreadArray([], comments, true).sort(function (a, b) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    list.innerHTML = sortedComments.map(function (c) {
        var timestamp = new Date(c.timestamp);
        var formattedDate = formatCommentDate(timestamp);
        var formattedTime = formatCommentTime(timestamp);
        return "\n            <div class=\"comment-item ".concat(c.id === editingCommentId ? 'editing' : '', "\" data-comment-id=\"").concat(c.id, "\">\n                <div class=\"comment-header\">\n                    <span class=\"comment-author\" style=\"background: ").concat(getUserColor(c.author), "\">").concat(c.author, "</span>\n                    <div class=\"comment-meta\">\n                        <span class=\"comment-author-name\">").concat(getAuthorFullName(c.author), "</span>\n                        <div class=\"comment-datetime\">\n                            <span class=\"comment-date\">").concat(formattedDate, "</span>\n                            <span class=\"comment-time\">").concat(formattedTime, "</span>\n                        </div>\n                    </div>\n                    ").concat(c.edited ? '<span class="edited-badge">(edited)</span>' : '', "\n                </div>\n                <div class=\"comment-text\">").concat(escapeHtml(c.text), "</div>\n                <div class=\"comment-actions\">\n                    <button class=\"edit-comment\" data-id=\"").concat(c.id, "\">Edit</button>\n                    <button class=\"delete-comment\" data-id=\"").concat(c.id, "\">Delete</button>\n                </div>\n            </div>\n        ");
    }).join('');
    // Attach event listeners
    list.querySelectorAll('.edit-comment').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var commentId = btn.dataset.id;
            if (commentId)
                startEditComment(commentKey, commentId);
        });
    });
    list.querySelectorAll('.delete-comment').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var commentId = btn.dataset.id;
            if (commentId)
                deleteComment(commentKey, commentId);
        });
    });
}
// Helper functions
function getCommentKey(rowId, type) {
    return "".concat(type, "_").concat(rowId);
}
function formatCommentDate(date) {
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString())
        return 'Today';
    if (date.toDateString() === yesterday.toDateString())
        return 'Yesterday';
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
    var names = {
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
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"]/g, function (m) {
        if (m === '&')
            return '&amp;';
        if (m === '<')
            return '&lt;';
        if (m === '>')
            return '&gt;';
        if (m === '"')
            return '&quot;';
        return m;
    });
}
function cancelEdit() {
    editingCommentId = null;
    var panel = document.getElementById('commentPanel');
    if (panel) {
        var textarea = panel.querySelector('textarea');
        var postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = '';
        textarea.placeholder = 'Add a comment...';
        postBtn.textContent = 'Post';
    }
}
function startEditComment(commentKey, commentId) {
    var comments = taskComments[commentKey] || [];
    var comment = comments.find(function (c) { return c.id === commentId; });
    if (!comment)
        return;
    editingCommentId = commentId;
    var panel = document.getElementById('commentPanel');
    if (panel) {
        var textarea = panel.querySelector('textarea');
        var postBtn = panel.querySelector('.add-comment-btn');
        textarea.value = comment.text;
        textarea.placeholder = 'Edit comment...';
        textarea.focus();
        postBtn.textContent = 'Update';
    }
    renderComments(commentKey);
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
function deleteComment(commentKey, commentId) {
    if (!confirm('Delete this comment?'))
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
    updateCommentColumn();
}
// Add comment styles
function addCommentStyles() {
    if (document.getElementById('comment-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'comment-styles';
    style.textContent = "\n        .comment-panel {\n            position: fixed;\n            top: 0;\n            right: -400px;\n            width: 380px;\n            height: 100vh;\n            background: white;\n            box-shadow: -2px 0 10px rgba(0,0,0,0.1);\n            transition: right 0.3s ease;\n            z-index: 10000;\n            display: flex;\n            flex-direction: column;\n            border-left: 1px solid #ddd;\n        }\n        .comment-panel.open { right: 0; }\n        .comment-panel-header {\n            padding: 16px 20px;\n            border-bottom: 1px solid #eee;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            background: #f9f9f9;\n        }\n        .comment-panel-header span { font-weight: 600; color: #ff0080; }\n        .comment-panel-header button {\n            background: none;\n            border: none;\n            font-size: 24px;\n            cursor: pointer;\n            color: #666;\n        }\n        .comment-list {\n            flex: 1;\n            overflow-y: auto;\n            padding: 16px;\n            background: #fafafa;\n        }\n        .no-comments {\n            text-align: center;\n            color: #999;\n            margin-top: 40px;\n            font-style: italic;\n        }\n        .comment-item {\n            background: white;\n            border-radius: 8px;\n            padding: 12px;\n            margin-bottom: 12px;\n            box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n            border: 1px solid #eee;\n        }\n        .comment-item.editing {\n            border: 2px solid #ff0080;\n        }\n        .comment-header {\n            display: flex;\n            align-items: center;\n            margin-bottom: 8px;\n            gap: 8px;\n        }\n        .comment-author {\n            display: inline-block;\n            width: 28px;\n            height: 28px;\n            border-radius: 50%;\n            color: white;\n            text-align: center;\n            line-height: 28px;\n            font-weight: bold;\n            font-size: 12px;\n        }\n        .comment-text {\n            font-size: 14px;\n            line-height: 1.5;\n            word-wrap: break-word;\n            margin: 8px 0;\n            color: #333;\n        }\n        .comment-actions {\n            display: flex;\n            gap: 8px;\n            justify-content: flex-end;\n            margin-top: 8px;\n        }\n        .comment-actions button {\n            background: none;\n            border: none;\n            color: #ff0080;\n            font-size: 12px;\n            cursor: pointer;\n            padding: 4px 8px;\n            border-radius: 4px;\n        }\n        .comment-actions button:hover { background: #fff0f5; }\n        .comment-input-area {\n            padding: 16px;\n            border-top: 1px solid #eee;\n            background: white;\n        }\n        .comment-input-area textarea {\n            width: 100%;\n            padding: 10px;\n            border: 1px solid #ddd;\n            border-radius: 4px;\n            resize: vertical;\n            font-family: inherit;\n            margin-bottom: 10px;\n        }\n        .comment-input-area textarea:focus {\n            outline: none;\n            border-color: #ff0080;\n        }\n        .add-comment-btn {\n            background: #ff0080;\n            color: white;\n            border: none;\n            padding: 8px 16px;\n            border-radius: 4px;\n            cursor: pointer;\n            float: right;\n        }\n        .add-comment-btn:hover { background: #e50072; }\n    ";
    document.head.appendChild(style);
}
function ensureAllTasksHaveIds() {
    console.log('Ensuring all tasks and subtasks have IDs...');
    // Check tasks
    tasks.forEach(function (task, index) {
        if (!task.id) {
            task.id = 'task_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5);
        }
        if (task.row && !task.row.dataset.taskId) {
            task.row.dataset.taskId = task.id;
        }
    });
    // Check subtasks
    subtasks.forEach(function (subtask, index) {
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
    // Edit buttons
    list.querySelectorAll('.edit-comment').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var target = e.target;
            var commentId = target.dataset.id;
            if (commentId)
                startEditComment(commentKey, commentId);
        });
    });
    // Delete buttons
    list.querySelectorAll('.delete-comment').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var target = e.target;
            var commentId = target.dataset.id;
            if (commentId)
                deleteComment(commentKey, commentId);
        });
    });
}
function updateCommentIcon(rowId, type) {
    var commentKey = getCommentKey(rowId, type);
    var comments = taskComments[commentKey] || [];
    var count = comments.length;
    // Find the comment icon for this row
    var selector = '';
    if (type === 'task') {
        selector = "tr[data-task-id=\"".concat(rowId, "\"] .comment-icon");
    }
    else {
        selector = "tr[data-subtask-id=\"".concat(rowId, "\"] .comment-icon");
    }
    var icon = document.querySelector(selector);
    if (icon) {
        if (count > 0) {
            icon.setAttribute('data-count', count.toString());
            icon.classList.add('has-comments');
            icon.title = "".concat(count, " comment").concat(count > 1 ? 's' : '');
        }
        else {
            icon.removeAttribute('data-count');
            icon.classList.remove('has-comments');
            icon.title = 'Add comment';
        }
    }
}
function addCommentIcons() {
    // We'll add the comment functionality to the Comment column instead
    updateCommentColumn();
}
function makeCellEditable(cell, task, fieldName) {
    if (!cell)
        return;
    // Don't make already editable cells again
    if (cell.classList.contains('editable-field'))
        return;
    cell.classList.add('editable-field');
    cell.style.cursor = 'pointer';
    cell.title = "Click to edit ".concat(fieldName);
    // Store original value
    var originalValue = cell.innerText.trim();
    cell.addEventListener('click', function (e) {
        e.stopPropagation();
        // Don't open editor if already editing
        if (cell.classList.contains('editing-mode'))
            return;
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
    cell.addEventListener('mouseenter', function () {
        if (!cell.classList.contains('editing-mode')) {
            cell.style.backgroundColor = '#fff0f5';
            cell.style.borderRadius = '4px';
        }
    });
    cell.addEventListener('mouseleave', function () {
        if (!cell.classList.contains('editing-mode')) {
            cell.style.backgroundColor = '';
        }
    });
}
// Placeholder functions for the editors (to be implemented if needed)
function showUserSelector(cell, task, fieldName) {
    // Implementation for user selector
    showUserModal(cell, fieldName, task);
}
function showStatusSelector(cell, task) {
    showStatusChangeModal(task);
}
function showDatePicker(cell, task) {
    var _a;
    // Simple implementation - you can enhance this
    var currentDate = ((_a = cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    var newDate = prompt('Enter new due date (YYYY-MM-DD):', currentDate);
    if (newDate) {
        cell.textContent = newDate;
        calculateDays();
    }
}
function showTextEditor(cell, task, fieldName) {
    var _a;
    var currentValue = ((_a = cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    var newValue = prompt("Enter new ".concat(fieldName, ":"), currentValue);
    if (newValue !== null) {
        cell.textContent = newValue;
        if (fieldName === 'tdoc' || fieldName === 'cdoc') {
            // Update task object
            if (fieldName === 'tdoc')
                task.tdoc = newValue;
            if (fieldName === 'cdoc')
                task.cdoc = newValue;
        }
    }
}
function showInlineEditor(cell, task, fieldName) {
    var _a;
    var currentValue = ((_a = cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    var newValue = prompt("Enter new ".concat(fieldName, ":"), currentValue);
    if (newValue !== null) {
        cell.textContent = newValue;
        // Update task object if property exists
        if (fieldName in task) {
            task[fieldName] = newValue;
        }
    }
}
// ================================
// ADD TASK EVENT LISTENERS
// ================================
function addTaskEventListeners(task) {
    var row = task.row;
    if (!row)
        return;
    // Status badge click handler
    var statusBadge = row.querySelector('.skystemtaskmaster-status-badge');
    if (statusBadge) {
        // Make the badge itself clickable
        statusBadge.style.cursor = 'pointer';
        statusBadge.title = 'Click to change status';
        // Remove any existing listeners by cloning
        var newBadge = statusBadge.cloneNode(true);
        if (statusBadge.parentNode) {
            statusBadge.parentNode.replaceChild(newBadge, statusBadge);
        }
        // Add new click handler
        newBadge.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            console.log('Status badge clicked');
            showStatusChangeModal(task);
        });
        // Update the task object to point to the new badge
        task.statusBadge = newBadge;
    }
    // Owner badge click handler
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
    // Reviewer badge click handler
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
    // Checkbox change handler
    var checkbox = row.querySelector('.task-checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                if (statusBadge) {
                    statusBadge.innerText = "Completed";
                    statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-completed";
                }
            }
            else {
                if (statusBadge) {
                    statusBadge.innerText = "Not Started";
                    statusBadge.className = "skystemtaskmaster-status-badge skystemtaskmaster-status-not-started";
                }
            }
            updateCounts();
        });
    }
    // Due date blur handler
    var dueDateCell = row.querySelector('.due-date');
    if (dueDateCell) {
        dueDateCell.addEventListener('blur', calculateDays);
    }
    // Comment icon click handler
    var commentIcon = row.querySelector('.comment-icon');
    if (commentIcon) {
        commentIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (task.id)
                openCommentPanel(task.id, 'task');
        });
    }
    console.log('Event listeners added for task:', task.name);
}
// ================================
// STYLES
// ================================
function addStyles() {
    var style = document.createElement('style');
    style.textContent = "\n        @keyframes slideIn {\n            from { transform: translateX(100%); opacity: 0; }\n            to { transform: translateX(0); opacity: 1; }\n        }\n        \n        @keyframes slideOut {\n            from { transform: translateX(0); opacity: 1; }\n            to { transform: translateX(100%); opacity: 0; }\n        }\n        \n        .skystemtaskmaster-editable {\n            cursor: pointer;\n            padding: 2px 4px;\n            border-radius: 2px;\n            min-width: 50px;\n            transition: all 0.2s ease;\n        }\n        \n        .skystemtaskmaster-editable:hover {\n            background-color: #f0f0f0;\n            outline: 1px solid #ff0080;\n        }\n        \n        .skystemtaskmaster-editable:focus {\n            outline: 2px solid #ff0080;\n            background-color: #fff;\n        }\n        \n        .modal {\n            display: none;\n            position: fixed;\n            z-index: 1000;\n            left: 0;\n            top: 0;\n            width: 100%;\n            height: 100%;\n            background-color: rgba(0,0,0,0.5);\n        }\n        \n        .modal-content {\n            background-color: white;\n            margin: 4% auto;\n            padding: 20px;\n            border-radius: 8px;\n            position: relative;\n            animation: slideDown 0.3s;\n        }\n        \n        @keyframes slideDown {\n            from { transform: translateY(-30px); opacity: 0; }\n            to { transform: translateY(0); opacity: 1; }\n        }\n        \n        .close {\n            position: absolute;\n            right: 20px;\n            top: 10px;\n            font-size: 24px;\n            cursor: pointer;\n            color: #999;\n        }\n        \n        .close:hover { color: #ff0080; }\n        \n        /* 3-Dot Dropdown Styles */\n        .skystemtaskmaster-dropdown-container {\n            position: relative;\n            display: inline-block;\n        }\n        \n        .skystemtaskmaster-three-dots {\n            background: transparent;\n            border: none;\n            cursor: pointer;\n            padding: 8px;\n            border-radius: 4px;\n            color: #666;\n            transition: all 0.2s;\n        }\n        \n        .skystemtaskmaster-three-dots:hover {\n            background: #f0f0f0;\n            color: #ff0080;\n        }\n        \n        .skystemtaskmaster-dropdown-menu {\n            position: absolute;\n            top: 100%;\n            left: 0;\n            background: white;\n            border-radius: 8px;\n            box-shadow: 0 4px 20px rgba(0,0,0,0.15);\n            min-width: 200px;\n            z-index: 1000;\n            display: none;\n            animation: fadeIn 0.2s;\n        }\n        \n        .skystemtaskmaster-dropdown-menu.show {\n            display: block;\n        }\n        \n        .dropdown-item {\n            padding: 12px 16px;\n            cursor: pointer;\n            transition: all 0.2s;\n            display: flex;\n            align-items: center;\n            gap: 8px;\n            position: relative;\n            color: #333;\n        }\n        \n        .dropdown-item:hover {\n            background: #fff0f5;\n            color: #ff0080;\n        }\n        \n        .dropdown-divider {\n            height: 1px;\n            background: #eee;\n            margin: 4px 0;\n        }\n        \n        .dropdown-item .submenu {\n            position: absolute;\n            left: 100%;\n            top: 0;\n            background: white;\n            border-radius: 8px;\n            box-shadow: 0 4px 20px rgba(0,0,0,0.15);\n            min-width: 150px;\n            display: none;\n            animation: slideLeft 0.2s;\n        }\n        \n        .dropdown-item:hover .submenu {\n            display: block;\n        }\n        \n        .submenu-item {\n            padding: 10px 16px;\n            cursor: pointer;\n            transition: all 0.2s;\n            display: flex;\n            align-items: center;\n            gap: 8px;\n        }\n        \n        .submenu-item:hover {\n            background: #fff0f5;\n            color: #ff0080;\n        }\n        \n        @keyframes fadeIn {\n            from { opacity: 0; transform: translateY(-10px); }\n            to { opacity: 1; transform: translateY(0); }\n        }\n        \n        @keyframes slideLeft {\n            from { opacity: 0; transform: translateX(10px); }\n            to { opacity: 1; transform: translateX(0); }\n        }\n        \n        /* List styles */\n        .main-list-row {\n            background-color: #f0f0f0 !important;\n            border-top: 2px solid #ff0080;\n            border-bottom: 2px solid #ff0080;\n        }\n        \n        .main-list-row td { padding: 0 !important; }\n        \n        .list-header {\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            padding: 12px;\n        }\n        \n        .list-icon { font-size: 20px; color: #ff0080; }\n        .list-name { flex: 1; font-weight: bold; font-size: 16px; }\n        \n        .add-sublist-btn {\n            background: #ff0080;\n            color: white;\n            border: none;\n            padding: 6px 12px;\n            border-radius: 4px;\n            cursor: pointer;\n            font-size: 13px;\n            font-weight: 500;\n        }\n        \n        .add-sublist-btn:hover { background: #e50072; }\n        \n        .collapse-icon {\n            cursor: pointer;\n            font-size: 16px;\n            transition: transform 0.2s;\n        }\n        \n        .collapse-icon:hover { transform: scale(1.2); }\n        \n        /* Sub list styles */\n        .sub-list-row {\n            background-color: #f9f9f9 !important;\n        }\n        \n        .sub-list-row td { padding: 0 !important; }\n        \n        .sublist-header {\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            padding: 10px 10px 10px 40px;\n        }\n        \n        .sublist-icon { font-size: 18px; color: #00cfff; }\n        .sublist-name { flex: 1; font-weight: 500; }\n        \n        .add-task-btn {\n            background: #00cfff;\n            color: white;\n            border: none;\n            padding: 4px 10px;\n            border-radius: 4px;\n            cursor: pointer;\n            font-size: 12px;\n        }\n        \n        .add-task-btn:hover { background: #00b5e0; }\n        \n        .collapse-sublist-icon {\n            cursor: pointer;\n            font-size: 14px;\n            transition: transform 0.2s;\n        }\n        \n        .collapse-sublist-icon:hover { transform: scale(1.2); }\n        \n        /* Task styles */\n        .task-row .skystemtaskmaster-task-name {\n            padding-left: 70px;\n            display: flex;\n            align-items: center;\n            gap: 8px;\n        }\n        \n        .comment-icon {\n            cursor: pointer;\n            font-size: 14px;\n            opacity: 0.6;\n            transition: opacity 0.2s;\n        }\n        \n        .comment-icon:hover { opacity: 1; }\n        \n        /* Status badges */\n        .skystemtaskmaster-status-badge {\n            padding: 4px 8px;\n            border-radius: 12px;\n            font-size: 12px;\n            font-weight: 500;\n            display: inline-block;\n            cursor: pointer;\n            transition: all 0.2s;\n        }\n        \n        .skystemtaskmaster-status-badge:hover {\n            transform: scale(1.05);\n            box-shadow: 0 2px 5px rgba(0,0,0,0.1);\n        }\n        \n        .skystemtaskmaster-status-not-started {\n            background: #fde2e4;\n            color: #e91e63;\n        }\n        \n        .skystemtaskmaster-status-in-progress {\n            background: #fff3cd;\n            color: #ff9800;\n        }\n        \n        .skystemtaskmaster-status-completed {\n            background: #4CAF50;\n            color: white;\n        }\n        \n        /* Days cell */\n        .days-cell { font-weight: bold; }\n        .skystemtaskmaster-days-positive { color: #4CAF50; }\n        .skystemtaskmaster-days-negative { color: #f44336; }\n    ";
    document.head.appendChild(style);
}
// ================================
// CREATE MODALS
// ================================
function createModals() {
    var modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.innerHTML = "\n        <div id=\"newTaskOptionsModal\" class=\"modal\">\n            <div class=\"modal-content\" style=\"width: 300px;\">\n                <span class=\"close\">&times;</span>\n                <h3>Create New</h3>\n                <div style=\"margin-top:20px;\">\n                    <div style=\"position:relative;\">\n                        <button id=\"newTaskMainButton\"\n                            style=\"width:100%; padding:15px; background:#ff0080; color:white; border:none; border-radius:8px; cursor:pointer; font-size:16px; display:flex; justify-content:space-between; align-items:center;\">\n                            <span>\n                                <i class=\"fa-solid fa-clipboard-list\"></i> New Task\n                            </span>\n                                <span class=\"dropdown-arrow\">\n                                 <i class=\"fa-solid fa-angle-down\"></i>\n                               </span>\n                        </button>\n                        \n                        <div id=\"newTaskDropdown\"\n                            style=\"display:none; position:absolute; top:100%; left:0; width:100%; background:white; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.2); margin-top:5px; z-index:1000;\">\n                            <button id=\"newListOption\"\n                                style=\"width:100%; padding:12px; border:none; background:white; cursor:pointer; text-align:left; border-bottom:1px solid #eee;\">\n                                <span>\n                                 <i class=\"fa-solid fa-list\"></i> New List\n                               </span>\n                            </button>\n                            <button id=\"importTasksOption\"\n                                style=\"width:100%; padding:12px; border:none; background:white; cursor:pointer; text-align:left;\">\n                                <span>\n                                 <i class=\"fa-solid fa-file-import\"></i> Import Tasks\n                                </span>\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        \n        <div id=\"enterListNameModal\" class=\"modal\">\n            <div class=\"modal-content\">\n                <span class=\"close\">&times;</span>\n                <h3>Enter List Name</h3>\n                <div style=\"margin-top: 20px;\">\n                    <input type=\"text\" id=\"listNameInput\" placeholder=\"Enter list name\" style=\"width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;\">\n                    <button id=\"createListBtn\" style=\"background: #ff0080; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%;\">Create List</button>\n                </div>\n            </div>\n        </div>\n        \n        <!-- UPDATED IMPORT TASKS MODAL WITH FILE UPLOAD -->\n        <div id=\"importTasksModal\" class=\"modal\">\n            <div class=\"modal-content\" style=\"width: 1000px; max-width: 90%;\">\n                <span class=\"close\" style=\"position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer;\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-bottom: 20px;\">\uD83D\uDCE5 Import Tasks from File</h3>\n                \n                <div style=\"margin: 20px 0;\">\n                    <!-- File Upload Area -->\n                    <div style=\"margin-bottom: 25px; background: #f9f9f9; padding: 20px; border-radius: 8px; height:300px;\">\n                        <h4 style=\"margin-top: 0; margin-bottom: 15px; color: #333;\">Upload File</h4>\n                        \n                        <div id=\"importDropArea\" style=\"border: 2px dashed #ff0080; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 15px; cursor: pointer; transition: all 0.3s; background: #fff0f5;\">\n                            <div style=\"font-size: 48px; margin-bottom: 10px;\"><i class=\"fa-solid fa-folder-open\"></i></div>\n                            <div style=\"color: #ff0080; font-weight: 500; margin-bottom: 5px;\">Drag & drop file here</div>\n                            <div style=\"color: #666; margin-bottom: 15px;\">or</div>\n                            <button id=\"importBrowseFileBtn\" style=\"background: #ff0080; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;\">Browse Files</button>\n                            <input type=\"file\" id=\"importFileInput\" style=\"display: none;\" accept=\".csv,.json,.txt,.xlsx,.xls\">\n                        </div>\n                        \n                        <div style=\"font-size: 13px; color: #666; padding: 10px; background: #fff; border-radius: 4px; border-left: 3px solid #ff0080;\">\n                            <strong>Supported formats:</strong> CSV, JSON, TXT (one task per line), Excel (.xlsx, .xls)\n                        </div>\n                    </div>\n                    \n                    <!-- Preview Area -->\n                    <div id=\"importPreviewArea\" style=\"display: none; margin-bottom: 20px;\">\n                        <h4 style=\"margin-bottom: 10px; color: #333;\">Preview Imported Tasks</h4>\n                        <div style=\"max-height: 200px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; background: white;\">\n                            <table style=\"width: 100%; border-collapse: collapse;\">\n                                <thead style=\"background: #f5f5f5; position: sticky; top: 0;\">\n                                    <tr>\n                                        <th style=\"padding: 8px; text-align: left; border-bottom: 2px solid #ddd;\">Task Name</th>\n                                        <th style=\"padding: 8px; text-align: left; border-bottom: 2px solid #ddd;\">Owner</th>\n                                        <th style=\"padding: 8px; text-align: left; border-bottom: 2px solid #ddd;\">Reviewer</th>\n                                        <th style=\"padding: 8px; text-align: left; border-bottom: 2px solid #ddd;\">Due Date</th>\n                                    </tr>\n                                </thead>\n                                <tbody id=\"importPreviewBody\"></tbody>\n                            </table>\n                        </div>\n                    </div>\n                    \n                    <!-- Import Options -->\n                    <div style=\"margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;\">\n                        <h4 style=\"margin-top: 0; margin-bottom: 15px; color: #333;\">Import Options</h4>\n                        \n                        <div style=\"margin-bottom: 15px;\">\n                            <label style=\"display: flex; align-items: center; gap: 8px; cursor: pointer;\">\n                                <input type=\"radio\" name=\"importTarget\" value=\"newList\" checked>\n                                <span>Create New List with imported tasks</span>\n                            </label>\n                            <label style=\"display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 8px;\">\n                                <input type=\"radio\" name=\"importTarget\" value=\"currentList\">\n                                <span>Add to currently selected list</span>\n                            </label>\n                        </div>\n                        \n                        <div style=\"margin-bottom: 10px;\">\n                            <label style=\"display: flex; align-items: center; gap: 8px; cursor: pointer;\">\n                                <input type=\"checkbox\" id=\"skipDuplicates\" checked>\n                                <span>Skip duplicate task names</span>\n                            </label>\n                        </div>\n                    </div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;\">\n                    <button id=\"cancelImportBtn\" style=\"padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;\">Cancel</button>\n                    <button id=\"processImportBtn\" style=\"padding: 10px 20px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;\" disabled>Import Tasks</button>\n                </div>\n            </div>\n        </div>\n        \n        <div id=\"addTaskModal\" class=\"modal\">\n            <div class=\"modal-content\" style=\"width: 500px;\">\n                <span class=\"close\">&times;</span>\n                <h3>Add New Task</h3>\n                <div style=\"margin-top: 20px;\">\n                    <div style=\"margin-bottom: 15px;\">\n                        <label>Task Name *</label>\n                        <input type=\"text\" id=\"addTaskName\" placeholder=\"Enter task name\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\" autofocus>\n                    </div>\n                    \n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                        <div>\n                            <label>Acc</label>\n                            <input type=\"text\" id=\"addTaskAcc\" value=\"+\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                        <div>\n                            <label>TDoc</label>\n                            <input type=\"text\" id=\"addTaskTdoc\" value=\"0\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                        </div>\n                    </div>\n                    \n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                        <div>\n                            <label>Owner</label>\n                            <select id=\"addTaskOwner\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK (Palakh Khanna)</option>\n                                <option value=\"SM\">SM (Sarah Miller)</option>\n                                <option value=\"MP\">MP (Mel Preparer)</option>\n                                <option value=\"PP\">PP (Poppy Pan)</option>\n                                <option value=\"JS\">JS (John Smith)</option>\n                                <option value=\"EW\">EW (Emma Watson)</option>\n                                <option value=\"DB\">DB (David Brown)</option>\n                            </select>\n                        </div>\n                        <div>\n                            <label>Reviewer</label>\n                            <select id=\"addTaskReviewer\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK (Palakh Khanna)</option>\n                                <option value=\"SM\">SM (Sarah Miller)</option>\n                                <option value=\"MP\">MP (Mel Preparer)</option>\n                                <option value=\"PP\">PP (Poppy Pan)</option>\n                                <option value=\"JS\">JS (John Smith)</option>\n                                <option value=\"EW\">EW (Emma Watson)</option>\n                                <option value=\"DB\">DB (David Brown)</option>\n                            </select>\n                        </div>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label>Due Date (optional)</label>\n                        <input type=\"date\" id=\"addTaskDueDate\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                    </div>\n                    \n                    <button id=\"addTaskBtn\" style=\"background: #ff0080; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px;\">Add Task</button>\n                </div>\n            </div>\n        </div>\n        \n        <div id=\"addSubtaskModal\" class=\"modal\">\n            <div class=\"modal-content\" style=\"width: 500px;\">\n                <span class=\"close\">&times;</span>\n                <h3>Add Subtask</h3>\n                <div style=\"margin-top: 20px;\">\n                    <div style=\"margin-bottom: 15px;\">\n                        <label>Subtask Name</label>\n                        <input type=\"text\" id=\"subtaskName\" placeholder=\"Enter subtask name\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label>Status</label>\n                        <select id=\"subtaskStatus\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                            <option value=\"Not Started\">Not Started</option>\n                            <option value=\"In Progress\">In Progress</option>\n                            <option value=\"Completed\">Completed</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;\">\n                        <div>\n                            <label>Owner</label>\n                            <select id=\"subtaskOwner\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK</option>\n                                <option value=\"SM\">SM</option>\n                            </select>\n                        </div>\n                        <div>\n                            <label>Reviewer</label>\n                            <select id=\"subtaskReviewer\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                                <option value=\"PK\">PK</option>\n                                <option value=\"SM\">SM</option>\n                            </select>\n                        </div>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label>TDoc</label>\n                        <input type=\"text\" id=\"subtaskTdoc\" value=\"\" style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;\">\n                    </div>\n                    \n                    <button id=\"addSubtaskBtn\" style=\"background: #ff0080; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%;\">Add Subtask</button>\n                </div>\n            </div>\n        </div>\n    ";
    document.body.appendChild(modalContainer);
}
// ================================
// INITIALIZE EVENT LISTENERS
// ================================
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
    // ===== NEW CODE: Toggle dropdown when New Task button is clicked =====
    var newTaskMainButton = document.getElementById('newTaskMainButton');
    var newTaskDropdown = document.getElementById('newTaskDropdown');
    if (newTaskMainButton && newTaskDropdown) {
        newTaskMainButton.addEventListener('click', function (e) {
            e.stopPropagation();
            newTaskDropdown.style.display = newTaskDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
    // Close dropdown when clicking outside
    document.addEventListener('click', function () {
        if (newTaskDropdown) {
            newTaskDropdown.style.display = 'none';
        }
    });
    // Prevent dropdown from closing when clicking inside it
    if (newTaskDropdown) {
        newTaskDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }
    // ===== END OF NEW CODE =====
    document.querySelectorAll('.close').forEach(function (button) {
        button.addEventListener('click', function () {
            newTaskOptionsModal.style.display = 'none';
            enterListNameModal.style.display = 'none';
            importTasksModal.style.display = 'none';
            addTaskModal.style.display = 'none';
            addSubtaskModal.style.display = 'none';
        });
    });
    window.addEventListener('click', function (event) {
        var target = event.target;
        if (target === newTaskOptionsModal)
            newTaskOptionsModal.style.display = 'none';
        if (target === enterListNameModal)
            enterListNameModal.style.display = 'none';
        if (target === importTasksModal)
            importTasksModal.style.display = 'none';
        if (target === addTaskModal)
            addTaskModal.style.display = 'none';
        if (target === addSubtaskModal)
            addSubtaskModal.style.display = 'none';
    });
    var newListOption = document.getElementById('newListOption');
    if (newListOption) {
        newListOption.addEventListener('click', function () {
            newTaskOptionsModal.style.display = 'none';
            enterListNameModal.style.display = 'block';
            if (newTaskDropdown)
                newTaskDropdown.style.display = 'none';
        });
    }
    var importTasksOption = document.getElementById('importTasksOption');
    if (importTasksOption) {
        importTasksOption.addEventListener('click', function () {
            newTaskOptionsModal.style.display = 'none';
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
            addTaskModal.style.display = 'block';
        });
    }
    var subtaskPlus = document.querySelector('.subtask-plus');
    if (subtaskPlus) {
        subtaskPlus.addEventListener('click', function () {
            addSubtaskModal.style.display = 'block';
        });
    }
    var importTaskBtn = document.getElementById('importTaskBtn');
    if (importTaskBtn) {
        importTaskBtn.addEventListener('click', function () {
            var taskName = document.getElementById('importTaskName').value;
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
            }
            else {
                createNewTask(taskName, document.getElementById('importAcc').value || '+', document.getElementById('importTdoc').value || '0', document.getElementById('importOwner').value, document.getElementById('importReviewer').value, document.getElementById('importDueDate').value);
            }
            importTasksModal.style.display = 'none';
            showNotification('Task imported!');
        });
    }
    // Initialize 3-dot menu
    initializeThreeDotsMenu();
    var searchInput = document.querySelector(".skystemtaskmaster-search-bar");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            var value = searchInput.value.toLowerCase();
            tasks.forEach(function (task) {
                var text = task.row.innerText.toLowerCase();
                task.row.style.display = text.indexOf(value) !== -1 ? "" : "none";
            });
            subtasks.forEach(function (subtask) {
                var text = subtask.row.innerText.toLowerCase();
                subtask.row.style.display = text.indexOf(value) !== -1 ? "" : "none";
            });
        });
    }
    var taskDropdown = document.querySelector(".skystemtaskmaster-task-dropdown");
    if (taskDropdown) {
        taskDropdown.addEventListener("change", function () {
            var filter = taskDropdown.value;
            tasks.forEach(function (task) {
                var _a, _b;
                var ownerCell = task.row.cells[5];
                var reviewerCell = task.row.cells[6];
                var ownerBadge = ownerCell === null || ownerCell === void 0 ? void 0 : ownerCell.querySelector('.skystemtaskmaster-badge');
                var reviewerBadge = reviewerCell === null || reviewerCell === void 0 ? void 0 : reviewerCell.querySelector('.skystemtaskmaster-badge');
                var ownerText = ownerBadge ? ((_a = ownerBadge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '' : '';
                var reviewerText = reviewerBadge ? ((_b = reviewerBadge.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '' : '';
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
            subtasks.forEach(function (subtask) {
                var _a, _b;
                var ownerBadge = subtask.ownerCell.querySelector('.skystemtaskmaster-badge');
                var reviewerBadge = subtask.reviewerCell.querySelector('.skystemtaskmaster-badge');
                var ownerText = ownerBadge ? ((_a = ownerBadge.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '' : '';
                var reviewerText = reviewerBadge ? ((_b = reviewerBadge.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '' : '';
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
function createTask(subList, taskData) {
    var task = {
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
        row: null,
        checkbox: null,
        statusBadge: null,
        dueDateCell: null,
        daysCell: null,
        taskNameCell: null
    };
    subList.tasks.push(task);
    tasks.push(task);
    // Create the row first
    createTaskRow(task, subList);
    // IMPORTANT: Immediately update document columns for this new row
    setTimeout(function () {
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
    showNotification("Task \"".concat(taskData.name, "\" created"));
    return task;
}
// ================================
// HELPER FUNCTIONS TO UPDATE SINGLE ROWS
// ================================
function updateCDocColumnForRow(row) {
    if (!row)
        return;
    var cdocCell = row.cells[7];
    if (!cdocCell)
        return;
    cdocCell.innerHTML = '';
    cdocCell.style.textAlign = 'center';
    var docs = taskDocuments.get(row) || [];
    var iconContainer = document.createElement('span');
    iconContainer.className = 'cdoc-icon-container';
    iconContainer.style.cssText = "\n        cursor: pointer;\n        display: inline-block;\n        position: relative;\n        padding: 5px;\n    ";
    var icon = document.createElement('i');
    icon.className = docs.length > 0 ? 'fas fa-folder-open' : 'fas fa-folder';
    icon.style.cssText = "\n        font-size: 20px;\n        color: ".concat(docs.length > 0 ? '#ff0080' : '#999', ";\n        transition: all 0.2s;\n    ");
    if (docs.length === 0) {
        icon.style.opacity = '0.7';
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
        badge.style.cssText = "\n            position: absolute;\n            top: -5px;\n            right: -5px;\n            background: #ff0080;\n            color: white;\n            font-size: 10px;\n            font-weight: bold;\n            padding: 2px 5px;\n            border-radius: 10px;\n            min-width: 15px;\n            text-align: center;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n        ";
        iconContainer.appendChild(badge);
    }
    else {
        var plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle';
        plusIcon.style.cssText = "\n            position: absolute;\n            bottom: -5px;\n            right: -5px;\n            font-size: 12px;\n            color: #ff0080;\n            background: white;\n            border-radius: 50%;\n        ";
        iconContainer.appendChild(plusIcon);
    }
    iconContainer.onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        showDocumentManager(row);
    };
    iconContainer.onmouseenter = function () {
        icon.style.transform = 'scale(1.1)';
    };
    iconContainer.onmouseleave = function () {
        icon.style.transform = 'scale(1)';
    };
    cdocCell.appendChild(iconContainer);
}
function updateTDocColumnForRow(row) {
    if (!row)
        return;
    var tdocCell = row.cells[2];
    if (!tdocCell)
        return;
    tdocCell.innerHTML = '';
    tdocCell.style.textAlign = 'center';
    var docs = taskTDocDocuments.get(row) || [];
    var iconContainer = document.createElement('span');
    iconContainer.className = 'tdoc-icon-container';
    iconContainer.style.cssText = "\n        cursor: pointer;\n        display: inline-block;\n        position: relative;\n        padding: 5px;\n    ";
    var icon = document.createElement('i');
    icon.className = 'fas fa-file-alt';
    icon.style.cssText = "\n        font-size: 20px;\n        color: ".concat(docs.length > 0 ? '#00cfff' : '#999', ";\n        transition: all 0.2s;\n    ");
    if (docs.length === 0) {
        icon.style.opacity = '0.7';
        icon.title = 'Click to upload documents';
    }
    else {
        icon.title = "".concat(docs.length, " document(s) attached");
    }
    iconContainer.appendChild(icon);
    if (docs.length > 0) {
        var badge = document.createElement('span');
        badge.className = 'tdoc-badge';
        badge.textContent = docs.length.toString();
        badge.style.cssText = "\n            position: absolute;\n            top: -5px;\n            right: -5px;\n            background: #00cfff;\n            color: white;\n            font-size: 10px;\n            font-weight: bold;\n            padding: 2px 5px;\n            border-radius: 10px;\n            min-width: 15px;\n            text-align: center;\n            box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n        ";
        iconContainer.appendChild(badge);
    }
    else {
        var plusIcon = document.createElement('i');
        plusIcon.className = 'fas fa-plus-circle';
        plusIcon.style.cssText = "\n            position: absolute;\n            bottom: -5px;\n            right: -5px;\n            font-size: 12px;\n            color: #ff0080;\n            background: white;\n            border-radius: 50%;\n        ";
        iconContainer.appendChild(plusIcon);
    }
    iconContainer.onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        showTDocDocumentManager(row);
    };
    iconContainer.onmouseenter = function () {
        icon.style.transform = 'scale(1.1)';
    };
    iconContainer.onmouseleave = function () {
        icon.style.transform = 'scale(1)';
    };
    tdocCell.appendChild(iconContainer);
}
function updateCommentColumnForRow(row, item, type) {
    if (!row)
        return;
    var commentCells = row.querySelectorAll('.extra-cell[data-column="comment"]');
    commentCells.forEach(function (cell) {
        cell.innerHTML = '';
        cell.style.cursor = 'pointer';
        cell.style.textAlign = 'center';
        cell.style.padding = '4px 8px';
        var rowId = type === 'task' ?
            (row.dataset.taskId || item.id) :
            (row.dataset.subtaskId || item.id);
        if (!rowId)
            return;
        var commentKey = getCommentKey(rowId, type);
        var comments = taskComments[commentKey] || [];
        var count = comments.length;
        var iconContainer = document.createElement('div');
        iconContainer.style.display = 'inline-block';
        iconContainer.style.position = 'relative';
        iconContainer.style.cursor = 'pointer';
        var icon = document.createElement('span');
        icon.className = 'comment-icon';
        icon.innerHTML = '💬';
        icon.title = count > 0 ? "".concat(count, " comment").concat(count > 1 ? 's' : '') : 'Add comment';
        icon.style.fontSize = '18px';
        icon.style.opacity = count > 0 ? '1' : '0.6';
        icon.style.transition = 'all 0.2s';
        if (count > 0) {
            var badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            badge.textContent = count.toString();
            badge.style.cssText = "\n                position: absolute;\n                top: -8px;\n                right: -8px;\n                background: #ff0080;\n                color: white;\n                font-size: 10px;\n                font-weight: bold;\n                padding: 2px 5px;\n                border-radius: 10px;\n                min-width: 15px;\n                text-align: center;\n                box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n            ";
            iconContainer.appendChild(icon);
            iconContainer.appendChild(badge);
        }
        else {
            iconContainer.appendChild(icon);
        }
        cell.appendChild(iconContainer);
        iconContainer.addEventListener('mouseenter', function () {
            icon.style.opacity = '1';
            icon.style.transform = 'scale(1.1)';
        });
        iconContainer.addEventListener('mouseleave', function () {
            icon.style.opacity = count > 0 ? '1' : '0.6';
            icon.style.transform = 'scale(1)';
        });
        iconContainer.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            openCommentPanel(rowId, type);
        });
    });
}
function updateRecurrenceClasses() {
    tasks.forEach(function (task) {
        if (task.row) {
            var recurrenceType = task.recurrenceType || 'None';
            // Define recurring options
            var recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
            var isRecurring = recurringOptions.indexOf(recurrenceType) >= 0;
            // Remove existing classes
            task.row.classList.remove('recurring-task', 'non-recurring-task');
            // Add appropriate class
            if (isRecurring) {
                task.row.classList.add('recurring-task');
            }
            else {
                task.row.classList.add('non-recurring-task');
            }
            // Store recurrence type as data attribute
            task.row.setAttribute('data-recurrence-type', recurrenceType);
        }
    });
    console.log('Recurrence classes updated for', tasks.length, 'tasks');
}
// Add function to update recurrence type for a task
function updateTaskRecurrence(taskId, newRecurrenceType) {
    var task = tasks.find(function (t) { return t.id === taskId || t.row.dataset.taskId === taskId; });
    if (task) {
        var oldType = task.recurrenceType || 'None';
        task.recurrenceType = newRecurrenceType;
        // Update row class
        var isRecurring = newRecurrenceType !== 'None';
        task.row.classList.remove('recurring-task', 'non-recurring-task');
        if (isRecurring) {
            task.row.classList.add('recurring-task');
        }
        else {
            task.row.classList.add('non-recurring-task');
        }
        task.row.setAttribute('data-recurrence-type', newRecurrenceType);
        // Update the recurrence indicator text
        var nameDiv = task.row.cells[0].querySelector('.skystemtaskmaster-task-name');
        if (nameDiv) {
            var indicator = nameDiv.querySelector('.recurrence-indicator');
            if (indicator) {
                indicator.textContent = newRecurrenceType;
                indicator.style.background = isRecurring ? '#808080' : '#00cfff';
                indicator.title = "Recurrence: ".concat(newRecurrenceType, " (Click to change)");
            }
            else {
                // If indicator doesn't exist, create it
                // Note: addRecurrenceEditor is not defined, using the function that exists
                makeRecurrenceCellsClickable();
            }
        }
        console.log("Task ".concat(taskId, " recurrence updated from ").concat(oldType, " to ").concat(newRecurrenceType));
        showNotification("Recurrence set to: ".concat(newRecurrenceType));
        // Save changes
        setTimeout(function () { return saveAllData(); }, 100);
    }
}
function syncRecurrenceFromColumn() {
    tasks.forEach(function (task) {
        // Find the recurrence column cell
        var extraCells = task.row.querySelectorAll('.extra-cell');
        var recurrenceValue = 'None';
        extraCells.forEach(function (cell) {
            var _a;
            var colKey = cell.getAttribute('data-column');
            if (colKey === 'recurrenceType') {
                recurrenceValue = ((_a = cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || 'None';
            }
        });
        // Update task recurrence if different
        if (task.recurrenceType !== recurrenceValue) {
            task.recurrenceType = recurrenceValue;
            // Update indicator
            var nameDiv = task.row.cells[0].querySelector('.skystemtaskmaster-task-name');
            if (nameDiv) {
                var indicator = nameDiv.querySelector('.recurrence-indicator');
                if (indicator) {
                    indicator.textContent = recurrenceValue;
                    indicator.style.background = recurrenceValue !== 'None' ? '#808080' : '#00cfff';
                    indicator.title = "Recurrence: ".concat(recurrenceValue, " (Click to change)");
                }
            }
            // Update row class
            task.row.classList.remove('recurring-task', 'non-recurring-task');
            if (recurrenceValue !== 'None') {
                task.row.classList.add('recurring-task');
            }
            else {
                task.row.classList.add('non-recurring-task');
            }
            task.row.setAttribute('data-recurrence-type', recurrenceValue);
        }
    });
}
// Add modal for changing recurrence type
function showRecurrenceModal(task) {
    var _a, _b;
    var modal = document.getElementById('recurrenceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recurrenceModal';
        modal.className = 'modal';
        modal.innerHTML = "\n            <div class=\"modal-content\" style=\"width: 400px;\">\n                <span class=\"close\">&times;</span>\n                <h3 style=\"color: #ff0080; margin-bottom: 15px;\">Set Recurrence</h3>\n                \n                <div style=\"margin: 20px 0;\">\n                    <div style=\"margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 6px;\">\n                        <div style=\"font-size: 13px; color: #666; margin-bottom: 5px;\">Task:</div>\n                        <div style=\"font-weight: 500;\">".concat(task.name || ((_b = (_a = task.taskNameCell) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) || 'Task', "</div>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 8px; font-weight: 500;\">Current Recurrence</label>\n                        <div id=\"currentRecurrenceDisplay\" style=\"padding: 8px; background: #f0f0f0; border-radius: 4px; margin-bottom: 15px;\">\n                            ").concat(task.recurrenceType || 'None', "\n                        </div>\n                    </div>\n                    \n                    <div style=\"margin-bottom: 15px;\">\n                        <label style=\"display: block; margin-bottom: 8px; font-weight: 500;\">New Recurrence Type</label>\n                        <select id=\"recurrenceTypeSelect\" style=\"width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;\">\n                            <option value=\"None\">None (Non-recurring)</option>\n                            <option value=\"Daily\">Daily</option>\n                            <option value=\"Weekly\">Weekly</option>\n                            <option value=\"Monthly\">Monthly</option>\n                            <option value=\"Quarterly\">Quarterly</option>\n                            <option value=\"Yearly\">Yearly</option>\n                        </select>\n                    </div>\n                    \n                    <div style=\"color: #666; font-size: 13px; padding: 10px; background: #f9f9f9; border-radius: 4px; border-left: 3px solid #ff0080;\">\n                        <strong>Note:</strong> Recurring tasks show a gray left border, non-recurring show blue.\n                        The recurrence type will also appear next to the task name.\n                    </div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;\">\n                    <button id=\"cancelRecurrenceBtn\" style=\"padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;\">Cancel</button>\n                    <button id=\"saveRecurrenceBtn\" style=\"padding: 10px 20px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;\">Save</button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(modal);
        modal.querySelector('.close').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        document.getElementById('cancelRecurrenceBtn').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        document.getElementById('saveRecurrenceBtn').addEventListener('click', function () {
            var newType = document.getElementById('recurrenceTypeSelect').value;
            var taskId = modal.getAttribute('data-current-task-id');
            if (taskId)
                updateTaskRecurrence(taskId, newType);
            modal.style.display = 'none';
        });
    }
    // Set current value
    var select = document.getElementById('recurrenceTypeSelect');
    select.value = task.recurrenceType || 'None';
    // Update current recurrence display
    var currentDisplay = document.getElementById('currentRecurrenceDisplay');
    if (currentDisplay) {
        currentDisplay.textContent = task.recurrenceType || 'None';
        currentDisplay.style.color = task.recurrenceType && task.recurrenceType !== 'None' ? '#ff0080' : '#666';
    }
    // Store task ID
    modal.setAttribute('data-current-task-id', task.id || task.row.dataset.taskId || '');
    modal.style.display = 'block';
}
// ================================
// CREATE SAMPLE DATA
// ================================
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
function addSortStyles() {
    var style = document.createElement('style');
    style.textContent = "\n        #mainHeader th {\n            cursor: pointer;\n            user-select: none;\n            transition: background-color 0.2s;\n            position: relative;\n        }\n        \n        #mainHeader th:hover {\n            background-color: #fff0f5;\n        }\n        \n        .sort-icon {\n            display: inline-block;\n            margin-left: 5px;\n            font-size: 12px;\n            transition: all 0.2s;\n        }\n        \n        /* Ensure sub-list rows are full width */\n        .main-list-row td,\n        .sub-list-row td {\n            padding: 0 !important;\n            background: inherit;\n        }\n        \n        .list-header,\n        .sublist-header {\n            width: 100%;\n            box-sizing: border-box;\n        }\n    ";
    document.head.appendChild(style);
}
// ================================
// RECURRENCE TYPE EDITOR
// ================================
// Make recurrence type cells clickable
function makeRecurrenceEditable() {
    console.log('Making recurrence cells editable...');
    // Find all recurrence type cells (extra cells with data-column="recurrenceType")
    document.querySelectorAll('.extra-cell[data-column="recurrenceType"]').forEach(function (cellElement) {
        var cell = cellElement;
        // Make it look clickable
        cell.style.cursor = 'pointer';
        cell.style.transition = 'all 0.2s';
        cell.title = 'Click to change recurrence type';
        // Add hover effect
        cell.addEventListener('mouseenter', function () {
            cell.style.backgroundColor = '#fff0f5';
            cell.style.transform = 'scale(1.02)';
            cell.style.fontWeight = 'bold';
        });
        cell.addEventListener('mouseleave', function () {
            cell.style.backgroundColor = '';
            cell.style.transform = 'scale(1)';
            cell.style.fontWeight = '';
        });
        // Remove existing listeners to avoid duplicates
        var newCell = cell.cloneNode(true);
        if (cell.parentNode) {
            cell.parentNode.replaceChild(newCell, cell);
        }
        // Add click handler
        newCell.addEventListener('click', function (e) {
            var _a;
            e.stopPropagation();
            e.preventDefault();
            // Find the parent row and task
            var row = newCell.closest('tr');
            if (!row)
                return;
            var task = tasks.find(function (t) { return t.row === row; });
            if (!task)
                return;
            // Get current recurrence value
            var currentValue = ((_a = newCell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            showRecurrenceTypeModal(task, newCell, currentValue);
        });
    });
}
// Show recurrence type selection modal
function showRecurrenceTypeModal(task, cell, currentValue) {
    var _a, _b;
    // Remove any existing modal
    var existingModal = document.getElementById('recurrenceTypeModal');
    if (existingModal) {
        existingModal.remove();
    }
    // Create modal
    var modal = document.createElement('div');
    modal.id = 'recurrenceTypeModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.zIndex = '10000';
    modal.innerHTML = "\n        <div class=\"modal-content\" style=\"width: 450px; max-width: 90%; margin: 10% auto; padding: 25px; position: relative; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);\">\n            <span class=\"close\" style=\"position: absolute; right: 15px; top: 10px; font-size: 24px; cursor: pointer; color: #999;\">&times;</span>\n            <h3 style=\"color: #ff0080; margin-bottom: 20px; margin-top: 0;\">Set Recurrence Type</h3>\n            \n            <div style=\"margin: 20px 0;\">\n                <div style=\"margin-bottom: 20px; padding: 12px; background: #f9f9f9; border-radius: 6px; border-left: 3px solid #ff0080;\">\n                    <div style=\"font-size: 13px; color: #666; margin-bottom: 5px;\">Task:</div>\n                    <div style=\"font-weight: 500; font-size: 15px;\">".concat(task.name || ((_b = (_a = task.taskNameCell) === null || _a === void 0 ? void 0 : _a.querySelector('span')) === null || _b === void 0 ? void 0 : _b.textContent) || 'Task', "</div>\n                </div>\n                \n                <div style=\"margin-bottom: 20px;\">\n                    <label style=\"display: block; margin-bottom: 8px; font-weight: 500; color: #333;\">Current Recurrence</label>\n                    <div id=\"currentRecurrenceDisplay\" style=\"padding: 10px; background: #f0f0f0; border-radius: 4px; font-weight: 500; color: ").concat(currentValue !== 'None' ? '#ff0080' : '#666', ";\">\n                        ").concat(currentValue || 'None', "\n                    </div>\n                </div>\n                \n                <div style=\"margin-bottom: 20px;\">\n                    <label style=\"display: block; margin-bottom: 8px; font-weight: 500; color: #333;\">Select Recurrence Type</label>\n                    <select id=\"recurrenceTypeSelect\" style=\"width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; background: white; cursor: pointer;\">\n                        <optgroup label=\"Recurring Tasks\" style=\"font-weight: bold; color: #ff0080;\">\n                            <option value=\"Every Period\" ").concat(currentValue === 'Every Period' ? 'selected' : '', ">Every Period</option>\n                            <option value=\"Quarterly\" ").concat(currentValue === 'Quarterly' ? 'selected' : '', ">Quarterly</option>\n                            <option value=\"Annual\" ").concat(currentValue === 'Annual' ? 'selected' : '', ">Annual</option>\n                        </optgroup>\n                        <optgroup label=\"Non-Recurring Tasks\" style=\"font-weight: bold; color: #00cfff;\">\n                            <option value=\"Multiple\" ").concat(currentValue === 'Multiple' ? 'selected' : '', ">Multiple</option>\n                            <option value=\"Custom\" ").concat(currentValue === 'Custom' ? 'selected' : '', ">Custom</option>\n                            <option value=\"None\" ").concat(currentValue === 'None' ? 'selected' : '', ">None</option>\n                        </optgroup>\n                    </select>\n                </div>\n                \n                <div style=\"color: #666; font-size: 13px; padding: 12px; background: #f9f9f9; border-radius: 4px; border-left: 3px solid #ff0080; line-height: 1.5;\">\n                    <strong>Note:</strong> Recurrence type determines the task's border color:<br>\n                    <span style=\"display: inline-block; width: 12px; height: 12px; background: #808080; margin: 5px 5px 0 0; border-radius: 2px;\"></span> Gray = Recurring (Every Period, Quarterly, Annual)<br>\n                    <span style=\"display: inline-block; width: 12px; height: 12px; background: #00cfff; margin: 5px 5px 0 0; border-radius: 2px;\"></span> Blue = Non-recurring (None, Multiple, Custom)\n                </div>\n            </div>\n            \n            <div style=\"display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px;\">\n                <button id=\"cancelRecurrenceTypeBtn\" style=\"padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;\">Cancel</button>\n                <button id=\"saveRecurrenceTypeBtn\" style=\"padding: 10px 20px; background: #ff0080; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;\">Save</button>\n            </div>\n        </div>\n    ");
    document.body.appendChild(modal);
    // Store references
    window.currentRecurrenceTask = task;
    window.currentRecurrenceCell = cell;
    // Close button handler
    modal.querySelector('.close').addEventListener('click', function () {
        modal.remove();
    });
    // Cancel button handler
    document.getElementById('cancelRecurrenceTypeBtn').addEventListener('click', function () {
        modal.remove();
    });
    // Save button handler
    document.getElementById('saveRecurrenceTypeBtn').addEventListener('click', function () {
        var select = document.getElementById('recurrenceTypeSelect');
        var newValue = select.value;
        console.log('Saving new recurrence value:', newValue);
        // Update the cell
        if (window.currentRecurrenceCell) {
            window.currentRecurrenceCell.textContent = newValue;
            // Update task object
            if (window.currentRecurrenceTask) {
                var currentTask = window.currentRecurrenceTask;
                currentTask.recurrenceType = newValue;
                // Update row classes based on recurrence type
                var row = currentTask.row;
                if (row) {
                    row.classList.remove('recurring-task', 'non-recurring-task');
                    // Check if it's a recurring task (Every Period, Quarterly, Annual)
                    var recurringOptions = ['Every Period', 'Quarterly', 'Annual'];
                    if (recurringOptions.indexOf(newValue) >= 0) {
                        row.classList.add('recurring-task');
                    }
                    else {
                        row.classList.add('non-recurring-task');
                    }
                    row.setAttribute('data-recurrence-type', newValue);
                }
            }
            // Save to localStorage
            setTimeout(function () { return saveAllData(); }, 100);
            showNotification("Recurrence type set to: ".concat(newValue));
        }
        modal.remove();
    });
    // Click outside to close
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    // Focus the select for better UX
    setTimeout(function () {
        var select = document.getElementById('recurrenceTypeSelect');
        if (select)
            select.focus();
    }, 100);
}
// Initialize recurrence editor with retry mechanism
function initializeRecurrenceEditor() {
    console.log('Initializing Recurrence Type Editor...');
    // Add styles
    addRecurrenceEditorStyles();
    // Try to make cells clickable immediately
    makeRecurrenceCellsClickable();
    // Also try after short delays to catch dynamically added cells
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
    // Observe for new rows being added
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
function makeRecurrenceCellsClickable() {
    console.log('Making recurrence cells clickable...');
    // Find all recurrence type cells
    var recurrenceCells = document.querySelectorAll('.extra-cell[data-column="recurrenceType"]');
    console.log('Found recurrence cells:', recurrenceCells.length);
    recurrenceCells.forEach(function (cellElement, index) {
        var cell = cellElement;
        // Skip if already initialized
        if (cell.classList.contains('recurrence-initialized')) {
            return;
        }
        // Mark as initialized
        cell.classList.add('recurrence-initialized');
        // Make it look clickable
        cell.style.cursor = 'pointer';
        cell.style.transition = 'all 0.2s ease';
        cell.style.userSelect = 'none';
        cell.setAttribute('title', 'Click to change recurrence type');
        // Remove any existing click listeners by cloning
        var newCell = cell.cloneNode(true);
        if (cell.parentNode) {
            cell.parentNode.replaceChild(newCell, cell);
        }
        // Add hover effects
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
        // Add click handler
        newCell.addEventListener('click', function (e) {
            var _a;
            e.stopPropagation();
            e.preventDefault();
            console.log('Recurrence cell clicked!');
            // Find the parent row
            var row = this.closest('tr');
            if (!row) {
                console.error('No parent row found');
                return;
            }
            // Find the task
            var task = tasks.find(function (t) { return t.row === row; });
            if (!task) {
                console.error('No task found for row');
                return;
            }
            // Get current value
            var currentValue = ((_a = this.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || 'None';
            console.log('Current value:', currentValue);
            // Show the modal
            showRecurrenceTypeModal(task, this, currentValue);
        });
        console.log("Cell ".concat(index, " initialized with click handler"));
    });
}
// Add styles for recurrence editor
function addRecurrenceEditorStyles() {
    // Check if styles already exist
    if (document.getElementById('recurrence-editor-styles'))
        return;
    var style = document.createElement('style');
    style.id = 'recurrence-editor-styles';
    style.textContent = "\n        .extra-cell[data-column=\"recurrenceType\"] {\n            cursor: pointer !important;\n            transition: all 0.2s ease !important;\n            font-weight: 500;\n            position: relative;\n            user-select: none;\n        }\n        \n        .extra-cell[data-column=\"recurrenceType\"]:hover {\n            background-color: #fff0f5 !important;\n            transform: scale(1.02);\n            font-weight: bold;\n            box-shadow: 0 2px 4px rgba(255,0,128,0.2) !important;\n        }\n        \n        .extra-cell[data-column=\"recurrenceType\"]:active {\n            transform: scale(0.98);\n        }\n        \n        .extra-cell[data-column=\"recurrenceType\"]:empty:before,\n        .extra-cell[data-column=\"recurrenceType\"]:contains(\"None\") {\n            color: #666;\n        }\n        \n        .extra-cell[data-column=\"recurrenceType\"]:not(:contains(\"None\")) {\n            color: #ff0080;\n        }\n        \n        #recurrenceTypeModal .modal-content {\n            animation: slideIn 0.3s ease;\n        }\n        \n        #recurrenceTypeSelect {\n            cursor: pointer;\n            transition: all 0.2s;\n        }\n        \n        #recurrenceTypeSelect:hover {\n            border-color: #ff0080 !important;\n        }\n        \n        #recurrenceTypeSelect:focus {\n            outline: none;\n            border-color: #ff0080 !important;\n            box-shadow: 0 0 0 3px rgba(255, 0, 128, 0.1);\n        }\n        \n        @keyframes slideIn {\n            from {\n                transform: translateY(-30px);\n                opacity: 0;\n            }\n            to {\n                transform: translateY(0);\n                opacity: 1;\n            }\n        }\n    ";
    document.head.appendChild(style);
}
// ================================
// FILE IMPORT FUNCTIONS
// ================================
var importedTasksData = []; // Store parsed tasks from file
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
    // Browse button click
    browseBtn.addEventListener('click', function () {
        fileInput.click();
    });
    // File input change
    fileInput.addEventListener('change', function (e) {
        var files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    });
    // Drag and drop events
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropArea.style.borderColor = '#00cfff';
        dropArea.style.backgroundColor = '#e6f7ff';
    });
    dropArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        dropArea.style.borderColor = '#ff0080';
        dropArea.style.backgroundColor = '#fff0f5';
    });
    dropArea.addEventListener('drop', function (e) {
        var _a;
        e.preventDefault();
        dropArea.style.borderColor = '#ff0080';
        dropArea.style.backgroundColor = '#fff0f5';
        var files = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    });
    // Cancel button
    cancelBtn.addEventListener('click', function () {
        resetImportModal();
        document.getElementById('importTasksModal').style.display = 'none';
    });
    // Process import button
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
        else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            showNotification('Excel support coming soon! Please use CSV for now.');
            // For now, show sample format
            showSampleFormat();
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
            // Map headers to expected fields
            var taskNameIndex = headers.findIndex(function (h) { return h.indexOf('task') >= 0 || h.indexOf('name') >= 0; });
            var ownerIndex = headers.findIndex(function (h) { return h.indexOf('owner') >= 0; });
            var reviewerIndex = headers.findIndex(function (h) { return h.indexOf('reviewer') >= 0; });
            var dueDateIndex = headers.findIndex(function (h) { return h.indexOf('due') >= 0 || h.indexOf('date') >= 0; });
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
    function showSampleFormat() {
        importedTasksData = [
            { name: 'Sample Task 1', owner: 'PK', reviewer: 'SM', dueDate: '2025-12-31', acc: '+', tdoc: '0', status: 'Not Started' },
            { name: 'Sample Task 2', owner: 'SM', reviewer: 'PK', dueDate: '2025-12-15', acc: '+', tdoc: '0', status: 'Not Started' }
        ];
        showPreview(importedTasksData);
    }
    function showPreview(tasks) {
        var _a;
        if (!previewBody || !previewArea)
            return;
        previewArea.style.display = 'block';
        processBtn.disabled = false;
        var previewHtml = tasks.slice(0, 5).map(function (task) { return "\n            <tr>\n                <td style=\"padding: 8px; border-bottom: 1px solid #eee;\">".concat(task.name, "</td>\n                <td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(task.owner, "</td>\n                <td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(task.reviewer, "</td>\n                <td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(task.dueDate || 'Not set', "</td>\n            </tr>\n        "); }).join('');
        if (tasks.length > 5) {
            previewBody.innerHTML = previewHtml + "\n                <tr>\n                    <td colspan=\"4\" style=\"padding: 8px; text-align: center; color: #666; font-style: italic;\">\n                        ... and ".concat(tasks.length - 5, " more tasks\n                    </td>\n                </tr>\n            ");
        }
        else {
            previewBody.innerHTML = previewHtml;
        }
        (_a = document.getElementById('importPreviewCount')) === null || _a === void 0 ? void 0 : _a.remove();
        var countDisplay = document.createElement('div');
        countDisplay.id = 'importPreviewCount';
        countDisplay.style.cssText = 'margin-top: 10px; font-size: 13px; color: #ff0080; font-weight: 500;';
        countDisplay.textContent = "Total ".concat(tasks.length, " task(s) ready to import");
        previewArea.appendChild(countDisplay);
    }
    function importTasks() {
        if (importedTasksData.length === 0) {
            alert('No tasks to import');
            return;
        }
        var importTarget = document.querySelector('input[name="importTarget"]:checked').value;
        var skipDuplicates = document.getElementById('skipDuplicates').checked;
        var targetList = null;
        if (importTarget === 'newList') {
            // Create new list
            var listName = prompt('Enter name for new list:', 'Imported Tasks ' + new Date().toLocaleDateString());
            if (!listName)
                return;
            targetList = createMainList(listName);
            // Create a sublist
            setTimeout(function () {
                var subList = createSubList(targetList, 'Imported Tasks');
                // Import tasks to this sublist
                importTasksToSublist(subList, importedTasksData, skipDuplicates);
            }, 100);
        }
        else {
            // Add to current list (last created sublist)
            if (subLists.length === 0) {
                alert('Please create a list first');
                return;
            }
            var targetSublist = subLists[subLists.length - 1];
            importTasksToSublist(targetSublist, importedTasksData, skipDuplicates);
        }
        resetImportModal();
        document.getElementById('importTasksModal').style.display = 'none';
        showNotification("Successfully imported ".concat(importedTasksData.length, " tasks!"));
    }
    function importTasksToSublist(sublist, tasks, skipDuplicates) {
        var existingTaskNames = sublist.tasks.map(function (t) { var _a; return ((_a = t.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ''; });
        tasks.forEach(function (taskData) {
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
    function resetImportModal() {
        importedTasksData = [];
        if (previewArea)
            previewArea.style.display = 'none';
        if (previewBody)
            previewBody.innerHTML = '';
        if (processBtn)
            processBtn.disabled = true;
        if (fileInput)
            fileInput.value = '';
    }
}
// ================================
// MAIN INITIALIZATION
// ================================
document.addEventListener('DOMContentLoaded', function () {
    // Add styles
    addStyles();
    addSortStyles();
    // Load saved column visibility
    loadColumnVisibility();
    // Create modals
    createModals();
    // Initialize data
    initializeData();
    // Clear old structure and initialize new clean structure
    initializeCleanStructure();
    // Initialize event listeners
    initializeEventListeners();
    // Initialize all features
    setTimeout(function () {
        addExtraColumns();
        addDataCells();
        applyVisibility();
        updateSublistRowsColspan();
        updateCounts();
        calculateDays();
        initializeDeleteButton();
        makeExistingTasksEditable();
        // Initialize column sorting
        initializeColumnSorting();
        // Custom Grid button
        var btn = document.getElementById('customGridBtn');
        if (btn)
            btn.addEventListener('click', showCustomizeGridModal);
        initializeDownloadButton();
        initializeFilterButton();
        initializeTaskDropdown();
        initializeSortButton();
        // IMPORTANT: Document styles pehle add karo
        addDocumentStyles(); // Pehle styles add karo
        // Phir document managers initialize karo - SIRF EK BAAR
        initializeTDocManager(); // TDoc ke liye
        initializeDocumentManager(); // CDoc ke liye
        // Force refresh
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
        // Make sure linked accounts column is visible
        var linkedAccountsCol = columnConfig.find(function (c) { return c.key === 'linkedAccounts'; });
        if (linkedAccountsCol)
            linkedAccountsCol.visible = true;
        // Refresh linked accounts after everything is loaded
        setTimeout(function () {
            refreshLinkedAccountsColumn();
        }, 100);
        // TRY TO LOAD SAVED DATA FIRST
        var hasSavedData = loadAllData();
        // If no saved data exists, create sample data
        if (!hasSavedData) {
            createSampleData();
        }
        // Force update document columns AFTER data is loaded
        setTimeout(function () {
            console.log('Force updating document columns...');
            updateTDocColumn();
            updateCDocColumn();
            // Refresh linked accounts again after data is loaded
            refreshLinkedAccountsColumn();
        }, 200);
        // Setup auto-save after everything is initialized
        setupAutoSave();
        // Save initial state
        setTimeout(function () { return saveAllData(); }, 500);
        console.log('Task Viewer fully initialized with persistence');
    }, 500);
});
