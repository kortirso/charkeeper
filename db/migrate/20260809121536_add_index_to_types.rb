class AddIndexToTypes < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_index :character_companions, :type, algorithm: :concurrently
    add_index :characters, :type, algorithm: :concurrently
  end
end
