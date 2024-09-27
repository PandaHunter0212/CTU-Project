// SHARED RESOURCES JS

let resources = [];
let db;

function initDB() {
    let request = indexedDB.open('resourcesDB', 1);
    
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        let objectStore = db.createObjectStore('resources', { keyPath: 'fileName' });
        console.log('Database setup complete');
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log('Database initialized');
        loadResources();
    };

    request.onerror = function (event) {
        console.error('Database error:', event.target.errorCode);
    };
}

function loadResources() {
    const savedResources = localStorage.getItem('resources');
    if (savedResources) {
        resources = JSON.parse(savedResources);
        displayResources();
    }
}

function uploadResource() {
    const title = document.getElementById('resourceTitle').value;
    const category = document.getElementById('resourceCategory').value;
    const fileInput = document.getElementById('resourceFile');
    const file = fileInput.files[0];

    if (!title || !category || !file) {
        alert("Please fill in all fields and select a file.");
        return;
    }

    const resource = {
        title: title,
        category: category,
        fileName: file.name
    };

    resources.push(resource);
    displayResources();
    clearUploadForm();

    localStorage.setItem('resources', JSON.stringify(resources));

    let transaction = db.transaction(['resources'], 'readwrite');
    let objectStore = transaction.objectStore('resources');
    let request = objectStore.add({ fileName: file.name, file: file });

    request.onsuccess = function () {
        console.log('File saved in IndexedDB');
    };

    request.onerror = function () {
        console.error('Error saving file in IndexedDB');
    };
}

function clearUploadForm() {
    document.getElementById('resourceTitle').value = '';
    document.getElementById('resourceCategory').value = '';
    document.getElementById('resourceFile').value = '';
}

function displayResources() {
    const resourceList = document.getElementById('resourceList');
    resourceList.innerHTML = '';

    resources.forEach(resource => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.innerText = `${resource.title} (${resource.category})`;
        link.onclick = function () {
            downloadResource(resource.fileName);
        };
        listItem.appendChild(link);
        resourceList.appendChild(listItem);
    });
}

function downloadResource(fileName) {
    let transaction = db.transaction(['resources'], 'readonly');
    let objectStore = transaction.objectStore('resources');
    let request = objectStore.get(fileName);

    request.onsuccess = function (event) {
        let data = event.target.result;
        if (data && data.file) {
            const link = document.createElement('a');
            const fileUrl = URL.createObjectURL(data.file);
            link.href = fileUrl;
            link.download = data.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("Resource not available offline.");
        }
    };

    request.onerror = function () {
        console.error('Error retrieving file from IndexedDB');
    };
}

window.onload = function () {
    initDB();
};


// NAV JS

document.querySelectorAll('.navbar a').forEach(link => {
  if (link.href === window.location.href) {
      link.classList.add('active');
  }
});
function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// CONTACT US JS

