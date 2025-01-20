class CreateDnd5Items < ActiveRecord::Migration[8.0]
  def change
    create_table :dnd5_items, id: :uuid, comment: 'Предметы для D&D 5' do |t|
      t.string :kind, null: false, comment: 'Тип предмета'
      t.jsonb :name, null: false, default: {}
      t.integer :weight, comment: 'Вес в фунтах'
      t.integer :price, comment: 'Цена в медных монетах'
      t.jsonb :data, null: false, default: {}, comment: 'Свойства предмета'
      t.timestamps
    end
  end
end
