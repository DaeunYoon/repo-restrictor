const input = document.getElementById('repoInput');
const addBtn = document.getElementById('addBtn');
const repoList = document.getElementById('repoList');
const addCurrentRepoBtn = document.getElementById('addCurrentRepoBtn');

function renderList(repos) {
  repoList.innerHTML = '';
  repos.forEach((repo) => {
    const li = document.createElement('li');
    li.dataset.repo = repo; // unique key for this item

    const link = document.createElement('a');
    link.href = `https://github.com/${repo}`;
    link.textContent = repo;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';

    li.appendChild(link);
    li.appendChild(removeBtn);
    repoList.appendChild(li);
  });
}

// Event delegation: one listener for the entire list
repoList.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const li = e.target.closest('li');
    const repo = li.dataset.repo;

    chrome.storage.sync.get({ blockedRepos: [] }, ({ blockedRepos }) => {
      const newRepos = blockedRepos.filter((r) => r !== repo);
      chrome.storage.sync.set({ blockedRepos: newRepos }, () => {
        renderList(newRepos);
      });
    });
  }
});

// Load existing list
chrome.storage.sync.get({ blockedRepos: [] }, ({ blockedRepos }) => {
  renderList(blockedRepos);
});

// Add new repo
addBtn.onclick = () => {
  const newRepo = input.value.trim();
  if (!newRepo) return;
  chrome.storage.sync.get({ blockedRepos: [] }, ({ blockedRepos }) => {
    if (!blockedRepos.includes(newRepo)) {
      blockedRepos.push(newRepo);
      chrome.storage.sync.set({ blockedRepos }, () => {
        renderList(blockedRepos);
        input.value = '';
      });
    }
  });
};

// Add current repo
addCurrentRepoBtn.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab || !activeTab.url) return;
    const url = new URL(activeTab.url);
    const parts = url.pathname.split('/');
    if (parts.length > 2) {
      const currentRepo = parts[1] + '/' + parts[2];
      chrome.storage.sync.get({ blockedRepos: [] }, ({ blockedRepos }) => {
        if (!blockedRepos.includes(currentRepo)) {
          blockedRepos.push(currentRepo);
          chrome.storage.sync.set({ blockedRepos }, () => {
            renderList(blockedRepos);
          });
        }
      });
    }
  });
};
