class AddEnabledToCharacterBonuses < ActiveRecord::Migration[8.1]
  def change
    add_column :character_bonus, :enabled, :boolean, null: false, default: true
  end
end
