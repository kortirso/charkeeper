class AddDaggerheartCharacterFeatures < ActiveRecord::Migration[8.0]
  def change
    create_table :daggerheart_character_features, id: :uuid do |t|
      t.string :slug, null: false
      t.jsonb :title, null: false, default: {}
      t.jsonb :description, null: false, default: {}
      t.integer :origin, limit: 1, null: false, comment: 'Тип применимости особенности'
      t.string :origin_value, null: false, comment: 'Значение применимости особенности'
      t.integer :kind, limit: 1, null: false
      t.string :visible, null: false, comment: 'Доступен ли бонус особенности'
      t.jsonb :description_eval_variables, null: false, default: {}, comment: 'Вычисляемые переменные для описания'
      t.integer :limit_refresh, limit: 1, comment: 'Событие для обновления лимита'
      t.string :exclude, array: true, comment: 'Заменяемые способности'
      t.timestamps
    end
  end
end
