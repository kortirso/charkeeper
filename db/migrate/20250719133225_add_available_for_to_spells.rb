class AddAvailableForToSpells < ActiveRecord::Migration[8.0]
  def up
    add_column :spells, :available_for, :string, array: true

    # Dnd5::Spell.find_each do |spell|
    #   spell.update(available_for: spell.data.available_for)
    # end
    # Dnd2024::Spell.find_each do |spell|
    #   spell.update(available_for: spell.data.available_for)
    # end
  end

  def down
    remove_column :spells, :available_for
  end
end
