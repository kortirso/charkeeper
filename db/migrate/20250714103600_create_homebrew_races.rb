class CreateHomebrewRaces < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :homebrew_races, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :type, null: false, comment: 'Отношение к игровой системе'
      t.string :name, null: false
      t.jsonb :data, null: false, default: {}, comment: 'Кастомные данные расы'
      t.timestamps
    end

    create_table :homebrews, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.uuid :brewery_id, null: false
      t.string :brewery_type, null: false
      t.timestamps
    end

    add_index :homebrew_races, :user_id, algorithm: :concurrently
    add_index :homebrews, :user_id, algorithm: :concurrently
    add_index :homebrews, [:brewery_id, :brewery_type], algorithm: :concurrently
  end
end
