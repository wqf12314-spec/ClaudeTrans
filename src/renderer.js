const messagesContainer = document.getElementById('messages');
const inputElement = document.getElementById('input');
const sendButton = document.getElementById('send');

// 检测文本语言（简单判断：包含中文就是中文，否则英文）
function detectLanguage(text) {
  return /[一-龥]/.test(text) ? 'zh' : 'en';
}

// 获取目标语言
function getTargetLang(text) {
  const sourceLang = detectLanguage(text);
  return sourceLang === 'zh' ? 'en' : 'zh-CN';
}

// 窗口控制
document.getElementById('minimize').addEventListener('click', () => {
  window.electron.windowMinimize();
});

document.getElementById('maximize').addEventListener('click', () => {
  window.electron.windowMaximize();
});

document.getElementById('close').addEventListener('click', () => {
  window.electron.windowClose();
});

// 自动调整 textarea 高度
inputElement.addEventListener('input', () => {
  inputElement.style.height = 'auto';
  inputElement.style.height = inputElement.scrollHeight + 'px';
});

// 发送翻译
async function translate() {
  const text = inputElement.value.trim();
  if (!text) return;

  // 清空空状态
  const emptyState = messagesContainer.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  // 检测语言和目标语言
  const targetLang = getTargetLang(text);
  const langLabel = targetLang === 'en' ? '中文 → 英文' : '英文 → 中文';

  // 添加用户消息（显示原文）
  addMessage('user', text);

  // 清空输入框
  inputElement.value = '';
  inputElement.style.height = 'auto';

  // 禁用发送按钮
  sendButton.disabled = true;
  sendButton.textContent = '翻译中...';

  try {
    const result = await window.electron.translate(text, targetLang);
    // 添加翻译结果（显示译文 + 方向标签）
    addMessage('assistant', result, true, langLabel);
  } catch (error) {
    addMessage('assistant', `❌ 翻译失败: ${error.message}`, false);
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = '翻译';
  }
}

// 添加消息
function addMessage(role, text, showCopy = false, langLabel = '') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'user' ? '👤' : '🤖';

  const content = document.createElement('div');
  content.className = 'message-content';

  const roleLabel = document.createElement('div');
  roleLabel.className = 'message-role';
  roleLabel.textContent = role === 'user' ? 'You' : 'ClaudeTrans';

  // 如果有语言标签，添加到角色名后面
  if (langLabel) {
    roleLabel.textContent += ` · ${langLabel}`;
  }

  const messageText = document.createElement('div');
  messageText.className = 'message-text';
  messageText.textContent = text;

  content.appendChild(roleLabel);
  content.appendChild(messageText);

  if (showCopy) {
    const actions = document.createElement('div');
    actions.className = 'message-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'message-action-btn';
    copyBtn.textContent = '📋 复制';
    copyBtn.addEventListener('click', async () => {
      await window.electron.copyToClipboard(text);
      copyBtn.textContent = '✓ 已复制';
      setTimeout(() => {
        copyBtn.textContent = '📋 复制';
      }, 2000);
    });

    actions.appendChild(copyBtn);
    content.appendChild(actions);
  }

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 事件监听
sendButton.addEventListener('click', translate);

inputElement.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    translate();
  }
});

// 监听剪贴板翻译
window.electron.onTranslateClipboard((text) => {
  inputElement.value = text;
  translate();
});
