class CreateDaggerheartMechanics < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :homebrews, :homebrew_id, :uuid
    add_index :homebrews, :homebrew_id, where: 'homebrew_id IS NOT NULL', algorithm: :concurrently
  end
end