document.querySelectorAll('.navbar a').forEach(link => {
  if (link.href === window.location.href) {
      link.classList.add('active');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const popup = document.getElementById('popup');

  form.addEventListener('submit', function(event) {
      event.preventDefault();
      popup.style.display = 'block';
      setTimeout(() => {
          popup.style.display = 'none';
      }, 3000);
  });
});

// ABOUT US JS

function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// DISCUSSION JS

document.addEventListener('DOMContentLoaded', () => {
    const discussionForm = document.getElementById('discussionForm');
    const uploadHistory = document.getElementById('uploadHistory');
    const reportedPosts = document.getElementById('reportedPosts');
    const adminPanel = document.getElementById('adminPanel');
    const adminToggle = document.getElementById('adminToggle');

    let isAdminMode = false;
    let postCounter = 0; // To generate unique IDs for posts
    let replyCounter = 0; // To generate unique IDs for replies

    // Function to make an element draggable
    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', (event) => {
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
            const rect = element.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            document.body.style.cursor = 'move';
        });

        document.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const dx = event.clientX - startX;
                const dy = event.clientY - startY;
                element.style.left = `${startLeft + dx}px`;
                element.style.top = `${startTop + dy}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.cursor = '';
        });
    }

    makeDraggable(adminPanel);

    // Handle form submission
    discussionForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const title = document.getElementById('title').value;
        const message = document.getElementById('message').value;

        postCounter++; // Increment counter for unique ID
        const postId = `post-${postCounter}`; // Generate unique ID for the post

        const listItem = document.createElement('li');
        listItem.id = postId; // Set ID for reference
        listItem.innerHTML = `
            <strong>Username:</strong> </p>${username}</p>
            <strong>Title:</strong> </p>${title}</p>
            <strong>Message:</strong> <p>${message}</p>
            <button class="reply-button">Reply</button>
            <button class="toggle-replies-button" style="display: none;">Hide Replies</button>
            <button class="report-button" data-username="${username}" data-title="${title}" data-message="${message}" data-id="${postId}" data-type="post">Report</button>
            <ul class="replies"></ul>
        `;
        uploadHistory.appendChild(listItem);
        discussionForm.reset();
    });

    // Handle report button click
    uploadHistory.addEventListener('click', (event) => {
        if (event.target.classList.contains('report-button')) {
            const username = event.target.getAttribute('data-username');
            const title = event.target.getAttribute('data-title');
            const message = event.target.getAttribute('data-message');
            const postId = event.target.getAttribute('data-id');
            const type = event.target.getAttribute('data-type');
            const listItem = document.getElementById(postId);

            // Create a reported item element
            const reportedItem = document.createElement('li');
            reportedItem.dataset.id = postId; // Store post ID in dataset
            const reportMessage = type === 'post' ? 'post' : 'reply';

            reportedItem.innerHTML = `
                <strong>Reported ${reportMessage}:</strong><br>
                <strong>Username:</strong> ${username}<br>
                <strong>Title:</strong> ${title}<br>
                <strong>Message:</strong> ${message}<br>
                <button class="approve-button">Approve</button>
                <button class="delete-button">Delete</button>
            `;
            reportedPosts.appendChild(reportedItem);

            // Optionally, hide the reported item or disable reporting
            event.target.disabled = true;
            event.target.textContent = 'Reported';
            alert('Thank you for reporting. This item will be reviewed by an admin.');
        }

        // Handle reply reporting
        if (event.target.classList.contains('reply-button')) {
            const replyForm = document.createElement('form');
            replyForm.classList.add('reply-form');
            replyForm.innerHTML = `
                <label for="replyUsername">Username:</label>
                <input type="text" id="replyUsername" name="replyUsername" placeholder="Your username" required>
                <label for="replyMessage">Reply:</label>
                <textarea id="replyMessage" name="replyMessage" placeholder="Write your reply.." required></textarea>
                <button type="submit">Post Reply</button>
            `;
            const listItem = event.target.closest('li');
            listItem.appendChild(replyForm);

            replyForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const replyUsername = replyForm.querySelector('#replyUsername').value;
                const replyMessage = replyForm.querySelector('#replyMessage').value;

                replyCounter++; // Increment counter for unique ID
                const replyId = `reply-${replyCounter}`; // Generate unique ID for the reply

                const replyList = listItem.querySelector('.replies');
                const replyItem = document.createElement('li');
                replyItem.id = replyId; // Set ID for reference

                const currentTime = new Date();
                const formattedTime = currentTime.toLocaleString();

                replyItem.innerHTML = `
                    <strong>Username:</strong> ${replyUsername}<br>
                    <p>${replyMessage}</p>
                    <small>Posted on: ${formattedTime}</small>
                    <button class="report-button" data-username="${replyUsername}" data-message="${replyMessage}" data-id="${replyId}" data-type="reply">Report</button>
                `;
                replyList.prepend(replyItem);
                replyForm.remove();
                const toggleRepliesButton = listItem.querySelector('.toggle-replies-button');
                if (replyList.children.length > 0) {
                    toggleRepliesButton.style.display = 'inline-block';
                }
            });
        } else if (event.target.classList.contains('toggle-replies-button')) {
            const listItem = event.target.closest('li');
            const replyList = listItem.querySelector('.replies');
            if (replyList.style.display === 'none') {
                replyList.style.display = 'block';
                event.target.textContent = 'Hide Replies';
            } else {
                replyList.style.display = 'none';
                event.target.textContent = 'Show Replies';
            }
        }
    });

    // Handle admin actions
    reportedPosts.addEventListener('click', (event) => {
        if (event.target.classList.contains('approve-button')) {
            const reportedItem = event.target.closest('li');
            const postId = reportedItem.dataset.id; // Retrieve post ID from dataset

            // Remove post from discussion history
            const postItem = document.getElementById(postId);
            if (postItem) {
                // Remove the "Report" button from the post
                const reportButton = postItem.querySelector('.report-button');
                if (reportButton) {
                    reportButton.remove();
                }
            }

            reportedItem.remove();
            alert('Content approved.');
        } else if (event.target.classList.contains('delete-button')) {
            const reportedItem = event.target.closest('li');
            const postId = reportedItem.dataset.id; // Retrieve post ID from dataset

            // Remove post from discussion history
            const postItem = document.getElementById(postId);
            if (postItem) {
                postItem.remove();
            }

            reportedItem.remove();
            alert('Content deleted.');
        } else if (event.target.classList.contains('reply-button')) {
            const replyItem = event.target.closest('li');
            const replyId = replyItem.id; // Retrieve reply ID from dataset

            // Remove reply from its parent post's replies
            const postItem = uploadHistory.querySelector(`#${replyItem.closest('li').id} .replies`);
            if (postItem) {
                const replyToRemove = postItem.querySelector(`#${replyId}`);
                if (replyToRemove) {
                    replyToRemove.remove();
                }
            }

            reportedItem.remove();
            alert('Reply deleted.');
        }
    });

    // Handle admin view toggle
    adminToggle.addEventListener('click', () => {
        isAdminMode = !isAdminMode;
        adminPanel.style.display = isAdminMode ? 'block' : 'none';
        adminToggle.textContent = isAdminMode ? 'Admin View On' : 'Admin View Off';
    });
});

// TIMETABLE JS
function toggleAccordion(event) {
    const header = event.currentTarget;
    const content = header.nextElementSibling;

    // Toggle active class on content
    content.classList.toggle('active');

    // Close other accordions
    const allContents = document.querySelectorAll('.accordion-content');
    allContents.forEach(item => {
        if (item !== content) {
            item.classList.remove('active');
        }
    });
}
