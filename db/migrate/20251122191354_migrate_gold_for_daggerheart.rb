class MigrateGoldForDaggerheart < ActiveRecord::Migration[8.1]
  def change
    Daggerheart::Character.find_each do |character|
      gold = character.data.gold
      character.data.money = (gold['chests'] * 1_000) + (gold['bags'] * 100) + (gold['handfuls'] * 10) + gold['coins']
      character.save
    end
  end
end
