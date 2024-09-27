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
  
    // Open IndexedDB
    const request = indexedDB.open('ContactDB', 1);
  
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
    };
  
    request.onsuccess = function(event) {
        const db = event.target.result;
  
        form.addEventListener('submit', function(event) {
            event.preventDefault();
  
            const formData = {
                name: form.name.value,
                surname: form.Surname.value,
                studentNumber: form['Student Number'].value,
                groupName: form['Group Name'].value,
                email: form.email.value,
                subject: form.subject.value,
                message: form.message.value
            };
  
            // Save to IndexedDB
            const transaction = db.transaction(['contacts'], 'readwrite');
            const objectStore = transaction.objectStore('contacts');
            objectStore.add(formData);
  
            transaction.oncomplete = function() {
                popup.style.display = 'block';
                setTimeout(() => {
                    popup.style.display = 'none';
                }, 3000);
                form.reset(); // Clear the form after submission
            };
  
            transaction.onerror = function(event) {
                console.error("Error saving data to IndexedDB:", event.target.error);
            };
        });
    };
  
    request.onerror = function(event) {
        console.error("Error opening IndexedDB:", event.target.error);
    };
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

    let db;

    // Open (or create) the database
    const request = indexedDB.open('discussionDB', 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore('posts', { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadPosts(); // Load posts after successful database open
    };

    request.onerror = (event) => {
        console.error('Database error:', event.target.errorCode);
    };

    // Load posts from IndexedDB
    function loadPosts() {
        const transaction = db.transaction(['posts'], 'readonly');
        const objectStore = transaction.objectStore('posts');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            event.target.result.forEach(post => displayPost(post));
        };
    }

    // Display post in the discussion list
    function displayPost(post) {
        const listItem = document.createElement('li');
        listItem.id = post.id;
        listItem.innerHTML = `
            <strong>Username:</strong> ${post.username}<br>
            <strong>Title:</strong> ${post.title}<br>
            <p>${post.message}</p>
            <button class="delete-post-button">Delete Post</button>
            <button class="reply-button">Reply</button>
            <button class="report-button" data-username="${post.username}" data-message="${post.message}" data-id="${post.id}" data-type="post">Report</button>
            <ul class="replies" style="display: none;"></ul>
        `;

        uploadHistory.appendChild(listItem);
        const replyList = listItem.querySelector('.replies');

        // Only create toggle button if there are replies
        if (post.replies && post.replies.length > 0) {
            post.replies.forEach(reply => displayReply(reply, listItem));
            const toggleRepliesButton = createToggleRepliesButton(listItem);
            listItem.appendChild(toggleRepliesButton);
        }

        const replyButton = listItem.querySelector('.reply-button');
        replyButton.addEventListener('click', () => showReplyForm(listItem, post.id));
        
        const deletePostButton = listItem.querySelector('.delete-post-button');
        deletePostButton.addEventListener('click', () => deletePost(post.id, listItem));
    }

    // Create toggle button for replies
    function createToggleRepliesButton(listItem) {
        const toggleButton = document.createElement('button');
        toggleButton.classList.add('toggle-replies-button');
        toggleButton.textContent = 'Show Replies';
        toggleButton.addEventListener('click', () => {
            const replyList = listItem.querySelector('.replies');
            if (replyList.style.display === 'none' || replyList.style.display === '') {
                replyList.style.display = 'block';
                toggleButton.textContent = 'Hide Replies';
            } else {
                replyList.style.display = 'none';
                toggleButton.textContent = 'Show Replies';
            }
        });
        return toggleButton;
    }

    // Show reply form for posts and replies
    function showReplyForm(listItem, postId) {
        const replyForm = document.createElement('form');
        replyForm.classList.add('reply-form');
        replyForm.innerHTML = `
            <label for="replyUsername">Username:</label>
            <input type="text" id="replyUsername" name="replyUsername" placeholder="Your username" required>
            <label for="replyMessage">Reply:</label>
            <textarea id="replyMessage" name="replyMessage" placeholder="Write your reply.." required></textarea>
            <button type="submit">Post Reply</button>
        `;
        listItem.appendChild(replyForm);

        replyForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const replyUsername = replyForm.querySelector('#replyUsername').value;
            const replyMessage = replyForm.querySelector('#replyMessage').value;

            const replyId = `reply-${Date.now()}`;
            const reply = { id: replyId, username: replyUsername, message: replyMessage };

            addReplyToPost(postId, reply);
            displayReply(reply, listItem);
            replyForm.remove();
        });
    }

    // Posting new discussion
    discussionForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const title = document.getElementById('title').value;
        const message = document.getElementById('message').value;

        const postId = `post-${Date.now()}`;
        const newPost = { id: postId, username, title, message, replies: [] };
        savePost(newPost);
        displayPost(newPost);
        discussionForm.reset();
    });

    // Save post to IndexedDB
    function savePost(post) {
        const transaction = db.transaction(['posts'], 'readwrite');
        const objectStore = transaction.objectStore('posts');
        const request = objectStore.add(post);
        request.onsuccess = () => {
            console.log('Post saved to database:', post);
        };
        request.onerror = () => {
            console.error('Error saving post:', request.error);
        };
    }

    // Save reply to the post in IndexedDB
    function addReplyToPost(postId, reply) {
        const transaction = db.transaction(['posts'], 'readwrite');
        const objectStore = transaction.objectStore('posts');

        const request = objectStore.get(postId);
        request.onsuccess = (event) => {
            const post = event.target.result;
            if (!post.replies) {
                post.replies = [];
            }
            post.replies.push(reply);
            objectStore.put(post);
        };
    }

    // Display the reply
    function displayReply(reply, listItem) {
        const replyList = listItem.querySelector('.replies');
        const replyItem = document.createElement('li');
        replyItem.id = reply.id;
        replyItem.innerHTML = `
            <strong>Username:</strong> ${reply.username}<br>
            <p>${reply.message}</p>
            <button class="delete-reply-button">Delete Reply</button>
        `;
        replyList.appendChild(replyItem);
        replyList.style.display = 'block';

        // Delete reply handling
        const deleteReplyButton = replyItem.querySelector('.delete-reply-button');
        deleteReplyButton.addEventListener('click', () => deleteReply(replyItem, reply.id, listItem));
    }

    // Delete post
    function deletePost(postId, listItem) {
        const transaction = db.transaction(['posts'], 'readwrite');
        const objectStore = transaction.objectStore('posts');
        const request = objectStore.delete(postId);
        request.onsuccess = () => {
            uploadHistory.removeChild(listItem);
            console.log('Post deleted:', postId);
        };
        request.onerror = () => {
            console.error('Error deleting post:', request.error);
        };
    }

    // Delete reply
    function deleteReply(replyItem, replyId, listItem) {
        const transaction = db.transaction(['posts'], 'readwrite');
        const objectStore = transaction.objectStore('posts');

        const request = objectStore.get(listItem.id);
        request.onsuccess = (event) => {
            const post = event.target.result;
            post.replies = post.replies.filter(reply => reply.id !== replyId);
            objectStore.put(post); // Update the post after deleting the reply

            replyItem.remove(); // Remove reply from the DOM
            console.log('Reply deleted:', replyId);
        };
    }
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