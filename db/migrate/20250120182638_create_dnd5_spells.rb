class CreateDnd5Spells < ActiveRecord::Migration[8.0]
  def change
    create_table :dnd5_spells, id: :uuid, comment: 'Заклинания D&D 5' do |t|
      t.string :slug, null: false
      t.jsonb :name, null: false, default: {}
      t.integer :level, limit: 1, null: false, default: 0
      t.boolean :attacking, null: false, default: false
      t.jsonb :comment, null: false, default: {}
      t.timestamps
    end
  end
end
