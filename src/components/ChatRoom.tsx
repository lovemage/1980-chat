import { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Users, Globe2, Play, Clock, ArrowLeft } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// 聊天室类型
type ChatRoomType = 'mtv' | 'picman' | 'future';

// 定义种族
const RACES = [
  { id: 'humans', en: 'Humans', zh: '人类' },
  { id: 'wookiees', en: 'Wookiees', zh: '伍基人' },
  { id: 'jawas', en: 'Jawas', zh: '爪哇人' },
  { id: 'ewoks', en: 'Ewoks', zh: '伊娃族' },
  { id: 'hutts', en: 'Hutts', zh: '赫特人' },
  { id: 'twileks', en: 'Twi\'leks', zh: '特瓦伊萊克人' },
  { id: 'gungans', en: 'Gungans', zh: '剛耿人' },
  { id: 'clones', en: 'Clones', zh: '克隆人' },
  { id: 'chiss', en: 'Chiss', zh: '齊斯人' },
  { id: 'togruta', en: 'Togruta', zh: '托格魯塔人' }
];

// 检测地区
const detectRegion = (): string => {
  try {
    const language = navigator.language;
    
    // 映射语言代码到地区
    if (language.includes('en-US')) return 'USA';
    if (language.includes('en-GB')) return 'UK';
    if (language.includes('en-CA') || language.includes('fr-CA')) return 'Canada';
    if (language.includes('de')) return 'Germany';
    if (language.includes('fr')) return 'France';
    if (language.includes('es')) return 'Spain';
    if (language.includes('it')) return 'Italy';
    if (language.includes('ja')) return 'Japan';
    if (language.includes('ko')) return 'Korea';
    if (language.includes('zh')) return 'China';
    if (language.includes('ru')) return 'Russia';
    if (language.includes('pt')) return 'Portugal';
    if (language.includes('nl')) return 'Netherlands';
    if (language.includes('sv')) return 'Sweden';
    if (language.includes('no')) return 'Norway';
    if (language.includes('da')) return 'Denmark';
    if (language.includes('fi')) return 'Finland';
    if (language.includes('pl')) return 'Poland';
    if (language.includes('tr')) return 'Turkey';
    if (language.includes('ar')) return 'Arabia';
    if (language.includes('he')) return 'Israel';
    if (language.includes('th')) return 'Thailand';
    if (language.includes('vi')) return 'Vietnam';
    
    return 'Unknown Region';
  } catch (error) {
    return 'Space';
  }
};

// 定义灾难事件
const DISASTERS = {
  en: [
    'Sandstorm approaching the chat room...',
    'Force Storm detected in the vicinity...',
    'Planetary Destruction imminent...',
    'Stellar Explosion detected in nearby system...',
    'Hyperspace Accident reported in the sector...',
    'Environmental Disaster warning issued...'
  ],
  zh: [
    '沙塵暴即將來襲聊天室...',
    '原力風暴在附近偵測到...',
    '行星毀滅即將發生...',
    '鄰近星系偵測到恆星爆炸...',
    '超空間事故發生在此區域...',
    '環境災害警告已發布...'
  ]
};

