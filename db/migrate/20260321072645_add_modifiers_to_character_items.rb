class AddModifiersToCharacterItems < ActiveRecord::Migration[8.1]
  def up
    add_column :character_items, :name, :string, comment: 'Измененное название предмета'
    add_column :character_items, :modifiers, :jsonb, null: false, default: {}
    safety_assured { remove_column :characters, :modifiers }
  end

  def down
    remove_column :character_items, :name
    remove_column :character_items, :modifiers
    safety_assured { add_column :characters, :modifiers, :jsonb, null: false, default: {} }
  end
end
