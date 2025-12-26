class AddEquipmentUpdatedAtToCharacters < ActiveRecord::Migration[8.1]
  def change
    add_column :characters, :equipment_updated_at, :datetime
  end
end
