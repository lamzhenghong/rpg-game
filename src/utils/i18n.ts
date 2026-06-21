/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageType = 'en' | 'jp' | 'zh' | 'ko';

export const TRANSLATIONS: Record<string, Record<LanguageType, string>> = {
  // Screen/Tab Names
  'main_menu': {
    en: 'Main Menu',
    jp: 'メインメニュー',
    zh: '主菜单',
    ko: '메인 메뉴'
  },
  'combat_arena': {
    en: 'Combat Arena',
    jp: '戦闘アリーナ',
    zh: '战斗竞技场',
    ko: '전투 아레나'
  },
  'rogue_ruins': {
    en: 'Rogue Ruins',
    jp: 'ローグ廃墟',
    zh: '肉鸽废墟',
    ko: '로그 폐허'
  },
  'party_setup': {
    en: 'Party Setup',
    jp: '編成画面',
    zh: '队伍配置',
    ko: '파티 편성'
  },
  'forge_ascension': {
    en: 'Forge & Ascension',
    jp: '鍛造と昇格',
    zh: '锻造与突破',
    ko: '단조 및 돌파'
  },
  'artifacts': {
    en: 'Artifacts',
    jp: '聖遺物',
    zh: '圣遗物',
    ko: '성유물'
  },
  'celestial_summons': {
    en: 'Celestial Summons',
    jp: '天の召喚',
    zh: '祈愿召唤',
    ko: '천상의 소환'
  },
  'lore_wiki': {
    en: 'God Lore Wiki',
    jp: '神話図鑑',
    zh: '神话图鉴',
    ko: '신화 도감'
  },
  'quest_log': {
    en: 'Quest Log',
    jp: 'クエスト履歴',
    zh: '任务日志',
    ko: '퀘스트 일지'
  },
  'settings': {
    en: 'Settings',
    jp: '設定',
    zh: '设置',
    ko: '설정'
  },

  // Common Buttons
  'back_to_menu': {
    en: 'Back to Menu',
    jp: 'メニューに戻る',
    zh: '返回菜单',
    ko: '메뉴로 돌아가기'
  },
  'exit_to_wiki': {
    en: 'Exit to Wiki',
    jp: '図鑑に移動する',
    zh: '退出到图鉴',
    ko: '도감으로 나가기'
  },
  'confirm': {
    en: 'Confirm',
    jp: '確認',
    zh: '确认',
    ko: '확인'
  },
  'cancel': {
    en: 'Cancel',
    jp: 'キャンセル',
    zh: '取消',
    ko: '취소'
  },
  'resume': {
    en: 'Resume',
    jp: '再開',
    zh: '继续',
    ko: '계속하기'
  },
  'restart': {
    en: 'Restart',
    jp: '再起動',
    zh: '重新开始',
    ko: '다시 시작'
  },
  'start_battle': {
    en: 'Start Battle',
    jp: '戦闘開始',
    zh: '开始战斗',
    ko: '전투 시작'
  },
  'level_up': {
    en: 'Level Up',
    jp: 'レベルアップ',
    zh: '升级',
    ko: '레벨 업'
  },
  'ascend': {
    en: 'Ascend',
    jp: '限界突破',
    zh: '突破',
    ko: '돌파'
  },
  'equip': {
    en: 'Equip',
    jp: '装備',
    zh: '装备',
    ko: '장착'
  },
  'maxed': {
    en: 'MAXED',
    jp: '最大レベル',
    zh: '已满级',
    ko: '최대 레벨'
  },
  'search_placeholder': {
    en: 'Search names...',
    jp: '名前で検索...',
    zh: '搜索名称...',
    ko: '이름 검색...'
  },
  'filter_all': {
    en: 'All',
    jp: 'すべて',
    zh: '全部',
    ko: '전체'
  },
  'filter_owned': {
    en: 'Owned',
    jp: '所持',
    zh: '已拥有',
    ko: '보유'
  },
  'filter_unowned': {
    en: 'Not Owned',
    jp: '未所持',
    zh: '未拥有',
    ko: '미보유'
  },

  // Currencies / Materials
  'mora': {
    en: 'Mora',
    jp: 'モラ',
    zh: '摩拉',
    ko: '모라'
  },
  'gems': {
    en: 'Aether Gems',
    jp: 'エーテル原石',
    zh: '原石',
    ko: '원석'
  },
  'heros_wit': {
    en: "Hero's Wit",
    jp: '大英雄の経験',
    zh: '大英雄的经验',
    ko: '영웅의 경험'
  },
  'myconid_catalyst': {
    en: 'Myconid Spore Catalyst',
    jp: 'キノコン胞子触媒',
    zh: '蕈兽孢子媒介',
    ko: '버섯몬 포자 촉매'
  },

  // Elements
  'Pyro': {
    en: 'Pyro',
    jp: '炎',
    zh: '火',
    ko: '불'
  },
  'Hydro': {
    en: 'Hydro',
    jp: '水',
    zh: '水',
    ko: '물'
  },
  'Cryo': {
    en: 'Cryo',
    jp: '氷',
    zh: '冰',
    ko: '얼음'
  },
  'Electro': {
    en: 'Electro',
    jp: '雷',
    zh: '雷',
    ko: '번개'
  },
  'Anemo': {
    en: 'Anemo',
    jp: '風',
    zh: '风',
    ko: '바람'
  },
  'Geo': {
    en: 'Geo',
    jp: '岩',
    zh: '岩',
    ko: '바위'
  },
  'Dendro': {
    en: 'Dendro',
    jp: '草',
    zh: '草',
    ko: '풀'
  },

  // Weapons
  'Sword': {
    en: 'Sword',
    jp: '片手剣',
    zh: '单手剑',
    ko: '한손검'
  },
  'Claymore': {
    en: 'Claymore',
    jp: '両手剣',
    zh: '双手剑',
    ko: '양손검'
  },
  'Bow': {
    en: 'Bow',
    jp: '弓',
    zh: '弓',
    ko: '활'
  },
  'Catalyst': {
    en: 'Catalyst',
    jp: '法器',
    zh: '法器',
    ko: '법구'
  },
  'Polearm': {
    en: 'Polearm',
    jp: '長柄武器',
    zh: '长柄武器',
    ko: '장병기'
  },

  // Setup / Party
  'deploy_team': {
    en: 'Deploy Strike Team',
    jp: '突撃部隊を配備',
    zh: '部署出战队伍',
    ko: '출전 팀 배치'
  },
  'active_hero': {
    en: 'Active',
    jp: '出撃中',
    zh: '参战中',
    ko: '출전 중'
  },
  'no_weapon': {
    en: 'No Weapon',
    jp: '武器未装備',
    zh: '未装备武器',
    ko: '무기 없음'
  },

  // Combat Labels
  'score': {
    en: 'Score',
    jp: 'スコア',
    zh: '得分',
    ko: '점수'
  },
  'wave': {
    en: 'Wave',
    jp: 'ウェーブ',
    zh: '波次',
    ko: '웨이브'
  },
  'game_over': {
    en: 'GAME OVER',
    jp: 'ゲームオーバー',
    zh: '游戏结束',
    ko: '게임 오버'
  },
  'paused': {
    en: 'PAUSED',
    jp: '一時停止',
    zh: '已暂停',
    ko: '일시 정지'
  },
  'victory': {
    en: 'VICTORY',
    jp: '勝利',
    zh: '胜利',
    ko: '승리'
  },

  // settings subtitles
  'audio_volume': {
    en: 'Audio Master Volume',
    jp: 'マスター音量',
    zh: '主音量大小',
    ko: '마스터 볼륨'
  },
  'performance_mode': {
    en: 'Performance Mode',
    jp: 'パフォーマンスモード',
    zh: '性能模式',
    ko: '성능 모드'
  },
  'performance_desc': {
    en: 'Reduces particle count for smoother FPS',
    jp: 'エフェクト量を減らしてFPSを向上させます',
    zh: '减少粒子数量以获得更流畅的帧率',
    ko: '이펙트 파티클을 줄여 프레임을 향상시킵니다'
  },
  'fps_limit_label': {
    en: 'FPS Limit',
    jp: 'FPS制限',
    zh: '帧率限制',
    ko: '프레임 제한'
  },
  'fps_limit_60': {
    en: '60 FPS Cap',
    jp: '60 FPS 制限',
    zh: '锁定 60 帧',
    ko: '60 FPS 제한'
  },
  'fps_limit_none': {
    en: 'No Limit',
    jp: '制限なし',
    zh: '无限制',
    ko: '제한 없음'
  },
  'language_label': {
    en: 'Language',
    jp: '言語',
    zh: '语言',
    ko: '언어'
  },
  'display_mode': {
    en: 'Display Mode',
    jp: '表示モード',
    zh: '显示模式',
    ko: '화면 모드'
  },
  
  // Gacha specific
  'gacha_pity_5star': {
    en: '5★ Pity Status',
    jp: '5★ 天井カウンター',
    zh: '5★ 保底状态',
    ko: '5★ 천장 상태'
  },
  'gacha_guaranteed': {
    en: 'Guaranteed Featured 5★ next',
    jp: '次回★5ピックアップ確定',
    zh: '下次必得UP 5★',
    ko: '다음 5★ 픽업 확정'
  },
  'gacha_50_50': {
    en: '50/50 Featured Chance',
    jp: '50%の確率でピックアップ',
    zh: '50%概率获得UP角色',
    ko: '50% 확률로 픽업 획득'
  },
  'gacha_wish_1': {
    en: 'Single Summon (160 Gems)',
    jp: '1回召喚 (160 原石)',
    zh: '单次祈愿 (160原石)',
    ko: '1회 기원 (160 원석)'
  },
  'gacha_wish_10': {
    en: 'Ten Summons (1440 Gems)',
    jp: '10回召喚 (1440 原石)',
    zh: '十连祈愿 (1440原石)',
    ko: '10회 기원 (1440 원석)'
  },

  // notices
  'misclick_notice': {
    en: 'Are you sure you want to proceed?',
    jp: '本当に実行しますか？',
    zh: '您确定要继续吗？',
    ko: '정말로 계속하시겠습니까?'
  },
  'notice_restart': {
    en: 'Restart wave? Active wave progress will be lost.',
    jp: '再起動しますか？現在のウェーブの進捗は失われます。',
    zh: '重新开始波次？当前波次的进度将会丢失。',
    ko: '다시 시작하시겠습니까? 현재 웨ーブ 진행도가 유실됩니다.'
  },
  'restart_wave_1': {
    en: 'Restart Run (Wave 1)',
    jp: '再起動 (ウェーブ 1)',
    zh: '重新开始 (波次 1)',
    ko: '다시 시작 (웨이브 1)'
  },
  'notice_restart_run': {
    en: 'Restart the entire run? You will start back at Wave 1.',
    jp: '最初から再起動しますか？ウェーブ 1から始まります。',
    zh: '重新开始挑战？您将从第1波开始。',
    ko: '처음부터 다시 시작하시겠습니까? 웨이브 1부터 시작합니다.'
  },
  'end_run': {
    en: 'End Current Run',
    jp: '挑戦を終了する',
    zh: '结束当前挑战',
    ko: '현재 도전 종료'
  },
  'notice_end_run': {
    en: 'Are you sure you want to end the current run? This will result in immediate defeat and trigger results.',
    jp: '現在の挑戦を終了しますか？即座に敗北となり、リザルト画面が表示されます。',
    zh: '您确定要结束当前挑战吗？这将导致立即失败并显示结算界面。',
    ko: '현재 도전을 종료하시겠습니까? 즉시 패배 처리되며 결과 화면으로 이동합니다.'
  },
  'notice_home': {
    en: 'Return to home menu? Current run progress will be lost.',
    jp: 'メニューに戻りますか？現在の挑戦の進捗は失われます。',
    zh: '返回主菜单？当前挑战的进度将会丢失。',
    ko: '메인 메뉴로 돌아가시겠습니까? 현재 도전이 취소됩니다.'
  },
  'notice_wiki': {
    en: 'Exit to Wiki? Current run progress will be lost.',
    jp: '図鑑に戻りますか？現在の挑戦の進捗は失われます。',
    zh: '退出到图鉴？当前挑战的进度将会丢失。',
    ko: '도감으로 나가시겠습니까? 현재 도전이 취소됩니다.'
  }
};

export function getTranslation(key: string, lang: LanguageType): string {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  // If element is a direct name (like Pyro/Hydro) and not explicitly translated, return the key
  return key;
}

export function t(key: string, lang: LanguageType): string {
  return getTranslation(key, lang);
}
