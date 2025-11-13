class AddDynamicValueToBonus < ActiveRecord::Migration[8.1]
  def change
    add_column :character_bonus, :dynamic_value, :jsonb, null: false, default: {}
  end
end
