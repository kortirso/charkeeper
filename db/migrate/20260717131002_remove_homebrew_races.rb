class RemoveHomebrewRaces < ActiveRecord::Migration[8.1]
  def up
    safety_assured do
      drop_table :homebrew_races
    end
  end

  def down; end
end
