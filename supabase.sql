-- 创建用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  displayName VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  coupleId VARCHAR(255),
  partnerId UUID,
  anniversaries JSONB DEFAULT '[]'
);

-- 创建情侣表
CREATE TABLE couples (
  id VARCHAR(255) PRIMARY KEY,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  member1 UUID NOT NULL REFERENCES users(id),
  member2 UUID NOT NULL REFERENCES users(id)
);

-- 创建日记表
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupleId VARCHAR(255) NOT NULL REFERENCES couples(id),
  date DATE NOT NULL,
  content TEXT DEFAULT '',
  images JSONB DEFAULT '[]',
  createdBy UUID NOT NULL REFERENCES users(id),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedBy UUID REFERENCES users(id),
  UNIQUE(coupleId, date)
);

-- 创建邀请码表
CREATE TABLE invites (
  id VARCHAR(255) PRIMARY KEY,
  createdBy UUID NOT NULL REFERENCES users(id),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  expiresAt TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  usedBy UUID REFERENCES users(id)
);

-- 为用户表添加行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update their own profile" ON users
  FOR ALL USING (auth.uid() = id);

-- 为情侣表添加行级安全策略
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Couple members can view and manage their couple" ON couples
  FOR ALL USING (member1 = auth.uid() OR member2 = auth.uid());

-- 为日记表添加行级安全策略
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Couple members can view and manage their diary entries" ON diary_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM couples 
      WHERE couples.id = diary_entries.coupleId 
      AND (couples.member1 = auth.uid() OR couples.member2 = auth.uid())
    )
  );

-- 为邀请码表添加行级安全策略
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their own invites" ON invites
  FOR ALL USING (createdBy = auth.uid() OR usedBy = auth.uid());

-- 创建存储桶
-- 注意：存储桶需要在Supabase控制台中手动创建，名称为 'couple-diary'
-- 并设置为公开访问
-- 同时需要在存储桶的RLS策略中允许上传和访问
