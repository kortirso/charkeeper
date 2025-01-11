class CreateRules < ActiveRecord::Migration[8.0]
  def change
    create_table :rules, id: :uuid, comment: 'Rules for role systems' do |t|
      t.string :name, null: false, comment: 'Name of rules, D&D 5 / D&D 5.5 / Pathfinder'
      t.timestamps
    end
  end
end
