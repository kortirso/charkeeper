class CreateCharacterResources < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    create_table :character_resources, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.uuid :custom_resource_id, null: false
      t.integer :value, null: false, default: 0
      t.timestamps
    end

    add_column :custom_resources, :reset_direction, :integer, null: false, default: 0, comment: '0 - сброс к нулю, 1 - сброс к максимуму'

    add_index :custom_resources, [:resourceable_id, :resourceable_type], algorithm: :concurrently
    add_index :character_resources, :character_id, algorithm: :concurrently
    add_index :character_resources, :custom_resource_id, algorithm: :concurrently
  end
end
