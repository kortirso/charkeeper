class CreateItems < ActiveRecord::Migration[8.0]
  def change
    create_table :items, id: :uuid do |t|
      t.uuid :rule_id, null: false
      t.string :kind, null: false
      t.decimal :weight, precision: 7, scale: 2, null: false, default: 0.0
      t.integer :price
      t.jsonb :name, null: false, default: {}
      t.jsonb :data, null: false, default: {}
      t.timestamps
    end
    add_index :items, :rule_id
  end
end
