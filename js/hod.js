import { db, auth } from './firebase.js';
import { collection, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// ✅ Reference to table body
const tbody = document.getElementById('hodRequests');
const logoutBtn = document.getElementById('logoutBtn');

// ✅ Fetch requests forwarded by staff (pending HOD approval)
async function loadRequests() {
  tbody.innerHTML = '<tr><td colspan="7">Loading requests...</td></tr>';
  try {
    const snapshot = await getDocs(collection(db, 'outpassRequests'));
    tbody.innerHTML = '';

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.staffStatus === 'approved' && data.hodStatus === 'pending') {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${docSnap.id}</td>
          <td>${data.studentId}</td>
          <td>${data.reason}</td>
          <td>${data.fromDate}</td>
          <td>${data.toDate}</td>
          <td><span class="status approved">${data.staffStatus.toUpperCase()}</span></td>
          <td>
            <button class="btn" style="background:#059669" onclick="approveRequest('${docSnap.id}')">Approve</button>
            <button class="btn" style="background:#ef4444; margin-left:6px;" onclick="rejectRequest('${docSnap.id}')">Reject</button>
          </td>
        `;
        tbody.appendChild(row);
      }
    });

    if (tbody.innerHTML.trim() === '') {
      tbody.innerHTML = '<tr><td colspan="7">No pending requests found.</td></tr>';
    }
  } catch (error) {
    console.error('Error loading requests:', error);
    tbody.innerHTML = '<tr><td colspan="7">Error loading data.</td></tr>';
  }
}

// ✅ Approve request
window.approveRequest = async function (id) {
  try {
    await updateDoc(doc(db, 'outpassRequests', id), { hodStatus: 'approved' });
    alert('Request approved!');
    loadRequests();
  } catch (err) {
    alert('Error approving request');
    console.error(err);
  }
};

// ✅ Reject request
window.rejectRequest = async function (id) {
  try {
    await updateDoc(doc(db, 'outpassRequests', id), { hodStatus: 'rejected' });
    alert('Request rejected.');
    loadRequests();
  } catch (err) {
    alert('Error rejecting request');
    console.error(err);
  }
};

// ✅ Logout
logoutBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = 'hod_login.html';
});

// ✅ Load on start
loadRequests();
