document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login');
    const createItemForm = document.getElementById('create-item');
    const addCommentForm = document.getElementById('add-comment');
    const itemList = document.getElementById('item-list');
    const itemDetails = document.getElementById('item-details');
    const itemInfo = document.getElementById('item-info');
    const comments = document.getElementById('comments');
    const dashboard = document.getElementById('dashboard');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            dashboard.style.display = 'block';
            loginForm.style.display = 'none';
            loadItems();
        } else {
            alert('Invalid credentials');
        }
    });

    createItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('item-name').value;
        const description = document.getElementById('item-description').value;
        await fetch('/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        loadItems();
    });

    addCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const comment = document.getElementById('comment').value;
        const itemId = addCommentForm.dataset.itemId;
        await fetch(`/items/${itemId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment })
        });
        loadItemDetails(itemId);
    });

    const loadItems = async () => {
        const res = await fetch('/items');
        const items = await res.json();
        itemList.innerHTML = items.map(item => `
            <div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <button onclick="viewItem('${item._id}')">View Details</button>
            </div>
        `).join('');
    };

    const loadItemDetails = async (itemId) => {
        const res = await fetch(`/items/${itemId}`);
        const item = await res.json();
        itemInfo.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
        `;
        comments.innerHTML = item.comments.map(comment => `
            <div>${comment}</div>
        `).join('');
        addCommentForm.dataset.itemId = itemId;
        itemDetails.style.display = 'block';
        dashboard.style.display = 'none';
    };

    window.viewItem = loadItemDetails;
});
