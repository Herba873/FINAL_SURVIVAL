const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const START_HP = 50;
const START_MP = 20;
const START_MONEY = 30;
const MAX_PLAYERS = 2;

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

const attackCards = [
  // 무속성 공격 카드
  {
    name: "녹슨 단검",
    type: "attack",
    damage: 5,
    element: "none",
    price: 5
  },
  {
    name: "검격",
    type: "attack",
    damage: 8,
    element: "none",
    price: 10
  },
  {
    name: "금검",
    type: "attack",
    damage: 1,
    element: "none",
    price: 50
  },

  // 불 속성 공격 카드
  {
    name: "홍련의 포효",
    type: "attack",
    damage: 11,
    element: "fire",
    price: 15
  },
  {
    name: "작열의 포식자",
    type: "attack",
    damage: 15,
    element: "fire",
    price: 20
  },

  // 빛 속성 공격 카드
  {
    name: "천뢰의 심판",
    type: "attack",
    damage: 14,
    element: "light",
    price: 20
  },
  {
    name: "성운의 낙인",
    type: "attack",
    damage: 10,
    element: "light",
    price: 25
  },
  {
    name: "태양의 판결",
    type: "attack",
    damage: 15,
    element: "light",
    price: 30
  },

  // 물 속성 공격 카드
  {
    name: "해일의 노래",
    type: "attack",
    damage: 9,
    element: "water",
    price: 20
  },
  {
    name: "심해의 분노",
    type: "attack",
    damage: 16,
    element: "water",
    price: 25
  },

  // 땅 속성 공격 카드
  {
    name: "산맥의 격노",
    type: "attack",
    damage: 13,
    element: "earth",
    price: 22
  },
  {
    name: "지맥 붕괴",
    type: "attack",
    damage: 17,
    element: "earth",
    price: 26
  },

  // 바람 속성 공격 카드
  {
    name: "질풍의 유영",
    type: "attack",
    damage: 10,
    element: "wind",
    price: 22
  },
  {
    name: "천공 폭발",
    type: "attack",
    damage: 18,
    element: "wind",
    price: 26
  },

  // 어둠 속성 공격 카드
  {
    name: "밤의 속삭임",
    type: "attack",
    damage: 6,
    element: "dark",
    price: 15
  },
  {
    name: "망자의 인도자",
    type: "attack",
    damage: 10,
    element: "dark",
    price: 25
  },

  // 독 공격 카드
  {
    name: "약독 단검",
    type: "attack",
    damage: 7,
    element: "none",
    poisonStage: "weak",
    price: 14
  },
  {
    name: "중독 칼날",
    type: "attack",
    damage: 9,
    element: "none",
    poisonStage: "normal",
    price: 20
  },
  {
    name: "강독 창",
    type: "attack",
    damage: 12,
    element: "none",
    poisonStage: "strong",
    price: 30
  }
];

const plusCards = [
  // 무속성 +카드
  {
    name: "전투 본능",
    type: "plus",
    bonus: 5,
    element: "none",
    attributeChange: false,
    price: 5
  },
  {
    name: "용사의 일격",
    type: "plus",
    bonus: 10,
    element: "none",
    attributeChange: false,
    price: 10
  },
  {
    name: "필살의 문장",
    type: "plus",
    bonus: 15,
    element: "none",
    attributeChange: false,
    price: 15
  },
  {
    name: "황금의 축복",
    type: "plus",
    bonus: 1,
    element: "none",
    attributeChange: false,
    price: 40
  },

  // 기존 속성 +카드
  {
    name: "작열의 파편",
    type: "plus",
    bonus: 6,
    element: "fire",
    attributeChange: false,
    price: 15
  },
  {
    name: "빙하의 눈물",
    type: "plus",
    bonus: 5,
    element: "water",
    attributeChange: false,
    price: 15
  },
  {
    name: "대지의 문장",
    type: "plus",
    bonus: 7,
    element: "earth",
    attributeChange: false,
    price: 18
  },
  {
    name: "질풍의 깃털",
    type: "plus",
    bonus: 6,
    element: "wind",
    attributeChange: false,
    price: 15
  },
  {
    name: "성광의 보석",
    type: "plus",
    bonus: 4,
    element: "light",
    attributeChange: false,
    price: 18
  },
  {
    name: "암흑의 조각",
    type: "plus",
    bonus: 2,
    element: "dark",
    attributeChange: false,
    price: 20
  },

  // 속성 변경 무기형 +카드
  {
    name: "홍련의 대검",
    type: "plus",
    bonus: 4,
    element: "fire",
    attributeChange: true,
    price: 20
  },
  {
    name: "해신의 삼지창",
    type: "plus",
    bonus: 3,
    element: "water",
    attributeChange: true,
    price: 20
  },
  {
    name: "거신의 망치",
    type: "plus",
    bonus: 6,
    element: "earth",
    attributeChange: true,
    price: 22
  },
  {
    name: "천풍의 활",
    type: "plus",
    bonus: 5,
    element: "wind",
    attributeChange: true,
    price: 20
  },
  {
    name: "라이트닝 블레이더",
    type: "plus",
    bonus: 2,
    element: "light",
    attributeChange: true,
    price: 22
  },
  {
    name: "데스 나이프",
    type: "plus",
    bonus: 1,
    element: "dark",
    attributeChange: true,
    price: 25
  }
];

const healCards = [
  {
    name: "작은 치유 물약",
    type: "heal",
    heal: 5,
    price: 5
  },
  {
    name: "치유 물약",
    type: "heal",
    heal: 10,
    price: 10
  },
  {
    name: "치유의 빛",
    type: "heal",
    heal: 15,
    price: 15
  },
  {
    name: "생명의 샘",
    type: "heal",
    heal: 20,
    price: 20
  }
];

const magicCards = [
  {
    name: "마약 투여",
    type: "magic",
    magicType: "drug",
    mpCost: 15,
    price: 0,
    reusable: true
  },
  {
    name: "따블로 간다!",
    type: "magic",
    magicType: "doubleAttack",
    mpCost: 5,
    price: 0,
    reusable: true
  },
  {
    name: "못맞췄지롱!",
    type: "magic",
    magicType: "miss",
    mpCost: 7,
    price: 0,
    reusable: true
  },
  {
  name: "쫄트라크",
  type: "magic",
  magicType: "plus",
  element: "light",
  bonus: 10,
  mpCost: 10,
  price: 0,
  reusable: true
},
{
  name: "에바다 케다브라",
  type: "magic",
  magicType: "attack",
  element: "dark",
  damage: 5,
  mpCost: 5,
  price: 0,
  reusable: true
},
{
  name: "위플레시",
  type: "magic",
  magicType: "cure",
  healType: "all",
  mpCost: 10,
  price: 0,
  reusable: true
}
];

const defenseCards = [
  { name: "나무 방패", type: "defense", defense: 8, element: "none", price: 10 },
  { name: "철 방패", type: "defense", defense: 15, element: "none", price: 15 },
  { name: "성기사 방패", type: "defense", defense: 25, element: "none", price: 30 },

  { name: "불의 방패", type: "defense", defense: 15, element: "fire", price: 20 },
  { name: "물의 방패", type: "defense", defense: 15, element: "water", price: 20 },
  { name: "대지의 방패", type: "defense", defense: 15, element: "earth", price: 20 },
  { name: "바람의 방패", type: "defense", defense: 15, element: "wind", price: 20 },

  { name: "빛의 방패", type: "defense", defense: 18, element: "light", price: 25 }
];

const reflectCards = [
  {
    name: "패링 소드",
    type: "reflect",
    category: "weapon",
    weaponType: "sword",
    damage: 5,
    element: "none",
    reflectMode: "bounce",
    price: 15
  },
  {
    name: "너나머검",
    type: "reflect",
    category: "weapon",
    weaponType: "sword",
    damage: 10,
    element: "none",
    reflectMode: "reflect",
    price: 25
  },
  {
    name: "무지개 반사",
    type: "rainbowReflect",
    category: "item",
    reflectMode: "rainbow",
    price: 30
  }
];

const manaHealCards = [
  {
    name: "작은 마나 물약",
    type: "manaHeal",
    mana: 5,
    price: 5
  },
  {
    name: "마나 물약",
    type: "manaHeal",
    mana: 10,
    price: 10
  },
  {
    name: "대형 마나 물약",
    type: "manaHeal",
    mana: 15,
    price: 15
  }
];

const cleanseCards = [
  { name: "속성 제거", type: "cleanse", price: 8 },
  { name: "정화의 부적", type: "cleanse", price: 8 }
];

const tradeCards = [
  { name: "거래 제안서", type: "trade", price: 5 }
];

const sellCards = [
  { name: "암시장 판매권", type: "sell", price: 5 }
];

const convertCards = [
  {
    name: "자원 재분배",
    type: "convert",
    price: 5,
    description: "현재 HP + MP + 돈의 총합을 HP/MP/돈으로 다시 배분"
  }
];

const statusCards = [
  { name: "약물중독 주사", type: "poisonItem", price: 18 }
];

const cureCards = [
  { name: "해독 치료제", type: "cure", cureType: "basic", price: 12 },
  { name: "만병통치약", type: "cure", cureType: "all", price: 30 }
];

const POISON_ORDER = ["weak", "normal", "strong", "drug", "death"];

function elementName(element) {
  if (element === "fire") return "불";
  if (element === "water") return "물";
  if (element === "earth") return "땅";
  if (element === "wind") return "바람";
  if (element === "dark") return "어둠";
  if (element === "light") return "빛";
  return "무속성";
}

function poisonName(stage) {
  if (stage === "weak") return "약독";
  if (stage === "normal") return "중독";
  if (stage === "strong") return "강독";
  if (stage === "drug") return "약물중독";
  if (stage === "death") return "독살";
  return "정상";
}

