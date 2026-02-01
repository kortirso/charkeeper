# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_01_175754) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"
  enable_extension "uuid-ossp"

  create_table "active_bot_objects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "info", default: {}, null: false
    t.string "object", null: false
    t.string "source", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id", "source", "object"], name: "index_active_bot_objects_on_user_id_and_source_and_object", unique: true
  end

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.uuid "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "campaign_channels", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "campaign_id", null: false
    t.uuid "channel_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id"], name: "index_campaign_channels_on_campaign_id"
    t.index ["channel_id"], name: "index_campaign_channels_on_channel_id", unique: true
  end

  create_table "campaign_characters", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "campaign_id", null: false
    t.uuid "character_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id", "character_id"], name: "index_campaign_characters_on_campaign_id_and_character_id", unique: true
  end

  create_table "campaign_notes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "campaign_id", null: false
    t.datetime "created_at", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.text "value", null: false
    t.index ["campaign_id"], name: "index_campaign_notes_on_campaign_id"
  end

  create_table "campaigns", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "provider", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_campaigns_on_user_id"
  end

  create_table "channels", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "external_id", null: false
    t.integer "provider", limit: 2, null: false
    t.datetime "updated_at", null: false
  end

  create_table "character_bonus", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "bonusable_id", null: false
    t.string "bonusable_type", null: false
    t.uuid "character_id"
    t.string "comment"
    t.datetime "created_at", null: false
    t.jsonb "dynamic_value", default: {}, null: false
    t.boolean "enabled", default: true, null: false
    t.datetime "updated_at", null: false
    t.jsonb "value", default: {}, null: false
    t.index ["bonusable_id", "bonusable_type"], name: "index_character_bonus_on_bonusable_id_and_bonusable_type"
  end

  create_table "character_companions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "caption"
    t.uuid "character_id", null: false
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false
    t.string "name", null: false
    t.string "type", null: false
    t.datetime "updated_at", null: false
  end

  create_table "character_feats", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Навыки персонажа", force: :cascade do |t|
    t.boolean "active", default: false, comment: "Включен ли эффект навыка"
    t.uuid "character_id", null: false
    t.datetime "created_at", null: false
    t.uuid "feat_id", null: false
    t.integer "limit_refresh", limit: 2, comment: "Событие для обновления лимита"
    t.text "notes"
    t.boolean "ready_to_use"
    t.datetime "updated_at", null: false
    t.integer "used_count", comment: "Кол-во использований"
    t.jsonb "value", comment: "Выбранные опции навыка, либо введенный текст"
    t.index ["character_id", "feat_id"], name: "index_character_feats_on_character_id_and_feat_id", unique: true
  end

  create_table "character_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "character_id", null: false
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства предметов в экипировке"
    t.uuid "item_id", null: false
    t.text "notes"
    t.integer "quantity", default: 1, null: false
    t.boolean "ready_to_use", default: false, null: false
    t.integer "state", limit: 2, default: 2, null: false
    t.jsonb "states", default: {}, null: false
    t.datetime "updated_at", null: false
    t.index ["character_id", "item_id"], name: "index_character_items_on_character_id_and_item_id", unique: true
  end

  create_table "character_notes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "character_id", null: false
    t.datetime "created_at", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.text "value", null: false
    t.index ["character_id"], name: "index_character_notes_on_character_id"
  end

  create_table "character_spells", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "character_id", null: false
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства подготовленных заклинания"
    t.text "notes"
    t.uuid "spell_id", null: false
    t.datetime "updated_at", null: false
    t.index ["character_id", "spell_id"], name: "index_character_spells_on_character_id_and_spell_id"
  end

  create_table "characters", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Персонажи", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства персонажа"
    t.datetime "equipment_updated_at"
    t.string "name", null: false
    t.string "type", null: false, comment: "Система, для которой создан персонаж"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_characters_on_user_id"
  end

  create_table "daggerheart_character_features", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "description", default: {}, null: false
    t.jsonb "description_eval_variables", default: {}, null: false, comment: "Вычисляемые переменные для описания"
    t.jsonb "eval_variables", default: {}, null: false
    t.string "exclude", comment: "Заменяемые способности", array: true
    t.integer "kind", limit: 2, null: false
    t.integer "limit_refresh", limit: 2, comment: "Событие для обновления лимита"
    t.integer "origin", limit: 2, null: false, comment: "Тип применимости особенности"
    t.string "origin_value", null: false, comment: "Значение применимости особенности"
    t.string "slug", null: false
    t.jsonb "title", default: {}, null: false
    t.datetime "updated_at", null: false
    t.string "visible", null: false, comment: "Доступен ли бонус особенности"
  end

  create_table "daggerheart_homebrew_domains", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.boolean "public", default: false, null: false, comment: "Открыть доступ для сторонних пользователей"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_daggerheart_homebrew_domains_on_user_id"
  end

  create_table "daggerheart_homebrew_transformations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.jsonb "name_json", default: {}, null: false
    t.boolean "public", default: false, null: false, comment: "Открыть доступ для сторонних пользователей"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_daggerheart_homebrew_transformations_on_user_id"
  end

  create_table "daggerheart_projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "character_id", null: false
    t.integer "complexity", default: 1, null: false
    t.datetime "created_at", null: false
    t.string "description"
    t.uuid "goal_id"
    t.string "goal_type"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["character_id"], name: "index_daggerheart_projects_on_character_id"
    t.index ["goal_id", "goal_type"], name: "index_daggerheart_projects_on_goal_id_and_goal_type", where: "((goal_id IS NOT NULL) AND (goal_type IS NOT NULL))"
  end

  create_table "dnd2024_character_features", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "choose_once", default: false, null: false
    t.datetime "created_at", null: false
    t.jsonb "description", default: {}, null: false
    t.jsonb "description_eval_variables", default: {}, null: false
    t.jsonb "eval_variables", default: {}, null: false, comment: "Вычисляемые переменные"
    t.string "exclude", array: true
    t.integer "kind", limit: 2, null: false
    t.integer "level", limit: 2, null: false
    t.integer "limit_refresh", limit: 2, comment: "Событие для обновления лимита"
    t.string "options", comment: "Список опций для выбора", array: true
    t.string "options_type", comment: "Данные для выбора при kind CHOOSE_FROM"
    t.integer "origin", limit: 2, null: false, comment: "Тип применимости особенности, раса/подраса/класс/подкласс"
    t.string "origin_value", null: false, comment: "Значение применимости особенности"
    t.string "slug", null: false
    t.jsonb "title", default: {}, null: false
    t.datetime "updated_at", null: false
    t.string "visible", null: false, comment: "Доступен ли бонус особенности"
  end

  create_table "dnd5_character_features", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Расовые/классовые особенности", force: :cascade do |t|
    t.boolean "choose_once", default: false, null: false
    t.datetime "created_at", null: false
    t.jsonb "description", default: {}, null: false
    t.jsonb "description_eval_variables", default: {}, null: false
    t.jsonb "eval_variables", default: {}, null: false, comment: "Вычисляемые переменные"
    t.integer "kind", limit: 2, null: false
    t.integer "level", limit: 2, null: false
    t.integer "limit_refresh", limit: 2
    t.string "options", comment: "Список опций для выбора", array: true
    t.string "options_type", comment: "Данные для выбора при kind CHOOSE_FROM"
    t.integer "origin", limit: 2, null: false, comment: "Тип применимости особенности, раса/подраса/класс/подкласс"
    t.string "origin_value", null: false, comment: "Значение применимости особенности"
    t.string "slug", null: false
    t.jsonb "title", default: {}, null: false
    t.datetime "updated_at", null: false
    t.string "visible", null: false, comment: "Доступен ли бонус особенности"
  end

  create_table "feats", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Навыки", force: :cascade do |t|
    t.jsonb "bonus_eval_variables"
    t.jsonb "conditions", default: {}, null: false, comment: "Условия доступности навыка"
    t.boolean "continious", default: false, comment: "Имеет ли навык включаемый эффект"
    t.datetime "created_at", null: false
    t.jsonb "description", default: {}, null: false
    t.jsonb "description_eval_variables", default: {}, null: false, comment: "Вычисляемые переменные для описания"
    t.jsonb "eval_variables", default: {}, null: false, comment: "Вычисляемые переменные"
    t.string "exclude", comment: "Заменяемые навыки", array: true
    t.jsonb "info", default: {}, null: false
    t.integer "kind", limit: 2, null: false
    t.integer "limit_refresh", limit: 2, comment: "Событие для обновления лимита"
    t.jsonb "options", comment: "Опции для выбора"
    t.integer "origin", limit: 2, null: false, comment: "Тип применимости навыка"
    t.string "origin_value", comment: "Значение применимости навыка"
    t.string "origin_values", comment: "Несколько источников, которые могут иметь навык", array: true
    t.jsonb "price", default: {}, comment: "Цена активации способности"
    t.boolean "reverse_refresh", default: false
    t.string "slug"
    t.jsonb "title", default: {}, null: false
    t.string "type", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["origin"], name: "index_feats_on_origin"
    t.index ["origin_value"], name: "index_feats_on_origin_value", where: "(origin_value IS NOT NULL)"
    t.index ["origin_values"], name: "index_feats_on_origin_values", where: "(origin_values IS NOT NULL)", using: :gin
    t.index ["slug"], name: "index_feats_on_slug", where: "(slug IS NOT NULL)"
    t.index ["type"], name: "index_feats_on_type"
    t.index ["user_id"], name: "index_feats_on_user_id"
  end

  create_table "good_job_batches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "callback_priority"
    t.text "callback_queue_name"
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "discarded_at"
    t.datetime "enqueued_at"
    t.datetime "finished_at"
    t.datetime "jobs_finished_at"
    t.text "on_discard"
    t.text "on_finish"
    t.text "on_success"
    t.jsonb "serialized_properties"
    t.datetime "updated_at", null: false
  end

  create_table "good_job_executions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "active_job_id", null: false
    t.datetime "created_at", null: false
    t.interval "duration"
    t.text "error"
    t.text "error_backtrace", array: true
    t.integer "error_event", limit: 2
    t.datetime "finished_at"
    t.text "job_class"
    t.uuid "process_id"
    t.text "queue_name"
    t.datetime "scheduled_at"
    t.jsonb "serialized_params"
    t.datetime "updated_at", null: false
    t.index ["active_job_id", "created_at"], name: "index_good_job_executions_on_active_job_id_and_created_at"
    t.index ["process_id", "created_at"], name: "index_good_job_executions_on_process_id_and_created_at"
  end

  create_table "good_job_processes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "lock_type", limit: 2
    t.jsonb "state"
    t.datetime "updated_at", null: false
  end

  create_table "good_job_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "key"
    t.datetime "updated_at", null: false
    t.jsonb "value"
    t.index ["key"], name: "index_good_job_settings_on_key", unique: true
  end

  create_table "good_jobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "active_job_id"
    t.uuid "batch_callback_id"
    t.uuid "batch_id"
    t.text "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "cron_at"
    t.text "cron_key"
    t.text "error"
    t.integer "error_event", limit: 2
    t.integer "executions_count"
    t.datetime "finished_at"
    t.boolean "is_discrete"
    t.text "job_class"
    t.text "labels", array: true
    t.datetime "locked_at"
    t.uuid "locked_by_id"
    t.datetime "performed_at"
    t.integer "priority"
    t.text "queue_name"
    t.uuid "retried_good_job_id"
    t.datetime "scheduled_at"
    t.jsonb "serialized_params"
    t.datetime "updated_at", null: false
    t.index ["active_job_id", "created_at"], name: "index_good_jobs_on_active_job_id_and_created_at"
    t.index ["batch_callback_id"], name: "index_good_jobs_on_batch_callback_id", where: "(batch_callback_id IS NOT NULL)"
    t.index ["batch_id"], name: "index_good_jobs_on_batch_id", where: "(batch_id IS NOT NULL)"
    t.index ["concurrency_key", "created_at"], name: "index_good_jobs_on_concurrency_key_and_created_at"
    t.index ["concurrency_key"], name: "index_good_jobs_on_concurrency_key_when_unfinished", where: "(finished_at IS NULL)"
    t.index ["cron_key", "created_at"], name: "index_good_jobs_on_cron_key_and_created_at_cond", where: "(cron_key IS NOT NULL)"
    t.index ["cron_key", "cron_at"], name: "index_good_jobs_on_cron_key_and_cron_at_cond", unique: true, where: "(cron_key IS NOT NULL)"
    t.index ["finished_at"], name: "index_good_jobs_jobs_on_finished_at", where: "((retried_good_job_id IS NULL) AND (finished_at IS NOT NULL))"
    t.index ["labels"], name: "index_good_jobs_on_labels", where: "(labels IS NOT NULL)", using: :gin
    t.index ["locked_by_id"], name: "index_good_jobs_on_locked_by_id", where: "(locked_by_id IS NOT NULL)"
    t.index ["priority", "created_at"], name: "index_good_job_jobs_for_candidate_lookup", where: "(finished_at IS NULL)"
    t.index ["priority", "created_at"], name: "index_good_jobs_jobs_on_priority_created_at_when_unfinished", order: { priority: "DESC NULLS LAST" }, where: "(finished_at IS NULL)"
    t.index ["priority", "scheduled_at"], name: "index_good_jobs_on_priority_scheduled_at_unfinished_unlocked", where: "((finished_at IS NULL) AND (locked_by_id IS NULL))"
    t.index ["queue_name", "scheduled_at"], name: "index_good_jobs_on_queue_name_and_scheduled_at", where: "(finished_at IS NULL)"
    t.index ["scheduled_at"], name: "index_good_jobs_on_scheduled_at", where: "(finished_at IS NULL)"
  end

  create_table "homebrew_book_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "homebrew_book_id", null: false
    t.uuid "itemable_id", null: false
    t.string "itemable_type", null: false
    t.index ["homebrew_book_id"], name: "index_homebrew_book_items_on_homebrew_book_id"
    t.index ["itemable_id", "itemable_type"], name: "index_homebrew_book_items_on_itemable_id_and_itemable_type"
  end

  create_table "homebrew_books", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "provider", null: false
    t.boolean "public", default: false, null: false, comment: "Открыть доступ для сторонних пользователей"
    t.boolean "shared"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["shared"], name: "index_homebrew_books_on_shared", where: "(shared IS NOT NULL)"
    t.index ["user_id"], name: "index_homebrew_books_on_user_id"
  end

  create_table "homebrew_communities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "discarded_at"
    t.string "name", null: false
    t.boolean "public", default: false, null: false, comment: "Открыть доступ для сторонних пользователей"
    t.string "type", null: false, comment: "Отношение к игровой системе"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["discarded_at"], name: "index_homebrew_communities_on_discarded_at"
    t.index ["user_id"], name: "index_homebrew_communities_on_user_id"
  end

  create_table "homebrew_races", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false, comment: "Кастомные данные расы"
    t.datetime "discarded_at"
    t.string "name", null: false
    t.boolean "public", default: false, null: false, comment: "Открыть доступ для сторонних пользователей"
    t.string "type", null: false, comment: "Отношение к игровой системе"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["discarded_at"], name: "index_homebrew_races_on_discarded_at"
    t.index ["user_id"], name: "index_homebrew_races_on_user_id"
  end

  create_table "homebrew_specialities", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Кастомные классы", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false
    t.datetime "discarded_at"
    t.string "name", null: false
    t.string "type", null: false, comment: "Отношение к игровой системе"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["discarded_at"], name: "index_homebrew_specialities_on_discarded_at"
    t.index ["user_id"], name: "index_homebrew_specialities_on_user_id"
  end

  create_table "homebrew_subclasses", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Кастомные подклассы", force: :cascade do |t|
    t.string "class_name", null: false, comment: "Название класса или ID кастомного класса"
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false
    t.datetime "discarded_at"
    t.string "name", null: false
    t.boolean "public", default: false, null: false, comment: "Открыть доступ для сторонних пользователей"
    t.string "type", null: false, comment: "Отношение к игровой системе"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["discarded_at"], name: "index_homebrew_subclasses_on_discarded_at"
    t.index ["user_id"], name: "index_homebrew_subclasses_on_user_id"
  end

  create_table "homebrews", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "brewery_id", null: false
    t.string "brewery_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["brewery_id", "brewery_type"], name: "index_homebrews_on_brewery_id_and_brewery_type"
    t.index ["user_id"], name: "index_homebrews_on_user_id"
  end

  create_table "item_recipes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "info", default: {}, null: false
    t.uuid "item_id", null: false
    t.boolean "public", default: false
    t.uuid "tool_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["tool_id", "item_id"], name: "index_item_recipes_on_tool_id_and_item_id", unique: true
    t.index ["user_id"], name: "index_item_recipes_on_user_id"
  end

  create_table "items", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Предметы", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства предмета"
    t.jsonb "description", default: {"en" => "", "ru" => ""}, null: false
    t.jsonb "info", default: {}, null: false
    t.uuid "itemable_id"
    t.string "itemable_type"
    t.string "kind", null: false, comment: "Тип предмета"
    t.jsonb "name", default: {}, null: false
    t.boolean "public", default: false, null: false, comment: "Открыть доступ для сторонних пользователей"
    t.string "slug"
    t.string "type", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["itemable_id", "itemable_type"], name: "index_items_on_itemable_id_and_itemable_type", where: "((itemable_id IS NOT NULL) AND (itemable_type IS NOT NULL))"
    t.index ["slug"], name: "index_items_on_slug"
    t.index ["user_id"], name: "index_items_on_user_id"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "locale", null: false, comment: "Локаль пользователя для получения"
    t.string "targets", default: [], null: false, comment: "Получатели отправлений", array: true
    t.datetime "updated_at", null: false
    t.text "value", null: false
  end

  create_table "spells", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Заклинания", force: :cascade do |t|
    t.string "available_for", array: true
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства заклинания"
    t.jsonb "name", default: {}, null: false
    t.string "slug", null: false
    t.string "type", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_spells_on_slug"
  end

  create_table "user_books", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "homebrew_book_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id", "homebrew_book_id"], name: "index_user_books_on_user_id_and_homebrew_book_id", unique: true
  end

  create_table "user_feedbacks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.text "value"
  end

  create_table "user_homebrews", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Заранее сформированный список всех доступных homebrew", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_user_homebrews_on_user_id"
  end

  create_table "user_identities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.integer "provider", null: false
    t.string "uid", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.string "username"
    t.index ["provider", "uid"], name: "index_user_identities_on_provider_and_uid", unique: true
    t.index ["user_id"], name: "index_user_identities_on_user_id"
  end

  create_table "user_notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "read", default: false, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.text "value", null: false
    t.index ["user_id"], name: "index_user_notifications_on_user_id"
  end

  create_table "user_platforms", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id", "name"], name: "index_user_platforms_on_user_id_and_name", unique: true
  end

  create_table "user_sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_user_sessions_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "admin", default: false, null: false
    t.integer "color_schema"
    t.datetime "created_at", null: false
    t.datetime "discarded_at"
    t.datetime "homebrew_updated_at"
    t.string "locale", default: "en", null: false
    t.string "password_digest"
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["username"], name: "index_users_on_username", unique: true, where: "(username IS NOT NULL)"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
end