// 定义机器人消息
const BOT_MESSAGES = {
  en: [
    // 音樂相關
    "MTV just played Michael Jackson's Thriller! What a masterpiece! 🎵",
    "Madonna's 'Like a Virgin' is playing everywhere! 🎤",
    "The new Cyndi Lauper song is totally rad! 🎸",
    "Just bought the new Duran Duran album on vinyl! 💿",
    "Listening to The Police on my boombox! 📻",
    "The new Tears for Fears album is incredible! 🎵",
    "The new Culture Club album is groovy! 🎸",
    "The new Prince album is pure fire! 💜",
    "The new Depeche Mode song is amazing! 🎹",
    "The new Pet Shop Boys track is so catchy! 🎵",
    
    // 電影相關
    "The Empire Strikes Back is the best movie ever made! 🎬",
    "Top Gun is such an amazing movie! Tom Cruise rocks! ✈️",
    "Just saw Raiders of the Lost Ark again. Indiana Jones rules! 🗺️",
    "The Breakfast Club is such a deep movie! 🏫",
    "Back to the Future just blew my mind! 88mph! ⚡",
    "Blade Runner is such a mind-bending movie! 🤖",
    "Who else loves The Goonies? Hey you guys! 🏴‍☠️",
    "Just saw Terminator! I'll be back... 🤖",
    "Just saw Aliens! Game over man, game over! 👽",
    "Just saw Die Hard! Yippee ki-yay! 💥",
    
    // 電視節目
    "Watching Knight Rider with David Hasselhoff! 🚗",
    "The A-Team is on TV tonight! Don't miss it! 📺",
    "Who's watching Miami Vice tonight? Don Johnson is so cool! 🌴",
    "Anyone watching MacGyver? He can fix anything! 🔧",
    "Watching Magnum P.I. with Tom Selleck! 🏝️",
    "Dallas is getting intense! Who shot J.R.? 🤠",
    "Watching Diff'rent Strokes right now! 📺",
    "Who's watching Family Ties tonight? 👨‍👩‍👧‍👦",
    "Watching Hill Street Blues, so intense! 👮",
    "Watching CHiPs with Erik Estrada! 🏍️",
    
    // 遊戲和科技
    "Anyone playing Pac-Man at the arcade tonight? High score 100,000! 🕹️",
    "Just got my new Walkman! Time to rock! 📻",
    "Who's excited for the new Nintendo game? 🎮",
    "Playing Donkey Kong at the arcade! 🦍",
    "Just got my first Rubik's Cube! So addictive! 🎲",
    "Playing Galaga at the mall arcade! 👾",
    "Playing Frogger at the arcade, so hard! 🐸",
    "Playing Dragon's Lair at the arcade! 🐉",
    "Playing Centipede at the arcade! 🐛",
    "Just beat Asteroids with a new high score! 🚀",
    
    // 流行文化和時尚
    "Just got my first pair of Air Jordans! 👟",
    "Got my new Members Only jacket! 🧥",
    "Got my first Cabbage Patch Kid! 👶",
    "Just got my first Sony Betamax! 📼",
    "Check out my new Swatch watch collection! ⌚",
    "Love my new Ray-Ban Wayfarers! 😎",
    "Just got a Pound Puppy! So cute! 🐕",
    "My new calculator watch is awesome! 🧮",
    "Got some new leg warmers for aerobics class! 🩰",
    "Just joined the local breakdancing crew! 💃"
  ],
  zh: [
    // 音樂相關
    "剛剛在MTV看了麥可傑克遜的Thriller！經典中的經典！🎵",
    "瑪丹娜的《Like a Virgin》真是紅遍大街小巷！🎤",
    "辛蒂露波的新歌簡直太棒了！🎸",
    "剛買了皇后樂隊的黑膠唱片！💿",
    "用手提音響聽警察樂團！超讚的！📻",
    "年代淚水合唱團的新專輯太震撼了！🎵",
    "文化俱樂部的新專輯節奏感超強！🎸",
    "王子的新專輯根本是神作！💜",
    "狄派許模式的新歌太有魅力了！🎹",
    "寵物店男孩的新歌真是朗朗上口！🎵",
    
    // 電影相關
    "《帝國反擊戰》絕對是最棒的電影！🎬",
    "《捍衛戰士》太精彩了！阿湯哥帥呆！✈️",
    "《法櫃奇兵》真是冒險片的巔峰！🗺️",
    "《早餐俱樂部》道出了青春的真諦！🏫",
    "《回到未來》太震撼了！88英里每小時！⚡",
    "《銀翼殺手》開創科幻片新紀元！🤖",
    "《七寶奇謀》簡直是童年回憶！🏴‍☠️",
    "《魔鬼終結者》太經典了！我會回來的...🤖",
    "《異形2》真是嚇破膽！遊戲結束了！👽",
    "《終極警探》太熱血了！耶吼！💥",
    
    // 電視節目
    "正在看霹靂遊俠，大衛·赫索夫太帥了！🚗",
    "天龍特攻隊今晚播出！精彩必看！📺",
    "邁阿密風雲真是太酷了！唐強森演技一流！🌴",
    "百戰天龍真是無所不能！🔧",
    "馬蓋先探案真是精彩！🏝️",
    "達拉斯劇情超燒腦！誰槍擊了J.R.？🤠",
    "《天才老媽》笑料百出！📺",
    "《溫馨家庭》今晚必看！👨‍👩‍👧‍👦",
    "《山街制裁》真是扣人心弦！👮",
    "加州公路巡警太精彩了！🏍️",
    
    // 遊戲和科技
    "今晚去電玩城玩小精靈！破紀錄了！🕹️",
    "新買的隨身聽音質超棒！📻",
    "任天堂的新遊戲太有趣了！🎮",
    "商場的大金剛機台好好玩！🦍",
    "魔術方塊真是欲罷不能！🎲",
    "商場的小蜜蜂遊戲超級難！👾",
    "青蛙過河遊戲考驗反應！🐸",
    "龍穴歷險記太刺激了！🐉",
    "蜈蚣遊戲真是考驗技術！🐛",
    "小行星遊戲又破紀錄了！🚀",
    
    // 流行文化和時尚
    "終於買到Air Jordan球鞋了！👟",
    "新買的會員專屬外套好帥！🧥",
    "買到超可愛的高麗菜娃娃！👶",
    "索尼Betamax錄影機真好用！📼",
    "我的Swatch手錶收藏又增加了！⌚",
    "新買的雷朋墨鏡超時尚！😎",
    "領養了一隻Pound Puppy玩具狗！🐕",
    "計算機手錶太方便了！🧮",
    "買了新的暖腿套去跳有氧！🩰",
    "加入了街舞團，要開始練霹靂舞！💃"
  ]
};

