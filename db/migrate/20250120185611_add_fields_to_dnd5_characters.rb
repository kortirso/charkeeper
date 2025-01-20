class AddFieldsToDnd5Characters < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_characters, :energy, :jsonb, null: false, default: {}, comment: 'Заряды энергии'
    add_column :dnd5_characters, :health, :jsonb, null: false, default: {}, comment: 'Данные о здоровье'
    add_column :dnd5_characters, :speed, :integer, limit: 1, null: false, comment: 'Скорость'
    add_column :dnd5_characters, :selected_skills, :string, array: true, null: false, default: [], comment: 'Выбранные умения'
    add_column :dnd5_characters, :languages, :string, array: true, null: false, default: [], comment: 'Изученные языки'
    add_column :dnd5_characters, :armor_proficiency, :string, array: true, null: false, default: [], comment: 'Владение доспехами и щитами'
    add_column :dnd5_characters, :coins, :jsonb, null: false, default: {}, comment: 'Данные о деньгах'
  end
end
