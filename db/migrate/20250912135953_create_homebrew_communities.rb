class CreateHomebrewCommunities < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    create_table :homebrew_communities, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.string :type, null: false, comment: 'Отношение к игровой системе'
      t.string :name, null: false
      t.timestamps
    end

    add_index :homebrew_communities, :user_id, algorithm: :concurrently
  end
end
