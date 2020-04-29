CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `full_name` varchar(255),
  `gender` varchar(255),
  `dateofbirth` date,
  `email` varchar(255),
  `password` varchar(255),
  `country_code` int,
  `created_at` timestamp
);

CREATE TABLE `movies` (
  `movie_id` int PRIMARY KEY AUTO_INCREMENT,
  `movie_name` varchar(255),
  `description` varchar(255),
  `genre` varchar(255),
  `released_year` year,
  `country_code` int,
  `created_at` timestamp
);

CREATE TABLE `countries` (
  `code` int PRIMARY KEY,
  `name` varchar(255)
);

CREATE TABLE `reviews` (
  `review_id` int PRIMARY KEY AUTO_INCREMENT,
  `movie_id` int,
  `user_id` int,
  `reviews` varchar(255),
  `rating` numeric,
  `created_at` timestamp
);

ALTER TABLE `reviews` ADD FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `users` ADD FOREIGN KEY (`country_code`) REFERENCES `countries` (`code`);

ALTER TABLE `movies` ADD FOREIGN KEY (`country_code`) REFERENCES `countries` (`code`);
