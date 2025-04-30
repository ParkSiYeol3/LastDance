// frontend/item-detail.js
import axios from 'axios';
import { API_URL } from './firebase-config.js';

const itemDetailEl = document.getElementById('item-detail');
const requestBtn = document.getElementById('rental-request-btn');

const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');

let currentUser = null;
let currentItem = null;

window.addEventListener('DOMContentLoaded', async () => {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!itemId) {
    itemDetailEl.innerHTML = '<p>아이템 ID가 없습니다.</p>';
    return;
  }
  await loadItemDetail();
  await loadComments();
  await loadRentalHistory();
});

async function getAccessToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('로그인이 필요합니다.');
  return token;
}

async function loadItemDetail() {
  try {
    const res = await axios.get(`${API_URL}/api/items/${itemId}`);
    const item = res.data.item;
    currentItem = item;

    const isOwner = currentUser && currentUser.uid === item.userId;

    itemDetailEl.innerHTML = `
      <div class="item-card">
        <h2>${item.name}</h2>
        <p><strong>설명:</strong> ${item.description}</p>
        ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}" />` : ''}
        ${isOwner ? `
          <div class="action-buttons">
            <button id="edit-btn">수정</button>
            <button id="delete-btn" class="danger">삭제</button>
          </div>` : ''}
      </div>
      <div id="comment-section"><h3>💬 댓글</h3><div id="comments"></div></div>
      <div id="rental-history-section"><h3>📜 대여 기록</h3><div id="rental-log"></div></div>
    `;

    if (isOwner) {
      document.getElementById('edit-btn').addEventListener('click', () => showEditForm(item));
      document.getElementById('delete-btn').addEventListener('click', deleteItem);
    } else if (currentUser) {
      requestBtn.style.display = 'inline-block';
      requestBtn.addEventListener('click', handleRentalRequest);
    }
  } catch (error) {
    console.error('아이템 로딩 오류:', error);
    itemDetailEl.innerHTML = '<p>아이템 정보를 불러오는 데 실패했습니다.</p>';
  }
}

async function deleteItem() {
  if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return;
  try {
    const token = await getAccessToken();
    await axios.delete(`${API_URL}/api/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('상품이 삭제되었습니다.');
    window.location.href = 'mypage.html';
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    alert('상품 삭제 실패');
  }
}

async function handleRentalRequest() {
  if (!currentUser || !currentItem) return;
  if (currentUser.uid === currentItem.userId) {
    alert('본인의 상품에는 대여 요청을 할 수 없습니다.');
    return;
  }
  try {
    const token = await getAccessToken();
    await axios.post(`${API_URL}/api/items/${itemId}/rentals`, {
      requesterId: currentUser.uid,
      ownerId: currentItem.userId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('대여 요청이 완료되었습니다.');
  } catch (error) {
    console.error('대여 요청 오류:', error);
    alert('대여 요청 실패');
  }
}

function showEditForm(item) {
  itemDetailEl.innerHTML = `
    <h2>상품 수정</h2>
    <form id="edit-form">
      <input type="text" id="edit-name" value="${item.name}" placeholder="상품명" required /><br>
      <textarea id="edit-description" placeholder="설명" required>${item.description}</textarea><br>
      <input type="url" id="edit-image" value="${item.imageURL || ''}" placeholder="이미지 주소(URL)" /><br>
      <button type="submit">저장</button>
      <button type="button" id="cancel-edit">취소</button>
    </form>
  `;
  document.getElementById('cancel-edit').addEventListener('click', loadItemDetail);
  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessToken();
      const newName = document.getElementById('edit-name').value.trim();
      const newDesc = document.getElementById('edit-description').value.trim();
      const newImg = document.getElementById('edit-image').value.trim();

      await axios.put(`${API_URL}/api/items/${itemId}`, {
        name: newName,
        description: newDesc,
        imageURL: newImg
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('수정이 완료되었습니다.');
      await loadItemDetail();
    } catch (error) {
      console.error('수정 오류:', error);
      alert('수정 실패');
    }
  });
}

async function loadComments() {
  const commentsEl = document.getElementById('comments');
  try {
    const res = await axios.get(`${API_URL}/api/items/${itemId}/comments`);
    const comments = res.data.comments;
    commentsEl.innerHTML = comments.map(c => `<p>${c.userId} (${new Date(c.timestamp._seconds * 1000).toLocaleString('ko-KR')}) : ${c.text}</p>`).join('');
    if (currentUser) renderCommentForm();
  } catch (error) {
    console.error('댓글 불러오기 오류:', error);
    commentsEl.innerHTML = '<p>댓글을 불러오는 데 실패했습니다.</p>';
  }
}

function renderCommentForm() {
  const form = document.createElement('form');
  form.innerHTML = `
    <input type="text" id="comment-input" placeholder="댓글을 입력하세요" required />
    <button type="submit">작성</button>
  `;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('comment-input').value.trim();
    if (!text) return;
    try {
      const token = await getAccessToken();
      await axios.post(`${API_URL}/api/items/${itemId}/comments`, {
        userId: currentUser.uid,
        text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadComments();
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      alert('댓글 작성 실패');
    }
  });
  document.getElementById('comment-section').appendChild(form);
}

async function loadRentalHistory() {
  const logContainer = document.getElementById('rental-log');
  try {
    const res = await axios.get(`${API_URL}/api/items/${itemId}/rentals`);
    const rentals = res.data.rentals;
    logContainer.innerHTML = rentals.map(r => `<p>${r.requesterId} - 상태: ${r.status}</p>`).join('');
  } catch (error) {
    console.error('대여 이력 오류:', error);
    logContainer.innerHTML = '<p>대여 이력을 불러오지 못했습니다.</p>';
  }
}
