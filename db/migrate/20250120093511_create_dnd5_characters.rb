class CreateDnd5Characters < ActiveRecord::Migration[8.0]
  def change
    create_table :dnd5_characters, id: :uuid, comment: 'Персонажи для D&D 5' do |t|
      t.string :name, null: false
      t.integer :level, limit: 1, null: false, default: 1, comment: 'Уровень персонажа'
      t.integer :race, limit: 1, null: false, comment: 'Основная раса'
      t.integer :subrace, limit: 2, comment: 'Подраса'
      t.integer :alignment, limit: 1, null: false, comment: 'Мировоззрение'
      t.jsonb :classes, null: false, default: {}, comment: 'Список классов и уровней/подклассов персонажа'
      t.jsonb :subclasses, null: false, default: {}, comment: 'Список подклассов персонажа'
      t.jsonb :abilities, null: false, default: {}, comment: 'Основные характеристики'
      t.timestamps
    end
  end
end
