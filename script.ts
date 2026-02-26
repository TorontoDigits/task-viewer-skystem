// ========== INTERFACES ==========
interface TaskComment {
  id: number;
  text: string;
  time: string;
}

interface TaskDocument {
  name: string;
  size: string;
}

interface TaskItem {
  id: number;
  taskId: string;
  name: string;
  category: string;
  status: string;
  desc: string;
  assignee: string;
  assignDate: string;
  reviewDate: string;
  dueDate: string;
  owner: string;
  reviewer: string;
  approver: string;
  priority: string;
  recurrenceType: string;
  jeNumber: string;
  createdBy: string;
  completionDocs: any[];
  comments: TaskComment[];
  documents: TaskDocument[];
  completed: boolean;
  deleted: boolean;
  rejected: boolean;
}

interface Filter {
  field: string;
  value: string;
}

interface Column {
  id: string;
  name: string;
}

interface UploadedFile {
  name: string;
  size: string;
  file: File;
}

// ========== GLOBAL VARIABLES ==========
let tasks: TaskItem[] = [];
let currentFilter: string = 'all';
let currentMainTab: string = 'general'; // general or account
let currentSecondaryTab: string = 'monthClose'; // monthClose, accrued, income
let currentCommentTaskId: number | null = null;
let currentDocTaskId: number | null = null;
let uploadedFiles: UploadedFile[] = [];
let activeFilters: Filter[] = [];
let showHiddenTasks: boolean = false;

// Make sure Actions column is included in gridColumns
let gridColumns: string[] = [
  'id', 'name', 'status', 'category', 'desc', 'docs', 'assignee', 
  'assignDate', 'reviewDate', 'dueDate', 'owner', 'reviewer', 
  'approver', 'comments', 'done', 'actions'
];

