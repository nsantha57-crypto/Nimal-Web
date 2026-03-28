// State Management
let state = {
    school: {
        name: "දහම් පාසල",
        address: "ලිපිනය මෙතන",
        phones: ["011-2345678", "011-8765432", "071-1234567"],
        motto: "ගුරු දේවෝ භව",
        logo: "https://via.placeholder.com/150",
        hours: {
            arrival: "07:30 - 08:00",
            break: "10:30",
            off: "12:00"
        }
    },
    students: [],
    teachers: [],
    leaders: [],
    attendance: {
        students: {}, 
        teachers: {},
        leaders: {},
        gilanpasa: {}
    },
    points: {
        mal: {}, // {date: {grade: {studentId: points}}}
        gilanpasa: {}
    },
    exams: {},
    notices: []
};

// Initialize State
function init() {
    const savedState = localStorage.getItem('nimal_web_state');
    if (savedState) {
        state = JSON.parse(savedState);
    }
    renderView('dashboard');
    updateSchoolInfo();
    updateDate();
}

function saveState() {
    localStorage.setItem('nimal_web_state', JSON.stringify(state));
    alert('දත්ත සුරැකිණි!');
}

// UI Utilities
function $(id) { return document.getElementById(id); }

function updateDate() {
    const now = new Date();
    $('current-date').textContent = now.toLocaleDateString('si-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function updateSchoolInfo() {
    $('sidebar-school-name').textContent = state.school.name;
    const logoContainer = $('school-logo-svg');
    if (state.school.logo.startsWith('data:image')) {
        logoContainer.innerHTML = `<img src="${state.school.logo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
}

// Navigation Logic
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all
            navItems.forEach(i => i.classList.remove('active'));
            
            const view = item.getAttribute('data-view');
            
            // Add active to all items with this view (sync desktop/mobile)
            document.querySelectorAll(`[data-view="${view}"]`).forEach(i => i.classList.add('active'));
            
            renderView(view);
            if (window.innerWidth <= 1024) {
                $('sidebar').classList.remove('open');
            }
        });
    });
}
setupNavigation();

$('menu-toggle').addEventListener('click', () => {
    $('sidebar').classList.add('open');
});

$('close-sidebar').addEventListener('click', () => {
    $('sidebar').classList.remove('open');
});

$('save-all-btn').addEventListener('click', saveState);

// View Rendering
function renderView(view) {
    const container = $('view-container');
    const title = $('current-view-title');
    container.innerHTML = '';
    
    switch(view) {
        case 'dashboard':
            title.textContent = 'මුල පිටුව';
            renderDashboard(container);
            break;
        case 'students':
            title.textContent = 'සිසුන් කළමනාකරණය';
            renderStudents(container);
            break;
        case 'teachers':
            title.textContent = 'ගුරුවරුන් කළමනාකරණය';
            renderTeachers(container);
            break;
        case 'leaders':
            title.textContent = 'ශිෂ්‍ය නායකයින්';
            renderLeaders(container);
            break;
        case 'attendance':
            title.textContent = 'පැමිණීම සටහන් කිරීම';
            renderAttendance(container);
            break;
        case 'points':
            title.textContent = 'ලකුණු (මල් / ගිලන්පස)';
            renderPoints(container);
            break;
        case 'exams':
            title.textContent = 'විභාග ලකුණු';
            renderExams(container);
            break;
        case 'interviews':
            title.textContent = 'ශිෂ්‍ය නායක සම්මුඛ පරීක්ෂණ';
            renderInterviews(container);
            break;
        case 'notices':
            title.textContent = 'දැන්වීම් පුවරුව';
            renderNotices(container);
            break;
        case 'settings':
            title.textContent = 'පද්ධති කළමනාකරණය';
            renderSettings(container);
            break;
    }
    lucide.createIcons();
}

// Add these utility functions to calculate totals
function getTotalPoints(studentIdx, type) {
    let total = 0;
    const typePoints = state.points[type] || {};
    for (let date in typePoints) {
        for (let grade in typePoints[date]) {
            if (typePoints[date][grade][studentIdx] !== undefined) {
                total += parseInt(typePoints[date][grade][studentIdx]);
            }
        }
    }
    return total;
}

function getAttendanceSummary(type) {
    const today = new Date().toISOString().split('T')[0];
    const dateAtt = state.attendance[type][today] || {};
    let present = 0;
    
    // Check if type exists in state.attendance
    if (!state.attendance[type]) return { present: 0, total: 0 };

    let total = type === 'students' ? state.students.length : (type === 'teachers' ? state.teachers.length : state.leaders.length);
    
    for (let idx in dateAtt) {
        if (dateAtt[idx] === 'present') present++;
    }
    return { present, total };
}

// ---------------- DASHBOARD VIEW ----------------
function renderDashboard(container) {
    const sAtt = getAttendanceSummary('students');
    const tAtt = getAttendanceSummary('teachers');
    const lAtt = getAttendanceSummary('leaders');

    container.innerHTML = `
        <div class="hero-section">
            <div class="hero-content">
                <h2>ආයුබෝවන්! 🙏</h2>
                <p>${state.school.name} කළමනාකරණ පද්ධතිය වෙත සාදරයෙන් පිළිගනිමු.</p>
                <div style="margin-top: 20px;">
                    <span class="badge" style="background: rgba(255,255,255,0.2); color: white;">${state.school.motto}</span>
                </div>
            </div>
            <i data-lucide="sun" class="hero-deco"></i>
        </div>
        
        <div class="grid-3">
            <div class="stat-card" onclick="renderView('students')">
                <i data-lucide="users" style="color: var(--primary-color)"></i>
                <span class="count">${state.students.length}</span>
                <span class="label">මුළු සිසුන්</span>
                <div class="attendance-summary" style="margin-top:10px; font-size:0.85rem; color:var(--text-secondary)">අද පැමිණීම: <strong>${sAtt.present}/${sAtt.total}</strong></div>
            </div>
            <div class="stat-card" onclick="renderView('teachers')">
                <i data-lucide="user-cog" style="color: var(--teacher-color)"></i>
                <span class="count">${state.teachers.length}</span>
                <span class="label">ගුරුවරුන්</span>
                <div class="attendance-summary" style="margin-top:10px; font-size:0.85rem; color:var(--text-secondary)">අද පැමිණීම: <strong>${tAtt.present}/${tAtt.total}</strong></div>
            </div>
            <div class="stat-card" onclick="renderView('leaders')">
                <i data-lucide="award" style="color: var(--leader-color)"></i>
                <span class="count">${state.leaders.length}</span>
                <span class="label">නායකයින්</span>
                <div class="attendance-summary" style="margin-top:10px; font-size:0.85rem; color:var(--text-secondary)">අද පැමිණීම: <strong>${lAtt.present}/${lAtt.total}</strong></div>
            </div>
        </div>

        <div style="margin-top: 30px;" class="grid-2">
            <div class="card">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <i data-lucide="zap" style="color: var(--leader-color)"></i>
                    <h3 style="margin:0">ක්ෂණික ක්‍රියාමාර්ග</h3>
                </div>
                <div class="grid-2">
                    <button class="btn-secondary" onclick="showStudentModal()" style="justify-content: flex-start; gap: 10px; display: flex;"><i data-lucide="user-plus"></i> සිසුවෙකු එක් කරන්න</button>
                    <button class="btn-secondary" onclick="renderView('attendance')" style="justify-content: flex-start; gap: 10px; display: flex;"><i data-lucide="check-square"></i> පැමිණීම සලකුණු කරන්න</button>
                    <button class="btn-secondary" onclick="renderView('points')" style="justify-content: flex-start; gap: 10px; display: flex;"><i data-lucide="sparkles"></i> ලකුණු ඇතුළත් කරන්න</button>
                    <button class="btn-secondary" onclick="renderView('notices')" style="justify-content: flex-start; gap: 10px; display: flex;"><i data-lucide="megaphone"></i> දැන්වීමක් යවන්න</button>
                </div>
            </div>
            <div class="card">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <i data-lucide="clock" style="color: var(--primary-color)"></i>
                    <h3 style="margin:0">පාසල් කාලසටහන</h3>
                </div>
                <div class="grid-3">
                    <div class="input-group">
                        <label>පැමිණීම:</label>
                        <p style="font-weight: 600;">${state.school.hours.arrival}</p>
                    </div>
                    <div class="input-group">
                        <label>විවේකය:</label>
                        <p style="font-weight: 600;">${state.school.hours.break}</p>
                    </div>
                    <div class="input-group">
                        <label>නිමාව:</label>
                        <p style="font-weight: 600;">${state.school.hours.off}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

// ---------------- STUDENTS VIEW ----------------
function renderStudents(container) {
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>සිසුන් ලේඛනය</h3>
                <button class="btn-primary" onclick="showStudentModal()">අලුත් සිසුවෙකු එකතු කරන්න</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>නම</th>
                            <th>මල්/ගිලන්පස ලකුණු</th>
                            <th>පන්තිය</th>
                            <th>වට්ස්ඇප්</th>
                            <th>ක්‍රියාමාර්ග</th>
                        </tr>
                    </thead>
                    <tbody id="students-table-body">
                        ${state.students.map((s, index) => `
                            <tr>
                                <td>${s.name}</td>
                                <td>
                                    <div style="display:flex; gap:5px;">
                                        <span class="badge badge-success">M: ${getTotalPoints(index, 'mal')}</span>
                                        <span class="badge badge-warning">G: ${getTotalPoints(index, 'gilanpasa')}</span>
                                    </div>
                                </td>
                                <td>${s.grade}</td>
                                <td>${s.whatsapp}</td>
                                <td>
                                    <div class="action-btns">
                                        <button class="action-btn btn-edit" onclick="editStudent(${index})"><i data-lucide="edit"></i></button>
                                        <button class="action-btn btn-delete" onclick="deleteStudent(${index})"><i data-lucide="trash-2"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showStudentModal(index = null) {
    const isEdit = index !== null;
    const student = isEdit ? state.students[index] : { name: '', dob: '', address: '', whatsapp: '', guardian: '', guardianWhatsapp: '', grade: '' };
    
    $('modal-title').textContent = isEdit ? 'සිසුවා සංස්කරණය' : 'නව සිසුවෙකු ඇතුළත් කිරීම';
    $('modal-body').innerHTML = `
        <div class="input-group"><label>නම:</label><input type="text" id="s-name" value="${student.name}"></div>
        <div class="grid-2">
            <div class="input-group"><label>උපන්දිනය:</label><input type="date" id="s-dob" value="${student.dob}"></div>
            <div class="input-group"><label>පන්තිය:</label><input type="text" id="s-grade" value="${student.grade}"></div>
        </div>
        <div class="input-group"><label>ලිපිනය:</label><textarea id="s-address">${student.address}</textarea></div>
        <div class="grid-2">
            <div class="input-group"><label>වට්ස්ඇප් අංකය:</label><input type="text" id="s-whatsapp" value="${student.whatsapp}"></div>
            <div class="input-group"><label>භාරකරුගේ නම:</label><input type="text" id="s-guardian" value="${student.guardian}"></div>
        </div>
        <div class="input-group"><label>භාරකරුගේ වට්ස්ඇප් අංකය:</label><input type="text" id="s-g-whatsapp" value="${student.guardianWhatsapp}"></div>
    `;
    
    $('modal-save-btn').onclick = () => {
        const newData = {
            name: $('s-name').value,
            dob: $('s-dob').value,
            grade: $('s-grade').value,
            address: $('s-address').value,
            whatsapp: $('s-whatsapp').value,
            guardian: $('s-guardian').value,
            guardianWhatsapp: $('s-g-whatsapp').value
        };
        if (isEdit) state.students[index] = newData;
        else state.students.push(newData);
        closeModal();
        renderView('students');
    };
    
    $('modal-container').classList.remove('hidden');
    lucide.createIcons();
}

// ---------------- TEACHERS VIEW ----------------
function renderTeachers(container) {
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>ගුරුවරුන් ලේඛනය</h3>
                <button class="btn-primary" onclick="showTeacherModal()">අලුත් ගුරුවරයෙකු එකතු කරන්න</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>නම</th>
                            <th>ලිපිනය</th>
                            <th>භාර ශ්‍රේණිය</th>
                            <th>තනතුර</th>
                            <th>ක්‍රියාමාර්ග</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.teachers.map((t, index) => `
                            <tr>
                                <td>${t.name}</td>
                                <td>${t.address}</td>
                                <td>${t.gradeInCharge}</td>
                                <td>${t.designation}</td>
                                <td>
                                    <div class="action-btns">
                                        <button class="action-btn btn-edit" onclick="editTeacher(${index})"><i data-lucide="edit"></i></button>
                                        <button class="action-btn btn-delete" onclick="deleteTeacher(${index})"><i data-lucide="trash-2"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showTeacherModal(index = null) {
    const isEdit = index !== null;
    const teacher = isEdit ? state.teachers[index] : { name: '', address: '', whatsapp: '', gradeInCharge: '', designation: '' };
    
    $('modal-title').textContent = isEdit ? 'ගුරුවරයා සංස්කරණය' : 'නව ගුරුවරයෙකු ඇතුළත් කිරීම';
    $('modal-body').innerHTML = `
        <div class="input-group"><label>නම:</label><input type="text" id="t-name" value="${teacher.name}"></div>
        <div class="input-group"><label>ලිපිනය:</label><textarea id="t-address">${teacher.address}</textarea></div>
        <div class="grid-2">
            <div class="input-group"><label>වට්ස්ඇප් අංකය:</label><input type="text" id="t-whatsapp" value="${teacher.whatsapp}"></div>
            <div class="input-group"><label>තනතුර:</label><input type="text" id="t-designation" value="${teacher.designation}"></div>
        </div>
        <div class="input-group"><label>භාර ශ්‍රේණිය:</label><input type="text" id="t-grade" value="${teacher.gradeInCharge}"></div>
    `;
    
    $('modal-save-btn').onclick = () => {
        const newData = {
            name: $('t-name').value,
            address: $('t-address').value,
            whatsapp: $('t-whatsapp').value,
            designation: $('t-designation').value,
            gradeInCharge: $('t-grade').value
        };
        if (isEdit) state.teachers[index] = newData;
        else state.teachers.push(newData);
        closeModal();
        renderView('teachers');
    };
    
    $('modal-container').classList.remove('hidden');
    lucide.createIcons();
}

// ---------------- LEADERS VIEW ----------------
function renderLeaders(container) {
    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>ශිෂ්‍ය නායක නාම ලේඛනය</h3>
                <button class="btn-primary" onclick="showLeaderModal()">නායකයෙකු එකතු කරන්න</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>නම</th>
                            <th>පන්තිය</th>
                            <th>තනතුර</th>
                            <th>මුළු ලකුණු (මල්/නිමාව)</th>
                            <th>ක්‍රියාමාර්ග</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.leaders.map((l, index) => {
                            // Find student index by name to get aggregated points
                            const studentIdx = state.students.findIndex(s => s.name === l.name);
                            const mPoints = studentIdx !== -1 ? getTotalPoints(studentIdx, 'mal') : 0;
                            const gPoints = studentIdx !== -1 ? getTotalPoints(studentIdx, 'gilanpasa') : 0;

                            return `
                                <tr>
                                    <td>${l.name}</td>
                                    <td>${l.grade}</td>
                                    <td><span class="badge ${l.rank === 'Pradhana' ? 'badge-success' : 'badge-warning'}">${l.rank}</span></td>
                                    <td>
                                        <div style="display:flex; gap:5px;">
                                            <span class="badge badge-success">M: ${mPoints}</span>
                                            <span class="badge badge-warning">G: ${gPoints}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="action-btns">
                                            <button class="action-btn btn-edit" onclick="editLeader(${index})"><i data-lucide="edit"></i></button>
                                            <button class="action-btn btn-delete" onclick="deleteLeader(${index})"><i data-lucide="trash-2"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showLeaderModal(index = null) {
    const isEdit = index !== null;
    const leader = isEdit ? state.leaders[index] : { name: '', grade: '', rank: 'Samanya', malPoints: 0, gilanpasaPoints: 0 };
    
    $('modal-title').textContent = 'ශිෂ්‍ය නායක දත්ත';
    $('modal-body').innerHTML = `
        <div class="input-group"><label>නම:</label><input type="text" id="l-name" value="${leader.name}"></div>
        <div class="grid-2">
            <div class="input-group"><label>පන්තිය:</label><input type="text" id="l-grade" value="${leader.grade}"></div>
            <div class="input-group"><label>තනතුර:</label>
                <select id="l-rank">
                    <option value="Pradhana" ${leader.rank === 'Pradhana' ? 'selected' : ''}>ප්‍රධාන</option>
                    <option value="Upa Pradhan" ${leader.rank === 'Upa Pradhan' ? 'selected' : ''}>උප ප්‍රධාන</option>
                    <option value="Nayaka" ${leader.rank === 'Nayaka' ? 'selected' : ''}>නායක</option>
                    <option value="Nayika" ${leader.rank === 'Nayika' ? 'selected' : ''}>නායිකා</option>
                    <option value="Samanya" ${leader.rank === 'Samanya' ? 'selected' : ''}>සාමාන්‍ය</option>
                    <option value="Pariwasa" ${leader.rank === 'Pariwasa' ? 'selected' : ''}>පරිවාස</option>
                </select>
            </div>
        </div>
    `;
    
    $('modal-save-btn').onclick = () => {
        const newData = {
            ...leader,
            name: $('l-name').value,
            grade: $('l-grade').value,
            rank: $('l-rank').value
        };
        if (isEdit) state.leaders[index] = newData;
        else state.leaders.push(newData);
        closeModal();
        renderView('leaders');
    };
    
    $('modal-container').classList.remove('hidden');
    lucide.createIcons();
}

// ---------------- ATTENDANCE VIEW ----------------
let attendanceTab = 'students';
let attendanceDate = new Date().toISOString().split('T')[0];

function renderAttendance(container) {
    container.innerHTML = `
        <div class="card">
            <div class="grid-2">
                <div class="input-group">
                    <label>දිනය තෝරන්න:</label>
                    <input type="date" id="att-date" value="${attendanceDate}" onchange="attendanceDate = this.value; renderAttendance($('view-container'))">
                </div>
            </div>
            
            <div class="tab-container" style="margin-top: 20px;">
                <button class="tab-btn ${attendanceTab === 'students' ? 'active' : ''}" onclick="attendanceTab = 'students'; renderAttendance($('view-container'))">සිසුන්</button>
                <button class="tab-btn ${attendanceTab === 'teachers' ? 'active' : ''}" onclick="attendanceTab = 'teachers'; renderAttendance($('view-container'))">ගුරුවරුන්</button>
                <button class="tab-btn ${attendanceTab === 'leaders' ? 'active' : ''}" onclick="attendanceTab = 'leaders'; renderAttendance($('view-container'))">නායකයින්</button>
                <button class="tab-btn ${attendanceTab === 'gilanpasa' ? 'active' : ''}" onclick="attendanceTab = 'gilanpasa'; renderAttendance($('view-container'))">ගිලන්පස</button>
            </div>

            <div class="table-container" style="margin-top: 20px;">
                <table>
                    <thead>
                        <tr>
                            <th>නම</th>
                            ${attendanceTab === 'students' ? '<th>පන්තිය</th>' : ''}
                            <th>පැමිණීම</th>
                            <th>ක්‍රියාමාර්ග</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderAttendanceRows()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function renderAttendanceRows() {
    let list = [];
    if (attendanceTab === 'students') list = state.students;
    else if (attendanceTab === 'teachers') list = state.teachers;
    else if (attendanceTab === 'leaders') list = state.leaders;
    else if (attendanceTab === 'gilanpasa') list = state.students; // Mal/Gilanpasa attendance

    if (list.length === 0) return '<tr><td colspan="4" style="text-align:center">දත්ත නොමැත</td></tr>';

    return list.map((item, index) => {
        const dateAtt = state.attendance[attendanceTab][attendanceDate] || {};
        const status = dateAtt[index] || 'absent';
        return `
            <tr>
                <td>${item.name}</td>
                ${attendanceTab === 'students' ? `<td>${item.grade}</td>` : ''}
                <td>
                    <div class="att-toggle">
                        <button class="att-btn ${status === 'present' ? 'present-active' : ''}" onclick="updateAttendance('${attendanceDate}', ${index}, 'present', '${attendanceTab}')">පැමිණ ඇත</button>
                        <button class="att-btn ${status === 'absent' ? 'absent-active' : ''}" onclick="updateAttendance('${attendanceDate}', ${index}, 'absent', '${attendanceTab}')">නැත</button>
                    </div>
                </td>
                <td>
                    ${status === 'absent' && (attendanceTab === 'students' || attendanceTab === 'teachers') ? 
                        `<button class="btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="sendAbsentAlert(${index}, '${attendanceTab}')"><i data-lucide="message-square" style="width:14px; height:14px;"></i> Alert</button>` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

function updateAttendance(date, index, status, type) {
    if (!state.attendance[type][date]) state.attendance[type][date] = {};
    state.attendance[type][date][index] = status;
    saveStateQuietly();
    renderAttendance($('view-container'));
}

function saveStateQuietly() {
    localStorage.setItem('nimal_web_state', JSON.stringify(state));
}

// ---------------- POINTS VIEW ----------------
let pointsType = 'mal'; // mal or gilanpasa
let pointsGrade = '';
let pointsDate = new Date().toISOString().split('T')[0];

function renderPoints(container) {
    const grades = [...new Set(state.students.map(s => s.grade))];
    container.innerHTML = `
        <div class="card">
            <div class="grid-3">
                <div class="input-group">
                    <label>දිනය:</label>
                    <input type="date" value="${pointsDate}" onchange="pointsDate = this.value; renderPoints($('view-container'))">
                </div>
                <div class="input-group">
                    <label>ලකුණු වර්ගය:</label>
                    <select onchange="pointsType = this.value; renderPoints($('view-container'))">
                        <option value="mal" ${pointsType === 'mal' ? 'selected' : ''}>මල් ලකුණු</option>
                        <option value="gilanpasa" ${pointsType === 'gilanpasa' ? 'selected' : ''}>ගිලන්පස පූජා ලකුණු</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>පන්තිය:</label>
                    <select onchange="pointsGrade = this.value; renderPoints($('view-container'))">
                        <option value="">සියලුම</option>
                        ${grades.map(g => `<option value="${g}" ${pointsGrade === g ? 'selected' : ''}>${g}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="table-container" style="margin-top: 20px;">
                <table>
                    <thead>
                        <tr>
                            <th>සිසුවාගේ නම</th>
                            <th>ලකුණු</th>
                            <th>ක්‍රියාමාර්ග</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderPointsRows()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function renderPointsRows() {
    const filteredStudents = pointsGrade ? state.students.filter(s => s.grade === pointsGrade) : state.students;
    if (filteredStudents.length === 0) return '<tr><td colspan="3" style="text-align:center">සිසුන් තෝරා නැත</td></tr>';

    return filteredStudents.map((s, idx) => {
        const studentIdx = state.students.indexOf(s);
        const currentPoints = ((state.points[pointsType][pointsDate] || {})[s.grade] || {})[studentIdx] || 0;
        const total = getTotalPoints(studentIdx, pointsType);
        
        return `
            <tr>
                <td><strong>${s.name}</strong> <span style="font-size: 0.8rem; opacity: 0.7;">(${s.grade})</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="number" value="${currentPoints}" style="width: 70px; text-align:center;" onchange="updatePoints(${studentIdx}, '${s.grade}', this.value)">
                        <span style="font-size:0.85rem; color:var(--text-secondary)">මුළු: ${total}</span>
                    </div>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn-primary" style="padding: 6px 12px; font-size:0.9rem;" onclick="updatePoints(${studentIdx}, '${s.grade}', 1, true)">+1 එක් කරන්න</button>
                        <button class="btn-secondary" style="padding: 6px 12px; font-size:0.9rem;" onclick="updatePoints(${studentIdx}, '${s.grade}', -1, true)">-1</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updatePoints(studentIdx, grade, val, increment = false) {
    if (!state.points[pointsType][pointsDate]) state.points[pointsType][pointsDate] = {};
    if (!state.points[pointsType][pointsDate][grade]) state.points[pointsType][pointsDate][grade] = {};
    
    let current = parseInt(state.points[pointsType][pointsDate][grade][studentIdx] || 0);
    if (increment) state.points[pointsType][pointsDate][grade][studentIdx] = current + 1;
    else state.points[pointsType][pointsDate][grade][studentIdx] = parseInt(val);
    
    saveStateQuietly();
    renderPoints($('view-container'));
}

function sendAbsentAlert(index) {
    const student = state.students[index];
    const msg = `නිවේදනය: ${state.school.name} - අද දින (${new Date().toLocaleDateString()}) ${student.name} සිසුවා/සිසුවිය දහම් පාසල් පැමිණ නොමැති බව කාරුණිකව දන්වමු.`;
    const url = `https://wa.me/${student.guardianWhatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

// ---------------- SETTINGS VIEW ----------------
function renderSettings(container) {
    container.innerHTML = `
        <div class="card">
            <h3>පාසල් සැකසුම්</h3>
            <div class="grid-2">
                <div class="input-group"><label>පාසලේ නම:</label><input type="text" id="set-name" value="${state.school.name}"></div>
                <div class="input-group"><label>පාසල් තේමාව:</label><input type="text" id="set-motto" value="${state.school.motto}"></div>
            </div>
            <div class="input-group"><label>ලිපිනය:</label><textarea id="set-address">${state.school.address}</textarea></div>
            <div class="grid-3">
                <div class="input-group"><label>දුරකථන 1:</label><input type="text" id="set-p1" value="${state.school.phones[0]}"></div>
                <div class="input-group"><label>දුරකථන 2:</label><input type="text" id="set-p2" value="${state.school.phones[1]}"></div>
                <div class="input-group"><label>දුරකථන 3:</label><input type="text" id="set-p3" value="${state.school.phones[2]}"></div>
            </div>
            <div class="grid-3">
                <div class="input-group"><label>පැමිණීම:</label><input type="text" id="set-arr" value="${state.school.hours.arrival}"></div>
                <div class="input-group"><label>විවේකය:</label><input type="text" id="set-break" value="${state.school.hours.break}"></div>
                <div class="input-group"><label>නිමාව:</label><input type="text" id="set-off" value="${state.school.hours.off}"></div>
            </div>
            <button class="btn-primary" onclick="updateSettings()">සැකසුම් සුරකින්න</button>
        </div>
        <div class="card" style="border: 1px solid var(--danger-color);">
            <h3 style="color: var(--danger-color);">අන්තරාදායක කලාපය</h3>
            <p>සියලුම දත්ත මකා දැමීම සඳහා පහත බොත්තම ඔබන්න.</p>
            <button class="btn-secondary" style="background: var(--danger-color); color: white; margin-top: 10px;" onclick="resetAllData()">සියලු දත්ත මකන්න</button>
        </div>
    `;
}

function updateSettings() {
    state.school.name = $('set-name').value;
    state.school.motto = $('set-motto').value;
    state.school.address = $('set-address').value;
    state.school.phones = [$('set-p1').value, $('set-p2').value, $('set-p3').value];
    state.school.hours = {
        arrival: $('set-arr').value,
        break: $('set-break').value,
        off: $('set-off').value
    };
    updateSchoolInfo();
    alert('සැකසුම් යාවත්කාලීන විය!');
}

function resetAllData() {
    if (confirm('ඔබට විශ්වාසද? සියලුම දත්ත මැකී යනු ඇත.')) {
        localStorage.removeItem('nimal_web_state');
        location.reload();
    }
}

// ---------------- EXAMS & INTERVIEWS (Simplified for now) ----------------
function renderExams(container) {
    container.innerHTML = `
        <div class="card">
            <h3>වාර විභාග ලකුණු</h3>
            <p>සිසුන්ගේ වාර විභාග ලකුණු මෙතැනින් ඇතුළත් කර ශ්‍රේණිගත කිරීම් සිදුකල හැක.</p>
            <!-- Implementation details would go here -->
            <div class="grid-2" style="margin-top: 20px;">
                <div class="input-group"><label>ශ්‍රේණිය:</label><select id="exam-grade"><option>පන්තිය තෝරන්න</option></select></div>
                <div class="input-group"><label>වාරය:</label><select><option>1 වන වාරය</option><option>2 වන වාරය</option><option>3 වන වාරය</option></select></div>
            </div>
            <button class="btn-primary">වාර්තාවක් ලබාගන්න (PDF)</button>
        </div>
    `;
}

function renderInterviews(container) {
    container.innerHTML = `
        <div class="card">
            <h3>ශිෂ්‍ය නායක සම්මුඛ පරීක්ෂණ පුවරුව</h3>
            <div class="grid-2">
                <div class="input-group"><label>සිසුවාගේ නම:</label><input type="text" placeholder="නම"></div>
                <div class="input-group"><label>පන්තිය:</label><input type="text" placeholder="පන්තිය"></div>
            </div>
            <div class="grid-3">
                <div class="input-group"><label>පැමිණීම (1-20):</label><input type="number" min="0" max="20"></div>
                <div class="input-group"><label>සහතික (1-10):</label><input type="number" min="0" max="10"></div>
                <div class="input-group"><label>පිරිසිදුකම (1-10):</label><input type="number" min="0" max="10"></div>
                <div class="input-group"><label>විනය (1-10):</label><input type="number" min="0" max="10"></div>
                <div class="input-group"><label>කථික (1-10):</label><input type="number" min="0" max="10"></div>
                <div class="input-group"><label>නිපුණතා (1-10):</label><input type="number" min="0" max="10"></div>
            </div>
            <button class="btn-primary">ලකුණු එකතු කරන්න</button>
        </div>
    `;
}

function renderNotices(container) {
    container.innerHTML = `
        <div class="card">
            <h3>නව දැන්වීමක් පළ කරන්න</h3>
            <div class="input-group"><label>පණිවිඩය:</label><textarea id="notice-msg"></textarea></div>
            <div class="input-group"><label>යොමු කළ යුත්තේ:</label>
                <select id="notice-target">
                    <option value="all">සියලු දෙනාටම</option>
                    <option value="teachers">ගුරුවරුන්ට පමණි</option>
                    <option value="parents">දෙමාපියන්ට පමණි</option>
                </select>
            </div>
            <button class="btn-primary" onclick="alert('දැන්වීම යවන ලදී!')">දැන්වීම පළ කරන්න</button>
        </div>
    `;
}

// ---------------- CRUD UTILS ----------------
function closeModal() { $('modal-container').classList.add('hidden'); }
function deleteStudent(index) { if(confirm('මකා දැමීමට අවශ්‍යද?')) { state.students.splice(index, 1); renderView('students'); } }
function editStudent(index) { showStudentModal(index); }
function deleteTeacher(index) { if(confirm('මකා දැමීමට අවශ්‍යද?')) { state.teachers.splice(index, 1); renderView('teachers'); } }
function editTeacher(index) { showTeacherModal(index); }
function deleteLeader(index) { if(confirm('මකා දැමීමට අවශ්‍යද?')) { state.leaders.splice(index, 1); renderView('leaders'); } }
function editLeader(index) { showLeaderModal(index); }

// Logo Upload
$('logo-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            state.school.logo = event.target.result;
            updateSchoolInfo();
        };
        reader.readAsDataURL(file);
    }
});

// PWA Install logic stub
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $('install-btn').style.display = 'flex';
});

$('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Registration Failed', err));
    });
}

// Start the app
init();
