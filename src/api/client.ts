const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  url_image: string | null;
  balance: number;
  energy: number;
  max_energy: number;
  last_energy_update: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  url_image?: string;
}

export interface Upgrade {
  id: number;
  key: string;
  title: string;
  description: string | null;
  base_price: number;
  price_multiplier: number;
  max_level: number;
}

export interface UserUpgrade {
  upgrade_key: string;
  upgrade_title: string;
  level: number;
  next_price: number;
}

export interface ShopItem {
  id: number;
  crystals: number;
  stars: number;
  ton_price: number | null;
  is_active: boolean;
}

export interface UserTask {
  task_id: number;
  task_type: string;
  action_type: string;
  title: string;
  description: string | null;
  target_value: number;
  reward: number;
  progress: number;
  is_completed: boolean;
  is_claimed: boolean;
}

export interface TransferHistory {
  id: number;
  amount: number;
  created_at: string;
  direction: string;
  other_user_id: number | null;
  other_username: string | null;
}

// ─────────────────────────────────────────────────────────────
// User API
// ─────────────────────────────────────────────────────────────
export async function createOrGetUser(data: UserCreate): Promise<User> {
  const res = await fetch(`${API_BASE}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create/get user');
  return res.json();
}

export async function getUserByTelegramId(telegramId: number): Promise<User> {
  const res = await fetch(`${API_BASE}/users/by-telegram/${telegramId}`);
  if (!res.ok) throw new Error('User not found');
  return res.json();
}

export async function clickAction(userId: number, clicks: number = 1): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${userId}/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clicks }),
  });
  if (!res.ok) throw new Error('Click failed');
  return res.json();
}

export async function passiveIncome(userId: number, clicks: number = 1): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${userId}/passive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clicks }),
  });
  if (!res.ok) throw new Error('Passive income failed');
  return res.json();
}

export async function addBalance(userId: number, amount: number): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${userId}/add-balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error('Add balance failed');
  return res.json();
}

export async function getLeaderboard(limit: number = 50): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users/leaderboard?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to get leaderboard');
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Upgrades API
// ─────────────────────────────────────────────────────────────
export async function getUserUpgrades(userId: number): Promise<UserUpgrade[]> {
  const res = await fetch(`${API_BASE}/upgrades/user/${userId}`);
  if (!res.ok) throw new Error('Failed to get upgrades');
  return res.json();
}

export async function buyUpgrade(userId: number, upgradeKey: string): Promise<{ id: number; level: number }> {
  const res = await fetch(`${API_BASE}/upgrades/user/${userId}/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upgrade_key: upgradeKey }),
  });
  if (!res.ok) throw new Error('Buy upgrade failed');
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Shop API
// ─────────────────────────────────────────────────────────────
export async function getShopItems(): Promise<ShopItem[]> {
  const res = await fetch(`${API_BASE}/shop/items`);
  if (!res.ok) throw new Error('Failed to get shop items');
  return res.json();
}

export async function purchaseShopItem(userId: number, shopItemId: number): Promise<{ crystals: number; stars: number }> {
  const res = await fetch(`${API_BASE}/shop/purchase/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shop_item_id: shopItemId }),
  });
  if (!res.ok) throw new Error('Purchase failed');
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Tasks API
// ─────────────────────────────────────────────────────────────
export async function getUserTasks(userId: number, taskType?: string): Promise<UserTask[]> {
  const url = taskType
    ? `${API_BASE}/tasks/user/${userId}?task_type=${taskType}`
    : `${API_BASE}/tasks/user/${userId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to get tasks');
  return res.json();
}

export async function claimTaskReward(userId: number, taskId: number): Promise<{ is_claimed: boolean }> {
  const res = await fetch(`${API_BASE}/tasks/user/${userId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId }),
  });
  if (!res.ok) throw new Error('Claim failed');
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Transfers API
// ─────────────────────────────────────────────────────────────
export async function transferToUser(
  senderId: number,
  receiverTelegramId?: number,
  receiverUsername?: string,
  amount?: number
): Promise<{ id: number; amount: number }> {
  const res = await fetch(`${API_BASE}/transfers/${senderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receiver_telegram_id: receiverTelegramId,
      receiver_username: receiverUsername,
      amount,
    }),
  });
  if (!res.ok) throw new Error('Transfer failed');
  return res.json();
}

export async function getTransferHistory(userId: number, limit: number = 50): Promise<TransferHistory[]> {
  const res = await fetch(`${API_BASE}/transfers/${userId}/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to get transfer history');
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Stars (Donation) API
// ─────────────────────────────────────────────────────────────
export async function createStarsInvoice(shopItemId: number): Promise<string> {
  const res = await fetch(`${API_BASE}/stars/create-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shop_item_id: shopItemId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to create invoice');
  }
  const data = await res.json();
  return data.invoice_url;
}

export async function processStarsPayment(
  userId: number,
  shopItemId: number,
  telegramPaymentId: string
): Promise<User> {
  const res = await fetch(`${API_BASE}/stars/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      shop_item_id: shopItemId,
      telegram_payment_id: telegramPaymentId,
    }),
  });
  if (!res.ok) throw new Error('Stars payment failed');
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Chat API
// ─────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: number;
  user_id: number;
  username: string | null;
  first_name: string | null;
  url_image: string | null;
  text: string;
  created_at: string;
}

export async function getChatMessages(limit: number = 50, beforeId?: number): Promise<ChatMessage[]> {
  let url = `${API_BASE}/chat/messages?limit=${limit}`;
  if (beforeId) url += `&before_id=${beforeId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to get chat messages');
  return res.json();
}

export async function sendChatMessage(userId: number, text: string): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/chat/messages/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function getClickValue(): Promise<number> {
  const res = await fetch(`${API_BASE}/settings/click-value`);
  if (!res.ok) return 1;
  const data = await res.json();
  return data.click_value || 1;
}
