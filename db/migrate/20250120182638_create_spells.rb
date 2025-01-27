class CreateSpells < ActiveRecord::Migration[8.0]
  def change
    create_table :spells, id: :uuid, comment: 'Заклинания' do |t|
      t.string :type, null: false
      t.jsonb :name, null: false, default: {}
      t.jsonb :data, null: false, default: {}, comment: 'Свойства заклинания'
      t.timestamps
    end
  end
end
