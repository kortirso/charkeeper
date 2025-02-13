class CreateDnd2024CharacterFeatures < ActiveRecord::Migration[8.0]
  def change
    create_table :dnd2024_character_features, id: :uuid do |t|
      t.string :slug, null: false
      t.jsonb :title, null: false, default: {}
      t.jsonb :description, null: false, default: {}
      t.integer :origin, limit: 1, null: false, comment: 'Тип применимости особенности, раса/подраса/класс/подкласс'
      t.string :origin_value, null: false, comment: 'Значение применимости особенности'
      t.integer :level, limit: 1, null: false
      t.integer :kind, limit: 1, null: false
      t.string :options_type, comment: 'Данные для выбора при kind CHOOSE_FROM'
      t.string :options, array: true, comment: 'Список опций для выбора'
      t.string :visible, null: false, comment: 'Доступен ли бонус особенности'
      t.jsonb :eval_variables, null: false, default: {}, comment: 'Вычисляемые переменные'
      t.integer :limit_refresh, limit: 1, comment: 'Событие для обновления лимита'
      t.timestamps
    end
  end
end