// All available columns for customization
const allColumns: Column[] = [
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
const columnNames: Record<string, string> = {
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
const filterOptions: Record<string, string[]> = {
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
let currentPage: number = 1;
let pageSize: number = 10;

// ========== DOM ELEMENTS ==========
const filterField = document.getElementById('sky-filterField') as HTMLSelectElement;
const filterValueSelect = document.getElementById('sky-filterValue') as HTMLSelectElement;
const filterValueInput = document.getElementById('sky-filterValueInput') as HTMLInputElement;
const filterModal = document.getElementById('sky-filterModal') as HTMLElement;
const filterBtn = document.getElementById('sky-filterBtn') as HTMLElement;
const closeFilterModal = document.getElementById('sky-closeFilterModal') as HTMLElement;
const addFilterBtn = document.getElementById('sky-addFilterBtn') as HTMLElement;
const clearAllFilters = document.getElementById('sky-clearAllFilters') as HTMLElement;
const applyFilters = document.getElementById('sky-applyFilters') as HTMLElement;
const clearFilterBtn = document.getElementById('sky-clearFilterBtn') as HTMLElement;
const categoryFilter = document.getElementById('sky-categoryFilter') as HTMLSelectElement;
const showHiddenTasksBtn = document.getElementById('sky-showHiddenTasks') as HTMLElement;
const showCompletedTasks = document.getElementById('sky-showCompletedTasks') as HTMLInputElement;
const pageSizeSelect = document.getElementById('sky-pageSize') as HTMLSelectElement;
const prevPageBtn = document.getElementById('sky-prevPage') as HTMLButtonElement;
const nextPageBtn = document.getElementById('sky-nextPage') as HTMLButtonElement;
const pageInfo = document.getElementById('sky-pageInfo') as HTMLElement;
const seeMoreBtn = document.getElementById('sky-seeMoreBtn') as HTMLElement;
const seeMoreDropdown = document.getElementById('sky-seeMoreDropdown') as HTMLElement;
const rejectAction = document.getElementById('sky-rejectAction') as HTMLElement;
const reviewAction = document.getElementById('sky-reviewAction') as HTMLElement;
const deleteAction = document.getElementById('sky-deleteAction') as HTMLElement;
const bulkEditAction = document.getElementById('sky-bulkEditAction') as HTMLElement;
const customizeGridAction = document.getElementById('sky-customizeGridAction') as HTMLElement;
const exportBtn = document.getElementById('sky-exportBtn') as HTMLElement;
const exportModal = document.getElementById('sky-exportModal') as HTMLElement;
const closeExport = document.getElementById('sky-closeExport') as HTMLElement;
const addTaskBtn = document.getElementById('sky-addTaskBtn') as HTMLElement;
const modal = document.getElementById('sky-taskModal') as HTMLElement;
const closeModal = document.getElementById('sky-closeModal') as HTMLElement;
const taskForm = document.getElementById('sky-taskForm') as HTMLFormElement;
const modalTitle = document.getElementById('sky-modalTitle') as HTMLElement;
const taskIdInput = document.getElementById('sky-taskId') as HTMLInputElement;
const taskIdDisplay = document.getElementById('sky-taskIdDisplay') as HTMLInputElement;
const taskName = document.getElementById('sky-taskName') as HTMLInputElement;
const taskCategory = document.getElementById('sky-taskCategory') as HTMLSelectElement;
const taskStatus = document.getElementById('sky-taskStatus') as HTMLSelectElement;
const taskDesc = document.getElementById('sky-taskDesc') as HTMLTextAreaElement;
const taskAssignee = document.getElementById('sky-taskAssignee') as HTMLInputElement;
const taskAssignDate = document.getElementById('sky-taskAssignDate') as HTMLInputElement;
const taskReviewDate = document.getElementById('sky-taskReviewDate') as HTMLInputElement;
const taskDueDate = document.getElementById('sky-taskDueDate') as HTMLInputElement;
const taskOwner = document.getElementById('sky-taskOwner') as HTMLInputElement;
const taskReviewer = document.getElementById('sky-taskReviewer') as HTMLInputElement;
const taskApprover = document.getElementById('sky-taskApprover') as HTMLInputElement;
const taskPriority = document.getElementById('sky-taskPriority') as HTMLSelectElement;
const taskRecurrence = document.getElementById('sky-taskRecurrence') as HTMLSelectElement;
const modalCommentList = document.getElementById('sky-modalCommentList') as HTMLElement;
const modalCommentInput = document.getElementById('sky-modalCommentInput') as HTMLInputElement;
const addModalCommentBtn = document.getElementById('sky-addModalCommentBtn') as HTMLElement;
const dropZone = document.getElementById('sky-dropZone') as HTMLElement;
const fileInput = document.getElementById('sky-fileInput') as HTMLInputElement;
const fileList = document.getElementById('sky-fileList') as HTMLElement;
const commentPopup = document.getElementById('sky-commentPopup') as HTMLElement;
const closeCommentPopup = document.getElementById('sky-closeCommentPopup') as HTMLElement;
const commentTaskName = document.getElementById('sky-commentTaskName') as HTMLElement;
const commentList = document.getElementById('sky-commentList') as HTMLElement;
const commentInput = document.getElementById('sky-commentInput') as HTMLInputElement;
const addCommentBtn = document.getElementById('sky-addCommentBtn') as HTMLElement;
const docPopup = document.getElementById('sky-docPopup') as HTMLElement;
const closeDocPopup = document.getElementById('sky-closeDocPopup') as HTMLElement;
const docTaskName = document.getElementById('sky-docTaskName') as HTMLElement;
const docList = document.getElementById('sky-docList') as HTMLElement;
const headerRow = document.getElementById('sky-headerRow') as HTMLElement;
const tasksTableBody = document.getElementById('sky-tasksTableBody') as HTMLElement;
const customizeGridModal = document.getElementById('sky-customizeGridModal') as HTMLElement;
const closeCustomizeGrid = document.getElementById('sky-closeCustomizeGrid') as HTMLElement;
const gridFields = document.getElementById('sky-gridFields') as HTMLElement;
const saveGridBtn = document.getElementById('sky-saveGridBtn') as HTMLElement;
const resetGridBtn = document.getElementById('sky-resetGridBtn') as HTMLElement;
const bulkEditModal = document.getElementById('sky-bulkEditModal') as HTMLElement;
const closeBulkEdit = document.getElementById('sky-closeBulkEdit') as HTMLElement;
const bulkEditSelectedTasks = document.getElementById('sky-bulkEditSelectedTasks') as HTMLElement;
const bulkEditField = document.getElementById('sky-bulkEditField') as HTMLSelectElement;
const bulkEditValue = document.getElementById('sky-bulkEditValue') as HTMLInputElement;
const applyBulkEdit = document.getElementById('sky-applyBulkEdit') as HTMLElement;
const selectAllBulk = document.getElementById('sky-selectAllBulk') as HTMLInputElement;
const bulkEditTableBody = document.getElementById('sky-bulkEditTableBody') as HTMLElement;
const rejectModal = document.getElementById('sky-rejectModal') as HTMLElement;
const closeRejectModal = document.getElementById('sky-closeRejectModal') as HTMLElement;
const rejectTaskSelect = document.getElementById('sky-rejectTaskSelect') as HTMLSelectElement;
const rejectReason = document.getElementById('sky-rejectReason') as HTMLTextAreaElement;
const cancelReject = document.getElementById('sky-cancelReject') as HTMLElement;
const confirmReject = document.getElementById('sky-confirmReject') as HTMLElement;
const reviewModal = document.getElementById('sky-reviewModal') as HTMLElement;
const closeReviewModal = document.getElementById('sky-closeReviewModal') as HTMLElement;
const reviewTaskSelect = document.getElementById('sky-reviewTaskSelect') as HTMLSelectElement;
const reviewComments = document.getElementById('sky-reviewComments') as HTMLTextAreaElement;
const reviewStatus = document.getElementById('sky-reviewStatus') as HTMLSelectElement;
const cancelReview = document.getElementById('sky-cancelReview') as HTMLElement;
const confirmReview = document.getElementById('sky-confirmReview') as HTMLElement;

// Legend elements
const pendingCount = document.getElementById('sky-pendingCount') as HTMLElement;
const completedCount = document.getElementById('sky-completedCount') as HTMLElement;
const overdueCount = document.getElementById('sky-overdueCount') as HTMLElement;
const deletedCount = document.getElementById('sky-deletedCount') as HTMLElement;
const rejectedCount = document.getElementById('sky-rejectedCount') as HTMLElement;
const pendingColor = document.getElementById('sky-pendingColor') as HTMLElement;
const completedColor = document.getElementById('sky-completedColor') as HTMLElement;
const overdueColor = document.getElementById('sky-overdueColor') as HTMLElement;
const deletedColor = document.getElementById('sky-deletedColor') as HTMLElement;
const rejectedColor = document.getElementById('sky-rejectedColor') as HTMLElement;

// ========== FUNCTIONS ==========

// Load tasks from localStorage
function loadTasks(): void {
  const savedTasks = localStorage.getItem('sky-tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  } else {
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
function saveTasks(): void {
  localStorage.setItem('sky-tasks', JSON.stringify(tasks));
}

// Load grid columns from localStorage
function loadGridColumns(): void {
  const savedColumns = localStorage.getItem('sky-gridColumns');
  if (savedColumns) {
    gridColumns = JSON.parse(savedColumns);
  }
  renderTableHeader();
}

// Save grid columns to localStorage
function saveGridColumns(): void {
  localStorage.setItem('sky-gridColumns', JSON.stringify(gridColumns));
  renderTableHeader();
}

// Render table header based on gridColumns
function renderTableHeader(): void {
  if (!headerRow) return;
  
  headerRow.innerHTML = gridColumns.map(col => `<th>${columnNames[col] || col}</th>`).join('');
}

function generateTaskId(): string {
  const prefix = 
    currentSecondaryTab === 'monthClose' ? 'MNC' :
    currentSecondaryTab === 'accrued' ? 'ACC' : 'INC';
  const num = String(Math.floor(Math.random() * 900) + 100);
  // Manually pad with zeros
  const paddedNum = num.length === 1 ? '00' + num : num.length === 2 ? '0' + num : num;
  return `${prefix}-${paddedNum}`;
}

// Get current tab filtered tasks
function getCurrentTabTasks(): TaskItem[] {
  let tabTasks = [...tasks];

  // Apply main tab filter (General or Account)
  if (currentMainTab === 'general') {
    tabTasks = tabTasks.filter(t => t.category === 'monthClose' || t.category === 'accrued' || t.category === 'income');
  } else if (currentMainTab === 'account') {
    tabTasks = tabTasks.filter(t => t.category === 'payroll' || t.category === 'tax');
  }

  // Apply secondary tab filter
  if (currentSecondaryTab === 'monthClose') {
    tabTasks = tabTasks.filter(t => t.category === 'monthClose');
  } else if (currentSecondaryTab === 'accrued') {
    tabTasks = tabTasks.filter(t => t.category === 'accrued');
  } else if (currentSecondaryTab === 'income') {
    tabTasks = tabTasks.filter(t => t.category === 'income');
  }

  return tabTasks;
}

// Update legend counts and colors based on current tab
function updateLegendCounts(): void {
  const tabTasks = getCurrentTabTasks();

  // Calculate counts for each status based on current tab
  const pendingCountVal = tabTasks.filter(t => t.status === 'pending' && !t.deleted && !t.completed && !t.rejected).length;
  const completedCountVal = tabTasks.filter(t => (t.completed === true || t.status === 'completed') && !t.deleted).length;
  const overdueCountVal = tabTasks.filter(t => t.status === 'overdue' && !t.deleted && !t.completed).length;
  const deletedCountVal = tabTasks.filter(t => t.deleted === true).length;
  const rejectedCountVal = tabTasks.filter(t => (t.rejected === true || t.status === 'rejected') && !t.deleted).length;

  // Update count displays
  pendingCount.textContent = pendingCountVal.toString();
  completedCount.textContent = completedCountVal.toString();
  overdueCount.textContent = overdueCountVal.toString();
  deletedCount.textContent = deletedCountVal.toString();
  rejectedCount.textContent = rejectedCountVal.toString();

  // Update legend colors based on active filter
  const legendColors: Record<string, HTMLElement> = {
    pending: pendingColor,
    completed: completedColor,
    overdue: overdueColor,
    deleted: deletedColor,
    rejected: rejectedColor
  };

  // Remove active class from all
  for (let key in legendColors) {
    legendColors[key].classList.remove('sky-active');
  }

  // Add active class to current filter if it exists
  if (currentFilter !== 'all' && legendColors[currentFilter]) {
    legendColors[currentFilter].classList.add('sky-active');
  }
}

// ========== FIXED FILTER FUNCTION ==========
function renderTasks(): void {
  if (!tasksTableBody) return;

  let filteredTasks = [...tasks];

  // Apply main tab filter (General or Account)
  if (currentMainTab === 'general') {
    filteredTasks = filteredTasks.filter(t => t.category === 'monthClose' || t.category === 'accrued' || t.category === 'income');
  } else if (currentMainTab === 'account') {
    filteredTasks = filteredTasks.filter(t => t.category === 'payroll' || t.category === 'tax');
  }

  // Apply secondary tab filter
  if (currentSecondaryTab === 'monthClose') {
    filteredTasks = filteredTasks.filter(t => t.category === 'monthClose');
  } else if (currentSecondaryTab === 'accrued') {
    filteredTasks = filteredTasks.filter(t => t.category === 'accrued');
  } else if (currentSecondaryTab === 'income') {
    filteredTasks = filteredTasks.filter(t => t.category === 'income');
  }

  // ===== FIXED: Apply active filters (simple equals) =====
  activeFilters.forEach(filter => {
    filteredTasks = filteredTasks.filter(task => {
      // Get the field value from task
      const taskValue = (task as any)[filter.field];
      
      // If task value is undefined or null, return false
      if (taskValue === undefined || taskValue === null) {
        return false;
      }
      
      // Convert both to strings for comparison (case insensitive)
      const taskValueStr = String(taskValue).toLowerCase();
      const filterValueStr = String(filter.value).toLowerCase();
      
      // Simple equals comparison
      return taskValueStr === filterValueStr;
    });
  });

  // Apply status filters
  if (currentFilter !== 'all') {
    if (currentFilter === 'pending') {
      filteredTasks = filteredTasks.filter(t => t.status === 'pending' && !t.deleted && !t.completed && !t.rejected);
    } else if (currentFilter === 'overdue') {
      filteredTasks = filteredTasks.filter(t => t.status === 'overdue' && !t.deleted && !t.completed);
    } else if (currentFilter === 'completed') {
      filteredTasks = filteredTasks.filter(t => (t.completed === true || t.status === 'completed') && !t.deleted);
    } else if (currentFilter === 'rejected') {
      filteredTasks = filteredTasks.filter(t => (t.rejected === true || t.status === 'rejected') && !t.deleted);
    } else if (currentFilter === 'deleted') {
      filteredTasks = filteredTasks.filter(t => t.deleted === true);
    } else if (currentFilter === 'review') {
      filteredTasks = filteredTasks.filter(t => t.status === 'in-review' && !t.deleted);
    }
  }

  // Apply show/hide hidden tasks
  if (!showHiddenTasks && currentFilter !== 'deleted') {
    filteredTasks = filteredTasks.filter(t => !t.deleted);
  }

  // Apply completed tasks toggle
  const showCompleted = showCompletedTasks.checked;
  if (!showCompleted && currentFilter !== 'completed' && currentFilter !== 'deleted' && currentFilter !== 'rejected') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  if (filteredTasks.length === 0) {
    tasksTableBody.innerHTML = `<tr><td colspan="${gridColumns.length}" style="text-align:center; padding:2rem;">No tasks found</td></tr>`;
  } else {
    tasksTableBody.innerHTML = filteredTasks.map(task => {
      let statusClass = '';
      let statusText = '';
      
      if (task.deleted) {
        statusClass = 'sky-status-deleted';
        statusText = 'Deleted';
      } else if (task.rejected || task.status === 'rejected') {
        statusClass = 'sky-status-rejected';
        statusText = 'Rejected';
      } else if (task.completed || task.status === 'completed') {
        statusClass = 'sky-status-completed';
        statusText = 'Completed';
      } else if (task.status === 'in-progress') {
        statusClass = 'sky-status-in-progress';
        statusText = 'In Progress';
      } else if (task.status === 'in-review') {
        statusClass = 'sky-status-in-review';
        statusText = 'In Review';
      } else if (task.status === 'overdue') {
        statusClass = 'sky-status-overdue';
        statusText = 'Overdue';
      } else {
        statusClass = 'sky-status-pending';
        statusText = 'Pending';
      }

      const commentCount = task.comments ? task.comments.length : 0;
      const docCount = task.documents ? task.documents.length : 0;

      // Build row based on gridColumns
      let rowHtml = '<tr>';
      
      gridColumns.forEach(col => {
        if (col === 'id') {
          rowHtml += `<td class="sky-task-id">${task.taskId}</td>`;
        } else if (col === 'name') {
          rowHtml += `<td><strong>${task.name}</strong></td>`;
        } else if (col === 'status') {
          rowHtml += `<td><span class="sky-status-badge ${statusClass}">${statusText}</span></td>`;
        } else if (col === 'category') {
          rowHtml += `<td>${task.category}</td>`;
        } else if (col === 'desc') {
          rowHtml += `<td>${task.desc || '-'}</td>`;
        } else if (col === 'docs') {
          rowHtml += `<td>
            <div class="sky-icon-btn" onclick="openDocPopup(${task.id})">
              <i class="fas fa-file-alt"></i>
              ${docCount > 0 ? `<span class="sky-badge">${docCount}</span>` : ''}
            </div>
          </td>`;
        } else if (col === 'assignee') {
          rowHtml += `<td>${task.assignee || '-'}</td>`;
        } else if (col === 'assignDate') {
          rowHtml += `<td>${task.assignDate ? task.assignDate.slice(5) : '-'}</td>`;
        } else if (col === 'reviewDate') {
          rowHtml += `<td>${task.reviewDate ? task.reviewDate.slice(5) : '-'}</td>`;
        } else if (col === 'dueDate') {
          rowHtml += `<td>${task.dueDate ? task.dueDate.slice(5) : '-'}</td>`;
        } else if (col === 'owner') {
          rowHtml += `<td>${task.owner || '-'}</td>`;
        } else if (col === 'reviewer') {
          rowHtml += `<td>${task.reviewer || '-'}</td>`;
        } else if (col === 'approver') {
          rowHtml += `<td>${task.approver || '-'}</td>`;
        } else if (col === 'comments') {
          rowHtml += `<td>
            <div class="sky-icon-btn" onclick="openCommentPopup(${task.id})">
              <i class="fas fa-comment"></i>
              ${commentCount > 0 ? `<span class="sky-badge">${commentCount}</span>` : ''}
            </div>
          </td>`;
        } else if (col === 'done') {
          rowHtml += `<td>
            <input type="checkbox" class="sky-completion-checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''} ${task.deleted ? 'disabled' : ''}>
          </td>`;
        } else if (col === 'actions') {
          rowHtml += `<td>
            <div class="sky-action-btns">
              <button class="sky-action-btn sky-edit-task" data-id="${task.id}" ${task.deleted ? 'disabled' : ''}>
                <i class="fas fa-edit"></i>
              </button>
              <button class="sky-action-btn sky-delete-task" data-id="${task.id}" ${task.deleted ? 'disabled' : ''}>
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>`;
        } else if (col === 'priority') {
          rowHtml += `<td>${task.priority || '-'}</td>`;
        } else if (col === 'recurrenceType') {
          rowHtml += `<td>${task.recurrenceType || '-'}</td>`;
        } else if (col === 'jeNumber') {
          rowHtml += `<td>${task.jeNumber || '-'}</td>`;
        } else if (col === 'createdBy') {
          rowHtml += `<td>${task.createdBy || '-'}</td>`;
        } else if (col === 'description') {
          rowHtml += `<td>${task.desc || '-'}</td>`;
        } else if (col === 'reviewerDueDate') {
          rowHtml += `<td>${task.reviewDate || '-'}</td>`;
        } else if (col === 'completionDocs') {
          rowHtml += `<td>${task.completionDocs ? task.completionDocs.length : 0}</td>`;
        } else {
          rowHtml += `<td>-</td>`;
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
  filterField.addEventListener('change', function(this: HTMLSelectElement) {
    const field = this.value;
    
    if (filterOptions[field]) {
      // Show select with options
      filterValueSelect.style.display = 'inline-block';
      filterValueInput.style.display = 'none';
      
      filterValueSelect.innerHTML = filterOptions[field].map(opt => 
        `<option value="${opt}">${opt}</option>`
      ).join('');
    } else {
      // Show input
      filterValueSelect.style.display = 'none';
      filterValueInput.style.display = 'inline-block';
      filterValueInput.value = '';
    }
  });
}

// Comment Popup Functions
(window as any).openCommentPopup = function(taskId: number): void {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  currentCommentTaskId = taskId;
  commentTaskName.textContent = task.name;
  
  if (task.comments && task.comments.length > 0) {
    commentList.innerHTML = task.comments.map(c => `
      <div class="sky-comment-item">
        <div style="margin-bottom:3px;">${c.text}</div>
        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#666;">
          <span>${c.time}</span>
          <span class="sky-delete-comment" onclick="deleteComment(${task.id}, ${c.id})"><i class="fas fa-trash"></i> delete</span>
        </div>
      </div>
    `).join('');
  } else {
    commentList.innerHTML = '<div style="text-align:center; color:#999; padding:1rem;">No comments</div>';
  }

  commentPopup.classList.add('sky-active');
};

(window as any).deleteComment = function(taskId: number, commentId: number): void {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.comments = task.comments.filter(c => c.id !== commentId);
    saveTasks();
    renderTasks();
    if (currentCommentTaskId === taskId) {
      (window as any).openCommentPopup(taskId);
    }
  }
};

if (addCommentBtn) {
  addCommentBtn.addEventListener('click', () => {
    if (commentInput.value.trim() && currentCommentTaskId) {
      const task = tasks.find(t => t.id === currentCommentTaskId);
      if (task) {
        if (!task.comments) task.comments = [];
        const newComment: TaskComment = {
          id: Date.now(),
          text: commentInput.value,
          time: new Date().toLocaleString()
        };
        task.comments.push(newComment);
        commentInput.value = '';
        saveTasks();
        renderTasks();
        (window as any).openCommentPopup(currentCommentTaskId);
      }
    }
  });
}

// Document Popup Functions
(window as any).openDocPopup = function(taskId: number): void {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  currentDocTaskId = taskId;
  docTaskName.textContent = task.name + ' - Documents';
  
  if (task.documents && task.documents.length > 0) {
    docList.innerHTML = task.documents.map(doc => `
      <div class="sky-file-item">
        <div><i class="fas fa-file"></i> ${doc.name} (${doc.size})</div>
        <div>
          <i class="fas fa-download" style="color:#ec008b; cursor:pointer; margin-right:8px;" onclick="downloadDoc('${doc.name}')"></i>
          <i class="fas fa-trash" style="color:#ff4444; cursor:pointer;" onclick="deleteDoc(${task.id}, '${doc.name}')"></i>
        </div>
      </div>
    `).join('');
  } else {
    docList.innerHTML = '<div style="text-align:center; color:#999; padding:2rem;">No documents</div>';
  }

  docPopup.classList.add('sky-active');
};

(window as any).deleteDoc = function(taskId: number, docName: string): void {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.documents = task.documents.filter(d => d.name !== docName);
    saveTasks();
    renderTasks();
    if (currentDocTaskId === taskId) {
      (window as any).openDocPopup(taskId);
    }
  }
};

(window as any).downloadDoc = function(docName: string): void {
  alert(`Downloading ${docName}`);
};

// Close Popups
if (closeCommentPopup) {
  closeCommentPopup.addEventListener('click', () => {
    commentPopup.classList.remove('sky-active');
  });
}

if (closeDocPopup) {
  closeDocPopup.addEventListener('click', () => {
    docPopup.classList.remove('sky-active');
  });
}

// Modal Controls
function openModal(task: TaskItem | null = null): void {
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
      modalCommentList.innerHTML = task.comments.map(c => `
        <div style="padding:0.3rem; border-bottom:1px solid #eee;">
          <div>${c.text}</div>
          <div style="font-size:0.7rem; color:#666;">${c.time}</div>
        </div>
      `).join('');
    } else {
      modalCommentList.innerHTML = '<div style="color:#999; padding:0.3rem;">No comments</div>';
    }
    
    if (task.documents && task.documents.length > 0) {
      fileList.innerHTML = task.documents.map(doc => `
        <div class="sky-file-item">
          <div><i class="fas fa-file"></i> ${doc.name} (${doc.size})</div>
        </div>
      `).join('');
    } else {
      fileList.innerHTML = '';
    }
  } else {
    taskIdInput.value = '';
    taskIdDisplay.value = generateTaskId();
    taskName.value = '';
    taskCategory.value = currentSecondaryTab === 'monthClose' ? 'monthClose' : currentSecondaryTab;
    taskStatus.value = 'pending';
    taskDesc.value = '';
    taskAssignee.value = '';
    taskPriority.value = 'medium';
    taskRecurrence.value = 'none';
    
    const today = new Date().toISOString().split('T')[0];
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
  closeModal.addEventListener('click', () => {
    modal.classList.remove('sky-active');
    uploadedFiles = [];
  });
}

if (addTaskBtn) {
  addTaskBtn.addEventListener('click', () => openModal());
}

// Export Button
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    exportModal.classList.add('sky-active');
  });
}

if (closeExport) {
  closeExport.addEventListener('click', () => {
    exportModal.classList.remove('sky-active');
  });
}

// Export Options
document.querySelectorAll('.sky-export-option').forEach(option => {
  option.addEventListener('click', function(this: HTMLElement) {
    const format = this.dataset.format;
    const data = tasks.map(t => ({
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
      'Comments': t.comments ? t.comments.map(c => c.text).join('; ') : '',
      'Completed': t.completed ? 'Yes' : 'No'
    }));

    let content = '';
    let filename = `tasks_${new Date().toISOString().split('T')[0]}`;

    switch(format) {
      case 'csv':
        content = [Object.keys(data[0]).join(','), ...data.map(row => {
          const values = Object.keys(row).map(key => `"${(row as any)[key]}"`);
          return values.join(',');
        })].join('\n');
        filename += '.csv';
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename += '.json';
        break;
      case 'xml':
        content = '<?xml version="1.0"?>\n<tasks>\n' + data.map(row => {
          const entries = Object.keys(row).map(key => `    <${key}>${(row as any)[key]}</${key}>`).join('\n');
          return '  <task>\n' + entries + '\n  </task>';
        }).join('\n') + '\n</tasks>';
        filename += '.xml';
        break;
      case 'excel':
        content = [Object.keys(data[0]).join('\t'), ...data.map(row => {
          const values = Object.keys(row).map(key => (row as any)[key]);
          return values.join('\t');
        })].join('\n');
        filename += '.xlsx';
        break;
      case 'html':
        content = '<table border="1"><tr><th>' + Object.keys(data[0]).join('</th><th>') + '</th></tr>' +
                 data.map(row => {
                   const values = Object.keys(row).map(key => (row as any)[key]);
                   return '<tr><td>' + values.join('</td><td>') + '</td></tr>';
                 }).join('') + '</table>';
        filename += '.html';
        break;
      default:
        content = JSON.stringify(data, null, 2);
        filename += '.txt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    exportModal.classList.remove('sky-active');
  });
});

// File Upload
if (dropZone) {
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ec008b';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ddd';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ddd';
    if (e.dataTransfer) {
      handleFiles(e.dataTransfer.files);
    }
  });
}

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    if (e.target) {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFiles(target.files);
      }
    }
  });
}

