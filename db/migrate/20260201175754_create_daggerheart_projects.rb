class CreateDaggerheartProjects < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    create_table :daggerheart_projects, id: :uuid do |t|
      t.uuid :character_id, null: false
      t.uuid :goal_id
      t.string :goal_type
      t.integer :complexity, null: false, default: 1
      t.string :title, null: false
      t.string :description
      t.timestamps
    end

    add_index :daggerheart_projects, :character_id, algorithm: :concurrently
    add_index :daggerheart_projects, [:goal_id, :goal_type], where: 'goal_id IS NOT NULL AND goal_type IS NOT NULL', algorithm: :concurrently
  end
end
