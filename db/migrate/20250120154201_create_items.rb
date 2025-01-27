class CreateItems < ActiveRecord::Migration[8.0]
  def change
    create_table :items, id: :uuid, comment: 'Предметы' do |t|
      t.string :type, null: false
      t.string :kind, null: false, comment: 'Тип предмета'
      t.jsonb :name, null: false, default: {}
      t.jsonb :data, null: false, default: {}, comment: 'Свойства предмета'
      t.timestamps
    end
  end
end
