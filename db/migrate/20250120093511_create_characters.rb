class CreateCharacters < ActiveRecord::Migration[8.0]
  def change
    create_table :characters, id: :uuid, comment: 'Персонажи' do |t|
      t.string :type, null: false, comment: 'Система, для которой создан персонаж'
      t.uuid :user_id, null: false
      t.string :name, null: false
      t.jsonb :data, null: false, default: {}, comment: 'Свойства персонажа'
      t.timestamps
    end
    add_index :characters, :user_id
  end
end
