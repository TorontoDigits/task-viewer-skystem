var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// ========== GLOBAL VARIABLES ==========
var tasks = [];
var currentFilter = 'all';
var currentMainTab = 'general'; // general or account
var currentSecondaryTab = 'monthClose'; // monthClose, accrued, income
var currentCommentTaskId = null;
var currentDocTaskId = null;
var uploadedFiles = [];
var activeFilters = [];
var showHiddenTasks = false;
// Make sure Actions column is included in gridColumns
var gridColumns = [
    'id', 'name', 'status', 'category', 'desc', 'docs', 'assignee',
    'assignDate', 'reviewDate', 'dueDate', 'owner', 'reviewer',
    'approver', 'comments', 'done', 'actions'
];
// All available columns for customization
var allColumns = [
    { id: 'id', name: 'ID' },
    { id: 'name', name: 'Task Name' },
    { id: 'description', name: 'Description' },
    { id: 'status', name: 'Task Status' },
    { id: 'docs', name: 'Task Docs' },
    { id: 'category', name: 'Task List Name' },
    { id: 'assignee', name: 'Assignee' },
    { id: 'dueDate', name: 'Due Date' },
    { id: 'reviewerDueDate', name: 'Reviewer Due Date' },
    { id: 'recurrenceType', name: 'Recurrence Type' },
    { id: 'owner', name: 'Task Owner' },
    { id: 'reviewer', name: 'Reviewer' },
    { id: 'approver', name: 'Approver' },
    { id: 'comments', name: 'Comment' },
    { id: 'completionDocs', name: 'Completion Docs' },
    { id: 'createdBy', name: 'Created By' },
    { id: 'jeNumber', name: 'JE Number' },
    { id: 'priority', name: 'Priority' },
    { id: 'actions', name: 'Actions' }
];
// Column display names mapping
var columnNames = {
    'id': 'ID',
    'name': 'Task Name',
    'status': 'Status',
    'category': 'Category',
    'desc': 'Desc',
    'docs': 'Docs',
    'assignee': 'Assignee',
    'assignDate': 'Assign Date',
    'reviewDate': 'Review Date',
    'dueDate': 'Due Date',
    'owner': 'Owner',
    'reviewer': 'Reviewer',
    'approver': 'Approver',
    'comments': 'Comments',
    'done': 'Done',
    'actions': 'Actions',
    'description': 'Description',
    'reviewerDueDate': 'Reviewer Due Date',
    'recurrenceType': 'Recurrence Type',
    'completionDocs': 'Completion Docs',
    'createdBy': 'Created By',
    'jeNumber': 'JE Number',
    'priority': 'Priority'
};
// Filter value options based on field
var filterOptions = {
    'status': [
        'pending',
        'in-progress',
        'in-review',
        'completed',
        'overdue',
        'rejected'
    ],
    'category': [
        'monthClose',
        'accrued',
        'income',
        'payroll',
        'tax'
    ],
    'priority': [
        'low',
        'medium',
        'high',
        'critical'
    ],
    'recurrenceType': [
        'none',
        'daily',
        'weekly',
        'monthly',
        'quarterly'
    ],
    'owner': [
        'SkyStem Admin',
        'Finance',
        'Accounting',
        'HR',
        'Tax',
        'Management'
    ],
    'reviewer': [
        'Sarah Johnson',
        'Tom Harris',
        'Lisa Chen',
        'Michael Scott',
        'David Clark'
    ],
    'approver': [
        'Mike Wilson',
        'Lisa Chen',
        'Emma Watson',
        'Jan Levinson'
    ],
    'assignee': [
        'John Smith',
        'Emma Davis',
        'Michael Brown',
        'Robert Chen',
        'David Kim',
        'Jennifer Lee',
        'James Wilson',
        'Patricia Brown',
        'Susan Miller',
        'Robert Johnson'
    ]
};
// Pagination variables
var currentPage = 1;
var pageSize = 10;
// ========== DOM ELEMENTS ==========
var filterField = document.getElementById('sky-filterField');
var filterValueSelect = document.getElementById('sky-filterValue');
var filterValueInput = document.getElementById('sky-filterValueInput');
var filterModal = document.getElementById('sky-filterModal');
var filterBtn = document.getElementById('sky-filterBtn');
var closeFilterModal = document.getElementById('sky-closeFilterModal');
var addFilterBtn = document.getElementById('sky-addFilterBtn');
var clearAllFilters = document.getElementById('sky-clearAllFilters');
var applyFilters = document.getElementById('sky-applyFilters');
var clearFilterBtn = document.getElementById('sky-clearFilterBtn');
var categoryFilter = document.getElementById('sky-categoryFilter');
var showHiddenTasksBtn = document.getElementById('sky-showHiddenTasks');
var showCompletedTasks = document.getElementById('sky-showCompletedTasks');
var pageSizeSelect = document.getElementById('sky-pageSize');
var prevPageBtn = document.getElementById('sky-prevPage');
var nextPageBtn = document.getElementById('sky-nextPage');
var pageInfo = document.getElementById('sky-pageInfo');
var seeMoreBtn = document.getElementById('sky-seeMoreBtn');
var seeMoreDropdown = document.getElementById('sky-seeMoreDropdown');
var rejectAction = document.getElementById('sky-rejectAction');
var reviewAction = document.getElementById('sky-reviewAction');
var deleteAction = document.getElementById('sky-deleteAction');
var bulkEditAction = document.getElementById('sky-bulkEditAction');
var customizeGridAction = document.getElementById('sky-customizeGridAction');
var exportBtn = document.getElementById('sky-exportBtn');
var exportModal = document.getElementById('sky-exportModal');
var closeExport = document.getElementById('sky-closeExport');
var addTaskBtn = document.getElementById('sky-addTaskBtn');
var modal = document.getElementById('sky-taskModal');
var closeModal = document.getElementById('sky-closeModal');
var taskForm = document.getElementById('sky-taskForm');
var modalTitle = document.getElementById('sky-modalTitle');
var taskIdInput = document.getElementById('sky-taskId');
var taskIdDisplay = document.getElementById('sky-taskIdDisplay');
var taskName = document.getElementById('sky-taskName');
var taskCategory = document.getElementById('sky-taskCategory');
var taskStatus = document.getElementById('sky-taskStatus');
var taskDesc = document.getElementById('sky-taskDesc');
var taskAssignee = document.getElementById('sky-taskAssignee');
var taskAssignDate = document.getElementById('sky-taskAssignDate');
var taskReviewDate = document.getElementById('sky-taskReviewDate');
var taskDueDate = document.getElementById('sky-taskDueDate');
var taskOwner = document.getElementById('sky-taskOwner');
var taskReviewer = document.getElementById('sky-taskReviewer');
var taskApprover = document.getElementById('sky-taskApprover');
var taskPriority = document.getElementById('sky-taskPriority');
var taskRecurrence = document.getElementById('sky-taskRecurrence');
var modalCommentList = document.getElementById('sky-modalCommentList');
var modalCommentInput = document.getElementById('sky-modalCommentInput');
var addModalCommentBtn = document.getElementById('sky-addModalCommentBtn');
var dropZone = document.getElementById('sky-dropZone');
var fileInput = document.getElementById('sky-fileInput');
var fileList = document.getElementById('sky-fileList');
var commentPopup = document.getElementById('sky-commentPopup');
var closeCommentPopup = document.getElementById('sky-closeCommentPopup');
var commentTaskName = document.getElementById('sky-commentTaskName');
var commentList = document.getElementById('sky-commentList');
var commentInput = document.getElementById('sky-commentInput');
var addCommentBtn = document.getElementById('sky-addCommentBtn');
var docPopup = document.getElementById('sky-docPopup');
var closeDocPopup = document.getElementById('sky-closeDocPopup');
var docTaskName = document.getElementById('sky-docTaskName');
var docList = document.getElementById('sky-docList');
var headerRow = document.getElementById('sky-headerRow');
var tasksTableBody = document.getElementById('sky-tasksTableBody');
var customizeGridModal = document.getElementById('sky-customizeGridModal');
var closeCustomizeGrid = document.getElementById('sky-closeCustomizeGrid');
var gridFields = document.getElementById('sky-gridFields');
var saveGridBtn = document.getElementById('sky-saveGridBtn');
var resetGridBtn = document.getElementById('sky-resetGridBtn');
var bulkEditModal = document.getElementById('sky-bulkEditModal');
var closeBulkEdit = document.getElementById('sky-closeBulkEdit');
var bulkEditSelectedTasks = document.getElementById('sky-bulkEditSelectedTasks');
var bulkEditField = document.getElementById('sky-bulkEditField');
var bulkEditValue = document.getElementById('sky-bulkEditValue');
var applyBulkEdit = document.getElementById('sky-applyBulkEdit');
var selectAllBulk = document.getElementById('sky-selectAllBulk');
var bulkEditTableBody = document.getElementById('sky-bulkEditTableBody');
var rejectModal = document.getElementById('sky-rejectModal');
var closeRejectModal = document.getElementById('sky-closeRejectModal');
var rejectTaskSelect = document.getElementById('sky-rejectTaskSelect');
var rejectReason = document.getElementById('sky-rejectReason');
var cancelReject = document.getElementById('sky-cancelReject');
var confirmReject = document.getElementById('sky-confirmReject');
var reviewModal = document.getElementById('sky-reviewModal');
var closeReviewModal = document.getElementById('sky-closeReviewModal');
var reviewTaskSelect = document.getElementById('sky-reviewTaskSelect');
var reviewComments = document.getElementById('sky-reviewComments');
var reviewStatus = document.getElementById('sky-reviewStatus');
var cancelReview = document.getElementById('sky-cancelReview');
var confirmReview = document.getElementById('sky-confirmReview');
// Legend elements
var pendingCount = document.getElementById('sky-pendingCount');
var completedCount = document.getElementById('sky-completedCount');
var overdueCount = document.getElementById('sky-overdueCount');
var deletedCount = document.getElementById('sky-deletedCount');
var rejectedCount = document.getElementById('sky-rejectedCount');
var pendingColor = document.getElementById('sky-pendingColor');
var completedColor = document.getElementById('sky-completedColor');
var overdueColor = document.getElementById('sky-overdueColor');
var deletedColor = document.getElementById('sky-deletedColor');
var rejectedColor = document.getElementById('sky-rejectedColor');
// ========== FUNCTIONS ==========
// Load tasks from localStorage
function loadTasks() {
    var savedTasks = localStorage.getItem('sky-tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    else {
        // Default tasks with different categories
        tasks = [
            // Month & Close tasks
            {
                id: 1,
                taskId: 'MNC-001',
                name: 'Credit Card Commission',
                category: 'monthClose',
                status: 'pending',
                desc: 'Calculate July commissions',
                assignee: 'John Smith',
                assignDate: '2025-07-25',
                reviewDate: '2025-07-28',
                dueDate: '2025-07-30',
                owner: 'Finance',
                reviewer: 'Sarah Johnson',
                approver: 'Mike Wilson',
                priority: 'high',
                recurrenceType: 'monthly',
                jeNumber: 'JE-2025-001',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [
                    { id: 101, text: 'Need client statements', time: '2025-07-26 10:30' }
                ],
                documents: [
                    { name: 'commission_calc.xlsx', size: '245 KB' }
                ],
                completed: false,
                deleted: false,
                rejected: false
            },
            {
                id: 2,
                taskId: 'MNC-002',
                name: 'Management Fee Accrual',
                category: 'monthClose',
                status: 'overdue',
                desc: 'Accrue management fees',
                assignee: 'Emma Davis',
                assignDate: '2025-07-24',
                reviewDate: '2025-07-27',
                dueDate: '2025-07-29',
                owner: 'Management',
                reviewer: 'Tom Harris',
                approver: 'Lisa Chen',
                priority: 'medium',
                recurrenceType: 'quarterly',
                jeNumber: 'JE-2025-002',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [
                    { id: 102, text: 'Gathering data', time: '2025-07-25 14:20' }
                ],
                documents: [
                    { name: 'fee_schedule.pdf', size: '856 KB' }
                ],
                completed: false,
                deleted: false,
                rejected: false
            },
            // Accrued tasks
            {
                id: 3,
                taskId: 'ACC-001',
                name: 'Income Journals',
                category: 'accrued',
                status: 'completed',
                desc: 'Post income journals',
                assignee: 'Michael Brown',
                assignDate: '2025-07-20',
                reviewDate: '2025-07-22',
                dueDate: '2025-07-25',
                owner: 'Accounting',
                reviewer: 'Sarah Johnson',
                approver: 'Mike Wilson',
                priority: 'low',
                recurrenceType: 'daily',
                jeNumber: 'JE-2025-003',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [],
                documents: [],
                completed: true,
                deleted: false,
                rejected: false
            },
            {
                id: 4,
                taskId: 'ACC-002',
                name: 'Accrued Expenses',
                category: 'accrued',
                status: 'pending',
                desc: 'Calculate accrued expenses',
                assignee: 'Robert Chen',
                assignDate: '2025-07-26',
                reviewDate: '2025-07-29',
                dueDate: '2025-07-31',
                owner: 'Accounting',
                reviewer: 'Lisa Wong',
                approver: 'Mike Wilson',
                priority: 'high',
                recurrenceType: 'monthly',
                jeNumber: 'JE-2025-004',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [],
                documents: [],
                completed: false,
                deleted: false,
                rejected: false
            },
            {
                id: 5,
                taskId: 'ACC-003',
                name: 'Prepaid Amortization',
                category: 'accrued',
                status: 'rejected',
                desc: 'Amortize prepaid expenses',
                assignee: 'David Kim',
                assignDate: '2025-07-22',
                reviewDate: '2025-07-25',
                dueDate: '2025-07-28',
                owner: 'Accounting',
                reviewer: 'Sarah Johnson',
                approver: 'Mike Wilson',
                priority: 'medium',
                recurrenceType: 'monthly',
                jeNumber: 'JE-2025-005',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [
                    { id: 103, text: 'Rejected: Missing supporting docs', time: '2025-07-26 09:15' }
                ],
                documents: [],
                completed: false,
                deleted: false,
                rejected: true
            },
            // Income tasks
            {
                id: 6,
                taskId: 'INC-001',
                name: 'Interest Income',
                category: 'income',
                status: 'pending',
                desc: 'Record interest income',
                assignee: 'Jennifer Lee',
                assignDate: '2025-07-26',
                reviewDate: '2025-07-29',
                dueDate: '2025-07-31',
                owner: 'Finance',
                reviewer: 'Tom Harris',
                approver: 'Lisa Chen',
                priority: 'medium',
                recurrenceType: 'monthly',
                jeNumber: 'JE-2025-006',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [],
                documents: [],
                completed: false,
                deleted: false,
                rejected: false
            },
            {
                id: 7,
                taskId: 'INC-002',
                name: 'Dividend Income',
                category: 'income',
                status: 'in-review',
                desc: 'Record dividend income',
                assignee: 'James Wilson',
                assignDate: '2025-07-23',
                reviewDate: '2025-07-26',
                dueDate: '2025-07-30',
                owner: 'Finance',
                reviewer: 'Sarah Johnson',
                approver: 'Mike Wilson',
                priority: 'high',
                recurrenceType: 'quarterly',
                jeNumber: 'JE-2025-007',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [],
                documents: [],
                completed: false,
                deleted: false,
                rejected: false
            },
            {
                id: 8,
                taskId: 'INC-003',
                name: 'Rental Income',
                category: 'income',
                status: 'deleted',
                desc: 'Record rental income',
                assignee: 'Patricia Brown',
                assignDate: '2025-07-21',
                reviewDate: '2025-07-24',
                dueDate: '2025-07-28',
                owner: 'Finance',
                reviewer: 'Tom Harris',
                approver: 'Lisa Chen',
                priority: 'low',
                recurrenceType: 'monthly',
                jeNumber: 'JE-2025-008',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [],
                documents: [],
                completed: false,
                deleted: true,
                rejected: false
            },
            // Payroll tasks (for Account Tasks)
            {
                id: 9,
                taskId: 'PAY-001',
                name: 'Payroll Processing',
                category: 'payroll',
                status: 'pending',
                desc: 'Process monthly payroll',
                assignee: 'Susan Miller',
                assignDate: '2025-07-25',
                reviewDate: '2025-07-28',
                dueDate: '2025-07-30',
                owner: 'HR',
                reviewer: 'David Clark',
                approver: 'Emma Watson',
                priority: 'critical',
                recurrenceType: 'monthly',
                jeNumber: 'JE-2025-009',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [],
                documents: [],
                completed: false,
                deleted: false,
                rejected: false
            },
            // Tax tasks (for Account Tasks)
            {
                id: 10,
                taskId: 'TAX-001',
                name: 'Sales Tax Filing',
                category: 'tax',
                status: 'pending',
                desc: 'File monthly sales tax',
                assignee: 'Robert Johnson',
                assignDate: '2025-07-24',
                reviewDate: '2025-07-27',
                dueDate: '2025-07-29',
                owner: 'Tax',
                reviewer: 'Michael Scott',
                approver: 'Jan Levinson',
                priority: 'high',
                recurrenceType: 'monthly',
                jeNumber: 'JE-2025-010',
                createdBy: 'Admin',
                completionDocs: [],
                comments: [],
                documents: [],
                completed: false,
                deleted: false,
                rejected: false
            }
        ];
        saveTasks();
    }
}
// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('sky-tasks', JSON.stringify(tasks));
}
// Load grid columns from localStorage
function loadGridColumns() {
    var savedColumns = localStorage.getItem('sky-gridColumns');
    if (savedColumns) {
        gridColumns = JSON.parse(savedColumns);
    }
    renderTableHeader();
}
// Save grid columns to localStorage
function saveGridColumns() {
    localStorage.setItem('sky-gridColumns', JSON.stringify(gridColumns));
    renderTableHeader();
}
// Render table header based on gridColumns
function renderTableHeader() {
    if (!headerRow)
        return;
    headerRow.innerHTML = gridColumns.map(function (col) { return "<th>".concat(columnNames[col] || col, "</th>"); }).join('');
}
function generateTaskId() {
    var prefix = currentSecondaryTab === 'monthClose' ? 'MNC' :
        currentSecondaryTab === 'accrued' ? 'ACC' : 'INC';
    var num = String(Math.floor(Math.random() * 900) + 100);
    // Manually pad with zeros
    var paddedNum = num.length === 1 ? '00' + num : num.length === 2 ? '0' + num : num;
    return "".concat(prefix, "-").concat(paddedNum);
}
// Get current tab filtered tasks
function getCurrentTabTasks() {
    var tabTasks = __spreadArray([], tasks, true);
    // Apply main tab filter (General or Account)
    if (currentMainTab === 'general') {
        tabTasks = tabTasks.filter(function (t) { return t.category === 'monthClose' || t.category === 'accrued' || t.category === 'income'; });
    }
    else if (currentMainTab === 'account') {
        tabTasks = tabTasks.filter(function (t) { return t.category === 'payroll' || t.category === 'tax'; });
    }
    // Apply secondary tab filter
    if (currentSecondaryTab === 'monthClose') {
        tabTasks = tabTasks.filter(function (t) { return t.category === 'monthClose'; });
    }
    else if (currentSecondaryTab === 'accrued') {
        tabTasks = tabTasks.filter(function (t) { return t.category === 'accrued'; });
    }
    else if (currentSecondaryTab === 'income') {
        tabTasks = tabTasks.filter(function (t) { return t.category === 'income'; });
    }
    return tabTasks;
}
// Update legend counts and colors based on current tab
function updateLegendCounts() {
    var tabTasks = getCurrentTabTasks();
    // Calculate counts for each status based on current tab
    var pendingCountVal = tabTasks.filter(function (t) { return t.status === 'pending' && !t.deleted && !t.completed && !t.rejected; }).length;
    var completedCountVal = tabTasks.filter(function (t) { return (t.completed === true || t.status === 'completed') && !t.deleted; }).length;
    var overdueCountVal = tabTasks.filter(function (t) { return t.status === 'overdue' && !t.deleted && !t.completed; }).length;
    var deletedCountVal = tabTasks.filter(function (t) { return t.deleted === true; }).length;
    var rejectedCountVal = tabTasks.filter(function (t) { return (t.rejected === true || t.status === 'rejected') && !t.deleted; }).length;
    // Update count displays
    pendingCount.textContent = pendingCountVal.toString();
    completedCount.textContent = completedCountVal.toString();
    overdueCount.textContent = overdueCountVal.toString();
    deletedCount.textContent = deletedCountVal.toString();
    rejectedCount.textContent = rejectedCountVal.toString();
    // Update legend colors based on active filter
    var legendColors = {
        pending: pendingColor,
        completed: completedColor,
        overdue: overdueColor,
        deleted: deletedColor,
        rejected: rejectedColor
    };
    // Remove active class from all
    for (var key in legendColors) {
        legendColors[key].classList.remove('sky-active');
    }
    // Add active class to current filter if it exists
    if (currentFilter !== 'all' && legendColors[currentFilter]) {
        legendColors[currentFilter].classList.add('sky-active');
    }
}
// ========== FIXED: renderTasks function with proper completed tasks handling ==========
function renderTasks() {
    if (!tasksTableBody)
        return;
    var filteredTasks = __spreadArray([], tasks, true);
    // Apply main tab filter (General or Account)
    if (currentMainTab === 'general') {
        filteredTasks = filteredTasks.filter(function (t) { return t.category === 'monthClose' || t.category === 'accrued' || t.category === 'income'; });
    }
    else if (currentMainTab === 'account') {
        filteredTasks = filteredTasks.filter(function (t) { return t.category === 'payroll' || t.category === 'tax'; });
    }
    // Apply secondary tab filter
    if (currentSecondaryTab === 'monthClose') {
        filteredTasks = filteredTasks.filter(function (t) { return t.category === 'monthClose'; });
    }
    else if (currentSecondaryTab === 'accrued') {
        filteredTasks = filteredTasks.filter(function (t) { return t.category === 'accrued'; });
    }
    else if (currentSecondaryTab === 'income') {
        filteredTasks = filteredTasks.filter(function (t) { return t.category === 'income'; });
    }
    // Apply active filters (simple equals)
    activeFilters.forEach(function (filter) {
        filteredTasks = filteredTasks.filter(function (task) {
            // Get the field value from task
            var taskValue = task[filter.field];
            // If task value is undefined or null, return false
            if (taskValue === undefined || taskValue === null) {
                return false;
            }
            // Convert both to strings for comparison (case insensitive)
            var taskValueStr = String(taskValue).toLowerCase();
            var filterValueStr = String(filter.value).toLowerCase();
            // Simple equals comparison
            return taskValueStr === filterValueStr;
        });
    });
    // Apply status filters from chips
    if (currentFilter !== 'all') {
        if (currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(function (t) { return t.status === 'pending' && !t.deleted && !t.completed && !t.rejected; });
        }
        else if (currentFilter === 'overdue') {
            filteredTasks = filteredTasks.filter(function (t) { return t.status === 'overdue' && !t.deleted && !t.completed; });
        }
        else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(function (t) { return (t.completed === true || t.status === 'completed') && !t.deleted; });
        }
        else if (currentFilter === 'rejected') {
            filteredTasks = filteredTasks.filter(function (t) { return (t.rejected === true || t.status === 'rejected') && !t.deleted; });
        }
        else if (currentFilter === 'deleted') {
            filteredTasks = filteredTasks.filter(function (t) { return t.deleted === true; });
        }
        else if (currentFilter === 'review') {
            filteredTasks = filteredTasks.filter(function (t) { return t.status === 'in-review' && !t.deleted; });
        }
    }
    // Apply show/hide hidden tasks
    if (!showHiddenTasks && currentFilter !== 'deleted') {
        filteredTasks = filteredTasks.filter(function (t) { return !t.deleted; });
    }
    // ===== FIXED: Apply completed tasks toggle =====
    var showCompleted = showCompletedTasks.checked;
    if (!showCompleted) {
        // Agar "Show Completed Tasks" unchecked hai to completed tasks ko filter out karo
        filteredTasks = filteredTasks.filter(function (t) { return !t.completed; });
    }
    // Agar checked hai to sab dikhao
    if (filteredTasks.length === 0) {
        tasksTableBody.innerHTML = "<tr><td colspan=\"".concat(gridColumns.length, "\" style=\"text-align:center; padding:2rem;\">No tasks found</td></tr>");
    }
    else {
        tasksTableBody.innerHTML = filteredTasks.map(function (task) {
            var statusClass = '';
            var statusText = '';
            if (task.deleted) {
                statusClass = 'sky-status-deleted';
                statusText = 'Deleted';
            }
            else if (task.rejected || task.status === 'rejected') {
                statusClass = 'sky-status-rejected';
                statusText = 'Rejected';
            }
            else if (task.completed || task.status === 'completed') {
                statusClass = 'sky-status-completed';
                statusText = 'Completed';
            }
            else if (task.status === 'in-progress') {
                statusClass = 'sky-status-in-progress';
                statusText = 'In Progress';
            }
            else if (task.status === 'in-review') {
                statusClass = 'sky-status-in-review';
                statusText = 'In Review';
            }
            else if (task.status === 'overdue') {
                statusClass = 'sky-status-overdue';
                statusText = 'Overdue';
            }
            else {
                statusClass = 'sky-status-pending';
                statusText = 'Pending';
            }
            var commentCount = task.comments ? task.comments.length : 0;
            var docCount = task.documents ? task.documents.length : 0;
            // Build row based on gridColumns
            var rowHtml = '<tr>';
            gridColumns.forEach(function (col) {
                if (col === 'id') {
                    rowHtml += "<td class=\"sky-task-id\">".concat(task.taskId, "</td>");
                }
                else if (col === 'name') {
                    rowHtml += "<td><strong>".concat(task.name, "</strong></td>");
                }
                else if (col === 'status') {
                    rowHtml += "<td><span class=\"sky-status-badge ".concat(statusClass, "\">").concat(statusText, "</span></td>");
                }
                else if (col === 'category') {
                    rowHtml += "<td>".concat(task.category, "</td>");
                }
                else if (col === 'desc') {
                    rowHtml += "<td>".concat(task.desc || '-', "</td>");
                }
                else if (col === 'docs') {
                    rowHtml += "<td>\n            <div class=\"sky-icon-btn\" onclick=\"openDocPopup(".concat(task.id, ")\">\n              <i class=\"fas fa-file-alt\"></i>\n              ").concat(docCount > 0 ? "<span class=\"sky-badge\">".concat(docCount, "</span>") : '', "\n            </div>\n          </td>");
                }
                else if (col === 'assignee') {
                    rowHtml += "<td>".concat(task.assignee || '-', "</td>");
                }
                else if (col === 'assignDate') {
                    rowHtml += "<td>".concat(task.assignDate ? task.assignDate.slice(5) : '-', "</td>");
                }
                else if (col === 'reviewDate') {
                    rowHtml += "<td>".concat(task.reviewDate ? task.reviewDate.slice(5) : '-', "</td>");
                }
                else if (col === 'dueDate') {
                    rowHtml += "<td>".concat(task.dueDate ? task.dueDate.slice(5) : '-', "</td>");
                }
                else if (col === 'owner') {
                    rowHtml += "<td>".concat(task.owner || '-', "</td>");
                }
                else if (col === 'reviewer') {
                    rowHtml += "<td>".concat(task.reviewer || '-', "</td>");
                }
                else if (col === 'approver') {
                    rowHtml += "<td>".concat(task.approver || '-', "</td>");
                }
                else if (col === 'comments') {
                    rowHtml += "<td>\n            <div class=\"sky-icon-btn\" onclick=\"openCommentPopup(".concat(task.id, ")\">\n              <i class=\"fas fa-comment\"></i>\n              ").concat(commentCount > 0 ? "<span class=\"sky-badge\">".concat(commentCount, "</span>") : '', "\n            </div>\n          </td>");
                }
                else if (col === 'done') {
                    rowHtml += "<td>\n            <input type=\"checkbox\" class=\"sky-completion-checkbox\" data-task-id=\"".concat(task.id, "\" ").concat(task.completed ? 'checked' : '', " ").concat(task.deleted ? 'disabled' : '', ">\n          </td>");
                }
                else if (col === 'actions') {
                    rowHtml += "<td>\n            <div class=\"sky-action-btns\">\n              <button class=\"sky-action-btn sky-edit-task\" data-id=\"".concat(task.id, "\" ").concat(task.deleted ? 'disabled' : '', ">\n                <i class=\"fas fa-edit\"></i>\n              </button>\n              <button class=\"sky-action-btn sky-delete-task\" data-id=\"").concat(task.id, "\" ").concat(task.deleted ? 'disabled' : '', ">\n                <i class=\"fas fa-trash\"></i>\n              </button>\n            </div>\n          </td>");
                }
                else if (col === 'priority') {
                    rowHtml += "<td>".concat(task.priority || '-', "</td>");
                }
                else if (col === 'recurrenceType') {
                    rowHtml += "<td>".concat(task.recurrenceType || '-', "</td>");
                }
                else if (col === 'jeNumber') {
                    rowHtml += "<td>".concat(task.jeNumber || '-', "</td>");
                }
                else if (col === 'createdBy') {
                    rowHtml += "<td>".concat(task.createdBy || '-', "</td>");
                }
                else if (col === 'description') {
                    rowHtml += "<td>".concat(task.desc || '-', "</td>");
                }
                else if (col === 'reviewerDueDate') {
                    rowHtml += "<td>".concat(task.reviewDate || '-', "</td>");
                }
                else if (col === 'completionDocs') {
                    rowHtml += "<td>".concat(task.completionDocs ? task.completionDocs.length : 0, "</td>");
                }
                else {
                    rowHtml += "<td>-</td>";
                }
            });
            rowHtml += '</tr>';
            return rowHtml;
        }).join('');
    }
    updateLegendCounts();
}
// ===== FIXED: Filter dropdown handling =====
if (filterField) {
    filterField.addEventListener('change', function () {
        var field = this.value;
        if (filterOptions[field]) {
            // Show select with options
            filterValueSelect.style.display = 'inline-block';
            filterValueInput.style.display = 'none';
            filterValueSelect.innerHTML = filterOptions[field].map(function (opt) {
                return "<option value=\"".concat(opt, "\">").concat(opt, "</option>");
            }).join('');
        }
        else {
            // Show input
            filterValueSelect.style.display = 'none';
            filterValueInput.style.display = 'inline-block';
            filterValueInput.value = '';
        }
    });
}
// Comment Popup Functions
window.openCommentPopup = function (taskId) {
    var task = tasks.find(function (t) { return t.id === taskId; });
    if (!task)
        return;
    currentCommentTaskId = taskId;
    commentTaskName.textContent = task.name;
    if (task.comments && task.comments.length > 0) {
        commentList.innerHTML = task.comments.map(function (c) { return "\n      <div class=\"sky-comment-item\">\n        <div style=\"margin-bottom:3px;\">".concat(c.text, "</div>\n        <div style=\"display:flex; justify-content:space-between; font-size:0.7rem; color:#666;\">\n          <span>").concat(c.time, "</span>\n          <span class=\"sky-delete-comment\" onclick=\"deleteComment(").concat(task.id, ", ").concat(c.id, ")\"><i class=\"fas fa-trash\"></i> delete</span>\n        </div>\n      </div>\n    "); }).join('');
    }
    else {
        commentList.innerHTML = '<div style="text-align:center; color:#999; padding:1rem;">No comments</div>';
    }
    commentPopup.classList.add('sky-active');
};
window.deleteComment = function (taskId, commentId) {
    var task = tasks.find(function (t) { return t.id === taskId; });
    if (task) {
        task.comments = task.comments.filter(function (c) { return c.id !== commentId; });
        saveTasks();
        renderTasks();
        if (currentCommentTaskId === taskId) {
            window.openCommentPopup(taskId);
        }
    }
};
if (addCommentBtn) {
    addCommentBtn.addEventListener('click', function () {
        if (commentInput.value.trim() && currentCommentTaskId) {
            var task = tasks.find(function (t) { return t.id === currentCommentTaskId; });
            if (task) {
                if (!task.comments)
                    task.comments = [];
                var newComment = {
                    id: Date.now(),
                    text: commentInput.value,
                    time: new Date().toLocaleString()
                };
                task.comments.push(newComment);
                commentInput.value = '';
                saveTasks();
                renderTasks();
                window.openCommentPopup(currentCommentTaskId);
            }
        }
    });
}
// Document Popup Functions
window.openDocPopup = function (taskId) {
    var task = tasks.find(function (t) { return t.id === taskId; });
    if (!task)
        return;
    currentDocTaskId = taskId;
    docTaskName.textContent = task.name + ' - Documents';
    if (task.documents && task.documents.length > 0) {
        docList.innerHTML = task.documents.map(function (doc) { return "\n      <div class=\"sky-file-item\">\n        <div><i class=\"fas fa-file\"></i> ".concat(doc.name, " (").concat(doc.size, ")</div>\n        <div>\n          <i class=\"fas fa-download\" style=\"color:#ec008b; cursor:pointer; margin-right:8px;\" onclick=\"downloadDoc('").concat(doc.name, "')\"></i>\n          <i class=\"fas fa-trash\" style=\"color:#ff4444; cursor:pointer;\" onclick=\"deleteDoc(").concat(task.id, ", '").concat(doc.name, "')\"></i>\n        </div>\n      </div>\n    "); }).join('');
    }
    else {
        docList.innerHTML = '<div style="text-align:center; color:#999; padding:2rem;">No documents</div>';
    }
    docPopup.classList.add('sky-active');
};
window.deleteDoc = function (taskId, docName) {
    var task = tasks.find(function (t) { return t.id === taskId; });
    if (task) {
        task.documents = task.documents.filter(function (d) { return d.name !== docName; });
        saveTasks();
        renderTasks();
        if (currentDocTaskId === taskId) {
            window.openDocPopup(taskId);
        }
    }
};
window.downloadDoc = function (docName) {
    alert("Downloading ".concat(docName));
};
// Close Popups
if (closeCommentPopup) {
    closeCommentPopup.addEventListener('click', function () {
        commentPopup.classList.remove('sky-active');
    });
}
if (closeDocPopup) {
    closeDocPopup.addEventListener('click', function () {
        docPopup.classList.remove('sky-active');
    });
}
// Modal Controls
function openModal(task) {
    if (task === void 0) { task = null; }
    taskForm.reset();
    uploadedFiles = [];
    modal.classList.add('sky-active');
    modalTitle.textContent = task ? 'Edit Task' : 'Add New Task';
    if (task) {
        taskIdInput.value = task.id.toString();
        taskIdDisplay.value = task.taskId;
        taskName.value = task.name;
        taskCategory.value = task.category;
        taskStatus.value = task.status;
        taskDesc.value = task.desc || '';
        taskAssignee.value = task.assignee || '';
        taskAssignDate.value = task.assignDate || '';
        taskReviewDate.value = task.reviewDate || '';
        taskDueDate.value = task.dueDate || '';
        taskOwner.value = task.owner || '';
        taskReviewer.value = task.reviewer || '';
        taskApprover.value = task.approver || '';
        taskPriority.value = task.priority || 'medium';
        taskRecurrence.value = task.recurrenceType || 'none';
        if (task.comments && task.comments.length > 0) {
            modalCommentList.innerHTML = task.comments.map(function (c) { return "\n        <div style=\"padding:0.3rem; border-bottom:1px solid #eee;\">\n          <div>".concat(c.text, "</div>\n          <div style=\"font-size:0.7rem; color:#666;\">").concat(c.time, "</div>\n        </div>\n      "); }).join('');
        }
        else {
            modalCommentList.innerHTML = '<div style="color:#999; padding:0.3rem;">No comments</div>';
        }
        if (task.documents && task.documents.length > 0) {
            fileList.innerHTML = task.documents.map(function (doc) { return "\n        <div class=\"sky-file-item\">\n          <div><i class=\"fas fa-file\"></i> ".concat(doc.name, " (").concat(doc.size, ")</div>\n        </div>\n      "); }).join('');
        }
        else {
            fileList.innerHTML = '';
        }
    }
    else {
        taskIdInput.value = '';
        taskIdDisplay.value = generateTaskId();
        taskName.value = '';
        taskCategory.value = currentSecondaryTab === 'monthClose' ? 'monthClose' : currentSecondaryTab;
        taskStatus.value = 'pending';
        taskDesc.value = '';
        taskAssignee.value = '';
        taskPriority.value = 'medium';
        taskRecurrence.value = 'none';
        var today = new Date().toISOString().split('T')[0];
        taskAssignDate.value = today;
        taskDueDate.value = today;
        taskReviewDate.value = '';
        taskOwner.value = '';
        taskReviewer.value = '';
        taskApprover.value = '';
        modalCommentList.innerHTML = '<div style="color:#999; padding:0.3rem;">No comments</div>';
        fileList.innerHTML = '';
    }
}
if (closeModal) {
    closeModal.addEventListener('click', function () {
        modal.classList.remove('sky-active');
        uploadedFiles = [];
    });
}
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function () { return openModal(); });
}
// Export Button
if (exportBtn) {
    exportBtn.addEventListener('click', function () {
        exportModal.classList.add('sky-active');
    });
}
if (closeExport) {
    closeExport.addEventListener('click', function () {
        exportModal.classList.remove('sky-active');
    });
}
// Export Options
document.querySelectorAll('.sky-export-option').forEach(function (option) {
    option.addEventListener('click', function () {
        var format = this.dataset.format;
        var data = tasks.map(function (t) { return ({
            'Task ID': t.taskId,
            'Name': t.name,
            'Status': t.status,
            'Category': t.category,
            'Description': t.desc,
            'Documents': t.documents ? t.documents.length : 0,
            'Assignee': t.assignee,
            'Assign Date': t.assignDate,
            'Review Date': t.reviewDate,
            'Due Date': t.dueDate,
            'Owner': t.owner,
            'Reviewer': t.reviewer,
            'Approver': t.approver,
            'Priority': t.priority,
            'Recurrence Type': t.recurrenceType,
            'JE Number': t.jeNumber,
            'Comments': t.comments ? t.comments.map(function (c) { return c.text; }).join('; ') : '',
            'Completed': t.completed ? 'Yes' : 'No'
        }); });
        var content = '';
        var filename = "tasks_".concat(new Date().toISOString().split('T')[0]);
        switch (format) {
            case 'csv':
                content = __spreadArray([Object.keys(data[0]).join(',')], data.map(function (row) {
                    var values = Object.keys(row).map(function (key) { return "\"".concat(row[key], "\""); });
                    return values.join(',');
                }), true).join('\n');
                filename += '.csv';
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename += '.json';
                break;
            case 'xml':
                content = '<?xml version="1.0"?>\n<tasks>\n' + data.map(function (row) {
                    var entries = Object.keys(row).map(function (key) { return "    <".concat(key, ">").concat(row[key], "</").concat(key, ">"); }).join('\n');
                    return '  <task>\n' + entries + '\n  </task>';
                }).join('\n') + '\n</tasks>';
                filename += '.xml';
                break;
            case 'excel':
                content = __spreadArray([Object.keys(data[0]).join('\t')], data.map(function (row) {
                    var values = Object.keys(row).map(function (key) { return row[key]; });
                    return values.join('\t');
                }), true).join('\n');
                filename += '.xlsx';
                break;
            case 'html':
                content = '<table border="1"><tr><th>' + Object.keys(data[0]).join('</th><th>') + '</th></tr>' +
                    data.map(function (row) {
                        var values = Object.keys(row).map(function (key) { return row[key]; });
                        return '<tr><td>' + values.join('</td><td>') + '</td></tr>';
                    }).join('') + '</table>';
                filename += '.html';
                break;
            default:
                content = JSON.stringify(data, null, 2);
                filename += '.txt';
        }
        var blob = new Blob([content], { type: 'text/plain' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        exportModal.classList.remove('sky-active');
    });
});
// File Upload
if (dropZone) {
    dropZone.addEventListener('click', function () { return fileInput.click(); });
    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.style.borderColor = '#ec008b';
    });
    dropZone.addEventListener('dragleave', function () {
        dropZone.style.borderColor = '#ddd';
    });
    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        if (e.dataTransfer) {
            handleFiles(e.dataTransfer.files);
        }
    });
}
if (fileInput) {
    fileInput.addEventListener('change', function (e) {
        if (e.target) {
            var target = e.target;
            if (target.files) {
                handleFiles(target.files);
            }
        }
    });
}
function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileObj = {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            file: file
        };
        uploadedFiles.push(fileObj);
    }
    renderFileList();
}
window.removeFile = function (fileName) {
    uploadedFiles = uploadedFiles.filter(function (f) { return f.name !== fileName; });
    renderFileList();
};
function renderFileList() {
    fileList.innerHTML = uploadedFiles.map(function (f) { return "\n    <div class=\"sky-file-item\">\n      <div><i class=\"fas fa-file\"></i> ".concat(f.name, " (").concat(f.size, ")</div>\n      <i class=\"fas fa-times sky-remove-file\" onclick=\"removeFile('").concat(f.name, "')\"></i>\n    </div>\n  "); }).join('');
}
// Add comment from modal
if (addModalCommentBtn) {
    addModalCommentBtn.addEventListener('click', function () {
        if (modalCommentInput.value.trim()) {
            if (modalCommentList.innerHTML.includes('No comments')) {
                modalCommentList.innerHTML = '';
            }
            var commentDiv = document.createElement('div');
            commentDiv.style.padding = '0.3rem';
            commentDiv.style.borderBottom = '1px solid #eee';
            commentDiv.innerHTML = "\n        <div>".concat(modalCommentInput.value, "</div>\n        <div style=\"font-size:0.7rem; color:#666;\">").concat(new Date().toLocaleString(), "</div>\n      ");
            modalCommentList.appendChild(commentDiv);
            modalCommentInput.value = '';
        }
    });
}
// Form Submit
if (taskForm) {
    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var taskId = taskIdInput.value;
        var taskIdDisplayVal = taskIdDisplay.value.trim();
        if (!taskIdDisplayVal) {
            taskIdDisplayVal = generateTaskId();
        }
        var modalComments = [];
        var commentDivs = document.querySelectorAll('#sky-modalCommentList > div');
        commentDivs.forEach(function (div) {
            var textDiv = div.querySelector('div:first-child');
            var timeDiv = div.querySelector('div:last-child');
            if (textDiv && timeDiv && textDiv.textContent && !textDiv.textContent.includes('No comments')) {
                modalComments.push({
                    id: Date.now() + Math.random(),
                    text: textDiv.textContent,
                    time: timeDiv.textContent
                });
            }
        });
        var taskData = {
            id: taskId ? parseInt(taskId) : Date.now(),
            taskId: taskIdDisplayVal,
            name: taskName.value,
            category: taskCategory.value,
            status: taskStatus.value,
            desc: taskDesc.value,
            assignee: taskAssignee.value,
            assignDate: taskAssignDate.value,
            reviewDate: taskReviewDate.value,
            dueDate: taskDueDate.value,
            owner: taskOwner.value,
            reviewer: taskReviewer.value,
            approver: taskApprover.value,
            priority: taskPriority.value,
            recurrenceType: taskRecurrence.value,
            jeNumber: '',
            createdBy: 'Admin',
            completionDocs: [],
            comments: modalComments,
            documents: [],
            completed: false,
            deleted: false,
            rejected: false
        };
        if (uploadedFiles.length > 0) {
            taskData.documents = uploadedFiles.map(function (f) { return ({
                name: f.name,
                size: f.size
            }); });
        }
        if (taskId) {
            var index = tasks.findIndex(function (t) { return t.id === parseInt(taskId); });
            if (index !== -1) {
                var existingTask = tasks[index];
                taskData.documents = taskData.documents.length > 0 ? taskData.documents : existingTask.documents;
                taskData.comments = taskData.comments.length > 0 ? taskData.comments : existingTask.comments;
                taskData.completed = existingTask.completed;
                taskData.deleted = existingTask.deleted;
                taskData.rejected = existingTask.rejected;
                taskData.jeNumber = existingTask.jeNumber;
                taskData.createdBy = existingTask.createdBy;
                tasks[index] = taskData;
            }
        }
        else {
            tasks.push(taskData);
        }
        saveTasks();
        uploadedFiles = [];
        modal.classList.remove('sky-active');
        renderTasks();
        alert('Task saved successfully!');
    });
}
// Event Delegation
document.addEventListener('click', function (e) {
    var target = e.target;
    if (target.closest('.sky-edit-task')) {
        var btn = target.closest('.sky-edit-task');
        var taskId_1 = parseInt(btn.dataset.id || '0');
        var task = tasks.find(function (t) { return t.id === taskId_1; });
        if (task)
            openModal(task);
    }
    if (target.closest('.sky-delete-task')) {
        var btn = target.closest('.sky-delete-task');
        var taskId_2 = parseInt(btn.dataset.id || '0');
        if (confirm('Delete this task?')) {
            var task = tasks.find(function (t) { return t.id === taskId_2; });
            if (task) {
                task.deleted = true;
                saveTasks();
                renderTasks();
            }
        }
    }
    if (target.classList.contains('sky-completion-checkbox')) {
        var checkbox = target;
        var taskId_3 = parseInt(checkbox.dataset.taskId || '0');
        var task = tasks.find(function (t) { return t.id === taskId_3; });
        if (task) {
            task.completed = checkbox.checked;
            if (task.completed)
                task.status = 'completed';
            saveTasks();
            renderTasks();
        }
    }
});
// Main Tabs (General/Account)
document.querySelectorAll('.sky-top-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
        if (this.classList.contains('sky-secondary-tab'))
            return;
        document.querySelectorAll('.sky-top-tab').forEach(function (t) { return t.classList.remove('sky-active'); });
        this.classList.add('sky-active');
        currentMainTab = this.dataset.tab || 'general';
        renderTasks();
    });
});
// Secondary Tabs (Month & Close, Accrued, Income)
document.querySelectorAll('.sky-secondary-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.sky-secondary-tab').forEach(function (t) { return t.classList.remove('sky-active'); });
        this.classList.add('sky-active');
        currentSecondaryTab = this.dataset.secondary || 'monthClose';
        renderTasks();
    });
});
// Filter Chips
document.querySelectorAll('.sky-chip-filter').forEach(function (chip) {
    chip.addEventListener('click', function () {
        document.querySelectorAll('.sky-chip-filter').forEach(function (c) { return c.classList.remove('sky-active'); });
        this.classList.add('sky-active');
        currentFilter = this.dataset.filter || 'all';
        renderTasks();
    });
});
// ===== FIXED: Category Filter dropdown =====
if (categoryFilter) {
    // First, populate the category filter dropdown
    categoryFilter.innerHTML = "\n    <option value=\"all\">All Categories</option>\n    <option value=\"monthClose\">Month & Close</option>\n    <option value=\"accrued\">Accrued</option>\n    <option value=\"income\">Income</option>\n    <option value=\"payroll\">Payroll</option>\n    <option value=\"tax\">Tax</option>\n  ";
    categoryFilter.addEventListener('change', function () {
        if (this.value === 'all') {
            currentFilter = 'all';
            document.querySelectorAll('.sky-chip-filter').forEach(function (c) { return c.classList.remove('sky-active'); });
            document.querySelector('.sky-chip-filter[data-filter="all"]').classList.add('sky-active');
        }
        else {
            currentFilter = this.value;
            document.querySelectorAll('.sky-chip-filter').forEach(function (c) { return c.classList.remove('sky-active'); });
        }
        renderTasks();
    });
}
// Show Hidden Tasks Button
if (showHiddenTasksBtn) {
    showHiddenTasksBtn.addEventListener('click', function () {
        showHiddenTasks = !showHiddenTasks;
        this.classList.toggle('sky-active');
        if (showHiddenTasks) {
            this.querySelector('span').textContent = 'Hide Hidden Tasks';
        }
        else {
            this.querySelector('span').textContent = 'Show Hidden Tasks';
        }
        renderTasks();
    });
}
// See More Dropdown
if (seeMoreBtn) {
    seeMoreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        seeMoreDropdown.classList.toggle('sky-active');
    });
    document.addEventListener('click', function () {
        seeMoreDropdown.classList.remove('sky-active');
    });
}
// See More Actions
if (rejectAction) {
    rejectAction.addEventListener('click', function () {
        seeMoreDropdown.classList.remove('sky-active');
        openRejectModal();
    });
}
if (reviewAction) {
    reviewAction.addEventListener('click', function () {
        seeMoreDropdown.classList.remove('sky-active');
        openReviewModal();
    });
}
if (deleteAction) {
    deleteAction.addEventListener('click', function () {
        seeMoreDropdown.classList.remove('sky-active');
        if (confirm('Are you sure you want to delete selected tasks?')) {
            var selectedIds_1 = [];
            var checkboxes = document.querySelectorAll('.sky-bulk-task-checkbox:checked');
            checkboxes.forEach(function (cb) {
                var value = parseInt(cb.value);
                if (!isNaN(value)) {
                    selectedIds_1.push(value);
                }
            });
            if (selectedIds_1.length > 0) {
                tasks.forEach(function (task) {
                    if (selectedIds_1.indexOf(task.id) !== -1) {
                        task.deleted = true;
                    }
                });
                saveTasks();
                renderTasks();
                alert("Deleted ".concat(selectedIds_1.length, " tasks"));
                currentFilter = 'deleted';
                document.querySelectorAll('.sky-chip-filter').forEach(function (c) { return c.classList.remove('sky-active'); });
                document.querySelector('.sky-chip-filter[data-filter="deleted"]').classList.add('sky-active');
                renderTasks();
            }
            else {
                alert('Please select tasks first using Bulk Edit');
            }
        }
    });
}
if (bulkEditAction) {
    bulkEditAction.addEventListener('click', function () {
        seeMoreDropdown.classList.remove('sky-active');
        openBulkEdit();
    });
}
if (customizeGridAction) {
    customizeGridAction.addEventListener('click', function () {
        seeMoreDropdown.classList.remove('sky-active');
        openCustomizeGrid();
    });
}
// Filter Modal
if (filterBtn) {
    filterBtn.addEventListener('click', function () {
        filterModal.classList.add('sky-active');
        renderActiveFilters();
    });
}
if (closeFilterModal) {
    closeFilterModal.addEventListener('click', function () {
        filterModal.classList.remove('sky-active');
    });
}
// Add filter button
if (addFilterBtn) {
    addFilterBtn.addEventListener('click', function () {
        var field = document.getElementById('sky-filterField').value;
        var valueSelect = document.getElementById('sky-filterValue');
        var valueInput = document.getElementById('sky-filterValueInput');
        var value = valueSelect.style.display !== 'none' ? valueSelect.value : valueInput.value;
        if (value && value.trim() !== '') {
            activeFilters.push({ field: field, value: value.trim() });
            renderActiveFilters();
            valueInput.value = '';
        }
        else {
            alert('Please enter a filter value');
        }
    });
}
function renderActiveFilters() {
    var container = document.getElementById('sky-activeFilters');
    if (activeFilters.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No active filters</p>';
    }
    else {
        container.innerHTML = activeFilters.map(function (filter, index) { return "\n      <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 10px; background: #f8f9fc; border-radius: 8px;\">\n        <span><strong>".concat(filter.field, "</strong> = \"").concat(filter.value, "\"</span>\n        <i class=\"fas fa-times\" style=\"color: #dc3545; cursor: pointer;\" onclick=\"removeFilter(").concat(index, ")\"></i>\n      </div>\n    "); }).join('');
    }
}
window.removeFilter = function (index) {
    activeFilters.splice(index, 1);
    renderActiveFilters();
};
if (clearAllFilters) {
    clearAllFilters.addEventListener('click', function () {
        activeFilters = [];
        renderActiveFilters();
    });
}
if (applyFilters) {
    applyFilters.addEventListener('click', function () {
        filterModal.classList.remove('sky-active');
        renderTasks();
    });
}
// Clear Filter Button
if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', function () {
        currentFilter = 'all';
        activeFilters = [];
        document.querySelectorAll('.sky-chip-filter').forEach(function (c) { return c.classList.remove('sky-active'); });
        document.querySelector('.sky-chip-filter[data-filter="all"]').classList.add('sky-active');
        categoryFilter.value = 'all';
        renderTasks();
    });
}
// Customize Grid
function openCustomizeGrid() {
    var modal = document.getElementById('sky-customizeGridModal');
    var container = document.getElementById('sky-gridFields');
    container.innerHTML = allColumns.map(function (col) {
        var isSelected = gridColumns.indexOf(col.id) !== -1;
        return "\n    <div class=\"sky-grid-field-item ".concat(isSelected ? 'sky-selected' : '', "\">\n      <i class=\"fas fa-grip-vertical sky-drag-handle\"></i>\n      <input type=\"checkbox\" value=\"").concat(col.id, "\" ").concat(isSelected ? 'checked' : '', ">\n      <label>").concat(col.name, "</label>\n    </div>\n  ");
    }).join('');
    modal.classList.add('sky-active');
}
if (closeCustomizeGrid) {
    closeCustomizeGrid.addEventListener('click', function () {
        customizeGridModal.classList.remove('sky-active');
    });
}
if (saveGridBtn) {
    saveGridBtn.addEventListener('click', function () {
        var checkboxes = document.querySelectorAll('#sky-gridFields input[type="checkbox"]:checked');
        gridColumns = Array.from(checkboxes).map(function (cb) { return cb.value; });
        saveGridColumns();
        customizeGridModal.classList.remove('sky-active');
        renderTasks();
        alert('Grid layout saved!');
    });
}
if (resetGridBtn) {
    resetGridBtn.addEventListener('click', function () {
        gridColumns = ['id', 'name', 'status', 'category', 'desc', 'docs', 'assignee', 'assignDate', 'reviewDate', 'dueDate', 'owner', 'reviewer', 'approver', 'comments', 'done', 'actions'];
        saveGridColumns();
        openCustomizeGrid();
        renderTasks();
    });
}
// Bulk Edit
function openBulkEdit() {
    var modal = document.getElementById('sky-bulkEditModal');
    var tbody = document.getElementById('sky-bulkEditTableBody');
    var selectedDiv = document.getElementById('sky-bulkEditSelectedTasks');
    var availableTasks = getCurrentTabTasks().filter(function (t) { return !t.deleted; });
    tbody.innerHTML = availableTasks.map(function (task) { return "\n    <tr>\n      <td><input type=\"checkbox\" class=\"sky-bulk-task-checkbox\" value=\"".concat(task.id, "\"></td>\n      <td>").concat(task.taskId, "</td>\n      <td>").concat(task.name, "</td>\n      <td>").concat(task.status, "</td>\n    </tr>\n  "); }).join('');
    selectedDiv.textContent = 'Select tasks to edit';
    modal.classList.add('sky-active');
}
if (closeBulkEdit) {
    closeBulkEdit.addEventListener('click', function () {
        bulkEditModal.classList.remove('sky-active');
    });
}
if (selectAllBulk) {
    selectAllBulk.addEventListener('click', function (e) {
        var target = e.target;
        var checkboxes = document.querySelectorAll('.sky-bulk-task-checkbox');
        checkboxes.forEach(function (cb) { return cb.checked = target.checked; });
    });
}
if (applyBulkEdit) {
    applyBulkEdit.addEventListener('click', function () {
        var selectedIds = [];
        var checkboxes = document.querySelectorAll('.sky-bulk-task-checkbox:checked');
        checkboxes.forEach(function (cb) {
            var value = parseInt(cb.value);
            if (!isNaN(value)) {
                selectedIds.push(value);
            }
        });
        var field = bulkEditField.value;
        var value = bulkEditValue.value;
        if (selectedIds.length === 0) {
            alert('Please select at least one task');
            return;
        }
        if (!value) {
            alert('Please enter a value');
            return;
        }
        tasks.forEach(function (task) {
            if (selectedIds.indexOf(task.id) !== -1) {
                task[field] = value;
            }
        });
        saveTasks();
        renderTasks();
        bulkEditModal.classList.remove('sky-active');
        alert("Updated ".concat(selectedIds.length, " tasks"));
    });
}
// Reject Modal
function openRejectModal() {
    var modal = document.getElementById('sky-rejectModal');
    var select = document.getElementById('sky-rejectTaskSelect');
    var availableTasks = getCurrentTabTasks().filter(function (t) { return !t.deleted && !t.rejected; });
    select.innerHTML = availableTasks.map(function (task) { return "\n    <option value=\"".concat(task.id, "\">").concat(task.taskId, " - ").concat(task.name, "</option>\n  "); }).join('');
    modal.classList.add('sky-active');
}
if (closeRejectModal) {
    closeRejectModal.addEventListener('click', function () {
        rejectModal.classList.remove('sky-active');
    });
}
if (cancelReject) {
    cancelReject.addEventListener('click', function () {
        rejectModal.classList.remove('sky-active');
    });
}
if (confirmReject) {
    confirmReject.addEventListener('click', function () {
        var taskId = parseInt(rejectTaskSelect.value);
        var reason = rejectReason.value;
        if (!reason) {
            alert('Please provide a rejection reason');
            return;
        }
        var task = tasks.find(function (t) { return t.id === taskId; });
        if (task) {
            task.status = 'rejected';
            task.rejected = true;
            if (!task.comments)
                task.comments = [];
            var newComment = {
                id: Date.now(),
                text: "Rejected: ".concat(reason),
                time: new Date().toLocaleString()
            };
            task.comments.push(newComment);
            saveTasks();
            renderTasks();
        }
        rejectModal.classList.remove('sky-active');
        rejectReason.value = '';
        alert('Task rejected');
        currentFilter = 'rejected';
        document.querySelectorAll('.sky-chip-filter').forEach(function (c) { return c.classList.remove('sky-active'); });
        document.querySelector('.sky-chip-filter[data-filter="rejected"]').classList.add('sky-active');
        renderTasks();
    });
}
// Review Modal
function openReviewModal() {
    var modal = document.getElementById('sky-reviewModal');
    var select = document.getElementById('sky-reviewTaskSelect');
    var availableTasks = getCurrentTabTasks().filter(function (t) { return !t.deleted && t.status === 'in-review'; });
    select.innerHTML = availableTasks.map(function (task) { return "\n    <option value=\"".concat(task.id, "\">").concat(task.taskId, " - ").concat(task.name, "</option>\n  "); }).join('');
    modal.classList.add('sky-active');
}
if (closeReviewModal) {
    closeReviewModal.addEventListener('click', function () {
        reviewModal.classList.remove('sky-active');
    });
}
if (cancelReview) {
    cancelReview.addEventListener('click', function () {
        reviewModal.classList.remove('sky-active');
    });
}
if (confirmReview) {
    confirmReview.addEventListener('click', function () {
        var taskId = parseInt(reviewTaskSelect.value);
        var comments = reviewComments.value;
        var status = reviewStatus.value;
        if (!comments) {
            alert('Please provide review comments');
            return;
        }
        var task = tasks.find(function (t) { return t.id === taskId; });
        if (task) {
            if (status === 'approved') {
                task.status = 'completed';
                task.completed = true;
            }
            else if (status === 'needs-changes') {
                task.status = 'in-progress';
            }
            else if (status === 'reject') {
                task.status = 'rejected';
                task.rejected = true;
            }
            if (!task.comments)
                task.comments = [];
            var newComment = {
                id: Date.now(),
                text: "Review (".concat(status, "): ").concat(comments),
                time: new Date().toLocaleString()
            };
            task.comments.push(newComment);
            saveTasks();
            renderTasks();
        }
        reviewModal.classList.remove('sky-active');
        reviewComments.value = '';
        alert('Review submitted');
    });
}
window.showDeletedTasks = function () {
    currentFilter = 'deleted';
    document.querySelectorAll('.sky-chip-filter').forEach(function (c) { return c.classList.remove('sky-active'); });
    document.querySelector('.sky-chip-filter[data-filter="deleted"]').classList.add('sky-active');
    renderTasks();
};
window.openBulkView = function () {
    alert('Bulk view functionality - would show selected tasks in a separate view');
};
// Show/Hide Completed Tasks - Fixed
if (showCompletedTasks) {
    showCompletedTasks.addEventListener('change', function () {
        renderTasks();
    });
}
// Pagination
if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', function () {
        currentPage = 1;
        renderTasks();
    });
}
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
        }
    });
}
if (nextPageBtn) {
    nextPageBtn.addEventListener('click', function () {
        currentPage++;
        renderTasks();
    });
}
// Legend clicks
document.querySelectorAll('.sky-legend-item[data-filter]').forEach(function (item) {
    item.addEventListener('click', function () {
        var filter = this.dataset.filter;
        if (filter) {
            document.querySelectorAll('.sky-chip-filter').forEach(function (c) { return c.classList.remove('sky-active'); });
            document.querySelector(".sky-chip-filter[data-filter=\"".concat(filter, "\"]")).classList.add('sky-active');
            currentFilter = filter;
            renderTasks();
        }
    });
});
// Initialize
loadTasks();
loadGridColumns();
renderTasks();
updateLegendCounts();
// Trigger initial filter field change
if (filterField) {
    filterField.dispatchEvent(new Event('change'));
}