function calculateEffectiveElement(baseElement, plusCards) {
  if (plusCards.length === 0) {
    return baseElement;
  }

  const changingCards = plusCards.filter(card => card.attributeChange === true);

  // 속성 변경 카드가 여러 속성으로 섞이면 무속성
  const changingElements = [
    ...new Set(changingCards.map(card => card.element || "none"))
  ];

  if (changingElements.length > 1) {
    return "none";
  }

  // 속성 변경 카드가 있으면 원래 속성을 변경
  let resultElement = baseElement;

  if (changingElements.length === 1) {
    resultElement = changingElements[0];
  }

  // 속성 변경 카드가 정한 속성과 다른 속성/무속성 카드가 섞이면 무속성
  const invalidCard = plusCards.some(card => {
    const cardElement = card.element || "none";

    return (
      card.attributeChange !== true &&
      cardElement !== resultElement &&
      cardElement !== "light"
    );
  });

  if (invalidCard) {
    return "none";
  }

  // 어둠은 어둠 속성 카드로만 유지
  if (resultElement === "dark") {
    const allDark = plusCards.every(
      card => (card.element || "none") === "dark"
    );

    if (!allDark) {
      return "none";
    }
  }

  // 빛은 빛 속성 카드로만 유지
  if (resultElement === "light") {
    const allLight = plusCards.every(
      card => (card.element || "none") === "light"
    );

    if (!allLight) {
      return "none";
    }
  }

  return resultElement;
}

function canDefenseBlock(attackElement, defenseElement) {
  if (attackElement === "none") return true;
  if (attackElement === "dark") return true;
  if (attackElement === "light") return false;

  if (defenseElement === "light") return true;

  if (attackElement === "fire") return defenseElement === "water";
  if (attackElement === "water") return defenseElement === "fire";
  if (attackElement === "earth") return defenseElement === "wind";
  if (attackElement === "wind") return defenseElement === "earth";

  return false;
}

function makeCard(base) {
  return {
    id: randomUUID(),
    ...base
  };
}

function cardPrice(card) {
  if (!card) return 0;
  return card.price || 0;
}

function drawRandomCard() {
  const r = Math.random();

  if (r < 0.27) {
    // 공격 카드 27%
    return makeCard(
      attackCards[Math.floor(Math.random() * attackCards.length)]
    );

  } else if (r < 0.32) {
    // +카드 8%
    return makeCard(
      plusCards[Math.floor(Math.random() * plusCards.length)]
    );

  } else if (r < 0.41) {
    // HP 회복 카드 9%
    return makeCard(
      healCards[Math.floor(Math.random() * healCards.length)]
    );

  } else if (r < 0.48) {
    // MP 회복 카드 7%
    return makeCard(
      manaHealCards[Math.floor(Math.random() * manaHealCards.length)]
    );

  } else if (r < 0.60) {
    // 방어 카드 12%
    return makeCard(
      defenseCards[Math.floor(Math.random() * defenseCards.length)]
    );

  } else if (r < 0.63) {
    // 반사/튕기기/무지개 반사 3%
    return makeCard(
      reflectCards[Math.floor(Math.random() * reflectCards.length)]
    );

  } else if (r < 0.66) {
    // 속성 제거 카드 3%
    return makeCard(
      cleanseCards[Math.floor(Math.random() * cleanseCards.length)]
    );

  } else if (r < 0.71) {
    // 거래 카드 5%
    return makeCard(
      tradeCards[Math.floor(Math.random() * tradeCards.length)]
    );

  } else if (r < 0.76) {
    // 판매 카드 5%
    return makeCard(
      sellCards[Math.floor(Math.random() * sellCards.length)]
    );

  } else if (r < 0.80) {
    // 자원 재분배 카드 4%
    return makeCard(
      convertCards[Math.floor(Math.random() * convertCards.length)]
    );

  } else if (r < 0.85) {
    // 상태이상 아이템 1%
    return makeCard(
      statusCards[Math.floor(Math.random() * statusCards.length)]
    );

  } else if (r < 0.89) {
    // 치료제 4%
    return makeCard(
      cureCards[Math.floor(Math.random() * cureCards.length)]
    );

  } else {
    // 마법 카드 12%
    return makeCard(
      magicCards[Math.floor(Math.random() * magicCards.length)]
    );
  }
}

function drawHand() {
  const hand = [];

  for (let i = 0; i < 10; i++) {
    hand.push(drawRandomCard());
  }

  return hand;
}

function shuffleArray(array) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function getPlayer(room, id) {
  return room.players.find(player => player.id === id);
}

function getSpectator(room, id) {
  return room.spectators.find(spectator => spectator.id === id);
}

function ensureStatus(player) {
  if (!player.status) {
    player.status = {
      poison: null,
      dazzled: false,
      blind: false,
      drunk: false,
      crazyTurns: 0,
      unlucky: false
    };
  }

  return player.status;
}

function statusSummary(player) {
  const status = ensureStatus(player);
  const list = [];

  if (status.poison) list.push(poisonName(status.poison));
  if (status.dazzled) list.push("눈부심");
  if (status.blind) list.push("실명");
  if (status.drunk) list.push("취함");
  if (status.crazyTurns > 0) list.push(`미침(${status.crazyTurns})`);
  if (status.unlucky) list.push("억까모드");

  return list;
}

function scheduleMoneyShortage(room, player, requiredMoney) {
  if (!player) return;

  const warningKey = player.id;

  if (room.moneyWarnings[warningKey]) return;

  room.moneyWarnings[warningKey] = true;

  room.log.push(
    `${player.nickname}의 돈이 부족합니다! 3초 후 턴이 종료됩니다.`
  );

  emitRoomState(room);

  setTimeout(() => {
    const currentPlayer = getPlayer(room, player.id);

    if (!currentPlayer) return;

    delete room.moneyWarnings[warningKey];

    room.pendingTrade = null;

    room.log.push(`${currentPlayer.nickname}의 돈 부족 처리가 끝났습니다.`);

    if (!room.winner && room.started) {
      finishAction(room, currentPlayer);
    }

    emitRoomState(room);
  }, 3000);
}

function schedulePoisonDeath(room, player) {
  if (!player || player.hp <= 0) return;

  const warningKey = player.id;

  if (room.deathWarnings[warningKey]) return;

  room.deathWarnings[warningKey] = true;

  room.log.push(`${player.nickname}에게 독살 경고가 나타났습니다! 3초 후 사망합니다.`);
  emitRoomState(room);

  setTimeout(() => {
    const currentPlayer = getPlayer(room, player.id);

    if (!currentPlayer) return;

    if (!room.deathWarnings[warningKey]) return;

    delete room.deathWarnings[warningKey];

    currentPlayer.hp = 0;
    room.log.push(`${currentPlayer.nickname}이/가 독살되어 사망했습니다.`);

    checkWinner(room);
    emitRoomState(room);
  }, 3000);
}

function worsenPoison(room, player, reason = "") {
  const status = ensureStatus(player);

  if (!status.poison) {
    status.poison = "weak";
    room.log.push(`${player.nickname}이/가 약독 상태가 되었습니다.`);
    return;
  }

  const currentIndex = POISON_ORDER.indexOf(status.poison);

  if (currentIndex === -1) {
    status.poison = "weak";
    room.log.push(`${player.nickname}이/가 약독 상태가 되었습니다.`);
    return;
  }

  if (currentIndex >= POISON_ORDER.length - 1) {
    status.poison = "death";
    player.hp = 0;
    room.log.push(`${player.nickname}이/가 독살 상태가 되어 즉사했습니다.`);
    checkWinner(room);
    return;
  }

  const nextStage = POISON_ORDER[currentIndex + 1];
  status.poison = nextStage;

  room.log.push(
    `${player.nickname}의 독 상태가 ${poisonName(nextStage)}으로 악화되었습니다.${reason ? ` (${reason})` : ""}`
  );

  if (nextStage === "death") {
  schedulePoisonDeath(room, player);
}
}

function applyPoisonAttack(room, target, poisonStage) {
  if (!poisonStage || target.hp <= 0) return;

  const status = ensureStatus(target);

  if (status.poison) {
    worsenPoison(room, target, "독공격");
    return;
  }

  status.poison = poisonStage;
  room.log.push(`${target.nickname}이/가 ${poisonName(poisonStage)} 상태가 되었습니다.`);

  if (poisonStage === "death") {
    target.hp = 0;
    room.log.push(`${target.nickname}이/가 독살 상태가 되어 즉사했습니다.`);
    checkWinner(room);
  }
}

function applyDrugAddictionItem(room, target) {
  const status = ensureStatus(target);

  if (status.poison) {
    worsenPoison(room, target, "약물중독 주사");
    return;
  }

  status.poison = "drug";
  room.log.push(`${target.nickname}이/가 약물중독 상태가 되었습니다.`);
}

function applyAfterActionStatus(room, player) {
  if (!player || player.hp <= 0) return;

  const status = ensureStatus(player);

  if (!status.poison) return;

  if (status.poison === "death") {
  schedulePoisonDeath(room, player);
  return;
}

  if (status.poison === "weak") {
    player.hp -= 1;
    room.log.push(`${player.nickname}이/가 약독으로 HP 1을 잃었습니다.`);
  }

  if (status.poison === "normal") {
    player.hp -= 2;
    room.log.push(`${player.nickname}이/가 중독으로 HP 2를 잃었습니다.`);
  }

  if (status.poison === "strong") {
    player.hp -= 5;
    room.log.push(`${player.nickname}이/가 강독으로 HP 5를 잃었습니다.`);
  }

  if (status.poison === "drug") {
    player.hp += 5;
    room.log.push(`${player.nickname}이/가 약물중독으로 HP 5를 회복했습니다.`);
  }

  if (player.hp <= 0) {
    player.hp = 0;
    room.log.push(`${player.nickname}의 HP가 0이 되었습니다.`);
    checkWinner(room);
    return;
  }

  if (Math.random() < 0.05) {
    worsenPoison(room, player, "5% 자연 악화");
  }
}

function cureBasic(player) {
  const status = ensureStatus(player);
  const before = statusSummary(player);

  if (status.poison === "weak" || status.poison === "normal") {
    status.poison = null;
  }

  status.dazzled = false;
  status.blind = false;

  const after = statusSummary(player);

  return {
    before,
    after
  };
}

function cureAll(player) {
  const before = statusSummary(player);

  player.status = {
    poison: null,
    dazzled: false,
    blind: false,
    drunk: false,
    crazyTurns: 0,
    unlucky: false
  };

  return {
    before,
    after: []
  };
}

