// ShipAny 内置积分系统配置
export const CREDITS_CONFIG = {
  // 注册奖励
  REGISTER_REWARD: 100,

  // 邀请奖励
  INVITE_REWARD_INVITER: 50,  // 邀请人获得
  INVITE_REWARD_INVITEE: 50,   // 被邀请人获得

  // 邀请上限
  MAX_INVITES_PER_USER: 100,

  // 防刷限制
  MAX_DAILY_REGISTRATIONS_PER_IP: 3,
} as const;