// 定义支持的语言
const LANGUAGES = {
  en: {
    titles: {
      mtv: 'MTV CHAT ROOM',
      picman: 'PIC_MAN BOX',
      future: 'BACK TO THE FUTURE'
    },
    nickname: 'Nickname',
    race: 'Race',
    region: 'Region',
    enter: 'Enter Chat Room',
    inputPlaceholder: 'Type a message...',
    send: 'Send',
    onlineUsers: 'Online Users',
    welcome: {
      mtv: 'Welcome to MTV Chat Room',
      picman: 'Welcome to Pic_Man BOX',
      future: 'Welcome to Back to the Future Chat'
    },
    footer: {
      mtv: 'MTV CHAT ROOM v1.0 © 1988 - 300/1200/2400 BAUD - NO CARRIER',
      picman: 'PIC_MAN BOX v2.1 © 1982 - INSERT COIN TO CONTINUE - GAME OVER',
      future: 'BTTF CHAT v1.21 © 1985 - TIME CIRCUITS ON - FLUX CAPACITOR FLUXING'
    },
    nicknamePlaceholder: 'Enter your nickname...',
    nicknameRequired: 'Please enter a nickname!',
    raceRequired: 'Please select your race!',
    autoDetected: '* Auto-detected from your connection'
  },
  zh: {
    titles: {
      mtv: 'MTV 聊天室',
      picman: 'PIC_MAN 游戏厅',
      future: '回到未来聊天室'
    },
    nickname: '昵称',
    race: '种族',
    region: '地区',
    enter: '进入聊天室',
    inputPlaceholder: '输入消息...',
    send: '发送',
    onlineUsers: '在线用户',
    welcome: {
      mtv: '欢迎来到 MTV 聊天室',
      picman: '欢迎来到 Pic_Man 游戏厅',
      future: '欢迎来到回到未来聊天室'
    },
    footer: {
      mtv: 'MTV 聊天室 v1.0 © 1988 - 300/1200/2400 波特 - 无载波',
      picman: 'PIC_MAN BOX v2.1 © 1982 - 投币继续 - 游戏结束',
      future: '时光聊天室 v1.21 © 1985 - 时间电路开启 - 通量电容器充能中'
    },
    nicknamePlaceholder: '请输入昵称...',
    nicknameRequired: '请输入昵称！',
    raceRequired: '请选择种族！',
    autoDetected: '* 根据您的连接自动检测'
  },
  ja: {
    title: '1980 チャットルーム',
    nickname: 'ニックネーム',
    enter: '入室する',
    inputPlaceholder: 'メッセージを入力...',
    send: '送信',
    onlineUsers: 'オンラインユーザー',
    welcome: '1980チャットルームへようこそ',
    footer: 'チャットルーム v1.0 © 1980 - 300/1200/2400 ボー - NO CARRIER',
    nicknamePlaceholder: 'ニックネームを入力...',
    nicknameRequired: 'ニックネームを入力してください！'
  },
  ko: {
    title: '1980 채팅방',
    nickname: '닉네임',
    enter: '입장하기',
    inputPlaceholder: '메시지 입력...',
    send: '보내기',
    onlineUsers: '접속자',
    welcome: '1980 채팅방에 오신 것을 환영합니다',
    footer: '채팅방 v1.0 © 1980 - 300/1200/2400 보드 - NO CARRIER',
    nicknamePlaceholder: '닉네임을 입력하세요...',
    nicknameRequired: '닉네임을 입력해주세요!'
  },
  ar: {
    title: '1980 غرفة الدردشة',
    nickname: 'الاسم المستعار',
    enter: 'دخول',
    inputPlaceholder: 'اكتب رسالة...',
    send: 'إرسال',
    onlineUsers: 'المستخدمون المتصلون',
    welcome: 'مرحباً بك في غرفة الدردشة 1980',
    footer: 'غرفة الدردشة v1.0 © 1980 - 300/1200/2400 بود - NO CARRIER',
    nicknamePlaceholder: 'أدخل اسمك المستعار...',
    nicknameRequired: 'الرجاء إدخال اسم مستعار!'
  }
};

