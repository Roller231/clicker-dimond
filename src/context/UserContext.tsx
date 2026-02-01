import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import * as api from '../api/client';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface UserData {
  id: number;
  telegramId: number;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  urlImage: string | null;
  balance: number;
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: string;
}

export interface UpgradeData {
  key: string;
  title: string;
  level: number;
  nextPrice: number;
}

export interface TaskData {
  taskId: number;
  taskType: string;
  actionType: string;
  title: string;
  description: string | null;
  targetValue: number;
  reward: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

interface UserContextType {
  user: UserData | null;
  upgrades: UpgradeData[];
  tasks: TaskData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  initUser: (telegramId: number, username?: string, firstName?: string, lastName?: string, urlImage?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshUpgrades: () => Promise<void>;
  refreshTasks: () => Promise<void>;

  // Game actions
  handleClick: (clicks?: number) => Promise<void>;
  handlePassiveIncome: (clicks?: number) => Promise<void>;
  handleBuyUpgrade: (upgradeKey: string) => Promise<boolean>;
  handleClaimTask: (taskId: number) => Promise<boolean>;
  handleTransfer: (receiverUsername: string, amount: number) => Promise<boolean>;
  handlePurchase: (shopItemId: number, telegramPaymentId?: string) => Promise<boolean>;

  // Computed
  getUpgradeLevel: (key: string) => number;
  getClickPower: () => number;
  getPassiveIncome: () => number;
  getMaxEnergy: () => number;
}

const UserContext = createContext<UserContextType | null>(null);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [upgrades, setUpgrades] = useState<UpgradeData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Init user from Telegram or local
  // ─────────────────────────────────────────────────────────────
  const initUser = useCallback(async (
    telegramId: number,
    username?: string,
    firstName?: string,
    lastName?: string,
    urlImage?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUser = await api.createOrGetUser({
        telegram_id: telegramId,
        username,
        first_name: firstName,
        last_name: lastName,
        url_image: urlImage,
      });

      setUser({
        id: apiUser.id,
        telegramId: apiUser.telegram_id,
        username: apiUser.username,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        urlImage: apiUser.url_image,
        balance: apiUser.balance,
        energy: apiUser.energy,
        maxEnergy: apiUser.max_energy,
        lastEnergyUpdate: apiUser.last_energy_update,
      });

      // Load upgrades and tasks
      const [userUpgrades, userTasks] = await Promise.all([
        api.getUserUpgrades(apiUser.id),
        api.getUserTasks(apiUser.id),
      ]);

      setUpgrades(userUpgrades.map(u => ({
        key: u.upgrade_key,
        title: u.upgrade_title,
        level: u.level,
        nextPrice: u.next_price,
      })));

      setTasks(userTasks.map(t => ({
        taskId: t.task_id,
        taskType: t.task_type,
        actionType: t.action_type,
        title: t.title,
        description: t.description,
        targetValue: t.target_value,
        reward: t.reward,
        progress: t.progress,
        isCompleted: t.is_completed,
        isClaimed: t.is_claimed,
      })));

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to init user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Refresh functions
  // ─────────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const apiUser = await api.getUserByTelegramId(user.telegramId);
      setUser(prev => prev ? { 
        ...prev, 
        balance: apiUser.balance,
        energy: apiUser.energy,
        maxEnergy: apiUser.max_energy,
        lastEnergyUpdate: apiUser.last_energy_update,
      } : null);
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  }, [user]);

  const refreshUpgrades = useCallback(async () => {
    if (!user) return;
    try {
      const userUpgrades = await api.getUserUpgrades(user.id);
      setUpgrades(userUpgrades.map(u => ({
        key: u.upgrade_key,
        title: u.upgrade_title,
        level: u.level,
        nextPrice: u.next_price,
      })));
    } catch (e) {
      console.error('Failed to refresh upgrades', e);
    }
  }, [user]);

  const refreshTasks = useCallback(async () => {
    if (!user) return;
    try {
      const userTasks = await api.getUserTasks(user.id);
      setTasks(userTasks.map(t => ({
        taskId: t.task_id,
        taskType: t.task_type,
        actionType: t.action_type,
        title: t.title,
        description: t.description,
        targetValue: t.target_value,
        reward: t.reward,
        progress: t.progress,
        isCompleted: t.is_completed,
        isClaimed: t.is_claimed,
      })));
    } catch (e) {
      console.error('Failed to refresh tasks', e);
    }
  }, [user]);