function handleFiles(files: FileList): void {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileObj: UploadedFile = {
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      file: file
    };
    uploadedFiles.push(fileObj);
  }
  renderFileList();
}

(window as any).removeFile = function(fileName: string): void {
  uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
  renderFileList();
};

function renderFileList(): void {
  fileList.innerHTML = uploadedFiles.map(f => `
    <div class="sky-file-item">
      <div><i class="fas fa-file"></i> ${f.name} (${f.size})</div>
      <i class="fas fa-times sky-remove-file" onclick="removeFile('${f.name}')"></i>
    </div>
  `).join('');
}

// Add comment from modal
if (addModalCommentBtn) {
  addModalCommentBtn.addEventListener('click', () => {
    if (modalCommentInput.value.trim()) {
      if (modalCommentList.innerHTML.includes('No comments')) {
        modalCommentList.innerHTML = '';
      }
      
      const commentDiv = document.createElement('div');
      commentDiv.style.padding = '0.3rem';
      commentDiv.style.borderBottom = '1px solid #eee';
      commentDiv.innerHTML = `
        <div>${modalCommentInput.value}</div>
        <div style="font-size:0.7rem; color:#666;">${new Date().toLocaleString()}</div>
      `;
      modalCommentList.appendChild(commentDiv);
      
      modalCommentInput.value = '';
    }
  });
}

