const apiUrl = 'http://localhost:3000/assignments';

document.addEventListener('DOMContentLoaded', () => {
    fetchAssignments();

    document.getElementById('assignmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addAssignment();
    });
});

async function fetchAssignments() {
    const response = await fetch(apiUrl);
    const assignments = await response.json();
    const assignmentList = document.getElementById('assignmentList');
    assignmentList.innerHTML = '';
    assignments.forEach(assignment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.name}</td>
            <td>${assignment.roll_no}</td>
            <td>${assignment.course}</td>
            <td><a href="${assignment.assignment_attachment}" target="_blank">View Attachment</a></td>
            <td class="actions">
                <button onclick="deleteAssignment('${assignment._id}')">Delete</button>
                <button onclick="updateAssignment('${assignment._id}', '${assignment.name}', '${assignment.roll_no}', '${assignment.course}')">Update</button>
            </td>
        `;
        assignmentList.appendChild(row);
    });
}

async function addAssignment() {
    const name = document.getElementById('name').value;
    const roll_no = document.getElementById('roll_no').value;
    const course = document.getElementById('course').value;
    const assignment_attachment = document.getElementById('assignment_attachment').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('roll_no', roll_no);
    formData.append('course', course);
    formData.append('assignment_attachment', assignment_attachment);

    const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        document.getElementById('assignmentForm').reset();
        fetchAssignments();
    }
}

async function deleteAssignment(id) {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        fetchAssignments();
    }
}

async function updateAssignment(id, currentName, currentRollNo, currentCourse) {
    const updatedName = prompt('Enter updated name:', currentName);
    const updatedRollNo = prompt('Enter updated roll number:', currentRollNo);
    const updatedCourse = prompt('Enter updated course:', currentCourse);

    const formData = new FormData();
    formData.append('name', updatedName);
    formData.append('roll_no', updatedRollNo);
    formData.append('course', updatedCourse);
    const updatedAttachment = document.getElementById('assignment_attachment').files[0];
    if (updatedAttachment) {
        formData.append('assignment_attachment', updatedAttachment);
    }

    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PATCH',
        body: formData
    });

    if (response.ok) {
        fetchAssignments();
    }
}
