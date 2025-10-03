function getRepoName() {
  const parts = window.location.pathname.split('/');
  if (parts.length > 2) {
    return parts[1] + '/' + parts[2]; // owner/repo
  }
  return null;
}

function removeButtons() {
  document.querySelectorAll('button, input').forEach((el) => {
    if (!el.closest('header')) {
      el.remove();
    }
  });
}

function checkAndBlock() {
  const repo = getRepoName();
  if (!repo) return;

  chrome.storage.sync.get({ blockedRepos: [] }, ({ blockedRepos }) => {
    if (blockedRepos.includes(repo)) {
      removeButtons();

      // Observe future DOM changes (GitHub is dynamic)
      const observer = new MutationObserver(removeButtons);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
}

checkAndBlock();