// Form Submit
if (taskForm) {
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskId = taskIdInput.value;
    
    let taskIdDisplayVal = taskIdDisplay.value.trim();
    if (!taskIdDisplayVal) {
      taskIdDisplayVal = generateTaskId();
    }
    
    const modalComments: TaskComment[] = [];
    const commentDivs = document.querySelectorAll('#sky-modalCommentList > div');
    commentDivs.forEach(div => {
      const textDiv = div.querySelector('div:first-child');
      const timeDiv = div.querySelector('div:last-child');
      if (textDiv && timeDiv && textDiv.textContent && !textDiv.textContent.includes('No comments')) {
        modalComments.push({
          id: Date.now() + Math.random(),
          text: textDiv.textContent,
          time: timeDiv.textContent
        });
      }
    });

    const taskData: TaskItem = {
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
      taskData.documents = uploadedFiles.map(f => ({
        name: f.name,
        size: f.size
      }));
    }

    if (taskId) {
      const index = tasks.findIndex(t => t.id === parseInt(taskId));
      if (index !== -1) {
        const existingTask = tasks[index];
        taskData.documents = taskData.documents.length > 0 ? taskData.documents : existingTask.documents;
        taskData.comments = taskData.comments.length > 0 ? taskData.comments : existingTask.comments;
        taskData.completed = existingTask.completed;
        taskData.deleted = existingTask.deleted;
        taskData.rejected = existingTask.rejected;
        taskData.jeNumber = existingTask.jeNumber;
        taskData.createdBy = existingTask.createdBy;
        tasks[index] = taskData;
      }
    } else {
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
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  if (target.closest('.sky-edit-task')) {
    const btn = target.closest('.sky-edit-task') as HTMLElement;
    const taskId = parseInt(btn.dataset.id || '0');
    const task = tasks.find(t => t.id === taskId);
    if (task) openModal(task);
  }

  if (target.closest('.sky-delete-task')) {
    const btn = target.closest('.sky-delete-task') as HTMLElement;
    const taskId = parseInt(btn.dataset.id || '0');
    if (confirm('Delete this task?')) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.deleted = true;
        saveTasks();
        renderTasks();
      }
    }
  }

  if (target.classList.contains('sky-completion-checkbox')) {
    const checkbox = target as HTMLInputElement;
    const taskId = parseInt(checkbox.dataset.taskId || '0');
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = checkbox.checked;
      if (task.completed) task.status = 'completed';
      saveTasks();
      renderTasks();
    }
  }
});