function createRoom(roomCode, hostId) {
  rooms[roomCode] = {
    code: roomCode,
    hostId,
    players: [],
    spectators: [],
    started: false,
    turnIndex: 0,
    turnCount: 0,
    winner: null,
    lastWinnerNickname: null,
    pendingAttack: null,
    pendingTrade: null,
    pendingAction: null,
    log: [],
    chat: [],
    deathWarnings: {},
    moneyWarnings: {}
  };

  return rooms[roomCode];
}

function startGame(room) {
  room.players = shuffleArray(room.players);

  room.started = true;
  room.turnIndex = 0;
  room.turnCount = 1;
  room.winner = null;
  room.lastWinnerNickname = null;
  room.pendingAttack = null;
  room.pendingTrade = null;
  room.pendingAction = null;
  room.log = [];
  room.deathWarnings = {};
  room.moneyWarnings = {};

  room.players.forEach(player => {
    player.hp = START_HP;
    player.mp = START_MP;
    player.money = START_MONEY;
    player.pendingDraw = 0;
    player.status = {
      poison: null,
      dazzled: false,
      blind: false,
      drunk: false,
      crazyTurns: 0,
      unlucky: false
    };
    player.hand = drawHand();
  });

  room.log.push("방장이 게임을 시작했습니다.");
  room.log.push("턴 순서가 랜덤으로 결정되었습니다.");
  room.log.push(`${room.players[room.turnIndex].nickname}의 턴입니다.`);
}

function finishGame(room, winnerPlayer) {
  if (!winnerPlayer) return;

  room.winner = winnerPlayer.id;
  room.lastWinnerNickname = winnerPlayer.nickname;

  room.log.push(`${winnerPlayer.nickname} 승리!`);
  room.log.push("게임이 종료되어 준비 상태로 돌아갑니다. 참가 버튼을 눌러 다시 참여할 수 있습니다.");

  room.players.forEach(player => {
    const alreadySpectator = room.spectators.some(s => s.id === player.id);

    if (!alreadySpectator) {
      room.spectators.push({
        id: player.id,
        nickname: player.nickname
      });
    }
  });

  room.players = [];
  room.started = false;
  room.turnIndex = 0;
  room.turnCount = 0;
  room.pendingAttack = null;
  room.pendingTrade = null;
  room.pendingAction = null;
}

function publicCard(card) {
  if (!card) return null;

  return {
    id: card.id,
    name: card.name,
    type: card.type,
    damage: card.damage,
    bonus: card.bonus,
    heal: card.heal,
    defense: card.defense,
    mana: card.mana,
    element: card.element,
    price: card.price,
description: card.description,
reflectMode: card.reflectMode,
magicType: card.magicType,
healType: card.healType,
mpCost: card.mpCost,
reusable: card.reusable,
    poisonStage: card.poisonStage,
    cureType: card.cureType
  };
}

function getStateForViewer(room, viewerId) {
  const currentPlayer = room.players[room.turnIndex];
  const viewerPlayer = getPlayer(room, viewerId);
  const viewerSpectator = getSpectator(room, viewerId);

  let pendingAttack = null;

  if (room.pendingAttack) {
    const attacker = getPlayer(room, room.pendingAttack.attackerId);
    const defender = getPlayer(room, room.pendingAttack.defenderId);

    pendingAttack = {
      attackerId: room.pendingAttack.attackerId,
      defenderId: room.pendingAttack.defenderId,
      attackerNickname: attacker ? attacker.nickname : "",
      defenderNickname: defender ? defender.nickname : "",
      damage: room.pendingAttack.damage,
      attackName: room.pendingAttack.attackName,
      element: room.pendingAttack.element,
      poisonStage: room.pendingAttack.poisonStage
    };
  }

  let pendingTrade = null;

  if (room.pendingTrade) {
    const buyer = getPlayer(room, room.pendingTrade.buyerId);
    const seller = getPlayer(room, room.pendingTrade.sellerId);
    const revealedCard = seller
      ? seller.hand.find(card => card.id === room.pendingTrade.cardId)
      : null;

    pendingTrade = {
      buyerId: room.pendingTrade.buyerId,
      sellerId: room.pendingTrade.sellerId,
      buyerNickname: buyer ? buyer.nickname : "",
      sellerNickname: seller ? seller.nickname : "",
      price: room.pendingTrade.price,
      card: publicCard(revealedCard)
    };
  }

  return {
    roomCode: room.code,
    hostId: room.hostId,
    isHost: room.hostId === viewerId,
    isPlayer: !!viewerPlayer,
    isSpectator: !viewerPlayer && !!viewerSpectator,
    canJoin: !room.started && !viewerPlayer && room.players.length < MAX_PLAYERS,
    canStart: room.hostId === viewerId && !room.started && room.players.length >= 2,
    started: room.started,
    turnCount: room.turnCount,
    myId: viewerId,
    currentTurnId: currentPlayer ? currentPlayer.id : null,
    currentTurnNickname: currentPlayer ? currentPlayer.nickname : null,
    winnerId: room.winner,
    winnerNickname: room.lastWinnerNickname,
    pendingAttack,
    pendingTrade,
    pendingAction: room.pendingAction
  ? {
      type: room.pendingAction.type,
      userId: room.pendingAction.userId,
      targetId: room.pendingAction.targetId,
      userNickname: getPlayer(room, room.pendingAction.userId)?.nickname || "",
      targetNickname: getPlayer(room, room.pendingAction.targetId)?.nickname || "",
      heal: room.pendingAction.heal,
      amount: room.pendingAction.amount,
      cardId: room.pendingAction.cardId,
      cardName: room.pendingAction.cardName,
      price: room.pendingAction.price,
      sellerId: room.pendingAction.sellerId,
      buyerId: room.pendingAction.buyerId,
      soldCardId: room.pendingAction.soldCardId,
      reflectedCount: room.pendingAction.reflectedCount || 0
    }
  : null,
    players: room.players.map((player, index) => ({
      id: player.id,
      nickname: player.nickname,
      hp: player.hp,
      mp: player.mp,
      money: player.money,
      cardCount: player.hand.length,
      pendingDraw: player.pendingDraw || 0,
      order: index + 1,
      isMe: player.id === viewerId,
      isHost: player.id === room.hostId,
      status: statusSummary(player),
      hand: player.id === viewerId ? player.hand.map(publicCard) : []
    })),
    spectators: room.spectators.map(spectator => ({
      id: spectator.id,
      nickname: spectator.nickname,
      isMe: spectator.id === viewerId,
      isHost: spectator.id === room.hostId
    })),
    log: room.log.slice(-40),
    chat: room.chat ? room.chat.slice(-80) : [],
deathWarnings: Object.keys(room.deathWarnings || {}).map(playerId => ({
  playerId,
  message: "독살!",
  remainingMs: 3000
})),
moneyWarnings: Object.keys(room.moneyWarnings || {}).map(playerId => ({
  playerId,
  message: "돈 부족!",
  remainingMs: 3000
}))
  };
}

function emitRoomState(room) {
  room.players.forEach(player => {
    io.to(player.id).emit("gameState", getStateForViewer(room, player.id));
  });

  room.spectators.forEach(spectator => {
    io.to(spectator.id).emit("gameState", getStateForViewer(room, spectator.id));
  });
}

function consumeCard(player, cardIndex) {
  if (cardIndex < 0 || cardIndex >= player.hand.length) return;

  player.hand.splice(cardIndex, 1);
  player.pendingDraw = (player.pendingDraw || 0) + 1;
}

function consumeCards(player, indexes) {
  const uniqueIndexes = [...new Set(indexes)];

  uniqueIndexes
    .sort((a, b) => b - a)
    .forEach(index => {
      consumeCard(player, index);
    });
}

function refillPendingCards(player, room) {
  const count = player.pendingDraw || 0;

  if (count <= 0) return;

  for (let i = 0; i < count; i++) {
    player.hand.push(drawRandomCard());
  }

  player.pendingDraw = 0;
  room.log.push(`${player.nickname}이/가 턴 종료로 새 카드 ${count}장을 받았습니다.`);
}

function nextTurn(room) {
  room.players.forEach(player => {
    refillPendingCards(player, room);
  });

  if (room.winner) return;

  for (let i = 1; i <= room.players.length; i++) {
    const nextIndex = (room.turnIndex + i) % room.players.length;

    if (room.players[nextIndex].hp > 0) {
      room.turnIndex = nextIndex;
      break;
    }
  }

  room.turnCount += 1;

  const currentPlayer = room.players[room.turnIndex];

  if (currentPlayer) {
    room.log.push(`${currentPlayer.nickname}의 턴입니다.`);
  }
}

function checkWinner(room) {
  const alivePlayers = room.players.filter(player => player.hp > 0);

  if (room.started && alivePlayers.length === 1) {
    finishGame(room, alivePlayers[0]);
    return true;
  }

  return false;
}

function finishAction(room, actor) {
  if (!room.winner) {
    applyAfterActionStatus(room, actor);
  }

  if (!room.winner) {
    nextTurn(room);
  }
}

function applyDamage(room, target, damage, element = "none") {
  if (damage <= 0) {
    room.log.push(`${target.nickname}은/는 피해를 받지 않았습니다.`);
    return false;
  }

  if (element === "dark") {
    target.hp = 0;
    room.log.push(`${target.nickname}이/가 어둠 속성 피해를 받아 즉사했습니다.`);
  } else {
    target.hp -= damage;

    if (target.hp < 0) {
      target.hp = 0;
    }

    room.log.push(`${target.nickname}이/가 ${damage} 데미지를 받았습니다.`);
  }

  if (target.hp <= 0) {
    room.log.push(`${target.nickname}의 HP가 0이 되었습니다.`);
    checkWinner(room);
  }

  return true;
}

function forcePayCardPrice(room, payer, receiver, price) {
  let remaining = price;

  const paidMoney = Math.min(payer.money, remaining);
  payer.money -= paidMoney;
  remaining -= paidMoney;

  const paidMp = Math.min(payer.mp, remaining);
  payer.mp -= paidMp;
  remaining -= paidMp;

  let paidHp = 0;

  if (remaining > 0) {
    paidHp = remaining;
    payer.hp -= paidHp;

    if (payer.hp < 0) {
      payer.hp = 0;
    }

    remaining = 0;
  }

  receiver.money += price;

  room.log.push(
    `${payer.nickname}이/가 카드값 ${price}을 지불했습니다. ` +
    `(돈 ${paidMoney}, MP ${paidMp}, HP ${paidHp} 차감)`
  );

  if (payer.hp <= 0) {
    room.log.push(`${payer.nickname}의 HP가 0이 되었습니다.`);
    checkWinner(room);
  }
}

