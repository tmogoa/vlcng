CREATE TABLE IF NOT EXISTS  `video` (
  `id` INTEGER  primary key AUTOINCREMENT,
  `playedTill` double not null default 0,
  `name` varchar(500) not null,
  `source` varchar(1000) not null,
  `favorite` tinyint(1) not null default 0
);

CREATE TABLE IF NOT EXISTS  `audio` (
  `id` INTEGER  primary key AUTOINCREMENT,
  `playedTill` double not null default 0,
  `name` varchar(500) not null,
  `source` varchar(1000) not null,
  `favorite` tinyint(1) not null default 0
);

CREATE TABLE IF NOT EXISTS  `playlist ` (
  `id` INTEGER  primary key AUTOINCREMENT,
  `name` varchar(255) not null,
  `type` varchar(10) not null,
  `description` text,
  `created` datetime default current_timestamp,
  `updated` datetime default current_timestamp
);

CREATE TABLE IF NOT EXISTS  `audioBookmark` (
  `id` INTEGER  primary key AUTOINCREMENT ,
  `audioId` INTEGER  ,
  `markedTime` double not null default 0,
  `description` text,
  `updated` datetime default current_timestamp not null,
  FOREIGN KEY (`audioId`) REFERENCES `audio`(`id`)
);

CREATE TABLE IF NOT EXISTS  `recentAudio` (
  `id` INTEGER  primary key AUTOINCREMENT ,
  `audioId` INTEGER ,
  `datePlayed` datetime not null default current_timestamp,
  FOREIGN KEY (`audioId`) REFERENCES `audio`(`id`)
);

CREATE TABLE IF NOT EXISTS  `videoPlaylistItem` (
  `id` INTEGER  primary key AUTOINCREMENT,
  `playlistId` INTEGER ,
  `itemId` INTEGER ,
  FOREIGN KEY (`playlistId`) REFERENCES `playlist `(`id`),
  FOREIGN KEY (`itemId`) REFERENCES `video`(`id`)
);

CREATE TABLE IF NOT EXISTS  `recentVideo` (
  `id` INTEGER  primary key AUTOINCREMENT ,
  `videoId` INTEGER ,
  `datePlayed` datetime not null default current_timestamp,
  FOREIGN KEY (`videoId`) REFERENCES `video`(`id`)
);

CREATE TABLE IF NOT EXISTS  `audioPlaylistItems` (
  `id` INTEGER  primary key AUTOINCREMENT,
  `playlistId` INTEGER  ,
  `itemId` INTEGER ,
  FOREIGN KEY (`itemId`) REFERENCES `audio`(`id`),
  FOREIGN KEY (`playlistId`) REFERENCES `playlist `(`id`)
);

CREATE TABLE IF NOT EXISTS  `videoBookmark` (
  `id` INTEGER  primary key AUTOINCREMENT ,
  `videoId` INTEGER   ,
  `markedTime` double not null default 0,
  `description` text,
  `updated` datetime default current_timestamp not null,
  FOREIGN KEY (`videoId`) REFERENCES `video`(`id`)
);

