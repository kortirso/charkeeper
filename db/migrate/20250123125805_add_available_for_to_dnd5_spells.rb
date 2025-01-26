class AddAvailableForToDnd5Spells < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_spells, :available_for, :string, null: false, array: true, default: []
  end
end
