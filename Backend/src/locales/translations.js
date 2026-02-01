export const translations = {
  ru: {
    // Common
    common: {
      loading: 'Загрузка...',
      balance: 'Баланс',
      sell: 'Продать',
      sellAll: 'Продать всё',
      open: 'Открыть',
      close: 'Закрыть',
      confirm: 'Подтвердить',
      cancel: 'Отмена',
      save: 'Сохранить',
      select: 'Выбрать',
      total: 'Всего',
      free: 'БЕСПЛАТНО',
      paid: 'Платно',
      you: 'ВЫ',
      guest: 'Гость',
    },

    // Header
    header: {
      balance: 'Баланс',
      bonusAccount: 'Бонусный счет',
      account: 'Счет',
      bonusActivated: 'Бонус активирован!',
    },

    // Navigation
    nav: {
      cases: 'Кейсы',
      crash: 'Ракетка',
      roulette: 'Рулетка',
      pvp: 'PvP',
      upgrade: 'Апгрейд',
    },


    errors: {
      notAuthorized: 'Вы не авторизованы',
    },
  
    promo: {
      activated: 'Промокод успешно активирован',
      error: 'Ошибка активации промокода',
      referralBonus: 'Реферальный бонус!',
    },

    // Profile Page
    profile: {
      title: 'Профиль',
      userId: 'User ID',
      inventory: 'Инвентарь',
      sellAll: 'Продать Все',
      withdraw: 'Вывести',
      withdrawDepositRequired: 'Для вывода необходимо пополнить ещё {{amount}} TON',
      insufficientBalance: 'Недостаточно средств для вывода (минимум 0.5 TON)',
      operationsHistory: 'История Операций',
      deposits: 'Пополнений',
      settings: 'Настройки',
      hideLogin: 'Скрывать логин',
      vibration: 'Вибрация',
      promoTitle: 'ЗАБЕРИ ПРОМОКОД',
      promoTag: 'DAILY',
      promoDescription: '— подпишись на канал, чтоб не упустить выгоду',
      partnerTitle: 'ВКУСНАЯ РЕФЕРАЛКА',
      partnerTag: 'HOT',
      partnerDescription: 'Зови друзей, мгновенно лови бонус на баланс + жирный % с каждого их пополнения 🚀💰',
    },

    // Inventory Modal
    inventory: {
      title: 'Инвентарь',
      sellAll: 'Продать всё',
      total: 'Всего',
      sell: 'Продать',
      selling: 'Продаём...',
      loading: 'Загрузка',
      empty: 'Инвентарь пуст.',
      emptyHint: 'Открывайте кейсы, чтобы получить подарки!',
    },

    // Cases Page
    cases: {
      live: 'Live',
      paid: 'Платные',
      free: 'Бесплатные',
      loadingCases: 'Загрузка кейсов…',
      howItWorks: 'Как работают Кейсы',
      step1Title: 'Выберите кейс',
      step1Desc: 'Все кейсы содержат Telegram подарки и звезды. Чем дороже кейс — тем круче призы внутри!',
      step2Title: 'Откройте кейс',
      step2Desc: 'Нажмите кнопку «Открыть» и смотрите анимацию. Ваш приз сразу попадёт в инвентарь.',
      step3Title: 'Выведите подарок',
      step3Desc: 'Выводите TG подарки на свой Telegram аккаунт мгновенно. Или продайте за баланс и откройте новые кейсы.',
      step4Title: 'Что делать дальше?',
      step4Desc: 'Копите редкие подарки для апгрейда на более ценные. Или используйте их в режиме мины для увеличения выигрыша.',
      tipsTitle: 'ПОЛЕЗНЫЕ СОВЕТЫ',
      tip1: 'Открывайте более дорогие кейсы — там шанс получить редкие подарки выше!',
      tip2: 'Не хотите выводить? Продайте подарок за баланс и откройте новый кейс.',
      tip3: 'Копите одинаковые подарки — их можно использовать вместе в апгрейде.',
    },

    // Case Modal
    caseModal: {
      whatsInside: 'ЧТО ВНУТРИ?',
      open: 'Открыть',
      notEnoughFunds: 'Недостаточно средств',
      congratulations: 'Поздравляем!',
      claim: 'Забрать',
      waiting: 'Ожидаем выпадение...',
      depositInfo: 'Чтобы открыть этот кейс, вы должны пополнить 3 TON за последние 24 часа',
      depositFunds: 'Пополнить счёт',
      activatePromo: 'Активировать промокод',
      youWon: 'Вы выиграли',
    },

    // Crash Page
    crash: {
      placeBet: 'Сделать ставку',
      waiting: 'Ожидание...',
      betsClosed: 'Ставки закрыты',
      cashout: 'Вывести',
      betPlaced: "Ставка принята"
    },

    // Wheel Page
    wheel: {
      spin: 'Крутить',
      topUpBalance: 'Пополнить баланс',
      betHint: 'Выше ставка - больше ценность лута',
      prizesList: 'Список призов',
      refresh: 'Обновить',
      refreshPrizes: 'Обновить призы',
      congratulations: 'Поздравляем!',
      claim: 'Забрать',
      from: 'от',
      makeBet: 'Сделать ставку',
      // Категории подарков
      exclusive: 'Эксклюзивные',
      exclusiveDesc: 'Лимитки, ивенты, больше не выпускаются',
      artifact: 'Артефактные',
      artifactDesc: 'Уникальные подарки с историей или темой',
      mythic: 'Мифические',
      mythicDesc: 'Почти недостижимые, ограниченные серии',
      legendary: 'Легендарные',
      legendaryDesc: 'Очень редкие подарки, высокий статус',
      epic: 'Эпические',
      epicDesc: 'Яркие, эффектные, желанный лут',
      rare: 'Редкие',
      rareDesc: 'Заметно ценятся, встречаются нечасто',
      uncommon: 'Необычные',
      uncommonDesc: 'Чуть реже обычных, уже приятный дроп',
      common: 'Обычные',
      commonDesc: 'Базовые подарки без редкости, выпадают чаще всего',
    },

    // Bet Modal
    betModal: {
      placeBet: 'Поставить',
      withdraw: 'Вывести',
      gifts: 'Подарки',
      coins: 'Монеты',
      betAmount: 'Сумма ставки',
      balance: 'Баланс',
      select: 'Выбрать',
      autoCashout: 'Авто-вывод',
      coefficient: 'Коэффициент',
      selected: 'Выбрано',
      minBet: 'Мин. ставка',
    },

    // Withdraw Modal
    withdraw: {
      title: 'Вывод средств',
      stars: 'Звезды',
      wallet: 'Кошелёк',
      cryptoBot: 'Crypto Bot',
      amount: 'Сумма',
      withdrawButton: 'Вывести',
      cantWithdrawTitle: 'Вывод недоступен',
      cantWithdrawText:
        'Для вывода требуется 2 уровень и депозит от 3 TON.',
      remainingDeposit: 'Осталось пополнить',
      coins: 'TON',
      gifts: 'Подарки',
      availableBalance: 'Доступный баланс',
      selectCurrency: 'Выберите валюту',
    },

    // Deposit Modal
    deposit: {
      title: 'Пополнение счёта',
      stars: 'Звезды',
      wallet: 'Кошелёк',
      cryptoBot: 'Crypto Bot',
      amountPlaceholder: 'Сумма',
      depositButton: 'Пополнить',
      gifts: 'Звезды',
      wallet: 'Кошелёк',
      cryptoBot: 'Crypto Bot',
      instruction1: 'Перейдите в профиль',
      instruction2: 'Отправьте любой подарок',
      instruction3: 'Подарок отобразится в вашем инвентаре',
      instruction4: 'Убедитесь, что отправляете из своего профиля.',
      walletNotConnected: 'Кошелёк не подключен.',
      connectWallet: 'Привязать кошелёк',
      amount: 'Сумма',
      payStars: 'Пополнить',
      selectCurrency: 'Выберите валюту',
      youWillGet: 'Вы получите',
      payWith: 'Оплатить',
      processing: 'Обработка...',
    },

    // Partner Page
    partner: {
      title: 'Партнерская программа',
      invite: 'Пригласить',
      copyLink: 'Скопировать ссылку',
      description: 'Если вы хотите стать партнером и зарабатывать TON, ознакомьтесь с условиями',
      createPromo: 'Создать промокод',
      yourPromo: 'Ваш промокод',
      promoLabel: 'Промокод',
      enterPromo: 'Введите свой промокод',
      invitedFriends: 'Приглашенные друзья',
      friendHint: 'Друг должен войти в приложение по вашей ссылке, чтобы получить билет',
      noFriends: 'Пока нет приглашенных друзей',
      shareText: 'Присоединяйся к GGCat и зарабатывай TON!',
      bonusText: 'Приглашайте партнеров по ссылке, получайте <span class="highlight">{{percent}}%</span> с депозитов',
      totalUsers: 'Всего пользователей ggCat',
      statistics: 'Статистика',
      partners: 'Партнеров',
      earned: 'Заработано',
      rulesTitle: 'Правила приглашения партнеров',
      rulesDescription: 'Пригласите партнера по своей ссылке, далее после пополнения им депозита вы получите % на свой баланс',
    },

    // Top 20 Page
    top20: {
      title: 'TOP 20',
    },

    // Upgrade Page
    upgrade: {
      yourItem: 'Ваш предмет',
      selectItem: 'Выберите предмет',
      upgradeTarget: 'Цель апгрейда',
      selectTarget: 'Выберите цель',
      yourItems: 'Ваши предметы',
      upgradeTargets: 'Цели для апгрейда',
      upgrade: 'Прокачать',
      highChance: 'высокий шанс',
      mediumChance: 'средний шанс',
      lowChance: 'низкий шанс',
      success: 'УСПЕХ!',
      failed: 'НЕУДАЧА',
      congratulations: 'Поздравляем!',
      tryAgain: 'В следующий раз получится!',
      ok: 'Ок',
      tryAgain: 'Попробуй ещё раз',
      congratulations: 'Поздравляем!',
      makeBet:  'Сделать ставку',
      noGifts: 'Нет подарков в инвентаре. Выиграйте подарки в других играх.',

    },

    // PvP Page
    pvp: {
      vs: 'VS',
      victory: 'ПОБЕДА!',
      defeat: 'ПОРАЖЕНИЕ',
      draw: 'НИЧЬЯ',
      congratulations: 'Поздравляем!',
      tryAgain: 'В следующий раз получится!',
      attack: 'Атаковать',
      defend: 'Защищать',
      head: 'Голова',
      body: 'Тело',
      legs: 'Ноги',
      placeBet: 'Сделать ставку',
      waiting: 'Ожидание',
      opponentBet: 'Ставка соперника',
      yourBet: 'Ваша ставка',
      nowPlaying: 'Сейчас играют',
      players: 'игроков',
      inBattle: 'В бою',
      autoPickIn: 'Автовыбор через',
      sec: 'сек',

      statusWin: 'Победа',
      statusLose: 'Поражение',
      statusDraw: 'Ничья',
      statusFight: 'В бою',
      ok: 'ОК',
    },

    // Currencies
    currencies: {
      coins: 'Монеты',
      gems: 'Кристаллы',
      stars: 'Звезды',
    },

    // Home Page
    home: {
      roulette: 'КЕЙСЫ',
      crash: 'РАКЕТКА',
      pvp: 'PvP',
      upgrade: 'Upgrade',
      wheel: 'Рулетка',
      online: 'ОНЛАЙН',
    },

    // Task List
    tasks: {
      play10Times: 'Бонус за 10-й вход',
      play1Times: 'Ежедневный бонус',
      take: 'Забрать',
      promoPlaceholder: 'ПРОМОКОД',
      apply: 'Применить',
      rewardReceived: 'Бонус активирован',
    },
  },

  en: {
    // Common
    common: {
      loading: 'Loading...',
      balance: 'Balance',
      sell: 'Sell',
      sellAll: 'Sell All',
      open: 'Open',
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      select: 'Select',
      total: 'Total',
      free: 'FREE',
      paid: 'Paid',
      you: 'YOU',
      guest: 'Guest',
    },

    // Header
    header: {
      balance: 'Balance',
      bonusAccount: 'Bonus Account',
      account: 'Account',
      bonusActivated: 'Bonus activated!',
    },

    // Navigation
    nav: {
      cases: 'Cases',
      crash: 'Crash',
      roulette: 'Roulette',
      pvp: 'PvP',
      upgrade: 'Upgrade',
    },

    errors: {
      notAuthorized: 'You are not authorized',
    },
  
    promo: {
      activated: 'Promo code activated successfully',
      error: 'Promo code activation error',
      referralBonus: 'Referral bonus!',
    },

    // Profile Page
    profile: {
      title: 'Profile',
      userId: 'User ID',
      inventory: 'Inventory',
      sellAll: 'Sell All',
      withdraw: 'Withdraw',
      withdrawDepositRequired: 'To withdraw, you need to deposit {{amount}} TON more',
      insufficientBalance: 'Insufficient balance for withdrawal (minimum 0.5 TON)',
      operationsHistory: 'Operations History',
      deposits: 'Deposits',
      settings: 'Settings',
      hideLogin: 'Hide login',
      vibration: 'Vibration',
      promoTitle: 'GET PROMO CODE',
      promoTag: 'DAILY',
      promoDescription: '— subscribe to the channel so you don\'t miss out',
      partnerTitle: 'TASTY REFERRAL',
      partnerTag: 'HOT',
      partnerDescription: 'Invite friends, instantly get a bonus to your balance + a fat % from every deposit they make',
    },

    // Inventory Modal
    inventory: {
      title: 'Inventory',
      sellAll: 'Sell All',
      total: 'Total',
      sell: 'Sell',
      selling: 'Selling...',
      loading: 'Loading',
      empty: 'Inventory is empty.',
      emptyHint: 'Open cases to get gifts!',
    },

    // Cases Page
    cases: {
      live: 'Live',
      paid: 'Paid',
      free: 'Free',
      loadingCases: 'Loading cases…',
      howItWorks: 'How Cases Work',
      step1Title: 'Choose a Case',
      step1Desc: 'All cases contain Telegram gifts and stars. The more expensive the case, the better the prizes inside!',
      step2Title: 'Open the Case',
      step2Desc: 'Click the "Open" button and watch the animation. Your prize will instantly go to your inventory.',
      step3Title: 'Withdraw Gift',
      step3Desc: 'Withdraw TG gifts to your Telegram account instantly. Or sell for balance and open new cases.',
      step4Title: 'What to do next?',
      step4Desc: 'Collect rare gifts for upgrading to more valuable ones. Or use them in mines mode to increase winnings.',
      tipsTitle: 'USEFUL TIPS',
      tip1: 'Open more expensive cases — the chance to get rare gifts is higher!',
      tip2: 'Don\'t want to withdraw? Sell the gift for balance and open a new case.',
      tip3: 'Collect identical gifts — they can be used together in upgrades.',
    },

    // Case Modal
    caseModal: {
      whatsInside: "WHAT'S INSIDE?",
      open: 'Open',
      notEnoughFunds: 'Not enough funds',
      congratulations: 'Congratulations!',
      claim: 'Claim',
      waiting: 'Waiting for drop...',
      depositInfo: 'To open this case, you must deposit 3 TON within the last 24 hours',
      depositFunds: 'Deposit funds',
      activatePromo: 'Activate promo code',
      youWon: 'You won',
    },

    // Crash Page
    crash: {
      placeBet: 'Place Bet',
      waiting: 'Waiting...',
      betsClosed: 'Bets Closed',
      cashout: 'Cashout',
      betPlaced: "Bet placed"
    },

    // Wheel Page
    wheel: {
      spin: 'Spin',
      topUpBalance: 'Top Up Balance',
      betHint: 'Higher bet - more valuable loot',
      prizesList: 'Prize List',
      refresh: 'Refresh',
      refreshPrizes: 'Refresh Prizes',
      congratulations: 'Congratulations!',
      claim: 'Claim',
      from: 'from',
      makeBet: 'Place Bet',
      // Gift categories
      exclusive: 'Exclusive',
      exclusiveDesc: 'Limited editions, events, no longer available',
      artifact: 'Artifact',
      artifactDesc: 'Unique gifts with history or special meaning',
      mythic: 'Mythic',
      mythicDesc: 'Almost impossible to obtain, limited drops',
      legendary: 'Legendary',
      legendaryDesc: 'Extremely rare gifts with high status',
      epic: 'Epic',
      epicDesc: 'Highly desirable gifts with standout design',
      rare: 'Rare',
      rareDesc: 'Valuable gifts that don\'t drop often',
      uncommon: 'Uncommon',
      uncommonDesc: 'Slightly rarer gifts with added value',
      common: 'Common',
      commonDesc: 'Basic gifts with the highest drop rate',
    },

    // Bet Modal
    betModal: {
      placeBet: 'Place Bet',
      withdraw: 'Withdraw',
      gifts: 'Gifts',
      coins: 'Coins',
      betAmount: 'Bet Amount',
      balance: 'Balance',
      select: 'Select',
      autoCashout: 'Auto Cashout',
      coefficient: 'Coefficient',
      selected: 'Selected',
      minBet: 'Min. bet',
    },

    // Withdraw Modal
    withdraw: {
      title: 'Withdraw',
      stars: 'Stars',
      wallet: 'Wallet',
      cryptoBot: 'Crypto Bot',
      amount: 'Amount',
      withdrawButton: 'Withdraw',
      cantWithdrawTitle: 'Withdraw unavailable',
      cantWithdrawText:
        'You need level 2 and at least 3 TON deposited.',
      remainingDeposit: 'Remaining deposit',
      coins: 'TON',
      gifts: 'Gifts',
      availableBalance: 'Available balance',
      selectCurrency: 'Select currency',
    },

    // Deposit Modal
    deposit: {
      title: 'Deposit',
      stars: 'Stars',
      wallet: 'Wallet',
      cryptoBot: 'Crypto Bot',
      amountPlaceholder: 'Amount',
      depositButton: 'Deposit',
      gifts: 'Stars',
      wallet: 'Wallet',
      cryptoBot: 'Crypto Bot',
      instruction1: 'Go to profile',
      instruction2: 'Send any gift',
      instruction3: 'Gift will appear in your inventory',
      instruction4: 'Make sure you send from your profile.',
      walletNotConnected: 'Wallet not connected.',
      connectWallet: 'Connect Wallet',
      amount: 'Amount',
      payStars: 'Top up',
      selectCurrency: 'Select currency',
      youWillGet: 'You will get',
      payWith: 'Pay with',
      processing: 'Processing...',
    },

    // Partner Page
    partner: {
      title: 'Partner Program',
      invite: 'Invite',
      copyLink: 'Copy link',
      description: 'If you want to become a partner and earn TON, check the terms',
      createPromo: 'Create promo code',
      yourPromo: 'Your promo code',
      promoLabel: 'Promo code',
      enterPromo: 'Enter your promo code',
      invitedFriends: 'Invited Friends',
      friendHint: 'Friend must enter the app via your link to get a ticket',
      noFriends: 'No invited friends yet',
      shareText: 'Join GGCat and earn TON!',
      bonusText: 'Invite partners via link, get <span class="highlight">{{percent}}%</span> from deposits',
      totalUsers: 'Total ggCat Users',
      statistics: 'Statistics',
      partners: 'Partners',
      earned: 'Earned',
      rulesTitle: 'Partnership Rules',
      rulesDescription: 'Invite a partner using your link, then after they deposit, you will receive a % to your balance',
    },

    // Top 20 Page
    top20: {
      title: 'TOP 20',
    },

    // Upgrade Page
    upgrade: {
      yourItem: 'Your Item',
      selectItem: 'Select item',
      upgradeTarget: 'Upgrade Target',
      selectTarget: 'Select target',
      yourItems: 'Your Items',
      upgradeTargets: 'Upgrade Targets',
      upgrade: 'Upgrade',
      highChance: 'high chance',
      mediumChance: 'medium chance',
      lowChance: 'low chance',
      success: 'SUCCESS!',
      failed: 'FAILED!',
      congratulations: 'Congratulations!',
      tryAgain: 'Better luck next time!',
      ok: 'Ok',
      tryAgain: 'Try again',
      congratulations: 'Сongratulations',
      makeBet:  'Place bet',
      noGifts: 'No gifts in inventory. Win gifts in other games.',

    },

    // PvP Page
    pvp: {
      vs: 'VS',
      victory: 'VICTORY!',
      defeat: 'DEFEAT',
      draw: 'DRAW',
      congratulations: 'Congratulations!',
      tryAgain: 'Better luck next time!',
      attack: 'Attack',
      defend: 'Defend',
      head: 'Head',
      body: 'Body',
      legs: 'Legs',
      placeBet: 'Place Bet',
      waiting: 'Waiting',
      opponentBet: 'Opponent Bet',
      yourBet: 'Your Bet',
      nowPlaying: 'Now Playing',
      players: 'players',
      inBattle: 'In Battle',
      autoPickIn: 'Auto pick in',
      sec: 'sec',

      statusWin: 'Victory',
      statusLose: 'Defeat',
      statusDraw: 'Draw',
      statusFight: 'In Battle',
      ok: 'OK',
    },

    // Currencies
    currencies: {
      coins: 'Coins',
      gems: 'Gems',
      stars: 'Stars',
    },

    // Home Page
    home: {
      roulette: 'CASES',
      crash: 'ROCKET',
      pvp: 'PvP',
      upgrade: 'Upgrade',
      wheel: 'Roulette',
      online: 'ONLINE',
    },

    // Task List
    tasks: {
      play10Times: '10th Login Bonus',
      play1Times: 'Daily Bonus',
      take: 'Take',
      promoPlaceholder: 'PROMOCODE',
      apply: 'Apply',
      rewardReceived: 'Bonus activated',
    },
  },
}