// Main Tabs (General/Account)
document.querySelectorAll('.sky-top-tab').forEach(tab => {
  tab.addEventListener('click', function(this: HTMLElement) {
    if (this.classList.contains('sky-secondary-tab')) return;
    
    document.querySelectorAll('.sky-top-tab').forEach(t => t.classList.remove('sky-active'));
    this.classList.add('sky-active');
    currentMainTab = this.dataset.tab || 'general';
    renderTasks();
  });
});

// Secondary Tabs (Month & Close, Accrued, Income)
document.querySelectorAll('.sky-secondary-tab').forEach(tab => {
  tab.addEventListener('click', function(this: HTMLElement) {
    document.querySelectorAll('.sky-secondary-tab').forEach(t => t.classList.remove('sky-active'));
    this.classList.add('sky-active');
    currentSecondaryTab = this.dataset.secondary || 'monthClose';
    renderTasks();
  });
});

// Filter Chips
document.querySelectorAll('.sky-chip-filter').forEach(chip => {
  chip.addEventListener('click', function(this: HTMLElement) {
    document.querySelectorAll('.sky-chip-filter').forEach(c => c.classList.remove('sky-active'));
    this.classList.add('sky-active');
    currentFilter = this.dataset.filter || 'all';
    renderTasks();
  });
});

