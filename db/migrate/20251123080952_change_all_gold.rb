class ChangeAllGold < ActiveRecord::Migration[8.1]
  def up
    # Dnd5::Character.find_each do |character|
    #   coins = character.data.coins.with_indifferent_access
    #   character.data.money = (coins['gold'] * 100) + (coins['silver'] * 10) + coins['copper']
    #   character.save
    # end

    # Dnd2024::Character.find_each do |character|
    #   coins = character.data.coins.with_indifferent_access
    #   character.data.money = (coins['gold'] * 100) + (coins['silver'] * 10) + coins['copper']
    #   character.save
    # end

    # Pathfinder2::Character.find_each do |character|
    #   coins = character.data.coins.with_indifferent_access
    #   character.data.money = (coins['gold'] * 100) + (coins['silver'] * 10) + coins['copper']
    #   character.save
    # end
  end

  def down; end
end
