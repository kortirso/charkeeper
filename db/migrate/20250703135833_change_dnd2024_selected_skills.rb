class ChangeDnd2024SelectedSkills < ActiveRecord::Migration[8.0]
  def change
    Dnd2024::Character.find_each do |character|
      character.data.selected_skills = character.data.selected_skills.index_with { 1 }
      character.save!
    end
  end
end