// Category Filter (2nd filter)
if (categoryFilter) {
  categoryFilter.addEventListener('change', function(this: HTMLSelectElement) {
    currentFilter = this.value;
    renderTasks();
  });
}

// Show Hidden Tasks Button
if (showHiddenTasksBtn) {
  showHiddenTasksBtn.addEventListener('click', function(this: HTMLElement) {
    showHiddenTasks = !showHiddenTasks;
    this.classList.toggle('sky-active');
    if (showHiddenTasks) {
      this.querySelector('span')!.textContent = 'Hide Hidden Tasks';
    } else {
      this.querySelector('span')!.textContent = 'Show Hidden Tasks';
    }
    renderTasks();
  });
}

// See More Dropdown
if (seeMoreBtn) {
  seeMoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    seeMoreDropdown.classList.toggle('sky-active');
  });

  document.addEventListener('click', () => {
    seeMoreDropdown.classList.remove('sky-active');
  });
}

// See More Actions
if (rejectAction) {
  rejectAction.addEventListener('click', () => {
    seeMoreDropdown.classList.remove('sky-active');
    openRejectModal();
  });
}

if (reviewAction) {
  reviewAction.addEventListener('click', () => {
    seeMoreDropdown.classList.remove('sky-active');
    openReviewModal();
  });
}

