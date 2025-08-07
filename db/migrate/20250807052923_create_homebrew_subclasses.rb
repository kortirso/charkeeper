class CreateHomebrewSubclasses < ActiveRecord::Migration[8.0]
  def change
    create_table :homebrew_subclasses, id: :uuid, comment: 'Кастомные подклассы' do |t|
      t.uuid :user_id, null: false
      t.string :class_name, null: false, comment: 'Название класса или ID кастомного класса'
      t.string :type, null: false, comment: 'Отношение к игровой системе'
      t.string :name, null: false
      t.jsonb :data, null: false, default: {}
      t.timestamps
    end
    add_index :homebrew_subclasses, :user_id
  end
end
