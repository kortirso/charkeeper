class CreateSpells < ActiveRecord::Migration[8.0]
  def change
    create_table :spells, id: :uuid do |t|
      t.uuid :rule_id, null: false
      t.string :slug, null: false
      t.jsonb :name, null: false, default: {}
      t.integer :level
      t.boolean :attacking, null: false, default: false, comment: 'Наносит урон'
      t.jsonb :comment, null: false, default: {}, comment: 'Комментарий'
      t.timestamps
    end
  end
end