if (deleteAction) {
  deleteAction.addEventListener('click', () => {
    seeMoreDropdown.classList.remove('sky-active');
    if (confirm('Are you sure you want to delete selected tasks?')) {
      const selectedIds: number[] = [];
      const checkboxes = document.querySelectorAll('.sky-bulk-task-checkbox:checked');
      checkboxes.forEach(cb => {
        const value = parseInt((cb as HTMLInputElement).value);
        if (!isNaN(value)) {
          selectedIds.push(value);
        }
      });
      
      if (selectedIds.length > 0) {
        tasks.forEach(task => {
          if (selectedIds.indexOf(task.id) !== -1) {
            task.deleted = true;
          }
        });
        saveTasks();
        renderTasks();
        alert(`Deleted ${selectedIds.length} tasks`);
        
        currentFilter = 'deleted';
        document.querySelectorAll('.sky-chip-filter').forEach(c => c.classList.remove('sky-active'));
        (document.querySelector('.sky-chip-filter[data-filter="deleted"]') as HTMLElement).classList.add('sky-active');
        renderTasks();
      } else {
        alert('Please select tasks first using Bulk Edit');
      }
    }
  });
}

if (bulkEditAction) {
  bulkEditAction.addEventListener('click', () => {
    seeMoreDropdown.classList.remove('sky-active');
    openBulkEdit();
  });
}

if (customizeGridAction) {
  customizeGridAction.addEventListener('click', () => {
    seeMoreDropdown.classList.remove('sky-active');
    openCustomizeGrid();
  });
}

// Filter Modal
if (filterBtn) {
  filterBtn.addEventListener('click', () => {
    filterModal.classList.add('sky-active');
    renderActiveFilters();
  });
}

if (closeFilterModal) {
  closeFilterModal.addEventListener('click', () => {
    filterModal.classList.remove('sky-active');
  });
}

// ===== FIXED: Add filter button =====
if (addFilterBtn) {
  addFilterBtn.addEventListener('click', () => {
    const field = (document.getElementById('sky-filterField') as HTMLSelectElement).value;
    const valueSelect = document.getElementById('sky-filterValue') as HTMLSelectElement;
    const valueInput = document.getElementById('sky-filterValueInput') as HTMLInputElement;
    
    let value = valueSelect.style.display !== 'none' ? valueSelect.value : valueInput.value;

    if (value && value.trim() !== '') {
      activeFilters.push({ field, value: value.trim() });
      renderActiveFilters();
      valueInput.value = '';
    } else {
      alert('Please enter a filter value');
    }
  });
}

function renderActiveFilters(): void {
  const container = document.getElementById('sky-activeFilters') as HTMLElement;
  if (activeFilters.length === 0) {
    container.innerHTML = '<p style="color: #666; text-align: center;">No active filters</p>';
  } else {
    container.innerHTML = activeFilters.map((filter, index) => `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 10px; background: #f8f9fc; border-radius: 8px;">
        <span><strong>${filter.field}</strong> = "${filter.value}"</span>
        <i class="fas fa-times" style="color: #dc3545; cursor: pointer;" onclick="removeFilter(${index})"></i>
      </div>
    `).join('');
  }
}

(window as any).removeFilter = function(index: number): void {
  activeFilters.splice(index, 1);
  renderActiveFilters();
};

if (clearAllFilters) {
  clearAllFilters.addEventListener('click', () => {
    activeFilters = [];
    renderActiveFilters();
  });
}

if (applyFilters) {
  applyFilters.addEventListener('click', () => {
    filterModal.classList.remove('sky-active');
    renderTasks();
  });
}

// Clear Filter Button
if (clearFilterBtn) {
  clearFilterBtn.addEventListener('click', () => {
    currentFilter = 'all';
    activeFilters = [];
    document.querySelectorAll('.sky-chip-filter').forEach(c => c.classList.remove('sky-active'));
    (document.querySelector('.sky-chip-filter[data-filter="all"]') as HTMLElement).classList.add('sky-active');
    categoryFilter.value = 'all';
    renderTasks();
  });
}

// Customize Grid
function openCustomizeGrid(): void {
  const modal = document.getElementById('sky-customizeGridModal') as HTMLElement;
  const container = document.getElementById('sky-gridFields') as HTMLElement;
  
  container.innerHTML = allColumns.map(col => {
    const isSelected = gridColumns.indexOf(col.id) !== -1;
    return `
    <div class="sky-grid-field-item ${isSelected ? 'sky-selected' : ''}">
      <i class="fas fa-grip-vertical sky-drag-handle"></i>
      <input type="checkbox" value="${col.id}" ${isSelected ? 'checked' : ''}>
      <label>${col.name}</label>
    </div>
  `}).join('');

  modal.classList.add('sky-active');
}

if (closeCustomizeGrid) {
  closeCustomizeGrid.addEventListener('click', () => {
    customizeGridModal.classList.remove('sky-active');
  });
}

if (saveGridBtn) {
  saveGridBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#sky-gridFields input[type="checkbox"]:checked');
    gridColumns = Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value);
    saveGridColumns();
    customizeGridModal.classList.remove('sky-active');
    renderTasks();
    alert('Grid layout saved!');
  });
}

if (resetGridBtn) {
  resetGridBtn.addEventListener('click', () => {
    gridColumns = ['id', 'name', 'status', 'category', 'desc', 'docs', 'assignee', 'assignDate', 'reviewDate', 'dueDate', 'owner', 'reviewer', 'approver', 'comments', 'done', 'actions'];
    saveGridColumns();
    openCustomizeGrid();
    renderTasks();
  });
}

