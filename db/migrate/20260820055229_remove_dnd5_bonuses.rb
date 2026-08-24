class RemoveDnd5Bonuses < ActiveRecord::Migration[8.1]
  def up
    Character::Bonus.where(bonusable_id: Character.dnd5.select(:id)).destroy_all
  end

  def down; end
end