  // ─────────────────────────────────────────────────────────────
  // Game actions
  // ─────────────────────────────────────────────────────────────
  const handleClick = useCallback(async (clicks: number = 1) => {
    if (!user) return;

    // Check if enough energy locally
    if (user.energy < clicks) {
      console.log('Not enough energy');
      return;
    }

    // Optimistic update
    const clickPower = getClickPower();
    setUser(prev => prev ? { 
      ...prev, 
      balance: prev.balance + clicks * clickPower,
      energy: prev.energy - clicks,
    } : null);

    try {
      const updated = await api.clickAction(user.id, clicks);
      setUser(prev => prev ? { 
        ...prev, 
        balance: updated.balance,
        energy: updated.energy,
        maxEnergy: updated.max_energy,
        lastEnergyUpdate: updated.last_energy_update,
      } : null);
      // Обновляем прогресс заданий после клика
      await refreshTasks();
    } catch (e) {
      console.error('Click failed', e);
      // Revert on error
      await refreshUser();
    }
  }, [user, refreshUser, refreshTasks]);

  const handlePassiveIncome = useCallback(async (clicks: number = 1) => {
    if (!user) return;

    // Optimistic update (пассивный доход не тратит энергию)
    const clickPower = getClickPower();
    setUser(prev => prev ? { 
      ...prev, 
      balance: prev.balance + clicks * clickPower,
    } : null);

    try {
      const updated = await api.passiveIncome(user.id, clicks);
      setUser(prev => prev ? { 
        ...prev, 
        balance: updated.balance,
        energy: updated.energy,
        maxEnergy: updated.max_energy,
        lastEnergyUpdate: updated.last_energy_update,
      } : null);
    } catch (e) {
      console.error('Passive income failed', e);
      await refreshUser();
    }
  }, [user, refreshUser]);

  const handleBuyUpgrade = useCallback(async (upgradeKey: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await api.buyUpgrade(user.id, upgradeKey);
      await Promise.all([refreshUser(), refreshUpgrades(), refreshTasks()]);
      return true;
    } catch (e) {
      console.error('Buy upgrade failed', e);
      return false;
    }
  }, [user, refreshUser, refreshUpgrades, refreshTasks]);

  const handleClaimTask = useCallback(async (taskId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      await api.claimTaskReward(user.id, taskId);
      await Promise.all([refreshUser(), refreshTasks()]);
      return true;
    } catch (e) {
      console.error('Claim task failed', e);
      return false;
    }
  }, [user, refreshUser, refreshTasks]);

  const handleTransfer = useCallback(async (receiverUsername: string, amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      await api.transferToUser(user.id, undefined, receiverUsername, amount);
      await Promise.all([refreshUser(), refreshTasks()]);
      return true;
    } catch (e) {
      console.error('Transfer failed', e);
      return false;
    }
  }, [user, refreshUser, refreshTasks]);

  const handlePurchase = useCallback(async (shopItemId: number, telegramPaymentId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      if (telegramPaymentId) {
        // Real Telegram Stars payment
        await api.processStarsPayment(user.id, shopItemId, telegramPaymentId);
      } else {
        // Direct purchase (for testing)
        await api.purchaseShopItem(user.id, shopItemId);
      }
      await Promise.all([refreshUser(), refreshTasks()]);
      return true;
    } catch (e) {
      console.error('Purchase failed', e);
      return false;
    }
  }, [user, refreshUser, refreshTasks]);

  // ─────────────────────────────────────────────────────────────
  // Computed values
  // ─────────────────────────────────────────────────────────────
  const getUpgradeLevel = useCallback((key: string): number => {
    const upgrade = upgrades.find(u => u.key === key);
    return upgrade?.level ?? 0;
  }, [upgrades]);

  const getClickPower = useCallback((): number => {
    return 1 + getUpgradeLevel('click');
  }, [getUpgradeLevel]);

  const getPassiveIncome = useCallback((): number => {
    const autoclick = getUpgradeLevel('autoclick') * 0.5;
    const megaclick = getUpgradeLevel('megaclick') * 1;
    const superclick = getUpgradeLevel('superclick') * 2;
    return autoclick + megaclick + superclick;
  }, [getUpgradeLevel]);

  const getMaxEnergy = useCallback((): number => {
    // Use max_energy from user if available, otherwise calculate from upgrades
    if (user?.maxEnergy) {
      return user.maxEnergy;
    }
    return 100 + getUpgradeLevel('maxEnergy') * 25;
  }, [user, getUpgradeLevel]);

  // ─────────────────────────────────────────────────────────────
  // Context value
  // ─────────────────────────────────────────────────────────────
  const value: UserContextType = {
    user,
    upgrades,
    tasks,
    isLoading,
    error,
    initUser,
    refreshUser,
    refreshUpgrades,
    refreshTasks,
    handleClick,
    handlePassiveIncome,
    handleBuyUpgrade,
    handleClaimTask,
    handleTransfer,
    handlePurchase,
    getUpgradeLevel,
    getClickPower,
    getPassiveIncome,
    getMaxEnergy,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