// Bulk Edit
function openBulkEdit(): void {
  const modal = document.getElementById('sky-bulkEditModal') as HTMLElement;
  const tbody = document.getElementById('sky-bulkEditTableBody') as HTMLElement;
  const selectedDiv = document.getElementById('sky-bulkEditSelectedTasks') as HTMLElement;

  const availableTasks = getCurrentTabTasks().filter(t => !t.deleted);

  tbody.innerHTML = availableTasks.map(task => `
    <tr>
      <td><input type="checkbox" class="sky-bulk-task-checkbox" value="${task.id}"></td>
      <td>${task.taskId}</td>
      <td>${task.name}</td>
      <td>${task.status}</td>
    </tr>
  `).join('');

  selectedDiv.textContent = 'Select tasks to edit';
  modal.classList.add('sky-active');
}

if (closeBulkEdit) {
  closeBulkEdit.addEventListener('click', () => {
    bulkEditModal.classList.remove('sky-active');
  });
}

if (selectAllBulk) {
  selectAllBulk.addEventListener('click', (e) => {
    const target = e.target as HTMLInputElement;
    const checkboxes = document.querySelectorAll('.sky-bulk-task-checkbox');
    checkboxes.forEach(cb => (cb as HTMLInputElement).checked = target.checked);
  });
}

if (applyBulkEdit) {
  applyBulkEdit.addEventListener('click', () => {
    const selectedIds: number[] = [];
    const checkboxes = document.querySelectorAll('.sky-bulk-task-checkbox:checked');
    checkboxes.forEach(cb => {
      const value = parseInt((cb as HTMLInputElement).value);
      if (!isNaN(value)) {
        selectedIds.push(value);
      }
    });
    
    const field = bulkEditField.value;
    const value = bulkEditValue.value;

    if (selectedIds.length === 0) {
      alert('Please select at least one task');
      return;
    }

    if (!value) {
      alert('Please enter a value');
      return;
    }

    tasks.forEach(task => {
      if (selectedIds.indexOf(task.id) !== -1) {
        (task as any)[field] = value;
      }
    });

    saveTasks();
    renderTasks();
    bulkEditModal.classList.remove('sky-active');
    alert(`Updated ${selectedIds.length} tasks`);
  });
}

// Reject Modal
function openRejectModal(): void {
  const modal = document.getElementById('sky-rejectModal') as HTMLElement;
  const select = document.getElementById('sky-rejectTaskSelect') as HTMLSelectElement;
  
  const availableTasks = getCurrentTabTasks().filter(t => !t.deleted && !t.rejected);
  
  select.innerHTML = availableTasks.map(task => `
    <option value="${task.id}">${task.taskId} - ${task.name}</option>
  `).join('');

  modal.classList.add('sky-active');
}

if (closeRejectModal) {
  closeRejectModal.addEventListener('click', () => {
    rejectModal.classList.remove('sky-active');
  });
}

if (cancelReject) {
  cancelReject.addEventListener('click', () => {
    rejectModal.classList.remove('sky-active');
  });
}

if (confirmReject) {
  confirmReject.addEventListener('click', () => {
    const taskId = parseInt(rejectTaskSelect.value);
    const reason = rejectReason.value;

    if (!reason) {
      alert('Please provide a rejection reason');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'rejected';
      task.rejected = true;
      if (!task.comments) task.comments = [];
      const newComment: TaskComment = {
        id: Date.now(),
        text: `Rejected: ${reason}`,
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
    document.querySelectorAll('.sky-chip-filter').forEach(c => c.classList.remove('sky-active'));
    (document.querySelector('.sky-chip-filter[data-filter="rejected"]') as HTMLElement).classList.add('sky-active');
    renderTasks();
  });
}

// Review Modal
function openReviewModal(): void {
  const modal = document.getElementById('sky-reviewModal') as HTMLElement;
  const select = document.getElementById('sky-reviewTaskSelect') as HTMLSelectElement;
  
  const availableTasks = getCurrentTabTasks().filter(t => !t.deleted && t.status === 'in-review');
  
  select.innerHTML = availableTasks.map(task => `
    <option value="${task.id}">${task.taskId} - ${task.name}</option>
  `).join('');

  modal.classList.add('sky-active');
}

if (closeReviewModal) {
  closeReviewModal.addEventListener('click', () => {
    reviewModal.classList.remove('sky-active');
  });
}

if (cancelReview) {
  cancelReview.addEventListener('click', () => {
    reviewModal.classList.remove('sky-active');
  });
}

if (confirmReview) {
  confirmReview.addEventListener('click', () => {
    const taskId = parseInt(reviewTaskSelect.value);
    const comments = reviewComments.value;
    const status = reviewStatus.value;

    if (!comments) {
      alert('Please provide review comments');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      if (status === 'approved') {
        task.status = 'completed';
        task.completed = true;
      } else if (status === 'needs-changes') {
        task.status = 'in-progress';
      } else if (status === 'reject') {
        task.status = 'rejected';
        task.rejected = true;
      }

      if (!task.comments) task.comments = [];
      const newComment: TaskComment = {
        id: Date.now(),
        text: `Review (${status}): ${comments}`,
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

(window as any).showDeletedTasks = function(): void {
  currentFilter = 'deleted';
  document.querySelectorAll('.sky-chip-filter').forEach(c => c.classList.remove('sky-active'));
  (document.querySelector('.sky-chip-filter[data-filter="deleted"]') as HTMLElement).classList.add('sky-active');
  renderTasks();
};

(window as any).openBulkView = function(): void {
  alert('Bulk view functionality - would show selected tasks in a separate view');
};

// Show/Hide Completed Tasks
if (showCompletedTasks) {
  showCompletedTasks.addEventListener('change', renderTasks);
}

// Pagination
if (pageSizeSelect) {
  pageSizeSelect.addEventListener('change', () => {
    currentPage = 1;
    renderTasks();
  });
}

if (prevPageBtn) {
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTasks();
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener('click', () => {
    currentPage++;
    renderTasks();
  });
}

// Legend clicks
document.querySelectorAll('.sky-legend-item[data-filter]').forEach(item => {
  item.addEventListener('click', function(this: HTMLElement) {
    const filter = this.dataset.filter;
    if (filter) {
      document.querySelectorAll('.sky-chip-filter').forEach(c => c.classList.remove('sky-active'));
      (document.querySelector(`.sky-chip-filter[data-filter="${filter}"]`) as HTMLElement).classList.add('sky-active');
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
