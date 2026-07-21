class RemoveDc20Bonuses < ActiveRecord::Migration[8.1]
  def up
    Character::Bonus.where(bonusable_type: 'Character', bonusable_id: Dc20::Character.select(:id)).destroy_all
  end

  def down; end
end
