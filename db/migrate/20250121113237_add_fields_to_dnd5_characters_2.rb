class AddFieldsToDnd5Characters2 < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_characters, :weapon_core_skills, :string, array: true, null: false, default: [], comment: 'Владение группами оружия'
    add_column :dnd5_characters, :weapon_skills, :string, array: true, null: false, default: [], comment: 'Владение определенными видами оружия'
    add_column :dnd5_characters, :class_features, :string, array: true, null: false, default: [], comment: 'Выбранные классовые умения'
  end
end
