class AddProgressToDaggerheartProjects < ActiveRecord::Migration[8.1]
  def change
    add_column :daggerheart_projects, :progress, :integer, null: false, default: 0
  end
end