type LanguageKey = keyof typeof LANGUAGES;

interface Message {
  id: number;
  text: string;
  sender: string;
  race: string;
  region: string;
  timestamp: Date;
  isSystem?: boolean;
}

// 添加廣告組件
const AdComponent = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (err) {
      console.error('廣告加載失敗:', err);
    }
  }, []);

  return (
    <div ref={adRef} className="w-full my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="YOUR-AD-CLIENT-ID"
        data-ad-slot="YOUR-AD-SLOT"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

// 添加預設用戶數據
const DEFAULT_USERS = [
  { nickname: 'Luke_Skywalker', race: '人类', region: 'Tatooine' },
  { nickname: 'Han_Solo', race: '人类', region: 'Corellia' },
  { nickname: 'Chewbacca', race: '伍基人', region: 'Kashyyyk' },
  { nickname: 'R2D2', race: '机器人', region: 'Naboo' },
  { nickname: 'C3PO', race: '机器人', region: 'Tatooine' }
];

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [race, setRace] = useState('');
  const [region, setRegion] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [language, setLanguage] = useState<LanguageKey>('en');
  const [chatRoom, setChatRoom] = useState<ChatRoomType>('mtv');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const disasterIntervalRef = useRef<number | null>(null);
  const botIntervalRef = useRef<number | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ nickname: string; race: string; region: string }>>(DEFAULT_USERS);
  const socketRef = useRef<Socket | null>(null);

  const t = LANGUAGES[language];

  useEffect(() => {
    setRegion(detectRegion());
  }, []);

  useEffect(() => {
    // 连接到 Socket.io 服务器
    socketRef.current = io('http://localhost:3000');

    // 监听错误消息
    socketRef.current.on('error', (message: string) => {
      alert(message);
    });

    // 监听消息
    socketRef.current.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // 监听历史消息
    socketRef.current.on('history', (messages: Message[]) => {
      setMessages(messages);
    });

    // 监听用户列表更新
    socketRef.current.on('userList', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // 添加灾难事件
  const announceDisaster = () => {
    const randomIndex = Math.floor(Math.random() * DISASTERS[language].length);
    setMessages([]);
    addMessage({
      id: Date.now(),
      text: DISASTERS[language][randomIndex],
      sender: 'SYSTEM',
      race: '',
      region: '',
      timestamp: new Date(),
      isSystem: true
    });
  };

  // 设置定时器
  useEffect(() => {
    if (hasJoined) {
      // 每15分钟触发一次
      disasterIntervalRef.current = window.setInterval(() => {
        announceDisaster();
      }, 15 * 60 * 1000);

      return () => {
        if (disasterIntervalRef.current) {
          clearInterval(disasterIntervalRef.current);
        }
      };
    }
  }, [hasJoined, language]);

  // 修改發送消息的函數
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: nickname,
        race: race,
        region: region,
        timestamp: new Date()
      };
      
      // 直接添加消息到本地
      addMessage(message);
      
      // 發送到服務器
      socketRef.current.emit('sendMessage', {
        text: newMessage,
        room: chatRoom
      });
      
      setNewMessage('');
    }
  };

  // 修改機器人消息函數
  const addBotMessage = () => {
    if (!hasJoined) return;
    
    const messages = BOT_MESSAGES[language];
    const randomIndex = Math.floor(Math.random() * messages.length);
    const randomBot = Math.floor(Math.random() * 3) + 1;
    
    const botNames = {
      1: { name: 'RetroBot_1980', race: '机器人', region: 'Silicon Valley' },
      2: { name: 'VintageAI', race: '人工智能', region: 'Digital World' },
      3: { name: 'CyberPunk80s', race: '赛博朋克', region: 'Neo Tokyo' }
    };
    
    const bot = botNames[randomBot as keyof typeof botNames];
    
    // 直接添加機器人消息到本地
    const botMessage = {
      id: Date.now(),
      text: messages[randomIndex],
      sender: bot.name,
      race: bot.race,
      region: bot.region,
      timestamp: new Date()
    };
    
    addMessage(botMessage);
  };

  // 設置延遲，確保不會立即發送
  useEffect(() => {
    if (hasJoined) {
      const initialDelay = setTimeout(() => {
        botIntervalRef.current = window.setInterval(() => {
          addBotMessage();
        }, Math.random() * 20000 + 10000); // 10-30秒随机间隔
      }, 5000); // 5秒後開始發送機器人消息
      
      return () => {
        clearTimeout(initialDelay);
        if (botIntervalRef.current) {
          clearInterval(botIntervalRef.current);
        }
      };
    }
  }, [hasJoined, language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 修改加入房間的處理函數
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert(t.nicknameRequired);
      return;
    }
    if (!race) {
      alert(t.raceRequired);
      return;
    }
    
    // 加入房间，添加新用戶到現有用戶列表中
    const newUser = { nickname, race, region };
    setOnlineUsers([...DEFAULT_USERS, newUser]);
    
    // 發送系統歡迎消息
    const welcomeMessage = {
      id: Date.now(),
      text: `${nickname} (${race}) from ${region} 加入了聊天室`,
      sender: 'SYSTEM',
      race: '',
      region: '',
      timestamp: new Date(),
      isSystem: true
    };
    addMessage(welcomeMessage);
    
    setHasJoined(true);
  };

  // 修改房間切換的處理函數
  const handleRoomChange = (room: ChatRoomType) => {
    if (hasJoined) {
      setChatRoom(room);
      setMessages([]);
      
      // 重置用戶列表為預設用戶
      setOnlineUsers([...DEFAULT_USERS]);
      
      // 發送系統消息
      const switchMessage = {
        id: Date.now(),
        text: `${nickname} 進入了 ${t.titles[room]}`,
        sender: 'SYSTEM',
        race: '',
        region: '',
        timestamp: new Date(),
        isSystem: true
      };
      addMessage(switchMessage);
    }
  };

  const getRoomColors = () => {
    switch (chatRoom) {
      case 'mtv':
        return {
          bg: 'bg-black',
          text: 'text-green-400',
          border: 'border-green-500',
          highlight: 'bg-green-700'
        };
      case 'picman':
        return {
          bg: 'bg-blue-900',
          text: 'text-yellow-300',
          border: 'border-yellow-400',
          highlight: 'bg-yellow-700'
        };
      case 'future':
        return {
          bg: 'bg-gray-900',
          text: 'text-orange-400',
          border: 'border-orange-500',
          highlight: 'bg-orange-700'
        };
    }
  };

  const colors = getRoomColors();

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleLanguageChange = (lang: LanguageKey) => {
    setLanguage(lang);
  };

  const LanguageSelector = () => (
    <div className="flex space-x-2 ml-4">
      <Globe2 size={20} className={colors.text} />
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as LanguageKey)}
        className={`${colors.bg} border-2 ${colors.border} ${colors.text} px-2 py-1 text-sm focus:outline-none`}
      >
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );

  const RoomSwitcher = () => {
    if (chatRoom === 'mtv') {
      return (
        <button
          onClick={() => handleRoomChange('picman')}
          className={`${colors.highlight} p-2 rounded-lg hover:opacity-80 focus:outline-none flex items-center gap-2 mr-2`}
          title="切换到 Pic_Man BOX"
        >
          <Play size={16} />
          <span className="text-xs">Pic_Man</span>
        </button>
      );
    } else if (chatRoom === 'picman') {
      return (
        <button
          onClick={() => handleRoomChange('future')}
          className={`${colors.highlight} p-2 rounded-lg hover:opacity-80 focus:outline-none flex items-center gap-2 mr-2`}
          title="切换到 Back to the Future"
        >
          <Clock size={16} />
          <span className="text-xs">Future</span>
        </button>
      );
    } else {
      return (
        <button
          onClick={() => handleRoomChange('mtv')}
          className={`${colors.highlight} p-2 rounded-lg hover:opacity-80 focus:outline-none flex items-center gap-2 mr-2`}
          title="返回 MTV Chat Room"
        >
          <ArrowLeft size={16} />
          <span className="text-xs">MTV</span>
        </button>
      );
    }
  };

  if (!hasJoined) {
    return (
      <div className={`min-h-screen ${colors.bg} ${colors.text} font-mono flex items-center justify-center p-4`}>
        <div className={`w-full max-w-md border-2 ${colors.border} p-6 relative`}>
          <LanguageSelector />
          <div className="flex items-center justify-center mb-6">
            <Terminal className="mr-2" size={24} />
            <h1 className="text-2xl uppercase tracking-wide">{t.titles[chatRoom]}</h1>
          </div>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block mb-1">{t.nickname}:</label>
              <input 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={16}
                placeholder={t.nicknamePlaceholder}
                className={`w-full ${colors.bg} border-2 ${colors.border} p-2 ${colors.text} focus:outline-none`}
              />
            </div>

            <div>
              <label className="block mb-1">{t.race}:</label>
              <select
                value={race}
                onChange={(e) => setRace(e.target.value)}
                className={`w-full ${colors.bg} border-2 ${colors.border} p-2 ${colors.text} focus:outline-none`}
              >
                <option value="">{language === 'en' ? '-- SELECT RACE --' : '-- 选择种族 --'}</option>
                {RACES.map(race => (
                  <option key={race.id} value={race[language]}>
                    {race[language]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">{t.region}:</label>
              <div className={`w-full ${colors.bg} border-2 ${colors.border} p-2 ${colors.text}`}>
                {region || 'Scanning...'}
              </div>
              <div className="text-xs opacity-70 mt-1">{t.autoDetected}</div>
            </div>
            
            <button 
              type="submit"
              className={`w-full ${colors.highlight} border-2 ${colors.border} p-2 text-white hover:opacity-90 focus:outline-none`}
            >
              {t.enter}
            </button>
          </form>
          <RoomSwitcher />
          <AdComponent />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} font-mono flex flex-col p-4`}>
      <header className={`border-b-2 ${colors.border} pb-2 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Terminal className="mr-2" size={24} />
            <h1 className="text-2xl uppercase tracking-wide">{t.titles[chatRoom]}</h1>
            <LanguageSelector />
          </div>
          <div className="flex items-center">
            <Users className="mr-2" size={20} />
            <span>{t.onlineUsers}: {onlineUsers.length}</span>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col">
          <div 
            className={`flex-1 overflow-y-auto border-2 ${colors.border} p-4 mb-4 ${colors.bg}`}
            style={{ minHeight: "60vh", maxHeight: "60vh" }}
          >
            {messages.map((message, index) => {
              // 每50條消息後插入一個廣告
              const showAd = (index + 1) % 50 === 0;
              return (
                <>
                  <div key={message.id} className={`mb-2 ${message.isSystem ? 'text-yellow-400' : ''}`}>
                    <span className="text-gray-500">[{new Date(message.timestamp).toLocaleTimeString()}] </span>
                    {message.isSystem ? (
                      <span>{message.text}</span>
                    ) : (
                      <>
                        <span className={message.sender === nickname ? 'text-cyan-400' : colors.text}>
                          {message.sender} ({message.race}) from {message.region}:
                        </span>{' '}
                        <span>{message.text}</span>
                      </>
                    )}
                  </div>
                  {showAd && <AdComponent />}
                </>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex items-center mt-4">
            <RoomSwitcher />
            <form onSubmit={handleSendMessage} className="flex flex-1">
              <input
                ref={messageInputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t.inputPlaceholder}
                className={`flex-1 ${colors.bg} border-2 ${colors.border} p-2 ${colors.text} focus:outline-none`}
                maxLength={100}
              />
              <button 
                type="submit"
                className={`${colors.highlight} border-2 ${colors.border} border-l-0 p-2 text-white hover:opacity-90 focus:outline-none flex items-center`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* 右側邊欄 */}
        <div className="w-64 ml-4 flex flex-col">
          {/* 在線用戶列表 */}
          <div className={`flex-1 border-2 ${colors.border} p-4 ${colors.bg} overflow-y-auto mb-4`}>
            <div className="flex items-center mb-4">
              <Users className="mr-2" size={20} />
              <h3 className="font-bold">{t.onlineUsers}</h3>
            </div>
            {onlineUsers.map((user, index) => (
              <div key={index} className="mb-2 text-sm">
                {user.nickname} ({user.race})
                <div className="text-xs opacity-70">{user.region}</div>
              </div>
            ))}
          </div>
          
          {/* 右側廣告位 */}
          <div className={`border-2 ${colors.border} p-4 ${colors.bg}`}>
            <AdComponent />
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-center text-gray-600">
        {t.footer[chatRoom]}
      </div>
    </div>
  );
};

export default ChatRoom; 