io.on("connection", socket => {
  console.log("접속:", socket.id);

  socket.on("joinGame", ({ nickname, roomCode }) => {
    nickname = String(nickname || "").trim();
    roomCode = String(roomCode || "room1").trim();

    if (!nickname) {
      socket.emit("errorMessage", "닉네임을 입력하세요.");
      return;
    }

    let room = rooms[roomCode];

    if (!room) {
      room = createRoom(roomCode, socket.id);
    }

    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    const alreadyPlayer = getPlayer(room, socket.id);
    const alreadySpectator = getSpectator(room, socket.id);

    if (alreadyPlayer || alreadySpectator) {
      emitRoomState(room);
      return;
    }

    room.spectators.push({
      id: socket.id,
      nickname
    });

    socket.data.role = "spectator";
    room.log.push(`${nickname} 님이 대기자로 입장했습니다.`);

    emitRoomState(room);
  });

  socket.on("joinAsPlayer", () => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room) return;

    if (room.started) {
      socket.emit("errorMessage", "게임이 진행 중일 때는 참가할 수 없습니다.");
      return;
    }

    if (getPlayer(room, socket.id)) {
      socket.emit("errorMessage", "이미 참가자입니다.");
      return;
    }

    if (room.players.length >= MAX_PLAYERS) {
      socket.emit("errorMessage", "참가 인원이 가득 찼습니다.");
      return;
    }

    const spectator = getSpectator(room, socket.id);

    if (!spectator) {
      socket.emit("errorMessage", "먼저 방에 입장해야 합니다.");
      return;
    }

    room.spectators = room.spectators.filter(s => s.id !== socket.id);

    const player = {
      id: socket.id,
      nickname: spectator.nickname,
      hp: START_HP,
      mp: START_MP,
      money: START_MONEY,
      pendingDraw: 0,
      status: {
        poison: null,
        dazzled: false,
        blind: false,
        drunk: false,
        crazyTurns: 0,
        unlucky: false
      },
      hand: []
    };

    room.players.push(player);
    socket.data.role = "player";

    room.log.push(`${player.nickname} 님이 참가자로 등록했습니다.`);

    emitRoomState(room);
  });

  socket.on("startGame", () => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room) return;

    if (room.hostId !== socket.id) {
      socket.emit("errorMessage", "방장만 게임을 시작할 수 있습니다.");
      return;
    }

    if (room.started) {
      socket.emit("errorMessage", "이미 시작된 게임입니다.");
      return;
    }

    if (room.players.length < 2) {
      socket.emit("errorMessage", "참가자가 2명 이상이어야 시작할 수 있습니다.");
      return;
    }

    startGame(room);
    emitRoomState(room);
  });

  socket.on("drawIfNoAttack", () => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    if (room.pendingAttack || room.pendingTrade) {
      socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
      return;
    }

    const currentPlayer = room.players[room.turnIndex];

    if (!currentPlayer || currentPlayer.id !== socket.id) {
      socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
      return;
    }

    const hasAttackCard = currentPlayer.hand.some(card => card.type === "attack");

    if (hasAttackCard) {
      socket.emit("errorMessage", "공격 카드가 있을 때는 무료 드로우를 할 수 없습니다.");
      return;
    }

    currentPlayer.hand.push(drawRandomCard());

    room.log.push(
      `${currentPlayer.nickname}이/가 공격 카드가 없어 아무 행동 없이 랜덤 카드 1장을 받았습니다.`
    );

    finishAction(room, currentPlayer);
    emitRoomState(room);
  });

  socket.on("useAttack", ({ attackCardId, plusCardId, plusCardIds, targetId }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    if (room.pendingAttack || room.pendingTrade) {
      socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
      return;
    }

    const currentPlayer = room.players[room.turnIndex];

    if (!currentPlayer || currentPlayer.id !== socket.id) {
      socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
      return;
    }

    const attacker = currentPlayer;
    const target = room.players.find(player => player.id === targetId && player.hp > 0);

    if (!target) {
      socket.emit("errorMessage", "공격 대상을 선택하세요.");
      return;
    }

    const selectedPlusIds = Array.isArray(plusCardIds)
      ? plusCardIds
      : plusCardId
        ? [plusCardId]
        : [];

    const uniquePlusIds = [...new Set(selectedPlusIds)];

    const attackIndex = attackCardId
  ? attacker.hand.findIndex(card =>
      card.id === attackCardId &&
      (
        card.type === "attack" ||
        (card.type === "reflect" && Number(card.damage) > 0)
      )
    )
  : -1;

    if (attackCardId && attackIndex === -1) {
      socket.emit("errorMessage", "공격 카드를 선택하세요.");
      return;
    }

    if (!attackCardId && uniquePlusIds.length === 0) {
      socket.emit("errorMessage", "공격 카드 또는 +카드를 선택하세요.");
      return;
    }

    const plusIndexes = uniquePlusIds.map(id =>
      attacker.hand.findIndex(card => card.id === id && card.type === "plus")
    );

    if (plusIndexes.some(index => index === -1)) {
      socket.emit("errorMessage", "선택한 +카드 중 사용할 수 없는 카드가 있습니다.");
      return;
    }

    let damage = 0;
    let baseElement = "none";
    let poisonStage = null;
    const usedIndexes = [];
    const attackNameParts = [];
    let attackCard = null;

    if (attackIndex !== -1) {
      attackCard = attacker.hand[attackIndex];
      damage += attackCard.damage;
      baseElement = attackCard.element || "none";
      poisonStage = attackCard.poisonStage || null;
      usedIndexes.push(attackIndex);
      attackNameParts.push(attackCard.name);
    }

    const usedPlusCards = plusIndexes.map(index => attacker.hand[index]);

    usedPlusCards.forEach((card, i) => {
      damage += card.bonus;
      usedIndexes.push(plusIndexes[i]);
      attackNameParts.push(card.name);
    });

    let effectiveElement = baseElement;

if (usedPlusCards.length > 0) {
  effectiveElement = calculateEffectiveElement(
    baseElement,
    usedPlusCards
  );
}

    const attackName = attackNameParts.join(" + ");

    consumeCards(attacker, usedIndexes);

    if (attackCard && baseElement !== "none" && effectiveElement === "none") {
      room.log.push(
        `${attackCard.name}의 ${elementName(baseElement)} 속성이 +카드 조건을 만족하지 못해 제거되었습니다.`
      );
    }

    if (attacker.id === target.id) {
      room.log.push(
        `${attacker.nickname}이/가 자기 자신에게 ${elementName(effectiveElement)} 속성 ${attackName} 카드로 ${damage} 공격했습니다.`
      );

      const damaged = applyDamage(room, target, damage, effectiveElement);

      if (!room.winner && damaged && poisonStage && target.hp > 0) {
        applyPoisonAttack(room, target, poisonStage);
      }

      finishAction(room, attacker);
      emitRoomState(room);
      return;
    }

    room.pendingAttack = {
      attackerId: attacker.id,
      defenderId: target.id,
      damage,
      attackName,
      element: effectiveElement,
      poisonStage
    };

    room.log.push(
      `${attacker.nickname}이/가 ${target.nickname}에게 ${elementName(effectiveElement)} 속성 ${attackName} 카드로 ${damage} 공격을 시도했습니다.`
    );

    if (poisonStage) {
      room.log.push(`피해가 1 이상 들어가면 ${poisonName(poisonStage)} 상태가 적용됩니다.`);
    }

    if (effectiveElement === "light") {
      room.log.push("빛 속성 공격은 속성 제거 없이는 방어할 수 없습니다.");
    }

    if (effectiveElement === "dark") {
      room.log.push("어둠 속성 공격은 피해가 1이라도 들어가면 즉사합니다.");
    }

    if (["fire", "water", "earth", "wind"].includes(effectiveElement)) {
      room.log.push(`${elementName(effectiveElement)} 속성 공격은 상성에 맞는 방어 카드로만 막을 수 있습니다.`);
    }

    if (effectiveElement !== "none") {
      room.log.push("반사/튕겨내기는 무속성 공격에만 가능하며, 속성 제거를 함께 쓰면 가능합니다.");
    }

    room.log.push(`${target.nickname}은/는 방어, 반사, 속성 제거, 또는 그냥 맞기를 선택해야 합니다.`);

    emitRoomState(room);
  });

  socket.on("useMagic", ({
  magicCardId,
  targetId,
  attackCardId,
  plusCardIds = []
}) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    if (room.pendingAttack || room.pendingTrade || room.pendingAction) {
      socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
      return;
    }

    const currentPlayer = room.players[room.turnIndex];

    if (!currentPlayer || currentPlayer.id !== socket.id) {
      socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
      return;
    }

    const user = currentPlayer;

    const magicCard = user.hand.find(
      card => card.id === magicCardId && card.type === "magic"
    );

    if (!magicCard) {
      socket.emit("errorMessage", "마법 카드를 선택하세요.");
      return;
    }

    if (user.mp < magicCard.mpCost) {
      socket.emit(
        "errorMessage",
        `MP가 부족합니다. 필요: ${magicCard.mpCost}, 현재: ${user.mp}`
      );
      return;
    }

    const target = room.players.find(
      player => player.id === targetId && player.hp > 0
    );

    if (!target) {
      socket.emit("errorMessage", "대상을 선택하세요.");
      return;
    }

    user.mp -= magicCard.mpCost;

    // 마약 투여
    if (magicCard.magicType === "drug") {
      applyDrugAddictionItem(room, target);
      room.log.push(
        `${user.nickname}이/가 ${target.nickname}에게 마약 투여를 사용했습니다.`
      );
    }

    // 아바다 케다브라
    else if (magicCard.magicType === "attack") {
      room.pendingAttack = {
        attackerId: user.id,
        defenderId: target.id,
        damage: magicCard.damage,
        attackName: magicCard.name,
        element: magicCard.element || "none",
        poisonStage: null,
        isMagic: true
      };

      room.log.push(
        `${user.nickname}이/가 ${magicCard.name}을 사용했습니다.`
      );
      room.log.push(`${target.nickname}은/는 마법 방어를 선택해야 합니다.`);

      emitRoomState(room);
      return;
    }

    // 디토스
      // 디토스
    else if (magicCard.magicType === "cure") {
      cureAll(target);

      room.log.push(
        `${user.nickname}이/가 ${target.nickname}에게 디토스를 사용했습니다.`
      );

      finishAction(room, user);
      emitRoomState(room);
      return;
    }

    // 졸트라크
    else if (magicCard.magicType === "plus") {
      let damage;
      let attackName;
      let element;

      // 공격 카드 없이 졸트라크만 사용
      if (!attackCardId) {
        damage = magicCard.bonus;
        attackName = magicCard.name;
        element = magicCard.element || "light";

        room.log.push(
          `${user.nickname}이/가 ${magicCard.name}을 단독 사용했습니다.`
        );
      } else {
        const attackIndex = user.hand.findIndex(card =>
          card.id === attackCardId &&
          (
            card.type === "attack" ||
            (card.type === "reflect" && Number(card.damage) > 0)
          )
        );

        if (attackIndex === -1) {
          user.mp += magicCard.mpCost;
          socket.emit("errorMessage", "사용할 공격 카드를 찾을 수 없습니다.");
          return;
        }

        const attackCard = user.hand[attackIndex];

        damage = (attackCard.damage || 0) + magicCard.bonus;
        attackName = `${attackCard.name} + ${magicCard.name}`;
        if (!attackCardId) {
  damage = magicCard.bonus;
  attackName = magicCard.name;
  element = magicCard.element || "light";
}

        consumeCard(user, attackIndex);

        room.log.push(
          `${user.nickname}이/가 ${attackCard.name}에 ${magicCard.name}을 사용했습니다.`
        );
      }

      room.pendingAttack = {
        attackerId: user.id,
        defenderId: target.id,
        damage,
        attackName,
        element,
        poisonStage: null,
        isMagic: true
      };

      emitRoomState(room);
      return;
    }

    // 따블로 간다!
    else if (magicCard.magicType === "doubleAttack") {
      if (!attackCardId) {
        user.mp += magicCard.mpCost;
        socket.emit(
          "errorMessage",
          "따블로 간다!는 공격 카드를 함께 선택해야 합니다."
        );
        return;
      }

      const attackIndex = user.hand.findIndex(card =>
        card.id === attackCardId &&
        (
          card.type === "attack" ||
          (card.type === "reflect" && Number(card.damage) > 0)
        )
      );

      if (attackIndex === -1) {
        user.mp += magicCard.mpCost;
        socket.emit("errorMessage", "사용할 공격 카드를 찾을 수 없습니다.");
        return;
      }

      const attackCard = user.hand[attackIndex];

      const selectedPlusIds = Array.isArray(plusCardIds)
        ? [...new Set(plusCardIds)]
        : [];

      const plusIndexes = selectedPlusIds.map(id =>
        user.hand.findIndex(card =>
          card.id === id && card.type === "plus"
        )
      );

      if (plusIndexes.some(index => index === -1)) {
        user.mp += magicCard.mpCost;
        socket.emit("errorMessage", "선택한 +카드를 찾을 수 없습니다.");
        return;
      }

      const usedPlusCards = plusIndexes.map(index => user.hand[index]);

      // 계산 순서: 기본 공격력 × 2 → +카드 공격력 합산
      const plusDamage = usedPlusCards.reduce(
        (total, card) => total + card.bonus,
        0
      );

      const finalDamage =
        (attackCard.damage || 0) * 2 + plusDamage;

      // 기본은 무속성
      let finalElement = "none";

      // 속성 변경 무기형 +카드가 있으면 해당 속성으로 변경
      const attributeElements = [
        ...new Set(
          usedPlusCards
            .filter(card => card.attributeChange === true)
            .map(card => card.element || "none")
        )
      ];

      if (attributeElements.length === 1) {
        finalElement = attributeElements[0];
      } else if (attributeElements.length > 1) {
        finalElement = "none";
      }

      consumeCards(user, [
        attackIndex,
        ...plusIndexes
      ]);

      room.pendingAttack = {
        attackerId: user.id,
        defenderId: target.id,
        damage: finalDamage,
        attackName: `${attackCard.name} + ${magicCard.name}`,
        element: finalElement,
        poisonStage: null,
        isMagic: true
      };

      room.log.push(
        `${user.nickname}이/가 ${magicCard.name}을 사용했습니다.`
      );

      room.log.push(
        `계산: ${attackCard.damage} × 2 + ${plusDamage} = ${finalDamage}`
      );

      emitRoomState(room);
      return;
    }

    // 못맞췄지롱!
    else if (magicCard.magicType === "miss") {
      room.pendingAttack = {
        attackerId: user.id,
        defenderId: target.id,
        damage: 0,
        attackName: magicCard.name,
        element: "none",
        poisonStage: null,
        isMagic: true,
        unavoidableBlock: true
      };

      room.log.push(
        `${user.nickname}이/가 못맞췄지롱!을 사용했습니다.`
      );

      emitRoomState(room);
      return;
    }

    finishAction(room, user);
    emitRoomState(room);
  });

  socket.on("useHeal", ({ healCardId, targetId }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    if (room.pendingAttack || room.pendingTrade || room.pendingAction) {
      socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
      return;
    }

    const currentPlayer = room.players[room.turnIndex];

    if (!currentPlayer || currentPlayer.id !== socket.id) {
      socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
      return;
    }

    const healer = currentPlayer;

    const target = room.players.find(
      player => player.id === targetId && player.hp > 0
    );

    if (!target) {
      socket.emit("errorMessage", "회복 대상을 선택하세요.");
      return;
    }

    const healIndex = healer.hand.findIndex(
      card => card.id === healCardId && card.type === "heal"
    );

    if (healIndex === -1) {
      socket.emit("errorMessage", "회복 카드를 선택하세요.");
      return;
    }

    const healCard = healer.hand[healIndex];

    // 자신에게 쓰는 회복은 바로 적용
    if (target.id === healer.id) {
      target.hp += healCard.heal;

      room.log.push(
        `${healer.nickname}이/가 자신에게 ${healCard.name}을 사용해 HP ${healCard.heal}을 회복했습니다.`
      );

      consumeCard(healer, healIndex);
      finishAction(room, healer);
      emitRoomState(room);
      return;
    }

    // 상대에게 쓰는 회복은 대상의 승인 대기
    room.pendingAction = {
      type: "heal",
      userId: healer.id,
      targetId: target.id,
      heal: healCard.heal,
      healCardId,
      healCardIndex: healIndex,
      healCardName: healCard.name
    };

    room.log.push(
      `${healer.nickname}이/가 ${target.nickname}에게 ${healCard.name}을 사용하려 합니다.`
    );
    room.log.push(`${target.nickname}은/는 회복을 받을지 결정해야 합니다.`);

    emitRoomState(room);
  });

   socket.on("useManaHeal", ({ manaHealCardId, targetId }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    if (room.pendingAttack || room.pendingTrade || room.pendingAction) {
      socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
      return;
    }

    const user = room.players[room.turnIndex];

    if (!user || user.id !== socket.id) {
      socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
      return;
    }

    const target = room.players.find(
      player => player.id === targetId && player.hp > 0
    );

    if (!target) {
      socket.emit("errorMessage", "마나 회복 대상을 선택하세요.");
      return;
    }

    const cardIndex = user.hand.findIndex(
      card => card.id === manaHealCardId && card.type === "manaHeal"
    );

    if (cardIndex === -1) {
      socket.emit("errorMessage", "마나 회복 카드를 선택하세요.");
      return;
    }

    const manaCard = user.hand[cardIndex];

    // 자신에게 쓰면 즉시 적용
    if (target.id === user.id) {
      user.mp += manaCard.mana;

      room.log.push(
        `${user.nickname}이/가 자신에게 ${manaCard.name}을 사용해 MP ${manaCard.mana}를 회복했습니다.`
      );

      consumeCard(user, cardIndex);
      finishAction(room, user);
      emitRoomState(room);
      return;
    }

    // 상대에게 쓰면 대상의 빈 공간 결정 대기
    room.pendingAction = {
      type: "manaHeal",
      userId: user.id,
      targetId: target.id,
      cardId: manaCard.id,
      cardName: manaCard.name,
      amount: manaCard.mana
    };

    room.log.push(
      `${user.nickname}이/가 ${target.nickname}에게 ${manaCard.name}을 사용하려 합니다.`
    );

    room.log.push(
      `${target.nickname}은/는 효과를 적용하거나 무지개 반사를 사용할 수 있습니다.`
    );

    emitRoomState(room);
  });

  socket.on("usePoisonItem", ({ cardId, targetId }) => {
  const roomCode = socket.data.roomCode;
  const room = rooms[roomCode];

  if (!room || !room.started || room.winner) return;

  if (room.pendingAttack || room.pendingTrade || room.pendingAction) {
    socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
    return;
  }

  const user = room.players[room.turnIndex];

  if (!user || user.id !== socket.id) {
    socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
    return;
  }

  const target = room.players.find(
    player => player.id === targetId && player.hp > 0
  );

  if (!target) {
    socket.emit("errorMessage", "대상을 선택하세요.");
    return;
  }

  const cardIndex = user.hand.findIndex(
    card => card.id === cardId && card.type === "poisonItem"
  );

  if (cardIndex === -1) {
    socket.emit("errorMessage", "약물중독 주사 카드를 선택하세요.");
    return;
  }

  const card = user.hand[cardIndex];

  // 자신에게 사용하면 바로 적용
  if (target.id === user.id) {
    applyDrugAddictionItem(room, target);

    room.log.push(
      `${user.nickname}이/가 자신에게 ${card.name}을 사용했습니다.`
    );

    consumeCard(user, cardIndex);
    finishAction(room, user);
    emitRoomState(room);
    return;
  }

  // 상대에게 사용하면 대상 결정 대기
  room.pendingAction = {
    type: "poisonItem",
    userId: user.id,
    targetId: target.id,
    cardId: card.id,
    cardName: card.name
  };

  room.log.push(
    `${user.nickname}이/가 ${target.nickname}에게 ${card.name}을 사용하려 합니다.`
  );

  emitRoomState(room);
});

  socket.on("useCure", ({ cardId, targetId }) => {
  const roomCode = socket.data.roomCode;
  const room = rooms[roomCode];

  if (!room || !room.started || room.winner) return;

  if (room.pendingAttack || room.pendingTrade || room.pendingAction) {
    socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
    return;
  }

  const user = room.players[room.turnIndex];

  if (!user || user.id !== socket.id) {
    socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
    return;
  }

  const target = room.players.find(
    player => player.id === targetId && player.hp > 0
  );

  if (!target) {
    socket.emit("errorMessage", "치료 대상을 선택하세요.");
    return;
  }

  const cardIndex = user.hand.findIndex(
    card => card.id === cardId && card.type === "cure"
  );

  if (cardIndex === -1) {
    socket.emit("errorMessage", "치료제 카드를 선택하세요.");
    return;
  }

  const card = user.hand[cardIndex];

  // 자신에게 사용하면 바로 적용
  if (target.id === user.id) {
    if (card.cureType === "basic") {
      cureBasic(target);
    } else {
      cureAll(target);
    }

    room.log.push(
      `${user.nickname}이/가 자신에게 ${card.name}을 사용했습니다.`
    );

    consumeCard(user, cardIndex);
    finishAction(room, user);
    emitRoomState(room);
    return;
  }

  // 상대에게 사용하면 대상 결정 대기
  room.pendingAction = {
    type: "cure",
    userId: user.id,
    targetId: target.id,
    cardId: card.id,
    cardName: card.name,
    cureType: card.cureType
  };

  room.log.push(
    `${user.nickname}이/가 ${target.nickname}에게 ${card.name}을 사용하려 합니다.`
  );

  emitRoomState(room);
});

    socket.on("useTrade", ({ tradeCardId, targetId }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    if (room.pendingAttack || room.pendingTrade || room.pendingAction) {
      socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
      return;
    }

    const buyer = room.players[room.turnIndex];

    if (!buyer || buyer.id !== socket.id) {
      socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
      return;
    }

    const seller = room.players.find(
      player =>
        player.id === targetId &&
        player.id !== buyer.id &&
        player.hp > 0
    );

    if (!seller) {
      socket.emit(
        "errorMessage",
        "구매할 상대를 선택하세요. 자기 자신에게는 사용할 수 없습니다."
      );
      return;
    }

    if (seller.hand.length === 0) {
      socket.emit("errorMessage", "상대의 패가 없습니다.");
      return;
    }

    const tradeIndex = buyer.hand.findIndex(
      card => card.id === tradeCardId && card.type === "trade"
    );

    if (tradeIndex === -1) {
      socket.emit("errorMessage", "거래 제안서 카드를 선택하세요.");
      return;
    }

    // 거래 제안서 자체는 아직 소모하지 않음.
    // 대상이 일반 결정하거나, 반사 체인이 끝난 뒤에 소모됨.
    room.pendingAction = {
      type: "tradeRequest",
      sourceUserId: buyer.id,
      userId: buyer.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      targetId: seller.id,
      cardId: tradeCardId,
      cardName: buyer.hand[tradeIndex].name,
      reflectedCount: 0
    };

    room.log.push(
      `${buyer.nickname}이/가 ${seller.nickname}에게 구매를 시도했습니다.`
    );

    room.log.push(
      `${seller.nickname}은/는 빈 공간을 클릭해 카드 공개를 허용하거나 무지개 반사를 사용할 수 있습니다.`
    );

    emitRoomState(room);
  });

  socket.on("respondTrade", ({ buy }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    const pending = room.pendingTrade;

    if (!pending) {
      socket.emit("errorMessage", "진행 중인 거래가 없습니다.");
      return;
    }

    if (pending.buyerId !== socket.id) {
      socket.emit("errorMessage", "거래 결정권자가 아닙니다.");
      return;
    }

    const buyer = getPlayer(room, pending.buyerId);
    const seller = getPlayer(room, pending.sellerId);

    if (!buyer || !seller) return;

    const cardIndex = seller.hand.findIndex(card => card.id === pending.cardId);

    if (cardIndex === -1) {
      room.log.push("거래 대상 카드가 사라져 거래가 취소되었습니다.");
      room.pendingTrade = null;
      finishAction(room, buyer);
      emitRoomState(room);
      return;
    }

const card = seller.hand[cardIndex];

if (buy) {
  if (buyer.money < pending.price) {
    scheduleMoneyShortage(room, buyer, pending.price);
    return;
  }

  buyer.money -= pending.price;
  seller.money += pending.price;

  seller.hand.splice(cardIndex, 1);
  buyer.hand.push(card);

  room.log.push(
    `${buyer.nickname}이/가 ${seller.nickname}에게 ${pending.price}돈을 지불하고 ${card.name} 카드를 구매했습니다.`
  );
} else {
  room.log.push(`${buyer.nickname}이/가 ${card.name} 카드 구매를 거절했습니다.`);
}

    room.pendingTrade = null;

    finishAction(room, buyer);
    emitRoomState(room);
  });

    socket.on("useSell", ({ sellCardId, targetId, soldCardId }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    if (room.pendingAttack || room.pendingTrade || room.pendingAction) {
      socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
      return;
    }

    const seller = room.players[room.turnIndex];

    if (!seller || seller.id !== socket.id) {
      socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
      return;
    }

    const buyer = room.players.find(
      player =>
        player.id === targetId &&
        player.id !== seller.id &&
        player.hp > 0
    );

    if (!buyer) {
      socket.emit("errorMessage", "판매할 상대를 선택하세요.");
      return;
    }

    const sellIndex = seller.hand.findIndex(
      card => card.id === sellCardId && card.type === "sell"
    );

    if (sellIndex === -1) {
      socket.emit("errorMessage", "암시장 판매권을 선택하세요.");
      return;
    }

    const soldIndex = seller.hand.findIndex(
      card => card.id === soldCardId
    );

    if (soldIndex === -1 || soldIndex === sellIndex) {
      socket.emit("errorMessage", "판매할 카드를 올바르게 선택하세요.");
      return;
    }

    const soldCard = seller.hand[soldIndex];

    // 판매권은 사용 시 소모. 판매할 카드는 최종 결정 전까지 이동하지 않음.
    consumeCard(seller, sellIndex);

    room.pendingAction = {
      type: "sellRequest",
      sourceUserId: seller.id,
      userId: seller.id,
      sellerId: seller.id,
      buyerId: buyer.id,
      targetId: buyer.id,
      soldCardId: soldCard.id,
      cardName: soldCard.name,
      price: cardPrice(soldCard),
      reflectedCount: 0
    };

    room.log.push(
      `${seller.nickname}이/가 ${buyer.nickname}에게 ${soldCard.name} 카드를 판매하려 합니다.`
    );

    room.log.push(
      `${buyer.nickname}은/는 빈 공간을 클릭해 판매를 적용하거나 무지개 반사를 사용할 수 있습니다.`
    );

    emitRoomState(room);
  });

  socket.on("useConvert", ({ convertCardId, newHp, newMp, newMoney }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    if (room.pendingAttack || room.pendingTrade) {
      socket.emit("errorMessage", "현재 처리 중인 행동이 먼저 끝나야 합니다.");
      return;
    }

    const currentPlayer = room.players[room.turnIndex];

    if (!currentPlayer || currentPlayer.id !== socket.id) {
      socket.emit("errorMessage", "지금은 당신의 턴이 아닙니다.");
      return;
    }

    const player = currentPlayer;

    const convertIndex = player.hand.findIndex(
      card => card.id === convertCardId && card.type === "convert"
    );

    if (convertIndex === -1) {
      socket.emit("errorMessage", "자원 재분배 카드를 선택하세요.");
      return;
    }

    const hpValue = Number(newHp);
    const mpValue = Number(newMp);
    const moneyValue = Number(newMoney);

    if (
      !Number.isInteger(hpValue) ||
      !Number.isInteger(mpValue) ||
      !Number.isInteger(moneyValue)
    ) {
      socket.emit("errorMessage", "HP, MP, 돈은 정수로 입력해야 합니다.");
      return;
    }

    if (hpValue < 0 || mpValue < 0 || moneyValue < 0) {
      socket.emit("errorMessage", "HP, MP, 돈은 0 이상이어야 합니다.");
      return;
    }

    const currentTotal = player.hp + player.mp + player.money;
    const inputTotal = hpValue + mpValue + moneyValue;

    if (inputTotal !== currentTotal) {
      socket.emit(
        "errorMessage",
        `입력한 총합이 현재 총합과 같아야 합니다. 현재 총합: ${currentTotal}, 입력 총합: ${inputTotal}`
      );
      return;
    }

    const beforeHp = player.hp;
    const beforeMp = player.mp;
    const beforeMoney = player.money;

    player.hp = hpValue;
    player.mp = mpValue;
    player.money = moneyValue;

    room.log.push(
      `${player.nickname}이/가 자원 재분배를 사용했습니다. ` +
      `HP ${beforeHp}→${player.hp}, MP ${beforeMp}→${player.mp}, 돈 ${beforeMoney}→${player.money}`
    );

    consumeCard(player, convertIndex);

    if (player.hp <= 0) {
      room.log.push(`${player.nickname}의 HP가 0이 되었습니다.`);
      checkWinner(room);
    }

    if (!room.winner) {
      finishAction(room, player);
    }

    emitRoomState(room);
  });

  socket.on("respondDefense", ({ defenseCardId, defenseCardIds, reflectCardId, cleanseCardId,magicCardId,takeHit}) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    const pending = room.pendingAttack;

    if (!pending) {
      socket.emit("errorMessage", "현재 방어할 공격이 없습니다.");
      return;
    }

    if (pending.defenderId !== socket.id) {
      socket.emit("errorMessage", "현재 당신이 방어할 차례가 아닙니다.");
      return;
    }

    const defender = getPlayer(room, pending.defenderId);
    const attacker = getPlayer(room, pending.attackerId);

    if (!defender || !attacker) return;

    const selectedDefenseIds = Array.isArray(defenseCardIds)
      ? defenseCardIds
      : defenseCardId
        ? [defenseCardId]
        : [];

    const uniqueDefenseIds = [...new Set(selectedDefenseIds)];

    const cleanseIndex = cleanseCardId
      ? defender.hand.findIndex(card => card.id === cleanseCardId && card.type === "cleanse")
      : -1;

    const hasCleanse = !!cleanseCardId && cleanseIndex !== -1;

    if (cleanseCardId && cleanseIndex === -1) {
      socket.emit("errorMessage", "속성 제거 카드를 선택하세요.");
      return;
    }

let effectiveElement = pending.element || "none";

if (hasCleanse) {
  effectiveElement = "none";
}


const missMagicIndex = magicCardId
  ? defender.hand.findIndex(card =>
      card.id === magicCardId &&
      card.type === "magic" &&
      card.magicType === "miss"
    )
  : -1;

if (magicCardId && missMagicIndex === -1) {
  socket.emit("errorMessage", "못맞췄지롱! 마법 카드를 찾을 수 없습니다.");
  return;
}

if (magicCardId) {
  if (effectiveElement !== "none") {
    socket.emit(
      "errorMessage",
      "못맞췄지롱!은 무속성 공격만 방어할 수 있습니다."
    );
    return;
  }

  if (defender.mp < 7) {
    socket.emit("errorMessage", "MP가 부족합니다. 필요한 MP: 7");
    return;
  }

  defender.mp -= 7;

  room.log.push(
    `${defender.nickname}이/가 못맞췄지롱!을 사용해 무속성 공격을 막았습니다.`
  );

  // 마법 카드는 패에 남고 MP만 소모
  room.pendingAttack = null;

  if (!room.winner) {
    finishAction(room, defender);
  }

  emitRoomState(room);
  return;
}

    if (reflectCardId && uniqueDefenseIds.length > 0) {
      socket.emit("errorMessage", "방어와 반사는 동시에 사용할 수 없습니다.");
      return;
    }

    const selectedReflectCard = defender.hand.find(
  card =>
    card.id === reflectCardId &&
    (
      card.type === "reflect" ||
      card.type === "rainbowReflect"
    )
);

const isRainbowReflect =
  selectedReflectCard &&
  selectedReflectCard.type === "rainbowReflect";

if (reflectCardId && effectiveElement !== "none" && !isRainbowReflect) {
  socket.emit(
    "errorMessage",
    "일반 반사/튕겨내기는 무속성 공격에만 사용할 수 있습니다. 무지개 반사를 사용하세요."
  );
  return;
}

    if (reflectCardId) {
      const reflectIndex = defender.hand.findIndex(
  card =>
    card.id === reflectCardId &&
    (
      card.type === "reflect" ||
      card.type === "rainbowReflect"
    )
);

      if (reflectIndex === -1) {
        socket.emit("errorMessage", "반사/튕겨내기 카드를 선택하세요.");
        return;
      }

      const reflectCard = defender.hand[reflectIndex];

      const consumeIndexes = [reflectIndex];

      if (hasCleanse) {
        consumeIndexes.push(cleanseIndex);
        room.log.push(`${defender.nickname}이/가 속성 제거 카드로 공격을 무속성으로 바꾸었습니다.`);
      }

      consumeCards(defender, consumeIndexes);

      if (reflectCard.type === "rainbowReflect") {
  consumeCards(defender, consumeIndexes);

  room.pendingAttack = {
    attackerId: defender.id,
    defenderId: attacker.id,
    damage: pending.damage,
    attackName: reflectCard.name,
    element: effectiveElement,
    poisonStage: pending.poisonStage || null
  };

  room.log.push(
    `${defender.nickname}이/가 무지개 반사로 공격을 ${attacker.nickname}에게 되돌렸습니다.`
  );

  room.log.push(`${attacker.nickname}은/는 다시 방어하거나 반사해야 합니다.`);

  emitRoomState(room);
  return;
}

if (reflectCard.reflectMode === "bounce") {
        const bounceTarget = Math.random() < 0.5 ? defender : attacker;

        room.log.push(`${defender.nickname}이/가 ${reflectCard.name} 카드로 공격을 튕겨냈습니다.`);

        if (bounceTarget.id === defender.id) {
          room.log.push(`하지만 공격이 ${defender.nickname} 자신에게 되돌아왔습니다.`);

          room.pendingAttack = null;
          const damaged = applyDamage(room, defender, pending.damage, effectiveElement);

          if (!room.winner && damaged && pending.poisonStage && defender.hp > 0) {
            applyPoisonAttack(room, defender, pending.poisonStage);
          }

          if (!room.winner) {
            finishAction(room, defender);
          }

          emitRoomState(room);
          return;
        }

        room.log.push(`공격이 ${attacker.nickname}에게 튕겨졌습니다.`);

        room.pendingAttack = {
          attackerId: defender.id,
          defenderId: attacker.id,
          damage: pending.damage,
          attackName: reflectCard.name,
          element: effectiveElement,
          poisonStage: pending.poisonStage || null
        };

        room.log.push(`${attacker.nickname}은/는 다시 방어하거나 반사해야 합니다.`);

        emitRoomState(room);
        return;
      }

      room.pendingAttack = {
        attackerId: defender.id,
        defenderId: attacker.id,
        damage: pending.damage,
        attackName: reflectCard.name,
        element: effectiveElement,
        poisonStage: pending.poisonStage || null
      };

      room.log.push(
        `${defender.nickname}이/가 ${reflectCard.name} 카드로 ${elementName(effectiveElement)} 속성 ${pending.damage} 데미지를 ${attacker.nickname}에게 반사했습니다.`
      );

      room.log.push(`${attacker.nickname}은/는 다시 방어하거나 반사해야 합니다.`);

      emitRoomState(room);
      return;
    }

    if (uniqueDefenseIds.length > 0) {
      const defenseIndexes = uniqueDefenseIds.map(id =>
        defender.hand.findIndex(card => card.id === id && card.type === "defense")
      );

      if (defenseIndexes.some(index => index === -1)) {
        socket.emit("errorMessage", "선택한 방어 카드 중 사용할 수 없는 카드가 있습니다.");
        return;
      }

      const usedDefenseCards = defenseIndexes.map(index => defender.hand[index]);

      const invalidDefenseCards = usedDefenseCards.filter(card =>
        !canDefenseBlock(effectiveElement, card.element || "none")
      );

      if (invalidDefenseCards.length > 0) {
        const names = invalidDefenseCards.map(card => card.name).join(", ");
        socket.emit(
          "errorMessage",
          `${elementName(effectiveElement)} 속성 공격을 막을 수 없는 방어 카드가 포함되어 있습니다: ${names}`
        );
        return;
      }

      const totalDefense = usedDefenseCards.reduce((sum, card) => sum + card.defense, 0);
      const finalDamage = Math.max(0, pending.damage - totalDefense);

      const cardNames = usedDefenseCards.map(card => card.name).join(", ");

      if (hasCleanse) {
        room.log.push(`${defender.nickname}이/가 속성 제거 카드로 공격을 무속성으로 바꾸었습니다.`);
      }

      room.log.push(
        `${defender.nickname}이/가 ${cardNames} 카드로 총 ${totalDefense}만큼 방어했습니다.`
      );

      const consumeIndexes = [...defenseIndexes];

      if (hasCleanse) {
        consumeIndexes.push(cleanseIndex);
      }

      consumeCards(defender, consumeIndexes);

      room.pendingAttack = null;

      if (finalDamage > 0) {
        const damaged = applyDamage(room, defender, finalDamage, effectiveElement);

        if (!room.winner && damaged && pending.poisonStage && defender.hp > 0) {
          applyPoisonAttack(room, defender, pending.poisonStage);
        }
      } else {
        room.log.push(`${defender.nickname}이/가 공격을 완전히 막았습니다.`);
      }

      if (!room.winner) {
        finishAction(room, defender);
      }

      emitRoomState(room);
      return;
    }

    if (takeHit) {
      if (hasCleanse) {
        room.log.push(`${defender.nickname}이/가 속성 제거 카드로 공격을 무속성으로 바꾸었습니다.`);
        consumeCard(defender, cleanseIndex);
      }

      room.log.push(`${defender.nickname}이/가 방어하지 않고 공격을 맞았습니다.`);

      room.pendingAttack = null;
      const damaged = applyDamage(room, defender, pending.damage, effectiveElement);

      if (!room.winner && damaged && pending.poisonStage && defender.hp > 0) {
        applyPoisonAttack(room, defender, pending.poisonStage);
      }

      if (!room.winner) {
        finishAction(room, defender);
      }

      emitRoomState(room);
      return;
    }

    socket.emit("errorMessage", "방어 카드, 반사 카드, 속성 제거 카드, 또는 그냥 맞기를 선택하세요.");
  });

    socket.on("respondTargetAction", ({ rainbowReflectCardId }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room || !room.started || room.winner) return;

    const action = room.pendingAction;

    if (!action) {
      socket.emit("errorMessage", "결정할 효과가 없습니다.");
      return;
    }

    if (action.targetId !== socket.id) {
      socket.emit("errorMessage", "현재 효과 대상만 결정할 수 있습니다.");
      return;
    }

    const sourceUser = getPlayer(
      room,
      action.sourceUserId || action.userId
    );

    const target = getPlayer(room, action.targetId);

    if (!sourceUser || !target) {
      room.pendingAction = null;
      emitRoomState(room);
      return;
    }

    // ------------------------------------------------
    // 판매 요청
    // 판매할 카드는 그대로 유지하고, 무지개 반사 시 역할만 반전
    // ------------------------------------------------
    if (action.type === "sellRequest") {
      const originalCardOwner = getPlayer(
        room,
        action.sourceUserId
      );

      const currentSeller = getPlayer(
        room,
        action.sellerId
      );

      const currentBuyer = getPlayer(
        room,
        action.buyerId
      );

      if (!originalCardOwner || !currentSeller || !currentBuyer) {
        room.pendingAction = null;
        emitRoomState(room);
        return;
      }

      // 무지개 반사: 판매할 카드는 그대로, 판매자/구매자만 반전
      if (rainbowReflectCardId) {
        const rainbowIndex = target.hand.findIndex(card =>
          card.id === rainbowReflectCardId &&
          card.type === "rainbowReflect"
        );

        if (rainbowIndex === -1) {
          socket.emit("errorMessage", "무지개 반사 카드를 찾을 수 없습니다.");
          return;
        }

        const rainbowCard = target.hand[rainbowIndex];

        consumeCard(target, rainbowIndex);

        room.pendingAction = {
          ...action,
          sellerId: currentBuyer.id,
          buyerId: currentSeller.id,
          targetId: currentSeller.id,
          reflectedCount: (action.reflectedCount || 0) + 1
        };

        room.log.push(
          `${target.nickname}이/가 ${rainbowCard.name}으로 판매 효과를 반사했습니다.`
        );

        emitRoomState(room);
        return;
      }

      // 빈 공간 클릭: 현재 구매자가 카드값 지불
      const soldCardIndex = originalCardOwner.hand.findIndex(
        card => card.id === action.soldCardId
      );

      if (soldCardIndex === -1) {
        room.log.push("판매할 카드가 사라져 판매가 취소되었습니다.");
        room.pendingAction = null;

        if (!room.winner) {
          finishAction(room, originalCardOwner);
        }

        emitRoomState(room);
        return;
      }

      const soldCard = originalCardOwner.hand[soldCardIndex];
      const price = action.price || cardPrice(soldCard);

      forcePayCardPrice(room, currentBuyer, currentSeller, price);

      // 최종 구매자가 원래 카드 소유자와 다르면 카드 이동
      if (currentBuyer.id !== originalCardOwner.id) {
        originalCardOwner.hand.splice(soldCardIndex, 1);
        currentBuyer.hand.push(soldCard);
      }

      room.log.push(
        `${currentBuyer.nickname}이/가 ${currentSeller.nickname}에게 ` +
        `${soldCard.name} 카드값 ${price}을 지불했습니다.`
      );

      room.log.push(
        `${soldCard.name} 카드의 판매 처리가 완료되었습니다.`
      );

      room.pendingAction = null;

      if (!room.winner) {
        finishAction(room, originalCardOwner);
      }

      emitRoomState(room);
      return;
    }

    // ------------------------------------------------
    // 구매 요청
    // 카드 공개 전 대상이 무지개 반사 가능
    // ------------------------------------------------
    if (action.type === "tradeRequest") {
      const buyer = getPlayer(room, action.buyerId);
      const seller = getPlayer(room, action.sellerId);

      if (!buyer || !seller) {
        room.pendingAction = null;
        emitRoomState(room);
        return;
      }

      // 무지개 반사: 구매자와 판매자 역할 반전
      if (rainbowReflectCardId) {
        const rainbowIndex = target.hand.findIndex(card =>
          card.id === rainbowReflectCardId &&
          card.type === "rainbowReflect"
        );

        if (rainbowIndex === -1) {
          socket.emit("errorMessage", "무지개 반사 카드를 찾을 수 없습니다.");
          return;
        }

        const rainbowCard = target.hand[rainbowIndex];

        consumeCard(target, rainbowIndex);

        room.pendingAction = {
          ...action,
          buyerId: seller.id,
          sellerId: buyer.id,
          targetId: buyer.id,
          reflectedCount: (action.reflectedCount || 0) + 1
        };

        room.log.push(
          `${target.nickname}이/가 ${rainbowCard.name}으로 구매 효과를 반사했습니다.`
        );

        emitRoomState(room);
        return;
      }

      // 일반 결정: 현재 판매자의 랜덤 카드 공개
      if (seller.hand.length === 0) {
        room.log.push(`${seller.nickname}의 패가 없어 구매가 취소되었습니다.`);
        room.pendingAction = null;

        if (!room.winner) {
          finishAction(room, buyer);
        }

        emitRoomState(room);
        return;
      }

      const randomIndex = Math.floor(Math.random() * seller.hand.length);
      const revealedCard = seller.hand[randomIndex];

      room.pendingTrade = {
        buyerId: buyer.id,
        sellerId: seller.id,
        cardId: revealedCard.id,
        price: cardPrice(revealedCard)
      };

      room.pendingAction = null;

      room.log.push(
        `${seller.nickname}의 랜덤 카드가 공개되었습니다: ` +
        `${revealedCard.name}, 가격 ${cardPrice(revealedCard)}돈`
      );

      emitRoomState(room);
      return;
    }

    // ------------------------------------------------
    // 회복 / 마나 회복 / 약물중독 / 치료제
    // 무지개 반사 시 효과 대상만 원래 사용자에게 반사
    // ------------------------------------------------
    if (rainbowReflectCardId) {
      const rainbowIndex = target.hand.findIndex(card =>
        card.id === rainbowReflectCardId &&
        card.type === "rainbowReflect"
      );

      if (rainbowIndex === -1) {
        socket.emit("errorMessage", "무지개 반사 카드를 찾을 수 없습니다.");
        return;
      }

      const rainbowCard = target.hand[rainbowIndex];

      consumeCard(target, rainbowIndex);

      room.pendingAction = {
        ...action,
        sourceUserId: sourceUser.id,
        targetId: sourceUser.id,
        reflectedCount: (action.reflectedCount || 0) + 1
      };

      room.log.push(
        `${target.nickname}이/가 ${rainbowCard.name}으로 효과를 ${sourceUser.nickname}에게 반사했습니다.`
      );

      emitRoomState(room);
      return;
    }

    // HP 회복
    if (action.type === "heal") {
      const cardId = action.cardId || action.healCardId;

      const healIndex = sourceUser.hand.findIndex(card =>
        card.id === cardId &&
        card.type === "heal"
      );

      if (healIndex === -1) {
        room.log.push("회복 카드가 없어 효과가 취소되었습니다.");
      } else {
        const amount = action.amount || action.heal || 0;

        target.hp += amount;

        room.log.push(
          `${target.nickname}이/가 ${action.cardName || action.healCardName} 효과로 ` +
          `HP ${amount}을 회복했습니다.`
        );

        consumeCard(sourceUser, healIndex);
      }
    }

    // MP 회복
    else if (action.type === "manaHeal") {
      const manaIndex = sourceUser.hand.findIndex(card =>
        card.id === action.cardId &&
        card.type === "manaHeal"
      );

      if (manaIndex === -1) {
        room.log.push("마나 회복 카드가 없어 효과가 취소되었습니다.");
      } else {
        target.mp += action.amount;

        room.log.push(
          `${target.nickname}이/가 ${action.cardName} 효과로 ` +
          `MP ${action.amount}을 회복했습니다.`
        );

        consumeCard(sourceUser, manaIndex);
      }
    }

    // 약물중독 주사
    else if (action.type === "poisonItem") {
      const poisonIndex = sourceUser.hand.findIndex(card =>
        card.id === action.cardId &&
        card.type === "poisonItem"
      );

      if (poisonIndex === -1) {
        room.log.push("약물중독 주사 카드가 없어 효과가 취소되었습니다.");
      } else {
        applyDrugAddictionItem(room, target);

        room.log.push(
          `${target.nickname}에게 약물중독 주사 효과가 적용되었습니다.`
        );

        consumeCard(sourceUser, poisonIndex);
      }
    }

    // 치료제
    else if (action.type === "cure") {
      const cureIndex = sourceUser.hand.findIndex(card =>
        card.id === action.cardId &&
        card.type === "cure"
      );

      if (cureIndex === -1) {
        room.log.push("치료제 카드가 없어 효과가 취소되었습니다.");
      } else {
        if (action.cureType === "basic") {
          cureBasic(target);
        } else {
          cureAll(target);
        }

        room.log.push(
          `${target.nickname}이/가 ${action.cardName}의 치료 효과를 받았습니다.`
        );

        consumeCard(sourceUser, cureIndex);
      }
    }

    room.pendingAction = null;

    if (!room.winner) {
      finishAction(room, sourceUser);
    }

    emitRoomState(room);
  });

  socket.on("sendChat", ({ message }) => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room) return;

    message = String(message || "").trim();

    if (!message) return;

    if (message.length > 100) {
      message = message.slice(0, 100);
    }

    const player = getPlayer(room, socket.id);
    const spectator = getSpectator(room, socket.id);

    const nickname = player
      ? player.nickname
      : spectator
        ? spectator.nickname
        : "알 수 없음";

    if (!room.chat) {
      room.chat = [];
    }

    room.chat.push({
      id: randomUUID(),
      nickname,
      message,
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    });

    if (room.chat.length > 100) {
      room.chat.shift();
    }

    emitRoomState(room);
  });

  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;
    const room = rooms[roomCode];

    if (!room) return;

    const playerIndex = room.players.findIndex(player => player.id === socket.id);
    const spectatorIndex = room.spectators.findIndex(spectator => spectator.id === socket.id);

    if (playerIndex !== -1) {
      const disconnectedPlayer = room.players[playerIndex];

      if (room.started && !room.winner) {
        const aliveOthers = room.players.filter(
          player => player.id !== socket.id && player.hp > 0
        );

        if (aliveOthers.length === 1) {
          room.log.push(`${disconnectedPlayer.nickname} 님이 접속을 종료했습니다.`);
          finishGame(room, aliveOthers[0]);
          room.spectators = room.spectators.filter(s => s.id !== socket.id);
        }
      } else {
        room.players.splice(playerIndex, 1);
        room.log.push(`${disconnectedPlayer.nickname} 님이 나갔습니다.`);
      }
    }

    if (spectatorIndex !== -1) {
      const spectator = room.spectators[spectatorIndex];
      room.spectators.splice(spectatorIndex, 1);
      room.log.push(`${spectator.nickname} 대기자가 나갔습니다.`);
    }

    if (room.hostId === socket.id && !room.started) {
      const nextHost = room.players[0] || room.spectators[0];

      if (nextHost) {
        room.hostId = nextHost.id;
        room.log.push(`${nextHost.nickname} 님이 새 방장이 되었습니다.`);
      } else {
        room.hostId = null;
      }
    }

    if (room.players.length === 0 && room.spectators.length === 0) {
      delete rooms[roomCode];
    } else {
      emitRoomState(room);
    }

    console.log("접속 종료:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});