class CreateFeats < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :feats, id: :uuid, comment: 'Навыки' do |t|
      t.string :type, null: false
      t.string :slug, null: false
      t.jsonb :title, null: false, default: {}
      t.jsonb :description, null: false, default: {}
      t.integer :origin, limit: 1, null: false, comment: 'Тип применимости навыка'
      t.string :origin_value, null: false, comment: 'Значение применимости навыка'
      t.integer :kind, limit: 1, null: false
      t.integer :limit_refresh, limit: 1, comment: 'Событие для обновления лимита'
      t.string :exclude, array: true, comment: 'Заменяемые навыки'
      t.jsonb :options, comment: 'Опции для выбора'
      t.jsonb :conditions, null: false, default: {}, comment: 'Условия доступности навыка'
      t.jsonb :description_eval_variables, null: false, default: {}, comment: 'Вычисляемые переменные для описания'
      t.jsonb :eval_variables, null: false, default: {}, comment: 'Вычисляемые переменные'
      t.timestamps
    end

    create_table :character_feats, id: :uuid, comment: 'Навыки персонажа' do |t|
      t.uuid :character_id, null: false
      t.uuid :feat_id, null: false
      t.integer :left_count, comment: 'Кол-во оставшихся использований'
      t.jsonb :value, comment: 'Выбранные опции навыка, либо введенный текст'
      t.timestamps
    end

    add_index :character_feats, [:character_id, :feat_id], unique: true
  end
end
