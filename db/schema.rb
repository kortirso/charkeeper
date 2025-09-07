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

ActiveRecord::Schema[8.0].define(version: 2025_09_06_163658) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"
  enable_extension "uuid-ossp"

  create_table "active_bot_objects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "source", null: false
    t.string "object", null: false
    t.uuid "user_id", null: false
    t.jsonb "info", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "source", "object"], name: "index_active_bot_objects_on_user_id_and_source_and_object", unique: true
  end

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.uuid "record_id", null: false
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "campaign_characters", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "campaign_id", null: false
    t.uuid "character_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id", "character_id"], name: "index_campaign_characters_on_campaign_id_and_character_id", unique: true
  end

  create_table "campaigns", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "provider", null: false
    t.index ["user_id"], name: "index_campaigns_on_user_id"
  end

  create_table "character_bonus", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "character_id", null: false
    t.jsonb "value", default: {}, null: false
    t.string "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "character_companions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "type", null: false
    t.string "name", null: false
    t.uuid "character_id", null: false
    t.jsonb "data", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "caption"
  end

  create_table "character_feats", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Навыки персонажа", force: :cascade do |t|
    t.uuid "character_id", null: false
    t.uuid "feat_id", null: false
    t.jsonb "value", comment: "Выбранные опции навыка, либо введенный текст"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "limit_refresh", limit: 2, comment: "Событие для обновления лимита"
    t.integer "used_count", comment: "Кол-во использований"
    t.index ["character_id", "feat_id"], name: "index_character_feats_on_character_id_and_feat_id", unique: true
  end

  create_table "character_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "character_id", null: false
    t.uuid "item_id", null: false
    t.integer "quantity", default: 1, null: false
    t.boolean "ready_to_use", default: false, null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства предметов в экипировке"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "notes"
    t.index ["character_id", "item_id"], name: "index_character_items_on_character_id_and_item_id", unique: true
  end

  create_table "character_notes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "character_id", null: false
    t.text "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title", null: false
  end

  create_table "character_spells", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "character_id", null: false
    t.uuid "spell_id", null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства подготовленных заклинания"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "notes"
    t.index ["character_id", "spell_id"], name: "index_character_spells_on_character_id_and_spell_id"
  end

  create_table "characters", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Персонажи", force: :cascade do |t|
    t.string "type", null: false, comment: "Система, для которой создан персонаж"
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства персонажа"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_characters_on_user_id"
  end

  create_table "daggerheart_character_features", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "slug", null: false
    t.jsonb "title", default: {}, null: false
    t.jsonb "description", default: {}, null: false
    t.integer "origin", limit: 2, null: false, comment: "Тип применимости особенности"
    t.string "origin_value", null: false, comment: "Значение применимости особенности"
    t.integer "kind", limit: 2, null: false
    t.string "visible", null: false, comment: "Доступен ли бонус особенности"
    t.jsonb "description_eval_variables", default: {}, null: false, comment: "Вычисляемые переменные для описания"
    t.integer "limit_refresh", limit: 2, comment: "Событие для обновления лимита"
    t.string "exclude", comment: "Заменяемые способности", array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "eval_variables", default: {}, null: false
  end

  create_table "dnd2024_character_features", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "slug", null: false
    t.jsonb "title", default: {}, null: false
    t.jsonb "description", default: {}, null: false
    t.integer "origin", limit: 2, null: false, comment: "Тип применимости особенности, раса/подраса/класс/подкласс"
    t.string "origin_value", null: false, comment: "Значение применимости особенности"
    t.integer "level", limit: 2, null: false
    t.integer "kind", limit: 2, null: false
    t.string "options_type", comment: "Данные для выбора при kind CHOOSE_FROM"
    t.string "options", comment: "Список опций для выбора", array: true
    t.string "visible", null: false, comment: "Доступен ли бонус особенности"
    t.jsonb "eval_variables", default: {}, null: false, comment: "Вычисляемые переменные"
    t.integer "limit_refresh", limit: 2, comment: "Событие для обновления лимита"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "choose_once", default: false, null: false
    t.jsonb "description_eval_variables", default: {}, null: false
    t.string "exclude", array: true
  end

  create_table "dnd5_character_features", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Расовые/классовые особенности", force: :cascade do |t|
    t.string "slug", null: false
    t.jsonb "title", default: {}, null: false
    t.jsonb "description", default: {}, null: false
    t.integer "origin", limit: 2, null: false, comment: "Тип применимости особенности, раса/подраса/класс/подкласс"
    t.string "origin_value", null: false, comment: "Значение применимости особенности"
    t.integer "level", limit: 2, null: false
    t.integer "kind", limit: 2, null: false
    t.string "options_type", comment: "Данные для выбора при kind CHOOSE_FROM"
    t.string "options", comment: "Список опций для выбора", array: true
    t.string "visible", null: false, comment: "Доступен ли бонус особенности"
    t.jsonb "eval_variables", default: {}, null: false, comment: "Вычисляемые переменные"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "limit_refresh", limit: 2
    t.boolean "choose_once", default: false, null: false
    t.jsonb "description_eval_variables", default: {}, null: false
  end

  create_table "feats", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Навыки", force: :cascade do |t|
    t.string "type", null: false
    t.string "slug"
    t.jsonb "title", default: {}, null: false
    t.jsonb "description", default: {}, null: false
    t.integer "origin", limit: 2, null: false, comment: "Тип применимости навыка"
    t.string "origin_value", null: false, comment: "Значение применимости навыка"
    t.integer "kind", limit: 2, null: false
    t.integer "limit_refresh", limit: 2, comment: "Событие для обновления лимита"
    t.string "exclude", comment: "Заменяемые навыки", array: true
    t.jsonb "options", comment: "Опции для выбора"
    t.jsonb "conditions", default: {}, null: false, comment: "Условия доступности навыка"
    t.jsonb "description_eval_variables", default: {}, null: false, comment: "Вычисляемые переменные для описания"
    t.jsonb "eval_variables", default: {}, null: false, comment: "Вычисляемые переменные"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.string "origin_values", comment: "Несколько источников, которые могут иметь навык", array: true
    t.index ["origin_value"], name: "index_feats_on_origin_value", where: "(origin_value IS NOT NULL)"
    t.index ["origin_values"], name: "index_feats_on_origin_values", where: "(origin_values IS NOT NULL)", using: :gin
    t.index ["user_id"], name: "index_feats_on_user_id"
  end

  create_table "homebrew_book_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "homebrew_book_id", null: false
    t.uuid "itemable_id", null: false
    t.string "itemable_type", null: false
    t.index ["homebrew_book_id"], name: "index_homebrew_book_items_on_homebrew_book_id"
    t.index ["itemable_id", "itemable_type"], name: "index_homebrew_book_items_on_itemable_id_and_itemable_type"
  end

  create_table "homebrew_books", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "provider", null: false
    t.index ["user_id"], name: "index_homebrew_books_on_user_id"
  end

  create_table "homebrew_races", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "type", null: false, comment: "Отношение к игровой системе"
    t.string "name", null: false
    t.jsonb "data", default: {}, null: false, comment: "Кастомные данные расы"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_homebrew_races_on_user_id"
  end

  create_table "homebrew_specialities", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Кастомные классы", force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "type", null: false, comment: "Отношение к игровой системе"
    t.string "name", null: false
    t.jsonb "data", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_homebrew_specialities_on_user_id"
  end

  create_table "homebrew_subclasses", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Кастомные подклассы", force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "class_name", null: false, comment: "Название класса или ID кастомного класса"
    t.string "type", null: false, comment: "Отношение к игровой системе"
    t.string "name", null: false
    t.jsonb "data", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_homebrew_subclasses_on_user_id"
  end

  create_table "homebrews", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "brewery_id", null: false
    t.string "brewery_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["brewery_id", "brewery_type"], name: "index_homebrews_on_brewery_id_and_brewery_type"
    t.index ["user_id"], name: "index_homebrews_on_user_id"
  end

  create_table "items", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Предметы", force: :cascade do |t|
    t.string "type", null: false
    t.string "kind", null: false, comment: "Тип предмета"
    t.jsonb "name", default: {}, null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства предмета"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.jsonb "info", default: {}, null: false
    t.uuid "user_id"
    t.index ["slug"], name: "index_items_on_slug"
    t.index ["user_id"], name: "index_items_on_user_id"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "value", null: false
    t.string "locale", null: false, comment: "Локаль пользователя для получения"
    t.string "targets", default: [], null: false, comment: "Получатели отправлений", array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "spells", id: :uuid, default: -> { "gen_random_uuid()" }, comment: "Заклинания", force: :cascade do |t|
    t.string "type", null: false
    t.jsonb "name", default: {}, null: false
    t.jsonb "data", default: {}, null: false, comment: "Свойства заклинания"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug", null: false
    t.string "available_for", array: true
    t.index ["slug"], name: "index_spells_on_slug"
  end

  create_table "user_feedbacks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.text "value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_identities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.integer "provider", null: false
    t.string "uid", null: false
    t.string "username"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.boolean "active", default: true, null: false
    t.index ["provider", "uid"], name: "index_user_identities_on_provider_and_uid", unique: true
    t.index ["user_id"], name: "index_user_identities_on_user_id"
  end

  create_table "user_notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.boolean "read", default: false, null: false
    t.string "title", null: false
    t.text "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_notifications_on_user_id"
  end

  create_table "user_platforms", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_user_platforms_on_user_id_and_name", unique: true
  end

  create_table "user_sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_sessions_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "locale", default: "en", null: false
    t.string "password_digest"
    t.string "username"
    t.boolean "admin", default: false, null: false
    t.integer "color_schema"
    t.datetime "discarded_at"
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["username"], name: "index_users_on_username", unique: true, where: "(username IS NOT NULL)"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
end
